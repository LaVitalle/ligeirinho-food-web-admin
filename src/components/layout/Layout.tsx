import { Link, Outlet } from 'react-router-dom'

import { useAuthStore } from '../../lib/auth'

export function Layout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="flex min-h-screen font-sans">
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white p-6">
        <h2 className="mb-10 text-2xl font-bold text-brand-red">Ligeirinho Food</h2>

        {user && (
          <p className="mb-6 truncate text-xs text-gray-500" title={user.email}>
            {user.email}
          </p>
        )}

        <nav className="flex flex-col gap-4">
          <Link
            to="/"
            className="font-medium text-brand-dark transition-colors hover:text-brand-orange"
          >
            Dashboard
          </Link>
          <Link
            to="/instituicoes"
            className="font-medium text-brand-dark transition-colors hover:text-brand-orange"
          >
            Instituições
          </Link>
          <Link
            to="/pedidos"
            className="font-medium text-brand-dark transition-colors hover:text-brand-orange"
          >
            Pedidos
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => logout()}
          className="mt-auto pt-8 text-left text-sm font-medium text-gray-600 underline-offset-2 hover:text-brand-red hover:underline"
        >
          Sair
        </button>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
