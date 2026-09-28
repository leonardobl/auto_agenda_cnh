import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Institutional from './components/Pages/Institutional'
import { useStudentRoutes } from './routes/useStudentRoutes'
import { useInstructorRoutes } from './routes/useInstructorRoutes'
import { useAdminRoutes } from './routes/useAdminRoutes'
import { useAuthRoutes } from './routes/useAuthRoutes'

function App() {
  const studentRoutes = useStudentRoutes()
  const instructorRoutes = useInstructorRoutes()
  const adminRoutes = useAdminRoutes()
  const authRoutes = useAuthRoutes()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Institutional />} />
        {authRoutes}
        {studentRoutes}
        {instructorRoutes}
        {adminRoutes}
      </Routes>
    </BrowserRouter>
  )
}

export default App
