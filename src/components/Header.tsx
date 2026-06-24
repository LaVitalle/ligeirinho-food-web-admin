import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, X, User, Search, LogOut } from "lucide-react";
import { useState } from "react";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import mascot from "@/assets/mascot.png";
import { cn } from "@/lib/utils";
import { isAuthenticated, logout } from "@/lib/auth";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/instituicoes", label: "Instituições" },
  { to: "/cantinas", label: "Cantinas" },
  { to: "/categorias", label: "Categorias" },
  { to: "/icons", label: "Ícones" },
  { to: "/metodos-pagamento", label: "Pagamentos" },
];

export const Header = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso.");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
          <img src={mascot} alt="Ligeirinho" className="h-9 w-9 object-contain" width={36} height={36} />
          <span className="font-display font-bold text-lg leading-none">
            <span className="text-primary">Ligeirinho</span>{" "}
            <span className="text-brand-red">Food</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
                  isActive
                    ? "text-primary after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:bg-primary after:rounded-full"
                    : "text-foreground/70 hover:text-foreground hover:bg-accent"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition" aria-label="Buscar">
            <Search className="h-5 w-5" />
          </button>
          <NotificationDropdown />
          
          {loggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-10 w-10 inline-flex items-center justify-center rounded-full border-2 border-primary text-primary hover:bg-accent transition" aria-label="Conta">
                  <User className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/perfil")}>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-brand-red focus:text-brand-red">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="h-10 w-10 inline-flex items-center justify-center rounded-full border-2 border-primary text-primary hover:bg-accent transition" aria-label="Entrar">
              <User className="h-5 w-5" />
            </Link>
          )}

          <button
            className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-accent transition"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-border bg-background animate-fade-in">
          <div className="container py-2 flex flex-col">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-3 rounded-md text-sm font-medium transition-colors",
                    isActive ? "bg-accent text-primary" : "text-foreground/80 hover:bg-accent"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};
