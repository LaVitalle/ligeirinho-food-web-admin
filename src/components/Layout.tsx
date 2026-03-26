import { Link, Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Menu Lateral Fixo */}
      <aside style={{ width: '250px', backgroundColor: '#f4f4f5', padding: '20px' }}>
        <h2 style={{ color: '#ef4444' }}>Ligeirinho Food</h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' }}>
          {/* O componente Link substitui a tag <a> para evitar o recarregamento da página */}
          <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}> Dashboard</Link>
          <Link to="/pedidos" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}> Pedidos</Link>
        </nav>
      </aside>

      {/* Conteúdo Dinâmico */}
      <main style={{ flex: 1, padding: '30px' }}>
        {/* O Outlet é a "janela" onde as páginas (Dashboard, Pedidos) vão aparecer */}
        <Outlet />
      </main>
      
    </div>
  )
}
