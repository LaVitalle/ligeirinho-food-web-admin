import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import mascot from "@/assets/mascot.png";
import loginBg from "@/assets/login-bg.jpg";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { login as loginUser, saveAuthToken } from "@/lib/auth";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await loginUser({ email, password });
      saveAuthToken(response.data.accessToken);
      toast.success("Login efetuado com sucesso.");
      navigate("/");
    } catch (error) {
      let message = "Falha ao executar login.";
      if (error instanceof ApiError) {
        if (error.status === 401) {
          message = "Credenciais inválidas. Verifique email e senha.";
        } else if (error.status >= 500) {
          message = "Erro interno do servidor. Veja o backend no terminal.";
        } else {
          message = error.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-cover bg-center"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="w-full max-w-md flex flex-col items-center">
        <img src={mascot} alt="Ligeirinho mascot" className="h-32 w-32 object-contain drop-shadow-2xl -mb-4 relative z-10" width={128} height={128} />

        <div className="w-full bg-gradient-red rounded-2xl border-2 border-brand-yellow shadow-elevated px-6 py-5 text-center">
          <h1 className="font-display text-3xl font-extrabold italic text-primary-foreground tracking-wide">LIGEIRINHO</h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="h-px w-6 bg-brand-yellow/80" />
            <span className="text-sm font-semibold tracking-[0.3em] text-primary-foreground">FOOD</span>
            <span className="h-px w-6 bg-brand-yellow/80" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full mt-6 bg-primary/40 backdrop-blur-md rounded-2xl border border-primary-foreground/20 p-6 space-y-4 shadow-elevated">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="Seu e-mail"
              className="w-full h-12 rounded-full bg-background pl-12 pr-4 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={show ? "text" : "password"}
              required
              placeholder="Sua senha"
              className="w-full h-12 rounded-full bg-background pl-12 pr-12 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-brand-yellow"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Mostrar senha">
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <Button type="submit" variant="yellow" size="xl" className="w-full rounded-full" disabled={loading}>
            {loading ? "Entrando..." : "ENTRAR"}
          </Button>

          <div className="pt-2 text-center space-y-2">
            <Link to="/register" className="block text-primary-foreground font-semibold hover:underline">Criar conta</Link>
            <Link to="/" className="block text-primary-foreground/80 text-sm italic hover:underline">Esqueceu sua senha?</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
