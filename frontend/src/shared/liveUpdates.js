const LIVE_UPDATES_URL = 'http://localhost:8080/api/events'

export function subscribeToLiveUpdates(onUpdate) {
  const token = localStorage.getItem('jwt_token')
  if (!token || typeof EventSource === 'undefined') return () => {}

  const source = new EventSource(`${LIVE_UPDATES_URL}?access_token=${encodeURIComponent(token)}`)
  const handleUpdate = () => onUpdate()
  source.addEventListener('tickets-changed', handleUpdate)

  return () => {
    source.removeEventListener('tickets-changed', handleUpdate)
    source.close()
  }
}
