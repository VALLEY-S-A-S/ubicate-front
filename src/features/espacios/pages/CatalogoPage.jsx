import { useState } from 'react'
import CategoriasAdmin from '../components/CategoriasAdmin'
import ElementosAdmin from '../components/ElementosAdmin'
import '../styles/espacios.css'

export default function CatalogoPage({ token }) {
  const [tab, setTab] = useState('elementos')

  return (
    <section className="catalogo-page">
      <header className="gestion-espacios__intro">
        <h2>Catálogo de inventario</h2>
        <p>Gestiona los elementos y categorías disponibles para el inventario de los espacios.</p>
      </header>

      <div className="catalogo-tabs">
        <button
          type="button"
          className={`catalogo-tab${tab === 'elementos' ? ' catalogo-tab--active' : ''}`}
          onClick={() => setTab('elementos')}
        >
          Elementos
        </button>
        <button
          type="button"
          className={`catalogo-tab${tab === 'categorias' ? ' catalogo-tab--active' : ''}`}
          onClick={() => setTab('categorias')}
        >
          Categorías
        </button>
      </div>

      {tab === 'elementos' ? (
        <ElementosAdmin token={token} />
      ) : (
        <CategoriasAdmin token={token} />
      )}
    </section>
  )
}
