import { useEffect, useState } from 'react'
import apiClient from '../../api/apiClient'
import { applications } from '../../shared/applications/applicationCatalog'
import { subscribeToLiveUpdates } from '../../shared/liveUpdates'

export function AnalysisPage() {
  const application = applications.analysis
  const [overview, setOverview] = useState(null)
  const [error, setError] = useState('')

  const loadOverview = () => {
    apiClient.get('/api/analysis/overview')
      .then((response) => setOverview(response.data))
      .catch(() => setError('Unable to load analysis data.'))
  }

  useEffect(() => {
    loadOverview()
    return subscribeToLiveUpdates(loadOverview)
  }, [])

  return (
    <section className="page application-workspace">
      <div className="eyebrow">Application</div>
      <h1>{application.name}</h1>
      <p>{application.description}</p>
      {error && <div className="panel state-panel">{error}</div>}
      {overview && (
        <>
          <div className="kpis">
            <article className="card"><div className="eyebrow">Portfolio</div><h3>Total tickets</h3><div className="value">{overview.totalTickets}</div></article>
            <article className="card"><div className="eyebrow">Open work</div><h3>Open tickets</h3><div className="value">{overview.openTickets}</div></article>
            <article className="card"><div className="eyebrow">Completed</div><h3>Closed tickets</h3><div className="value">{overview.closedTickets}</div></article>
          </div>
          <div className="grid">
            <section className="panel"><div className="panel-title">Tickets by priority</div>{overview.byPriority.map((item) => <div className="bar-row" key={item.label}><span className="label">{item.label}</span><div className="bar"><div className="fill" style={{ width: `${Math.max((item.count / Math.max(...overview.byPriority.map((entry) => entry.count), 1)) * 100, 12)}%` }} /></div><strong>{item.count}</strong></div>)}</section>
            <section className="panel"><div className="panel-title">Open tickets by plant</div>{overview.byPlant.map((item) => <div className="bar-row" key={item.label}><span className="label">{item.label}</span><div className="bar"><div className="fill" style={{ width: `${Math.max((item.count / Math.max(...overview.byPlant.map((entry) => entry.count), 1)) * 100, 12)}%` }} /></div><strong>{item.count}</strong></div>)}</section>
          </div>
        </>
      )}
    </section>
  )
}
