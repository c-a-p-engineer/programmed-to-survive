export function initLoadoutUI({data} = {}) {
  const elStart = document.getElementById("startPanel");
  const elRes = document.getElementById("resultPanel");
  const toast = document.getElementById("toast");

  const selFrame = document.getElementById("selFrame");
  const selWpnA = document.getElementById("selWpnA");
  const selWpnB = document.getElementById("selWpnB");
  const selAI = document.getElementById("selAI");

  const btnStart = document.getElementById("btnStart");
  const btnRetry = document.getElementById("btnRetry");

  function logToast(msg) {
    try {
      if (toast) {
        toast.textContent = String(msg);
      }
    } catch (e) {
      // noop
    }
  }

  window.addEventListener("error", (ev) => {
    logToast(`ERROR: ${(ev && ev.message) ? ev.message : "unknown"}`);
  });

  function fillSelect(sel, items) {
    if (!sel) return;
    sel.innerHTML = "";
    for (let i = 0; i < items.length; i += 1) {
      const o = document.createElement("option");
      o.value = items[i].id;
      o.textContent = items[i].name || items[i].id;
      sel.appendChild(o);
    }
  }

  function refreshDesc() {
    if (!data) return;
    const fr = data.FRAME[selFrame.value];
    const a = data.WPN[selWpnA.value];
    const b = data.WPN[selWpnB.value];
    const ai = data.AI[selAI.value];

    const frameDesc = document.getElementById("frameDesc");
    const wpnADesc = document.getElementById("wpnADesc");
    const wpnBDesc = document.getElementById("wpnBDesc");
    const aiDesc = document.getElementById("aiDesc");

    if (frameDesc) {
      frameDesc.textContent = `${fr.desc}  (HP ${fr.hp} / SPD ${fr.speed})`;
    }
    if (wpnADesc) {
      wpnADesc.textContent = `${a.desc}  (R ${a.range} / DPS ${a.dps})`;
    }
    if (wpnBDesc) {
      wpnBDesc.textContent = `${b.desc}  (R ${b.range} / DPS ${b.dps})`;
    }
    if (aiDesc) {
      aiDesc.textContent = ai.desc;
    }

    const kpi = document.getElementById("kpi");
    if (kpi) {
      kpi.innerHTML = "";
      const pill = (text, cls) => {
        const d = document.createElement("div");
        d.className = `pill ${cls || ""}`;
        d.textContent = text;
        kpi.appendChild(d);
      };
      pill(`FRAME: ${fr.name}`, "good");
      pill(`MAIN: ${a.name}`, "");
      pill(`SUB: ${b.name}`, "");
      pill(`AI: ${ai.name}`, "");
    }
  }

  if (data) {
    fillSelect(selFrame, data.DATA.frames);
    fillSelect(selWpnA, data.DATA.weapons);
    fillSelect(selWpnB, data.DATA.weapons);
    fillSelect(selAI, data.DATA.ai);

    selFrame.value = "middle";
    selWpnA.value = "mg";
    selWpnB.value = "cannon";
    selAI.value = "balanced";

    selFrame.addEventListener("change", refreshDesc);
    selWpnA.addEventListener("change", refreshDesc);
    selWpnB.addEventListener("change", refreshDesc);
    selAI.addEventListener("change", refreshDesc);
    refreshDesc();
  }

  function getConfig() {
    return {
      frame: data.FRAME[selFrame.value],
      wpnA: data.WPN[selWpnA.value],
      wpnB: data.WPN[selWpnB.value],
      ai: data.AI[selAI.value]
    };
  }

  function showResult(score, timeSec, cfg) {
    const resultText = document.getElementById("resultText");
    const resultKpi = document.getElementById("resultKpi");

    const txt = `SCORE: ${score}\nTIME: ${timeSec}s\nFRAME: ${cfg.frame.name} / AI: ${cfg.ai.name}\nMAIN: ${cfg.wpnA.name} / SUB: ${cfg.wpnB.name}`;
    if (resultText) {
      resultText.textContent = txt;
    }

    if (resultKpi) {
      resultKpi.innerHTML = "";
      const pill = (text, cls) => {
        const d = document.createElement("div");
        d.className = `pill ${cls || ""}`;
        d.textContent = text;
        resultKpi.appendChild(d);
      };
      pill(`SCORE ${score}`, "good");
      pill(`TIME ${timeSec}s`, "");
      pill(cfg.frame.name, "");
      pill(cfg.ai.name, "");
      pill(`MAIN ${cfg.wpnA.name}`, "");
      pill(`SUB ${cfg.wpnB.name}`, "bad");
    }

    if (elRes) {
      elRes.classList.remove("hidden");
    }
  }

  function showBattlePanel() {
    if (elRes) elRes.classList.add("hidden");
    if (elStart) elStart.classList.add("hidden");
  }

  function showStartPanel() {
    if (elRes) elRes.classList.add("hidden");
    if (elStart) elStart.classList.remove("hidden");
  }

  function onStart(handler) {
    if (btnStart) btnStart.addEventListener("click", handler);
  }

  function onRetry(handler) {
    if (btnRetry) btnRetry.addEventListener("click", handler);
  }

  return {
    getConfig,
    logToast,
    showResult,
    showBattlePanel,
    showStartPanel,
    onStart,
    onRetry
  };
}
