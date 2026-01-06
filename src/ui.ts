import type { BattleConfig, BattleLoadout, UiController } from "./types";
import type { AiProfile, Frame, Weapon } from "./types";

type UiData = {
  frames: Frame[];
  weapons: Weapon[];
  ai: AiProfile[];
};

const ensureElement = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing required element: ${id}`);
  }
  return el as T;
};

const fmtHMSms = (ms: number): string => {
  const clamped = Math.max(0, ms | 0);
  let rest = clamped;
  const h = Math.floor(rest / 3600000);
  rest -= h * 3600000;
  const m = Math.floor(rest / 60000);
  rest -= m * 60000;
  const s = Math.floor(rest / 1000);
  const r = rest - s * 1000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(r).padStart(3, "0")}`;
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char] ?? char));

export const createUi = (data: UiData): UiController => {
  const debugButton = ensureElement<HTMLButtonElement>("debugBtn");
  const debugPanel = ensureElement<HTMLDivElement>("debugPanel");
  const mechLogPanel = ensureElement<HTMLDivElement>("mechLogPanel");
  const mechLogLines = ensureElement<HTMLDivElement>("mechLogLines");
  const startPanel = ensureElement<HTMLDivElement>("startPanel");
  const resultPanel = ensureElement<HTMLDivElement>("resultPanel");
  const toast = ensureElement<HTMLDivElement>("toast");

  const selFrame = ensureElement<HTMLSelectElement>("selFrame");
  const selWpnA = ensureElement<HTMLSelectElement>("selWpnA");
  const selWpnB = ensureElement<HTMLSelectElement>("selWpnB");
  const selAI = ensureElement<HTMLSelectElement>("selAI");
  const frameDesc = ensureElement<HTMLDivElement>("frameDesc");
  const wpnADesc = ensureElement<HTMLDivElement>("wpnADesc");
  const wpnBDesc = ensureElement<HTMLDivElement>("wpnBDesc");
  const aiDesc = ensureElement<HTMLDivElement>("aiDesc");
  const kpi = ensureElement<HTMLDivElement>("kpi");

  const resultText = ensureElement<HTMLDivElement>("resultText");
  const resultKpi = ensureElement<HTMLDivElement>("resultKpi");
  const btnStart = ensureElement<HTMLButtonElement>("btnStart");
  const btnRetry = ensureElement<HTMLButtonElement>("btnRetry");

  let debugVisible = false;
  const debugLines: string[] = [];
  const mechLog: { t: number; cls: string; msg: string }[] = [];
  const debugEnabled = window.location.hostname === "localhost" || window.location.search.includes("debug=1");

  document.body.classList.toggle("is-debug", debugEnabled);
  debugButton.style.display = debugEnabled ? "block" : "none";

  const renderMechLog = (): void => {
    const minLines = 5;
    const lines = mechLog.map((line, idx) => {
      const ageCls = idx === mechLog.length - 1 ? "is-latest" : "is-old";
      return `<div class='line ${line.cls} ${ageCls}'>${fmtHMSms(line.t)} ${escapeHtml(line.msg)}</div>`;
    });
    while (lines.length < minLines) {
      lines.push("<div class='line placeholder'>&nbsp;</div>");
    }
    mechLogLines.innerHTML = lines.join("");
  };
  mechLogPanel.style.display = "none";
  mechLogPanel.style.visibility = "hidden";
  renderMechLog();

  const setDebug = (message: string): void => {
    const t = new Date().toISOString().slice(11, 19);
    debugLines.push(`[${t}] ${message}`);
    if (debugLines.length > 200) debugLines.shift();
    debugPanel.textContent = debugLines.join("\n");
  };

  const setToast = (message: string): void => {
    toast.textContent = String(message);
  };

  const pushMechLog = (type: "sys" | "lock" | "kill" | "obj" | "dmg", timeMs: number, msg: string): void => {
    mechLogPanel.style.display = "block";
    mechLogPanel.style.visibility = "visible";
    const cls = `c-${type ?? "sys"}`;
    mechLog.push({ t: timeMs | 0, cls, msg });
    if (mechLog.length > 5) mechLog.shift();
    renderMechLog();
    mechLogPanel.style.opacity = "0";
    requestAnimationFrame(() => {
      mechLogPanel.style.opacity = "0.8";
    });
    window.clearTimeout((mechLogPanel as any).__fadeTimer);
    (mechLogPanel as any).__fadeTimer = window.setTimeout(() => {
      mechLogPanel.style.opacity = "0.35";
    }, 2500);
  };

  const fillSelect = (select: HTMLSelectElement, items: { id: string; name: string }[]): void => {
    select.innerHTML = "";
    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.name ?? item.id;
      select.appendChild(option);
    });
  };

  const refreshDesc = (): void => {
    const frame = data.frames.find((item) => item.id === selFrame.value);
    const wpnA = data.weapons.find((item) => item.id === selWpnA.value);
    const wpnB = data.weapons.find((item) => item.id === selWpnB.value);
    const ai = data.ai.find((item) => item.id === selAI.value);
    if (!frame || !wpnA || !wpnB || !ai) return;

    frameDesc.textContent = `${frame.desc}  (HP ${frame.hp} / SPD ${frame.speed})`;
    wpnADesc.textContent = `${wpnA.desc}  (R ${wpnA.range} / DPS ${wpnA.dps})`;
    wpnBDesc.textContent = `${wpnB.desc}  (R ${wpnB.range} / DPS ${wpnB.dps})`;
    aiDesc.textContent = ai.desc;

    kpi.innerHTML = "";
    const pill = (text: string, cls?: string): void => {
      const node = document.createElement("div");
      node.className = `pill ${cls ?? ""}`.trim();
      node.textContent = text;
      kpi.appendChild(node);
    };

    pill(`FRAME: ${frame.name}`, "good");
    pill(`MAIN: ${wpnA.name}`);
    pill(`SUB: ${wpnB.name}`);
    pill(`AI: ${ai.name}`);
  };

  fillSelect(selFrame, data.frames);
  fillSelect(selWpnA, data.weapons);
  fillSelect(selWpnB, data.weapons);
  fillSelect(selAI, data.ai);

  selFrame.value = "middle";
  selWpnA.value = "mg";
  selWpnB.value = "cannon";
  selAI.value = "balanced";

  selFrame.addEventListener("change", refreshDesc);
  selWpnA.addEventListener("change", refreshDesc);
  selWpnB.addEventListener("change", refreshDesc);
  selAI.addEventListener("change", refreshDesc);
  refreshDesc();

  startPanel.classList.remove("hidden");
  startPanel.style.display = "flex";
  resultPanel.classList.add("hidden");
  resultPanel.style.display = "none";
  mechLogPanel.style.display = "none";
  mechLogPanel.style.visibility = "hidden";

  if (debugEnabled) {
    debugButton.addEventListener("click", () => {
      debugVisible = !debugVisible;
      debugPanel.style.display = debugVisible ? "block" : "none";
    });
  }

  window.addEventListener("error", (event) => {
    const msg = event?.message ? event.message : String(event);
    setDebug(`ERROR: ${msg}${event?.error?.stack ? `\n${event.error.stack}` : ""}`);
    setToast(`ERROR: ${msg}`);
  });

  const getConfig = (): BattleConfig => ({
    frameId: selFrame.value,
    wpnAId: selWpnA.value,
    wpnBId: selWpnB.value,
    aiId: selAI.value
  });

  const renderResult = (score: number, timeSec: number, loadout: BattleLoadout): void => {
    const txt = `SCORE: ${score}\nTIME: ${timeSec}s\nFRAME: ${loadout.frame.name} / AI: ${loadout.ai.name}\nMAIN: ${loadout.wpnA.name} / SUB: ${loadout.wpnB.name}`;
    resultText.textContent = txt;
    resultKpi.innerHTML = "";
    const pill = (text: string, cls?: string): void => {
      const node = document.createElement("div");
      node.className = `pill ${cls ?? ""}`.trim();
      node.textContent = text;
      resultKpi.appendChild(node);
    };
    pill(`SCORE ${score}`, "good");
    pill(`TIME ${timeSec}s`);
    pill(loadout.frame.name);
    pill(loadout.ai.name);
    pill(`MAIN ${loadout.wpnA.name}`);
    pill(`SUB ${loadout.wpnB.name}`, "bad");
  };

  return {
    onStart: (handler) => btnStart.addEventListener("click", handler),
    onRetry: (handler) => btnRetry.addEventListener("click", handler),
    hideStart: () => {
      startPanel.classList.add("hidden");
      startPanel.style.display = "none";
      mechLogPanel.style.display = "block";
      mechLogPanel.style.visibility = "visible";
    },
    showStart: () => {
      startPanel.classList.remove("hidden");
      startPanel.style.display = "flex";
      resultPanel.classList.add("hidden");
      resultPanel.style.display = "none";
      mechLogPanel.style.display = "none";
      mechLogPanel.style.visibility = "hidden";
    },
    hideResult: () => {
      resultPanel.classList.add("hidden");
      resultPanel.style.display = "none";
    },
    showResultPanel: () => {
      resultPanel.classList.remove("hidden");
      resultPanel.style.display = "flex";
      mechLogPanel.style.display = "none";
      mechLogPanel.style.visibility = "hidden";
    },
    getConfig,
    setToast,
    setDebug,
    pushMechLog,
    renderResult
  };
};
