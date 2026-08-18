import { useOutletContext } from 'react-router-dom'
import ReportsDashboard from '../../components/admin/reports/ReportsDashboard'

export default function ReportsPage() {
  const { filters } = useOutletContext()
  return <ReportsDashboard filters={filters} />
}
