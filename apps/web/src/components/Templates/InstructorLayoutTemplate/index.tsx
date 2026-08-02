import { NavLink, Outlet } from 'react-router-dom'
import { toast } from 'react-toastify'
import Button from '../../Atoms/Button'
import { mergeClassNames } from '../../../utils/mergeClassNames'
import { useInstructorLayoutTemplate } from './useInstructorLayoutTemplate'

function InstructorLayoutTemplate() {
  const { navItems } = useInstructorLayoutTemplate()

  const handleSignOut = () => {
    toast.info('Encerrar sessão ainda não está disponível.')
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-solid p-4">
        <p className="font-semibold">AutoAgenda — Instrutor</p>
        <Button onClick={handleSignOut}>Sair</Button>
      </header>
      <nav aria-label="Navegação do instrutor" className="border-b border-solid p-4">
        <ul className="flex flex-wrap gap-4">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/instrutor'}
                className={({ isActive }) =>
                  mergeClassNames(
                    'min-h-touch inline-flex items-center rounded-lg p-2',
                    isActive && 'bg-primary text-white',
                  )
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

export default InstructorLayoutTemplate
