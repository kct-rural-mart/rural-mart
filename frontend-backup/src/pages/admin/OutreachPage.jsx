import { useOutletContext } from 'react-router-dom'
import FarmersOutreachDashboard from '../../components/admin/farmers-outreach/FarmersOutreachDashboard'

export default function OutreachPage() {
  const { filters, refreshKey } = useOutletContext()
  return <FarmersOutreachDashboard selectedDistrict={filters.district} selectedMart={filters.ruralMart} dateRange={filters.dateRange} refreshKey={refreshKey} />
}
