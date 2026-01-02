import {DATA, WPN, FRAME, AI} from "./data";
import {initDebugPanel} from "./debug";
import {initMechLog} from "./mech-log";
import {initLoadoutUI} from "./ui";
import {createGame} from "./game";

const {dbg} = initDebugPanel();
const {pushMechLog} = initMechLog();
const ui = initLoadoutUI({data: {DATA, WPN, FRAME, AI}});

const {bootGame, destroyGame} = createGame({
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
