import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PlaceholderScreen from './components/Atoms/PlaceholderScreen'
import { useStudentRoutes } from './routes/useStudentRoutes'
import { useInstructorRoutes } from './routes/useInstructorRoutes'
import { useAdminRoutes } from './routes/useAdminRoutes'

function App() {
  const studentRoutes = useStudentRoutes()
  const instructorRoutes = useInstructorRoutes()
  const adminRoutes = useAdminRoutes()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlaceholderScreen title="Auto Agenda CNH" />} />
        {studentRoutes}
        {instructorRoutes}
        {adminRoutes}
      </Routes>
    </BrowserRouter>
  )
}

export default App
