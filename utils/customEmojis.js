// LORD IMPERIAL — 110 custom emojis exclusifs
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
  {
    title: '🌌 Cosmos',
    emojis: [
      'li_black_hole',
      'li_nova',
      'li_comet',
      'li_nebula',
      'li_astral',
      'li_eclipse',
    ],
  },
  {
    title: '🧬 Arcane',
    emojis: [
      'li_hexagram',
      'li_eye_of_fate',
      'li_serpent',
      'li_crystal_skull',
      'li_grimoire',
      'li_infinity_seal',
    ],
  },
  {
    title: '⚗️ Alchimie',
    emojis: [
      'li_potion',
      'li_elixir',
      'li_transmute',
      'li_philosopher_stone',
      'li_mercury',
      'li_sulfur',
    ],
  },
  {
    title: '🩸 Rage',
    emojis: [
      'li_rage_face',
      'li_war_horn',
      'li_berserker',
      'li_wrath',
      'li_inferno_fist',
      'li_thunderclap',
    ],
  },
  {
    title: '🏆 Gloire',
    emojis: [
      'li_empire_flag',
      'li_golden_throne',
      'li_victor_wreath',
      'li_imperial_eagle',
      'li_crown_of_thorns',
      'li_sovereign',
    ],
  },
  {
    title: '🐉 Créatures',
    emojis: [
      'li_dragon',
      'li_hydra',
      'li_cerberus',
      'li_phoenix',
      'li_leviathan',
      'li_chimera',
    ],
  },
  {
    title: '💀 Nécromancie',
    emojis: [
      'li_bone_wand',
      'li_soul_jar',
      'li_grave',
      'li_undead',
      'li_death_clock',
      'li_lich_crown',
    ],
  },
  {
    title: '🌊 Abysses',
    emojis: [
      'li_kraken',
      'li_deep_eye',
      'li_whirlpool',
      'li_sunken_ship',
      'li_abyssal_fish',
      'li_coral_dark',
    ],
  },
  {
    title: '🌿 Nature Sombre',
    emojis: [
      'li_dead_tree',
      'li_thorn_rose',
      'li_poison_spore',
      'li_night_lotus',
      'li_gnarled_root',
      'li_eclipse_flower',
    ],
  },
  {
    title: '🏰 Forteresse',
    emojis: [
      'li_dark_tower',
      'li_portcullis',
      'li_watchtower',
      'li_throne_room',
      'li_dungeon',
      'li_imperial_gate',
    ],
  },
];

// All emojis flat
export const ALL_CUSTOM_EMOJIS = CUSTOM_EMOJI_CATEGORIES.flatMap((c) => c.emojis);

// SVG definitions for all 110 emojis
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
    <defs><radialGradient id="g" cx="35%" cy="30%"><stop offset="0%" stop-color="#A78BFA"/><stop offset="60%" stop-color="#5B21B6"/><stop offset="100%" stop-color="#1E0A3C"/></radialGradient></defs>
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
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#8B6914"/></linearGradient></defs>
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
    <path d="M26,24 Q32,20 38,24" fill="none" stroke="#C9956B" stroke-width="2"/>
    <polygon points="32,28 33.5,32 38,32 34.5,34.5 35.5,39 32,36.5 28.5,39 29.5,34.5 26,32 30.5,32" fill="#C9956B"/>
  </svg>`,

  li_bow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#92400E"/><stop offset="100%" stop-color="#451A03"/></linearGradient></defs>
    <path d="M16,6 Q4,32 16,58" fill="none" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/>
    <line x1="16" y1="6" x2="16" y2="58" stroke="#64748B" stroke-width="1.5" stroke-dasharray="4 3"/>
    <line x1="16" y1="32" x2="54" y2="32" stroke="#94A3B8" stroke-width="2"/>
    <polygon points="54,32 46,29 48,32 46,35" fill="#94A3B8"/>
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
    <path d="M10,22 Q4,18 8,26" stroke="#FF4500" stroke-width="2" fill="none"/>
    <path d="M54,22 Q60,18 56,26" stroke="#FF4500" stroke-width="2" fill="none"/>
  </svg>`,

  // ── PUISSANCE ─────────────────────────────────────────────────────────────
  li_dark_flame: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#7C3AED"/><stop offset="50%" stop-color="#4C1D95"/><stop offset="100%" stop-color="#1E0A3C"/></linearGradient></defs>
    <path d="M32,58 Q12,48 14,34 Q16,24 24,18 Q20,28 28,26 Q22,36 30,32 Q26,42 32,38 Q38,42 34,32 Q42,36 36,26 Q44,28 40,18 Q48,24 50,34 Q52,48 32,58 Z" fill="url(#g)" stroke="#7C3AED" stroke-width="1.5"/>
    <circle cx="32" cy="38" r="5" fill="#DDD6FE" opacity="0.5"/>
  </svg>`,

  li_thunder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FDE68A"/><stop offset="100%" stop-color="#F59E0B"/></linearGradient></defs>
    <polygon points="36,4 20,34 32,34 28,60 48,26 36,26" fill="url(#g)" stroke="#D97706" stroke-width="2" stroke-linejoin="round"/>
  </svg>`,

  li_skull_fire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="fg" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#FF4500"/><stop offset="100%" stop-color="#FFD700"/></linearGradient></defs>
    <path d="M32,52 Q18,44 18,30 Q18,14 32,10 Q46,14 46,30 Q46,44 32,52 Z" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2"/>
    <rect x="22" y="46" width="20" height="10" rx="2" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2"/>
    <line x1="28" y1="46" x2="28" y2="56" stroke="#CBD5E1" stroke-width="2"/>
    <line x1="34" y1="46" x2="34" y2="56" stroke="#CBD5E1" stroke-width="2"/>
    <ellipse cx="25" cy="32" rx="5" ry="6" fill="#0D1117"/>
    <ellipse cx="39" cy="32" rx="5" ry="6" fill="#0D1117"/>
    <path d="M24,10 Q20,4 26,2 Q24,8 28,7 Q24,12 28,10 Q26,14 32,12 Q30,16 32,14 Q34,16 32,12 Q38,14 36,10 Q40,12 38,7 Q42,8 40,2 Q46,4 40,10" fill="url(#fg)" opacity="0.9"/>
  </svg>`,

  li_demon_eye: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><radialGradient id="g" cx="50%" cy="50%"><stop offset="0%" stop-color="#FF4500"/><stop offset="60%" stop-color="#CC0000"/><stop offset="100%" stop-color="#450000"/></radialGradient></defs>
    <ellipse cx="32" cy="32" rx="28" ry="18" fill="#0D1117" stroke="#CC0000" stroke-width="2"/>
    <circle cx="32" cy="32" r="13" fill="url(#g)"/>
    <ellipse cx="32" cy="32" rx="4" ry="13" fill="#0D1117"/>
    <ellipse cx="27" cy="27" rx="3" ry="2" fill="rgba(255,255,255,0.25)" transform="rotate(-20,27,27)"/>
  </svg>`,

  li_shadow_orb: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><radialGradient id="g" cx="40%" cy="35%"><stop offset="0%" stop-color="#374151"/><stop offset="50%" stop-color="#111827"/><stop offset="100%" stop-color="#0D1117"/></radialGradient></defs>
    <circle cx="32" cy="32" r="26" fill="url(#g)" stroke="#374151" stroke-width="2"/>
    <ellipse cx="24" cy="24" rx="8" ry="5" fill="rgba(255,255,255,0.08)" transform="rotate(-20,24,24)"/>
    <circle cx="32" cy="32" r="2" fill="rgba(167,139,250,0.6)"/>
  </svg>`,

  li_blood_drop: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><radialGradient id="g" cx="40%" cy="30%"><stop offset="0%" stop-color="#FF6B6B"/><stop offset="100%" stop-color="#7F1D1D"/></radialGradient></defs>
    <path d="M32,8 Q32,8 14,36 Q14,52 32,56 Q50,52 50,36 Q50,20 32,8 Z" fill="url(#g)" stroke="#991B1B" stroke-width="2"/>
    <ellipse cx="26" cy="30" rx="5" ry="3" fill="rgba(255,255,255,0.2)" transform="rotate(-20,26,30)"/>
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
  </svg>`,

  li_dark_moon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1E0A3C"/><stop offset="100%" stop-color="#4C1D95"/></linearGradient></defs>
    <path d="M40,8 Q58,22 54,42 Q50,58 32,58 Q14,58 10,42 Q6,26 20,14 Q28,20 30,30 Q32,42 42,44 Q54,44 54,30 Q54,18 40,8 Z" fill="url(#g)" stroke="#7C3AED" stroke-width="2"/>
    <circle cx="22" cy="24" r="2" fill="#A78BFA" opacity="0.7"/>
    <circle cx="36" cy="44" r="1.5" fill="#A78BFA" opacity="0.5"/>
  </svg>`,

  li_abyss: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><radialGradient id="g" cx="50%" cy="50%"><stop offset="0%" stop-color="#4C1D95"/><stop offset="40%" stop-color="#1E0A3C"/><stop offset="100%" stop-color="#0D1117"/></radialGradient></defs>
    <circle cx="32" cy="32" r="28" fill="url(#g)" stroke="#4C1D95" stroke-width="2"/>
    <circle cx="32" cy="32" r="20" fill="none" stroke="rgba(124,58,237,0.3)" stroke-width="1.5"/>
    <circle cx="32" cy="32" r="13" fill="none" stroke="rgba(124,58,237,0.25)" stroke-width="1"/>
    <circle cx="32" cy="32" r="3" fill="#7C3AED" opacity="0.6"/>
  </svg>`,

  // ── PRESTIGE ──────────────────────────────────────────────────────────────
  li_gem: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#67E8F9"/><stop offset="50%" stop-color="#06B6D4"/><stop offset="100%" stop-color="#0E7490"/></linearGradient></defs>
    <polygon points="20,10 44,10 56,30 32,58 8,30" fill="url(#g)" stroke="#0E7490" stroke-width="2"/>
    <polygon points="20,10 44,10 32,24" fill="rgba(255,255,255,0.3)"/>
    <polygon points="8,30 20,10 32,24" fill="rgba(255,255,255,0.15)"/>
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
    <ellipse cx="32" cy="38" rx="20" ry="18" fill="url(#g)" stroke="#7F1D1D" stroke-width="2"/>
    <ellipse cx="24" cy="34" rx="5" ry="6" fill="#FFD700"/>
    <ellipse cx="40" cy="34" rx="5" ry="6" fill="#FFD700"/>
    <ellipse cx="24" cy="35" rx="2.5" ry="4" fill="#0D1117"/>
    <ellipse cx="40" cy="35" rx="2.5" ry="4" fill="#0D1117"/>
    <path d="M22,46 Q27,50 32,48 Q37,50 42,46" fill="none" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  li_skull: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <path d="M32,54 Q16,48 16,32 Q16,12 32,8 Q48,12 48,32 Q48,48 32,54 Z" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
    <rect x="22" y="48" width="20" height="10" rx="2" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
    <line x1="28" y1="48" x2="28" y2="58" stroke="#94A3B8" stroke-width="2"/>
    <line x1="34" y1="48" x2="34" y2="58" stroke="#94A3B8" stroke-width="2"/>
    <ellipse cx="24" cy="32" rx="6" ry="7" fill="#0D1117"/>
    <ellipse cx="40" cy="32" rx="6" ry="7" fill="#0D1117"/>
    <path d="M26,44 Q32,46 38,44" fill="none" stroke="#94A3B8" stroke-width="2"/>
  </svg>`,

  li_reaper: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#1F2937"/><stop offset="100%" stop-color="#030712"/></linearGradient></defs>
    <path d="M14,6 Q28,4 36,14 Q44,4 54,8 Q44,18 40,26 L48,58 L36,54 L32,40 L28,54 L16,58 L24,26 Q18,18 14,6 Z" fill="url(#g)" stroke="#374151" stroke-width="2"/>
    <ellipse cx="32" cy="16" rx="10" ry="8" fill="#E2E8F0"/>
    <ellipse cx="28" cy="15" rx="3" ry="3.5" fill="#0D1117"/>
    <ellipse cx="36" cy="15" rx="3" ry="3.5" fill="#0D1117"/>
    <line x1="46" y1="10" x2="58" y2="8" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
    <path d="M58,8 Q62,4 60,0 Q56,2 58,8 Z" fill="#94A3B8"/>
  </svg>`,

  li_bat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1F2937"/><stop offset="100%" stop-color="#111827"/></linearGradient></defs>
    <path d="M32,36 Q20,28 8,32 Q4,24 12,18 Q20,16 24,26 Q28,18 32,20 Q36,18 40,26 Q44,16 52,18 Q60,24 56,32 Q44,28 32,36 Z" fill="url(#g)" stroke="#374151" stroke-width="1.5"/>
    <ellipse cx="32" cy="40" rx="8" ry="6" fill="url(#g)" stroke="#374151" stroke-width="1.5"/>
    <ellipse cx="28" cy="39" rx="2.5" ry="2.5" fill="#CC0000"/>
    <ellipse cx="36" cy="39" rx="2.5" ry="2.5" fill="#CC0000"/>
  </svg>`,

  li_dark_heart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4C1D95"/><stop offset="100%" stop-color="#1E0A3C"/></linearGradient></defs>
    <path d="M32,54 Q8,40 8,24 Q8,12 20,12 Q26,12 32,20 Q38,12 44,12 Q56,12 56,24 Q56,40 32,54 Z" fill="url(#g)" stroke="#7C3AED" stroke-width="2.5"/>
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
    <text x="32" y="37" text-anchor="middle" font-size="14" fill="#34D399" font-family="serif">✕</text>
    <circle cx="20" cy="14" r="2" fill="#34D399" opacity="0.7"/>
    <circle cx="44" cy="50" r="2" fill="#34D399" opacity="0.7"/>
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

  // ── COSMOS ────────────────────────────────────────────────────────────────
  li_black_hole: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><radialGradient id="g" cx="50%" cy="50%"><stop offset="0%" stop-color="#000000"/><stop offset="35%" stop-color="#1A0030"/><stop offset="65%" stop-color="#3D0070"/><stop offset="100%" stop-color="#0D1117"/></radialGradient></defs>
    <circle cx="32" cy="32" r="28" fill="#0D1117"/>
    <ellipse cx="32" cy="32" rx="28" ry="10" fill="none" stroke="#7C3AED" stroke-width="2" opacity="0.6"/>
    <ellipse cx="32" cy="32" rx="22" ry="7" fill="none" stroke="#A78BFA" stroke-width="1.5" opacity="0.5"/>
    <circle cx="32" cy="32" r="10" fill="url(#g)"/>
    <circle cx="32" cy="32" r="6" fill="#000000"/>
    <circle cx="29" cy="29" r="1.5" fill="rgba(167,139,250,0.4)"/>
  </svg>`,

  li_nova: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><radialGradient id="g" cx="50%" cy="50%"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="20%" stop-color="#FFF176"/><stop offset="60%" stop-color="#FF6B00"/><stop offset="100%" stop-color="#7C0000"/></radialGradient></defs>
    <circle cx="32" cy="32" r="12" fill="url(#g)"/>
    <line x1="32" y1="4" x2="32" y2="20" stroke="#FF6B00" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    <line x1="32" y1="44" x2="32" y2="60" stroke="#FF6B00" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    <line x1="4" y1="32" x2="20" y2="32" stroke="#FF6B00" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    <line x1="44" y1="32" x2="60" y2="32" stroke="#FF6B00" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    <line x1="12" y1="12" x2="23" y2="23" stroke="#FDE68A" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
    <line x1="41" y1="41" x2="52" y2="52" stroke="#FDE68A" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
    <line x1="52" y1="12" x2="41" y2="23" stroke="#FDE68A" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
    <line x1="23" y1="41" x2="12" y2="52" stroke="#FDE68A" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
    <circle cx="32" cy="32" r="5" fill="#FFFFFF" opacity="0.9"/>
  </svg>`,

  li_comet: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="rgba(167,139,250,0)"/><stop offset="70%" stop-color="rgba(167,139,250,0.4)"/><stop offset="100%" stop-color="#A78BFA"/></linearGradient></defs>
    <path d="M6,58 Q20,40 48,16" stroke="url(#g)" stroke-width="8" stroke-linecap="round" fill="none"/>
    <circle cx="50" cy="14" r="8" fill="#DDD6FE" stroke="#7C3AED" stroke-width="2"/>
    <circle cx="48" cy="12" r="3" fill="rgba(255,255,255,0.8)"/>
  </svg>`,

  li_nebula: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <radialGradient id="g1" cx="30%" cy="40%"><stop offset="0%" stop-color="rgba(236,72,153,0.8)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
      <radialGradient id="g2" cx="70%" cy="60%"><stop offset="0%" stop-color="rgba(99,102,241,0.7)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
      <radialGradient id="g3" cx="50%" cy="30%"><stop offset="0%" stop-color="rgba(16,185,129,0.5)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
    </defs>
    <rect x="0" y="0" width="64" height="64" rx="8" fill="#0D1117"/>
    <circle cx="20" cy="26" r="18" fill="url(#g1)"/>
    <circle cx="44" cy="38" r="18" fill="url(#g2)"/>
    <circle cx="32" cy="20" r="14" fill="url(#g3)"/>
    <circle cx="10" cy="10" r="1" fill="white" opacity="0.8"/>
    <circle cx="54" cy="8" r="1.5" fill="white" opacity="0.9"/>
    <circle cx="48" cy="54" r="1" fill="white" opacity="0.7"/>
    <circle cx="32" cy="32" r="1.5" fill="white"/>
  </svg>`,

  li_astral: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#60A5FA"/><stop offset="50%" stop-color="#A78BFA"/><stop offset="100%" stop-color="#F0ABFC"/></linearGradient></defs>
    <circle cx="32" cy="32" r="28" fill="#0D1117"/>
    <ellipse cx="32" cy="32" rx="26" ry="10" fill="none" stroke="url(#g)" stroke-width="2" opacity="0.5"/>
    <ellipse cx="32" cy="32" rx="10" ry="26" fill="none" stroke="url(#g)" stroke-width="2" opacity="0.5"/>
    <circle cx="32" cy="32" r="8" fill="url(#g)" opacity="0.9"/>
    <circle cx="32" cy="32" r="4" fill="white" opacity="0.95"/>
  </svg>`,

  li_eclipse: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><radialGradient id="sun" cx="50%" cy="50%"><stop offset="0%" stop-color="#FDE68A"/><stop offset="60%" stop-color="#F59E0B"/><stop offset="100%" stop-color="#92400E"/></radialGradient></defs>
    <circle cx="32" cy="32" r="22" fill="url(#sun)"/>
    <circle cx="32" cy="32" r="18" fill="#0D1117"/>
    <path d="M14,32 Q32,10 50,32 Q32,54 14,32 Z" fill="none" stroke="#F59E0B" stroke-width="2" opacity="0.6"/>
    <circle cx="32" cy="32" r="2" fill="#FFD700"/>
    <circle cx="8" cy="20" r="1.5" fill="white" opacity="0.7"/>
    <circle cx="56" cy="14" r="1" fill="white" opacity="0.6"/>
  </svg>`,

  // ── ARCANE ────────────────────────────────────────────────────────────────
  li_hexagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7C3AED"/><stop offset="100%" stop-color="#4C1D95"/></linearGradient></defs>
    <circle cx="32" cy="32" r="28" fill="#0D1117" stroke="url(#g)" stroke-width="1.5"/>
    <polygon points="32,8 20,28 44,28" fill="url(#g)" opacity="0.8"/>
    <polygon points="32,56 44,36 20,36" fill="url(#g)" opacity="0.8"/>
    <circle cx="32" cy="32" r="10" fill="#0D1117" stroke="url(#g)" stroke-width="2"/>
    <circle cx="32" cy="32" r="4" fill="url(#g)"/>
    <circle cx="32" cy="8" r="2.5" fill="#A78BFA"/>
    <circle cx="32" cy="56" r="2.5" fill="#A78BFA"/>
  </svg>`,

  li_eye_of_fate: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><radialGradient id="iris" cx="50%" cy="50%"><stop offset="0%" stop-color="#60A5FA"/><stop offset="40%" stop-color="#2563EB"/><stop offset="100%" stop-color="#1E3A8A"/></radialGradient></defs>
    <path d="M4,32 Q20,10 32,10 Q44,10 60,32 Q44,54 32,54 Q20,54 4,32 Z" fill="#0D1117" stroke="#2563EB" stroke-width="2"/>
    <circle cx="32" cy="32" r="14" fill="url(#iris)"/>
    <circle cx="32" cy="32" r="7" fill="#0D1117"/>
    <ellipse cx="28" cy="28" rx="3" ry="2" fill="rgba(255,255,255,0.35)" transform="rotate(-20,28,28)"/>
  </svg>`,

  li_serpent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#065F46"/><stop offset="100%" stop-color="#022C22"/></linearGradient></defs>
    <path d="M32,58 Q18,50 16,38 Q14,26 24,22 Q34,18 34,28 Q34,36 26,36 Q18,36 18,28 Q18,20 28,16 Q38,12 44,20 Q50,28 46,38 Q42,48 32,52" fill="none" stroke="url(#g)" stroke-width="6" stroke-linecap="round"/>
    <circle cx="32" cy="58" r="5" fill="url(#g)" stroke="#10B981" stroke-width="1.5"/>
    <ellipse cx="30" cy="57" rx="1.5" ry="1" fill="#10B981"/>
    <ellipse cx="34" cy="57" rx="1.5" ry="1" fill="#10B981"/>
  </svg>`,

  li_crystal_skull: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="rgba(167,139,250,0.9)"/><stop offset="100%" stop-color="rgba(76,29,149,0.7)"/></linearGradient></defs>
    <path d="M32,52 Q16,46 16,30 Q16,10 32,8 Q48,10 48,30 Q48,46 32,52 Z" fill="url(#g)" stroke="#A78BFA" stroke-width="2"/>
    <rect x="22" y="46" width="20" height="10" rx="2" fill="url(#g)" stroke="#A78BFA" stroke-width="1.5"/>
    <line x1="28" y1="46" x2="28" y2="56" stroke="#7C3AED" stroke-width="1.5"/>
    <line x1="34" y1="46" x2="34" y2="56" stroke="#7C3AED" stroke-width="1.5"/>
    <ellipse cx="24" cy="30" rx="6" ry="7" fill="rgba(13,17,23,0.6)"/>
    <ellipse cx="40" cy="30" rx="6" ry="7" fill="rgba(13,17,23,0.6)"/>
    <ellipse cx="24" cy="28" rx="2.5" ry="1.5" fill="rgba(167,139,250,0.8)"/>
    <ellipse cx="40" cy="28" rx="2.5" ry="1.5" fill="rgba(167,139,250,0.8)"/>
    <path d="M26,42 Q32,44 38,42" fill="none" stroke="#A78BFA" stroke-width="1.5"/>
  </svg>`,

  li_grimoire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#1E0A3C"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <rect x="10" y="6" width="40" height="52" rx="4" fill="url(#g)" stroke="#7C3AED" stroke-width="2.5"/>
    <rect x="10" y="6" width="8" height="52" rx="4" fill="#4C1D95" stroke="#7C3AED" stroke-width="1.5"/>
    <circle cx="32" cy="26" r="10" fill="none" stroke="#A78BFA" stroke-width="1.5"/>
    <polygon points="32,18 33.5,23 38,23 34.5,26 35.7,31 32,28 28.3,31 29.5,26 26,23 30.5,23" fill="#A78BFA"/>
    <line x1="20" y1="40" x2="44" y2="40" stroke="#7C3AED" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="20" y1="46" x2="38" y2="46" stroke="#7C3AED" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  li_infinity_seal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FF4500"/><stop offset="50%" stop-color="#FFD700"/><stop offset="100%" stop-color="#7C3AED"/></linearGradient></defs>
    <circle cx="32" cy="32" r="28" fill="#0D1117" stroke="url(#g)" stroke-width="2"/>
    <path d="M12,32 Q12,22 20,22 Q28,22 32,32 Q36,42 44,42 Q52,42 52,32 Q52,22 44,22 Q36,22 32,32 Q28,42 20,42 Q12,42 12,32 Z" fill="none" stroke="url(#g)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="32" cy="32" r="4" fill="url(#g)"/>
    <circle cx="32" cy="32" r="2" fill="#FFD700"/>
  </svg>`,

  // ── ALCHIMIE ──────────────────────────────────────────────────────────────
  li_potion: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="liq" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#C084FC"/><stop offset="100%" stop-color="#7C3AED"/></linearGradient></defs>
    <rect x="26" y="6" width="12" height="10" rx="4" fill="#94A3B8" stroke="#64748B" stroke-width="1.5"/>
    <path d="M20,16 L14,32 L14,50 Q14,58 32,58 Q50,58 50,50 L50,32 L44,16 Z" fill="#1E0A3C" stroke="#7C3AED" stroke-width="2"/>
    <path d="M18,42 L18,50 Q18,54 32,54 Q46,54 46,50 L46,42 Z" fill="url(#liq)" opacity="0.9"/>
    <ellipse cx="32" cy="42" rx="14" ry="3" fill="rgba(192,132,252,0.4)"/>
    <circle cx="24" cy="36" r="3" fill="rgba(192,132,252,0.5)"/>
    <circle cx="40" cy="34" r="2" fill="rgba(192,132,252,0.4)"/>
  </svg>`,

  li_elixir: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <linearGradient id="liq" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#6EE7B7"/><stop offset="100%" stop-color="#065F46"/></linearGradient>
    </defs>
    <path d="M24,8 L24,20 L10,44 Q8,54 32,56 Q56,54 54,44 L40,20 L40,8 Z" fill="rgba(110,231,183,0.1)" stroke="#10B981" stroke-width="2"/>
    <path d="M14,44 L14,50 Q14,54 32,54 Q50,54 50,50 L50,44 Z" fill="url(#liq)"/>
    <rect x="22" y="6" width="20" height="6" rx="3" fill="#94A3B8" stroke="#64748B" stroke-width="1.5"/>
    <circle cx="28" cy="26" r="2" fill="rgba(110,231,183,0.5)"/>
    <circle cx="38" cy="30" r="1.5" fill="rgba(110,231,183,0.4)"/>
  </svg>`,

  li_transmute: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#F59E0B"/><stop offset="100%" stop-color="#7C3AED"/></linearGradient></defs>
    <circle cx="16" cy="32" r="12" fill="#374151" stroke="#64748B" stroke-width="2"/>
    <circle cx="48" cy="32" r="12" fill="#FFD700" stroke="#D97706" stroke-width="2"/>
    <path d="M28,26 Q32,20 36,26" fill="none" stroke="url(#g)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M28,38 Q32,44 36,38" fill="none" stroke="url(#g)" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="28" y1="32" x2="36" y2="32" stroke="url(#g)" stroke-width="2.5"/>
    <circle cx="16" cy="32" r="5" fill="#94A3B8"/>
    <circle cx="48" cy="32" r="5" fill="#FDE68A"/>
  </svg>`,

  li_philosopher_stone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><radialGradient id="g" cx="40%" cy="35%"><stop offset="0%" stop-color="#FDE68A"/><stop offset="40%" stop-color="#FF4500"/><stop offset="100%" stop-color="#7C0000"/></radialGradient></defs>
    <polygon points="32,6 52,18 52,46 32,58 12,46 12,18" fill="url(#g)" stroke="#D97706" stroke-width="2.5"/>
    <polygon points="32,14 46,22 46,42 32,50 18,42 18,22" fill="none" stroke="rgba(255,215,0,0.5)" stroke-width="1.5"/>
    <circle cx="32" cy="32" r="10" fill="#7C0000" stroke="#FFD700" stroke-width="2"/>
    <circle cx="32" cy="32" r="5" fill="#FFD700" opacity="0.9"/>
  </svg>`,

  li_mercury: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#CBD5E1"/><stop offset="100%" stop-color="#64748B"/></linearGradient></defs>
    <circle cx="32" cy="36" r="16" fill="url(#g)" stroke="#94A3B8" stroke-width="2"/>
    <ellipse cx="27" cy="30" rx="5" ry="3" fill="rgba(255,255,255,0.35)" transform="rotate(-20,27,30)"/>
    <line x1="32" y1="20" x2="32" y2="12" stroke="url(#g)" stroke-width="3" stroke-linecap="round"/>
    <path d="M24,12 Q32,8 40,12" fill="none" stroke="url(#g)" stroke-width="3" stroke-linecap="round"/>
    <line x1="28" y1="16" x2="36" y2="8" stroke="url(#g)" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="36" y1="16" x2="28" y2="8" stroke="url(#g)" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  li_sulfur: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FDE68A"/><stop offset="100%" stop-color="#D97706"/></linearGradient></defs>
    <polygon points="32,6 50,36 14,36" fill="url(#g)" stroke="#92400E" stroke-width="2"/>
    <circle cx="32" cy="46" r="12" fill="url(#g)" stroke="#92400E" stroke-width="2"/>
    <line x1="20" y1="36" x2="14" y2="46" stroke="#92400E" stroke-width="2"/>
    <line x1="44" y1="36" x2="50" y2="46" stroke="#92400E" stroke-width="2"/>
    <circle cx="28" cy="44" r="3" fill="rgba(255,255,255,0.35)"/>
  </svg>`,

  // ── RAGE ──────────────────────────────────────────────────────────────────
  li_rage_face: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><radialGradient id="g" cx="50%" cy="50%"><stop offset="0%" stop-color="#FF6B6B"/><stop offset="100%" stop-color="#CC0000"/></radialGradient></defs>
    <circle cx="32" cy="32" r="26" fill="url(#g)" stroke="#7F1D1D" stroke-width="2"/>
    <path d="M18,20 L26,26" stroke="#7F1D1D" stroke-width="3" stroke-linecap="round"/>
    <path d="M46,20 L38,26" stroke="#7F1D1D" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="24" cy="30" rx="6" ry="5" fill="#0D1117"/>
    <ellipse cx="40" cy="30" rx="6" ry="5" fill="#0D1117"/>
    <ellipse cx="23" cy="29" rx="2" ry="1.5" fill="#FF4500"/>
    <ellipse cx="39" cy="29" rx="2" ry="1.5" fill="#FF4500"/>
    <path d="M20,44 Q26,38 32,42 Q38,38 44,44" fill="none" stroke="#7F1D1D" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  li_war_horn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#92400E"/><stop offset="100%" stop-color="#451A03"/></linearGradient></defs>
    <path d="M8,24 L8,40 L44,52 L44,12 Z" fill="url(#g)" stroke="#D97706" stroke-width="2"/>
    <path d="M44,20 Q56,24 58,32 Q56,40 44,44" fill="none" stroke="#D97706" stroke-width="4" stroke-linecap="round"/>
    <rect x="4" y="24" width="8" height="16" rx="2" fill="#6B3A1F" stroke="#92400E" stroke-width="1.5"/>
  </svg>`,

  li_berserker: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF4500"/><stop offset="100%" stop-color="#7C0000"/></linearGradient></defs>
    <ellipse cx="32" cy="34" rx="18" ry="20" fill="url(#g)" stroke="#7F1D1D" stroke-width="2"/>
    <path d="M20,16 L14,6" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
    <path d="M44,16 L50,6" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="25" cy="30" rx="5" ry="4" fill="#FFD700"/>
    <ellipse cx="39" cy="30" rx="5" ry="4" fill="#FFD700"/>
    <ellipse cx="25" cy="31" rx="2.5" ry="2.5" fill="#0D1117"/>
    <ellipse cx="39" cy="31" rx="2.5" ry="2.5" fill="#0D1117"/>
    <path d="M20,44 L44,44" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  li_wrath: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF0000"/><stop offset="100%" stop-color="#4C1D95"/></linearGradient></defs>
    <circle cx="32" cy="32" r="26" fill="#0D1117" stroke="url(#g)" stroke-width="2"/>
    <path d="M10,18 Q18,8 32,12 Q20,20 24,28 Q16,24 10,18 Z" fill="url(#g)" opacity="0.9"/>
    <path d="M54,18 Q46,8 32,12 Q44,20 40,28 Q48,24 54,18 Z" fill="url(#g)" opacity="0.9"/>
    <path d="M10,46 Q18,56 32,52 Q20,44 24,36 Q16,40 10,46 Z" fill="url(#g)" opacity="0.7"/>
    <path d="M54,46 Q46,56 32,52 Q44,44 40,36 Q48,40 54,46 Z" fill="url(#g)" opacity="0.7"/>
    <circle cx="32" cy="32" r="8" fill="url(#g)"/>
    <circle cx="32" cy="32" r="4" fill="#FF0000" opacity="0.8"/>
  </svg>`,

  li_inferno_fist: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#FF4500"/><stop offset="100%" stop-color="#FFD700"/></linearGradient></defs>
    <path d="M18,40 L18,26 Q18,22 22,22 L22,16 Q22,12 26,12 L26,20 Q28,14 32,14 Q36,14 36,20 L36,16 Q38,12 42,14 Q44,18 42,22 L44,22 Q48,22 48,28 L48,40 Q48,52 36,56 L28,56 Q18,52 18,40 Z" fill="#374151" stroke="#64748B" stroke-width="2"/>
    <path d="M20,40 Q24,48 32,50 Q40,48 44,40" fill="url(#g)" opacity="0.85"/>
    <path d="M8,10 Q12,4 18,8 Q14,14 16,20 Q10,16 8,10 Z" fill="url(#g)" opacity="0.7"/>
    <path d="M56,10 Q52,4 46,8 Q50,14 48,20 Q54,16 56,10 Z" fill="url(#g)" opacity="0.7"/>
  </svg>`,

  li_thunderclap: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FDE68A"/><stop offset="50%" stop-color="#F59E0B"/><stop offset="100%" stop-color="#FFFFFF"/></linearGradient></defs>
    <path d="M10,8 Q28,4 32,24 Q36,4 54,8 Q44,22 40,28 L54,28 L24,60 L32,36 L10,36 Z" fill="url(#g)" stroke="#D97706" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="32" cy="38" r="3" fill="white" opacity="0.8"/>
  </svg>`,

  // ── GLOIRE ────────────────────────────────────────────────────────────────
  li_empire_flag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1E3A5F"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <line x1="10" y1="4" x2="10" y2="60" stroke="#8B6914" stroke-width="4" stroke-linecap="round"/>
    <path d="M10,6 L52,14 L52,38 L10,46 Z" fill="url(#g)" stroke="#C9956B" stroke-width="1.5"/>
    <polygon points="31,20 33,26 39,26 34.5,29.5 36,35 31,31.5 26,35 27.5,29.5 23,26 29,26" fill="#FFD700"/>
  </svg>`,

  li_golden_throne: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#92400E"/></linearGradient></defs>
    <rect x="16" y="6" width="32" height="36" rx="4" fill="url(#g)" stroke="#92400E" stroke-width="2"/>
    <rect x="10" y="34" width="44" height="6" rx="3" fill="#92400E"/>
    <rect x="14" y="40" width="8" height="18" rx="2" fill="url(#g)" stroke="#92400E" stroke-width="1.5"/>
    <rect x="42" y="40" width="8" height="18" rx="2" fill="url(#g)" stroke="#92400E" stroke-width="1.5"/>
    <polygon points="20,6 32,2 44,6 44,10 20,10" fill="#FDE68A" stroke="#92400E" stroke-width="1.5"/>
    <circle cx="32" cy="18" r="8" fill="#92400E" stroke="#FFD700" stroke-width="2"/>
    <polygon points="32,12 33.5,16.5 38,16.5 34.5,19.5 35.7,24 32,21.5 28.3,24 29.5,19.5 26,16.5 30.5,16.5" fill="#FFD700"/>
  </svg>`,

  li_victor_wreath: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4ADE80"/><stop offset="100%" stop-color="#166534"/></linearGradient>
      <linearGradient id="gld" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#D97706"/></linearGradient>
    </defs>
    <path d="M8,32 Q8,12 20,8 Q16,18 18,26" fill="url(#g)" stroke="#166534" stroke-width="1.5"/>
    <path d="M8,32 Q4,20 10,10 Q16,20 14,30" fill="url(#g)" stroke="#166534" stroke-width="1.5"/>
    <path d="M8,32 Q4,44 10,54 Q16,44 14,36" fill="url(#g)" stroke="#166534" stroke-width="1.5"/>
    <path d="M56,32 Q56,12 44,8 Q48,18 46,26" fill="url(#g)" stroke="#166534" stroke-width="1.5"/>
    <path d="M56,32 Q60,20 54,10 Q48,20 50,30" fill="url(#g)" stroke="#166534" stroke-width="1.5"/>
    <path d="M56,32 Q60,44 54,54 Q48,44 50,36" fill="url(#g)" stroke="#166534" stroke-width="1.5"/>
    <path d="M14,52 Q24,58 32,56 Q40,58 50,52" fill="none" stroke="url(#gld)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="32" cy="28" r="10" fill="#0D1117" stroke="url(#gld)" stroke-width="2"/>
    <polygon points="32,20 34,26 40,26 35.5,30 37,36 32,32.5 27,36 28.5,30 24,26 30,26" fill="url(#gld)"/>
  </svg>`,

  li_imperial_eagle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#92400E"/></linearGradient></defs>
    <path d="M32,20 Q14,14 6,24 Q12,26 16,22 Q14,30 8,32 Q16,34 20,30 Q16,38 10,42 Q20,40 24,34 Q24,44 20,50 Q28,44 30,36 L32,40 L34,36 Q36,44 44,50 Q40,44 40,34 Q44,40 54,42 Q48,38 44,30 Q48,34 56,32 Q50,30 48,22 Q52,26 58,24 Q50,14 32,20 Z" fill="url(#g)" stroke="#92400E" stroke-width="1.5"/>
    <ellipse cx="32" cy="22" rx="8" ry="6" fill="#0D1117" stroke="url(#g)" stroke-width="1.5"/>
    <ellipse cx="29" cy="22" rx="2.5" ry="2.5" fill="#FFD700"/>
    <ellipse cx="35" cy="22" rx="2.5" ry="2.5" fill="#FFD700"/>
    <polygon points="32,26 34,30 32,28 30,30" fill="#FFD700"/>
  </svg>`,

  li_crown_of_thorns: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#92400E"/><stop offset="100%" stop-color="#451A03"/></linearGradient></defs>
    <path d="M8,44 Q10,36 16,32 Q14,24 20,20 Q22,28 20,34 Q26,28 32,26 Q26,32 26,38 Q30,30 36,28 Q32,36 34,42 Q38,32 44,30 Q42,38 44,44 Q50,36 56,36 Q52,44 48,46 Q10,46 8,44 Z" fill="url(#g)" stroke="#92400E" stroke-width="1.5"/>
    <path d="M18,30 L16,22 M28,26 L30,16 M38,28 L40,18 M48,32 L50,22" stroke="#7F1D1D" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="16" cy="21" r="2.5" fill="#CC0000"/>
    <circle cx="30" cy="15" r="2.5" fill="#CC0000"/>
    <circle cx="40" cy="17" r="2.5" fill="#CC0000"/>
    <circle cx="50" cy="21" r="2.5" fill="#CC0000"/>
  </svg>`,

  li_sovereign: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="50%" stop-color="#C9956B"/><stop offset="100%" stop-color="#8B6914"/></linearGradient></defs>
    <circle cx="32" cy="32" r="28" fill="#0D1117" stroke="url(#g)" stroke-width="3"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="url(#g)" stroke-width="1" stroke-dasharray="3 3"/>
    <polygon points="32,8 35,20 48,20 38,28 42,40 32,33 22,40 26,28 16,20 29,20" fill="url(#g)"/>
    <circle cx="32" cy="32" r="6" fill="#0D1117"/>
    <polygon points="32,27 33,30 36,30 33.5,32 34.5,35 32,33.5 29.5,35 30.5,32 28,30 31,30" fill="url(#g)"/>
    <text x="32" y="54" text-anchor="middle" font-size="7" fill="#FFD700" font-family="serif" font-weight="bold">SOVEREIGN</text>
  </svg>`,

  // ── CRÉATURES ─────────────────────────────────────────────────────────────
  li_dragon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#CC0000"/><stop offset="100%" stop-color="#450000"/></linearGradient><linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#374151"/><stop offset="100%" stop-color="#1E293B"/></linearGradient></defs>
    <path d="M8,48 Q6,38 10,30 Q14,22 22,20 Q18,28 20,36 Q14,32 8,48 Z" fill="url(#wg)" stroke="#4B5563" stroke-width="1"/>
    <path d="M56,48 Q58,38 54,30 Q50,22 42,20 Q46,28 44,36 Q50,32 56,48 Z" fill="url(#wg)" stroke="#4B5563" stroke-width="1"/>
    <path d="M20,48 Q20,34 32,32 Q44,34 44,48 Q44,58 32,60 Q20,58 20,48 Z" fill="url(#g)" stroke="#7F1D1D" stroke-width="2"/>
    <path d="M24,32 L18,20 L22,22 L20,12 L28,26" fill="url(#g)" stroke="#7F1D1D" stroke-width="1"/>
    <path d="M40,32 L46,20 L42,22 L44,12 L36,26" fill="url(#g)" stroke="#7F1D1D" stroke-width="1"/>
    <ellipse cx="26" cy="44" rx="4" ry="5" fill="#FFD700"/>
    <ellipse cx="38" cy="44" rx="4" ry="5" fill="#FFD700"/>
    <ellipse cx="26" cy="45" rx="2" ry="3.5" fill="#0D1117"/>
    <ellipse cx="38" cy="45" rx="2" ry="3.5" fill="#0D1117"/>
    <path d="M26,54 L22,60 M32,56 L32,62 M38,54 L42,60" stroke="#FF4500" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  li_hydra: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#065F46"/><stop offset="100%" stop-color="#022C22"/></linearGradient></defs>
    <ellipse cx="32" cy="50" rx="14" ry="10" fill="url(#g)" stroke="#10B981" stroke-width="1.5"/>
    <path d="M22,48 Q18,36 10,20 Q14,20 16,26 Q18,16 14,8 Q22,12 20,22 Q24,14 22,6 Q30,10 26,22 Q32,40 32,48" fill="url(#g)" stroke="#10B981" stroke-width="1.5"/>
    <path d="M42,48 Q46,36 54,20 Q50,20 48,26 Q46,16 50,8 Q42,12 44,22 Q40,14 42,6 Q34,10 38,22 Q32,40 32,48" fill="url(#g)" stroke="#10B981" stroke-width="1.5"/>
    <circle cx="10" cy="18" r="5" fill="url(#g)" stroke="#10B981" stroke-width="1.5"/>
    <circle cx="14" cy="6" r="5" fill="url(#g)" stroke="#10B981" stroke-width="1.5"/>
    <circle cx="22" cy="4" r="5" fill="url(#g)" stroke="#10B981" stroke-width="1.5"/>
    <circle cx="54" cy="18" r="5" fill="url(#g)" stroke="#10B981" stroke-width="1.5"/>
    <circle cx="50" cy="6" r="5" fill="url(#g)" stroke="#10B981" stroke-width="1.5"/>
    <circle cx="42" cy="4" r="5" fill="url(#g)" stroke="#10B981" stroke-width="1.5"/>
    <ellipse cx="9" cy="17" rx="1.5" ry="1" fill="#34D399"/>
    <ellipse cx="13" cy="5" rx="1.5" ry="1" fill="#34D399"/>
    <ellipse cx="21" cy="3" rx="1.5" ry="1" fill="#34D399"/>
    <ellipse cx="53" cy="17" rx="1.5" ry="1" fill="#34D399"/>
    <ellipse cx="49" cy="5" rx="1.5" ry="1" fill="#34D399"/>
    <ellipse cx="41" cy="3" rx="1.5" ry="1" fill="#34D399"/>
  </svg>`,

  li_cerberus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1F2937"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <rect x="18" y="38" width="28" height="22" rx="6" fill="url(#g)" stroke="#374151" stroke-width="2"/>
    <ellipse cx="16" cy="26" rx="10" ry="12" fill="url(#g)" stroke="#374151" stroke-width="1.5"/>
    <ellipse cx="32" cy="22" rx="10" ry="14" fill="url(#g)" stroke="#374151" stroke-width="2"/>
    <ellipse cx="48" cy="26" rx="10" ry="12" fill="url(#g)" stroke="#374151" stroke-width="1.5"/>
    <ellipse cx="12" cy="24" rx="3" ry="4" fill="#CC0000"/>
    <ellipse cx="20" cy="24" rx="3" ry="4" fill="#CC0000"/>
    <ellipse cx="28" cy="20" rx="3" ry="4" fill="#FF4500"/>
    <ellipse cx="36" cy="20" rx="3" ry="4" fill="#FF4500"/>
    <ellipse cx="44" cy="24" rx="3" ry="4" fill="#CC0000"/>
    <ellipse cx="52" cy="24" rx="3" ry="4" fill="#CC0000"/>
    <path d="M10,32 Q16,36 22,32" fill="none" stroke="#374151" stroke-width="1.5"/>
    <path d="M26,34 Q32,38 38,34" fill="none" stroke="#374151" stroke-width="1.5"/>
    <path d="M42,32 Q48,36 54,32" fill="none" stroke="#374151" stroke-width="1.5"/>
    <path d="M22,54 L22,62 M32,56 L32,62 M42,54 L42,62" stroke="#374151" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  li_phoenix: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <linearGradient id="g" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#FF4500"/><stop offset="50%" stop-color="#FF6B00"/><stop offset="100%" stop-color="#FFD700"/></linearGradient>
    </defs>
    <path d="M32,56 Q10,44 8,28 Q16,20 24,28 Q18,36 32,40 Q46,36 40,28 Q48,20 56,28 Q54,44 32,56 Z" fill="url(#g)" stroke="#FF4500" stroke-width="1.5"/>
    <path d="M8,28 Q4,16 8,8 Q14,16 14,24" fill="url(#g)" opacity="0.7"/>
    <path d="M56,28 Q60,16 56,8 Q50,16 50,24" fill="url(#g)" opacity="0.7"/>
    <path d="M20,20 Q18,8 24,4 Q26,12 28,18" fill="url(#g)" opacity="0.8"/>
    <path d="M44,20 Q46,8 40,4 Q38,12 36,18" fill="url(#g)" opacity="0.8"/>
    <circle cx="32" cy="32" r="6" fill="#FFFFFF" opacity="0.9"/>
    <circle cx="32" cy="32" r="3" fill="#FFD700"/>
  </svg>`,

  li_leviathan: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1E3A5F"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <path d="M6,36 Q14,28 22,34 Q26,20 36,22 Q46,24 50,36 Q56,30 58,38 Q52,48 42,44 Q38,56 26,52 Q18,56 12,48 Q4,46 6,36 Z" fill="url(#g)" stroke="#2563EB" stroke-width="2"/>
    <ellipse cx="26" cy="36" rx="5" ry="6" fill="#60A5FA"/>
    <ellipse cx="38" cy="36" rx="5" ry="6" fill="#60A5FA"/>
    <ellipse cx="26" cy="37" rx="2.5" ry="3.5" fill="#0D1117"/>
    <ellipse cx="38" cy="37" rx="2.5" ry="3.5" fill="#0D1117"/>
    <path d="M22,46 Q32,50 42,46" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round"/>
    <path d="M28,50 L24,58 M36,50 L40,58" stroke="#2563EB" stroke-width="2" stroke-linecap="round"/>
    <path d="M50,36 Q56,28 62,32" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  li_chimera: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7C3AED"/><stop offset="100%" stop-color="#CC0000"/></linearGradient></defs>
    <ellipse cx="32" cy="42" rx="18" ry="14" fill="#1F2937" stroke="#374151" stroke-width="2"/>
    <ellipse cx="18" cy="24" rx="12" ry="14" fill="#1F2937" stroke="url(#g)" stroke-width="1.5"/>
    <ellipse cx="46" cy="24" rx="12" ry="14" fill="#1F2937" stroke="#CC0000" stroke-width="1.5"/>
    <ellipse cx="14" cy="22" rx="4" ry="5" fill="#7C3AED"/>
    <ellipse cx="22" cy="22" rx="4" ry="5" fill="#7C3AED"/>
    <ellipse cx="42" cy="22" rx="4" ry="5" fill="#CC0000"/>
    <ellipse cx="50" cy="22" rx="4" ry="5" fill="#CC0000"/>
    <path d="M12,12 L10,6 M16,10 L16,4 M24,12 L26,6" stroke="#7C3AED" stroke-width="2" stroke-linecap="round"/>
    <path d="M52,12 L54,6 M48,10 L48,4 M40,12 L38,6" stroke="#CC0000" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="28" cy="40" rx="5" ry="6" fill="#FFD700"/>
    <ellipse cx="36" cy="40" rx="5" ry="6" fill="#FFD700"/>
    <ellipse cx="28" cy="41" rx="2.5" ry="4" fill="#0D1117"/>
    <ellipse cx="36" cy="41" rx="2.5" ry="4" fill="#0D1117"/>
    <path d="M26,52 Q32,56 38,52" fill="none" stroke="#FFD700" stroke-width="2"/>
  </svg>`,

  // ── NÉCROMANCIE ───────────────────────────────────────────────────────────
  li_bone_wand: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#E2E8F0"/><stop offset="100%" stop-color="#94A3B8"/></linearGradient></defs>
    <line x1="10" y1="58" x2="50" y2="14" stroke="url(#g)" stroke-width="5" stroke-linecap="round"/>
    <circle cx="52" cy="12" r="8" fill="url(#g)" stroke="#64748B" stroke-width="2"/>
    <ellipse cx="50" cy="10" rx="3" ry="4" fill="#0D1117"/>
    <ellipse cx="54" cy="10" rx="3" ry="4" fill="#0D1117"/>
    <path d="M46,16 Q52,18 56,14" fill="none" stroke="#64748B" stroke-width="1.5"/>
    <path d="M6,54 Q4,58 10,58 Q14,56 10,52 Q8,54 6,54 Z" fill="url(#g)"/>
    <circle cx="26" cy="36" r="2.5" fill="#A78BFA" opacity="0.7"/>
    <circle cx="34" cy="28" r="2" fill="#A78BFA" opacity="0.5"/>
    <circle cx="40" cy="22" r="1.5" fill="#A78BFA" opacity="0.4"/>
  </svg>`,

  li_soul_jar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="rgba(167,139,250,0.2)"/><stop offset="100%" stop-color="rgba(76,29,149,0.1)"/></linearGradient>
    </defs>
    <rect x="18" y="16" width="28" height="40" rx="8" fill="url(#glass)" stroke="#7C3AED" stroke-width="2.5"/>
    <rect x="24" y="10" width="16" height="8" rx="4" fill="#4C1D95" stroke="#7C3AED" stroke-width="2"/>
    <rect x="28" y="6" width="8" height="6" rx="2" fill="#2D1B69" stroke="#7C3AED" stroke-width="1.5"/>
    <path d="M26,30 Q24,24 32,22 Q40,24 38,30 Q38,36 32,36 Q26,36 26,30 Z" fill="rgba(167,139,250,0.5)" stroke="#A78BFA" stroke-width="1"/>
    <ellipse cx="30" cy="28" rx="2" ry="1.5" fill="rgba(167,139,250,0.8)"/>
    <circle cx="24" cy="44" r="2" fill="rgba(167,139,250,0.4)"/>
    <circle cx="40" cy="48" r="1.5" fill="rgba(167,139,250,0.3)"/>
    <circle cx="34" cy="42" r="1" fill="rgba(167,139,250,0.5)"/>
  </svg>`,

  li_grave: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#374151"/><stop offset="100%" stop-color="#1F2937"/></linearGradient></defs>
    <rect x="10" y="52" width="44" height="8" rx="2" fill="#374151" stroke="#4B5563" stroke-width="1.5"/>
    <path d="M20,52 L20,20 Q20,6 32,6 Q44,6 44,20 L44,52 Z" fill="url(#g)" stroke="#4B5563" stroke-width="2"/>
    <line x1="32" y1="16" x2="32" y2="36" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    <line x1="24" y1="24" x2="40" y2="24" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    <text x="32" y="46" text-anchor="middle" font-size="8" fill="#94A3B8" font-family="serif">R.I.P</text>
    <circle cx="8" cy="54" r="2" fill="#374151"/>
    <circle cx="56" cy="54" r="2" fill="#374151"/>
  </svg>`,

  li_undead: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1F2937"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <path d="M32,52 Q16,44 16,28 Q16,10 32,8 Q48,10 48,28 Q48,44 32,52 Z" fill="url(#g)" stroke="#4B5563" stroke-width="2"/>
    <rect x="22" y="46" width="20" height="10" rx="2" fill="url(#g)" stroke="#4B5563" stroke-width="2"/>
    <line x1="28" y1="46" x2="28" y2="56" stroke="#374151" stroke-width="2"/>
    <line x1="34" y1="46" x2="34" y2="56" stroke="#374151" stroke-width="2"/>
    <ellipse cx="24" cy="30" rx="6" ry="7" fill="#1A0A30"/>
    <ellipse cx="40" cy="30" rx="6" ry="7" fill="#1A0A30"/>
    <ellipse cx="24" cy="29" rx="3" ry="2" fill="#7C3AED" opacity="0.8"/>
    <ellipse cx="40" cy="29" rx="3" ry="2" fill="#7C3AED" opacity="0.8"/>
    <path d="M22,42 Q32,46 42,42" fill="none" stroke="#4B5563" stroke-width="1.5"/>
    <path d="M18,14 Q22,8 28,12 M46,14 Q42,8 36,12" stroke="#4B5563" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  </svg>`,

  li_death_clock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1F2937"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <circle cx="32" cy="32" r="26" fill="url(#g)" stroke="#374151" stroke-width="3"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#4B5563" stroke-width="1" stroke-dasharray="3 4"/>
    <circle cx="32" cy="32" r="2" fill="#A78BFA"/>
    <line x1="32" y1="30" x2="32" y2="14" stroke="#CC0000" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="32" y1="30" x2="44" y2="36" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
    <line x1="32" y1="10" x2="32" y2="14" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
    <line x1="32" y1="50" x2="32" y2="54" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
    <line x1="10" y1="32" x2="14" y2="32" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
    <line x1="50" y1="32" x2="54" y2="32" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
    <path d="M26,56 Q32,60 38,56" fill="none" stroke="#4B5563" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  li_lich_crown: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1E0A3C"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <polygon points="8,50 16,24 26,38 32,12 38,38 48,24 56,50" fill="url(#g)" stroke="#7C3AED" stroke-width="2" stroke-linejoin="round"/>
    <rect x="6" y="50" width="52" height="8" rx="4" fill="url(#g)" stroke="#7C3AED" stroke-width="2"/>
    <circle cx="32" cy="12" r="5" fill="#1E0A3C" stroke="#A78BFA" stroke-width="2"/>
    <ellipse cx="31" cy="11" rx="2" ry="1.5" fill="#7C3AED" opacity="0.8"/>
    <circle cx="16" cy="24" r="4" fill="#1E0A3C" stroke="#A78BFA" stroke-width="1.5"/>
    <ellipse cx="15" cy="23" rx="1.5" ry="1" fill="#7C3AED" opacity="0.7"/>
    <circle cx="48" cy="24" r="4" fill="#1E0A3C" stroke="#A78BFA" stroke-width="1.5"/>
    <ellipse cx="47" cy="23" rx="1.5" ry="1" fill="#7C3AED" opacity="0.7"/>
    <path d="M8,50 L56,50" stroke="rgba(167,139,250,0.2)" stroke-width="1"/>
  </svg>`,

  // ── ABYSSES ───────────────────────────────────────────────────────────────
  li_kraken: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1E3A5F"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <circle cx="32" cy="30" r="16" fill="url(#g)" stroke="#2563EB" stroke-width="2"/>
    <path d="M18,38 Q10,50 6,60" stroke="#2563EB" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M26,42 Q20,54 16,62" stroke="#2563EB" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M32,44 Q32,56 32,64" stroke="#2563EB" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M38,42 Q44,54 48,62" stroke="#2563EB" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M46,38 Q54,50 58,60" stroke="#2563EB" stroke-width="4" stroke-linecap="round" fill="none"/>
    <ellipse cx="26" cy="28" rx="4" ry="5" fill="#60A5FA"/>
    <ellipse cx="38" cy="28" rx="4" ry="5" fill="#60A5FA"/>
    <ellipse cx="26" cy="29" rx="2" ry="3.5" fill="#0D1117"/>
    <ellipse cx="38" cy="29" rx="2" ry="3.5" fill="#0D1117"/>
    <path d="M4,20 Q0,12 6,8 Q6,14 10,16 Q6,18 4,20 Z" fill="url(#g)" stroke="#2563EB" stroke-width="1"/>
    <path d="M60,20 Q64,12 58,8 Q58,14 54,16 Q58,18 60,20 Z" fill="url(#g)" stroke="#2563EB" stroke-width="1"/>
  </svg>`,

  li_deep_eye: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <radialGradient id="g" cx="50%" cy="50%"><stop offset="0%" stop-color="#60A5FA"/><stop offset="40%" stop-color="#1E3A8A"/><stop offset="100%" stop-color="#0D1117"/></radialGradient>
    </defs>
    <circle cx="32" cy="32" r="28" fill="#0D1117"/>
    <circle cx="32" cy="32" r="20" fill="url(#g)" stroke="#1E3A8A" stroke-width="1.5"/>
    <circle cx="32" cy="32" r="12" fill="#0D1117"/>
    <circle cx="32" cy="32" r="8" fill="rgba(96,165,250,0.3)"/>
    <circle cx="32" cy="32" r="3" fill="#60A5FA"/>
    <ellipse cx="28" cy="28" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.4)" transform="rotate(-20,28,28)"/>
    <path d="M10,18 Q18,10 28,14" stroke="rgba(96,165,250,0.25)" stroke-width="1.5" fill="none"/>
    <path d="M54,18 Q46,10 36,14" stroke="rgba(96,165,250,0.25)" stroke-width="1.5" fill="none"/>
    <path d="M10,46 Q18,54 28,50" stroke="rgba(96,165,250,0.2)" stroke-width="1.5" fill="none"/>
    <path d="M54,46 Q46,54 36,50" stroke="rgba(96,165,250,0.2)" stroke-width="1.5" fill="none"/>
  </svg>`,

  li_whirlpool: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1E3A8A"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <circle cx="32" cy="32" r="28" fill="url(#g)"/>
    <path d="M32,32 Q52,14 54,32 Q56,50 32,52 Q8,50 10,32 Q12,14 32,18 Q52,22 48,32 Q44,42 32,40 Q20,38 22,32 Q24,26 32,28" fill="none" stroke="#60A5FA" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
    <circle cx="32" cy="32" r="4" fill="#1E3A8A" stroke="#60A5FA" stroke-width="1.5"/>
    <circle cx="32" cy="32" r="2" fill="#60A5FA"/>
  </svg>`,

  li_sunken_ship: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#1E3A5F"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <rect x="0" y="38" width="64" height="26" rx="0" fill="url(#g)" opacity="0.7"/>
    <path d="M10,48 Q18,40 32,42 Q46,40 54,48 Q46,52 32,54 Q18,52 10,48 Z" fill="#0F3460" stroke="#2563EB" stroke-width="1.5"/>
    <rect x="26" y="22" width="4" height="20" fill="#92400E"/>
    <path d="M30,22 Q38,24 40,32 Q38,36 30,34" fill="#CC0000" opacity="0.8"/>
    <line x1="14" y1="44" x2="14" y2="56" stroke="#2563EB" stroke-width="1" opacity="0.4"/>
    <line x1="22" y1="42" x2="22" y2="58" stroke="#2563EB" stroke-width="1" opacity="0.3"/>
    <circle cx="44" cy="46" r="2" fill="rgba(96,165,250,0.4)"/>
    <circle cx="38" cy="50" r="1.5" fill="rgba(96,165,250,0.3)"/>
  </svg>`,

  li_abyssal_fish: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0F3460"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <path d="M8,32 Q4,20 10,14 L14,32 L10,50 Q4,44 8,32 Z" fill="url(#g)" stroke="#2563EB" stroke-width="1.5"/>
    <ellipse cx="36" cy="32" rx="22" ry="14" fill="url(#g)" stroke="#2563EB" stroke-width="2"/>
    <path d="M26,22 Q30,18 36,20 Q40,22 44,20 Q46,24 44,28" fill="none" stroke="rgba(96,165,250,0.3)" stroke-width="1"/>
    <circle cx="50" cy="28" r="5" fill="#0D1117" stroke="#2563EB" stroke-width="1.5"/>
    <circle cx="51" cy="27" r="2" fill="#60A5FA"/>
    <circle cx="51" cy="27" r="1" fill="#FFFFFF" opacity="0.8"/>
    <path d="M56,28 Q62,22 62,28 Q62,34 56,32" fill="#FFD700" opacity="0.8"/>
    <path d="M24,32 Q28,28 32,32 Q28,36 24,32" fill="rgba(96,165,250,0.2)"/>
    <path d="M34,34 Q38,30 42,34 Q38,38 34,34" fill="rgba(96,165,250,0.15)"/>
  </svg>`,

  li_coral_dark: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#7F1D1D"/><stop offset="100%" stop-color="#CC0000"/></linearGradient></defs>
    <rect x="28" y="52" width="8" height="8" rx="2" fill="#374151"/>
    <line x1="32" y1="52" x2="32" y2="34" stroke="url(#g)" stroke-width="4" stroke-linecap="round"/>
    <path d="M32,46 Q22,40 18,28 Q24,28 26,36 Q28,26 22,18 Q30,20 30,32" fill="url(#g)" stroke="#7F1D1D" stroke-width="1.5"/>
    <path d="M32,40 Q42,34 46,22 Q40,22 38,30 Q36,20 42,12 Q34,14 34,26" fill="url(#g)" stroke="#7F1D1D" stroke-width="1.5"/>
    <path d="M32,34 Q38,28 42,18" fill="none" stroke="url(#g)" stroke-width="3" stroke-linecap="round"/>
    <path d="M32,38 Q26,30 22,20" fill="none" stroke="url(#g)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="18" cy="27" r="2.5" fill="#FF6B6B"/>
    <circle cx="22" cy="17" r="2" fill="#FF6B6B"/>
    <circle cx="46" cy="21" r="2.5" fill="#FF6B6B"/>
    <circle cx="42" cy="11" r="2" fill="#FF6B6B"/>
    <circle cx="42" cy="18" r="1.5" fill="#FF6B6B"/>
  </svg>`,

  // ── NATURE SOMBRE ─────────────────────────────────────────────────────────
  li_dead_tree: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stop-color="#451A03"/><stop offset="100%" stop-color="#713F12"/></linearGradient></defs>
    <rect x="28" y="40" width="8" height="22" rx="3" fill="url(#g)"/>
    <path d="M32,40 L32,10" stroke="url(#g)" stroke-width="6" stroke-linecap="round"/>
    <path d="M32,20 Q18,14 10,6 Q16,18 26,24" fill="url(#g)"/>
    <path d="M32,28 Q14,24 8,18 Q16,28 28,32" fill="url(#g)"/>
    <path d="M32,22 Q46,16 54,8 Q48,20 38,26" fill="url(#g)"/>
    <path d="M32,30 Q50,26 56,20 Q48,30 36,34" fill="url(#g)"/>
    <circle cx="10" cy="6" r="2" fill="#7F1D1D" opacity="0.6"/>
    <circle cx="8" cy="18" r="1.5" fill="#7F1D1D" opacity="0.5"/>
    <circle cx="54" cy="8" r="2" fill="#7F1D1D" opacity="0.6"/>
    <circle cx="56" cy="20" r="1.5" fill="#7F1D1D" opacity="0.5"/>
  </svg>`,

  li_thorn_rose: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7F1D1D"/><stop offset="100%" stop-color="#450000"/></linearGradient></defs>
    <path d="M28,58 Q20,48 22,40 Q26,46 32,44 Q26,38 28,30 Q34,38 38,34 Q36,42 40,46 Q38,50 32,58 Z" fill="#166534" stroke="#14532D" stroke-width="1.5"/>
    <circle cx="32" cy="18" r="14" fill="url(#g)" stroke="#991B1B" stroke-width="2"/>
    <circle cx="32" cy="18" r="8" fill="#CC0000" stroke="#991B1B" stroke-width="1"/>
    <circle cx="32" cy="18" r="4" fill="#FF4444"/>
    <path d="M22,38 L16,42 M22,32 L14,30 M28,54 L24,60 M36,52 L40,58" stroke="#14532D" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="16" cy="42" r="2" fill="#0D1117" stroke="#14532D" stroke-width="1"/>
    <circle cx="14" cy="30" r="2" fill="#0D1117" stroke="#14532D" stroke-width="1"/>
  </svg>`,

  li_poison_spore: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <radialGradient id="g" cx="50%" cy="50%"><stop offset="0%" stop-color="#84CC16"/><stop offset="60%" stop-color="#4D7C0F"/><stop offset="100%" stop-color="#1A2E05"/></radialGradient>
    </defs>
    <line x1="32" y1="44" x2="32" y2="58" stroke="#4D7C0F" stroke-width="3" stroke-linecap="round"/>
    <circle cx="32" cy="32" r="18" fill="url(#g)" stroke="#4D7C0F" stroke-width="2"/>
    <circle cx="32" cy="26" r="8" fill="#BEF264" opacity="0.4"/>
    <path d="M16,28 Q18,22 24,20" stroke="#BEF264" stroke-width="1.5" fill="none" opacity="0.6"/>
    <circle cx="20" cy="16" r="3" fill="#84CC16" opacity="0.7"/>
    <circle cx="44" cy="16" r="3" fill="#84CC16" opacity="0.7"/>
    <circle cx="10" cy="28" r="2.5" fill="#84CC16" opacity="0.6"/>
    <circle cx="54" cy="28" r="2.5" fill="#84CC16" opacity="0.6"/>
    <circle cx="14" cy="40" r="2" fill="#84CC16" opacity="0.5"/>
    <circle cx="50" cy="40" r="2" fill="#84CC16" opacity="0.5"/>
    <circle cx="28" cy="48" r="1.5" fill="#84CC16" opacity="0.4"/>
    <circle cx="36" cy="48" r="1.5" fill="#84CC16" opacity="0.4"/>
  </svg>`,

  li_night_lotus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4C1D95"/><stop offset="100%" stop-color="#1E0A3C"/></linearGradient></defs>
    <path d="M32,48 Q20,44 18,32 Q22,28 26,32 Q24,24 20,20 Q28,22 30,30 Q28,22 32,16 Q36,22 34,30 Q36,22 44,20 Q40,24 38,32 Q42,28 46,32 Q44,44 32,48 Z" fill="url(#g)" stroke="#7C3AED" stroke-width="1.5"/>
    <path d="M24,44 Q28,48 32,46 Q36,48 40,44" fill="url(#g)" stroke="#7C3AED" stroke-width="1"/>
    <circle cx="32" cy="34" r="6" fill="#A78BFA" opacity="0.6"/>
    <circle cx="32" cy="34" r="3" fill="#DDD6FE" opacity="0.8"/>
    <line x1="32" y1="48" x2="32" y2="60" stroke="#4C1D95" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="22" cy="58" rx="10" ry="4" fill="#1E0A3C" stroke="#4C1D95" stroke-width="1.5"/>
    <ellipse cx="42" cy="58" rx="10" ry="4" fill="#1E0A3C" stroke="#4C1D95" stroke-width="1.5"/>
  </svg>`,

  li_gnarled_root: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#451A03"/><stop offset="100%" stop-color="#1C0A00"/></linearGradient></defs>
    <path d="M32,10 Q28,20 24,28 Q18,32 10,36" stroke="url(#g)" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M32,10 Q36,22 40,30 Q46,34 54,38" stroke="url(#g)" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M24,28 Q16,36 12,48" stroke="url(#g)" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M24,28 Q22,40 24,54" stroke="url(#g)" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M40,30 Q48,38 52,50" stroke="url(#g)" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M40,30 Q42,42 40,56" stroke="url(#g)" stroke-width="3" stroke-linecap="round" fill="none"/>
    <circle cx="32" cy="10" r="5" fill="#7F1D1D" stroke="#451A03" stroke-width="1.5"/>
    <circle cx="32" cy="10" r="2.5" fill="#CC0000" opacity="0.7"/>
  </svg>`,

  li_eclipse_flower: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1E0A3C"/><stop offset="100%" stop-color="#4C1D95"/></linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD700"/><stop offset="100%" stop-color="#C9956B"/></linearGradient>
    </defs>
    <ellipse cx="32" cy="16" rx="6" ry="10" fill="url(#g)" stroke="#7C3AED" stroke-width="1"/>
    <ellipse cx="32" cy="48" rx="6" ry="10" fill="url(#g)" stroke="#7C3AED" stroke-width="1"/>
    <ellipse cx="16" cy="32" rx="10" ry="6" fill="url(#g)" stroke="#7C3AED" stroke-width="1"/>
    <ellipse cx="48" cy="32" rx="10" ry="6" fill="url(#g)" stroke="#7C3AED" stroke-width="1"/>
    <ellipse cx="20" cy="20" rx="6" ry="10" fill="url(#g)" stroke="#7C3AED" stroke-width="1" transform="rotate(-45,20,20)"/>
    <ellipse cx="44" cy="20" rx="6" ry="10" fill="url(#g)" stroke="#7C3AED" stroke-width="1" transform="rotate(45,44,20)"/>
    <ellipse cx="20" cy="44" rx="6" ry="10" fill="url(#g)" stroke="#7C3AED" stroke-width="1" transform="rotate(45,20,44)"/>
    <ellipse cx="44" cy="44" rx="6" ry="10" fill="url(#g)" stroke="#7C3AED" stroke-width="1" transform="rotate(-45,44,44)"/>
    <circle cx="32" cy="32" r="8" fill="url(#gold)"/>
    <circle cx="32" cy="32" r="4" fill="#0D1117"/>
    <circle cx="32" cy="32" r="2" fill="#FFD700"/>
  </svg>`,

  // ── FORTERESSE ────────────────────────────────────────────────────────────
  li_dark_tower: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#374151"/><stop offset="100%" stop-color="#1F2937"/></linearGradient></defs>
    <rect x="20" y="16" width="24" height="46" fill="url(#g)" stroke="#4B5563" stroke-width="2"/>
    <rect x="16" y="28" width="32" height="34" fill="url(#g)" stroke="#4B5563" stroke-width="2"/>
    <path d="M18,16 L18,6 L22,8 L22,4 L26,8 L26,4 L30,8 L30,4 L34,8 L34,4 L38,8 L38,4 L42,8 L42,6 L46,16 Z" fill="url(#g)" stroke="#4B5563" stroke-width="1.5"/>
    <rect x="26" y="40" width="12" height="22" rx="6" fill="#0D1117" stroke="#4B5563" stroke-width="1.5"/>
    <rect x="28" y="34" width="8" height="10" rx="2" fill="#0D1117" stroke="#4B5563" stroke-width="1"/>
    <line x1="16" y1="36" x2="48" y2="36" stroke="#4B5563" stroke-width="1" opacity="0.5"/>
    <line x1="16" y1="44" x2="48" y2="44" stroke="#4B5563" stroke-width="1" opacity="0.4"/>
    <circle cx="32" cy="12" r="2.5" fill="#CC0000" opacity="0.8"/>
  </svg>`,

  li_portcullis: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#374151"/><stop offset="100%" stop-color="#1F2937"/></linearGradient></defs>
    <rect x="6" y="6" width="52" height="52" rx="4" fill="url(#g)" stroke="#4B5563" stroke-width="3"/>
    <rect x="6" y="6" width="52" height="52" rx="4" fill="none" stroke="#C9956B" stroke-width="1" stroke-dasharray="4 4"/>
    <line x1="20" y1="6" x2="20" y2="58" stroke="#4B5563" stroke-width="3" stroke-linecap="round"/>
    <line x1="32" y1="6" x2="32" y2="58" stroke="#4B5563" stroke-width="3" stroke-linecap="round"/>
    <line x1="44" y1="6" x2="44" y2="58" stroke="#4B5563" stroke-width="3" stroke-linecap="round"/>
    <line x1="6" y1="20" x2="58" y2="20" stroke="#4B5563" stroke-width="3" stroke-linecap="round"/>
    <line x1="6" y1="34" x2="58" y2="34" stroke="#4B5563" stroke-width="3" stroke-linecap="round"/>
    <line x1="6" y1="48" x2="58" y2="48" stroke="#4B5563" stroke-width="3" stroke-linecap="round"/>
    <polygon points="20,58 18,52 22,52" fill="#C9956B"/>
    <polygon points="32,58 30,52 34,52" fill="#C9956B"/>
    <polygon points="44,58 42,52 46,52" fill="#C9956B"/>
  </svg>`,

  li_watchtower: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#1E3A5F"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <rect x="22" y="20" width="20" height="42" fill="url(#g)" stroke="#2563EB" stroke-width="2"/>
    <rect x="18" y="32" width="28" height="30" fill="url(#g)" stroke="#2563EB" stroke-width="2"/>
    <path d="M20,20 L20,8 L24,10 L24,6 L28,10 L28,6 L32,10 L32,6 L36,10 L36,6 L40,10 L40,8 L44,20 Z" fill="url(#g)" stroke="#2563EB" stroke-width="1.5"/>
    <rect x="28" y="42" width="8" height="20" rx="4" fill="#0D1117" stroke="#2563EB" stroke-width="1.5"/>
    <path d="M18,32 Q14,26 12,18 Q16,18 18,24" fill="url(#g)" stroke="#2563EB" stroke-width="1"/>
    <path d="M46,32 Q50,26 52,18 Q48,18 46,24" fill="url(#g)" stroke="#2563EB" stroke-width="1"/>
    <circle cx="32" cy="14" r="3" fill="#FFD700" opacity="0.9"/>
    <rect x="24" y="36" width="6" height="8" rx="1" fill="#0D1117" stroke="#2563EB" stroke-width="1"/>
    <rect x="34" y="36" width="6" height="8" rx="1" fill="#0D1117" stroke="#2563EB" stroke-width="1"/>
  </svg>`,

  li_throne_room: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#1E293B"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <rect x="4" y="48" width="56" height="14" fill="url(#g)" stroke="#C9956B" stroke-width="1"/>
    <path d="M4,48 L4,8 L60,8 L60,48" fill="none" stroke="#C9956B" stroke-width="1.5"/>
    <line x1="14" y1="8" x2="14" y2="48" stroke="#C9956B" stroke-width="1" opacity="0.4"/>
    <line x1="24" y1="8" x2="24" y2="48" stroke="#C9956B" stroke-width="1" opacity="0.4"/>
    <line x1="40" y1="8" x2="40" y2="48" stroke="#C9956B" stroke-width="1" opacity="0.4"/>
    <line x1="50" y1="8" x2="50" y2="48" stroke="#C9956B" stroke-width="1" opacity="0.4"/>
    <path d="M4,8 Q32,2 60,8" fill="none" stroke="#FFD700" stroke-width="2" opacity="0.6"/>
    <rect x="26" y="28" width="12" height="20" rx="2" fill="#C9956B" stroke="#8B6914" stroke-width="1.5"/>
    <rect x="22" y="36" width="20" height="4" rx="2" fill="#8B6914"/>
    <polygon points="32,22 34,28 32,26 30,28" fill="#FFD700"/>
    <rect x="24" y="44" width="6" height="14" rx="1" fill="#8B6914"/>
    <rect x="34" y="44" width="6" height="14" rx="1" fill="#8B6914"/>
  </svg>`,

  li_dungeon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#1F2937"/><stop offset="100%" stop-color="#0D1117"/></linearGradient></defs>
    <rect x="4" y="4" width="56" height="56" rx="4" fill="url(#g)" stroke="#374151" stroke-width="2"/>
    <path d="M24,60 L24,36 Q24,28 32,28 Q40,28 40,36 L40,60" fill="#0D1117" stroke="#374151" stroke-width="2"/>
    <path d="M24,36 Q28,32 32,32 Q36,32 40,36" fill="none" stroke="#374151" stroke-width="2"/>
    <line x1="4" y1="22" x2="60" y2="22" stroke="#374151" stroke-width="2" opacity="0.6"/>
    <line x1="14" y1="4" x2="14" y2="22" stroke="#374151" stroke-width="2" opacity="0.5"/>
    <line x1="50" y1="4" x2="50" y2="22" stroke="#374151" stroke-width="2" opacity="0.5"/>
    <circle cx="14" cy="14" r="4" fill="#1F2937" stroke="#4B5563" stroke-width="1.5"/>
    <circle cx="50" cy="14" r="4" fill="#1F2937" stroke="#4B5563" stroke-width="1.5"/>
    <circle cx="14" cy="14" r="1.5" fill="#CC0000" opacity="0.7"/>
    <circle cx="50" cy="14" r="1.5" fill="#CC0000" opacity="0.7"/>
    <rect x="14" y="22" width="36" height="2" fill="#C9956B" opacity="0.5"/>
  </svg>`,

  li_imperial_gate: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#374151"/><stop offset="100%" stop-color="#1F2937"/></linearGradient></defs>
    <rect x="4" y="28" width="56" height="34" fill="url(#g)" stroke="#C9956B" stroke-width="2"/>
    <path d="M4,28 Q4,6 32,6 Q60,6 60,28" fill="url(#g)" stroke="#C9956B" stroke-width="2"/>
    <path d="M12,62 L12,38 Q12,28 20,28 Q28,28 28,38 L28,62" fill="#0D1117" stroke="#C9956B" stroke-width="1.5"/>
    <path d="M36,62 L36,38 Q36,28 44,28 Q52,28 52,38 L52,62" fill="#0D1117" stroke="#C9956B" stroke-width="1.5"/>
    <polygon points="32,6 35,16 44,16 37,22 40,32 32,26 24,32 27,22 20,16 29,16" fill="#FFD700" opacity="0.8"/>
    <circle cx="32" cy="20" r="4" fill="#0D1117" stroke="#FFD700" stroke-width="1.5"/>
    <circle cx="32" cy="20" r="2" fill="#FFD700"/>
    <line x1="28" y1="50" x2="36" y2="50" stroke="#C9956B" stroke-width="2" opacity="0.6"/>
    <line x1="28" y1="45" x2="36" y2="45" stroke="#C9956B" stroke-width="1.5" opacity="0.4"/>
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
