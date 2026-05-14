import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Instituicoes from "./pages/Instituicoes.tsx";
import Cantinas from "./pages/Cantinas.tsx";
import Categorias from "./pages/Categorias.tsx";
import Icons from "./pages/Icons.tsx";
import MetodosPagamento from "./pages/MetodosPagamento.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/instituicoes" element={<Instituicoes />} />
              <Route path="/cantinas" element={<Cantinas />} />
              <Route path="/categorias" element={<Categorias />} />
              <Route path="/icons" element={<Icons />} />
              <Route path="/metodos-pagamento" element={<MetodosPagamento />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
