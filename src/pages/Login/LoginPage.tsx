import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../../components/ui/button'
import { DEMO_CREDENTIALS, useAuthStore } from '../../lib/auth'
import { showToast } from '../../lib/toast'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [email, setEmail] = useState<string>(DEMO_CREDENTIALS.email)
  const [password, setPassword] = useState<string>(DEMO_CREDENTIALS.password)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      showToast.success('Sessão iniciada com sucesso.')
      navigate('/', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha no login.'
      showToast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light px-4 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-brand-red">Ligeirinho Food</h1>
        <p className="mt-1 text-center text-sm text-gray-600">Entre na área de administração</p>

        <div
          className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-xs text-gray-600"
          role="note"
        >
          <p className="font-semibold text-gray-700">Ambiente de demonstração</p>
          <p className="mt-1 leading-relaxed">
            Utilize o utilizador de exemplo abaixo (campos já preenchidos). O backend deve expor
            as mesmas credenciais em seed para o login funcionar na apresentação.
          </p>
          <dl className="mt-2 space-y-0.5 font-mono text-[11px] text-gray-800">
            <div>
              <dt className="inline text-gray-500">E-mail: </dt>
              <dd className="inline">{DEMO_CREDENTIALS.email}</dd>
            </div>
            <div>
              <dt className="inline text-gray-500">Palavra-passe: </dt>
              <dd className="inline">{DEMO_CREDENTIALS.password}</dd>
            </div>
          </dl>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-brand-dark">
              E-mail
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-brand-dark outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="mb-1 block text-sm font-medium text-brand-dark"
            >
              Palavra-passe
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-brand-dark outline-none transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30"
            />
          </div>
          <Button type="submit" variant="primary" fullWidth loading={submitting}>
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}
