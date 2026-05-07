import { useState } from "react";
import { Plus, Pencil, Trash2, CreditCard, Banknote, Smartphone, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

const methods = [
  { name: "PIX", desc: "Transferência instantânea", Icon: QrCode, active: true },
  { name: "Cartão de Crédito", desc: "Visa, Mastercard, Elo", Icon: CreditCard, active: true },
  { name: "Cartão de Débito", desc: "Débito automático", Icon: CreditCard, active: true },
  { name: "Dinheiro", desc: "Pagamento na entrega", Icon: Banknote, active: false },
  { name: "Carteira Digital", desc: "Apple Pay, Google Pay", Icon: Smartphone, active: true },
];

const MetodosPagamento = () => {
  const [open, setOpen] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Método salvo (mock).");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Métodos de Pagamento"
        description="Configure as formas de pagamento aceitas no aplicativo."
        action={
          <Button variant="hero" size="lg" onClick={() => setOpen(true)}>
            <Plus className="h-5 w-5" /> Novo Método
          </Button>
        }
      />

      <div className="grid gap-3">
        {methods.map((m) => (
          <article key={m.name} className="rounded-2xl bg-card border border-border shadow-card p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent text-primary flex items-center justify-center shrink-0">
              <m.Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{m.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{m.desc}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">{m.active ? "Ativo" : "Inativo"}</span>
                <Switch defaultChecked={m.active} onCheckedChange={() => toast.message("Status alterado (mock)")} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Editar"><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => toast.message("Excluir (mock)")} aria-label="Excluir"><Trash2 className="h-4 w-4 text-brand-red" /></Button>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Novo Método de Pagamento</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div><Label>Nome</Label><Input placeholder="Ex: PIX" className="mt-1.5" required /></div>
            <div><Label>Descrição</Label><Input placeholder="Breve descrição" className="mt-1.5" /></div>
            <div>
              <Label>Tipo</Label>
              <Select><SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instant">Instantâneo</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="wallet">Carteira Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div><p className="font-medium text-sm">Ativo</p><p className="text-xs text-muted-foreground">Disponível para os clientes</p></div>
              <Switch defaultChecked />
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="hero">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MetodosPagamento;
