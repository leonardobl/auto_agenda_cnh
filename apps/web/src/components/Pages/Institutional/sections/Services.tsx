import { SERVICES } from '../content'

function Services() {
  return (
    <section id="servicos" className="scroll-mt-32 bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">Categorias que ensinamos</h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <li key={service.code} className="rounded-xl bg-white p-6 shadow-sm">
              <p className="mb-2 inline-flex min-h-touch min-w-touch items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
                {service.code}
              </p>
              <p className="font-semibold">{service.name}</p>
              <p className="text-sm text-slate-600">{service.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Services
