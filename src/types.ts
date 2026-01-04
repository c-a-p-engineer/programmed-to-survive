export type Frame = {
  id: string;
  name: string;
  hp: number;
  speed: number;
  en: number;
  enRegen: number;
  desc: string;
};

export type Weapon = {
  id: string;
  name: string;
  type: "bullet" | "missile" | "lob" | "melee" | "mine";
  range: number;
  dps: number;
  cd: number;
  speed: number;
  desc: string;
  pierce?: boolean;
  explodeOnObstacle?: boolean;
  radius?: number;
  armMs?: number;
};

export type AiProfile = {
  id: string;
  name: string;
  keep: number;
  fleeHp: number;
  prefer: "near" | "mid" | "far";
  desc: string;
};

export type BattleConfig = {
  frameId: string;
  wpnAId: string;
  wpnBId: string;
  aiId: string;
};

export type BattleLoadout = {
  frame: Frame;
  wpnA: Weapon;
  wpnB: Weapon;
  ai: AiProfile;
};

export type UiHooks = {
  toast: (message: string) => void;
  debug: (message: string) => void;
  mechLog: (type: "sys" | "lock" | "kill" | "obj" | "dmg", timeMs: number, msg: string) => void;
  showResult: (score: number, timeSec: number, loadout: BattleLoadout) => void;
};

export type UiController = {
  onStart: (handler: () => void) => void;
  onRetry: (handler: () => void) => void;
  hideStart: () => void;
  showStart: () => void;
  hideResult: () => void;
  showResultPanel: () => void;
  getConfig: () => BattleConfig;
  setToast: (message: string) => void;
  setDebug: (message: string) => void;
  pushMechLog: (type: "sys" | "lock" | "kill" | "obj" | "dmg", timeMs: number, msg: string) => void;
  renderResult: (score: number, timeSec: number, loadout: BattleLoadout) => void;
};
