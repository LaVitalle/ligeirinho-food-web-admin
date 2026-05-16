import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Store, 
  CheckCircle2, 
  Ban, 
  Plus, 
  Settings, 
  MapPin, 
  Camera, 
  Mail, 
  Clock, 
  Loader2, 
  Trash2, 
  Eye, 
  Building2,
  Lock,
  User,
  ExternalLink
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { canteenService, Canteen } from "@/lib/canteens";
import { institutionService } from "@/lib/institutions";
import { ApiError } from "@/lib/api";

const Cantinas = () => {
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingCanteen, setEditingCanteen] = useState<Canteen | null>(null);
  const [viewingCanteen, setViewingCanteen] = useState<Canteen | null>(null);
  
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [block, setBlock] = useState("");
  const [room, setRoom] = useState("");
  const [schedule, setSchedule] = useState("");
  // Seller fields (only for creation)
  const [sellerName, setSellerName] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [sellerPassword, setSellerPassword] = useState("");

  // Queries
  const { data: canteensRes, isLoading: loadingCanteens } = useQuery({
    queryKey: ["canteens"],
    queryFn: () => canteenService.getAll(),
  });

  const { data: countRes } = useQuery({
    queryKey: ["canteens-count"],
    queryFn: () => canteenService.getCount(),
  });

  const { data: instRes } = useQuery({
    queryKey: ["institutions-all"],
    queryFn: () => institutionService.getAll(1, 100),
  });

  const institutions = instRes?.data || [];

  // Reset form when editingCanteen changes
  useEffect(() => {
    if (editingCanteen) {
      setName(editingCanteen.name);
      setInstitutionId(editingCanteen.institutionId);
      setCnpj(editingCanteen.cnpj || "");
      setBlock(editingCanteen.block || "");
      setRoom(editingCanteen.room || "");
      setSchedule(""); // Schedule field placeholder
      // Seller fields are not editable here
    } else {
      resetForm();
    }
  }, [editingCanteen]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: canteenService.create,
    onSuccess: () => {
      toast.success("Cantina e vendedor cadastrados!");
      handleClose();
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao cadastrar cantina."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => canteenService.update(id, data),
    onSuccess: () => {
      toast.success("Cantina atualizada!");
      handleClose();
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao atualizar cantina."),
  });

  const deleteMutation = useMutation({
    mutationFn: canteenService.delete,
    onSuccess: () => {
      toast.success("Cantina removida!");
      setDeleteId(null);
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao remover cantina."),
  });

  const toggleMutation = useMutation({
    mutationFn: canteenService.toggleOpen,
    onSuccess: () => {
      toast.success("Status alterado!");
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao alterar status."),
  });

  const uploadLogoMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => canteenService.uploadLogo(id, file),
    onSuccess: () => {
      toast.success("Logo atualizada!");
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao subir logo."),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["canteens"] });
    queryClient.invalidateQueries({ queryKey: ["canteens-count"] });
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
    setEditingCanteen(null);
    resetForm();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId) {
      toast.error("Selecione uma instituição.");
      return;
    }

    if (editingCanteen) {
      updateMutation.mutate({ 
        id: editingCanteen.id, 
        data: { name, cnpj, block, room } 
      });
    } else {
      createMutation.mutate({
        name,
        institutionId,
        cnpj: cnpj || undefined,
        block: block || undefined,
        room: room || undefined,
        sellerName,
        sellerEmail,
        sellerPassword
      });
    }
  };

  const resetForm = () => {
    setName("");
    setInstitutionId("");
    setCnpj("");
    setBlock("");
    setRoom("");
    setSchedule("");
    setSellerName("");
    setSellerEmail("");
    setSellerPassword("");
  };

  const handleLogoUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLogoMutation.mutate({ id, file });
    }
  };

  const canteens = canteensRes?.data || [];
  const totalCount = countRes?.data.total || 0;
  const activeCount = canteens.filter(c => c.isOpen).length;
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Cantinas"
        description="Gerencie e monitore todas as unidades de alimentação cadastradas."
        action={
          <Button variant="red" size="lg" onClick={() => { setEditingCanteen(null); setOpen(true); }}>
            <Plus className="h-5 w-5" /> Cadastrar Nova Cantina
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Ativas (Não Removidas)" value={`${totalCount} Unidades`} icon={Store} accent="orange" />
        <StatCard label="Abertas" value={`${activeCount} Operando`} icon={CheckCircle2} accent="green" />
        <StatCard label="Fechadas" value={`${totalCount - activeCount} Unidades`} icon={Ban} accent="neutral" />
      </div>

      {loadingCanteens ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {canteens.map((c) => (
            <article key={c.id} className="rounded-2xl bg-card border border-border shadow-card overflow-hidden flex flex-col group">
              <div
                className="h-32 relative bg-muted flex items-center justify-center overflow-hidden"
              >
                {c.logoUrl ? (
                  <img src={c.logoUrl} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-warm flex items-center justify-center text-white">
                    <Store className="h-12 w-12" />
                  </div>
                )}
                <span className="absolute bottom-3 left-3">
                  <StatusBadge variant={c.isOpen ? "success" : "neutral"}>
                    {c.isOpen ? "OPERANDO" : "FECHADA"}
                  </StatusBadge>
                </span>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/20"
                    onClick={() => { setViewingCanteen(c); setViewOpen(true); }}
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                  <label className="h-9 w-9 inline-flex items-center justify-center rounded-md text-white hover:bg-white/20 cursor-pointer">
                    <Camera className="h-5 w-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleLogoUpload(c.id, e)} />
                  </label>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-foreground line-clamp-1">{c.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {c.block || "Térreo"}, {c.room || "Salão"}
                </p>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <button 
                    className="text-sm font-semibold text-primary hover:underline"
                    onClick={() => { setViewingCanteen(c); setViewOpen(true); }}
                  >
                    Ver Detalhes
                  </button>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={c.isOpen ? "text-green-500" : "text-muted-foreground"}
                      onClick={() => toggleMutation.mutate(c.id)}
                      disabled={toggleMutation.isPending}
                      title="Alternar Aberta/Fechada"
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => { setEditingCanteen(c); setOpen(true); }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}

          <button
            onClick={() => { setEditingCanteen(null); setOpen(true); }}
            className="rounded-2xl border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center min-h-[260px] text-muted-foreground hover:border-primary hover:text-primary hover:bg-accent transition"
          >
            <div className="h-12 w-12 rounded-full bg-card border border-border flex items-center justify-center mb-2">
              <Plus className="h-5 w-5" />
            </div>
            <span className="font-semibold">Adicionar Unidade</span>
          </button>
        </div>
      )}

      {/* Cadastro / Edição Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl text-foreground">
          <DialogHeader>
            <DialogTitle>{editingCanteen ? "Editar Cantina" : "Cadastrar Nova Cantina"}</DialogTitle>
            <DialogDescription>
              {editingCanteen 
                ? "Atualize as informações da unidade de alimentação." 
                : "Cadastre uma nova cantina e seu respectivo vendedor administrador."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Cantina</Label>
                  <Input 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Cantina Central" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instituição</Label>
                  <Select value={institutionId} onValueChange={setInstitutionId} disabled={!!editingCanteen}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a instituição" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map(inst => (
                        <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CNPJ (Opcional)</Label>
                  <Input 
                    value={cnpj}
                    onChange={e => setCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bloco</Label>
                  <Input 
                    value={block}
                    onChange={e => setBlock(e.target.value)}
                    placeholder="Ex: Bloco A" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sala/Local</Label>
                  <Input 
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    placeholder="Ex: Térreo" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Horário de Funcionamento (Informativo)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={schedule}
                    onChange={e => setSchedule(e.target.value)}
                    placeholder="Ex: Seg a Sex, 08:00 - 22:00" 
                    className="pl-9" 
                  />
                </div>
              </div>
            </div>

            {!editingCanteen && (
              <div className="space-y-4 border-t pt-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Dados do Vendedor (Administrador)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input 
                      value={sellerName}
                      onChange={e => setSellerName(e.target.value)}
                      placeholder="Nome do responsável" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail de Login</Label>
                    <Input 
                      type="email"
                      value={sellerEmail}
                      onChange={e => setSellerEmail(e.target.value)}
                      placeholder="vendedor@email.com" 
                      required 
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Senha Temporária</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="password"
                        value={sellerPassword}
                        onChange={e => setSellerPassword(e.target.value)}
                        className="pl-9"
                        placeholder="Mínimo 6 caracteres" 
                        required 
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-2 border-t pt-6">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Cancelar</Button>
              <Button type="submit" variant="hero" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingCanteen ? "Salvar Alterações" : "Criar Cantina"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Visualização Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md text-foreground">
          <DialogHeader>
            <DialogTitle>Detalhes da Cantina</DialogTitle>
            <DialogDescription>Informações operacionais e administrativas.</DialogDescription>
          </DialogHeader>
          
          {viewingCanteen && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center">
                <div className="h-32 w-32 rounded-3xl bg-muted flex items-center justify-center shadow-elevated overflow-hidden border-4 border-background">
                  {viewingCanteen.logoUrl ? (
                    <img src={viewingCanteen.logoUrl} alt={viewingCanteen.name} className="h-full w-full object-cover" />
                  ) : (
                    <Store className="h-14 w-14 text-muted-foreground" />
                  )}
                </div>
                <h2 className="text-xl font-bold mt-4 text-center">{viewingCanteen.name}</h2>
                <StatusBadge variant={viewingCanteen.isOpen ? "success" : "neutral"} className="mt-1">
                  {viewingCanteen.isOpen ? "Operando agora" : "Fechada"}
                </StatusBadge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Localização
                  </span>
                  <p className="text-sm font-semibold">{viewingCanteen.block || "---"}, {viewingCanteen.room || "---"}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Instituição
                  </span>
                  <p className="text-sm font-semibold line-clamp-1">
                    {institutions.find(i => i.id === viewingCanteen.institutionId)?.name || "Unidade Parceira"}
                  </p>
                </div>
                <div className="bg-muted/50 p-4 rounded-2xl space-y-1 col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" /> CNPJ
                  </span>
                  <p className="text-sm font-semibold">{viewingCanteen.cnpj || "Não informado"}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)} className="w-full">Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja remover esta cantina?</AlertDialogTitle>
            <AlertDialogDescription>
              A cantina e o vendedor administrador vinculado serão inativados (Soft Delete) no sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar Remoção
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cantinas;
