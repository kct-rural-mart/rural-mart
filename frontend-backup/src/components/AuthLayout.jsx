export default function AuthLayout({ title, subtitle, wide, children }) {
  return (
    <div className="auth-shell">
      <div className={`card auth-card${wide ? ' auth-card-wide' : ''}`}>
        <div className="auth-brand">
          <div className="auth-brand-mark">RM</div>
          <div className="auth-brand-name">Rural Mart Management</div>
        </div>
        {title && <h1 className="auth-title">{title}</h1>}
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}
