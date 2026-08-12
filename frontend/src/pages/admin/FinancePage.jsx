import { useOutletContext } from 'react-router-dom'
import BusinessFinanceDashboard from '../../components/admin/finance/BusinessFinanceDashboard'

export default function FinancePage() {
  const { filters } = useOutletContext()
  return <BusinessFinanceDashboard filters={filters} />
}
