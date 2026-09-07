import { useEffect, useState } from 'react'
import apiClient from '../../api/apiClient'
import { SearchableSelect } from './SearchableSelect'
import {
  API_BASE_URL,
  getEscalationValue,
  getMaterialsValue,
  getSourcingCountry,
  prettyStatus,
  truncateText,
} from './ticketUtils'

export function TicketListPage({ title, subtitle, view, tabs }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [plantFilter, setPlantFilter] = useState('')
  const [ticketFilter, setTicketFilter] = useState('')
  const [materialFilter, setMaterialFilter] = useState('')
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.key ?? null)
  const [refreshIndex, setRefreshIndex] = useState(0)

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
  }, [view, refreshIndex])

  const activeTabConfig = tabs?.find((tab) => tab.key === activeTab)
  const tabTickets = activeTabConfig ? tickets.filter((ticket) => activeTabConfig.statuses.includes(ticket.status)) : tickets

  const visible = tabTickets.filter((ticket) => {
    const plantMatch = !plantFilter || ticket.plantName === plantFilter
    const ticketMatch = !ticketFilter || ticket.ticketNumber === ticketFilter
    const normalizedMaterialQuery = materialFilter.trim().toLowerCase()
    const searchableRowText = [
      ticket.title,
      ticket.ticketType,
      ticket.plantName,
      ticket.ticketNumber,
      ticket.description || '',
      prettyStatus(ticket.status),
    ].join(' ').toLowerCase()
    const materialMatch = !normalizedMaterialQuery || searchableRowText.includes(normalizedMaterialQuery)
    return plantMatch && ticketMatch && materialMatch
  })

  const plants = [...new Set(tabTickets.map((ticket) => ticket.plantName).filter(Boolean).sort())]
  const ticketNumbers = [...new Set(tabTickets.map((ticket) => ticket.ticketNumber).filter(Boolean))]

  if (loading) {
    return <section className="page"><div className="panel state-panel">Loading tickets...</div></section>
  }

  return (
    <section className="page ticket-list-page">
      <header className="page-header ticket-page-header compact">
        <div>
          <div className="eyebrow">Tickets</div>
          <div className="ticket-title-row">
            <h1>{title}</h1>
            {tabs && (
              <div className="ticket-status-tabs" role="tablist" aria-label="Ticket state">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.key}
                    className={activeTab === tab.key ? 'active' : ''}
                    onClick={() => { setActiveTab((current) => (current === tab.key ? null : tab.key)); setPlantFilter(''); setTicketFilter(''); setMaterialFilter('') }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {subtitle && <p className="ticket-page-subtitle">{subtitle}</p>}
        </div>
        {tabs && <button type="button" className="refresh-button" onClick={() => { setLoading(true); setRefreshIndex((current) => current + 1) }}>Refresh</button>}
      </header>

      <div className="panel table-card ticket-table-card">
        <div className="filters">
          <label>
            <span>Plant</span>
            <SearchableSelect value={plantFilter} onChange={setPlantFilter} options={plants.map((plant) => ({ value: plant, label: plant }))} placeholder="Search plants" />
          </label>
          <label>
            <span>Ticket</span>
            <SearchableSelect value={ticketFilter} onChange={setTicketFilter} options={ticketNumbers.map((ticketNumber) => ({ value: ticketNumber, label: ticketNumber }))} placeholder="Search tickets" />
          </label>
          <label>
            <span>Material</span>
            <input value={materialFilter} onChange={(e) => setMaterialFilter(e.target.value)} placeholder="Type material..." />
          </label>
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
                  <th>Materials</th>
                  <th>Ticket Reason</th>
                  <th>Site/Base/Windfarm name</th>
                  <th>Platform/Turbine number</th>
                  <th>Sourcing Country</th>
                  <th>Description</th>
                  <th>Modified on</th>
                  <th>Is Escalated</th>
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
                    <td>{getMaterialsValue(ticket)}</td>
                    <td>{ticket.title}</td>
                    <td>{ticket.siteName || '—'}</td>
                    <td>{ticket.equipmentNumber || '—'}</td>
                    <td>{getSourcingCountry(ticket)}</td>
                    <td>{truncateText(ticket.description || '—', 60)}</td>
                    <td>{new Date(ticket.updatedAt).toLocaleString()}</td>
                    <td>{getEscalationValue(ticket)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty">No {activeTabConfig ? activeTabConfig.label.toLowerCase() : 'tickets'} found.</div>
          )}
        </div>
      </div>
    </section>
  )
}
