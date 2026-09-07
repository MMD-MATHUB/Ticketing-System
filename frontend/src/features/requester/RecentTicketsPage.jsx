import { useEffect, useMemo, useState } from 'react'
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

export function RecentTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [plantFilter, setPlantFilter] = useState('')
  const [ticketFilter, setTicketFilter] = useState('')
  const [materialFilter, setMaterialFilter] = useState('')

  useEffect(() => {
    let active = true

    apiClient.get(`${API_BASE_URL}/tickets`)
      .then((response) => response.data)
      .then((data) => {
        if (active) setTickets(data)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  const sorted = useMemo(
    () => [...tickets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [tickets]
  )

  const visible = sorted.filter((ticket) => {
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

  const plants = [...new Set(tickets.map((ticket) => ticket.plantName).filter(Boolean).sort())]
  const ticketNumbers = [...new Set(tickets.map((ticket) => ticket.ticketNumber).filter(Boolean))]

  const plantFilterOptions = plants.map((plant) => ({ value: plant, label: plant }))
  const ticketFilterOptions = ticketNumbers.map((ticketNumber) => ({ value: ticketNumber, label: ticketNumber }))

  if (loading) {
    return <section className="page"><div className="panel state-panel">Loading tickets...</div></section>
  }

  return (
    <section className="page ticket-list-page">
      <header className="page-header ticket-page-header compact">
        <div>
          <div className="eyebrow">Tickets</div>
          <h1>Recent tickets</h1>
          <p className="ticket-page-subtitle">Your most recently created tickets</p>
        </div>
      </header>

      <div className="panel table-card ticket-table-card">
        <div className="filters">
          <SearchableSelect value={plantFilter} onChange={setPlantFilter} options={plantFilterOptions} placeholder="Search by plant" />
          <SearchableSelect value={ticketFilter} onChange={setTicketFilter} options={ticketFilterOptions} placeholder="Search by ticket" />
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
            <div className="empty">No tickets found.</div>
          )}
        </div>
      </div>
    </section>
  )
}
