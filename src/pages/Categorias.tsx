import { useState } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

const mock = [
  { name: "Lanches", desc: "Hambúrgueres, hot dogs e similares", count: 24 },
  { name: "Bebidas", desc: "Sucos, refrigerantes e cafés", count: 18 },
  { name: "Sobremesas", desc: "Doces, bolos e tortas", count: 12 },
  { name: "Saudáveis", desc: "Saladas, wraps e opções fit", count: 9 },
  { name: "Pratos do Dia", desc: "Refeições completas", count: 6 },
];

const Categorias = () => {
  const [open, setOpen] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Categoria salva (mock).");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias"
        description="Organize os produtos por categorias visíveis no app."
        action={
          <Button variant="hero" size="lg" onClick={() => setOpen(true)}>
            <Plus className="h-5 w-5" /> Nova Categoria
          </Button>
        }
      />

      <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 px-5 py-3 bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="col-span-4">Nome</div>
          <div className="col-span-5">Descrição</div>
          <div className="col-span-1 text-center">Itens</div>
          <div className="col-span-2 text-right">Ações</div>
        </div>
        <ul className="divide-y divide-border">
          {mock.map((c) => (
            <li key={c.name} className="px-5 py-4 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
              <div className="sm:col-span-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent text-primary flex items-center justify-center"><Tag className="h-5 w-5" /></div>
                <span className="font-semibold">{c.name}</span>
              </div>
              <p className="sm:col-span-5 text-sm text-muted-foreground">{c.desc}</p>
              <div className="sm:col-span-1 text-sm sm:text-center font-semibold text-foreground">{c.count}</div>
              <div className="sm:col-span-2 flex sm:justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Editar"><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => toast.message("Excluir (mock)")} aria-label="Excluir"><Trash2 className="h-4 w-4 text-brand-red" /></Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nova Categoria</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div><Label>Nome</Label><Input placeholder="Ex: Lanches" className="mt-1.5" required /></div>
            <div><Label>Descrição</Label><Textarea placeholder="Breve descrição da categoria" className="mt-1.5" /></div>
            <div><Label>Ícone associado</Label><Input placeholder="Ex: hamburger" className="mt-1.5" /></div>
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

export default Categorias;
