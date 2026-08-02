interface NavItem {
  label: string
  to: string
}

const navItems: NavItem[] = [
  { label: 'Início', to: '/admin' },
  { label: 'Agenda', to: '/admin/agenda' },
  { label: 'Alunos', to: '/admin/alunos' },
  { label: 'Instrutores', to: '/admin/instrutores' },
  { label: 'Veículos', to: '/admin/veiculos' },
  { label: 'Configurações', to: '/admin/configuracoes' },
  { label: 'Auditoria', to: '/admin/auditoria' },
]

export function useAdminLayoutTemplate() {
  return { navItems }
}
