import { applications } from '../../shared/applications/applicationCatalog'

export function AnalysisPage() {
  const application = applications.analysis

  return (
    <section className="page application-workspace">
      <div className="eyebrow">Application</div>
      <h1>{application.name}</h1>
      <p>{application.description}</p>
      <div className="panel state-panel">Analysis workspace is ready for the next module.</div>
    </section>
  )
}
