import mascot from "@/assets/mascot.png";

export const Footer = () => (
  <footer className="border-t border-border bg-muted/40 mt-12">
    <div className="container py-8 flex flex-col items-center gap-3 text-center">
      <img src={mascot} alt="" className="h-8 w-8 object-contain opacity-80" width={32} height={32} loading="lazy" />
      <p className="text-sm text-muted-foreground">
        © 2026 Ligeirinho Food System. Todos os direitos reservados.
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-block h-2 w-2 rounded-full bg-success" />
        Servidores Online · Versão 2.4.0
      </div>
    </div>
  </footer>
);
