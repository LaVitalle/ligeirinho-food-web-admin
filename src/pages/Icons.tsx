import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Upload, Loader2, Image as ImageIcon, Search, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";
import { iconService, Icon } from "@/lib/icons";
import { ApiError } from "@/lib/api";

const Icons = () => {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingIcon, setEditingIcon] = useState<Icon | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  // Form states
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Query icons list
  const { data: iconsRes, isLoading } = useQuery({
    queryKey: ["icons", search, tagFilter],
    queryFn: () => iconService.getAll(search || undefined, tagFilter || undefined),
  });

  // Reset form when editingIcon changes
  useEffect(() => {
    if (editingIcon) {
      setKey(editingIcon.key);
      setName(editingIcon.name);
      setTag(editingIcon.tag || "");
      setFile(null);
      setFilePreview(editingIcon.url);
    } else {
      resetForm();
    }
  }, [editingIcon]);

  const resetForm = () => {
    setKey("");
    setName("");
    setTag("");
    setFile(null);
    setFilePreview(null);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingIcon(null);
    resetForm();
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["icons"] });
    // Invalidate categories too since they display icons
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const handleApiError = (error: any, defaultMsg: string) => {
    if (error instanceof ApiError) {
      toast.error(error.message);
    } else {
      toast.error(defaultMsg);
    }
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: iconService.create,
    onSuccess: () => {
      toast.success("Ícone criado com sucesso!");
      handleClose();
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao criar ícone."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => iconService.update(id, data),
    onSuccess: () => {
      toast.success("Ícone atualizado!");
      handleClose();
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao atualizar ícone."),
  });

  const deleteMutation = useMutation({
    mutationFn: iconService.delete,
    onSuccess: () => {
      toast.success("Ícone removido com sucesso!");
      setDeleteId(null);
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao remover ícone. Verifique se ele está sendo usado em alguma categoria."),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingIcon) {
      updateMutation.mutate({
        id: editingIcon.id,
        data: {
          name,
          tag: tag || undefined,
          file: file || undefined,
        },
      });
    } else {
      if (!file) {
        toast.error("Por favor, selecione um arquivo de imagem (SVG/PNG/JPG).");
        return;
      }
      createMutation.mutate({
        key,
        name,
        tag: tag || undefined,
        file,
      });
    }
  };

  const icons = iconsRes?.data || [];
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Biblioteca de Ícones"
        description="Gerencie os ícones usados nas categorias de produtos do sistema."
        action={
          <Button variant="hero" size="lg" onClick={() => { setEditingIcon(null); setOpen(true); }}>
            <Plus className="h-5 w-5" /> Novo Ícone
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card border border-border rounded-2xl p-4 shadow-card">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="sm:w-64 relative">
          <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrar por tag..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {icons.map((icon) => (
            <article key={icon.id} className="group rounded-2xl bg-card border border-border shadow-card p-5 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-accent text-primary flex items-center justify-center mb-3 p-2 border border-border/50">
                {icon.url ? (
                  <img src={icon.url} alt={icon.name} className="h-10 w-10 object-contain" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <p className="font-semibold text-sm text-foreground truncate w-full">{icon.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono tracking-tighter truncate w-full mt-0.5">key: {icon.key}</p>
              {icon.tag && (
                <span className="mt-1.5 px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground border border-border/30">
                  {icon.tag}
                </span>
              )}
              <div className="mt-3 pt-3 border-t border-border w-full flex items-center justify-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => { setEditingIcon(icon); setOpen(true); }} 
                  aria-label="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setDeleteId(icon.id)} 
                  aria-label="Excluir"
                >
                  <Trash2 className="h-4 w-4 text-brand-red" />
                </Button>
              </div>
            </article>
          ))}
          {icons.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Nenhum ícone encontrado.
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md text-foreground">
          <DialogHeader>
            <DialogTitle>{editingIcon ? "Editar Ícone" : "Novo Ícone"}</DialogTitle>
            <DialogDescription>
              {editingIcon ? "Atualize as informações do ícone." : "Cadastre um novo ícone enviando um arquivo SVG ou imagem."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-2">
              <Label htmlFor="icon-file" className="cursor-pointer">
                <div className="h-28 w-28 rounded-2xl border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted relative overflow-hidden p-2">
                  {filePreview ? (
                    <img src={filePreview} alt="Preview" className="h-full w-full object-contain" />
                  ) : (
                    <>
                      <Upload className="h-6 w-6" />
                      <span className="text-[10px] mt-1 text-center font-medium">SVG, PNG, JPG</span>
                    </>
                  )}
                </div>
              </Label>
              <input
                id="icon-file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <span className="text-[10px] text-muted-foreground">Clique no quadrado acima para escolher o arquivo</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon-key">Key do Ícone</Label>
                <Input 
                  id="icon-key"
                  placeholder="Ex: snack" 
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="mt-1.5" 
                  required 
                  disabled={!!editingIcon || isPending}
                />
                <p className="text-[9px] text-muted-foreground mt-1">Identificador único (imutável)</p>
              </div>
              <div>
                <Label htmlFor="icon-name">Nome amigável</Label>
                <Input 
                  id="icon-name"
                  placeholder="Ex: Salgados" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5" 
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="icon-tag">Tag / Agrupamento</Label>
              <Input 
                id="icon-tag"
                placeholder="Ex: food, drink, utility" 
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="mt-1.5"
                disabled={isPending}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Cancelar</Button>
              <Button type="submit" variant="hero" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja remover este ícone?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá permanentemente o ícone. O ícone só poderá ser excluído se não estiver vinculado a nenhuma categoria de produtos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Icons;
