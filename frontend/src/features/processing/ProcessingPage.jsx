import { useEffect, useState } from 'react'
import apiClient from '../../api/apiClient'
import { applications } from '../../shared/applications/applicationCatalog'

export function ProcessingPage() {
  const application = applications.processing
  const [queue, setQueue] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiClient.get('/api/processing/queue')
      .then((response) => setQueue(response.data))
      .catch(() => setError('Unable to load the processing queue.'))
  }, [])

  return (
    <section className="page application-workspace">
      <div className="eyebrow">Application</div>
      <h1>{application.name}</h1>
      <p>{application.description}</p>
      {error && <div className="panel state-panel">{error}</div>}
      {queue && (
        <>
          <div className="kpis">
            <article className="card"><div className="eyebrow">Queue</div><h3>Open tickets</h3><div className="value">{queue.totalOpen}</div></article>
            <article className="card"><div className="eyebrow">New work</div><h3>Not started</h3><div className="value">{queue.notStarted}</div></article>
            <article className="card"><div className="eyebrow">Active</div><h3>In progress</h3><div className="value">{queue.inProgress}</div></article>
          </div>
          <section className="panel table-card">
            <div className="panel-title">Processing queue</div>
            <div className="table-wrap"><table><thead><tr><th>Ticket</th><th>Title</th><th>Priority</th><th>Status</th></tr></thead><tbody>
              {queue.tickets.map((ticket) => <tr key={ticket.ticketNumber}><td>{ticket.ticketNumber}</td><td>{ticket.title}</td><td>{ticket.priority}</td><td>{ticket.status}</td></tr>)}
            </tbody></table></div>
          </section>
        </>
      )}
    </section>
  )
}
