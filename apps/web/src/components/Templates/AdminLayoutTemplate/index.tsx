import { NavLink, Outlet } from 'react-router-dom'
import { useAdminLayoutTemplate } from './useAdminLayoutTemplate'

function AdminLayoutTemplate() {
  const { navItems } = useAdminLayoutTemplate()

  return (
    <div className="min-h-screen">
      <header className="border-b border-solid p-4">
        <p className="font-semibold">AutoAgenda — Administrador</p>
      </header>
      <nav aria-label="Navegação do administrador" className="border-b border-solid p-4">
        <ul className="flex flex-wrap gap-4">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `min-h-touch inline-flex items-center rounded-lg p-2 ${isActive ? 'bg-primary text-white' : ''}`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayoutTemplate
