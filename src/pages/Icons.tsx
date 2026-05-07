import { useState } from "react";
import { Plus, Pencil, Trash2, Coffee, Pizza, IceCream, Salad, Sandwich, CupSoda, Cake, Soup, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

const icons = [
  { name: "coffee", Icon: Coffee },
  { name: "pizza", Icon: Pizza },
  { name: "ice-cream", Icon: IceCream },
  { name: "salad", Icon: Salad },
  { name: "sandwich", Icon: Sandwich },
  { name: "soda", Icon: CupSoda },
  { name: "cake", Icon: Cake },
  { name: "soup", Icon: Soup },
];

const Icons = () => {
  const [open, setOpen] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Ícone salvo (mock).");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Biblioteca de Ícones"
        description="Gerencie os ícones usados em categorias e métodos de pagamento."
        action={
          <Button variant="hero" size="lg" onClick={() => setOpen(true)}>
            <Plus className="h-5 w-5" /> Novo Ícone
          </Button>
        }
      />

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {icons.map(({ name, Icon }) => (
          <article key={name} className="group rounded-2xl bg-card border border-border shadow-card p-5 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-accent text-primary flex items-center justify-center mb-3">
              <Icon className="h-8 w-8" />
            </div>
            <p className="font-semibold text-sm text-foreground">{name}</p>
            <div className="mt-3 pt-3 border-t border-border w-full flex items-center justify-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Editar"><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => toast.message("Excluir (mock)")} aria-label="Excluir"><Trash2 className="h-4 w-4 text-brand-red" /></Button>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Novo Ícone</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="flex justify-center">
              <div className="h-28 w-28 rounded-2xl border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted">
                <Upload className="h-6 w-6" /><span className="text-xs mt-1">Upload SVG/PNG</span>
              </div>
            </div>
            <div><Label>Nome do ícone</Label><Input placeholder="Ex: hamburger" className="mt-1.5" required /></div>
            <div><Label>Tag/Categoria</Label><Input placeholder="Ex: comida, bebida" className="mt-1.5" /></div>
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

export default Icons;
