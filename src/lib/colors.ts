/**
 * Design tokens — single source of truth for colors.
 *
 * CSS custom properties are defined in globals.css (used in className / Tailwind).
 * These JS constants mirror them for use in style={{}} props.
 *
 * To change a color app-wide: edit BOTH the CSS var in globals.css AND the
 * matching constant here.
 */

// ── Brand (spy / primary action color) ────────────────────────────────────────
export const brand         = 'rgb(209,32,76)'       // main CTA buttons, accents, labels
export const brandDim      = 'rgba(209,32,76,0.85)' // slightly transparent (abstain btn, etc.)
export const brandSubtle   = 'rgba(209,32,76,0.12)' // tinted backgrounds
export const brandBorder   = 'rgba(209,32,76,0.4)'  // outlined elements
export const brandBorderStrong = 'rgba(209,32,76,0.5)' // stronger outlined elements
export const brandDark     = 'rgb(155,28,49)'        // selected states, step indicators
export const brandDarkSubtle = 'rgba(155,28,49,0.15)' // dark variant tinted bg
export const brandDarkBorder = 'rgba(155,28,49,0.4)' // dark variant border
export const brandDarkFaint  = 'rgba(155,28,49,0.08)' // dark variant faint bg
export const brandMuted    = '#804657'               // read-only selected state (non-host lobby)
export const readonlySelectedBg   = '#f0e0e0'        // non-interactive selected bg (non-host lobby)
export const readonlySelectedBorder = '#9ca3af'      // non-interactive selected border
export const readonlySelectedText = '#374151'        // text on readonlySelected bg

// ── Danger (errors, kick, destructive) ────────────────────────────────────────
export const danger        = '#ef4444'
export const dangerSubtle  = 'rgba(239,68,68,0.12)'
export const dangerBorder  = 'rgba(239,68,68,0.4)'
export const dangerFaint   = 'rgba(239,68,68,0.08)'
export const dangerLight   = '#f87171'

// ── Success (connected, voted, ready) ─────────────────────────────────────────
export const success       = '#22c55e'
export const successSubtle = 'rgba(34,197,94,0.10)'
export const successBorder = 'rgba(34,197,94,0.45)'

// ── Outcome (results screen verdict panels) ───────────────────────────────────
export const outcomeWinBgDark    = 'rgb(17,45,28)'
export const outcomeWinBgLight   = 'rgb(235,255,243)'
export const outcomeWinBorder    = 'rgba(0,147,54,0.68)'
export const outcomeWinGlow      = 'rgba(0,147,54,0.15)'
export const outcomeLossBgDark   = 'rgb(76,24,33)'
export const outcomeLossBgLight  = 'rgb(255,224,232)'
export const outcomeLossBorder   = 'rgba(200,60,80,0.65)'
export const outcomeLossGlow     = 'rgba(200,60,80,0.15)'
export const outcomeLossBorderLight = 'rgba(180,60,80,0.55)'

// ── Neutral status ─────────────────────────────────────────────────────────────
export const statusOffline = '#6b7280'  // disconnected player dot
export const toggleOff     = 'rgba(128,128,128,0.4)' // toggle switch off state
export const toggleOn      = '#16a34a'  // toggle switch on state

// ── Overlays / modal backdrops ─────────────────────────────────────────────────
export const overlay      = 'rgba(0,0,0,0.6)'
export const overlayHeavy = 'rgba(0,0,0,0.75)'

// ── Laptop/device frame (results page) ────────────────────────────────────────
export const frameDark  = '#222222'
export const frameLight = '#d0d0d0'

// ── Vote envelope cards ────────────────────────────────────────────────────────
export const voteCardDark        = '#3c0a17'
export const voteCardAccentDark  = '#5a1525'
export const voteCardLight       = '#fff0f3'
export const voteCardBorderLight = '#c06070'
export const voteCardFlapLight   = '#f0bcc8'

// ── Spy badge (results tally) ──────────────────────────────────────────────────
export const spyBadgeBg = 'rgba(161,10,10,0.93)'

// ── Toast notification ─────────────────────────────────────────────────────────
export const toastBg = 'rgba(30,0,0,0.85)'

// ── Accent text ───────────────────────────────────────────────────────────────
export const brandPink = '#fecdd3'  // light pink accent text

// ── Convenience: brand button styles (for style={{}} props) ───────────────────
export const btnPrimary = {
  background: brand,
  border: `1px solid ${brand}`,
  color: '#fff',
} as const

export const btnPrimaryDim = {
  background: brandDim,
  border: `1px solid ${brand}`,
  color: '#fff',
} as const

export const btnOutlined = {
  background: 'transparent',
  border: `1px solid ${brandBorder}`,
  color: brand,
} as const

export const btnDanger = {
  background: dangerSubtle,
  border: `1px solid ${dangerBorder}`,
  color: danger,
} as const

export const btnGhost = {
  background: 'transparent',
  border: 'none',
  color: 'var(--fg-subtle)',
} as const
