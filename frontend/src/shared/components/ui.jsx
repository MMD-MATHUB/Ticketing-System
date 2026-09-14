// Tailwind-based primitives replacing the .primary-button/.secondary-button/.text-button/.panel/.badge/.avatar CSS classes.
// Values are pinned to match the original App.css rules exactly (colors, spacing, radii).
import { forwardRef } from 'react'

const buttonBase = 'inline-flex items-center justify-center font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

const buttonVariants = {
  primary: 'border-0 bg-brand text-white rounded-xl px-4 py-2.5',
  secondary: 'border border-brand rounded-xl px-4 py-2.5 bg-white text-brand',
  text: 'border-0 p-0 py-1 bg-transparent text-brand text-[13px] font-bold',
}

const buttonSizes = {
  default: '',
  small: 'px-3.5 py-2.5 text-[0.9rem]',
}

export function Button({ variant = 'primary', size = 'default', className = '', ...props }) {
  const sizeClass = variant === 'text' ? '' : buttonSizes[size]
  return (
    <button
      type="button"
      className={`${buttonBase} ${buttonVariants[variant]} ${sizeClass} ${className}`.trim()}
      {...props}
    />
  )
}

export function Panel({ as: Tag = 'div', className = '', ...props }) {
  return <Tag className={`bg-white border border-border rounded-2xl p-4 ${className}`.trim()} {...props} />
}

export function PanelTitle({ className = '', ...props }) {
  return <div className={`text-lg font-bold mb-[18px] ${className}`.trim()} {...props} />
}

export function PanelSubtitle({ className = '', ...props }) {
  return <div className={`text-muted text-xs ${className}`.trim()} {...props} />
}

export function Badge({ className = '', ...props }) {
  return (
    <span
      className={`inline-grid place-items-center min-w-[20px] h-5 px-1.5 rounded-full bg-brand-pale text-brand text-xs font-semibold ${className}`.trim()}
      {...props}
    />
  )
}

export function Avatar({ className = '', ...props }) {
  return (
    <span
      className={`w-10 h-10 rounded-full grid place-items-center bg-brand-pale text-brand font-bold ${className}`.trim()}
      {...props}
    />
  )
}

const statusColors = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
}

export function StatusText({ tone = 'success', className = '', ...props }) {
  return <span className={`text-[13px] font-bold ${statusColors[tone]} ${className}`.trim()} {...props} />
}

export function ColorSwatch({ name, value, colorClassName }) {
  return (
    <div className="grid grid-cols-[32px_1fr] items-center gap-x-2.5 gap-y-1 min-w-0">
      <span className={`row-span-2 w-8 h-8 border border-border rounded-lg ${colorClassName}`} />
      <strong className="overflow-hidden text-heading text-xs text-ellipsis whitespace-nowrap">{name}</strong>
      <code className="text-muted text-[11px]">{value}</code>
    </div>
  )
}

// Replaces the .ticket-status-tabs CSS component.
export function TabGroup({ className = '', ...props }) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-1 w-fit p-1 bg-white border border-border rounded-xl ${className}`.trim()}
      {...props}
    />
  )
}

export function Tab({ active, className = '', ...props }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={`border-0 bg-transparent px-[18px] py-2 rounded-[9px] text-body text-sm font-semibold cursor-pointer transition-colors duration-150 hover:text-brand ${active ? 'bg-brand-pale text-brand' : ''} ${className}`.trim()}
      {...props}
    />
  )
}

// Replaces the .action-menu* CSS component.
export const ActionMenu = forwardRef(function ActionMenu({ className = '', ...props }, ref) {
  return <div ref={ref} className={`relative ${className}`.trim()} {...props} />
})

export function ActionMenuTrigger({ open, className = '', children, ...props }) {
  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      className={`inline-flex items-center gap-2 px-3.5 py-2.5 border border-brand rounded-xl bg-white text-brand text-[0.9rem] font-semibold cursor-pointer ${className}`.trim()}
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        className={`w-[9px] h-[9px] border-r-2 border-b-2 border-current transition-transform duration-150 ${open ? 'rotate-[225deg] translate-x-[-1px] translate-y-[-1px]' : 'rotate-45 -translate-y-0.5'}`}
      />
    </button>
  )
}

export function ActionMenuList({ className = '', ...props }) {
  return (
    <div
      role="menu"
      className={`absolute top-[calc(100%+8px)] right-0 z-10 grid w-[182px] p-2 bg-white border border-[#dcdce6] rounded-[10px] shadow-[0_10px_24px_rgba(36,35,67,0.12)] ${className}`.trim()}
      {...props}
    />
  )
}

export function ActionMenuItem({ className = '', ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`px-3 py-2.5 border-0 rounded-md bg-transparent text-[#596273] text-left cursor-pointer hover:bg-[#f3f3fb] hover:text-brand focus-visible:bg-[#f3f3fb] focus-visible:text-brand focus-visible:outline-0 ${className}`.trim()}
      {...props}
    />
  )
}

// Replaces the .modal-backdrop/.modal-card/.modal-close CSS component.
export function ModalBackdrop({ className = '', ...props }) {
  return (
    <div
      className={`fixed inset-0 z-30 grid place-items-center p-5 bg-[rgba(24,24,27,0.42)] ${className}`.trim()}
      {...props}
    />
  )
}

export function ModalCard({ className = '', ...props }) {
  return (
    <div
      className={`relative w-[min(100%,520px)] p-[26px] bg-white border border-border rounded-[14px] shadow-[0_18px_45px_rgba(36,35,67,0.24)] ${className}`.trim()}
      {...props}
    />
  )
}

export function ModalClose({ className = '', ...props }) {
  return (
    <button
      type="button"
      aria-label="Close"
      className={`absolute top-4 right-[18px] border-0 bg-transparent text-[#4b4b56] text-[25px] leading-none cursor-pointer ${className}`.trim()}
      {...props}
    >
      ×
    </button>
  )
}

export function ModalActions({ className = '', ...props }) {
  return (
    <div
      className={`flex items-center justify-end gap-3 mt-5 ${className}`.trim()}
      {...props}
    />
  )
}

// Replaces the .timeline-box/.comment-*/.comment-box CSS component.
export const Timeline = forwardRef(function Timeline({ className = '', ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`h-[220px] min-h-0 flex flex-col gap-3 overflow-y-auto pr-3 pb-1.5 [scrollbar-width:thin] [scrollbar-color:#c9c7e8_transparent] ${className}`.trim()}
      {...props}
    />
  )
})

export function CommentBubble({ author, children, className = '' }) {
  return (
    <div className={`max-w-[60%] bg-[#f3f3fb] rounded-2xl px-4 py-3.5 ${className}`.trim()}>
      <div className="text-xs font-bold text-[#596273] mb-1.5">{author}</div>
      <div className="leading-[1.5] text-heading">{children}</div>
    </div>
  )
}

export function CommentBox({ className = '', ...props }) {
  return (
    <div
      className={`flex gap-3 border-t border-[#ededf4] pt-2.5 ${className}`.trim()}
      {...props}
    />
  )
}

// Replaces the .card/.dashboard-kpi/.analysis-dashboard-card CSS component.
export function KpiCard({ as: Tag = 'article', className = '', ...props }) {
  return (
    <Tag
      className={`bg-white border border-border rounded-2xl p-4 cursor-pointer flex flex-col ${className}`.trim()}
      {...props}
    />
  )
}






