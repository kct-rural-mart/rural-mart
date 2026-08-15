import { useOutletContext } from 'react-router-dom'
import BusinessFinanceDashboard from '../../components/admin/finance/BusinessFinanceDashboard'

export default function FinancePage() {
  const { filters, refreshKey } = useOutletContext()
  return <BusinessFinanceDashboard filters={filters} refreshKey={refreshKey} />
}
