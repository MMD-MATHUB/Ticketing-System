import { useState } from 'react'
import { requesterNavigation } from '../requester/requesterNavigation'
import { SearchableSelect } from '../requester/SearchableSelect'

const palette = [
  { name: 'Primary purple', value: '#584cb9', className: 'style-swatch-purple' },
  { name: 'Primary pale', value: '#efedff', className: 'style-swatch-pale' },
  { name: 'Page background', value: '#f7f7fa', className: 'style-swatch-page' },
  { name: 'Border', value: '#e4e4ed', className: 'style-swatch-border' },
  { name: 'Secondary text', value: '#666678', className: 'style-swatch-secondary' },
  { name: 'Success', value: '#0f9f75', className: 'style-swatch-success' },
  { name: 'Warning', value: '#d97706', className: 'style-swatch-warning' },
  { name: 'Error', value: '#dc2626', className: 'style-swatch-error' },
]

const timelineMessages = [
  ['Requester', 'Replacement inspection materials are needed for the upcoming maintenance window.'],
  ['Requester', 'The requester has selected Action 1.'],
  ['Support team', 'The request is being reviewed by the support team.'],
]

export function StyleReferencePage() {
  const [actionOpen, setActionOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState('Action')
  const [comment, setComment] = useState('')
  const [messages, setMessages] = useState(timelineMessages)
  const [showErrorToast, setShowErrorToast] = useState(true)
  const [activeTicketStatus, setActiveTicketStatus] = useState('closed')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(true)
  const [showRequesterModal, setShowRequesterModal] = useState(false)
  const [referenceRequester, setReferenceRequester] = useState('')
  const [referencePlant, setReferencePlant] = useState('')
  const [referenceTextSearch, setReferenceTextSearch] = useState('')
  const [referenceAttachments, setReferenceAttachments] = useState([
    { name: 'inspection-checklist.pdf' },
    { name: 'equipment-photo.jpg' },
  ])

  const selectAction = (action) => {
    setSelectedAction(action)
    setMessages((current) => [...current, ['Requester', `The requester has selected ${action}.`]])
    setActionOpen(false)
  }

  const sendComment = () => {
    if (!comment.trim()) return
    setMessages((current) => [...current, ['Requester', comment.trim()]])
    setComment('')
  }

  return (
    <section className="page style-reference-page">
      <header className="style-reference-header">
        <div>
          <div className="eyebrow">Shared UI</div>
          <h1>Component reference</h1>
          <p>Live examples of the visual language shared by Requester, Processing, and Analysis.</p>
        </div>
        <span className="style-reference-route">/style-reference</span>
      </header>

      <section className="panel style-reference-section">
        <div className="style-reference-section-heading">
          <div>
            <div className="panel-title">Colors</div>
            <div className="panel-subtitle">Use the named palette values from the style reference.</div>
          </div>
        </div>
        <div className="style-palette-grid">
          {palette.map((color) => (
            <div className="style-swatch" key={color.name}>
              <span className={`style-swatch-color ${color.className}`} />
              <strong>{color.name}</strong>
              <code>{color.value}</code>
            </div>
          ))}
        </div>
      </section>

      <div className="style-reference-grid">
        <section className="panel style-reference-section">
          <div className="panel-title">Buttons</div>
          <div className="style-control-row">
            <button type="button" className="primary-button">Primary action</button>
            <button type="button" className="secondary-button">Secondary</button>
            <button type="button" className="text-button">Text action</button>
          </div>
          <div className="style-control-row style-reference-menu-row">
            <div className="action-menu">
              <button type="button" className="action-menu-trigger" aria-expanded={actionOpen} aria-haspopup="menu" onClick={() => setActionOpen((open) => !open)}>
                {selectedAction} <span className={`action-menu-chevron${actionOpen ? ' is-open' : ''}`} aria-hidden="true" />
              </button>
              {actionOpen && (
                <div className="action-menu-list" role="menu">
                  {['Action 1', 'Action 2', 'Action 3'].map((action) => (
                    <button key={action} type="button" role="menuitem" onClick={() => selectAction(action)}>{action}</button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className="back-button" aria-label="Back">
              <span className="back-chevron" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section className="panel style-reference-section">
          <div className="panel-title">Ticket status tabs</div>
          <div className="ticket-status-tabs" role="tablist" aria-label="Ticket state reference">
            {[
              ['closed', 'Closed tickets'],
              ['cancelled', 'Cancelled tickets'],
            ].map(([key, label]) => (
              <button key={key} type="button" role="tab" aria-selected={activeTicketStatus === key} className={activeTicketStatus === key ? 'active' : ''} onClick={() => setActiveTicketStatus(key)}>
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="panel style-reference-section">
          <div className="panel-title">Mobile navigation menu</div>
          <div className="style-reference-mobile-shell">
            <div className="style-reference-mobile-topbar">
              <div className="style-reference-mobile-brand"><span className="avatar">DS</span><strong>Requester</strong></div>
              <button type="button" className="style-reference-mobile-toggle" aria-expanded={mobileMenuOpen} aria-label="Toggle mobile navigation" onClick={() => setMobileMenuOpen((open) => !open)}>
                <span /><span /><span />
              </button>
            </div>
            {mobileMenuOpen && (
              <div className="style-reference-mobile-panel">
                <nav className="nav" aria-label="Mobile navigation reference">
                  {requesterNavigation.slice(0, 6).map((item) => (
                    <button key={item.to} type="button" className={item.label === 'Pending my reply' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
                      {item.label}
                      {item.label === 'Pending my reply' && <span className="badge">2</span>}
                    </button>
                  ))}
                </nav>
                <div className="nav-footer"><button type="button" className="logout-button" onClick={() => setMobileMenuOpen(false)}>Logout</button></div>
              </div>
            )}
          </div>
        </section>

        <section className="panel style-reference-section">
          <div className="panel-title">Inputs and states</div>
          <div className="style-reference-form">
            <label className="field-label" htmlFor="reference-search">Search tickets</label>
            <div className="search style-reference-search">
              <input id="reference-search" placeholder="Search tickets" />
              <button type="button">Search</button>
            </div>
            <label className="field-label" htmlFor="reference-select">Requester</label>
            <select id="reference-select" defaultValue="Diana Stratan">
              <option>Diana Stratan</option>
              <option>Support team</option>
            </select>
            <div className="style-state-row">
              <span className="badge">2</span>
              <span className="style-status-success">Completed</span>
              <span className="style-status-warning">In progress</span>
              <span className="style-status-error">Error</span>
            </div>
          </div>
        </section>
      </div>

      <section className="panel style-reference-section">
        <div className="panel-title">Text search and dropdown</div>
        <div className="style-reference-filter-grid">
          <label>
            <span className="field-label">Search tickets</span>
            <div className="search style-reference-search">
              <input value={referenceTextSearch} onChange={(event) => setReferenceTextSearch(event.target.value)} placeholder="Search tickets" />
              <button type="button">Search</button>
            </div>
          </label>
          <label>
            <span className="field-label">Plant</span>
            <SearchableSelect
              value={referencePlant}
              onChange={setReferencePlant}
              options={[
                { value: '15S1 - Morocco 534T', label: '15S1 - Morocco 534T' },
                { value: 'Site A', label: 'Site A' },
                { value: 'Site B', label: 'Site B' },
              ]}
              placeholder="Search plants"
            />
          </label>
        </div>
      </section>

      <section className="panel style-reference-section">
        <div className="panel-title">Tables</div>
        <div className="table-wrap style-reference-table-wrap">
          <table>
            <thead>
              <tr><th>Ticket</th><th>Requester</th><th>Plant</th><th>Status</th><th>Created on</th></tr>
            </thead>
            <tbody>
              <tr><td>SMD-TKT-2409020002</td><td>Diana Stratan</td><td>15S1 - Morocco 534T</td><td>Not started</td><td>09/09/2026</td></tr>
              <tr><td>SMD-TKT-2409020001</td><td>Demo User</td><td>Site B</td><td>In progress</td><td>08/09/2026</td></tr>
              <tr><td>SMD-TKT-2409010004</td><td>Support team</td><td>Site A</td><td>Closed</td><td>04/09/2026</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel style-reference-section">
        <div className="panel-title">Attachments</div>
        <div className="attachments-field">
          <div className="field-label">Attachments</div>
          <p className="attachments-empty">{referenceAttachments.length} files attached.</p>
          <label className="attachment-upload"><span>Attach file</span><input type="file" multiple onChange={(event) => setReferenceAttachments((current) => [...current, ...Array.from(event.target.files || [])])} /></label>
          <ul className="attachment-list">
            {referenceAttachments.map((file, index) => (
              <li key={`${file.name}-${index}`}>
                <span>{file.name}</span>
                <button type="button" onClick={() => setReferenceAttachments((current) => current.filter((_, fileIndex) => fileIndex !== index))}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel style-reference-section">
        <div className="panel-title">Modal and searchable select</div>
        <button type="button" className="secondary-button" onClick={() => setShowRequesterModal(true)}>Add additional requester</button>
      </section>

      <div className="style-reference-grid">
        <section className="panel style-reference-section">
          <div className="panel-title">Charts</div>
          <div className="bar-row"><span className="label">High</span><div className="bar"><div className="fill" style={{ width: '82%' }} /></div><strong>12</strong></div>
          <div className="bar-row"><span className="label">Medium</span><div className="bar"><div className="fill" style={{ width: '58%', background: '#d97706' }} /></div><strong>8</strong></div>
          <div className="bar-row"><span className="label">Low</span><div className="bar"><div className="fill" style={{ width: '32%', background: '#0f9f75' }} /></div><strong>4</strong></div>
        </section>

        <section className="panel style-reference-section">
          <div className="panel-title">Cards and metrics</div>
          <div className="style-reference-metrics">
            <article className="card dashboard-kpi"><div className="eyebrow">Overview</div><div className="value" style={{ color: '#584cb9' }}>24</div><p>Total tickets</p></article>
            <article className="card dashboard-kpi"><div className="eyebrow">Completed</div><div className="value" style={{ color: '#0f9f75' }}>18</div><p>Closed tickets</p></article>
          </div>
        </section>
      </div>

      <section className="panel detail-panel style-reference-section style-reference-timeline">
        <div className="panel-title">Timeline and scrolling</div>
        <div className="timeline-box">
          {messages.map(([author, message], index) => (
            <div className="comment-bubble" key={`${message}-${index}`}>
              <div className="comment-author">{author}</div>
              <div className="comment-text">{message}</div>
            </div>
          ))}
        </div>
        <div className="comment-box">
          <input value={comment} onChange={(event) => setComment(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); sendComment() } }} placeholder="Comment" />
          <button type="button" onClick={sendComment}>Send</button>
        </div>
      </section>

      <section className="panel style-reference-section">
        <div className="panel-title">Error toast</div>
        <div className="style-reference-toast-stage">
          {showErrorToast ? (
            <div className="ticket-error-toast" role="alertdialog" aria-label="Ticket search result">
              <div className="ticket-error-icon">!</div>
              <div className="toast-message">Ticket not found.</div>
              <button type="button" className="toast-close" aria-label="Close notification" onClick={() => setShowErrorToast(false)}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
          ) : (
            <button type="button" className="secondary-button" onClick={() => setShowErrorToast(true)}>Show error toast</button>
          )}
        </div>
      </section>

      <div className="panel state-panel style-reference-state">Loading and empty states use this centered panel treatment.</div>

      {showRequesterModal && (
        <div className="modal-backdrop" onClick={() => setShowRequesterModal(false)}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="reference-requester-dialog-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setShowRequesterModal(false)} aria-label="Close">×</button>
            <h2 id="reference-requester-dialog-title">Add additional requester</h2>
            <label>
              <span>Company user</span>
              <SearchableSelect
                value={referenceRequester}
                onChange={setReferenceRequester}
                options={[
                  { value: 'Diana Stratan (diana.stratan@company.com)', label: 'Diana Stratan | diana.stratan@company.com' },
                  { value: 'Demo User (demo.user@company.com)', label: 'Demo User | demo.user@company.com' },
                ]}
                placeholder="Search company users"
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setShowRequesterModal(false)}>Cancel</button>
              <button type="button" className="primary-button" disabled={!referenceRequester} onClick={() => setShowRequesterModal(false)}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
