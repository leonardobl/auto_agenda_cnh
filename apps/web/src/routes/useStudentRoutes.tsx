import { Route } from 'react-router-dom'
import StudentLayoutTemplate from '../components/Templates/StudentLayoutTemplate'
import Home from '../components/Pages/Student/Home'
import MySchedule from '../components/Pages/Student/MySchedule'
import ScheduleClass from '../components/Pages/Student/ScheduleClass'
import History from '../components/Pages/Student/History'
import Profile from '../components/Pages/Student/Profile'

export function useStudentRoutes() {
  return (
    <Route path="/aluno" element={<StudentLayoutTemplate />}>
      <Route index element={<Home />} />
      <Route path="minha-agenda" element={<MySchedule />} />
      <Route path="agendar-aula" element={<ScheduleClass />} />
      <Route path="historico" element={<History />} />
      <Route path="perfil" element={<Profile />} />
    </Route>
  )
}
