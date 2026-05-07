import { useState } from "react";
import { Building2, CheckCircle2, XCircle, Plus, Settings, MapPin, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

const items = [
  { name: "Faculdade Donaduzzi", city: "Toledo, PR", active: true },
  { name: "Biopark Corporate", city: "Toledo, PR", active: true },
  { name: "Unioeste Campus", city: "Cascavel, PR", active: false },
  { name: "PUC Unidade 4", city: "Curitiba, PR", active: true },
];

const Instituicoes = () => {
  const [open, setOpen] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Cadastro registrado (mock). Conecte ao backend para persistir.");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Instituições"
        description="Gerencie os parceiros e unidades cadastradas no sistema."
        action={
          <Button variant="hero" size="lg" onClick={() => setOpen(true)}>
            <Plus className="h-5 w-5" /> Cadastrar Nova Instituição
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total de Instituições" value={42} icon={Building2} accent="neutral" />
        <StatCard label="Instituições Ativas" value={38} icon={CheckCircle2} accent="green" />
        <StatCard label="Instituições Inativas" value={4} icon={XCircle} accent="red" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <article key={it.name} className="rounded-2xl bg-card border border-border shadow-card p-5 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-2xl bg-gradient-warm flex items-center justify-center text-primary-foreground mb-3">
              <Building2 className="h-9 w-9" />
            </div>
            <StatusBadge variant={it.active ? "success" : "neutral"}>{it.active ? "Ativa" : "Inativa"}</StatusBadge>
            <h3 className="mt-3 font-bold text-foreground">{it.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {it.city}
            </p>
            <div className="mt-4 w-full pt-4 border-t border-border flex items-center gap-2">
              <Button variant={it.active ? "outline-orange" : "secondary"} size="sm" className="flex-1">Ver Detalhes</Button>
              <Button variant="ghost" size="icon" aria-label="Configurar"><Settings className="h-4 w-4" /></Button>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Cadastrar Nova Instituição</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground bg-muted/40 cursor-pointer hover:bg-muted transition">
                <Upload className="h-5 w-5" />
                <span className="text-xs mt-1">Upload Foto</span>
              </div>
              <p className="text-xs italic text-muted-foreground mt-2">Tamanho recomendado: 512x512px</p>
            </div>
            <div>
              <Label>Nome da Instituição</Label>
              <Input placeholder="Ex: Faculdade Donaduzzi" required className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Estado</Label>
                <Select><SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent><SelectItem value="pr">PR</SelectItem><SelectItem value="sp">SP</SelectItem><SelectItem value="rj">RJ</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cidade</Label>
                <Select><SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent><SelectItem value="t">Toledo</SelectItem><SelectItem value="c">Cascavel</SelectItem><SelectItem value="cu">Curitiba</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="hero">Cadastrar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Instituicoes;
