import { Link } from "react-router-dom";
import { Building2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";

const Index = () => {
  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold">Bem-vindo, <span className="text-primary">Admin</span></h1>
        <p className="text-muted-foreground mt-1">Painel administrativo do Ligeirinho Food.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <article className="rounded-2xl bg-card border border-border shadow-card p-6 flex flex-col">
          <div className="flex items-start justify-between">
            <div className="h-14 w-14 rounded-xl bg-accent text-primary flex items-center justify-center">
              <Building2 className="h-7 w-7" />
            </div>
            <StatusBadge variant="warning">Ativas</StatusBadge>
          </div>
          <h2 className="mt-5 text-xl font-bold">Instituições Cadastradas</h2>
          <p className="mt-1 text-sm text-muted-foreground">Escolas, universidades e centros corporativos integrados ao sistema.</p>
          <p className="mt-4 text-4xl font-extrabold text-primary">42<span className="text-base font-normal text-muted-foreground ml-2">unidades</span></p>
          <Link to="/instituicoes" className="mt-5">
            <Button variant="hero" size="lg" className="w-full">Gerenciar Instituições</Button>
          </Link>
        </article>

        <article className="rounded-2xl bg-card border border-border shadow-card p-6 flex flex-col">
          <div className="flex items-start justify-between">
            <div className="h-14 w-14 rounded-xl bg-destructive/10 text-brand-red flex items-center justify-center">
              <ShoppingCart className="h-7 w-7" />
            </div>
            <StatusBadge variant="danger">Operando</StatusBadge>
          </div>
          <h2 className="mt-5 text-xl font-bold">Cantinas Cadastradas</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pontos de venda e distribuição de alimentos monitorados.</p>
          <p className="mt-4 text-4xl font-extrabold text-brand-red">128<span className="text-base font-normal text-muted-foreground ml-2">pontos</span></p>
          <Link to="/cantinas" className="mt-5">
            <Button variant="red" size="lg" className="w-full">Visualizar Cantinas</Button>
          </Link>
        </article>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink to="/categorias" title="Categorias" desc="Gerenciar categorias de produtos" />
        <QuickLink to="/icons" title="Ícones" desc="Biblioteca visual do sistema" />
        <QuickLink to="/metodos-pagamento" title="Pagamentos" desc="Métodos aceitos no app" />
      </div>
    </div>
  );
};

const QuickLink = ({ to, title, desc }: { to: string; title: string; desc: string }) => (
  <Link to={to} className="group rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-card transition">
    <p className="font-semibold text-foreground group-hover:text-primary transition">{title}</p>
    <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
  </Link>
);

export default Index;
