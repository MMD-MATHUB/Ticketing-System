import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export function ApplicationRoute({ applicationKey, children }) {
  const applications = useSelector((state) => state.auth.applications)
  const navigate = useNavigate()
  const hasAccess = applications.some((application) => application.key === applicationKey)

  useEffect(() => {
    if (!hasAccess) navigate('/choose-app', { replace: true })
  }, [hasAccess, navigate])

  return hasAccess ? children : null
}
