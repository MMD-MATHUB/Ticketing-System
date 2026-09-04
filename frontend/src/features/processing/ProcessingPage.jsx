import { applications } from '../../shared/applications/applicationCatalog'

export function ProcessingPage() {
  const application = applications.processing

  return (
    <section className="page application-workspace">
      <div className="eyebrow">Application</div>
      <h1>{application.name}</h1>
      <p>{application.description}</p>
      <div className="panel state-panel">Processing workspace is ready for the next module.</div>
    </section>
  )
}
