import { GALLERY } from '../content'
import GalleryIcon from './GalleryIcon'

// Mocked: illustrated placeholder cards, not real photographs — see
// "O que é real vs. simulado" in README.md and design.md's Non-Goals.
const CARD_GRADIENTS = [
  'from-primary to-blue-400',
  'from-accent to-orange-300',
  'from-slate-700 to-slate-500',
  'from-success to-emerald-400',
]

function Gallery() {
  return (
    <section id="galeria" className="scroll-mt-32 px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-center text-2xl font-bold sm:text-3xl">Nossa estrutura</h2>
        <p className="mb-10 text-center text-slate-600">
          Um retrato (ilustrado) do dia a dia da autoescola — sem fotos reais nesta demonstração.
        </p>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GALLERY.map((item, index) => (
            <li key={item.id}>
              <div
                className={`flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]} text-white`}
              >
                <GalleryIcon icon={item.icon} className="h-16 w-16" />
              </div>
              <p className="mt-2 text-center text-sm font-medium text-slate-700">{item.caption}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default Gallery
