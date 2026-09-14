import { useCallback, useEffect, useMemo, useState } from 'react'
import apiClient from '../../api/apiClient'
import { applications } from '../../shared/applications/applicationCatalog'
import { subscribeToLiveUpdates } from '../../shared/liveUpdates'
import { SearchableSelect } from '../requester/SearchableSelect'
import { getEscalationValue, getMaterialsValue, getSourcingCountry, matchesTicketView, prettyStatus, truncateText } from '../requester/ticketUtils'
import { Badge, Button, Panel, PanelSubtitle, PanelTitle, Tab, TabGroup, KpiCard } from '../../shared/components/ui'
import { useNavigate, useSearchParams } from 'react-router-dom'

const analysisViewConfig = {
  'not-started': { title: 'Not Started Tickets', description: 'Tickets awaiting analysis', matches: (ticket) => matchesTicketView(ticket, 'not-started') },
  'in-progress': { title: 'In Progress Tickets', description: 'Analysis currently underway', matches: (ticket) => matchesTicketView(ticket, 'in-progress') },
  'my-analysis-tasks': { title: 'My Analysis Tasks', description: 'Not-started tickets assigned for analysis', matches: (ticket) => matchesTicketView(ticket, 'not-started') },
  're-analyse-tasks': { title: 'Re-analyse Tasks', description: 'In-progress tickets needing another review', matches: (ticket) => matchesTicketView(ticket, 'in-progress') },
  'pending-handler-action': { title: 'Pending Handler Action', description: 'Waiting for handler input', matches: (ticket) => matchesTicketView(ticket, 'pending-handler-action') },
  'processed-today': { title: 'Processed Today', description: 'Completed during this day', matches: (ticket) => new Date(ticket.updatedAt).toDateString() === new Date().toDateString() },
  cancelled: { title: 'Cancellation Requests/Cancelled tickets', description: 'Closed or awaiting cancellation', matches: (ticket) => matchesTicketView(ticket, 'cancelled') },
}

function getAnalysisTickets(tickets, view) {
  return tickets.filter(analysisViewConfig[view]?.matches || (() => true))
}

function getShare(tickets, view) {
  if (!tickets.length) return 0
  return Math.round((getAnalysisTickets(tickets, view).length / tickets.length) * 100)
}

export function AnalysisPage() {
  const application = applications.analysis
  const [overview, setOverview] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [analysisTickets, setAnalysisTickets] = useState([])
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const view = searchParams.get('view')

  const loadOverview = () => {
    apiClient.get('/api/analysis/overview')
      .then((response) => setOverview(response.data))
      .catch(() => setError('Unable to load analysis data.'))
  }

  useEffect(() => {
    loadOverview()
    const loadTickets = () => {
      apiClient.get('/api/tickets').then((response) => setAnalysisTickets(response.data))
    }
    loadTickets()
    return subscribeToLiveUpdates(() => {
      loadOverview()
      loadTickets()
    })
  }, [])

  const searchTicket = async (event) => {
    event.preventDefault()
    if (!search.trim()) return

    try {
      const response = await apiClient.get(`/api/tickets/search?ticket=${encodeURIComponent(search.trim())}`)
      const ticket = response.data[0]
      if (ticket) {
        navigate(`/tickets/${ticket.ticketNumber}`)
      } else {
        setError(`No ticket found for "${search.trim()}".`)
      }
    } catch {
      setError('Unable to search for this ticket.')
    }
  }

  const cards = [
    ['Not Started Tickets', getAnalysisTickets(analysisTickets, 'not-started').length, `${getShare(analysisTickets, 'not-started')}% of tickets awaiting analysis`, '#b85c5c', '/analysis?view=not-started'],
    ['In Progress Tickets', getAnalysisTickets(analysisTickets, 'in-progress').length, `${getShare(analysisTickets, 'in-progress')}% currently in progress`, '#d97706', '/analysis?view=in-progress'],
    ['My Analysis Tasks', getAnalysisTickets(analysisTickets, 'my-analysis-tasks').length, 'Tasks assigned to me', '#584cb9', '/analysis?view=my-analysis-tasks'],
    ['Re-analyse Tasks', getAnalysisTickets(analysisTickets, 're-analyse-tasks').length, 'Tickets needing another review', '#584cb9', '/analysis?view=re-analyse-tasks'],
    ['Pending Handler Action', getAnalysisTickets(analysisTickets, 'pending-handler-action').length, `${getShare(analysisTickets, 'pending-handler-action')}% waiting for handler input`, '#d97706', '/analysis?view=pending-handler-action'],
    ['Processed Today', getAnalysisTickets(analysisTickets, 'processed-today').length, 'Completed during this day', '#0f9f75', '/analysis?view=processed-today'],
    ['Cancellation Requests/Cancelled tickets', `${analysisTickets.filter((ticket) => ticket.status === 'Resolved').length} | ${analysisTickets.filter((ticket) => ticket.status === 'Cancelled').length}`, 'Cancellation requests | Cancelled tickets', '#b85c5c', '/analysis?view=cancelled'],
  ]

  if (view) {
    return <AnalysisTicketPage view={view} />
  }

  return (
    <section className="page dashboard-page analysis-dashboard-page">
      <header className="page-header dashboard-header">
        <div>
          <div className="eyebrow">Analysis</div>
          <div className="analysis-dashboard-title-row">
            <h1>Dashboard</h1>
            <span className="analysis-app-tag">Analysis</span>
          </div>
          <p className="dashboard-intro">{application.description}</p>
        </div>
      </header>
      <div className="dashboard-tools">
        <form className="search dashboard-search analysis-dashboard-search" onSubmit={searchTicket}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tickets" aria-label="Search tickets" />
          <button type="submit">Search</button>
        </form>
      </div>
      {error && <Panel className="state-panel">{error}</Panel>}
      {overview && (
        <>
          <div className="kpis dashboard-kpis analysis-dashboard-kpis">
            {cards.map(([title, value, sub, color, route]) => (
              <KpiCard
                className="analysis-dashboard-card h-[150px]"
                key={title}
                role="link"
                tabIndex="0"
                onClick={() => navigate(route)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    navigate(route)
                  }
                }}
              >
                <div className="eyebrow">Analysis</div>
                <h3 className="min-h-[38px] mt-[7px] mb-2.5 text-[15px] leading-[1.2] whitespace-nowrap">{title === 'Cancellation Requests/Cancelled tickets' ? <>Cancellation Requests/<br />Cancelled tickets</> : title}</h3>
                <div className="text-4xl leading-none font-bold" style={{ color }}>{value}</div>
                <p className={`mt-auto min-h-[18px] max-w-full text-[#6e6e7c] text-[13px] leading-[1.4] [overflow-wrap:anywhere] line-clamp-2${title === 'Re-analyse Tasks' ? ' whitespace-nowrap' : ''}`}>{sub}</p>
              </KpiCard>
            ))}
          </div>
          <div className="grid dashboard-grid">
            <Panel as="section"><PanelTitle>Tickets by priority</PanelTitle>{overview.byPriority.map((item) => <div className="bar-row" key={item.label}><span className="label">{item.label}</span><div className="bar"><div className="fill" style={{ width: `${Math.max((item.count / Math.max(...overview.byPriority.map((entry) => entry.count), 1)) * 100, 12)}%` }} /></div><strong>{item.count}</strong></div>)}</Panel>
            <Panel as="section"><PanelTitle>Open tickets by plant</PanelTitle><PanelSubtitle>Requests grouped by location</PanelSubtitle>{overview.byPlant.map((item) => <div className="bar-row plant-row" key={item.label}><div className="plant-label"><span className="accent" /><span className="text">{item.label}</span></div><div className="bar"><div className="fill plant" style={{ width: `${Math.max((item.count / Math.max(...overview.byPlant.map((entry) => entry.count), 1)) * 100, 12)}%` }} /></div><strong className="plant-count">{item.count}</strong></div>)}</Panel>
          </div>
        </>
      )}
    </section>
  )
}

function AnalysisTicketPage({ view }) {
  const [tickets, setTickets] = useState([])
  const [analysisTasks, setAnalysisTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [plantFilter, setPlantFilter] = useState('')
  const [ticketFilter, setTicketFilter] = useState('')
  const [textFilter, setTextFilter] = useState('')
  const [selectedTickets, setSelectedTickets] = useState([])
  const [assigning, setAssigning] = useState(false)
  const [processedMode, setProcessedMode] = useState('tickets')
  const [cancellationMode, setCancellationMode] = useState('closed')

  const loadTickets = useCallback(() => {
    let active = true

    apiClient.get('/api/tickets')
      .then((response) => {
        if (active) setTickets(response.data)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    apiClient.get('/api/analysis/tasks').then((response) => {
      if (active) setAnalysisTasks(response.data)
    })

    return () => { active = false }
  }, [])

  useEffect(() => {
    loadTickets()
    return subscribeToLiveUpdates(loadTickets)
  }, [loadTickets])

  const viewConfig = analysisViewConfig[view] || { title: 'Analysis tickets', description: 'Analysis work queue', matches: () => true }
  const isProcessedToday = view === 'processed-today'
  const today = new Date().toDateString()
  const processedTasks = analysisTasks.filter((task) => new Date(task.createdAt).toDateString() === today)

  const scopedTickets = useMemo(() => {
    const analysisTickets = getAnalysisTickets(tickets, view)
    if (view !== 'cancelled') return analysisTickets
    return analysisTickets.filter((ticket) => cancellationMode === 'closed' ? ticket.status === 'Resolved' : ticket.status === 'Cancelled')
  }, [tickets, view, cancellationMode])
  const plants = [...new Set(scopedTickets.map((ticket) => ticket.plantName).filter(Boolean).sort())]
  const ticketNumbers = [...new Set(scopedTickets.map((ticket) => ticket.ticketNumber).filter(Boolean))]
  const filteredTickets = scopedTickets.filter((ticket) => {
    const searchable = [ticket.ticketNumber, ticket.title, ticket.description, ticket.plantName, prettyStatus(ticket.status)].join(' ').toLowerCase()
    return (!plantFilter || ticket.plantName === plantFilter)
      && (!ticketFilter || ticket.ticketNumber === ticketFilter)
      && (!textFilter || searchable.includes(textFilter.trim().toLowerCase()))
  })
  const latestTaskDateByTicket = new Map(analysisTasks.map((task) => [task.ticketNumber, new Date(task.createdAt).getTime()]))
  const visibleTickets = view === 'in-progress'
    ? [...filteredTickets].sort((left, right) => {
      const leftDate = latestTaskDateByTicket.get(left.ticketNumber) || new Date(left.updatedAt).getTime()
      const rightDate = latestTaskDateByTicket.get(right.ticketNumber) || new Date(right.updatedAt).getTime()
      return rightDate - leftDate
    })
    : filteredTickets
  const visibleTasks = processedTasks.filter((task) => {
    const searchable = [task.taskNumber, task.ticketNumber, task.title, task.plantName, task.materialNumber].join(' ').toLowerCase()
    return (!plantFilter || task.plantName === plantFilter)
      && (!ticketFilter || task.ticketNumber === ticketFilter)
      && (!textFilter || searchable.includes(textFilter.trim().toLowerCase()))
  })
  const processedPlantOptions = [...new Set(processedMode === 'tasks' ? processedTasks.map((task) => task.plantName).filter(Boolean) : plants)]
  const processedTicketOptions = [...new Set(processedMode === 'tasks' ? processedTasks.map((task) => task.ticketNumber).filter(Boolean) : ticketNumbers)]
  const taskNumbersByTicket = new Map(analysisTasks.reduce((entries, task) => {
    const current = entries.get(task.ticketNumber) || []
    entries.set(task.ticketNumber, [...current, task.taskNumber])
    return entries
  }, new Map()))
  const showTaskNumber = view === 're-analyse-tasks' || view === 'my-analysis-tasks'
  const displayTicketStatus = (ticket) => view === 'cancelled' && cancellationMode === 'closed'
    ? 'Cancellation requested'
    : prettyStatus(ticket.status)
  const getTaskNumbers = (ticket) => {
    const taskNumbers = taskNumbersByTicket.get(ticket.ticketNumber) || []
    if (taskNumbers.length) return taskNumbers.join(', ')
    const generatedNumber = 700000 + (ticket.id * 17)
    return `SMD-TSK-${generatedNumber}`
  }

  const isAssignable = view === 'not-started'
  const allVisibleSelected = visibleTickets.length > 0 && visibleTickets.every((ticket) => selectedTickets.includes(ticket.ticketNumber))
  const toggleTicket = (ticketNumber) => setSelectedTickets((current) => current.includes(ticketNumber) ? current.filter((number) => number !== ticketNumber) : [...current, ticketNumber])
  const toggleAllVisible = () => setSelectedTickets((current) => allVisibleSelected
    ? current.filter((number) => !visibleTickets.some((ticket) => ticket.ticketNumber === number))
    : [...new Set([...current, ...visibleTickets.map((ticket) => ticket.ticketNumber)])])

  const assignToMe = async () => {
    if (!selectedTickets.length) return
    setAssigning(true)
    try {
      await apiClient.post('/api/analysis/assign', { ticketNumbers: selectedTickets })
      setSelectedTickets([])
      loadTickets()
    } catch {
    } finally {
      setAssigning(false)
    }
  }

  if (loading) return <section className="page"><Panel className="state-panel">Loading analysis tickets...</Panel></section>

  return (
    <section className="page ticket-list-page analysis-ticket-page">
      <header className="page-header ticket-page-header compact">
        <div>
          <div className="eyebrow">Analysis</div>
          <div className="ticket-title-row">
            <h1>{viewConfig.title}</h1>
            <span className="analysis-app-tag">Analysis</span>
            {view === 'cancelled' && <TabGroup className="mt-2" aria-label="Closed and cancelled tickets">
              <Tab active={cancellationMode === 'closed'} onClick={() => setCancellationMode('closed')}>Cancellation requests</Tab>
              <Tab active={cancellationMode === 'cancelled'} onClick={() => setCancellationMode('cancelled')}>Cancelled tickets</Tab>
            </TabGroup>}
            {isProcessedToday && <TabGroup className="mt-2 ml-auto" aria-label="Processed today view">
              <Tab active={processedMode === 'tickets'} onClick={() => setProcessedMode('tickets')}>Tickets <Badge>{filteredTickets.length}</Badge></Tab>
              <Tab active={processedMode === 'tasks'} onClick={() => setProcessedMode('tasks')}>Tasks <Badge>{processedTasks.length}</Badge></Tab>
            </TabGroup>}
          </div>
          <p className="ticket-page-subtitle">{viewConfig.description}</p>
        </div>
      </header>

      <Panel className="table-card ticket-table-card">
        <div className={`filters${isAssignable && selectedTickets.length > 0 ? ' analysis-assignment-filters' : ''}`}>
          <label><span>Plant</span><SearchableSelect value={plantFilter} onChange={setPlantFilter} options={processedPlantOptions.map((plant) => ({ value: plant, label: plant }))} placeholder="Search plants" /></label>
          <label><span>Ticket</span><SearchableSelect value={ticketFilter} onChange={setTicketFilter} options={processedTicketOptions.map((number) => ({ value: number, label: number }))} placeholder="Search tickets" /></label>
          <label><span>Search</span><input value={textFilter} onChange={(event) => setTextFilter(event.target.value)} placeholder="Search analysis tickets" /></label>
          {isAssignable && selectedTickets.length > 0 && <div className="analysis-assignment-actions"><Button variant="secondary" onClick={toggleAllVisible}>{allVisibleSelected ? 'Deselect all' : 'Select all'}</Button><Button variant="primary" disabled={assigning} onClick={assignToMe}>{assigning ? 'Assigning…' : 'Assign'}</Button></div>}
        </div>
        <div className="table-wrap">
          {(processedMode === 'tasks' ? visibleTasks.length : visibleTickets.length) ? (
            <table>
              {processedMode === 'tasks' ? <><thead><tr><th>Task number</th><th>Ticket</th><th>Plant</th><th>Material</th><th>Title</th><th>Created on</th></tr></thead><tbody>{visibleTasks.map((task) => <tr key={task.taskNumber}><td>{task.taskNumber}</td><td>{task.ticketNumber}</td><td>{task.plantName}</td><td>{task.materialNumber}</td><td>{task.title}</td><td>{new Date(task.createdAt).toLocaleString()}</td></tr>)}</tbody></> : <><thead><tr>{isAssignable && <th>Select</th>}{showTaskNumber && <th>Task number</th>}<th>Ticket</th><th>Created on</th><th>Ticket Type</th><th>Plant</th><th>Status</th><th>Materials</th><th>Ticket Reason</th><th>Site/Base/Windfarm name</th><th>Platform/Turbine number</th><th>Sourcing Country</th><th>Description</th><th>Modified on</th><th>Is Escalated</th></tr></thead>
              <tbody>{visibleTickets.map((ticket) => <tr key={ticket.ticketNumber} onClick={() => { if (!isAssignable) window.location.href = `/tickets/${ticket.ticketNumber}` }}>
                {isAssignable && <td><input type="checkbox" checked={selectedTickets.includes(ticket.ticketNumber)} onChange={() => toggleTicket(ticket.ticketNumber)} onClick={(event) => event.stopPropagation()} aria-label={`Select ${ticket.ticketNumber}`} /></td>}{showTaskNumber && <td>{getTaskNumbers(ticket)}</td>}<td>{ticket.ticketNumber}</td><td>{new Date(ticket.createdAt).toLocaleString()}</td><td>{ticket.ticketType}</td><td>{ticket.plantName}</td><td>{displayTicketStatus(ticket)}</td><td>{getMaterialsValue(ticket)}</td><td>{ticket.title}</td><td>{ticket.siteName || '—'}</td><td>{ticket.equipmentNumber || '—'}</td><td>{getSourcingCountry(ticket)}</td><td>{truncateText(ticket.description || '—', 60)}</td><td>{new Date(ticket.updatedAt).toLocaleString()}</td><td>{getEscalationValue(ticket)}</td>
              </tr>)}</tbody></>}
            </table>
          ) : <div className="empty">No tickets found.</div>}
        </div>
      </Panel>
    </section>
  )
}
