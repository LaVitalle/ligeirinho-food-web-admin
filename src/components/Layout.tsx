import { Link, Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="flex min-h-screen font-sans">
      
      {/* Sidebar com o vermelho da marca e arredondamento customizado */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-brand-red mb-10">
          Ligeirinho Food
        </h2>
        
        <nav className="flex flex-col gap-4">
          <Link to="/" className="text-brand-dark hover:text-brand-orange font-medium transition-colors">
             Dashboard
          </Link>
          <Link to="/pedidos" className="text-brand-dark hover:text-brand-orange font-medium transition-colors">
             Pedidos
          </Link>
        </nav>
      </aside>

      {/* Área de conteúdo principal */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
      
    </div>
  )
}