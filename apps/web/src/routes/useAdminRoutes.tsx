import { Route } from 'react-router-dom'
import AdminLayoutTemplate from '../components/Templates/AdminLayoutTemplate'
import Home from '../components/Pages/Admin/Home'
import Schedule from '../components/Pages/Admin/Schedule'
import Students from '../components/Pages/Admin/Students'
import Instructors from '../components/Pages/Admin/Instructors'
import Vehicles from '../components/Pages/Admin/Vehicles'
import Settings from '../components/Pages/Admin/Settings'
import AuditLog from '../components/Pages/Admin/AuditLog'

export function useAdminRoutes() {
  return (
    <Route path="/admin" element={<AdminLayoutTemplate />}>
      <Route index element={<Home />} />
      <Route path="agenda" element={<Schedule />} />
      <Route path="alunos" element={<Students />} />
      <Route path="instrutores" element={<Instructors />} />
      <Route path="veiculos" element={<Vehicles />} />
      <Route path="configuracoes" element={<Settings />} />
      <Route path="auditoria" element={<AuditLog />} />
    </Route>
  )
}
