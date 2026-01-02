import {DATA, WPN, FRAME, AI} from "./data.js";
import {initDebugPanel} from "./debug.js";
import {initMechLog} from "./mech-log.js";
import {initLoadoutUI} from "./ui.js";
import {createGame} from "./game.js";

const {dbg} = initDebugPanel();
const {pushMechLog} = initMechLog();
const ui = initLoadoutUI({data: {DATA, WPN, FRAME, AI}});

const {bootGame, destroyGame} = createGame({
  Phaser: window.Phaser,
  dbg,
  logToast: ui.logToast,
  pushMechLog,
  onEndBattle: ui.showResult
});

function startBattle() {
  ui.showBattlePanel();
  const cfg = ui.getConfig();
  dbg("bootGame called");
  bootGame(cfg);
}

function retry() {
  ui.showStartPanel();
  destroyGame();
  ui.logToast("READY");
}

ui.onStart(startBattle);
ui.onRetry(retry);
