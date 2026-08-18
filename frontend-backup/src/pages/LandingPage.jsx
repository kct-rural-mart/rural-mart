import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="landing-shell">
      <div className="auth-brand-mark" style={{ width: 56, height: 56, fontSize: 22 }}>
        RM
      </div>
      <div>
        <h1 className="landing-title">Rural Mart Management</h1>
        <p className="landing-subtitle">
          A management platform for rural agri-retail outlets — track your mart, manage
          operations, and stay compliant, all in one place.
        </p>
      </div>
      <div className="landing-actions">
        <Link to="/login" className="btn btn-primary">
          Login
        </Link>
        <Link to="/register" className="btn btn-secondary">
          Register Rural Mart
        </Link>
      </div>
    </div>
  )
}
