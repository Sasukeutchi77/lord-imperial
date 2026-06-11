// LORD IMPERIAL — 50 custom emojis exclusifs
// Chaque emoji est un SVG inline encodé en base64, rendu comme <Image>
// Format: { id, name, category, svg }
// L'id sert de code: :li_crown: etc.

export const CUSTOM_EMOJI_CATEGORIES = [
  {
    title: '👑 Royauté',
    emojis: [
      'li_crown',
      'li_throne',
      'li_scepter',
      'li_orb',
      'li_crown_dark',
      'li_imperial_seal',
      'li_royal_ring',
      'li_laurel',
      'li_medallion',
      'li_crown_fire',
    ],
  },
  {
    title: '⚔️ Combat',
    emojis: [
      'li_sword',
      'li_shield',
      'li_crossed_swords',
      'li_dagger',
      'li_axe',
      'li_armor',
      'li_bow',
      'li_spear',
      'li_katana',
      'li_battle_cry',
    ],
  },
  {
    title: '🔥 Puissance',
    emojis: [
      'li_dark_flame',
      'li_thunder',
      'li_skull_fire',
      'li_demon_eye',
      'li_shadow_orb',
      'li_blood_drop',
      'li_rune',
      'li_chaos_star',
      'li_dark_moon',
      'li_abyss',
    ],
  },
  {
    title: '💎 Prestige',
    emojis: [
      'li_gem',
      'li_gold_coin',
      'li_trophy',
      'li_star_lord',
      'li_diamond_black',
      'li_lock_gold',
      'li_key',
      'li_scroll',
      'li_sigil',
      'li_rank_badge',
    ],
  },
  {
    title: '😈 Ténèbres',
    emojis: [
      'li_demon',
      'li_skull',
      'li_reaper',
      'li_bat',
      'li_dark_heart',
      'li_broken_chain',
      'li_shadow_hand',
      'li_vortex',
      'li_cursed',
      'li_phantom',
    ],
  },
];

// All emojis flat
export const ALL_CUSTOM_EMOJIS = CUSTOM_EMOJI_CATEGORIES.flatMap((c) => c.emojis);

// SVG definitions for all 50 emojis
// Each returns an SVG string at 64×64 viewBox
const SVGS = {
  // ── ROYAUTÉ ──────────────────────────────────────────────────────────────
  li_crown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#C9956B"/></linearGradient></defs>
    <polygon points="8,48 14,22 26,36 32,12 38,36 50,22 56,48" fill="url(#g)" stroke="#8B6914" stroke-width="2" stroke-linejoin="round"/>
    <rect x="6" y="48" width="52" height="8" rx="4" fill="url(#g)" stroke="#8B6914" stroke-width="2"/>
    <circle cx="32" cy="12" r="4" fill="#FF4500"/>
    <circle cx="14" cy="22" r="3" fill="#FF4500"/>
    <circle cx="50" cy="22" r="3" fill="#FF4500"/>
  </svg>`,

  li_throne: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#C9956B"/><stop offset="100%" stop-color="#6B3A1F"/></linearGradient></defs>
    <rect x="16" y="6" width="32" height="38" rx="4" fill="url(#g)" stroke="#8B6914" stroke-width="2"/>
    <rect x="10" y="36" width="44" height="6" rx="3" fill="#8B6914"/>
    <rect x="14" y="42" width="8" height="16" rx="2" fill="url(#g)" stroke="#8B6914" stroke-width="1.5"/>
    <rect x="42" y="42" width="8" height="16" rx="2" fill="url(#g)" stroke="#8B6914" stroke-width="1.5"/>
    <polygon points="20,6 32,2 44,6 44,10 20,10" fill="#FFD700" stroke="#8B6914" stroke-width="1.5"/>
    <circle cx="32" cy="18" r="6" fill="#0D1117" stroke="#FFD700" stroke-width="2"/>
    <polygon points="32,13 33.5,17 37,17 34.5,19.5 35.5,23 32,21 28.5,23 29.5,19.5 27,17 30.5,17" fill="#FFD700"/>
  </svg>`,

  li_scepter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#C9956B"/></linearGradient></defs>
    <line x1="12" y1="58" x2="46" y2="10" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/>
    <circle cx="48" cy="8" r="10" fill="url(#g)" stroke="#8B6914" stroke-width="2"/>
    <circle cx="48" cy="8" r="5" fill="#FF4500"/>
    <circle cx="48" cy="8" r="2" fill="#FFD700"/>
  </svg>`,

  li_orb: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <radialGradient id="g" cx="35%" cy="30%"><stop offset="0%" stop-color="#A78BFA"/><stop offset="60%" stop-color="#5B21B6"/><stop offset="100%" stop-color="#1E0A3C"/></radialGradient>
    </defs>
    <circle cx="32" cy="34" r="22" fill="url(#g)" stroke="#7C3AED" stroke-width="2"/>
    <ellipse cx="25" cy="26" rx="8" ry="5" fill="rgba(255,255,255,0.2)" transform="rotate(-25,25,26)"/>
    <path d="M16,22 Q32,8 48,22" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" fill="none"/>
    <rect x="28" y="6" width="8" height="14" rx="3" fill="#C9956B" stroke="#8B6914" stroke-width="1.5"/>
    <rect x="24" y="4" width="16" height="5" rx="2.5" fill="#FFD700" stroke="#8B6914" stroke-width="1.5"/>
  </svg>`,

  li_crown_dark: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4B0082"/><stop offset="100%" stop-color="#1E0A3C"/></linearGradient></defs>
    <polygon points="8,48 14,22 26,36 32,12 38,36 50,22 56,48" fill="url(#g)" stroke="#7C3AED" stroke-width="2" stroke-linejoin="round"/>
    <rect x="6" y="48" width="52" height="8" rx="4" fill="url(#g)" stroke="#7C3AED" stroke-width="2"/>
    <circle cx="32" cy="12" r="4" fill="#A78BFA"/>
    <circle cx="14" cy="22" r="3" fill="#A78BFA"/>
    <circle cx="50" cy="22" r="3" fill="#A78BFA"/>
    <polygon points="8,48 14,22 26,36 32,12 38,36 50,22 56,48" fill="none" stroke="rgba(167,139,250,0.4)" stroke-width="1"/>
  </svg>`,

  li_imperial_seal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#C9956B"/></linearGradient></defs>
    <circle cx="32" cy="32" r="28" fill="#0D1117" stroke="url(#g)" stroke-width="3"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="url(#g)" stroke-width="1.5" stroke-dasharray="4 3"/>
    <polygon points="32,10 35,26 52,26 38,36 43,52 32,42 21,52 26,36 12,26 29,26" fill="url(#g)"/>
    <circle cx="32" cy="32" r="6" fill="#0D1117" stroke="url(#g)" stroke-width="2"/>
    <text x="32" y="36" text-anchor="middle" font-size="7" fill="#FFD700" font-family="serif" font-weight="bold">LI</text>
  </svg>`,

  li_royal_ring: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#C9956B"/></linearGradient></defs>
    <circle cx="32" cy="38" r="18" fill="none" stroke="url(#g)" stroke-width="7"/>
    <rect x="22" y="8" width="20" height="20" rx="4" fill="url(#g)" stroke="#8B6914" stroke-width="2"/>
    <rect x="26" y="12" width="12" height="12" rx="2" fill="#0D1117"/>
    <polygon points="32,13 33.5,17 37,17 34.5,19 35.5,23 32,21 28.5,23 29.5,19 27,17 30.5,17" fill="#FFD700"/>
  </svg>`,

  li_laurel: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4ADE80"/><stop offset="100%" stop-color="#166534"/></linearGradient></defs>
    <path d="M10,32 Q6,20 12,12 Q16,22 14,32" fill="url(#g)" stroke="#166534" stroke-width="1"/>
    <path d="M12,32 Q4,28 6,16 Q14,24 16,32" fill="url(#g)" stroke="#166534" stroke-width="1"/>
    <path d="M14,32 Q8,36 10,48 Q18,40 18,32" fill="url(#g)" stroke="#166534" stroke-width="1"/>
    <path d="M54,32 Q58,20 52,12 Q48,22 50,32" fill="url(#g)" stroke="#166534" stroke-width="1"/>
    <path d="M52,32 Q60,28 58,16 Q50,24 48,32" fill="url(#g)" stroke="#166534" stroke-width="1"/>
    <path d="M50,32 Q56,36 54,48 Q46,40 46,32" fill="url(#g)" stroke="#166534" stroke-width="1"/>
    <circle cx="32" cy="28" r="8" fill="#FFD700" stroke="#8B6914" stroke-width="2"/>
    <polygon points="32,22 33.5,26.5 38,26.5 34.5,29 35.7,33.5 32,31 28.3,33.5 29.5,29 26,26.5 30.5,26.5" fill="#8B6914"/>
  </svg>`,

  li_medallion: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" cx="35%" cy="30%" id="rg"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#8B6914"/></linearGradient></defs>
    <rect x="28" y="4" width="8" height="10" rx="2" fill="#C9956B" stroke="#8B6914" stroke-width="1.5"/>
    <line x1="32" y1="14" x2="32" y2="18" stroke="#8B6914" stroke-width="2"/>
    <circle cx="32" cy="38" r="20" fill="#FFD700" stroke="#8B6914" stroke-width="3"/>
    <circle cx="32" cy="38" r="15" fill="#C9956B" stroke="#8B6914" stroke-width="1.5"/>
    <polygon points="32,26 34,33 42,33 36,38 38,45 32,41 26,45 28,38 22,33 30,33" fill="#FFD700"/>
  </svg>`,

  li_crown_fire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF6B00"/><stop offset="100%" stop-color="#FF0000"/></linearGradient><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#C9956B"/></linearGradient></defs>
    <path d="M14,20 Q16,10 22,6 Q20,14 26,12 Q22,20 28,16 Q26,24 32,20 Q30,26 32,20 Q38,24 36,16 Q42,20 38,12 Q44,14 42,6 Q48,10 50,20" fill="url(#g)" opacity="0.85"/>
    <polygon points="10,50 16,28 26,40 32,16 38,40 48,28 54,50" fill="url(#cg)" stroke="#8B6914" stroke-width="2" stroke-linejoin="round"/>
    <rect x="8" y="50" width="48" height="7" rx="3.5" fill="url(#cg)" stroke="#8B6914" stroke-width="2"/>
  </svg>`,

  // ── COMBAT ────────────────────────────────────────────────────────────────
  li_sword: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#CBD5E1"/><stop offset="100%" stop-color="#64748B"/></linearGradient></defs>
    <line x1="52" y1="8" x2="14" y2="50" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/>
    <line x1="52" y1="8" x2="58" y2="14" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
    <line x1="38" y1="34" x2="26" y2="28" stroke="#C9956B" stroke-width="4" stroke-linecap="round"/>
    <line x1="38" y1="34" x2="44" y2="46" stroke="#C9956B" stroke-width="4" stroke-linecap="round"/>
    <rect x="10" y="46" width="8" height="12" rx="2" fill="#8B6914" transform="rotate(-45,14,52)"/>
  </svg>`,

  li_shield: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#1E3A5F"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <path d="M32,6 L56,16 L56,34 Q56,52 32,60 Q8,52 8,34 L8,16 Z" fill="url(#g)" stroke="#C9956B" stroke-width="3"/>
    <path d="M32,14 L48,22 L48,36 Q48,48 32,54 Q16,48 16,36 L16,22 Z" fill="none" stroke="rgba(201,149,107,0.4)" stroke-width="1.5"/>
    <polygon points="32,20 34,28 43,28 36,33 38.5,41 32,36.5 25.5,41 28,33 21,28 30,28" fill="#C9956B"/>
  </svg>`,

  li_crossed_swords: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E2E8F0"/><stop offset="100%" stop-color="#64748B"/></linearGradient></defs>
    <line x1="8" y1="8" x2="56" y2="56" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/>
    <line x1="56" y1="8" x2="8" y2="56" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/>
    <line x1="16" y1="26" x2="26" y2="16" stroke="#C9956B" stroke-width="4" stroke-linecap="round"/>
    <line x1="38" y1="48" x2="48" y2="38" stroke="#C9956B" stroke-width="4" stroke-linecap="round"/>
    <circle cx="32" cy="32" r="5" fill="#FFD700" stroke="#8B6914" stroke-width="2"/>
  </svg>`,

  li_dagger: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E2E8F0"/><stop offset="100%" stop-color="#475569"/></linearGradient></defs>
    <polygon points="32,4 36,28 32,32 28,28" fill="url(#g)" stroke="#64748B" stroke-width="1.5"/>
    <rect x="22" y="30" width="20" height="5" rx="2.5" fill="#C9956B" stroke="#8B6914" stroke-width="1.5"/>
    <rect x="28" y="35" width="8" height="22" rx="3" fill="#8B6914" stroke="#6B3A1F" stroke-width="1.5"/>
    <line x1="32" y1="10" x2="32" y2="28" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
  </svg>`,

  li_axe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#334155"/></linearGradient></defs>
    <line x1="14" y1="58" x2="46" y2="14" stroke="#8B6914" stroke-width="5" stroke-linecap="round"/>
    <path d="M46,14 Q58,6 58,20 Q58,32 46,28 Z" fill="url(#g)" stroke="#64748B" stroke-width="2"/>
    <path d="M38,22 Q30,10 42,8 Q40,18 38,22 Z" fill="url(#g)" stroke="#64748B" stroke-width="1.5"/>
  </svg>`,

  li_armor: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#475569"/><stop offset="100%" stop-color="#1E293B"/></linearGradient></defs>
    <path d="M20,10 L12,20 L12,44 L20,52 L44,52 L52,44 L52,20 L44,10 Z" fill="url(#g)" stroke="#64748B" stroke-width="2"/>
    <path d="M20,10 L32,6 L44,10" fill="none" stroke="#94A3B8" stroke-width="2"/>
    <path d="M12,28 L20,24 L20,40 L12,44" fill="rgba(148,163,184,0.15)" stroke="#64748B" stroke-width="1"/>
    <path d="M52,28 L44,24 L44,40 L52,44" fill="rgba(148,163,184,0.15)" stroke="#64748B" stroke-width="1"/>
    <path d="M20,24 L44,24 L44,40 L20,40 Z" fill="rgba(148,163,184,0.1)" stroke="#64748B" stroke-width="1"/>
    <path d="M26,24 Q32,20 38,24" fill="none" stroke="#C9956B" stroke-width="2"/>
    <polygon points="32,28 33.5,32 38,32 34.5,34.5 35.5,39 32,36.5 28.5,39 29.5,34.5 26,32 30.5,32" fill="#C9956B"/>
  </svg>`,

  li_bow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#92400E"/><stop offset="100%" stop-color="#451A03"/></linearGradient></defs>
    <path d="M16,6 Q4,32 16,58" fill="none" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/>
    <line x1="16" y1="6" x2="16" y2="58" stroke="#64748B" stroke-width="1.5" stroke-dasharray="4 3"/>
    <line x1="16" y1="32" x2="54" y2="32" stroke="#94A3B8" stroke-width="2"/>
    <polygon points="54,32 46,29 48,32 46,35" fill="#94A3B8"/>
    <line x1="28" y1="32" x2="28" y2="20" stroke="#C9956B" stroke-width="1" stroke-dasharray="3 2"/>
  </svg>`,

  li_spear: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#CBD5E1"/><stop offset="100%" stop-color="#475569"/></linearGradient></defs>
    <line x1="10" y1="58" x2="50" y2="18" stroke="#8B6914" stroke-width="4" stroke-linecap="round"/>
    <polygon points="50,18 42,20 44,26 56,10" fill="url(#g)" stroke="#64748B" stroke-width="1.5"/>
    <rect x="8" y="54" width="10" height="6" rx="2" fill="#6B3A1F" transform="rotate(-45,13,57)"/>
  </svg>`,

  li_katana: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#F1F5F9"/><stop offset="50%" stop-color="#E2E8F0"/><stop offset="100%" stop-color="#94A3B8"/></linearGradient></defs>
    <path d="M54,6 Q58,10 56,14 L14,54 Q10,52 10,48 Z" fill="url(#g)" stroke="#64748B" stroke-width="1.5"/>
    <line x1="10" y1="52" x2="16" y2="58" stroke="#8B6914" stroke-width="4" stroke-linecap="round"/>
    <rect x="26" y="34" width="16" height="5" rx="2" fill="#C9956B" stroke="#8B6914" stroke-width="1.5" transform="rotate(-45,34,36.5)"/>
    <line x1="30" y1="14" x2="48" y2="32" stroke="rgba(255,255,255,0.6)" stroke-width="1"/>
  </svg>`,

  li_battle_cry: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <circle cx="32" cy="28" r="16" fill="#CC0000" stroke="#8B0000" stroke-width="2"/>
    <path d="M22,24 Q28,18 32,28 Q36,18 42,24" fill="none" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="26" y="30" width="12" height="8" rx="1" fill="#0D1117"/>
    <line x1="30" y1="44" x2="24" y2="58" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>
    <line x1="34" y1="44" x2="40" y2="58" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>
    <path d="M12,10 Q8,8 10,14" stroke="#FF4500" stroke-width="2" fill="none"/>
    <path d="M52,10 Q56,8 54,14" stroke="#FF4500" stroke-width="2" fill="none"/>
    <path d="M10,22 Q4,18 8,26" stroke="#FF4500" stroke-width="2" fill="none"/>
    <path d="M54,22 Q60,18 56,26" stroke="#FF4500" stroke-width="2" fill="none"/>
  </svg>`,

  // ── PUISSANCE ─────────────────────────────────────────────────────────────
  li_dark_flame: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#7C3AED"/><stop offset="50%" stop-color="#4C1D95"/><stop offset="100%" stop-color="#1E0A3C"/></linearGradient></defs>
    <path d="M32,58 Q12,48 14,34 Q16,24 24,18 Q20,28 28,26 Q22,36 30,32 Q26,42 32,38 Q38,42 34,32 Q42,36 36,26 Q44,28 40,18 Q48,24 50,34 Q52,48 32,58 Z" fill="url(#g)" stroke="#7C3AED" stroke-width="1.5"/>
    <path d="M32,52 Q22,44 24,36 Q26,30 30,28 Q28,34 32,32 Q36,34 34,28 Q38,30 40,36 Q42,44 32,52 Z" fill="#A78BFA" opacity="0.4"/>
    <circle cx="32" cy="38" r="5" fill="#DDD6FE" opacity="0.5"/>
  </svg>`,

  li_thunder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FDE68A"/><stop offset="100%" stop-color="#F59E0B"/></linearGradient></defs>
    <polygon points="36,4 20,34 32,34 28,60 48,26 36,26" fill="url(#g)" stroke="#D97706" stroke-width="2" stroke-linejoin="round"/>
    <polygon points="36,4 20,34 32,34 28,60 48,26 36,26" fill="none" stroke="rgba(253,230,138,0.6)" stroke-width="1"/>
  </svg>`,

  li_skull_fire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="fg" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#FF4500"/><stop offset="100%" stop-color="#FFD700"/></linearGradient></defs>
    <path d="M32,52 Q18,44 18,30 Q18,14 32,10 Q46,14 46,30 Q46,44 32,52 Z" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2"/>
    <rect x="22" y="46" width="20" height="10" rx="2" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2"/>
    <line x1="28" y1="46" x2="28" y2="56" stroke="#CBD5E1" stroke-width="2"/>
    <line x1="34" y1="46" x2="34" y2="56" stroke="#CBD5E1" stroke-width="2"/>
    <ellipse cx="25" cy="32" rx="5" ry="6" fill="#0D1117"/>
    <ellipse cx="39" cy="32" rx="5" ry="6" fill="#0D1117"/>
    <path d="M28,42 Q32,44 36,42" fill="none" stroke="#CBD5E1" stroke-width="2"/>
    <path d="M24,10 Q20,4 26,2 Q24,8 28,7 Q24,12 28,10 Q26,14 32,12 Q30,16 32,14 Q34,16 32,12 Q38,14 36,10 Q40,12 38,7 Q42,8 40,2 Q46,4 40,10" fill="url(#fg)" opacity="0.9"/>
  </svg>`,

  li_demon_eye: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><radialGradient id="g" cx="50%" cy="50%"><stop offset="0%" stop-color="#FF4500"/><stop offset="60%" stop-color="#CC0000"/><stop offset="100%" stop-color="#450000"/></radialGradient></defs>
    <ellipse cx="32" cy="32" rx="28" ry="18" fill="#0D1117" stroke="#CC0000" stroke-width="2"/>
    <circle cx="32" cy="32" r="13" fill="url(#g)"/>
    <ellipse cx="32" cy="32" rx="4" ry="13" fill="#0D1117"/>
    <ellipse cx="27" cy="27" rx="3" ry="2" fill="rgba(255,255,255,0.25)" transform="rotate(-20,27,27)"/>
    <path d="M4,32 Q12,20 32,14 Q52,20 60,32" fill="none" stroke="#CC0000" stroke-width="1.5" opacity="0.5"/>
    <path d="M4,32 Q12,44 32,50 Q52,44 60,32" fill="none" stroke="#CC0000" stroke-width="1.5" opacity="0.5"/>
  </svg>`,

  li_shadow_orb: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><radialGradient id="g" cx="40%" cy="35%"><stop offset="0%" stop-color="#374151"/><stop offset="50%" stop-color="#111827"/><stop offset="100%" stop-color="#0D1117"/></radialGradient></defs>
    <circle cx="32" cy="32" r="26" fill="url(#g)" stroke="#374151" stroke-width="2"/>
    <ellipse cx="24" cy="24" rx="8" ry="5" fill="rgba(255,255,255,0.08)" transform="rotate(-20,24,24)"/>
    <path d="M20,44 Q32,36 44,44" stroke="rgba(167,139,250,0.4)" stroke-width="1.5" fill="none"/>
    <path d="M16,32 Q24,24 32,28 Q40,24 48,32" stroke="rgba(167,139,250,0.25)" stroke-width="1" fill="none"/>
    <circle cx="32" cy="32" r="6" fill="none" stroke="rgba(167,139,250,0.3)" stroke-width="1"/>
    <circle cx="32" cy="32" r="2" fill="rgba(167,139,250,0.6)"/>
  </svg>`,

  li_blood_drop: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><radialGradient id="g" cx="40%" cy="30%"><stop offset="0%" stop-color="#FF6B6B"/><stop offset="100%" stop-color="#7F1D1D"/></radialGradient></defs>
    <path d="M32,8 Q32,8 14,36 Q14,52 32,56 Q50,52 50,36 Q50,20 32,8 Z" fill="url(#g)" stroke="#991B1B" stroke-width="2"/>
    <ellipse cx="26" cy="30" rx="5" ry="3" fill="rgba(255,255,255,0.2)" transform="rotate(-20,26,30)"/>
    <path d="M22,48 Q32,52 42,48" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  </svg>`,

  li_rune: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#A78BFA"/><stop offset="100%" stop-color="#4C1D95"/></linearGradient></defs>
    <rect x="10" y="6" width="44" height="52" rx="4" fill="#0D1117" stroke="url(#g)" stroke-width="2.5"/>
    <line x1="32" y1="14" x2="32" y2="50" stroke="url(#g)" stroke-width="2.5"/>
    <line x1="20" y1="20" x2="32" y2="14" stroke="url(#g)" stroke-width="2.5"/>
    <line x1="44" y1="20" x2="32" y2="14" stroke="url(#g)" stroke-width="2.5"/>
    <line x1="20" y1="32" x2="44" y2="32" stroke="url(#g)" stroke-width="2"/>
    <line x1="20" y1="44" x2="32" y2="50" stroke="url(#g)" stroke-width="2.5"/>
    <line x1="44" y1="44" x2="32" y2="50" stroke="url(#g)" stroke-width="2.5"/>
    <circle cx="32" cy="32" r="3" fill="url(#g)"/>
  </svg>`,

  li_chaos_star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF4500"/><stop offset="100%" stop-color="#7C3AED"/></linearGradient></defs>
    <circle cx="32" cy="32" r="6" fill="url(#g)"/>
    <line x1="32" y1="4" x2="32" y2="26" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
    <line x1="32" y1="38" x2="32" y2="60" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
    <line x1="4" y1="32" x2="26" y2="32" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
    <line x1="38" y1="32" x2="60" y2="32" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
    <line x1="12" y1="12" x2="26" y2="26" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
    <line x1="38" y1="38" x2="52" y2="52" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
    <line x1="52" y1="12" x2="38" y2="26" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
    <line x1="26" y1="38" x2="12" y2="52" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
    <polygon points="32,4 34,10 32,8 30,10" fill="url(#g)"/>
    <polygon points="32,60 34,54 32,56 30,54" fill="url(#g)"/>
    <polygon points="4,32 10,30 8,32 10,34" fill="url(#g)"/>
    <polygon points="60,32 54,30 56,32 54,34" fill="url(#g)"/>
    <polygon points="12,12 16,18 13,14 18,16" fill="url(#g)"/>
    <polygon points="52,52 48,46 51,50 46,48" fill="url(#g)"/>
    <polygon points="52,12 46,16 50,13 48,18" fill="url(#g)"/>
    <polygon points="12,52 18,48 14,51 16,46" fill="url(#g)"/>
  </svg>`,

  li_dark_moon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1E0A3C"/><stop offset="100%" stop-color="#4C1D95"/></linearGradient></defs>
    <path d="M40,8 Q58,22 54,42 Q50,58 32,58 Q14,58 10,42 Q6,26 20,14 Q28,20 30,30 Q32,42 42,44 Q54,44 54,30 Q54,18 40,8 Z" fill="url(#g)" stroke="#7C3AED" stroke-width="2"/>
    <circle cx="22" cy="24" r="2" fill="#A78BFA" opacity="0.7"/>
    <circle cx="36" cy="44" r="1.5" fill="#A78BFA" opacity="0.5"/>
    <circle cx="28" cy="40" r="1" fill="#DDD6FE" opacity="0.4"/>
  </svg>`,

  li_abyss: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><radialGradient id="g" cx="50%" cy="50%"><stop offset="0%" stop-color="#4C1D95"/><stop offset="40%" stop-color="#1E0A3C"/><stop offset="100%" stop-color="#0D1117"/></radialGradient></defs>
    <circle cx="32" cy="32" r="28" fill="url(#g)" stroke="#4C1D95" stroke-width="2"/>
    <circle cx="32" cy="32" r="20" fill="none" stroke="rgba(124,58,237,0.3)" stroke-width="1.5"/>
    <circle cx="32" cy="32" r="13" fill="none" stroke="rgba(124,58,237,0.25)" stroke-width="1"/>
    <circle cx="32" cy="32" r="7" fill="none" stroke="rgba(124,58,237,0.2)" stroke-width="1"/>
    <circle cx="32" cy="32" r="3" fill="#7C3AED" opacity="0.6"/>
    <path d="M32,4 L32,60 M4,32 L60,32 M11,11 L53,53 M53,11 L11,53" stroke="rgba(124,58,237,0.1)" stroke-width="1"/>
  </svg>`,

  // ── PRESTIGE ──────────────────────────────────────────────────────────────
  li_gem: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#67E8F9"/><stop offset="50%" stop-color="#06B6D4"/><stop offset="100%" stop-color="#0E7490"/></linearGradient></defs>
    <polygon points="20,10 44,10 56,30 32,58 8,30" fill="url(#g)" stroke="#0E7490" stroke-width="2"/>
    <polygon points="20,10 44,10 32,24" fill="rgba(255,255,255,0.3)"/>
    <polygon points="8,30 20,10 32,24" fill="rgba(255,255,255,0.15)"/>
    <polygon points="56,30 44,10 32,24" fill="rgba(0,0,0,0.1)"/>
  </svg>`,

  li_gold_coin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><radialGradient id="g" cx="40%" cy="35%"><stop offset="0%" stop-color="#FDE68A"/><stop offset="70%" stop-color="#F59E0B"/><stop offset="100%" stop-color="#92400E"/></radialGradient></defs>
    <circle cx="32" cy="32" r="26" fill="url(#g)" stroke="#92400E" stroke-width="3"/>
    <circle cx="32" cy="32" r="20" fill="none" stroke="rgba(146,64,14,0.4)" stroke-width="1.5"/>
    <text x="32" y="38" text-anchor="middle" font-size="22" fill="#92400E" font-family="serif" font-weight="bold">$</text>
  </svg>`,

  li_trophy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FDE68A"/><stop offset="100%" stop-color="#D97706"/></linearGradient></defs>
    <path d="M18,8 L18,30 Q18,46 32,48 Q46,46 46,30 L46,8 Z" fill="url(#g)" stroke="#92400E" stroke-width="2"/>
    <path d="M18,14 Q8,14 8,24 Q8,34 18,34" fill="none" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/>
    <path d="M46,14 Q56,14 56,24 Q56,34 46,34" fill="none" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/>
    <rect x="26" y="48" width="12" height="8" fill="url(#g)" stroke="#92400E" stroke-width="2"/>
    <rect x="20" y="56" width="24" height="5" rx="2.5" fill="url(#g)" stroke="#92400E" stroke-width="2"/>
    <polygon points="32,16 33.5,21 38,21 34.5,24 35.7,29 32,26 28.3,29 29.5,24 26,21 30.5,21" fill="#92400E"/>
  </svg>`,

  li_star_lord: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#FF8C00"/></linearGradient></defs>
    <polygon points="32,4 38,22 58,22 43,34 49,52 32,40 15,52 21,34 6,22 26,22" fill="url(#g)" stroke="#D97706" stroke-width="2" stroke-linejoin="round"/>
    <polygon points="32,14 36,24 46,24 38,30 41,40 32,34 23,40 26,30 18,24 28,24" fill="rgba(255,255,255,0.2)"/>
  </svg>`,

  li_diamond_black: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#374151"/><stop offset="50%" stop-color="#111827"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <polygon points="32,6 56,30 32,58 8,30" fill="url(#g)" stroke="#4B5563" stroke-width="2"/>
    <polygon points="32,6 56,30 32,24" fill="rgba(255,255,255,0.08)"/>
    <polygon points="8,30 32,24 32,6" fill="rgba(255,255,255,0.04)"/>
    <polygon points="56,30 32,24 32,58" fill="rgba(0,0,0,0.3)"/>
    <polygon points="8,30 32,24 32,58" fill="rgba(0,0,0,0.15)"/>
  </svg>`,

  li_lock_gold: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#C9956B"/></linearGradient></defs>
    <path d="M20,28 Q20,12 32,12 Q44,12 44,28" fill="none" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/>
    <rect x="12" y="28" width="40" height="30" rx="6" fill="url(#g)" stroke="#92400E" stroke-width="2"/>
    <circle cx="32" cy="40" r="6" fill="#0D1117" stroke="#92400E" stroke-width="2"/>
    <rect x="30" y="40" width="4" height="10" rx="2" fill="#0D1117"/>
  </svg>`,

  li_key: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#C9956B"/></linearGradient></defs>
    <circle cx="20" cy="22" r="14" fill="none" stroke="url(#g)" stroke-width="5"/>
    <circle cx="20" cy="22" r="6" fill="none" stroke="url(#g)" stroke-width="3"/>
    <line x1="30" y1="30" x2="56" y2="54" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/>
    <line x1="44" y1="44" x2="50" y2="38" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
    <line x1="50" y1="50" x2="56" y2="44" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
  </svg>`,

  li_scroll: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#FEF3C7"/><stop offset="100%" stop-color="#FDE68A"/></linearGradient></defs>
    <rect x="14" y="10" width="36" height="44" rx="4" fill="url(#g)" stroke="#D97706" stroke-width="2"/>
    <path d="M14,10 Q8,10 8,20 Q8,30 14,30" fill="none" stroke="#D97706" stroke-width="4" stroke-linecap="round"/>
    <path d="M14,34 Q8,34 8,44 Q8,54 14,54" fill="none" stroke="#D97706" stroke-width="4" stroke-linecap="round"/>
    <line x1="20" y1="22" x2="44" y2="22" stroke="#92400E" stroke-width="2" stroke-linecap="round"/>
    <line x1="20" y1="30" x2="44" y2="30" stroke="#92400E" stroke-width="2" stroke-linecap="round"/>
    <line x1="20" y1="38" x2="36" y2="38" stroke="#92400E" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  li_sigil: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF4500"/><stop offset="100%" stop-color="#7C3AED"/></linearGradient></defs>
    <circle cx="32" cy="32" r="26" fill="#0D1117" stroke="url(#g)" stroke-width="2"/>
    <path d="M32,10 L38,28 L56,28 L42,38 L47,56 L32,46 L17,56 L22,38 L8,28 L26,28 Z" fill="none" stroke="url(#g)" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="32" cy="32" r="8" fill="none" stroke="url(#g)" stroke-width="1.5"/>
    <line x1="32" y1="24" x2="32" y2="40" stroke="url(#g)" stroke-width="1.5"/>
    <line x1="24" y1="32" x2="40" y2="32" stroke="url(#g)" stroke-width="1.5"/>
  </svg>`,

  li_rank_badge: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#C9956B"/><stop offset="100%" stop-color="#8B6914"/></linearGradient></defs>
    <path d="M32,6 L54,18 L54,42 L32,58 L10,42 L10,18 Z" fill="url(#g)" stroke="#6B3A1F" stroke-width="2.5"/>
    <path d="M32,14 L48,24 L48,40 L32,50 L16,40 L16,24 Z" fill="#0D1117" stroke="rgba(201,149,107,0.4)" stroke-width="1"/>
    <polygon points="32,22 34,28 41,28 35.5,32 37.5,38 32,34.5 26.5,38 28.5,32 23,28 30,28" fill="#FFD700"/>
    <text x="32" y="48" text-anchor="middle" font-size="8" fill="#FFD700" font-family="serif" font-weight="bold">LORD</text>
  </svg>`,

  // ── TÉNÈBRES ──────────────────────────────────────────────────────────────
  li_demon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#CC0000"/><stop offset="100%" stop-color="#450000"/></linearGradient></defs>
    <path d="M10,10 L22,24" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
    <path d="M54,10 L42,24" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
    <path d="M14,8 L18,20" stroke="url(#g)" stroke-width="3" stroke-linecap="round"/>
    <path d="M50,8 L46,20" stroke="url(#g)" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="32" cy="38" rx="20" ry="18" fill="url(#g)" stroke="#7F1D1D" stroke-width="2"/>
    <ellipse cx="24" cy="34" rx="5" ry="6" fill="#FFD700"/>
    <ellipse cx="40" cy="34" rx="5" ry="6" fill="#FFD700"/>
    <ellipse cx="24" cy="35" rx="2.5" ry="4" fill="#0D1117"/>
    <ellipse cx="40" cy="35" rx="2.5" ry="4" fill="#0D1117"/>
    <path d="M22,46 Q27,50 32,48 Q37,50 42,46" fill="none" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="26" y1="48" x2="26" y2="52" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
    <line x1="32" y1="50" x2="32" y2="54" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
    <line x1="38" y1="48" x2="38" y2="52" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  li_skull: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <path d="M32,54 Q16,48 16,32 Q16,12 32,8 Q48,12 48,32 Q48,48 32,54 Z" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
    <rect x="22" y="48" width="20" height="10" rx="2" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
    <line x1="28" y1="48" x2="28" y2="58" stroke="#94A3B8" stroke-width="2"/>
    <line x1="34" y1="48" x2="34" y2="58" stroke="#94A3B8" stroke-width="2"/>
    <line x1="40" y1="48" x2="40" y2="58" stroke="#94A3B8" stroke-width="2"/>
    <ellipse cx="24" cy="32" rx="6" ry="7" fill="#0D1117"/>
    <ellipse cx="40" cy="32" rx="6" ry="7" fill="#0D1117"/>
    <path d="M26,44 Q32,46 38,44" fill="none" stroke="#94A3B8" stroke-width="2"/>
    <ellipse cx="24" cy="30" rx="2" ry="1.5" fill="rgba(255,255,255,0.3)"/>
    <ellipse cx="40" cy="30" rx="2" ry="1.5" fill="rgba(255,255,255,0.3)"/>
  </svg>`,

  li_reaper: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#1F2937"/><stop offset="100%" stop-color="#030712"/></linearGradient></defs>
    <path d="M14,6 Q28,4 36,14 Q44,4 54,8 Q44,18 40,26 L48,58 L36,54 L32,40 L28,54 L16,58 L24,26 Q18,18 14,6 Z" fill="url(#g)" stroke="#374151" stroke-width="2"/>
    <ellipse cx="32" cy="16" rx="10" ry="8" fill="#E2E8F0"/>
    <ellipse cx="28" cy="15" rx="3" ry="3.5" fill="#0D1117"/>
    <ellipse cx="36" cy="15" rx="3" ry="3.5" fill="#0D1117"/>
    <path d="M26,22 Q32,24 38,22" fill="none" stroke="#374151" stroke-width="1.5"/>
    <line x1="46" y1="10" x2="58" y2="8" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
    <path d="M58,8 Q62,4 60,0 Q56,2 58,8 Z" fill="#94A3B8"/>
  </svg>`,

  li_bat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1F2937"/><stop offset="100%" stop-color="#111827"/></linearGradient></defs>
    <path d="M32,36 Q20,28 8,32 Q4,24 12,18 Q20,16 24,26 Q28,18 32,20 Q36,18 40,26 Q44,16 52,18 Q60,24 56,32 Q44,28 32,36 Z" fill="url(#g)" stroke="#374151" stroke-width="1.5"/>
    <ellipse cx="32" cy="40" rx="8" ry="6" fill="url(#g)" stroke="#374151" stroke-width="1.5"/>
    <ellipse cx="28" cy="39" rx="2.5" ry="2.5" fill="#CC0000"/>
    <ellipse cx="36" cy="39" rx="2.5" ry="2.5" fill="#CC0000"/>
    <path d="M28,44 Q32,46 36,44" fill="none" stroke="#374151" stroke-width="1.5"/>
    <line x1="30" y1="32" x2="26" y2="46" stroke="#374151" stroke-width="1" opacity="0.5"/>
    <line x1="34" y1="32" x2="38" y2="46" stroke="#374151" stroke-width="1" opacity="0.5"/>
  </svg>`,

  li_dark_heart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4C1D95"/><stop offset="100%" stop-color="#1E0A3C"/></linearGradient></defs>
    <path d="M32,54 Q8,40 8,24 Q8,12 20,12 Q26,12 32,20 Q38,12 44,12 Q56,12 56,24 Q56,40 32,54 Z" fill="url(#g)" stroke="#7C3AED" stroke-width="2.5"/>
    <path d="M32,46 Q18,36 18,26 Q18,20 24,20 Q28,20 32,26 Q36,20 40,20 Q46,20 46,26 Q46,36 32,46 Z" fill="none" stroke="rgba(167,139,250,0.3)" stroke-width="1"/>
    <path d="M22,22 Q28,16 32,22" fill="none" stroke="rgba(167,139,250,0.4)" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  li_broken_chain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#64748B"/><stop offset="100%" stop-color="#1E293B"/></linearGradient></defs>
    <rect x="6" y="18" width="18" height="12" rx="6" fill="none" stroke="url(#g)" stroke-width="4"/>
    <rect x="40" y="34" width="18" height="12" rx="6" fill="none" stroke="url(#g)" stroke-width="4"/>
    <line x1="24" y1="24" x2="30" y2="20" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
    <line x1="34" y1="44" x2="40" y2="40" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
    <line x1="30" y1="20" x2="34" y2="44" stroke="#CC0000" stroke-width="2" stroke-dasharray="3 3"/>
    <circle cx="32" cy="32" r="3" fill="#CC0000"/>
  </svg>`,

  li_shadow_hand: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1F2937"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <path d="M18,58 L18,34 Q18,28 22,28 L22,18 Q22,14 26,14 L26,22 Q28,16 32,16 Q36,16 36,22 L36,18 Q38,14 42,16 Q46,18 44,24 L46,24 Q50,24 50,30 L50,40 Q50,52 40,58 Z" fill="url(#g)" stroke="#374151" stroke-width="2"/>
    <line x1="26" y1="14" x2="26" y2="28" stroke="#4B5563" stroke-width="1" opacity="0.5"/>
    <line x1="32" y1="16" x2="32" y2="28" stroke="#4B5563" stroke-width="1" opacity="0.5"/>
    <line x1="38" y1="18" x2="38" y2="28" stroke="#4B5563" stroke-width="1" opacity="0.5"/>
    <path d="M22,44 Q28,40 36,42 Q44,40 48,46" fill="none" stroke="rgba(124,58,237,0.4)" stroke-width="1.5"/>
  </svg>`,

  li_vortex: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7C3AED"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <path d="M32,32 Q48,16 52,32 Q56,48 32,52 Q8,48 12,32 Q16,16 32,20 Q48,24 44,32 Q40,40 32,38 Q24,36 26,32 Q28,28 32,30" fill="none" stroke="url(#g)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="32" cy="32" r="4" fill="#7C3AED"/>
    <circle cx="32" cy="32" r="2" fill="#DDD6FE"/>
  </svg>`,

  li_cursed: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#064E3B"/><stop offset="100%" stop-color="#022C22"/></linearGradient></defs>
    <circle cx="32" cy="32" r="24" fill="url(#g)" stroke="#10B981" stroke-width="2"/>
    <path d="M18,20 Q26,8 38,12 Q50,16 46,28" fill="none" stroke="#34D399" stroke-width="2"/>
    <path d="M18,44 Q26,56 38,52 Q50,48 46,36" fill="none" stroke="#34D399" stroke-width="2"/>
    <path d="M20,32 Q20,24 32,22 Q44,24 44,32 Q44,40 32,42 Q20,40 20,32 Z" fill="none" stroke="#10B981" stroke-width="1.5" stroke-dasharray="3 2"/>
    <text x="32" y="37" text-anchor="middle" font-size="14" fill="#34D399" font-family="serif">✕</text>
    <circle cx="20" cy="14" r="2" fill="#34D399" opacity="0.7"/>
    <circle cx="44" cy="50" r="2" fill="#34D399" opacity="0.7"/>
    <circle cx="44" cy="14" r="1.5" fill="#34D399" opacity="0.5"/>
    <circle cx="20" cy="50" r="1.5" fill="#34D399" opacity="0.5"/>
  </svg>`,

  li_phantom: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="rgba(167,139,250,0.8)"/><stop offset="100%" stop-color="rgba(76,29,149,0.3)"/></linearGradient></defs>
    <path d="M16,56 L16,30 Q16,10 32,10 Q48,10 48,30 L48,56 Q42,48 38,56 Q34,48 32,56 Q30,48 26,56 Q22,48 16,56 Z" fill="url(#g)" stroke="rgba(167,139,250,0.5)" stroke-width="2"/>
    <ellipse cx="26" cy="30" rx="5" ry="6" fill="rgba(13,17,23,0.8)"/>
    <ellipse cx="38" cy="30" rx="5" ry="6" fill="rgba(13,17,23,0.8)"/>
    <ellipse cx="26" cy="29" rx="2" ry="1.5" fill="rgba(167,139,250,0.6)"/>
    <ellipse cx="38" cy="29" rx="2" ry="1.5" fill="rgba(167,139,250,0.6)"/>
    <path d="M24,40 Q32,44 40,40" fill="none" stroke="rgba(167,139,250,0.5)" stroke-width="1.5"/>
  </svg>`,
};

// Convert SVG string → data URI usable as Image source
export const getCustomEmojiSource = (id) => {
  const svg = SVGS[id];
  if (!svg) return null;
  const encoded = encodeURIComponent(svg.trim().replace(/\n\s*/g, ' '));
  return { uri: `data:image/svg+xml;charset=utf-8,${encoded}` };
};

// For inserting into text messages: use a short code like :li_crown:
export const toEmojiCode = (id) => `:${id}:`;
export const fromEmojiCode = (code) => code.replace(/^:|:$/g, '');
export const isCustomEmojiCode = (str) => /^:li_[a-z_]+:$/.test(str);

// Parse a message text and split into segments [{type:'text',value} | {type:'emoji',id}]
export const parseMessageWithCustomEmojis = (text = '') => {
  const parts = text.split(/(:li_[a-z_]+:)/g);
  return parts
    .filter(Boolean)
    .map((part) =>
      isCustomEmojiCode(part)
        ? { type: 'emoji', id: fromEmojiCode(part) }
        : { type: 'text', value: part }
    );
};
