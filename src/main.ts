import { AI, DATA, FRAME, WPN } from "./data";
import { startBattle, type GameHandle } from "./game";
import { createUi } from "./ui";
import type { BattleLoadout, UiHooks } from "./types";

const ui = createUi(DATA);

const buildLoadout = (ids: { frameId: string; wpnAId: string; wpnBId: string; aiId: string }): BattleLoadout => {
  const frame = FRAME[ids.frameId];
  const wpnA = WPN[ids.wpnAId];
  const wpnB = WPN[ids.wpnBId];
  const ai = AI[ids.aiId];
  if (!frame || !wpnA || !wpnB || !ai) {
    throw new Error("Invalid loadout selection.");
  }
  return { frame, wpnA, wpnB, ai };
};

let game: GameHandle | null = null;

const hooks: UiHooks = {
  toast: ui.setToast,
  debug: ui.setDebug,
  mechLog: ui.pushMechLog,
  showResult: (score, timeSec, loadout) => {
    ui.renderResult(score, timeSec, loadout);
    ui.showResultPanel();
  }
};

ui.onStart(() => {
  ui.hideResult();
  ui.hideStart();
  const loadout = buildLoadout(ui.getConfig());
  game?.destroy();
  game = startBattle(loadout, hooks);
});

ui.onRetry(() => {
  ui.hideResult();
  ui.showStart();
  game?.destroy();
  game = null;
  ui.setToast("READY");
});
