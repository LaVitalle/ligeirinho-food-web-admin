import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Tag, Loader2, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
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
import { categoryService, Category } from "@/lib/categories";
import { ApiError } from "@/lib/api";

const Categorias = () => {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const queryClient = useQueryClient();

  // Form states
  const [name, setName] = useState("");
  const [iconKey, setIconKey] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  // Queries
  const { data: categoriesRes, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
  });

  // Reset form when editingCategory changes
  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setIconKey(editingCategory.iconKey || "");
      setDisplayOrder(String(editingCategory.displayOrder));
    } else {
      resetForm();
    }
  }, [editingCategory]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      toast.success("Categoria criada com sucesso!");
      handleClose();
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao criar categoria."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => categoryService.update(id, data),
    onSuccess: () => {
      toast.success("Categoria atualizada!");
      handleClose();
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao atualizar categoria."),
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      toast.success("Categoria removida!");
      setDeleteId(null);
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao remover categoria."),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const handleApiError = (error: any, defaultMsg: string) => {
    if (error instanceof ApiError) {
      toast.error(error.message);
    } else {
      toast.error(defaultMsg);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory(null);
    resetForm();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name,
      iconKey: iconKey || undefined,
      displayOrder: parseInt(displayOrder) || 0,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const resetForm = () => {
    setName("");
    setIconKey("");
    setDisplayOrder("0");
  };

  const categories = categoriesRes?.data || [];
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        description="Organize os produtos por categorias visíveis no app."
        action={
          <Button variant="hero" size="lg" onClick={() => { setEditingCategory(null); setOpen(true); }}>
            <Plus className="h-5 w-5" /> Nova Categoria
          </Button>
        }
      />

      <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 px-5 py-3 bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
          <div className="col-span-5">Nome / Ícone</div>
          <div className="col-span-3 text-center">Ordem</div>
          <div className="col-span-4 text-right">Ações</div>
        </div>
        
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {categories.map((c) => (
              <li key={c.id} className="px-5 py-4 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center hover:bg-muted/30 transition-colors">
                <div className="sm:col-span-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent text-primary flex items-center justify-center">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Key: {c.iconKey || "default"}</p>
                  </div>
                </div>
                <div className="sm:col-span-3 text-sm sm:text-center font-medium text-muted-foreground flex items-center sm:justify-center gap-1">
                  <ListOrdered className="h-3 w-3" /> {c.displayOrder}
                </div>
                <div className="sm:col-span-4 flex sm:justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => { setEditingCategory(c); setOpen(true); }} 
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setDeleteId(c.id)} 
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4 text-brand-red" />
                  </Button>
                </div>
              </li>
            ))}
            {categories.length === 0 && (
              <li className="p-12 text-center text-muted-foreground">Nenhuma categoria cadastrada.</li>
            )}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md text-foreground">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Atualize os dados da categoria." : "Crie uma nova categoria global para os produtos."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="cat-name">Nome</Label>
              <Input 
                id="cat-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Salgados, Bebidas..." 
                className="mt-1.5" 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cat-icon">Key do Ícone</Label>
                <Input 
                  id="cat-icon"
                  value={iconKey}
                  onChange={e => setIconKey(e.target.value)}
                  placeholder="Ex: snack, pizza..." 
                  className="mt-1.5" 
                />
              </div>
              <div>
                <Label htmlFor="cat-order">Ordem de Exibição</Label>
                <Input 
                  id="cat-order"
                  type="number"
                  min="0"
                  value={displayOrder}
                  onChange={e => setDisplayOrder(e.target.value)}
                  className="mt-1.5" 
                />
              </div>
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A categoria só pode ser removida se não houver produtos vinculados a ela.
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

export default Categorias;
