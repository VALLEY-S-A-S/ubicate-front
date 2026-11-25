const COL = {
  primary: 'var(--icon-primary, #a11c1f)',
  primaryDark: 'var(--icon-primary-dark, #741013)',
  calendarBody: 'var(--icon-calendar-body, #f6d3d7)',
  date: 'var(--icon-date, #c96b78)',
  tint: 'var(--icon-tint, #fde8ea)',
  blob: 'var(--icon-blob, #fbe3e6)',
  excel: '#1d8348',
  folio: '#ffffff',
}

// Ilustración del módulo importar horarios: mancha de fondo, calendario y
// archivo Excel. Los colores del tema salen de variables CSS con valor por
// defecto, así hereda el primario del aplicativo sin duplicar hex.
export default function ImportarHorariosIlustracion({ className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 200"
      role="img"
      aria-label="Calendario con archivo Excel"
      width="200"
      height="167"
      className={className}
    >
      <defs>
        <filter
          id="horarios-soft-shadow"
          x="-20%"
          y="-20%"
          width="150%"
          height="150%"
        >
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="6"
            flood-color="#000"
            floodOpacity="0.14"
          />
        </filter>
      </defs>

      {/* Fondo: mancha orgánica */}
      <path
        fill={COL.blob}
        d="M120 14c40-6 82 18 92 56 9 34-8 56-22 78-18 28-58 44-92 34-36-10-70-32-76-70-6-40 20-92 98-98z"
      />

      {/* Calendario */}
      <g filter="url(#horarios-soft-shadow)">
        <rect
          x="46"
          y="46"
          width="116"
          height="108"
          rx="14"
          fill={COL.calendarBody}
        />
        <path
          d="M46 60a14 14 0 0 1 14-14h88a14 14 0 0 1 14 14v14H46z"
          fill={COL.primaryDark}
        />
      </g>

      {/* Anillas del calendario */}
      <rect x="72" y="34" width="12" height="26" rx="6" fill={COL.tint} />
      <rect x="124" y="34" width="12" height="26" rx="6" fill={COL.tint} />

      {/* Cuadrícula de fechas 4x3 */}
      <g fill={COL.date}>
        <rect x="60" y="88" width="16" height="14" rx="4" />
        <rect x="82" y="88" width="16" height="14" rx="4" />
        <rect x="104" y="88" width="16" height="14" rx="4" />
        <rect x="126" y="88" width="16" height="14" rx="4" />
        <rect x="60" y="110" width="16" height="14" rx="4" />
        <rect x="82" y="110" width="16" height="14" rx="4" />
        <rect x="104" y="110" width="16" height="14" rx="4" />
        <rect x="126" y="110" width="16" height="14" rx="4" />
        <rect x="60" y="132" width="16" height="14" rx="4" />
        <rect x="82" y="132" width="16" height="14" rx="4" />
      </g>

      {/* Archivo Excel encima del calendario */}
      <g filter="url(#horarios-soft-shadow)">
        <path
          fill={COL.folio}
          d="M112 96a8 8 0 0 1 8-8h42l26 26v62a8 8 0 0 1-8 8h-60a8 8 0 0 1-8-8z"
        />
        <path
          fill={COL.tint}
          opacity="0.6"
          d="M162 88v18a8 8 0 0 0 8 8h18z"
        />
      </g>

      {/* Hoja verde con la X de Excel */}
      <rect x="124" y="126" width="40" height="40" rx="8" fill={COL.excel} />
      <path
        d="M134 136L154 156M154 136L134 156"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}
