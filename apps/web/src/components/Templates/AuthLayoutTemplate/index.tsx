import { Outlet } from 'react-router-dom'

function AuthLayoutTemplate() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg border border-solid p-6">
        <p className="mb-4 text-center font-semibold">AutoAgenda</p>
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayoutTemplate
