import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Settings, 
  MapPin, 
  Upload, 
  Loader2, 
  Trash2, 
  Eye,
  Calendar
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";
import { institutionService, Institution } from "@/lib/institutions";
import { locationService } from "@/lib/location";
import { ApiError } from "@/lib/api";

const Instituicoes = () => {
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [viewingInstitution, setViewingInstitution] = useState<Institution | null>(null);
  
  const queryClient = useQueryClient();
  
  // Form state
  const [name, setName] = useState("");
  const [stateId, setStateId] = useState<string>("");
  const [cityId, setCityId] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers for Selects
  const handleStateChange = (val: string) => {
    setStateId(val);
    setCityId("");
  };

  // Queries
  const { data: institutionsRes, isLoading: loadingInstitutions } = useQuery({
    queryKey: ["institutions"],
    queryFn: () => institutionService.getAll(),
  });

  const { data: countRes } = useQuery({
    queryKey: ["institutions-count"],
    queryFn: () => institutionService.getCount(),
  });

  const { data: statesRes } = useQuery({
    queryKey: ["states"],
    queryFn: () => locationService.getStates(),
  });

  const { data: citiesRes, isLoading: loadingCities } = useQuery({
    queryKey: ["cities", stateId],
    queryFn: () => locationService.getCitiesByState(Number(stateId)),
    enabled: !!stateId,
  });

  // Reset form when editingInstitution changes
  useEffect(() => {
    if (editingInstitution) {
      setName(editingInstitution.name);
      setStateId(String(editingInstitution.stateId));
      setCityId(String(editingInstitution.cityId));
      setPhotoPreview(editingInstitution.photoUrl);
      setPhoto(null);
    } else {
      resetForm();
    }
  }, [editingInstitution]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: institutionService.create,
    onSuccess: () => {
      toast.success("Instituição cadastrada com sucesso!");
      handleClose();
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao cadastrar instituição."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => institutionService.update(id, data),
    onSuccess: () => {
      toast.success("Instituição atualizada com sucesso!");
      handleClose();
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao atualizar instituição."),
  });

  const deleteMutation = useMutation({
    mutationFn: institutionService.delete,
    onSuccess: () => {
      toast.success("Instituição removida com sucesso!");
      setDeleteId(null);
      invalidate();
    },
    onError: (error) => handleApiError(error, "Erro ao remover instituição."),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["institutions"] });
    queryClient.invalidateQueries({ queryKey: ["institutions-count"] });
  };

  const handleApiError = (error: any, defaultMsg: string) => {
    if (error instanceof ApiError) {
      toast.error(error.message);
    } else {
      toast.error(defaultMsg);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingInstitution(null);
    resetForm();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stateId || !cityId) {
      toast.error("Selecione estado e cidade.");
      return;
    }

    const payload = {
      name,
      stateId: Number(stateId),
      cityId: Number(cityId),
      photo: photo || undefined,
    };

    if (editingInstitution) {
      updateMutation.mutate({ id: editingInstitution.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const resetForm = () => {
    setName("");
    setStateId("");
    setCityId("");
    setPhoto(null);
    setPhotoPreview(null);
  };

  const institutions = institutionsRes?.data || [];
  const totalCount = countRes?.data.total || 0;
  const states = statesRes?.data || [];
  const cities = citiesRes?.data || [];
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Extra stats for UI
  const recentInst = institutions.length > 0 ? institutions[0].name : "---";
  const lastUpdate = institutions.length > 0 
    ? new Date(institutions[0].createdAt).toLocaleDateString() 
    : "---";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Instituições"
        description="Gerencie os parceiros e unidades cadastradas no sistema."
        action={
          <Button variant="hero" size="lg" onClick={() => { setEditingInstitution(null); setOpen(true); }}>
            <Plus className="h-5 w-5" /> Cadastrar Nova Instituição
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total de Instituições" value={totalCount} icon={Building2} accent="neutral" />
        <StatCard label="Última Instituição" value={recentInst} icon={CheckCircle2} accent="green" isText />
        <StatCard label="Último Cadastro em" value={lastUpdate} icon={Calendar} accent="orange" isText />
      </div>

      {loadingInstitutions ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {institutions.map((it) => (
            <article key={it.id} className="rounded-2xl bg-card border border-border shadow-card p-5 flex flex-col items-center text-center group transition-all hover:shadow-elevated">
              <div className="h-20 w-20 rounded-2xl bg-gradient-warm flex items-center justify-center text-primary-foreground mb-3 overflow-hidden relative">
                {it.photoUrl ? (
                  <img src={it.photoUrl} alt={it.name} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-9 w-9" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/20"
                    onClick={() => { setViewingInstitution(it); setViewOpen(true); }}
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <StatusBadge variant="success">Ativa</StatusBadge>
              <h3 className="mt-3 font-bold text-foreground line-clamp-1">{it.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {it.cityName}, {it.stateName}
              </p>
              <div className="mt-4 w-full pt-4 border-t border-border flex items-center gap-2">
                <Button 
                  variant="outline-orange" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => { setViewingInstitution(it); setViewOpen(true); }}
                >
                  Ver Detalhes
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label="Configurar"
                  onClick={() => { setEditingInstitution(it); setOpen(true); }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteId(it.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ))}
          {institutions.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Nenhuma instituição cadastrada.
            </div>
          )}
        </div>
      )}

      {/* Cadastro / Edição Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingInstitution ? "Editar Instituição" : "Cadastrar Nova Instituição"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="flex flex-col items-center">
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handlePhotoChange}
                accept="image/*"
              />
              <div 
                className="h-24 w-24 rounded-full border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground bg-muted/40 cursor-pointer hover:bg-muted transition overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span className="text-xs mt-1">Upload Foto</span>
                  </>
                )}
              </div>
              <p className="text-xs italic text-muted-foreground mt-2">Tamanho recomendado: 512x512px</p>
            </div>
            <div>
              <Label htmlFor="name">Nome da Instituição</Label>
              <Input 
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Faculdade Donaduzzi" 
                required 
                className="mt-1.5" 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Estado</Label>
                <Select value={stateId} onValueChange={handleStateChange}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.abbreviation}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cidade</Label>
                <Select key={`${stateId}-${cities.length}`} value={cityId} onValueChange={setCityId} disabled={!stateId || loadingCities}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={loadingCities ? "Carregando..." : "Selecionar"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Cancelar</Button>
              <Button type="submit" variant="hero" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingInstitution ? "Salvar Alterações" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Visualização Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Instituição</DialogTitle>
            <DialogDescription>Informações completas da unidade parceira.</DialogDescription>
          </DialogHeader>
          
          {viewingInstitution && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center">
                <div className="h-32 w-32 rounded-3xl bg-gradient-warm flex items-center justify-center text-primary-foreground shadow-elevated overflow-hidden border-4 border-background">
                  {viewingInstitution.photoUrl ? (
                    <img src={viewingInstitution.photoUrl} alt={viewingInstitution.name} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-14 w-14" />
                  )}
                </div>
                <h2 className="text-xl font-bold mt-4">{viewingInstitution.name}</h2>
                <StatusBadge variant="success" className="mt-1">Ativa</StatusBadge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Localização
                  </span>
                  <p className="text-sm font-semibold">{viewingInstitution.cityName}, {viewingInstitution.stateName}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Código IBGE
                  </span>
                  <p className="text-sm font-semibold">{viewingInstitution.cityId}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Criado em
                  </span>
                  <p className="text-sm font-semibold">{new Date(viewingInstitution.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Settings className="h-3 w-3" /> Acesso
                  </span>
                  <p className="text-sm font-bold text-primary tracking-widest">{viewingInstitution.accessCode}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)} className="w-full">Fechar</Button>
            <Button 
              variant="hero" 
              className="w-full"
              onClick={() => {
                setEditingInstitution(viewingInstitution);
                setViewOpen(false);
                setOpen(true);
              }}
            >
              Editar Informações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja realmente remover esta instituição?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso removerá permanentemente a instituição e todos os dados vinculados a ela.
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

export default Instituicoes;
