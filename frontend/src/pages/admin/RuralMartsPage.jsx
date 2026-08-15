import { useOutletContext } from 'react-router-dom'
import RuralMartsDashboard from '../../components/admin/rural-marts/RuralMartsDashboard'

export default function RuralMartsPage() {
  const { filters, refreshKey } = useOutletContext()
  return <RuralMartsDashboard filters={filters} refreshKey={refreshKey} />
}
