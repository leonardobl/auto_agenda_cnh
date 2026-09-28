import Header from './sections/Header'
import Hero from './sections/Hero'
import About from './sections/About'
import Services from './sections/Services'
import Gallery from './sections/Gallery'
import Enrollment from './sections/Enrollment'
import Footer from './sections/Footer'

function Institutional() {
  return (
    <div>
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Gallery />
        <Enrollment />
      </main>
      <Footer />
    </div>
  )
}

export default Institutional
