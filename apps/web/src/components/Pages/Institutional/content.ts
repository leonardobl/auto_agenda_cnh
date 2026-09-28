// Mocked: all copy below is fictional placeholder content for this academic
// deliverable, not a real business — see "O que é real vs. simulado" in README.md.

export const SCHOOL_NAME = 'Auto Escola Rota Certa'

export const HERO = {
  eyebrow: 'Auto Escola Rota Certa',
  headline: 'Sua carteira de motorista com quem entende do assunto',
  subheadline:
    'Mais de 25 anos formando motoristas seguros e preparados, com aulas práticas e teóricas para todas as categorias de CNH.',
  primaryCtaLabel: 'Quero me matricular',
  secondaryCtaLabel: 'Conhecer os serviços',
}

export const ABOUT = {
  title: 'Tradição de mais de 25 anos',
  paragraphs: [
    'Fundada em 1998, a Auto Escola Rota Certa nasceu com um propósito simples: formar motoristas conscientes, seguros e preparados para o trânsito real.',
    'Ao longo de mais de duas décadas, já ajudamos milhares de alunos a conquistar sua primeira habilitação ou a adicionar novas categorias à CNH, sempre com instrutores qualificados e uma frota bem cuidada.',
    'Hoje, unimos essa tradição a um agendamento de aulas 100% digital — o mesmo sistema que move essa página.',
  ],
  highlights: [
    { label: 'Anos de tradição', value: '25+' },
    { label: 'Alunos formados', value: '8.000+' },
    { label: 'Instrutores qualificados', value: '100%' },
  ],
}

export interface ServiceItem {
  code: string
  name: string
  description: string
}

// Matches apps/api's seeded license_category rows (code/name) — see
// apps/api/src/database/migrations/0003_create_license_category.sql.
export const SERVICES: ServiceItem[] = [
  { code: 'A', name: 'Motocicletas', description: 'Habilitação para motocicletas, motonetas e triciclos.' },
  { code: 'B', name: 'Automóveis', description: 'A categoria mais procurada, para carros de passeio.' },
  { code: 'AB', name: 'Automóveis e motocicletas', description: 'As duas categorias mais comuns, em um pacote só.' },
  { code: 'C', name: 'Veículos de carga', description: 'Para quem quer dirigir caminhões e veículos de carga.' },
  { code: 'D', name: 'Veículos de passageiros', description: 'Ônibus e vans — ideal para quem busca uma nova profissão.' },
  { code: 'E', name: 'Combinação de veículos de carga', description: 'Carretas e conjuntos de veículos acoplados.' },
]

export interface GalleryItem {
  id: string
  caption: string
  icon: 'car' | 'wheel' | 'road' | 'cap'
}

export const GALLERY: GalleryItem[] = [
  { id: 'aulas-praticas', caption: 'Aulas práticas em veículos revisados', icon: 'car' },
  { id: 'nossa-frota', caption: 'Frota própria, sempre em dia', icon: 'wheel' },
  { id: 'estrutura', caption: 'Estrutura completa para aulas teóricas', icon: 'road' },
  { id: 'instrutores', caption: 'Instrutores credenciados e experientes', icon: 'cap' },
]

export const CONTACT = {
  address: 'Av. das Autoescolas, 1234 — Centro, São Paulo/SP',
  // Fictional number, intentionally shaped like a real Brazilian WhatsApp Business
  // number but not a working one — see design.md "Risks / Trade-offs".
  whatsappNumber: '5511987654321',
  whatsappMessage: 'Olá! Vim pelo site e quero saber mais sobre a matrícula.',
  email: 'contato@rotacerta.exemplo.com.br',
  socials: [
    { label: 'Instagram', href: 'https://instagram.com/autoescolarotacerta' },
    { label: 'Facebook', href: 'https://facebook.com/autoescolarotacerta' },
  ],
}

export function buildWhatsAppLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
