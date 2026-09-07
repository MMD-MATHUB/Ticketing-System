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

function NewTicketPage() {
  const [plants, setPlants] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    ticketType: 'Activation',
    description: '',
    requesterName: 'Diana Stratan',
    requesterEmail: 'diana.stratan@company.com',
    siteName: '',
    equipmentNumber: '',
    priority: 'High',
    plantCode: '20S1',
  })

  useEffect(() => {
    apiClient.get(`${API_BASE_URL}/tickets/plants`)
      .then((response) => response.data)
      .then((data) => setPlants(data))
      .catch(() => setPlants([]))
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const response = await apiClient.post(`${API_BASE_URL}/tickets`, { ...form, plantCode: form.plantCode })
      const created = response.data
      navigate(`/tickets/${created.ticketNumber}`)
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page form-page">
      <header className="page-header compact">
        <div>
          <div className="eyebrow">New ticket</div>
          <h1>Create a new maintenance ticket</h1>
        </div>
      </header>

      <form className="panel form-card" onSubmit={submit}>
        <div className="form-grid">
          <label>
            <span>Plant *</span>
            <select value={form.plantCode} onChange={(e) => setForm({ ...form, plantCode: e.target.value })}>
              {plants.map((plant) => (
                <option key={plant.id} value={plant.code}>{plant.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Priority *</span>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </label>
          <label className="full-width">
            <span>Reason *</span>
            <select value={form.ticketType} onChange={(e) => setForm({ ...form, ticketType: e.target.value })}>
              <option value="Activation">Activation</option>
              <option value="Material request">Material request</option>
              <option value="Additional requester">Additional requester</option>
              <option value="Downgrading">Downgrading</option>
            </select>
          </label>
          <label>
            <span>Site / Base / Location name</span>
            <input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} placeholder="Enter site or location name" />
          </label>
          <label>
            <span>Platform / Equipment number</span>
            <input value={form.equipmentNumber} onChange={(e) => setForm({ ...form, equipmentNumber: e.target.value })} placeholder="Enter platform or equipment number" />
          </label>
          <label className="full-width">
            <span>Description *</span>
            <textarea rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue or request" required />
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit'}</button>
        </div>
      </form>
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
        </div>

        <div className="comment-box">
          <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comment" />
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
