window.PTS_CONFIG = {
  game: {
    width: 820,
    height: 520,
    backgroundColor: "#0b1020",
  },
  ui: {
    title: "フェーズ1: 戦闘ループ試作",
    startHeadline: "プロトタイプ：設定 → 自動戦闘 → HP0でリザルト & リトライ",
    startHint: "※スマホでエラーが見えない場合は、この画面下に表示します",
    startButton: "START",
    retryButton: "リトライ",
    resultWin: "全WAVE制覇！",
    resultLose: "敗北... もう一度挑戦",
    hudPlayerHp: "PLAYER HP",
    hudEnemyHp: "ENEMY HP",
    hudWave: "WAVE",
    hudScore: "SCORE",
  },
  uiThemes: [
    {
      id: "reference",
      label: "Reference",
      layout: "reference",
      palette: {
        bg: 0x070a0f,
        panel: 0x101821,
        panelBorder: 0x223240,
        accent: 0x00f0c8,
        highlight: 0x22d3ee,
        text: "#e2e8f0",
        subText: "#94a3b8",
        accentText: "#00f0c8",
        highlightText: "#22d3ee",
      },
    },
  ],
  player: {
    baseCooldown: 320,
  },
  enemy: {
    baseHp: 80,
    hpPerWave: 20,
    baseDamage: 8,
    damagePerWave: 2,
    baseSpeed: 150,
    speedPerWave: 10,
  },
  waves: {
    max: 3,
    scoreBase: 150,
  },
  loadouts: {
    ships: [
      { label: "Scout", hp: 90, speed: 270 },
      { label: "Balanced", hp: 120, speed: 240 },
      { label: "Guardian", hp: 150, speed: 220 },
    ],
    weaponsMain: [
      { label: "Pulse", damage: 12, cooldown: 320 },
      { label: "Blaster", damage: 16, cooldown: 420 },
      { label: "Needle", damage: 8, cooldown: 240 },
    ],
    weaponsSub: [
      { label: "Shield", scoreBonus: 0.9, damage: 6, cooldown: 900 },
      { label: "Booster", scoreBonus: 1.1, damage: 8, cooldown: 700 },
      { label: "Scanner", scoreBonus: 1.3, damage: 10, cooldown: 600 },
    ],
    aiTypes: [
      { label: "Aggressive", enemySpeed: 1.1 },
      { label: "Tactical", enemySpeed: 1 },
      { label: "Cautious", enemySpeed: 0.9 },
    ],
  },
  obstacles: {
    texture: {
      width: 120,
      height: 28,
      radius: 6,
      color: 0x334155,
    },
    placements: [
      { xRatio: 0.5, yRatio: 0.5, scale: 1 },
      { xRatio: 0.28, yRatio: 0.65, scale: 0.8 },
      { xRatio: 0.72, yRatio: 0.37, scale: 0.8 },
    ],
  },
};
