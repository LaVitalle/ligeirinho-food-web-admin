import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Store, CheckCircle2, Ban, Plus, Settings, MapPin, Camera, Image as ImageIcon, Mail, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { institutionService } from "@/lib/institutions";

const cantinas = [
  { name: "Cantina Central", local: "Bloco A - Térreo", hue: 22 },
  { name: "Sabor e Arte", local: "Bloco C - 2º Andar", hue: 140 },
  { name: "Lanche Rápido", local: "Bloco B - 1º Andar", hue: 200 },
  { name: "Cantina do Lago", local: "Bloco D - Térreo", hue: 100 },
  { name: "Point do Café", local: "Bloco E - 3º Andar", hue: 30 },
  { name: "Express Food", local: "Bloco A - 1º Andar", hue: 0 },
];

const Cantinas = () => {
  const [open, setOpen] = useState(false);

  const { data: instRes, isLoading: loadingInst } = useQuery({
    queryKey: ["institutions-all"],
    queryFn: () => institutionService.getAll(1, 100),
  });

  const institutions = instRes?.data || [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Cantina cadastrada (mock).");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Cantinas"
        description="Gerencie e monitore todas as unidades de alimentação cadastradas."
        action={
          <Button variant="red" size="lg" onClick={() => setOpen(true)}>
            <Plus className="h-5 w-5" /> Cadastrar Nova Cantina
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total" value="12 Cantinas" icon={Store} accent="orange" />
        <StatCard label="Ativas" value="10 Operando" icon={CheckCircle2} accent="green" />
        <StatCard label="Inativas" value="02 Fechadas" icon={Ban} accent="neutral" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cantinas.map((c) => (
          <article key={c.name} className="rounded-2xl bg-card border border-border shadow-card overflow-hidden flex flex-col">
            <div
              className="h-32 relative"
              style={{ background: `linear-gradient(135deg, hsl(${c.hue} 60% 55%), hsl(${c.hue} 70% 35%))` }}
            >
              <span className="absolute bottom-3 left-3">
                <StatusBadge variant="success">OPERANDO</StatusBadge>
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-foreground">{c.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {c.local}
              </p>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <button className="text-sm font-semibold text-primary hover:underline">Ver Detalhes</button>
                <Button variant="ghost" size="icon" aria-label="Configurar"><Settings className="h-4 w-4" /></Button>
              </div>
            </div>
          </article>
        ))}

        <button
          onClick={() => setOpen(true)}
          className="rounded-2xl border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center min-h-[260px] text-muted-foreground hover:border-primary hover:text-primary hover:bg-accent transition"
        >
          <div className="h-12 w-12 rounded-full bg-card border border-border flex items-center justify-center mb-2">
            <Plus className="h-5 w-5" />
          </div>
          <span className="font-semibold">Adicionar Unidade</span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Cadastrar Nova Cantina</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Foto de Perfil</Label>
                <div className="mt-1.5 h-24 rounded-xl border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted">
                  <Camera className="h-5 w-5" /><span className="text-xs mt-1">Upload</span>
                </div>
              </div>
              <div className="col-span-2">
                <Label>Foto de Capa</Label>
                <div className="mt-1.5 h-24 rounded-xl border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted">
                  <ImageIcon className="h-5 w-5" /><span className="text-xs mt-1">Upload Capa (1200x400)</span>
                </div>
              </div>
            </div>
            <div>
              <Label>Nome da Cantina</Label>
              <Input placeholder="Ex: Cantina do Bloco B" className="mt-1.5" required />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea placeholder="Conte um pouco sobre a cantina e seus produtos…" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Horário de Funcionamento</Label>
                <div className="relative mt-1.5">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Ex: 08:00 - 22:00" className="pl-9" />
                </div>
              </div>
              <div>
                <Label>E-mail de Contato</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="email" placeholder="cantina@instituicao.com" className="pl-9" />
                </div>
              </div>
              <div>
                <Label>Instituição</Label>
                <Select disabled={loadingInst}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={loadingInst ? "Carregando..." : "Selecione a instituição"} />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map(inst => (
                      <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Localização (Bloco/Andar)</Label>
                <div className="relative mt-1.5">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Ex: Bloco G, 2º Andar" className="pl-9" />
                </div>
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

export default Cantinas;
