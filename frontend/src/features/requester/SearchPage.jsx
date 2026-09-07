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

export function SearchPage() {
  const [plants, setPlants] = useState([])
  const [tickets, setTickets] = useState([])
  const [requesters, setRequesters] = useState([])
  const [results, setResults] = useState([])
  const [filters, setFilters] = useState({ ticket: '', ticketType: '', plant: '', ticketStatus: '', requester: '' })

  useEffect(() => {
    apiClient.get(`${API_BASE_URL}/tickets/plants`)
      .then((response) => response.data)
      .then((data) => setPlants(data))
      .catch(() => setPlants([]))
  }, [])

  useEffect(() => {
    apiClient.get(`${API_BASE_URL}/tickets`)
      .then((response) => response.data)
      .then((data) => {
        setTickets(data)
        setRequesters([...new Set(data.map((ticket) => ticket.requesterName).filter(Boolean).sort())])
      })
      .catch(() => {
        setTickets([])
        setRequesters([])
      })
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

  const ticketOptions = tickets.map((ticket) => ({
    value: ticket.ticketNumber,
    label: ticket.ticketNumber,
  }))

  const plantOptions = plants.map((plant) => ({
    value: plant.name,
    label: plant.name,
  }))

  const ticketTypeOptions = ['Activation', 'Material request', 'Additional requester'].map((type) => ({
    value: type,
    label: type,
  }))

  const ticketStatusOptions = ['NotStarted', 'InProgress', 'Resolved', 'Cancelled'].map((status) => ({
    value: status,
    label: prettyStatus(status),
  }))

  const requesterOptions = requesters.map((requester) => ({
    value: requester,
    label: requester,
  }))

  return (
    <section className="page">
      <header className="page-header compact">
        <div>
          <div className="eyebrow">Search tickets</div>
          <h1>Search tickets</h1>
        </div>
      </header>

      <div className="filter-grid">
        <label>
          <span>Ticket</span>
          <SearchableSelect value={filters.ticket} onChange={(value) => updateFilter('ticket', value)} options={ticketOptions} placeholder="Search tickets" />
        </label>
        <label>
          <span>Ticket Type</span>
          <SearchableSelect value={filters.ticketType} onChange={(value) => updateFilter('ticketType', value)} options={ticketTypeOptions} placeholder="Search types" />
        </label>
        <label>
          <span>Plant</span>
          <SearchableSelect value={filters.plant} onChange={(value) => updateFilter('plant', value)} options={plantOptions} placeholder="Search plants" />
        </label>
        <label>
          <span>Ticket Status</span>
          <SearchableSelect value={filters.ticketStatus} onChange={(value) => updateFilter('ticketStatus', value)} options={ticketStatusOptions} placeholder="Search statuses" />
        </label>
        <label>
          <span>Requester</span>
          <SearchableSelect value={filters.requester} onChange={(value) => updateFilter('requester', value)} options={requesterOptions} placeholder="Search requesters" />
        </label>
      </div>

      <div className="panel table-card ticket-table-card">
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
                {results.map((ticket) => (
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
            <div className="empty">No results found.</div>
          )}
        </div>
      </div>
    </section>
  )
}
