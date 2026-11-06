import { Pill } from './ui'

// Same colours as the admin console's booking badges.
const TONE = {
  pending: 'warning',
  accepted: 'success',
  ongoing: 'info',
  completed: 'indigo',
  rejected: 'danger',
  cancelled: 'danger',
}

export default function StatusBadge({ status }) {
  return <Pill tone={TONE[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Pill>
}
