interface NavItem {
  label: string
  to: string
}

const navItems: NavItem[] = [
  { label: 'Início', to: '/instrutor' },
  { label: 'Minha agenda', to: '/instrutor/minha-agenda' },
  { label: 'Disponibilidade', to: '/instrutor/disponibilidade' },
  { label: 'Perfil', to: '/instrutor/perfil' },
]

export function useInstructorLayoutTemplate() {
  return { navItems }
}
