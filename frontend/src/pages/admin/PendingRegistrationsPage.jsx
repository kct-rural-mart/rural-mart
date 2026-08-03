import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import RowActionsMenu from '../../components/RowActionsMenu'

export default function PendingRegistrationsPage() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadRegistrations() {
      setLoading(true)
      setError('')
      const { data, error: fetchError } = await supabase
        .from('pending_registrations')
        .select('id, mart_name, entrepreneur_name, village, created_at, status')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setRegistrations(data ?? [])
      }
      setLoading(false)
    }

    loadRegistrations()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header-title">Pending Registrations</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mart Name</th>
                <th>Owner</th>
                <th>Village</th>
                <th>Date</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6}>Loading...</td>
                </tr>
              )}
              {!loading && registrations.length === 0 && (
                <tr>
                  <td colSpan={6}>No registrations found.</td>
                </tr>
              )}
              {!loading &&
                registrations.map((reg) => (
                  <tr key={reg.id}>
                    <td>{reg.mart_name}</td>
                    <td>{reg.entrepreneur_name}</td>
                    <td>{reg.village}</td>
                    <td>{new Date(reg.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${reg.status}`}>{reg.status}</span>
                    </td>
                    <td>
                      <RowActionsMenu>
                        <Link to={`/admin/registrations/${reg.id}`} className="row-menu-item">
                          View Details
                        </Link>
                      </RowActionsMenu>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
