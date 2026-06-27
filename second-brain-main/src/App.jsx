import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import './styles.css'

const STORAGE_KEY = 'second-brain-v1'

const TYPE_META = {
  note:    { label: 'Nota',    color: '#6366f1', dim: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.35)',  placeholder: 'Escreva uma nota ou pensamento…' },
  idea:    { label: 'Ideia',   color: '#f59e0b', dim: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)',  placeholder: 'Capture uma ideia…' },
  link:    { label: 'Link',    color: '#38bdf8', dim: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.35)',  placeholder: 'Descreva este link…' },
  snippet: { label: 'Trecho',  color: '#34d399', dim: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.35)', placeholder: 'Cole um código ou trecho de texto…' },
}

function loadItems() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [] }
  catch { return [] }
}

function formatRelative(ts) {
  const diff = Date.now() - ts
  if (diff < 60000) return 'agora'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}min atrás`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d atrás`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function App() {
  const [items, setItems] = useState(loadItems)
  const [query, setQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [formType, setFormType] = useState('note')
  const [formContent, setFormContent] = useState('')
  const [formTags, setFormTags] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const searchRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const counts = useMemo(() => ({
    all: items.length,
    note: items.filter(i => i.type === 'note').length,
    idea: items.filter(i => i.type === 'idea').length,
    link: items.filter(i => i.type === 'link').length,
    snippet: items.filter(i => i.type === 'snippet').length,
  }), [items])

  const filtered = useMemo(() => {
    let result = [...items]
    if (filterType !== 'all') result = result.filter(i => i.type === filterType)
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(i =>
        i.content.toLowerCase().includes(q) ||
        (i.url && i.url.toLowerCase().includes(q)) ||
        i.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return b.createdAt - a.createdAt
    })
  }, [items, query, filterType])

  const addItem = useCallback(() => {
    if (!formContent.trim()) return
    const tags = formTags.split(',').map(t => t.trim()).filter(Boolean)
    setItems(prev => [{
      id: Date.now(),
      type: formType,
      content: formContent.trim(),
      url: formType === 'link' ? formUrl.trim() : '',
      tags,
      pinned: false,
      createdAt: Date.now(),
    }, ...prev])
    setFormContent('')
    setFormTags('')
    setFormUrl('')
    textareaRef.current?.focus()
  }, [formType, formContent, formTags, formUrl])

  const togglePin = useCallback(id => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, pinned: !i.pinned } : i))
  }, [])

  const deleteItem = useCallback(id => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const copyItem = useCallback(item => {
    const text = item.url ? `${item.content}\n${item.url}` : item.content
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 1500)
    })
  }, [])

  const pinnedItems = filtered.filter(i => i.pinned)
  const unpinnedItems = filtered.filter(i => !i.pinned)
  const meta = TYPE_META[formType]

  const FILTERS = [
    { value: 'all', label: 'Tudo', count: counts.all },
    { value: 'note', label: 'Notas', count: counts.note },
    { value: 'idea', label: 'Ideias', count: counts.idea },
    { value: 'link', label: 'Links', count: counts.link },
    { value: 'snippet', label: 'Trechos', count: counts.snippet },
  ]

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <span className="day-badge">Day 28</span>
            <div>
              <h1 className="header-title">Second Brain</h1>
              <p className="header-sub">Notas, ideias, links & trechos</p>
            </div>
          </div>
          <div className="header-right">
            <div className="search-wrap">
              <span className="search-icon"><IconSearch /></span>
              <input
                ref={searchRef}
                type="text"
                className="search-input"
                placeholder="Pesquisar… ⌘K"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Pesquisar"
              />
              {query && (
                <button className="search-clear" onClick={() => setQuery('')} aria-label="Limpar pesquisa">
                  <IconX />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="main">

        {/* Quick Add */}
        <div className="quick-add" style={{ '--type-color': meta.color, '--type-dim': meta.dim, '--type-border': meta.border }}>
          <div className="type-selector">
            {Object.entries(TYPE_META).map(([value, m]) => (
              <button
                key={value}
                className={`type-pill${formType === value ? ' active' : ''}`}
                style={formType === value ? { background: m.dim, borderColor: m.border, color: m.color } : {}}
                onClick={() => setFormType(value)}
              >
                <TypeIcon type={value} />
                {m.label}
              </button>
            ))}
          </div>

          <textarea
            ref={textareaRef}
            className="quick-textarea"
            placeholder={meta.placeholder}
            value={formContent}
            onChange={e => setFormContent(e.target.value)}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') addItem() }}
            rows={3}
            aria-label="Conteúdo"
          />

          {formType === 'link' && (
            <input
              type="url"
              className="form-input"
              placeholder="https://…"
              value={formUrl}
              onChange={e => setFormUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              aria-label="URL"
            />
          )}

          <div className="quick-footer">
            <input
              type="text"
              className="form-input"
                placeholder="Tags: design, todo, referência"
              value={formTags}
              onChange={e => setFormTags(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              aria-label="Tags"
            />
            <button
              className="btn-primary"
              onClick={addItem}
              disabled={!formContent.trim()}
              aria-label="Adicionar"
            >
              Adicionar
              <span className="btn-shortcut">⌘↵</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-row">
          {FILTERS.map(f => (
            <button
              key={f.value}
              className={`filter-pill${filterType === f.value ? ' active' : ''}`}
              onClick={() => setFilterType(f.value)}
            >
              {f.label}
              {f.count > 0 && <span className="filter-count">{f.count}</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            {query ? (
              <>
                <div className="empty-icon"><IconSearch /></div>
                <p className="empty-title">Nenhum resultado para "{query}"</p>
                <p className="empty-sub">Tente palavras-chave diferentes ou limpe a pesquisa</p>
              </>
            ) : (
              <>
                <div className="empty-icon"><IconBrain /></div>
                <p className="empty-title">Seu Second Brain está vazio</p>
                <p className="empty-sub">Comece a capturar notas, ideias, links e trechos acima</p>
              </>
            )}
          </div>
        ) : (
          <>
            {pinnedItems.length > 0 && (
              <section className="section">
                <div className="section-label-row">
                  <IconPin small />
                  <span>Fixados</span>
                </div>
                <div className="cards-grid">
                  {pinnedItems.map(item => (
                    <BrainCard key={item.id} item={item} copiedId={copiedId} onPin={togglePin} onDelete={deleteItem} onCopy={copyItem} />
                  ))}
                </div>
              </section>
            )}

            {unpinnedItems.length > 0 && (
              <section className="section">
                {pinnedItems.length > 0 && (
                  <div className="section-label-row">
                    <span>Recentes</span>
                  </div>
                )}
                <div className="cards-grid">
                  {unpinnedItems.map(item => (
                    <BrainCard key={item.id} item={item} copiedId={copiedId} onPin={togglePin} onDelete={deleteItem} onCopy={copyItem} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

      </main>

      <footer className="credit">
        Codificado por{' '}
        <a href="https://instagram.com/berkindev" target="_blank" rel="noopener noreferrer" className="credit-link">
          berkindev
        </a>
      </footer>
    </div>
  )
}

function BrainCard({ item, copiedId, onPin, onDelete, onCopy }) {
  const meta = TYPE_META[item.type]
  const isCopied = copiedId === item.id
  return (
    <div className="brain-card" style={{ '--card-color': meta.color, '--card-dim': meta.dim, '--card-border': meta.border }}>
      <div className="card-accent" />
      <div className="card-main">
        <div className={`card-content${item.type === 'snippet' ? ' mono' : ''}`}>
          {item.content}
        </div>
        {item.url && (
          <a href={item.url} className="card-url" target="_blank" rel="noopener noreferrer">
            <IconLink />
            <span className="card-url-text">{item.url}</span>
          </a>
        )}
        {item.tags.length > 0 && (
          <div className="card-tags">
            {item.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
      </div>
      <div className="card-footer">
        <span className="card-meta">
          <span className="card-type-dot" style={{ background: meta.color }} />
          {meta.label} · {formatRelative(item.createdAt)}
        </span>
        <div className="card-actions">
          <button
            className={`card-btn${isCopied ? ' success' : ''}`}
            onClick={() => onCopy(item)}
            aria-label={isCopied ? 'Copiado' : 'Copiar'}
            title="Copiar"
          >
            {isCopied ? <IconCheck /> : <IconCopy />}
          </button>
          <button
            className={`card-btn${item.pinned ? ' active' : ''}`}
            onClick={() => onPin(item.id)}
            aria-label={item.pinned ? 'Desafixar' : 'Fixar'}
            title={item.pinned ? 'Desafixar' : 'Fixar'}
          >
            <IconPin />
          </button>
          <button
            className="card-btn danger"
            onClick={() => onDelete(item.id)}
            aria-label="Excluir"
            title="Excluir"
          >
            <IconTrash />
          </button>
        </div>
      </div>
    </div>
  )
}

function TypeIcon({ type }) {
  const s = { width: 12, height: 12 }
  if (type === 'note') return (
    <svg {...s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3 4h10M3 8h10M3 12h6" />
    </svg>
  )
  if (type === 'idea') return (
    <svg {...s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M8 2.5a4.5 4.5 0 013 7.7V12H5v-1.8A4.5 4.5 0 018 2.5z" />
      <path d="M6 14h4M6.5 15.5h3" />
    </svg>
  )
  if (type === 'link') return (
    <svg {...s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M6.5 9.5a3 3 0 004.24 0l2-2a3 3 0 00-4.24-4.24l-1 1" />
      <path d="M9.5 6.5a3 3 0 00-4.24 0l-2 2a3 3 0 004.24 4.24l1-1" />
    </svg>
  )
  if (type === 'snippet') return (
    <svg {...s} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M5 4l-3 4 3 4M11 4l3 4-3 4" />
    </svg>
  )
  return null
}

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="7" cy="7" r="5.5" />
      <path d="M13 13l-2.5-2.5" />
    </svg>
  )
}

function IconX() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M2 2l8 8M10 2l-8 8" />
    </svg>
  )
}

function IconPin({ small }) {
  const size = small ? 11 : 13
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2.5l4 4-4.5 4.5L7.5 9.5 4 13l-1.5-1.5L6 8 4.5 6.5l4.5-4.5z" />
      <path d="M7.5 9.5l-3-3" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 4h11M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M6.5 7v5M9.5 7v5M3.5 4l1 9h7l1-9" />
    </svg>
  )
}

function IconCopy() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="4" y="4" width="8" height="8" rx="1.5" />
      <path d="M10 4V3a1 1 0 00-1-1H3a1 1 0 00-1 1v6a1 1 0 001 1h1" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7l4 4 6-6" />
    </svg>
  )
}

function IconLink() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M5.5 8.5a2.5 2.5 0 003.54 0l1.67-1.67a2.5 2.5 0 00-3.54-3.54l-.83.83" />
      <path d="M8.5 5.5a2.5 2.5 0 00-3.54 0L3.29 7.17a2.5 2.5 0 003.54 3.54l.83-.83" />
    </svg>
  )
}

function IconBrain() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6C9.8 6 8 7.8 8 10c0 .7.2 1.4.5 2C7 12.5 6 13.7 6 15c0 1.1.5 2.1 1.3 2.7C7.1 18.1 7 18.5 7 19c0 2.2 1.8 4 4 4h2" />
      <path d="M20 6c2.2 0 4 1.8 4 4 0 .7-.2 1.4-.5 2 1.5.5 2.5 1.7 2.5 3 0 1.1-.5 2.1-1.3 2.7.2.4.3.8.3 1.3 0 2.2-1.8 4-4 4h-2" />
      <path d="M16 6v20" />
      <path d="M12 14h2M18 14h2M12 19h2M18 19h2" />
    </svg>
  )
}
