export const API_BASE_URL = '/api'

export const CLOSED_CANCELLED_TABS = [
  { key: 'closed', label: 'Closed tickets', statuses: ['Resolved'] },
  { key: 'cancelled', label: 'Cancelled tickets', statuses: ['Cancelled'] },
]

export function matchesTicketView(ticket, view) {
  switch (view) {
    case 'not-started':
      return ticket.status === 'NotStarted'
    case 'in-progress':
      return ticket.status === 'InProgress'
    case 'pending-reply':
    case 'pending-handler-action':
      return ticket.status === 'NotStarted' || ticket.status === 'InProgress'
    case 'closed':
    case 'cancelled':
      return ticket.status === 'Resolved' || ticket.status === 'Cancelled'
    default:
      return true
  }
}

export const truncateText = (value, maxLength = 80) => {
  if (!value) return ''
  if (value.length <= maxLength) return value
  return `${value.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`
}

export function prettyStatus(status) {
  return {
    NotStarted: 'Not started',
    InProgress: 'In progress',
    Resolved: 'Closed',
    Cancelled: 'Cancelled',
  }[status] || status
}

export function getMaterialsValue(ticket) {
  const description = ticket.description || ''
  const materialsMatch = description.match(/Materials:\s*(.+?)(?:\n|$)/i)
  if (materialsMatch) return materialsMatch[1].trim()

  const materialTokens = description.match(/[A-Z0-9-]{6,}(?:\s+[xX]\s*\d+)?/g)
  return materialTokens && materialTokens.length ? materialTokens.slice(0, 3).join(', ') : '—'
}

export function getSourcingCountry(ticket) {
  const description = ticket.description || ''
  const warehouseMatch = description.match(/Sourcing warehouse:\s*([^\n]+)/i)
  if (warehouseMatch) return warehouseMatch[1].trim() || '—'

  return '—'
}

export function getEscalationValue(ticket) {
  const description = ticket.description || ''
  return /escalat(?:e|ed|ion)/i.test(description) ? 'Yes' : 'No'
}
