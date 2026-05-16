import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Tag, Loader2, Package, Image as ImageIcon, Camera, Star, Search } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { productService, Product } from "@/lib/products";
import { categoryService } from "@/lib/categories";
import { canteenService } from "@/lib/canteens";
import { ApiError } from "@/lib/api";

const Produtos = () => {
  const [selectedCanteenId, setSelectedCanteenId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  // Queries
  const { data: canteensRes, isLoading: loadingCanteens } = useQuery({
    queryKey: ["canteens-all"],
    queryFn: () => canteenService.getAll(1, 100),
  });
  
  const { data: categoriesRes } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
  });

  const { data: productsRes, isLoading: loadingProducts } = useQuery({
    queryKey: ["products", selectedCanteenId],
    queryFn: () => productService.getAll(selectedCanteenId, 1, 100, undefined, undefined, false),
    enabled: !!selectedCanteenId,
  });

  const canteens = canteensRes?.data || [];
  const categories = categoriesRes?.data || [];
  const products = productsRes?.data?.items || [];

  // Reset form when editingProduct changes
  const openForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setDescription(product.description || "");
      setPrice(product.price);
      setCategoryId(product.categoryId);
      setIsActive(product.isActive);
    } else {
      setEditingProduct(null);
      setName("");
      setDescription("");
      setPrice("");
      setCategoryId("");
      setIsActive(true);
    }
    setOpen(true);
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      toast.success("Produto cadastrado com sucesso!");
      setOpen(false);
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao cadastrar produto."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productService.update(id, data),
    onSuccess: () => {
      toast.success("Produto atualizado!");
      setOpen(false);
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao atualizar produto."),
  });

  const deleteMutation = useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      toast.success("Produto removido!");
      setDeleteId(null);
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao remover produto."),
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => productService.uploadPhoto(id, file),
    onSuccess: () => {
      toast.success("Foto atualizada!");
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao subir foto."),
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, feature }: { id: string, feature: boolean }) => 
      feature ? productService.feature(id) : productService.unfeature(id),
    onSuccess: () => {
      toast.success("Destaque alterado!");
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao alterar destaque."),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["products", selectedCanteenId] });
  };

  const handleApiError = (error: any, defaultMsg: string) => {
    if (error instanceof ApiError) {
      toast.error(error.message);
    } else {
      toast.error(defaultMsg);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCanteenId) {
      toast.error("Selecione uma cantina primeiro.");
      return;
    }
    if (!categoryId) {
      toast.error("Selecione uma categoria.");
      return;
    }

    const payload = {
      name,
      description: description || undefined,
      price: parseFloat(price).toFixed(2),
      categoryId,
    };

    if (editingProduct) {
      updateMutation.mutate({ 
        id: editingProduct.id, 
        data: { ...payload, isActive } 
      });
    } else {
      createMutation.mutate({
        ...payload,
        canteenId: selectedCanteenId,
      });
    }
  };

  const handlePhotoUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadPhotoMutation.mutate({ id, file });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Produtos"
        description="Gerencie o cardápio das cantinas (produtos, preços e fotos)."
        action={
          <Button 
            variant="hero" 
            size="lg" 
            onClick={() => openForm()}
            disabled={!selectedCanteenId}
          >
            <Plus className="h-5 w-5" /> Adicionar Produto
          </Button>
        }
      />

      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-1/3">
          <Label>Cantina Ativa</Label>
          <Select value={selectedCanteenId} onValueChange={setSelectedCanteenId} disabled={loadingCanteens}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder={loadingCanteens ? "Carregando..." : "Selecione uma cantina"} />
            </SelectTrigger>
            <SelectContent>
              {canteens.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedCanteenId && (
          <div className="w-full sm:w-2/3 flex items-center justify-end pt-5">
            <span className="text-sm text-muted-foreground mr-2">Total de produtos: {products.length}</span>
          </div>
        )}
      </div>

      {!selectedCanteenId ? (
        <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl border-dashed">
          Selecione uma cantina acima para visualizar ou adicionar produtos.
        </div>
      ) : loadingProducts ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <article key={p.id} className="rounded-2xl bg-card border border-border shadow-card overflow-hidden flex flex-col group relative">
              <div className="h-36 bg-muted relative flex items-center justify-center overflow-hidden">
                {p.photoUrl ? (
                  <img src={p.photoUrl} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-12 w-12 text-muted-foreground/50" />
                )}
                
                <div className="absolute top-2 left-2 flex gap-1">
                  <StatusBadge variant={p.isActive ? "success" : "neutral"} size="sm">
                    {p.isActive ? "Disponível" : "Indisponível"}
                  </StatusBadge>
                  {p.isFeatured && (
                    <StatusBadge variant="warning" size="sm">Destaque</StatusBadge>
                  )}
                </div>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="h-9 w-9 inline-flex items-center justify-center rounded-md text-white hover:bg-white/20 cursor-pointer">
                    <Camera className="h-5 w-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(p.id, e)} />
                  </label>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={p.isFeatured ? "text-brand-yellow hover:text-brand-yellow hover:bg-white/20" : "text-white hover:bg-white/20"}
                    onClick={() => featureMutation.mutate({ id: p.id, feature: !p.isFeatured })}
                    title={p.isFeatured ? "Remover Destaque" : "Marcar como Destaque"}
                  >
                    <Star className="h-5 w-5" fill={p.isFeatured ? "currentColor" : "none"} />
                  </Button>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-foreground line-clamp-1 flex-1 pr-2">{p.name}</h3>
                  <span className="font-bold text-primary whitespace-nowrap">R$ {parseFloat(p.price).toFixed(2).replace('.',',')}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[32px]">
                  {p.description || "Sem descrição"}
                </p>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold bg-accent text-primary px-2 py-1 rounded-md">
                    {categories.find(c => c.id === p.categoryId)?.name || "Sem categoria"}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openForm(p)} className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {products.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-card border border-border rounded-xl border-dashed">
              Nenhum produto encontrado para esta cantina.
            </div>
          )}
        </div>
      )}

      {/* Cadastro / Edição Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md text-foreground">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            <DialogDescription>
              Preencha os dados do produto para a cantina selecionada.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Nome do Produto</Label>
              <Input 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Hambúrguer Clássico" 
                required 
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preço (R$)</Label>
                <Input 
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0.00" 
                  required 
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ingredientes e detalhes do produto..." 
                className="mt-1.5 resize-none h-20"
              />
            </div>
            {editingProduct && (
              <div className="flex items-center justify-between rounded-lg border border-border p-3 mt-2">
                <div>
                  <p className="font-medium text-sm">Disponível para venda</p>
                  <p className="text-xs text-muted-foreground">Produto aparece no cardápio</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            )}
            <DialogFooter className="gap-2 sm:gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancelar</Button>
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
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              O produto será inativado (Soft Delete) no sistema.
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

export default Produtos;
