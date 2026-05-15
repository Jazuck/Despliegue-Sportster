import { useState } from 'react'
import { AdminCatalogSection } from './AdminCatalogSection'
import { AdminUsersSection } from './AdminUsersSection'
import '../../styles/admin-panel.css'

const TABS = [
  { id: 'catalog', label: 'Deportes y modalidades' },
  { id: 'users', label: 'Usuarios' },
]

export function AdminPanel({ currentEmail }) {
  const [tab, setTab] = useState('catalog')

  return (
    <div className="admin-panel">
      <div className="admin-panel__tabs" role="tablist" aria-label="Secciones de administración">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`admin-panel__tab${tab === t.id ? ' admin-panel__tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="admin-panel__body" role="tabpanel">
        {tab === 'catalog' && <AdminCatalogSection />}
        {tab === 'users' && <AdminUsersSection currentEmail={currentEmail} />}
      </div>
    </div>
  )
}
