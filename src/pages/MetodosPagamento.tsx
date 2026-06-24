import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, CreditCard, Banknote, Smartphone, QrCode, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";
import { paymentMethodService, PaymentMethod, PaymentMethodType } from "@/lib/payment-methods";
import { ApiError } from "@/lib/api";

const typeIconMap = {
  PIX: QrCode,
  CREDIT_CARD: CreditCard,
  DEBIT_CARD: CreditCard,
  CASH: Banknote,
  DIGITAL_WALLET: Smartphone,
};

const typeLabelMap = {
  PIX: "PIX / Instantâneo",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  CASH: "Dinheiro",
  DIGITAL_WALLET: "Carteira Digital (Google/Apple Pay)",
};

const MetodosPagamento = () => {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  const queryClient = useQueryClient();

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<PaymentMethodType>("PIX");
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState("0");

  // Queries
  const { data: methodsRes, isLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => paymentMethodService.getAll(),
  });

  // Reset form when editingMethod changes
  useEffect(() => {
    if (editingMethod) {
      setName(editingMethod.name);
      setDescription(editingMethod.description || "");
      setType(editingMethod.type);
      setIsActive(editingMethod.isActive);
      setDisplayOrder(String(editingMethod.displayOrder));
    } else {
      resetForm();
    }
  }, [editingMethod]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setType("PIX");
    setIsActive(true);
    setDisplayOrder("0");
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMethod(null);
    resetForm();
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
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
    mutationFn: paymentMethodService.create,
    onSuccess: () => {
      toast.success("Método de pagamento criado com sucesso!");
      handleClose();
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao criar método de pagamento."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => paymentMethodService.update(id, data),
    onSuccess: () => {
      toast.success("Método de pagamento atualizado!");
      handleClose();
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao atualizar método de pagamento."),
  });

  const toggleMutation = useMutation({
    mutationFn: paymentMethodService.toggle,
    onSuccess: (res) => {
      toast.success(`Método de pagamento ${res.data.isActive ? "ativado" : "desativado"}!`);
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao alterar status do método de pagamento."),
  });

  const deleteMutation = useMutation({
    mutationFn: paymentMethodService.delete,
    onSuccess: () => {
      toast.success("Método de pagamento removido com sucesso!");
      setDeleteId(null);
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao remover método de pagamento. Ele pode estar em uso por algum pedido."),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      description: description || undefined,
      type,
      isActive,
      displayOrder: parseInt(displayOrder) || 0,
    };

    if (editingMethod) {
      updateMutation.mutate({ id: editingMethod.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const methods = methodsRes?.data || [];
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Métodos de Pagamento"
        description="Configure as formas de pagamento aceitas no aplicativo."
        action={
          <Button variant="hero" size="lg" onClick={() => { setEditingMethod(null); setOpen(true); }}>
            <Plus className="h-5 w-5" /> Novo Método
          </Button>
        }
      />

      {isLoading ? (
        <div className="p-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-3">
          {methods.map((m) => {
            const Icon = typeIconMap[m.type] || CreditCard;
            return (
              <article key={m.id} className="rounded-2xl bg-card border border-border shadow-card p-4 flex items-center gap-4 hover:bg-muted/10 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-accent text-primary flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{m.name}</h3>
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-mono">
                      {m.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{m.description || "Sem descrição"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase hidden sm:inline">
                      {m.isActive ? "Ativo" : "Inativo"}
                    </span>
                    <Switch 
                      checked={m.isActive} 
                      onCheckedChange={() => toggleMutation.mutate(m.id)} 
                      disabled={toggleMutation.isPending}
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => { setEditingMethod(m); setOpen(true); }} 
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setDeleteId(m.id)} 
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4 text-brand-red" />
                  </Button>
                </div>
              </article>
            );
          })}
          {methods.length === 0 && (
            <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-2xl">
              Nenhum método de pagamento cadastrado.
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md text-foreground">
          <DialogHeader>
            <DialogTitle>{editingMethod ? "Editar Método de Pagamento" : "Novo Método de Pagamento"}</DialogTitle>
            <DialogDescription>
              {editingMethod ? "Atualize as informações da forma de pagamento." : "Configure uma nova forma de pagamento para os pedidos."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="method-name">Nome</Label>
              <Input 
                id="method-name"
                placeholder="Ex: PIX, Cartão Visa..." 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5" 
                required 
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="method-desc">Descrição</Label>
              <Input 
                id="method-desc"
                placeholder="Ex: Pagamento instantâneo via QR Code" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5"
                disabled={isPending}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="method-type">Tipo</Label>
                <Select value={type} onValueChange={(val: PaymentMethodType) => setType(val)} disabled={isPending}>
                  <SelectTrigger id="method-type" className="mt-1.5">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabelMap).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="method-order">Ordem de Exibição</Label>
                <Input 
                  id="method-order"
                  type="number"
                  min="0"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="mt-1.5"
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="font-medium text-sm">Ativo</p>
                <p className="text-xs text-muted-foreground">Disponível para os clientes no aplicativo</p>
              </div>
              <Switch 
                checked={isActive} 
                onCheckedChange={setIsActive}
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
            <AlertDialogTitle>Deseja remover este método de pagamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá permanentemente o método de pagamento. Se houver pedidos que usaram esta forma de pagamento, a exclusão será bloqueada pelo banco de dados para segurança histórica.
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

export default MetodosPagamento;
