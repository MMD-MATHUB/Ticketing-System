import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectApplication } from '../../../store/authSlice'
import './ApplicationSelectionPage.css'

export function ApplicationSelectionPage() {
  const applications = useSelector((state) => state.auth.applications)
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const openApplication = (application) => {
    dispatch(selectApplication(application.key))
    navigate(application.key === 'requester' ? '/dashboard' : `/${application.key}`)
  }

  return (
    <div className="application-selection">
      <div className="application-selection-header">
        <div className="eyebrow">Service operations</div>
        <h1>Choose an application</h1>
        <p>Welcome back, {user?.name || 'User'}. Select the workspace you want to open.</p>
      </div>

      <div className="application-grid">
        {applications.map((application) => (
          <button
            type="button"
            className={`application-option application-${application.key}`}
            key={application.key}
            onClick={() => openApplication(application)}
          >
            <span className="application-option-icon">{application.name[0]}</span>
            <span className="application-option-content">
              <strong>{application.name}</strong>
              <span>{application.description}</span>
            </span>
            <span className="application-option-arrow" aria-hidden="true">→</span>
          </button>
        ))}
      </div>
    </div>
  )
}
