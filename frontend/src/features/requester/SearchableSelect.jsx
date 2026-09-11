import { useEffect, useRef, useState } from 'react'

export function SearchableSelect({ value, onChange, options, placeholder, required = false }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const selectedOption = options.find((option) => option.value === value)
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  const selectOption = (option) => {
    onChange(option.value)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className={`searchable-select${open ? ' open' : ''}`} ref={containerRef}>
      <input
        value={open ? query : selectedOption?.label || ''}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          setQuery('')
          setOpen(true)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && filteredOptions[0]) {
            event.preventDefault()
            selectOption(filteredOptions[0])
          }
        }}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        required={required && !value}
      />
      {selectedOption && <button
        type="button"
        className="searchable-select-clear"
        aria-label={`Clear ${selectedOption.label}`}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          onChange('')
          setQuery('')
          setOpen(false)
        }}
      >×</button>}
      <span className="searchable-select-arrow" aria-hidden="true" />
      {open && <div className="searchable-select-options" role="listbox">{filteredOptions.length ? filteredOptions.map((option) => <button type="button" role="option" aria-selected={option.value === value} key={option.value} onMouseDown={(event) => event.preventDefault()} onClick={() => selectOption(option)}>{option.label}</button>) : <div className="searchable-select-empty">No matches found</div>}</div>}
    </div>
  )
}
