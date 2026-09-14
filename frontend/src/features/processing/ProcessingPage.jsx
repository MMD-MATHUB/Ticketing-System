import { useEffect, useState } from 'react'
import apiClient from '../../api/apiClient'
import { applications } from '../../shared/applications/applicationCatalog'
import { subscribeToLiveUpdates } from '../../shared/liveUpdates'
import { Panel, PanelTitle, KpiCard } from '../../shared/components/ui'

export function ProcessingPage() {
  const application = applications.processing
  const [queue, setQueue] = useState(null)
  const [error, setError] = useState('')

  const loadQueue = () => {
    apiClient.get('/api/processing/queue')
      .then((response) => setQueue(response.data))
      .catch(() => setError('Unable to load the processing queue.'))
  }

  useEffect(() => {
    loadQueue()
    return subscribeToLiveUpdates(loadQueue)
  }, [])

  return (
    <section className="page application-workspace">
      <div className="eyebrow">Application</div>
      <h1>{application.name}</h1>
      <p>{application.description}</p>
      {error && <Panel className="state-panel">{error}</Panel>}
      {queue && (
        <>
          <div className="kpis">
            <KpiCard><div className="eyebrow">Queue</div><h3 className="mt-[7px] mb-2.5 text-base leading-[1.2]">Open tickets</h3><div className="text-4xl leading-none font-bold">{queue.totalOpen}</div></KpiCard>
            <KpiCard><div className="eyebrow">New work</div><h3 className="mt-[7px] mb-2.5 text-base leading-[1.2]">Not started</h3><div className="text-4xl leading-none font-bold">{queue.notStarted}</div></KpiCard>
            <KpiCard><div className="eyebrow">Active</div><h3 className="mt-[7px] mb-2.5 text-base leading-[1.2]">In progress</h3><div className="text-4xl leading-none font-bold">{queue.inProgress}</div></KpiCard>
          </div>
          <Panel as="section" className="table-card">
            <PanelTitle>Processing queue</PanelTitle>
            <div className="table-wrap"><table><thead><tr><th>Ticket</th><th>Title</th><th>Priority</th><th>Status</th></tr></thead><tbody>
              {queue.tickets.map((ticket) => <tr key={ticket.ticketNumber}><td>{ticket.ticketNumber}</td><td>{ticket.title}</td><td>{ticket.priority}</td><td>{ticket.status}</td></tr>)}
            </tbody></table></div>
          </Panel>
        </>
      )}
    </section>
  )
}
