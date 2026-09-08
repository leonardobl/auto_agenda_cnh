import { useState } from 'react'
import { toast } from 'react-toastify'
import Button from '../../../Atoms/Button'

const EXPORT_DELAY_MS = 800

function Reports() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    // mocked: no backend, see "O que é real vs. simulado" in README.md — no file
    // is generated or downloaded, only a simulated delay and confirmation.
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      toast.success('Relatório gerado (simulado).')
    }, EXPORT_DELAY_MS)
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Relatórios</h1>
      <p>Exporta um relatório das aulas agendadas.</p>
      <Button type="button" onClick={handleExport} disabled={isExporting}>
        {isExporting ? 'Exportando...' : 'Exportar relatório de aulas'}
      </Button>
    </div>
  )
}

export default Reports
