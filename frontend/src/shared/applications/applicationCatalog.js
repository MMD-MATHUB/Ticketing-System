export const applications = {
  requester: {
    key: 'requester',
    name: 'Requester',
    description: 'Submit and follow up on service tickets.',
    entryPath: '/dashboard',
  },
  processing: {
    key: 'processing',
    name: 'Processing',
    description: 'Review, assign, and process incoming tickets.',
    entryPath: '/processing',
  },
  analysis: {
    key: 'analysis',
    name: 'Analysis',
    description: 'Explore ticket trends and operational insights.',
    entryPath: '/analysis',
  },
}

export function getApplicationEntryPath(application) {
  return applications[application]?.entryPath || '/dashboard'
}
