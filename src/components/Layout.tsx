import { Header } from "./Header";
import { Footer } from "./Footer";
import { Outlet } from "react-router-dom";

export const Layout = () => (
  <div className="min-h-screen flex flex-col bg-muted/30">
    <Header />
    <main className="flex-1 container py-6 md:py-10 animate-fade-in">
      <Outlet />
    </main>
    <Footer />
  </div>
);
