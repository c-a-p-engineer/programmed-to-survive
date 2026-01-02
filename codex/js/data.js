export const DATA = {
  frames: [
    {id:"light",  name:"LIGHT",  hp:70,  speed:240, en:100, enRegen:18, desc:"高速。薄い。回避で生きる。"},
    {id:"middle", name:"MIDDLE", hp:95,  speed:210, en:120, enRegen:14, desc:"標準。バランス。"},
    {id:"heavy",  name:"HEAVY",  hp:130, speed:175, en:140, enRegen:11, desc:"鈍い。硬い。詰みづらい。"}
  ],
  weapons: [
    {id:"mg",     name:"Machinegun", type:"bullet", range:900,  dps:14, cd:0.10, speed:1000, desc:"連射。見てて気持ちいい。", pierce:false, explodeOnObstacle:false},
    {id:"cannon", name:"Cannon",     type:"bullet", range:1250, dps:22, cd:0.55, speed:1250, desc:"高威力。遠距離。", pierce:false,  explodeOnObstacle:false},
    {id:"missile",name:"Missile",    type:"missile",range:1050, dps:18, cd:0.70, speed:800,  radius:110, desc:"範囲。雑に強い。", pierce:false, explodeOnObstacle:true},
    {id:"grenade",name:"Grenade",    type:"lob",    range:520,  dps:16, cd:0.85, speed:620,  radius:85,  desc:"近〜中。範囲。", pierce:false, explodeOnObstacle:true},
    {id:"blade",  name:"Blade",      type:"melee",  range:120,  dps:22, cd:0.45, speed:0,    desc:"近接。扇型。"},
    {id:"mine",   name:"Mine",       type:"mine",   range:0,    dps:22, cd:1.10, speed:0,    radius:120, armMs:240, desc:"設置。踏ませる。"}
  ],
  ai: [
    {id:"balanced",  name:"Balanced",  keep:0.75, fleeHp:0.18, prefer:"mid",  desc:"無難。死ににくい。"},
    {id:"sniper",    name:"Sniper",    keep:0.95, fleeHp:0.12, prefer:"far",  desc:"距離を取る。"},
    {id:"berserker", name:"Berserker", keep:0.35, fleeHp:0.08, prefer:"near", desc:"突っ込む。死にやすい。"},
    {id:"coward",    name:"Coward",    keep:0.98, fleeHp:0.35, prefer:"far",  desc:"逃げる。稼げない。"},
    {id:"hunter",    name:"Hunter",    keep:0.65, fleeHp:0.10, prefer:"mid",  desc:"近い敵を確実に。"}
  ]
};

export const WPN = {};
export const FRAME = {};
export const AI = {};

for (let i = 0; i < DATA.weapons.length; i += 1) {
  WPN[DATA.weapons[i].id] = DATA.weapons[i];
}
for (let j = 0; j < DATA.frames.length; j += 1) {
  FRAME[DATA.frames[j].id] = DATA.frames[j];
}
for (let k = 0; k < DATA.ai.length; k += 1) {
  AI[DATA.ai[k].id] = DATA.ai[k];
}
