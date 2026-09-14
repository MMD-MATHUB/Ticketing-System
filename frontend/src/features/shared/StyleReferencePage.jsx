import { useState } from 'react'
import { requesterNavigation } from '../requester/requesterNavigation'
import { SearchableSelect } from '../requester/SearchableSelect'
import { Avatar, Badge, Button, ColorSwatch, Panel, PanelSubtitle, PanelTitle, StatusText, Tab, TabGroup, ActionMenu, ActionMenuTrigger, ActionMenuList, ActionMenuItem, ModalBackdrop, ModalCard, ModalClose, ModalActions, Timeline, CommentBubble, CommentBox } from '../../shared/components/ui'

const palette = [
  { name: 'Primary purple', value: '#584cb9', colorClassName: 'bg-brand' },
  { name: 'Primary pale', value: '#efedff', colorClassName: 'bg-brand-pale' },
  { name: 'Page background', value: '#f7f7fa', colorClassName: 'bg-page' },
  { name: 'Border', value: '#e4e4ed', colorClassName: 'bg-border' },
  { name: 'Secondary text', value: '#666678', colorClassName: 'bg-secondary' },
  { name: 'Success', value: '#0f9f75', colorClassName: 'bg-success' },
  { name: 'Warning', value: '#d97706', colorClassName: 'bg-warning' },
  { name: 'Error', value: '#dc2626', colorClassName: 'bg-error' },
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
  const [processedMode, setProcessedMode] = useState('tickets')
  const [selectedAssignmentRows, setSelectedAssignmentRows] = useState([])
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
    <section className="page max-w-[1180px] content-start">
      <header className="flex flex-col items-start sm:flex-row sm:items-end justify-between gap-5">
        <div>
          <div className="eyebrow">Shared UI</div>
          <h1 className="mt-2 text-[#18181b] text-[clamp(1.8rem,3vw,2.6rem)]">Component reference</h1>
          <p className="mt-2 text-body">Live examples of the visual language shared by Requester, Processing, and Analysis.</p>
        </div>
        <span className="px-2.5 py-1.5 rounded-lg bg-brand-pale text-brand text-xs font-bold">/style-reference</span>
      </header>

      <Panel as="section" className="min-w-0">
        <div className="flex justify-between gap-4">
          <div>
            <PanelTitle>Colors</PanelTitle>
            <PanelSubtitle>Use the named palette values from the style reference.</PanelSubtitle>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {palette.map((color) => (
            <ColorSwatch key={color.name} name={color.name} value={color.value} colorClassName={color.colorClassName} />
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 min-w-0">
        <Panel as="section" className="min-w-0">
          <PanelTitle>Buttons</PanelTitle>
          <div className="flex items-center flex-wrap gap-3">
            <Button variant="primary">Primary action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="text">Text action</Button>
          </div>
          <div className="flex items-center flex-wrap gap-3 min-h-[74px] mt-4 pt-4 border-t border-border-soft">
            <ActionMenu>
              <ActionMenuTrigger open={actionOpen} onClick={() => setActionOpen((open) => !open)}>
                {selectedAction}
              </ActionMenuTrigger>
              {actionOpen && (
                <ActionMenuList>
                  {['Action 1', 'Action 2', 'Action 3'].map((action) => (
                    <ActionMenuItem key={action} onClick={() => selectAction(action)}>{action}</ActionMenuItem>
                  ))}
                </ActionMenuList>
              )}
            </ActionMenu>
            <button type="button" className="back-button" aria-label="Back">
              <span className="back-chevron" aria-hidden="true" />
            </button>
          </div>
        </Panel>

        <Panel as="section" className="min-w-0">
          <PanelTitle>Ticket status tabs</PanelTitle>
          <TabGroup aria-label="Ticket state reference">
            {[
              ['closed', 'Closed tickets'],
              ['cancelled', 'Cancelled tickets'],
            ].map(([key, label]) => (
              <Tab key={key} active={activeTicketStatus === key} onClick={() => setActiveTicketStatus(key)}>
                {label}
              </Tab>
            ))}
          </TabGroup>
        </Panel>

        <Panel as="section" className="min-w-0">
          <PanelTitle>Processed Today</PanelTitle>
          <TabGroup aria-label="Processed today reference">
            <Tab active={processedMode === 'tickets'} onClick={() => setProcessedMode('tickets')}>Tickets <Badge>6</Badge></Tab>
            <Tab active={processedMode === 'tasks'} onClick={() => setProcessedMode('tasks')}>Tasks <Badge>0</Badge></Tab>
          </TabGroup>
        </Panel>

        <Panel as="section" className="min-w-0">
          <PanelTitle>Mobile navigation menu</PanelTitle>
          <div className="overflow-hidden border border-border rounded-2xl bg-page">
            <div className="flex items-center justify-between min-h-16 px-3.5 py-2.5 bg-white border-b border-[#e7e7ee]">
              <div className="flex items-center gap-2.5 text-[#18181b]">
                <Avatar className="!w-[34px] !h-[34px] !text-xs">DS</Avatar>
                <strong>Requester</strong>
              </div>
              <button
                type="button"
                className="grid gap-1 w-[42px] h-[42px] p-2.5 place-content-center border border-[#dcdce6] rounded-[10px] bg-white text-brand cursor-pointer"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle mobile navigation"
                onClick={() => setMobileMenuOpen((open) => !open)}
              >
                <span className="block w-[19px] h-0.5 rounded-sm bg-current" />
                <span className="block w-[19px] h-0.5 rounded-sm bg-current" />
                <span className="block w-[19px] h-0.5 rounded-sm bg-current" />
              </button>
            </div>
            {mobileMenuOpen && (
              <div className="mx-3.5 mb-3.5 pt-3 bg-white border border-border rounded-2xl shadow-[0_18px_36px_rgba(36,35,67,0.12)]">
                <nav className="nav px-2.5" aria-label="Mobile navigation reference">
                  {requesterNavigation.slice(0, 6).map((item) => (
                    <button
                      key={item.to}
                      type="button"
                      className={`flex items-center justify-between w-full px-3 py-[11px] border-0 rounded-2xl bg-transparent text-secondary text-sm text-left cursor-pointer hover:bg-brand-pale-hover hover:text-brand ${item.label === 'Pending my reply' ? '!bg-brand-pale-hover !text-brand' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                      {item.label === 'Pending my reply' && <Badge>2</Badge>}
                    </button>
                  ))}
                </nav>
                <div className="mx-2.5 mt-2.5 pt-2.5 pb-2.5 border-t border-[#e7e7ee]">
                  <button type="button" className="logout-button" onClick={() => setMobileMenuOpen(false)}>Logout</button>
                </div>
              </div>
            )}
          </div>
        </Panel>

        <Panel as="section" className="min-w-0">
          <PanelTitle>Inputs and states</PanelTitle>
          <div className="grid gap-2">
            <label className="field-label" htmlFor="reference-search">Search tickets</label>
            <div className="search !max-w-none">
              <input id="reference-search" placeholder="Search tickets" />
              <button type="button">Search</button>
            </div>
            <label className="field-label" htmlFor="reference-select">Requester</label>
            <select id="reference-select" className="w-full h-[42px] px-3" defaultValue="Diana Stratan">
              <option>Diana Stratan</option>
              <option>Support team</option>
            </select>
            <div className="flex items-center flex-wrap gap-x-3.5 gap-y-2 mt-2">
              <Badge>2</Badge>
              <StatusText tone="success">Completed</StatusText>
              <StatusText tone="warning">In progress</StatusText>
              <StatusText tone="error">Error</StatusText>
            </div>
          </div>
        </Panel>
      </div>

      <Panel as="section" className="min-w-0">
        <PanelTitle>Text search and dropdown</PanelTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="grid gap-2 min-w-0">
            <span className="field-label">Search tickets</span>
            <div className="search !max-w-none">
              <input value={referenceTextSearch} onChange={(event) => setReferenceTextSearch(event.target.value)} placeholder="Search tickets" />
              <button type="button">Search</button>
            </div>
          </label>
          <label className="grid gap-2 min-w-0">
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
      </Panel>

      <Panel as="section" className="min-w-0">
        <PanelTitle>Tables</PanelTitle>
        <div className="table-wrap mt-0.5">
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
      </Panel>

      <Panel as="section" className="min-w-0">
        <PanelTitle>Selectable assignment table</PanelTitle>
        <div className="flex justify-end gap-2 mb-2.5">
          {selectedAssignmentRows.length > 0 && (
            <>
              <Button variant="secondary" onClick={() => setSelectedAssignmentRows([])}>Deselect all</Button>
              <Button variant="primary" onClick={() => setSelectedAssignmentRows([])}>Assign</Button>
            </>
          )}
        </div>
        <div className="table-wrap mt-0.5">
          <table>
            <thead><tr><th>Select</th><th>Ticket</th><th>Plant</th><th>Status</th></tr></thead>
            <tbody>{['SMD-TKT-2409100019', 'SMD-TKT-2409020002'].map((ticket, index) => <tr key={ticket}>
              <td><input type="checkbox" checked={selectedAssignmentRows.includes(ticket)} onChange={() => setSelectedAssignmentRows((current) => current.includes(ticket) ? current.filter((item) => item !== ticket) : [...current, ticket])} aria-label={`Select ${ticket}`} /></td>
              <td>{ticket}</td><td>{index ? '15S1 - Morocco 534T' : '26S1 - Mauritania 551W'}</td><td>Not started</td>
            </tr>)}</tbody>
          </table>
        </div>
      </Panel>

      <Panel as="section" className="min-w-0">
        <PanelTitle>Attachments</PanelTitle>
        <div className="grid gap-3">
          <div className="field-label">Attachments</div>
          <p className="m-0 pl-6 text-muted text-sm">{referenceAttachments.length} files attached.</p>
          <label className="inline-flex w-fit flex-row items-center gap-2 py-2 text-heading cursor-pointer before:content-['📎'] before:text-xl"><span>Attach file</span><input className="sr-only" type="file" multiple onChange={(event) => setReferenceAttachments((current) => [...current, ...Array.from(event.target.files || [])])} /></label>
          <ul className="grid gap-2 m-0 p-0 list-none">
            {referenceAttachments.map((file, index) => (
              <li className="flex items-center justify-between gap-3 max-w-[600px] px-3 py-[9px] border border-border rounded-lg text-[#445877] text-[13px]" key={`${file.name}-${index}`}>
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span>
                <button type="button" className="flex-none border-0 bg-transparent text-brand cursor-pointer" onClick={() => setReferenceAttachments((current) => current.filter((_, fileIndex) => fileIndex !== index))}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      <Panel as="section" className="min-w-0">
        <PanelTitle>Modal and searchable select</PanelTitle>
        <Button variant="secondary" onClick={() => setShowRequesterModal(true)}>Add additional requester</Button>
      </Panel>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 min-w-0">
        <Panel as="section" className="min-w-0">
          <PanelTitle>Charts</PanelTitle>
          <div className="bar-row"><span className="label">High</span><div className="bar"><div className="fill" style={{ width: '82%' }} /></div><strong>12</strong></div>
          <div className="bar-row"><span className="label">Medium</span><div className="bar"><div className="fill" style={{ width: '58%', background: '#d97706' }} /></div><strong>8</strong></div>
          <div className="bar-row"><span className="label">Low</span><div className="bar"><div className="fill" style={{ width: '32%', background: '#0f9f75' }} /></div><strong>4</strong></div>
        </Panel>

        <Panel as="section" className="min-w-0">
          <PanelTitle>Cards and metrics</PanelTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Panel as="article" className="flex flex-col cursor-default min-h-[124px]">
              <div className="eyebrow">Overview</div>
              <div className="text-4xl leading-none font-bold" style={{ color: '#584cb9' }}>24</div>
              <p className="mt-2.5 text-[13px] leading-[1.4]">Total tickets</p>
            </Panel>
            <Panel as="article" className="flex flex-col cursor-default min-h-[124px]">
              <div className="eyebrow">Completed</div>
              <div className="text-4xl leading-none font-bold" style={{ color: '#0f9f75' }}>18</div>
              <p className="mt-2.5 text-[13px] leading-[1.4]">Closed tickets</p>
            </Panel>
          </div>
        </Panel>
      </div>

      <Panel as="section" className="detail-panel min-w-0">
        <PanelTitle className="!mb-3">Timeline and scrolling</PanelTitle>
        <Timeline>
          {messages.map(([author, message], index) => (
            <CommentBubble author={author} key={`${message}-${index}`}>
              {message}
            </CommentBubble>
          ))}
        </Timeline>
        <CommentBox>
          <input className="flex-1" value={comment} onChange={(event) => setComment(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); sendComment() } }} placeholder="Comment" />
          <button type="button" className="w-24 border-0 rounded-xl bg-brand text-white font-semibold cursor-pointer" onClick={sendComment}>Send</button>
        </CommentBox>
      </Panel>

      <Panel as="section" className="min-w-0">
        <PanelTitle>Error toast</PanelTitle>
        <div className="grid min-h-28 place-items-center p-3.5 border border-dashed border-[#dcdce6] rounded-xl bg-page">
          {showErrorToast ? (
            <div className="ticket-error-toast !w-[min(100%,620px)]" role="alertdialog" aria-label="Ticket search result">
              <div className="ticket-error-icon">!</div>
              <div className="toast-message">Ticket not found.</div>
              <button type="button" className="toast-close" aria-label="Close notification" onClick={() => setShowErrorToast(false)}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setShowErrorToast(true)}>Show error toast</Button>
          )}
        </div>
      </Panel>

      <div className="panel state-panel mb-5">Loading and empty states use this centered panel treatment.</div>

      {showRequesterModal && (
        <ModalBackdrop onClick={() => setShowRequesterModal(false)}>
          <ModalCard role="dialog" aria-modal="true" aria-labelledby="reference-requester-dialog-title" onClick={(event) => event.stopPropagation()}>
            <ModalClose onClick={() => setShowRequesterModal(false)} />
            <h2 id="reference-requester-dialog-title" className="m-0 mr-9 mb-5 text-[21px]">Add additional requester</h2>
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
            <ModalActions>
              <Button variant="secondary" onClick={() => setShowRequesterModal(false)}>Cancel</Button>
              <Button variant="primary" disabled={!referenceRequester} onClick={() => setShowRequesterModal(false)}>Confirm</Button>
            </ModalActions>
          </ModalCard>
        </ModalBackdrop>
      )}
    </section>
  )
}
