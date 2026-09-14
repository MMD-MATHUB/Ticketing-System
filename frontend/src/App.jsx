import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { LoginPage } from './features/authentication/pages/LoginPage'
import { ApplicationSelectionPage } from './features/authentication/pages/ApplicationSelectionPage'
import { ApplicationRoute } from './shared/routing/ApplicationRoute'
import { ProcessingPage } from './features/processing/ProcessingPage'
import { AnalysisPage } from './features/analysis/AnalysisPage'
import { AppShell } from './app/AppShell'
import apiClient from './api/apiClient'
import './App.css'

const API_BASE_URL = '/api'

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return <Routes><Route path="/login" element={<LoginPage />} /></Routes>
  }

  return <AppShell><Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/choose-app" element={<ApplicationSelectionPage />} />
          <Route path="/processing" element={<ApplicationRoute applicationKey="processing"><ProcessingPage /></ApplicationRoute>} />
          <Route path="/analysis" element={<ApplicationRoute applicationKey="analysis"><AnalysisPage /></ApplicationRoute>} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tickets/new" element={<NewTicketPage />} />
          <Route path="/tickets/not-started" element={<TicketListPage title="Not started tickets" subtitle="Tickets awaiting processing" view="not-started" />} />
          <Route path="/tickets/in-progress" element={<TicketListPage title="In progress tickets" subtitle="Tickets currently being worked on" view="in-progress" />} />
          <Route path="/tickets/closed" element={<TicketListPage title="Closed tickets" subtitle="Resolved and cancelled tickets" view="closed" />} />
          <Route path="/tickets/pending-reply" element={<TicketListPage title="Pending Requester Comment" subtitle="Tickets waiting for your response" view="pending-reply" />} />
          <Route path="/tickets/search" element={<SearchPage />} />
          <Route path="/tickets/:ticketNumber" element={<TicketDetailPage />} />
        </Routes></AppShell>
}

function DashboardPage() {
  const user = useSelector((state) => state.auth.user)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ticketSearch, setTicketSearch] = useState('')
  const [searchError, setSearchError] = useState('')
  const [isRefreshed, setIsRefreshed] = useState(false)
  const searchErrorCloseRef = useRef(null)
  const refreshTimerRef = useRef(null)
  const navigate = useNavigate()
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 16 ? 'Good day' : 'Good evening'
  const userName = user?.name || 'User'

  const searchTicket = async (event) => {
    event.preventDefault()
    const ticketNumber = ticketSearch.trim()

    if (!ticketNumber) return

    try {
      await apiClient.get(`${API_BASE_URL}/tickets/${encodeURIComponent(ticketNumber)}`)
      navigate(`/tickets/${encodeURIComponent(ticketNumber)}`)
    } catch (requestError) {
      if (requestError.response?.status === 404) {
        setSearchError(`Ticket ${ticketNumber} not found.`)
      } else {
        setSearchError('Unable to search for this ticket. Please try again.')
      }
    }
  }

  useEffect(() => {
    if (!searchError) return undefined

    searchErrorCloseRef.current?.focus()
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSearchError('')
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [searchError])

  const loadDashboard = useCallback(() => {
    apiClient.get(`${API_BASE_URL}/tickets/dashboard`)
      .then((response) => response.data)
      .then((data) => {
        setDashboard(data)
        setError('')
      })
      .catch(() => {
        setError('Cannot connect to the backend on http://localhost:8080. Start the API and refresh this page.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    loadDashboard()

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  }, [loadDashboard])

  const refreshDashboard = () => {
    loadDashboard()
    setIsRefreshed(true)

    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    refreshTimerRef.current = setTimeout(() => setIsRefreshed(false), 5000)
  }

  const cards = useMemo(() => {
    if (!dashboard?.stats) return []
    const s = dashboard.stats
    return [
      { eyebrow: 'Overview', title: 'Total tickets', value: s.total, sub: `+${s.newThisWeek} created this week`, color: '#584cb9', subColor: '#16a34a', route: '/tickets' },
      { eyebrow: 'Queue', title: 'Not started', value: s.notStarted, sub: 'Tickets awaiting processing', color: '#b85c5c', subColor: '#6e6e7c', route: '/tickets/not-started' },
      { eyebrow: 'Active workload', title: 'In progress', value: s.inProgress, sub: `${s.inProgressPercent}% of your tickets are moving`, color: '#d97706', subColor: '#6e6e7c', route: '/tickets/in-progress' },
      { eyebrow: 'Completed', title: 'Closed', value: s.closed, sub: `Average closure time is ${s.avgDaysToClose} days`, color: '#0f9f75', subColor: '#6e6e7c', route: '/tickets/closed' },
      { eyebrow: 'Needs attention', title: 'Pending your reply', value: s.pendingReply, sub: `Oldest waiting reply: ${s.oldestPendingDays} days`, color: '#584cb9', subColor: '#584cb9', route: '/tickets/pending-reply' },
    ]
  }, [dashboard])

  if (loading) {
    return <section className="page"><div className="panel state-panel">Loading dashboard...</div></section>
  }

  if (error) {
    return <section className="page"><div className="panel state-panel">{error}</div></section>
  }

  return (
    <section className="page dashboard-page">
      <header className="page-header dashboard-header">
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1>{greeting}, {userName}</h1>
          <p className="dashboard-intro">Here's your ticket overview and the items that need attention.</p>
        </div>
        <button
          type="button"
          className={`refresh-button dashboard-refresh${isRefreshed ? ' refreshed' : ''}`}
          onClick={refreshDashboard}
        >
          {isRefreshed ? 'Refreshed!' : 'Refresh'}
        </button>
      </header>

      <div className="dashboard-tools">
        <form className="search dashboard-search" onSubmit={searchTicket}>
          <input
            value={ticketSearch}
            onChange={(event) => setTicketSearch(event.target.value)}
            placeholder="Enter ticket number..."
            aria-label="Ticket number"
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="kpis dashboard-kpis">
        {cards.map((card) => (
          <article key={card.title} className="card clickable dashboard-kpi" onClick={() => navigate(card.route)}>
            <div className="eyebrow">{card.eyebrow}</div>
            <h3>{card.title}</h3>
            <div className="value" style={{ color: card.color }}>{card.value}</div>
            <p style={{ color: card.subColor }}>{card.sub}</p>
          </article>
        ))}
      </div>

      <div className="grid dashboard-grid">
        <section className="panel large dashboard-panel recent-panel">
          <div className="panel-heading">
            <div>
              <div className="panel-title">Recent tickets</div>
              <div className="panel-subtitle">Your latest submitted requests</div>
            </div>
            <button type="button" className="text-button" onClick={() => navigate('/tickets')}>View all</button>
          </div>
          <div className="recent-ticket-list">
            {dashboard.recentTickets.map((ticket) => (
              <LinkRow key={ticket.ticketNumber} ticket={ticket} />
            ))}
          </div>
        </section>

        <div className="stack dashboard-insights">
          <section className="panel dashboard-panel">
            <div className="panel-title">Open tickets by priority</div>
            <div className="panel-subtitle">Where your open work is concentrated</div>
            <div className="dashboard-insight-list">
              {dashboard.openByPriority.map((item) => (
                <div key={item.label} className="bar-row">
                  <span className="label">{prettyLabel(item.label)}</span>
                  <div className="bar"><div className="fill priority" style={{ width: `${Math.max((item.count / Math.max(...dashboard.openByPriority.map((entry) => entry.count), 1)) * 100, 12)}%` }} /></div>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="panel dashboard-panel">
            <div className="panel-title">Open tickets by plant</div>
            <div className="panel-subtitle">Requests grouped by location</div>
            <div className="dashboard-insight-list">
              {dashboard.openByPlant.map((item) => (
                <div key={item.label} className="bar-row plant-row">
                  <div className="plant-label"><span className="accent" /><span className="text">{item.label}</span></div>
                  <div className="bar"><div className="fill plant" style={{ width: `${Math.max((item.count / Math.max(...dashboard.openByPlant.map((entry) => entry.count), 1)) * 100, 12)}%` }} /></div>
                  <strong className="plant-count">{item.count}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

 {searchError && (
  <div
    className="dashboard-error-backdrop"
    onClick={() => {
      setSearchError('');
      setTicketSearch('');
    }}
  >
    <div
      className="ticket-error-toast"
      role="alertdialog"
      aria-modal="true"
      aria-label="Ticket search result"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="ticket-error-icon">!</div>

      <div className="toast-message">
        {searchError}
      </div>

      <button
        ref={searchErrorCloseRef}
        type="button"
        className="toast-close"
        aria-label="Close notification"
        title="Close notification"
        onClick={() => {
          setSearchError('');
          setTicketSearch('');
        }}
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  </div>
)}
    </section>
  )
}

function SearchableSelect({ value, onChange, options, placeholder, required = false }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const selectedOption = options.find((option) => option.value === value)
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  const selectOption = (option) => {
    onChange(option.value)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className={`searchable-select${open ? ' open' : ''}`} ref={containerRef}>
      <input
        value={open ? query : selectedOption?.label || ''}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          setQuery('')
          setOpen(true)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && filteredOptions[0]) {
            event.preventDefault()
            selectOption(filteredOptions[0])
          }
        }}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        required={required && !value}
      />
      <span className="searchable-select-arrow" aria-hidden="true" />
      {open && <div className="searchable-select-options" role="listbox">{filteredOptions.length ? filteredOptions.map((option) => <button type="button" role="option" aria-selected={option.value === value} key={option.value} onMouseDown={(event) => event.preventDefault()} onClick={() => selectOption(option)}>{option.label}</button>) : <div className="searchable-select-empty">No matches found</div>}</div>}
    </div>
  )
}

function NewTicketPage() {
  const [plants, setPlants] = useState([])
  const [step, setStep] = useState(1)
  const [isEditingReview, setIsEditingReview] = useState(false)
  const [showRequesterDialog, setShowRequesterDialog] = useState(false)
  const [showMaterialsDialog, setShowMaterialsDialog] = useState(false)
  const [selectedRequesters, setSelectedRequesters] = useState([])
  const [requesterSelection, setRequesterSelection] = useState('')
  const [materialInput, setMaterialInput] = useState('')
  const [materials, setMaterials] = useState([])
  const [description, setDescription] = useState('')
  const [attachments, setAttachments] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const user = useSelector((state) => state.auth.user)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    plantCode: '',
    sourcingWarehouse: '',
    requestType: 'Activation',
    reason: '',
    raisingForAnotherCustomer: 'No',
    customer: '',
    siteName: '',
    equipmentNumber: '',
  })

  const sourcingWarehouses = ['Hamburg Warehouse', 'Rotterdam Warehouse', 'Singapore Warehouse']
  const sites = ['Site A', 'Site B', 'Site C', 'Windfarm North', 'Windfarm South']
  const platforms = ['Platform 1001', 'Platform 1002', 'Platform 2001', 'Platform 2002']
  const companyUsers = [
    { name: 'Jane Anderson', email: 'jane.anderson@company.com' },
    { name: 'Michael Bauer', email: 'michael.bauer@company.com' },
    { name: 'Sofia Popescu', email: 'sofia.popescu@company.com' },
  ]
  const plantOptions = plants.map((plant) => ({ value: plant.code, label: plant.name }))
  const warehouseOptions = sourcingWarehouses.map((warehouse) => ({ value: warehouse, label: warehouse }))
  const requestTypeOptions = ['Activation', 'Activation - RETROFIT', 'Extension', 'Error'].map((type) => ({ value: type, label: type }))
  const reasonOptions = ['Stand Still Turbine', 'Purchase Order Pending', 'Safety issue found during safety inspection'].map((reason) => ({ value: reason, label: reason }))
  const siteOptions = sites.map((site) => ({ value: site, label: site }))
  const platformOptions = platforms.map((platform) => ({ value: platform, label: platform }))

  useEffect(() => {
    apiClient.get(`${API_BASE_URL}/tickets/plants`)
      .then((response) => response.data)
      .then((data) => setPlants(data))
      .catch(() => setPlants([]))
  }, [])

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const isStepOneComplete = Boolean(
    form.plantCode &&
    form.sourcingWarehouse &&
    form.requestType &&
    form.reason &&
    form.raisingForAnotherCustomer &&
    (form.raisingForAnotherCustomer === 'No' || form.customer.trim()) &&
    form.siteName &&
    form.equipmentNumber,
  )

  const addRequester = () => {
    if (!requesterSelection || selectedRequesters.includes(requesterSelection)) return
    setSelectedRequesters((current) => [...current, requesterSelection])
    setRequesterSelection('')
    setShowRequesterDialog(false)
  }

  const addMaterials = () => {
    const parsed = materialInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const columns = line.split(/\s+/)
        return { materialNumber: columns[0], quantity: columns[1] || '1' }
      })
      .slice(0, 50)

    setMaterials(parsed)
    setShowMaterialsDialog(false)
    setMaterialInput('')
  }

  const removeMaterial = (materialNumber) => {
    setMaterials((current) => current.filter((material) => material.materialNumber !== materialNumber))
  }

  const submit = async (event) => {
    event.preventDefault()
    if (step === 1) {
      if (isEditingReview) {
        setStep(4)
        setIsEditingReview(false)
      } else {
        setStep(2)
      }
      return
    }

    if (step === 2) {
      if (materials.length) {
        if (isEditingReview) {
          setStep(4)
          setIsEditingReview(false)
        } else {
          setStep(3)
        }
      }
      return
    }

    if (step === 3) {
      if (description.trim()) {
        setStep(4)
        setIsEditingReview(false)
      }
      return
    }

    if (!materials.length || !description.trim()) return

    setSubmitting(true)
    setSubmitError('')

    try {
      const requester = user?.name || 'Demo User'
      const requesterEmail = user?.email || 'demo.user@company.com'
      const description = [
        `Reason: ${form.reason}`,
        `Sourcing warehouse: ${form.sourcingWarehouse}`,
        `Customer: ${form.raisingForAnotherCustomer === 'Yes' ? form.customer : 'Current customer'}`,
        description.trim(),
        attachments.length ? `Attachments: ${attachments.map((file) => file.name).join(', ')}` : '',
        `Materials: ${materials.map((material) => `${material.materialNumber} x ${material.quantity}`).join(', ')}`,
        selectedRequesters.length ? `Additional requester: ${selectedRequesters.join(', ')}` : '',
      ].filter(Boolean).join('\n')
      const response = await apiClient.post(`${API_BASE_URL}/tickets`, {
        title: form.reason,
        ticketType: form.requestType,
        description,
        requesterName: requester,
        requesterEmail,
        siteName: form.siteName,
        equipmentNumber: form.equipmentNumber,
        priority: 'High',
        plantCode: form.plantCode,
      })
      const created = response.data
      navigate(`/tickets/${created.ticketNumber}`)
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Unable to create this ticket. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page form-page new-ticket-page">
      <header className="page-header compact">
        <div>
          <div className="eyebrow">New ticket</div>
          <h1>Create ticket {step === 1 ? 'details' : 'materials'} | Step {step}</h1>
        </div>
      </header>

      <ol className="wizard-steps" aria-label="Ticket creation progress">
        {['Add details', 'Add materials', 'Add description', 'Review & Submit'].map((label, index) => (
          <li key={label} className={step === index + 1 ? 'active' : step > index + 1 ? 'complete' : ''}>
            <span className="wizard-step-circle">{step > index + 1 ? '✓' : index + 1}</span>
            <span className="wizard-step-label">{label}</span>
          </li>
        ))}
      </ol>

      <form className="panel form-card ticket-wizard" onSubmit={submit}>
        {step === 1 ? (
          <div className="form-grid">
            <label><span>Plant *</span><SearchableSelect value={form.plantCode} onChange={(value) => updateForm('plantCode', value)} options={plantOptions} placeholder="Search plants" required /></label>
            <label><span>Sourcing Warehouse *</span><SearchableSelect value={form.sourcingWarehouse} onChange={(value) => updateForm('sourcingWarehouse', value)} options={warehouseOptions} placeholder="Search warehouses" required /></label>
            <label><span>Request type *</span><SearchableSelect value={form.requestType} onChange={(value) => updateForm('requestType', value)} options={requestTypeOptions} placeholder="Search request types" required /></label>
            <label><span>Reason *</span><SearchableSelect value={form.reason} onChange={(value) => updateForm('reason', value)} options={reasonOptions} placeholder="Search reasons" required /></label>
            <label><span>Site / Base / Windfarm name *</span><SearchableSelect value={form.siteName} onChange={(value) => updateForm('siteName', value)} options={siteOptions} placeholder="Search sites" required /></label>
            <label><span>Platform / Turbine number *</span><SearchableSelect value={form.equipmentNumber} onChange={(value) => updateForm('equipmentNumber', value)} options={platformOptions} placeholder="Search platforms" required /></label>
            <label><span>Are you raising the ticket for another customer? *</span><select value={form.raisingForAnotherCustomer} onChange={(event) => updateForm('raisingForAnotherCustomer', event.target.value)} required><option>No</option><option>Yes</option></select></label>
            {form.raisingForAnotherCustomer === 'Yes' && <label><span>Please specify the customer name/email *</span><input value={form.customer} onChange={(event) => updateForm('customer', event.target.value)} required /></label>}
            <div className="full-width requester-field"><div className="field-label">Additional requester <span className="optional-label">(optional)</span></div><button type="button" className="secondary-button" onClick={() => setShowRequesterDialog(true)}>Add</button>{selectedRequesters.length > 0 && <div className="selected-requester">{selectedRequesters.join(', ')}</div>}</div>
          </div>
        ) : step === 2 ? (
          <div className="materials-step">
            <div className="materials-toolbar"><button type="button" className="primary-button" onClick={() => setShowMaterialsDialog(true)}>Add Materials</button>{materials.length > 0 && <button type="button" className="secondary-button" onClick={() => setMaterials([])}>Clear all</button>}</div>
            <div className="materials-table-wrap"><table className="materials-table"><thead><tr><th>No.</th><th>Material number</th><th>Quantity</th><th>Action</th></tr></thead><tbody>{materials.map((material, index) => <tr key={`${material.materialNumber}-${index}`}><td>{index + 1}.</td><td>{material.materialNumber}</td><td>{material.quantity}</td><td><button type="button" className="table-action" onClick={() => removeMaterial(material.materialNumber)} aria-label={`Remove ${material.materialNumber}`}>Remove</button></td></tr>)}{materials.length === 0 && <tr><td colSpan="4" className="materials-empty">No materials added yet.</td></tr>}</tbody></table></div>
            <p className="materials-hint">Add up to 50 materials. Enter one material number and quantity per line.</p>
          </div>
        ) : step === 3 ? (
          <div className="description-step">
            <label className="full-width"><span>Describe the request *</span><textarea rows="8" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the issue or request" required /></label>
            <div className="attachments-field">
              <div className="field-label">Attachments</div>
              <p className="attachments-empty">{attachments.length ? `${attachments.length} file${attachments.length === 1 ? '' : 's'} attached.` : 'There is nothing attached.'}</p>
              <label className="attachment-upload"><span>Attach file</span><input type="file" multiple onChange={(event) => setAttachments((current) => [...current, ...Array.from(event.target.files || [])])} /></label>
              {attachments.length > 0 && <ul className="attachment-list">{attachments.map((file, index) => <li key={`${file.name}-${index}`}><span>{file.name}</span><button type="button" onClick={() => setAttachments((current) => current.filter((_, fileIndex) => fileIndex !== index))}>Remove</button></li>)}</ul>}
            </div>
          </div>
        ) : (
          <div className="review-step">
            <div className="review-summary"><div><span className="review-summary-kicker">Final review</span><p>Check the information below before submitting your ticket.</p></div></div>
            <section className="review-section">
              <div className="review-section-heading"><div><span className="review-section-step">Step 1</span><h2>Add details</h2></div><button type="button" className="review-edit-button" onClick={() => { setIsEditingReview(true); setStep(1) }}>Edit</button></div>
              <div className="review-grid"><div><span>Plant</span><strong>{plantOptions.find((option) => option.value === form.plantCode)?.label || 'Not selected'}</strong></div><div><span>Sourcing warehouse</span><strong>{form.sourcingWarehouse}</strong></div><div><span>Request type</span><strong>{form.requestType}</strong></div><div><span>Reason</span><strong>{form.reason}</strong></div><div><span>Site / Base / Windfarm</span><strong>{form.siteName}</strong></div><div><span>Platform / Turbine</span><strong>{form.equipmentNumber}</strong></div><div><span>Another customer</span><strong>{form.raisingForAnotherCustomer}</strong></div>{form.raisingForAnotherCustomer === 'Yes' && <div><span>Customer</span><strong>{form.customer}</strong></div>}<div><span>Additional requesters</span><strong>{selectedRequesters.length ? selectedRequesters.join(', ') : 'None'}</strong></div></div>
            </section>
            <section className="review-section"><div className="review-section-heading"><div><span className="review-section-step">Step 2</span><h2>Add materials <span className="review-count">{materials.length}</span></h2></div><button type="button" className="review-edit-button" onClick={() => { setIsEditingReview(true); setStep(2) }}>Edit</button></div><div className="review-material-list">{materials.map((material, index) => <div key={`${material.materialNumber}-${index}`}><span>{index + 1}. {material.materialNumber}</span><strong>{material.quantity} {Number(material.quantity) === 1 ? 'unit' : 'units'}</strong></div>)}</div></section>
            <section className="review-section"><div className="review-section-heading"><div><span className="review-section-step">Step 3</span><h2>Description &amp; attachments</h2></div><button type="button" className="review-edit-button" onClick={() => { setIsEditingReview(true); setStep(3) }}>Edit</button></div><div className="review-content-columns"><div><span className="review-field-label">Description</span><p className="review-description">{description}</p></div><div><span className="review-field-label">Attachments <span className="review-count">{attachments.length}</span></span><div className="review-attachment-list">{attachments.length ? attachments.map((file) => <span key={file.name}>{file.name}</span>) : <span className="review-muted">No attachments</span>}</div></div></div></section>
          </div>
        )}

        {submitError && <div className="form-error" role="alert">{submitError}</div>}
        <div className={`wizard-actions${step === 1 ? ' first-step' : ''}`}>{step > 1 && <button type="button" className="secondary-button" onClick={() => setStep((current) => current - 1)}>Previous</button>}<button type="submit" className="primary-button" disabled={step === 1 ? !isStepOneComplete : step === 2 ? !materials.length : step === 3 ? !description.trim() : submitting}>{submitting ? 'Creating…' : step === 4 ? 'Create ticket' : isEditingReview ? 'Go to submission' : 'Next'}</button></div>
      </form>

      {showRequesterDialog && <div className="modal-backdrop" onClick={() => setShowRequesterDialog(false)}><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="requester-dialog-title" onClick={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setShowRequesterDialog(false)} aria-label="Close">×</button><h2 id="requester-dialog-title">Add additional requester</h2><label><span>Company user</span><SearchableSelect value={requesterSelection} onChange={setRequesterSelection} options={companyUsers.filter((companyUser) => !selectedRequesters.some((requester) => requester.startsWith(companyUser.name))).map((companyUser) => ({ value: `${companyUser.name} (${companyUser.email})`, label: `${companyUser.name} | ${companyUser.email}` }))} placeholder="Search company users" /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowRequesterDialog(false)}>Cancel</button><button type="button" className="primary-button" disabled={!requesterSelection} onClick={addRequester}>Confirm</button></div></div></div>}
      {showMaterialsDialog && <div className="modal-backdrop" onClick={() => setShowMaterialsDialog(false)}><div className="modal-card materials-dialog" role="dialog" aria-modal="true" aria-labelledby="materials-dialog-title" onClick={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setShowMaterialsDialog(false)} aria-label="Close">×</button><h2 id="materials-dialog-title">Add Materials bulk</h2><p>Paste one material number and quantity per line.</p><textarea rows="8" value={materialInput} onChange={(event) => setMaterialInput(event.target.value)} placeholder={'A9B12312313 10\nA9B12312324 20'} autoFocus /><p className="materials-warning">* Please make sure to not add more than 50 materials in one ticket.</p><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowMaterialsDialog(false)}>Cancel</button><button type="button" className="primary-button" disabled={!materialInput.trim()} onClick={addMaterials}>Confirm</button></div></div></div>}
    </section>
  )
}

function TicketListPage({ title, view }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [plantFilter, setPlantFilter] = useState('')
  const [ticketFilter, setTicketFilter] = useState('')
  const [materialFilter, setMaterialFilter] = useState('')

  useEffect(() => {
    let active = true

    apiClient.get(`${API_BASE_URL}/tickets?view=${view}`)
      .then((response) => response.data)
      .then((data) => {
        if (active) setTickets(data)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [view])

  const visible = tickets.filter((ticket) => {
    const plantMatch = !plantFilter || ticket.plantName === plantFilter
    const ticketMatch = !ticketFilter || ticket.ticketNumber === ticketFilter
    const materialMatch = !materialFilter || ticket.title.toLowerCase().includes(materialFilter.toLowerCase())
    return plantMatch && ticketMatch && materialMatch
  })

  const plants = [...new Set(tickets.map((ticket) => ticket.plantName).filter(Boolean))]

  if (loading) {
    return <section className="page"><div className="panel state-panel">Loading tickets...</div></section>
  }

  return (
    <section className="page">
      <header className="page-header compact">
        <div>
          <div className="eyebrow">Tickets</div>
          <h1>{title}</h1>
        </div>
      </header>

      <div className="panel table-card">
        <div className="filters">
          <select value={plantFilter} onChange={(e) => setPlantFilter(e.target.value)}>
            <option value="">Search by plant</option>
            {plants.map((plant) => <option key={plant} value={plant}>{plant}</option>)}
          </select>
          <select value={ticketFilter} onChange={(e) => setTicketFilter(e.target.value)}>
            <option value="">Search by ticket</option>
            {tickets.map((ticket) => <option key={ticket.ticketNumber} value={ticket.ticketNumber}>{ticket.ticketNumber}</option>)}
          </select>
          <input value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)} placeholder="Type material..." />
        </div>

        <div className="table-wrap">
          {visible.length ? (
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Created on</th>
                  <th>Ticket Type</th>
                  <th>Plant</th>
                  <th>Status</th>
                  <th>Title</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((ticket) => (
                  <tr key={ticket.ticketNumber} onClick={() => window.location.href = `/tickets/${ticket.ticketNumber}`}>
                    <td>{ticket.ticketNumber}</td>
                    <td>{new Date(ticket.createdAt).toLocaleString()}</td>
                    <td>{ticket.ticketType}</td>
                    <td>{ticket.plantName}</td>
                    <td>{prettyStatus(ticket.status)}</td>
                    <td>{ticket.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty">No tickets found.</div>
          )}
        </div>
      </div>
    </section>
  )
}

function SearchPage() {
  const [plants, setPlants] = useState([])
  const [results, setResults] = useState([])
  const [filters, setFilters] = useState({ ticket: '', ticketType: '', plant: '', ticketStatus: '', requester: '' })

  useEffect(() => {
    apiClient.get(`${API_BASE_URL}/tickets/plants`)
      .then((response) => response.data)
      .then((data) => setPlants(data))
      .catch(() => setPlants([]))
  }, [])

  useEffect(() => {
    const query = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.append(key, value)
    })

    apiClient.get(`${API_BASE_URL}/tickets/search?${query.toString()}`)
      .then((response) => response.data)
      .then((data) => setResults(data))
      .catch(() => setResults([]))
  }, [filters])

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }))

  return (
    <section className="page">
      <header className="page-header compact">
        <div>
          <div className="eyebrow">Search tickets</div>
          <h1>Search tickets</h1>
        </div>
      </header>

      <div className="filter-grid">
        <label><span>Ticket</span><input value={filters.ticket} onChange={(e) => updateFilter('ticket', e.target.value)} /></label>
        <label><span>Ticket Type</span><select value={filters.ticketType} onChange={(e) => updateFilter('ticketType', e.target.value)}>
          <option value="">All</option>
          <option value="Activation">Activation</option>
          <option value="Material request">Material request</option>
          <option value="Additional requester">Additional requester</option>
        </select></label>
        <label><span>Plant</span><select value={filters.plant} onChange={(e) => updateFilter('plant', e.target.value)}>
          <option value="">All</option>
          {plants.map((plant) => <option key={plant.id} value={plant.name}>{plant.name}</option>)}
        </select></label>
        <label><span>Ticket Status</span><select value={filters.ticketStatus} onChange={(e) => updateFilter('ticketStatus', e.target.value)}>
          <option value="">All</option>
          <option value="NotStarted">Not started</option>
          <option value="InProgress">In progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Cancelled">Cancelled</option>
        </select></label>
        <label><span>Requester</span><input value={filters.requester} onChange={(e) => updateFilter('requester', e.target.value)} /></label>
      </div>

      <div className="panel table-card">
        <div className="table-wrap">
          {results.length ? (
            <table>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Created on</th>
                  <th>Ticket Type</th>
                  <th>Plant</th>
                  <th>Status</th>
                  <th>Title</th>
                </tr>
              </thead>
              <tbody>
                {results.map((ticket) => (
                  <tr key={ticket.ticketNumber} onClick={() => window.location.href = `/tickets/${ticket.ticketNumber}`}>
                    <td>{ticket.ticketNumber}</td>
                    <td>{new Date(ticket.createdAt).toLocaleString()}</td>
                    <td>{ticket.ticketType}</td>
                    <td>{ticket.plantName}</td>
                    <td>{prettyStatus(ticket.status)}</td>
                    <td>{ticket.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty">No results found.</div>
          )}
        </div>
      </div>
    </section>
  )
}

function TicketDetailPage() {
  const { ticketNumber } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    apiClient.get(`${API_BASE_URL}/tickets/${ticketNumber}`)
      .then((response) => response.data)
      .then((data) => setTicket(data))
      .catch((requestError) => {
        setTicket(null)
        setError(requestError.response?.status === 404
          ? `Ticket ${ticketNumber} was not found.`
          : 'Unable to load this ticket. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [ticketNumber])

  useEffect(() => {
    load()
  }, [load])

  const sendComment = async () => {
    if (!comment.trim()) return

    await apiClient.post(`${API_BASE_URL}/tickets/${ticketNumber}/comments`, {
      role: 'REQUESTER',
      message: comment.trim(),
    })

    setComment('')
    load()
  }

  if (loading) {
    return <section className="page"><div className="panel state-panel">Loading ticket...</div></section>
  }

  if (error) {
    return (
      <section className="page detail-page ticket-error-page">
        <div className="ticket-error-backdrop">
          <div className="ticket-error-dialog" role="alertdialog" aria-modal="true" aria-labelledby="ticket-error-title">
            <div className="ticket-error-icon">!</div>
            <div>
              <h2 id="ticket-error-title">Ticket not found</h2>
              <p>{error}</p>
            </div>
            <button type="button" className="primary-button" onClick={() => navigate('/dashboard')}>Back to dashboard</button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page detail-page">
      <div className="detail-header">
        <div className="left-cluster">
          <button type="button" className="back-button" onClick={() => navigate('/dashboard')}>‹</button>
          <h1>{ticket.ticketNumber}</h1>
          <button type="button" className="refresh-button small" onClick={load}>Refresh</button>
        </div>
        <button type="button" className="primary-button small">Action</button>
      </div>

      <div className="info-grid">
        <div><span>Ticket Type</span><strong>{ticket.ticketType}</strong></div>
        <div><span>Ticket Reason</span><strong>{ticket.title}</strong></div>
        <div><span>Status</span><strong>{prettyStatus(ticket.status)}</strong></div>
        <div><span>Requester e-mail</span><strong>{ticket.requesterEmail}</strong></div>
        <div><span>Plant</span><strong>{ticket.plantName}</strong></div>
        <div><span>Platform / Turbine Number</span><strong>{ticket.equipmentNumber || '—'}</strong></div>
        <div><span>Assigned to</span><strong>Support team</strong></div>
        <div><span>Site/base/Windfarm name</span><strong>{ticket.siteName || '—'}</strong></div>
        <div><span>Created on</span><strong>{new Date(ticket.createdAt).toLocaleString()}</strong></div>
        <div><span>Description</span><strong>{ticket.description}</strong></div>
        <div><span>Attachments</span><strong>None</strong></div>
      </div>

      <div className="tabs">
        <button type="button" className="active">Timeline</button>
      </div>

      <div className="panel detail-panel">
        <div className="timeline-box">
          <div className="comment-bubble">
            <div className="comment-author">Requester</div>
            <div className="comment-text">{ticket.description}</div>
          </div>
          {(ticket.comments || []).map((c) => (
            <div className="comment-bubble" key={c.id}>
              <div className="comment-author">{prettyLabel(c.role)}</div>
              <div className="comment-text">{c.message}</div>
            </div>
          ))}
        </div>

        <div className="comment-box">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                sendComment()
              }
            }}
            placeholder="Comment"
          />
          <button type="button" onClick={sendComment}>Send</button>
        </div>
      </div>
    </section>
  )
}

function LinkRow({ ticket }) {
  return (
    <div className="ticket-row clickable-row" onClick={() => window.location.href = `/tickets/${ticket.ticketNumber}`}>
      <span>{ticket.ticketNumber}</span>
      <strong>{ticket.title}</strong>
      <em>{prettyStatus(ticket.status)}</em>
    </div>
  )
}

function prettyStatus(status) {
  return {
    NotStarted: 'Not started',
    InProgress: 'In progress',
    Resolved: 'Closed',
    Cancelled: 'Cancelled',
  }[status] || status
}

function prettyLabel(value) {
  return value.charAt(0) + value.slice(1).toLowerCase()
}

export default App
