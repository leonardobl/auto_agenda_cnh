import { ABOUT } from '../content'

function About() {
  return (
    <section id="sobre" className="scroll-mt-32 px-4 py-16">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold sm:text-3xl">{ABOUT.title}</h2>
          {ABOUT.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-slate-600">
              {paragraph}
            </p>
          ))}
        </div>
        <dl className="grid grid-cols-3 gap-4 sm:gap-6">
          {ABOUT.highlights.map((highlight) => (
            <div key={highlight.label} className="rounded-lg bg-slate-50 p-4 text-center">
              <dt className="text-sm text-slate-600">{highlight.label}</dt>
              <dd className="text-2xl font-bold text-primary">{highlight.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

export default About
