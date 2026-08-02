interface NavItem {
  label: string
  to: string
}

const navItems: NavItem[] = [
  { label: 'Início', to: '/aluno' },
  { label: 'Minha agenda', to: '/aluno/minha-agenda' },
  { label: 'Agendar aula', to: '/aluno/agendar-aula' },
  { label: 'Histórico', to: '/aluno/historico' },
  { label: 'Perfil', to: '/aluno/perfil' },
]

export function useStudentLayoutTemplate() {
  return { navItems }
}
