import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { LoginPage } from './features/authentication/pages/LoginPage'
import { ApplicationSelectionPage } from './features/authentication/pages/ApplicationSelectionPage'
import { ApplicationRoute } from './shared/routing/ApplicationRoute'
import { ProcessingPage } from './features/processing/ProcessingPage'
import { AnalysisPage } from './features/analysis/AnalysisPage'
import { TicketListPage } from './features/requester/TicketListPage'
import { RecentTicketsPage } from './features/requester/RecentTicketsPage'
import { SearchPage } from './features/requester/SearchPage'
import { SearchableSelect } from './features/requester/SearchableSelect'
import { StyleReferencePage } from './features/shared/StyleReferencePage'
import { CLOSED_CANCELLED_TABS, prettyStatus } from './features/requester/ticketUtils'
import { AppShell } from './app/AppShell'
import apiClient from './api/apiClient'
import { subscribeToLiveUpdates } from './shared/liveUpdates'
import { Button, Panel, PanelSubtitle, PanelTitle, ActionMenu, ActionMenuTrigger, ActionMenuList, ActionMenuItem, ModalBackdrop, ModalCard, ModalClose, ModalActions, Timeline, CommentBubble, CommentBox, KpiCard } from './shared/components/ui'
import './App.css'

const API_BASE_URL = '/api'

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const appName = location.pathname.startsWith('/analysis')
      ? 'Analysis'
      : location.pathname.startsWith('/processing')
        ? 'Processing'
        : location.pathname.startsWith('/choose-app')
          ? 'Choose application'
          : location.pathname === '/login'
            ? 'Sign in'
            : 'Requester'

    document.title = `${appName} | Ticketing System`
  }, [location.pathname])

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
          <Route path="/style-reference" element={<StyleReferencePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tickets/new" element={<NewTicketPage />} />
          <Route path="/tickets/not-started" element={<TicketListPage title="Not started tickets" subtitle="Tickets awaiting processing" view="not-started" />} />
          <Route path="/tickets/in-progress" element={<TicketListPage title="In progress tickets" subtitle="Tickets currently being worked on" view="in-progress" />} />
          <Route path="/tickets/closed" element={<TicketListPage title="Closed / Cancelled tickets" subtitle="Tickets that have been resolved or cancelled" view="closed" tabs={CLOSED_CANCELLED_TABS} />} />
          <Route path="/tickets/pending-reply" element={<TicketListPage title="Pending Requester Comment" subtitle="Tickets waiting for your response" view="pending-reply" />} />
          <Route path="/tickets/recent" element={<RecentTicketsPage />} />
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
  const searchErrorCloseRef = useRef(null)
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
        setError('Cannot connect to the backend on http://localhost:8080. Start the API.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    loadDashboard()
    return subscribeToLiveUpdates(loadDashboard)
  }, [loadDashboard])

  const cards = useMemo(() => {
    if (!dashboard?.stats) return []
    const s = dashboard.stats
    return [
      { eyebrow: 'Queue', title: 'Not started', value: s.notStarted, sub: 'Tickets awaiting processing', color: '#b85c5c', subColor: '#6e6e7c', route: '/tickets/not-started' },
      { eyebrow: 'Active workload', title: 'In progress', value: s.inProgress, sub: `${s.inProgressPercent}% of your tickets are moving`, color: '#d97706', subColor: '#6e6e7c', route: '/tickets/in-progress' },
      { eyebrow: 'Completed', title: 'Closed', value: s.closed, sub: `Average closure time is ${s.avgDaysToClose} days`, color: '#0f9f75', subColor: '#6e6e7c', route: '/tickets/closed' },
      { eyebrow: 'Needs attention', title: 'Pending your reply', value: s.pendingReply, sub: `Oldest waiting reply: ${s.oldestPendingDays} days`, color: '#584cb9', subColor: '#584cb9', route: '/tickets/pending-reply' },
    ]
  }, [dashboard])

  if (loading) {
    return <section className="page"><Panel className="state-panel">Loading dashboard...</Panel></section>
  }

  if (error) {
    return <section className="page"><Panel className="state-panel">{error}</Panel></section>
  }

  return (
    <section className="page dashboard-page requester-dashboard-page">
      <header className="page-header dashboard-header">
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1>{greeting}, {userName}</h1>
          <p className="dashboard-intro">Here's your ticket overview and the items that need attention.</p>
        </div>
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
          <KpiCard key={card.title} className="h-[148px]" onClick={() => navigate(card.route)}>
            <div className="eyebrow">{card.eyebrow}</div>
            <h3 className="mt-[7px] mb-2.5 text-base leading-[1.2] min-[1800px]:text-lg">{card.title}</h3>
            <div className="text-4xl leading-none font-bold min-[1800px]:text-[44px]" style={{ color: card.color }}>{card.value}</div>
            <p className="mt-auto max-w-full text-[13px] leading-[1.4] min-[1800px]:text-sm max-[640px]:overflow-hidden max-[640px]:text-ellipsis max-[640px]:whitespace-nowrap max-[640px]:text-[11px]" style={{ color: card.subColor }}>{card.sub}</p>
          </KpiCard>
        ))}
      </div>

      <div className="grid dashboard-grid">
        <Panel as="section" className="large dashboard-panel recent-panel">
          <div className="panel-heading">
            <div>
              <PanelTitle className="!mb-[5px]">Recent tickets</PanelTitle>
              <PanelSubtitle>Your latest submitted requests</PanelSubtitle>
            </div>
            <Button variant="text" onClick={() => navigate('/tickets/recent')}>View all</Button>
          </div>
          <div className="recent-ticket-list">
            {dashboard.recentTickets.map((ticket) => (
              <LinkRow key={ticket.ticketNumber} ticket={ticket} />
            ))}
          </div>
        </Panel>

        <div className="stack dashboard-insights">
          <Panel as="section" className="dashboard-panel">
            <PanelTitle>Open tickets by priority</PanelTitle>
            <PanelSubtitle>Where your open work is concentrated</PanelSubtitle>
            <div className="dashboard-insight-list">
              {dashboard.openByPriority.map((item) => (
                <div key={item.label} className="bar-row">
                  <span className="label">{prettyLabel(item.label)}</span>
                  <div className="bar"><div className="fill priority" style={{ width: `${Math.max((item.count / Math.max(...dashboard.openByPriority.map((entry) => entry.count), 1)) * 100, 12)}%` }} /></div>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </Panel>

          <Panel as="section" className="dashboard-panel">
            <PanelTitle>Open tickets by plant</PanelTitle>
            <PanelSubtitle>Requests grouped by location</PanelSubtitle>
            <div className="dashboard-insight-list">
              {dashboard.openByPlant.map((item) => (
                <div key={item.label} className="bar-row plant-row">
                  <div className="plant-label"><span className="accent" /><span className="text">{item.label}</span></div>
                  <div className="bar"><div className="fill plant" style={{ width: `${Math.max((item.count / Math.max(...dashboard.openByPlant.map((entry) => entry.count), 1)) * 100, 12)}%` }} /></div>
                  <strong className="plant-count">{item.count}</strong>
                </div>
              ))}
            </div>
          </Panel>
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
    <section className="page content-start gap-7 pt-3 pb-4 box-border">
      <header className="page-header compact">
        <div>
          <div className="eyebrow">New ticket</div>
          <h1>Create ticket {step === 1 ? 'details' : 'materials'} | Step {step}</h1>
        </div>
      </header>

      <ol className="flex gap-0 m-0 p-0 list-none max-[640px]:gap-1" aria-label="Ticket creation progress">
        {['Add details', 'Add materials', 'Add description', 'Review & Submit'].map((label, index, all) => {
          const state = step === index + 1 ? 'active' : step > index + 1 ? 'complete' : ''
          const hasConnector = index !== all.length - 1
          return (
            <li
              key={label}
              className={`relative flex-1 flex flex-col items-center gap-1.5 text-[#18181b] text-center ${hasConnector ? `after:content-[''] after:absolute after:top-[21px] after:left-[calc(50%+24px)] after:w-[calc(100%-48px)] after:h-1 after:bg-[#cfd5d8] max-[640px]:after:top-[18px] max-[640px]:after:left-[calc(50%+20px)] max-[640px]:after:w-[calc(100%-40px)] ${state === 'complete' ? 'after:bg-brand' : ''}` : ''}`}
            >
              <span
                className={`relative z-[1] grid place-items-center w-11 h-11 border-[3px] rounded-full text-lg font-bold max-[640px]:w-[38px] max-[640px]:h-[38px] max-[640px]:text-sm ${
                  state === 'active' ? 'border-brand bg-white text-brand'
                  : state === 'complete' ? 'border-brand bg-brand text-white'
                  : 'border-[#cfd5d8] bg-page text-[#18181b]'
                }`}
              >
                {step > index + 1 ? '✓' : index + 1}
              </span>
              <span className="text-sm font-semibold leading-[1.25] max-[640px]:text-[10px]">{label}</span>
            </li>
          )
        })}
      </ol>

      <Panel as="form" className="grid gap-5" onSubmit={submit}>
        {step === 1 ? (
          <div className="grid grid-cols-2 gap-[18px]">
            <label><span>Plant *</span><SearchableSelect value={form.plantCode} onChange={(value) => updateForm('plantCode', value)} options={plantOptions} placeholder="Search plants" required /></label>
            <label><span>Sourcing Warehouse *</span><SearchableSelect value={form.sourcingWarehouse} onChange={(value) => updateForm('sourcingWarehouse', value)} options={warehouseOptions} placeholder="Search warehouses" required /></label>
            <label><span>Request type *</span><SearchableSelect value={form.requestType} onChange={(value) => updateForm('requestType', value)} options={requestTypeOptions} placeholder="Search request types" required /></label>
            <label><span>Reason *</span><SearchableSelect value={form.reason} onChange={(value) => updateForm('reason', value)} options={reasonOptions} placeholder="Search reasons" required /></label>
            <label><span>Site / Base / Windfarm name *</span><SearchableSelect value={form.siteName} onChange={(value) => updateForm('siteName', value)} options={siteOptions} placeholder="Search sites" required /></label>
            <label><span>Platform / Turbine number *</span><SearchableSelect value={form.equipmentNumber} onChange={(value) => updateForm('equipmentNumber', value)} options={platformOptions} placeholder="Search platforms" required /></label>
            <label><span>Are you raising the ticket for another customer? *</span><select value={form.raisingForAnotherCustomer} onChange={(event) => updateForm('raisingForAnotherCustomer', event.target.value)} required><option>No</option><option>Yes</option></select></label>
            {form.raisingForAnotherCustomer === 'Yes' && <label><span>Please specify the customer name/email *</span><input value={form.customer} onChange={(event) => updateForm('customer', event.target.value)} required /></label>}
            <div className="col-span-full flex items-center flex-wrap gap-x-3.5 gap-y-2.5"><div className="field-label w-full mb-0">Additional requester <span className="text-muted font-normal">(optional)</span></div><Button variant="secondary" onClick={() => setShowRequesterDialog(true)}>Add</Button>{selectedRequesters.length > 0 && <div className="text-[#445877] text-[0.9rem]">{selectedRequesters.join(', ')}</div>}</div>
          </div>
        ) : step === 2 ? (
          <div className="grid gap-[26px]">
            <div className="flex items-center justify-between gap-3 mb-5"><Button variant="primary" onClick={() => setShowMaterialsDialog(true)}>Add Materials</Button>{materials.length > 0 && <Button variant="secondary" onClick={() => setMaterials([])}>Clear all</Button>}</div>
            <div className="overflow-x-auto min-h-[260px] border border-border rounded-[10px]"><table className="min-w-[620px]"><thead><tr><th className="px-3.5 py-[11px] bg-[#f1f1f2] border-t-0 text-[13px] w-16">No.</th><th className="px-3.5 py-[11px] bg-[#f1f1f2] border-t-0 text-[13px]">Material number</th><th className="px-3.5 py-[11px] bg-[#f1f1f2] border-t-0 text-[13px]">Quantity</th><th className="px-3.5 py-[11px] bg-[#f1f1f2] border-t-0 text-[13px] w-[120px] text-center">Action</th></tr></thead><tbody>{materials.map((material, index) => <tr key={`${material.materialNumber}-${index}`}><td className="px-3.5 py-[11px] text-[13px] w-16">{index + 1}.</td><td className="px-3.5 py-[11px] text-[13px]">{material.materialNumber}</td><td className="px-3.5 py-[11px] text-[13px]">{material.quantity}</td><td className="px-3.5 py-[11px] text-[13px] w-[120px] text-center"><button type="button" className="border-0 bg-transparent text-brand cursor-pointer" onClick={() => removeMaterial(material.materialNumber)} aria-label={`Remove ${material.materialNumber}`}>Remove</button></td></tr>)}{materials.length === 0 && <tr><td colSpan="4" className="h-[220px] text-center align-middle text-muted">No materials added yet.</td></tr>}</tbody></table></div>
            <p className="mt-2.5 text-muted text-xs">Add up to 50 materials. Enter one material number and quantity per line.</p>
          </div>
        ) : step === 3 ? (
          <div className="grid gap-3">
            <label className="col-span-full"><span>Describe the request *</span><textarea rows="8" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the issue or request" required /></label>
            <div className="grid gap-3">
              <div className="field-label">Attachments</div>
              <p className="m-0 pl-6 text-muted text-sm">{attachments.length ? `${attachments.length} file${attachments.length === 1 ? '' : 's'} attached.` : 'There is nothing attached.'}</p>
              <label className="inline-flex w-fit flex-row items-center gap-2 py-2 text-heading cursor-pointer before:content-['📎'] before:text-xl"><span>Attach file</span><input className="sr-only" type="file" multiple onChange={(event) => setAttachments((current) => [...current, ...Array.from(event.target.files || [])])} /></label>
              {attachments.length > 0 && <ul className="grid gap-2 m-0 p-0 list-none">{attachments.map((file, index) => <li className="flex items-center justify-between gap-3 max-w-[600px] px-3 py-[9px] border border-border rounded-lg text-[#445877] text-[13px]" key={`${file.name}-${index}`}><span className="overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span><button type="button" className="flex-none border-0 bg-transparent text-brand cursor-pointer" onClick={() => setAttachments((current) => current.filter((_, fileIndex) => fileIndex !== index))}>Remove</button></li>)}</ul>}
            </div>
          </div>
        ) : (
          <div className="grid gap-[18px] min-w-0">
            <div className="flex items-start justify-between gap-[18px] pt-1 pb-[18px] border-b border-[#e7e7ee] max-[640px]:grid"><div><span className="block text-muted text-[11px] font-bold tracking-[0.08em] uppercase">Final review</span><p className="m-0 text-body text-[13px]">Check the information below before submitting your ticket.</p></div></div>
            <section className="pt-[18px] pb-0.5 border-b border-[#e7e7ee]">
              <div className="flex items-center justify-between gap-4 pb-3.5"><div><span className="block text-muted text-[11px] font-bold tracking-[0.08em] uppercase">Step 1</span><h2 className="inline-flex items-center gap-2 mt-1 text-heading text-base font-bold">Add details</h2></div><button type="button" className="border-0 border-b border-current py-0.5 bg-transparent text-brand text-xs font-bold cursor-pointer hover:text-[#3f3593]" onClick={() => { setIsEditingReview(true); setStep(1) }}>Edit</button></div>
              <div className="grid grid-cols-3 gap-x-7 gap-y-4 pb-[18px] min-w-0 max-[640px]:grid-cols-1"><div><span className="block mb-1.5 text-body text-xs font-bold">Plant</span><strong className="text-heading text-sm font-medium [overflow-wrap:anywhere]">{plantOptions.find((option) => option.value === form.plantCode)?.label || 'Not selected'}</strong></div><div><span className="block mb-1.5 text-body text-xs font-bold">Sourcing warehouse</span><strong className="text-heading text-sm font-medium [overflow-wrap:anywhere]">{form.sourcingWarehouse}</strong></div><div><span className="block mb-1.5 text-body text-xs font-bold">Request type</span><strong className="text-heading text-sm font-medium [overflow-wrap:anywhere]">{form.requestType}</strong></div><div><span className="block mb-1.5 text-body text-xs font-bold">Reason</span><strong className="text-heading text-sm font-medium [overflow-wrap:anywhere]">{form.reason}</strong></div><div><span className="block mb-1.5 text-body text-xs font-bold">Site / Base / Windfarm</span><strong className="text-heading text-sm font-medium [overflow-wrap:anywhere]">{form.siteName}</strong></div><div><span className="block mb-1.5 text-body text-xs font-bold">Platform / Turbine</span><strong className="text-heading text-sm font-medium [overflow-wrap:anywhere]">{form.equipmentNumber}</strong></div><div><span className="block mb-1.5 text-body text-xs font-bold">Another customer</span><strong className="text-heading text-sm font-medium [overflow-wrap:anywhere]">{form.raisingForAnotherCustomer}</strong></div>{form.raisingForAnotherCustomer === 'Yes' && <div><span className="block mb-1.5 text-body text-xs font-bold">Customer</span><strong className="text-heading text-sm font-medium [overflow-wrap:anywhere]">{form.customer}</strong></div>}<div><span className="block mb-1.5 text-body text-xs font-bold">Additional requesters</span><strong className="text-heading text-sm font-medium [overflow-wrap:anywhere]">{selectedRequesters.length ? selectedRequesters.join(', ') : 'None'}</strong></div></div>
            </section>
            <section className="pt-[18px] pb-0.5 border-b border-[#e7e7ee]"><div className="flex items-center justify-between gap-4 pb-3.5"><div><span className="block text-muted text-[11px] font-bold tracking-[0.08em] uppercase">Step 2</span><h2 className="inline-flex items-center gap-2 mt-1 text-heading text-base font-bold">Add materials <span className="inline-grid min-w-[20px] h-5 px-1.5 place-items-center rounded-full bg-brand-pale-hover text-brand text-[11px]">{materials.length}</span></h2></div><button type="button" className="border-0 border-b border-current py-0.5 bg-transparent text-brand text-xs font-bold cursor-pointer hover:text-[#3f3593]" onClick={() => { setIsEditingReview(true); setStep(2) }}>Edit</button></div><div className="grid gap-0 w-full pb-4 border border-[#e7e7ee] rounded-[10px] overflow-hidden">{materials.map((material, index) => <div className="flex justify-between gap-5 px-4 py-3 border-b border-border-soft bg-[#fbfbfd] text-sm even:bg-white last:border-b-0" key={`${material.materialNumber}-${index}`}><span>{index + 1}. {material.materialNumber}</span><strong className="text-body font-medium">{material.quantity} {Number(material.quantity) === 1 ? 'unit' : 'units'}</strong></div>)}</div></section>
            <section className="pt-[18px] pb-0.5 border-b border-[#e7e7ee]"><div className="flex items-center justify-between gap-4 pb-3.5"><div><span className="block text-muted text-[11px] font-bold tracking-[0.08em] uppercase">Step 3</span><h2 className="inline-flex items-center gap-2 mt-1 text-heading text-base font-bold">Description &amp; attachments</h2></div><button type="button" className="border-0 border-b border-current py-0.5 bg-transparent text-brand text-xs font-bold cursor-pointer hover:text-[#3f3593]" onClick={() => { setIsEditingReview(true); setStep(3) }}>Edit</button></div><div className="grid grid-cols-1 gap-5 pb-[18px] min-w-0"><div><span className="block text-muted text-[11px] font-bold tracking-[0.08em] uppercase">Description</span><p className="min-w-0 [overflow-wrap:anywhere] m-0 px-3 py-2.5 border-l-[3px] border-brand-pale text-heading text-sm leading-[1.5] whitespace-pre-wrap">{description}</p></div><div><span className="block text-muted text-[11px] font-bold tracking-[0.08em] uppercase">Attachments <span className="inline-grid min-w-[20px] h-5 px-1.5 place-items-center rounded-full bg-brand-pale-hover text-brand text-[11px]">{attachments.length}</span></span><div className="grid gap-1.5 mt-2.5">{attachments.length ? attachments.map((file) => <span className="overflow-hidden px-2.5 py-2 border border-[#e7e7ee] rounded-[7px] text-[#445877] text-[13px] text-ellipsis whitespace-nowrap" key={file.name}>{file.name}</span>) : <span className="text-muted">No attachments</span>}</div></div></div></section>
          </div>
        )}

        {submitError && <div className="text-error text-[13px]" role="alert">{submitError}</div>}
        <div className={`flex items-center gap-3 ${step === 1 ? 'justify-end' : 'justify-between'}`}>{step > 1 && <Button variant="secondary" onClick={() => setStep((current) => current - 1)}>Previous</Button>}<Button type="submit" variant="primary" disabled={step === 1 ? !isStepOneComplete : step === 2 ? !materials.length : step === 3 ? !description.trim() : submitting}>{submitting ? 'Creating…' : step === 4 ? 'Create ticket' : isEditingReview ? 'Go to submission' : 'Next'}</Button></div>
      </Panel>

      {showRequesterDialog && <ModalBackdrop onClick={() => setShowRequesterDialog(false)}><ModalCard role="dialog" aria-modal="true" aria-labelledby="requester-dialog-title" onClick={(event) => event.stopPropagation()}><ModalClose onClick={() => setShowRequesterDialog(false)} /><h2 id="requester-dialog-title" className="m-0 mr-9 mb-5 text-[21px]">Add additional requester</h2><label><span>Company user</span><SearchableSelect value={requesterSelection} onChange={setRequesterSelection} options={companyUsers.filter((companyUser) => !selectedRequesters.some((requester) => requester.startsWith(companyUser.name))).map((companyUser) => ({ value: `${companyUser.name} (${companyUser.email})`, label: `${companyUser.name} | ${companyUser.email}` }))} placeholder="Search company users" /></label><ModalActions><Button variant="secondary" onClick={() => setShowRequesterDialog(false)}>Cancel</Button><Button variant="primary" disabled={!requesterSelection} onClick={addRequester}>Confirm</Button></ModalActions></ModalCard></ModalBackdrop>}
      {showMaterialsDialog && <ModalBackdrop onClick={() => setShowMaterialsDialog(false)}><ModalCard role="dialog" aria-modal="true" aria-labelledby="materials-dialog-title" onClick={(event) => event.stopPropagation()}><ModalClose onClick={() => setShowMaterialsDialog(false)} /><h2 id="materials-dialog-title" className="m-0 mr-9 mb-5 text-[21px]">Add Materials bulk</h2><p className="-mt-2.5 mb-3 text-body text-[13px]">Paste one material number and quantity per line.</p><textarea className="resize-y" rows="8" value={materialInput} onChange={(event) => setMaterialInput(event.target.value)} placeholder={'A9B12312313 10\nA9B12312324 20'} autoFocus /><p className="mt-2.5 text-body text-[13px]">* Please make sure to not add more than 50 materials in one ticket.</p><ModalActions><Button variant="secondary" onClick={() => setShowMaterialsDialog(false)}>Cancel</Button><Button variant="primary" disabled={!materialInput.trim()} onClick={addMaterials}>Confirm</Button></ModalActions></ModalCard></ModalBackdrop>}
    </section>
  )
}

function LegacyTicketListPage({ title, view }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [plantFilter, setPlantFilter] = useState('')
  const [ticketFilter, setTicketFilter] = useState('')
  const [materialFilter, setMaterialFilter] = useState('')

  const loadTickets = useCallback(() => {
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

  useEffect(() => {
    const stopListening = subscribeToLiveUpdates(loadTickets)
    loadTickets()
    return stopListening
  }, [loadTickets])

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

function LegacySearchPage() {
  const [plants, setPlants] = useState([])
  const [results, setResults] = useState([])
  const [filters, setFilters] = useState({ ticket: '', ticketType: '', plant: '', ticketStatus: '', requester: '' })

  const loadPlants = useCallback(() => {
    apiClient.get(`${API_BASE_URL}/tickets/plants`)
      .then((response) => response.data)
      .then((data) => setPlants(data))
      .catch(() => setPlants([]))
  }, [])

  const loadResults = useCallback(() => {
    const query = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query.append(key, value)
    })

    apiClient.get(`${API_BASE_URL}/tickets/search?${query.toString()}`)
      .then((response) => response.data)
      .then((data) => setResults(data))
      .catch(() => setResults([]))
  }, [filters])

  useEffect(() => {
    loadPlants()
    return subscribeToLiveUpdates(loadResults)
  }, [loadPlants, loadResults])

  useEffect(() => {
    loadResults()
  }, [loadResults])

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
  const actionMenuRef = useRef(null)
  const timelineBoxRef = useRef(null)
  const [ticket, setTicket] = useState(null)
  const [comment, setComment] = useState('')
  const [timelineComments, setTimelineComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMenuOpen, setActionMenuOpen] = useState(false)

  const load = useCallback(() => {
    apiClient.get(`${API_BASE_URL}/tickets/${ticketNumber}`)
      .then((response) => response.data)
      .then((data) => {
        setTicket(data)
        setTimelineComments([
          { author: 'Requester', message: data.description },
          ...(data.comments || []).map((c) => ({ author: prettyLabel(c.role), message: c.message })),
        ])
      })
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
    return subscribeToLiveUpdates(load)
  }, [load])

  useEffect(() => {
    if (timelineBoxRef.current) {
      timelineBoxRef.current.scrollTo({
        top: timelineBoxRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [timelineComments])

  useEffect(() => {
    if (!actionMenuOpen) return undefined

    const closeActionMenu = (event) => {
      if (!actionMenuRef.current?.contains(event.target)) {
        setActionMenuOpen(false)
      }
    }
    const closeActionMenuOnEscape = (event) => {
      if (event.key === 'Escape') setActionMenuOpen(false)
    }

    document.addEventListener('mousedown', closeActionMenu)
    document.addEventListener('keydown', closeActionMenuOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeActionMenu)
      document.removeEventListener('keydown', closeActionMenuOnEscape)
    }
  }, [actionMenuOpen])

  const sendComment = async () => {
    if (!comment.trim()) return

    await apiClient.post(`${API_BASE_URL}/tickets/${ticketNumber}/comments`, {
      role: 'REQUESTER',
      message: comment.trim(),
    })

    setComment('')
    load()
  }

  const selectAction = async (action) => {
    await apiClient.post(`${API_BASE_URL}/tickets/${ticketNumber}/comments`, {
      role: 'REQUESTER',
      message: `The requester has selected ${action}.`,
    })

    setActionMenuOpen(false)
    load()
  }

  if (loading) {
    return <section className="page"><Panel className="state-panel">Loading ticket...</Panel></section>
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
            <Button variant="primary" className="col-start-2 justify-self-start !px-[13px] !py-[9px] !text-[13px]" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page detail-page">
      <div className="detail-header">
        <div className="left-cluster">
          <button type="button" className="back-button" aria-label="Back to dashboard" onClick={() => navigate('/dashboard')}>
            <span className="back-chevron" aria-hidden="true" />
          </button>
          <h1>{ticket.ticketNumber}</h1>
        </div>
        <ActionMenu ref={actionMenuRef}>
          <ActionMenuTrigger open={actionMenuOpen} onClick={() => setActionMenuOpen((open) => !open)}>
            Action
          </ActionMenuTrigger>
          {actionMenuOpen && (
            <ActionMenuList>
              {['Action 1', 'Action 2', 'Action 3'].map((action) => (
                <ActionMenuItem key={action} onClick={() => selectAction(action)}>{action}</ActionMenuItem>
              ))}
            </ActionMenuList>
          )}
        </ActionMenu>
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
        <button type="button" className="active"><span className="timeline-tab-label">Timeline</span></button>
      </div>

      <Panel className="detail-panel">
        <Timeline ref={timelineBoxRef}>
          {timelineComments.map((timelineComment, index) => (
            <CommentBubble author={timelineComment.author} key={`${timelineComment.message}-${index}`}>
              {timelineComment.message}
            </CommentBubble>
          ))}
        </Timeline>

        <CommentBox>
          <input
            className="flex-1"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                sendComment()
              }
            }}
            placeholder="Comment"
          />
          <button type="button" className="w-24 border-0 rounded-xl bg-brand text-white font-semibold cursor-pointer" onClick={sendComment}>Send</button>
        </CommentBox>
      </Panel>
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

function prettyLabel(value) {
  return value.charAt(0) + value.slice(1).toLowerCase()
}

export default App
