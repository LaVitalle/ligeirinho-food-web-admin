import { Link } from 'react-router-dom'

import { useAuthStore } from '../stores/authStore'

export function Unauthorized() {
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 font-sans">
      <h1 className="text-2xl font-bold text-brand-dark">Acesso negado</h1>
      <p className="max-w-md text-center text-gray-600">
        A sua conta não tem permissão de administrador para esta área.
      </p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Sair
        </button>
        <Link
          to="/login"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-brand-dark hover:bg-gray-100"
        >
          Voltar ao login
        </Link>
      </div>
    </div>
  )
}
