import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { KPI_CARDS, formatCurrency } from '../../services/dailyBusinessService'

function formatValue(value, format) {
  if (format === 'currency') return formatCurrency(value)
  if (format === 'percent') return `${value}%`
  return new Intl.NumberFormat('en-IN').format(value)
}

function ChangeIndicator({ change }) {
  if (change === null || change === undefined) {
    return <span className="dbr-kpi-change dbr-kpi-change-new">New</span>
  }

  const isUp = change >= 0
  const Icon = isUp ? TrendingUp : TrendingDown

  return (
    <span className={`dbr-kpi-change ${isUp ? 'dbr-kpi-change-up' : 'dbr-kpi-change-down'}`}>
      <Icon size={13} aria-hidden="true" />
      {`${isUp ? '+' : ''}${change.toFixed(1)}% vs yesterday`}
    </span>
  )
}

export default function BusinessKPICards({ kpis }) {
  return (
    <section className="dbr-kpi-grid">
      {KPI_CARDS.map((card) => {
        const Icon = card.icon
        const value = kpis[card.key]
        const change = kpis.changes ? kpis.changes[card.key] : null

        return (
          <div className="dbr-kpi-card" key={card.key}>
            <div className="dbr-kpi-card-top">
              <div>
                <p className="dbr-kpi-label">{card.label}</p>
                <h3 className="dbr-kpi-value">{formatValue(value, card.format)}</h3>
              </div>
              <div className="dbr-kpi-icon" aria-hidden="true">
                <Icon size={16} />
              </div>
            </div>
            <ChangeIndicator change={change} />
          </div>
        )
      })}
    </section>
  )
}
