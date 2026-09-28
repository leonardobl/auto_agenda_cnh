import { HERO } from '../content'

function Hero() {
  return (
    <section className="bg-primary px-4 py-16 text-white sm:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <p className="font-medium uppercase tracking-wide text-white/80">{HERO.eyebrow}</p>
        <h1 className="text-3xl font-bold sm:text-5xl">{HERO.headline}</h1>
        <p className="text-lg text-white/90">{HERO.subheadline}</p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="#matricule-se"
            className="min-h-touch inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 font-medium text-white"
          >
            {HERO.primaryCtaLabel}
          </a>
          <a
            href="#servicos"
            className="min-h-touch inline-flex items-center justify-center rounded-lg border border-solid border-white px-6 py-3 font-medium text-white"
          >
            {HERO.secondaryCtaLabel}
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero
