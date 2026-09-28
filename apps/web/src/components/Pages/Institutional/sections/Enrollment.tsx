import { CONTACT, buildWhatsAppLink } from '../content'

function Enrollment() {
  const whatsappLink = buildWhatsAppLink(CONTACT.whatsappNumber, CONTACT.whatsappMessage)

  return (
    <section id="matricule-se" className="scroll-mt-32 bg-accent px-4 py-16 text-white">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Pronto para tirar sua CNH?</h2>
        <p className="text-white/90">
          Fale com a gente pelo WhatsApp e nossa equipe te ajuda a escolher a categoria certa e começar sua
          matrícula.
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-touch inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-medium text-accent"
        >
          Falar no WhatsApp
        </a>
      </div>
    </section>
  )
}

export default Enrollment
