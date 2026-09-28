import { Link } from 'react-router-dom'
import { SCHOOL_NAME } from '../content'

const SECTION_LINKS = [
  { href: '#sobre', label: 'Sobre' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#galeria', label: 'Galeria' },
  { href: '#matricule-se', label: 'Matricule-se' },
  { href: '#contato', label: 'Contato' },
]

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-solid bg-white">
      <div className="flex items-center justify-between gap-4 p-4">
        <p className="text-lg font-semibold text-primary">{SCHOOL_NAME}</p>
        <Link
          to="/login"
          className="min-h-touch inline-flex items-center rounded-lg bg-primary px-4 py-2 font-medium text-white"
        >
          Entrar
        </Link>
      </div>
      <nav aria-label="Navegação institucional" className="overflow-x-auto border-t border-solid px-4 py-2">
        <ul className="flex w-max gap-4 sm:w-auto sm:justify-center">
          {SECTION_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="inline-block whitespace-nowrap py-1 font-medium text-primary">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Header
