import { Route } from 'react-router-dom'
import InstructorLayoutTemplate from '../components/Templates/InstructorLayoutTemplate'
import Home from '../components/Pages/Instructor/Home'
import MySchedule from '../components/Pages/Instructor/MySchedule'
import Availability from '../components/Pages/Instructor/Availability'
import Profile from '../components/Pages/Instructor/Profile'

export function useInstructorRoutes() {
  return (
    <Route path="/instrutor" element={<InstructorLayoutTemplate />}>
      <Route index element={<Home />} />
      <Route path="minha-agenda" element={<MySchedule />} />
      <Route path="disponibilidade" element={<Availability />} />
      <Route path="perfil" element={<Profile />} />
    </Route>
  )
}
