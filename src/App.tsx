import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Pedidos } from './pages/Pedidos'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* A rota pai é o Layout. Tudo dentro dela vai aparecer no <Outlet /> */}
        <Route path="/" element={<Layout />}>
          {/* O "index" significa que o Dashboard é a página padrão quando acessar "/" */}
          <Route index element={<Dashboard />} />
          <Route path="pedidos" element={<Pedidos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
