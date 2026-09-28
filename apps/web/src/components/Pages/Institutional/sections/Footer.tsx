import { CONTACT, SCHOOL_NAME, buildWhatsAppLink } from '../content'

const CURRENT_YEAR = new Date().getFullYear()

function Footer() {
  const whatsappLink = buildWhatsAppLink(CONTACT.whatsappNumber, CONTACT.whatsappMessage)
  const whatsappDisplay = `(${CONTACT.whatsappNumber.slice(2, 4)}) ${CONTACT.whatsappNumber.slice(4, 9)}-${CONTACT.whatsappNumber.slice(9)}`

  return (
    <footer id="contato" className="scroll-mt-32 bg-slate-900 px-4 py-12 text-slate-200">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 sm:flex-row sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">{SCHOOL_NAME}</p>
          <p className="mt-2 text-sm text-slate-400">{CONTACT.address}</p>
        </div>
        <div>
          <p className="font-medium text-white">Contato</p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-400">
            <li>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                WhatsApp: {whatsappDisplay}
              </a>
            </li>
            <li>{CONTACT.email}</li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-white">Redes sociais</p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-400">
            {CONTACT.socials.map((social) => (
              <li key={social.href}>
                <a href={social.href} target="_blank" rel="noopener noreferrer">
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-5xl border-t border-solid border-slate-700 pt-6 text-xs text-slate-500">
        {CURRENT_YEAR} {SCHOOL_NAME}. Site institucional de demonstração — dados fictícios.
      </p>
    </footer>
  )
}

export default Footer
