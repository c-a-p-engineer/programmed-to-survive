import type { BattleLoadout, UiHooks } from "./types";

declare const Phaser: any;

type BattleState = { cfg: BattleLoadout; [key: string]: any };

export type GameHandle = { destroy: () => void };

export const startBattle = (loadout: BattleLoadout, hooks: UiHooks): GameHandle => {
  let game: any = null;
  const dbg = hooks.debug;
  const logToast = hooks.toast;
  const pushMechLog = hooks.mechLog;

    function clamp(v: number, a: number, b: number): number{ return v<a?a : (v>b?b:v); }

    function hitSpark(scene: any, x: number, y: number, kind: number): void{
      var r = (kind===1?10:(kind===2?18:6));
      var c = (kind===2?0xff4fd8:0xffffff);
      var g = scene.add.circle(x, y, r, c, kind===2?0.18:0.22);
      g.setBlendMode(Phaser.BlendModes.ADD);
      g.setDepth(5);
      scene.tweens.add({targets:g, alpha:0, duration:160, onComplete:function(){ if(g.active) g.destroy(); }});
    }

  function updateHUD_V3(scene: any, state: BattleState, tSec: number): void{
    // Top: score/wave/time. Bottom: mech stats.
    var cam = scene.cameras.main;
    var W = cam.width, H = cam.height;
    var base = Math.min(W, H);
    var pad = Math.max(6, Math.round(base * 0.02));
    var edge = Math.max(2, Math.round(base * 0.008));
    var topY = edge;
    var topH = Math.max(40, Math.round(H * 0.065));
    var bottomH = Math.max(96, Math.round(H * 0.15));
    var bottomY = H - bottomH - edge;

    // top plate
    if(scene.topPanelG){
      scene.topPanelG.clear();
    }

    var ms = Math.floor((tSec||0)*1000);
    var sec = Math.floor(tSec||0);
    var mm = String(Math.floor(sec/60)).padStart(2,"0");
    var ss = String(sec%60).padStart(2,"0");

    if(scene.waveTimeText){
      scene.waveTimeText.setText("W" + String(state.wave||1) + "  " + mm + ":" + ss);
      scene.waveTimeText.setPosition(edge + pad, topY + pad);
      scene.waveTimeText.setVisible(true);
      scene.waveTimeText.setAlpha(1);
    }

    // bottom plate (mech info)
    if(scene.bottomPanelG){
      scene.bottomPanelG.clear();
    }
    if(scene.mechInfoText){
      var frameName = state.cfg.frame ? state.cfg.frame.name : "-";
      var aiName = state.cfg.ai ? state.cfg.ai.name : "-";
      scene.mechInfoText.setText(
        "FRAME " + frameName +
        "   AI " + aiName
      );
      scene.mechInfoText.setWordWrapWidth(Math.round(W * 0.55), true);
      scene.mechInfoText.setPosition(edge + pad, bottomY + bottomH - edge - 8);
      scene.mechInfoText.setVisible(true);
      scene.mechInfoText.setAlpha(0.9);
    }

    if(scene.hpGroup){
      var hp = Math.max(0, state.hp|0), mhp = Math.max(1, state.hpMax ?? state.maxHp ?? 1);
      var exp = Math.max(0, (state.exp ?? state.score ?? 0)|0);
      scene.hpText.setText("HP " + hp + "/" + mhp);
      scene.expText.setText("EXP " + exp);
      scene.hpText.setPosition(0, 0);
      scene.expText.setPosition(0, 30);
      scene.hpGroup.setPosition(edge + pad, bottomY + pad);
      scene.hpGroup.setVisible(true);
      scene.hpGroup.setAlpha(1);
      if(scene.hpBarG && scene.expBarG){
        var barW = Math.max(128, Math.round(W * 0.32));
        scene.hpBarG.clear();
        scene.hpBarG.fillStyle(0xffffff, 0.12);
        scene.hpBarG.fillRoundedRect(0, 22, barW, 12, 6);
        scene.hpBarG.fillStyle(0x00ffcc, 0.8);
        scene.hpBarG.fillRoundedRect(0, 22, Math.max(6, barW * clamp(hp / mhp, 0, 1)), 12, 6);
        scene.expBarG.clear();
        scene.expBarG.fillStyle(0xffffff, 0.08);
        scene.expBarG.fillRoundedRect(0, 52, barW, 8, 5);
        scene.expBarG.fillStyle(0xffd36b, 0.55);
        scene.expBarG.fillRoundedRect(0, 52, Math.max(6, barW * clamp((exp % 100) / 100, 0, 1)), 8, 5);
      }
    }

    if(scene.weaponGroup){
      var waName = state.cfg.wpnA ? state.cfg.wpnA.name : "A";
      var wbName = state.cfg.wpnB ? state.cfg.wpnB.name : "B";
      var trunc = function(name: string): string{
        return name.length > 16 ? name.slice(0, 15) + "…" : name;
      };
      var weaponW = Math.max(140, Math.round(W * 0.28));
      scene.weaponMainText.setText("MAIN " + trunc(waName));
      scene.weaponSubText.setText("SUB " + trunc(wbName));
      scene.weaponMainText.setPosition(24, 0);
      scene.weaponSubText.setPosition(24, 22);
      scene.weaponGroup.setPosition(W - edge - pad - weaponW, bottomY + pad);
      scene.weaponGroup.setVisible(true);
      scene.weaponGroup.setAlpha(1);
      if(scene.weaponG){
        scene.weaponG.clear();
        scene.weaponG.fillStyle(0x00ffcc, 0.9);
        scene.weaponG.fillRoundedRect(0, 2, 16, 16, 4);
        scene.weaponG.fillStyle(0x66aaff, 0.9);
        scene.weaponG.fillRoundedRect(0, 24, 16, 16, 4);
      }
    }

    if(scene.scorePanelG && scene.scoreLabelText && scene.scoreValueText){
      scene.scoreLabelText.setText("SCORE");
      scene.scoreValueText.setText(String(state.score|0));
      var scorePad = 8;
      var scoreW = Math.max(scene.scoreLabelText.width, scene.scoreValueText.width) + scorePad * 2;
      var scoreH = scene.scoreLabelText.height + scene.scoreValueText.height + 8;
      var scoreX = W - scoreW - edge;
      var scoreY = topY + edge;
      scene.scorePanelG.clear();
      scene.scorePanelG.fillStyle(0x000000, 0.45);
      scene.scorePanelG.fillRoundedRect(scoreX, scoreY, scoreW, scoreH, 12);
      scene.scorePanelG.lineStyle(2, 0x00ffcc, 0.16);
      scene.scorePanelG.strokeRoundedRect(scoreX, scoreY, scoreW, scoreH, 12);
      scene.scoreLabelText.setPosition(scoreX + scorePad, scoreY + 4);
      scene.scoreValueText.setPosition(scoreX + scorePad, scoreY + 4 + scene.scoreLabelText.height);
      scene.scoreLabelText.setVisible(true);
      scene.scoreValueText.setVisible(true);
      scene.scoreLabelText.setAlpha(1);
      scene.scoreValueText.setAlpha(1);
    }

    if(scene.radarG){
      var radarR = Math.round(Math.min(48, Math.max(36, W * 0.13)));
      scene.radarR = radarR;
      scene.radarX = W - radarR - edge - pad;
      scene.radarY = bottomY - radarR - pad - 4;
    }

    if(scene.prevScore !== (state.score|0)){
      scene.prevScore = (state.score|0);
      if(scene.scoreValueText){
        scene.tweens.add({targets: scene.scoreValueText, scale: 1.12, duration: 120, yoyo: true, ease: "Quad.out"});
      }
    }
    if(scene.prevHp != null && (state.hp|0) < (scene.prevHp|0)){
      if(scene.hpGroup){
        scene.tweens.add({targets: scene.hpGroup, alpha: 0.4, duration: 120, yoyo: true, repeat: 1});
      }
    }
    scene.prevHp = (state.hp|0);

    // expose time to DOM log
    state.battleTimeMs = ms;
  }




    
    function losBlocked(scene: any, x1: number, y1: number, x2: number, y2: number): boolean{
      if(!scene.obstacles) return false;
      var line = new Phaser.Geom.Line(x1,y1,x2,y2);
      var obs = scene.obstacles.getChildren();
      var dxT = x2-x1, dyT = y2-y1;
      var distT = Math.sqrt(dxT*dxT + dyT*dyT);
      // ignore if too close
      if(distT < 1) return false;

      for(var i=0;i<obs.length;i++){
        var ob = obs[i];
        if(!ob.active) continue;
        var b = ob.body;
        if(!b) continue;

        // quick distance gating: ignore obstacles beyond target distance
        var cx = b.x + b.width*0.5;
        var cy = b.y + b.height*0.5;
        var dxO = cx - x1, dyO = cy - y1;
        var distO = Math.sqrt(dxO*dxO + dyO*dyO);

        // ignore obstacles very near the player (prevents "always blocked" if spawning too close)
        if(distO < 34) continue;

        // ignore obstacles behind the target
        if(distO > distT - 10) continue;

        var rect = new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height);
        if(Phaser.Geom.Intersects.LineToRectangle(line, rect)) return true;
      }
      return false;
    }

  function firstBlockingObstacle(scene: any, x1: number, y1: number, x2: number, y2: number): any{
    if(!scene.obstacles) return null;
    var line = new Phaser.Geom.Line(x1,y1,x2,y2);
    var obs = scene.obstacles.getChildren();
    var best = null;
    var bestDist = 1e9;
    for(var i=0;i<obs.length;i++){
      var ob = obs[i]; if(!ob.active || !ob.body) continue;
      var b = ob.body;
      var rect = new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height);
      if(!Phaser.Geom.Intersects.LineToRectangle(line, rect)) continue;
      // approximate distance to obstacle center
      var cx = b.x + b.width*0.5, cy = b.y + b.height*0.5;
      var d = Phaser.Math.Distance.Between(x1,y1,cx,cy);
      if(d < bestDist){ bestDist = d; best = ob; }
    }
    return best;
  }


    function makeTri(scene: any, key: string, size: number, color: number): void{
      var g = scene.make.graphics({x:0,y:0,add:false});
      g.clear();
      g.fillStyle(color, 1);
      g.fillTriangle(size/2, 1, 1, size-1, size-1, size-1);
      g.generateTexture(key, size, size);
      g.destroy();
    }

    function makeBullet(scene: any, key: string, size: number, color: number): void{
      var g = scene.make.graphics({x:0,y:0,add:false});
      g.clear();
      g.fillStyle(0x000000, 0.35);
      g.fillCircle(size/2+1, size/2+1, size/2);
      g.fillStyle(color, 1);
      g.fillCircle(size/2, size/2, size/2-1);
      g.generateTexture(key, size, size);
      g.destroy();
    }

    function makeObstacleTex(scene: any, key: string, w: number, h: number, color: number): void{
      var g = scene.make.graphics({x:0,y:0,add:false});
      g.clear();
      g.fillStyle(color, 1);
      g.fillRoundedRect(0,0,w,h,10);
      g.lineStyle(2, 0xffffff, 0.12);
      g.strokeRoundedRect(2,2,w-4,h-4,8);
      g.lineStyle(1, 0x00ffcc, 0.10);
      g.beginPath();
      g.moveTo(8, h*0.35); g.lineTo(w-8, h*0.35);
      g.moveTo(8, h*0.65); g.lineTo(w-8, h*0.65);
      g.strokePath();
      g.generateTexture(key, w, h);
      g.destroy();
    }

    function makeMine(scene: any, key: string, size: number): void{
      var g = scene.make.graphics({x:0,y:0,add:false});
      g.clear();
      g.fillStyle(0x0b0f16, 1);
      g.fillCircle(size/2, size/2, size/2);
      g.lineStyle(2, 0x00ffcc, 0.55);
      g.strokeCircle(size/2, size/2, size/2-2);
      g.fillStyle(0x00ffcc, 0.18);
      g.fillCircle(size/2, size/2, size/2-4);
      g.generateTexture(key, size, size);
      g.destroy();
    }

    function bootGame(cfg: BattleLoadout): void{
      // destroy existing
      if(game){
        try{ game.destroy(true); }catch(e){}
        game = null;
      }

      var BASE_W = 430;
      var BASE_H = 820;

      var config = {
        type: Phaser.AUTO,
        parent: "game",
        width: BASE_W,
        height: BASE_H,
        backgroundColor: "#05070b",
        physics: { default:"arcade", arcade:{ debug:false, gravity:{y:0} } },
        scene: { preload: preload, create: create, update: update }
      };

      const state: BattleState = {
        cfg: cfg,
        hp: cfg.frame.hp,
        hpMax: cfg.frame.hp,
        en: cfg.frame.en,
        enMax: cfg.frame.en,
        enRegen: cfg.frame.enRegen,
        speed: cfg.frame.speed,
        score: 0,
        t0: 0,
        lastA: 0,
        lastB: 0,
        target: null,
        lastSwitch: 0,
        targetDist: 0,
        lastDelta: 0,
        dead: false
      };

      function preload(this: any): void{
        makeTri(this, "p", 30, 0x00ffcc);
        makeTri(this, "e", 26, 0xff4d4d);
        makeBullet(this, "ba", 10, 0x00ffcc);
        makeBullet(this, "bb", 10, 0xff4fd8);
        makeMine(this, "mn", 22);
        makeObstacleTex(this, "obA", 140, 90, 0x2a3444);
        makeObstacleTex(this, "obB", 220, 130, 0x232c3a);
        makeObstacleTex(this, "obC", 110, 180, 0x273244);
      }

      function create(this: any): void{ dbg("scene.create");
        var self = this;
        // defensive init (prevents undefined length errors)
        if(!self.rangeTexts) self.rangeTexts = [];
        if(!self.lockG) self.lockG = self.add.graphics().setDepth(4);
        // radar init (in case injection missed)
        if(!self.radarG){
          self.radarG = self.add.graphics().setScrollFactor(0).setDepth(10);
          self.radarX = 320; self.radarY = 120; self.radarR = 58;
          self.radarRange = 900;
        }
        state.t0 = self.time.now;

        // world bounds (big)
        self.physics.world.setBounds(-4000,-4000,8000,8000);

        // player
        self.player = self.physics.add.image(0,0,"p");
        self.player.setDepth(2);
        self.player.setCircle(10);

        // groups
        self.enemies = self.physics.add.group();

        // enemy spawn system (guaranteed)
        self.spawnAcc = 0;
        self.spawnInterval = 0.85;
        function spawnEnemyNow(): any{
          var a = Math.random()*Math.PI*2;
          var d = 520 + Math.random()*520;
          var x = self.player.x + Math.cos(a)*d;
          var y = self.player.y + Math.sin(a)*d;
          var e = self.enemies.create(x, y, "e");
          e.setData("hp", 18);
          e.setData("blocked", false);
          e.setRotation(Phaser.Math.Angle.Between(x,y,self.player.x,self.player.y) + Math.PI/2);
          e.setCollideWorldBounds(false);
          e.setDepth(1);
          return e;
        }
        // initial wave
        for(var k=0;k<6;k++) spawnEnemyNow();
        dbg("spawn init enemies=" + self.enemies.getChildren().length);
        self.obsSpawnAcc = 0;
        self.obsSpawnInterval = 2.2; // seconds


        self.bullets = self.physics.add.group();
        self.mines = self.physics.add.group();      // obstacles (collidable) to make movement obvious
        self.obstacles = self.physics.add.staticGroup();
        var obKeys = ["obA","obB","obC"];
        for(var oi=0; oi<25; oi++){
          var a = Math.random()*Math.PI*2;
          var d = 280 + Math.random()*1400;
          var x = self.player.x + Math.cos(a)*d;
          var y = self.player.y + Math.sin(a)*d;
          var key = obKeys[(Math.random()*obKeys.length)|0];
          var ob = self.obstacles.create(x,y,key);
          // obstacle HP by size
          var bw = (ob.body && ob.body.width) ? ob.body.width : (ob.displayWidth||60);
          var bh = (ob.body && ob.body.height) ? ob.body.height : (ob.displayHeight||60);
          var maxHp = Math.max(30, Math.floor((bw*bh)/10));
          ob.setData("maxHp", maxHp);
          ob.setData("hp", maxHp);
          ob.setAlpha(0.55);
          ob.setAlpha(0.85);
          ob.setRotation((Math.random()*2-1)*0.18);
          ob.setDepth(0);
          ob.refreshBody();
        }
        self.obAcc = 0;


        // HUD
        self.mechInfoText = self.add.text(0,0,"", {fontFamily:"system-ui, sans-serif",fontSize:"16px",fontStyle:"700",fill:"#e8eefc",stroke:"#000",strokeThickness:5}).setScrollFactor(0).setDepth(12).setOrigin(0,1);


        // bars
        self.barG = self.add.graphics().setScrollFactor(0).setDepth(10);
        self.rangeG = self.add.graphics().setDepth(0);
        self.lockG = self.add.graphics().setDepth(4);
        self.rangeTexts = [];
        self.radarG = self.add.graphics().setScrollFactor(0).setDepth(10);
        self.radarX = 320; self.radarY = 120; self.radarR = 58;
        self.radarRange = 900;

        // camera follow
        self.cameras.main.startFollow(self.player, true, 0.12, 0.12);
        // dynamic zoom: widen camera based on longest weapon range (avoid off-screen kills)
        var maxR = Math.max(state.cfg.wpnA.range||0, state.cfg.wpnB.range||0, 520);
        var z = clamp(680 / maxR, 0.45, 0.90);
        self.cameras.main.setZoom(z);


        // collisions
        self.physics.add.overlap(self.bullets, self.enemies, function(b: any,e: any){
          if(!b.active || !e.active) return;
          hitSpark(self, b.x, b.y, (b.getData("pierce")?1:0));
          var dmg = b.getData("dmg") || 6;
          var hp = e.getData("hp") || 20;
          hp -= dmg;
          e.setData("hp", hp);
          b.destroy();
          if(hp <= 0){
            e.destroy();
            state.score += 1;
            state.kills = (state.kills||0) + 1;
            pushMechLog("kill", state.battleTimeMs||0, "KILL (" + (b.getData("weaponName")||"WEAPON") + ")");
          }
        });

        // bullets vs obstacles: block / pierce / explode
        
        // bullets vs obstacles: block + damage obstacles + destroy
        self.physics.add.overlap(self.bullets, self.obstacles, function(b: any, ob: any){
          if(!b.active || !ob.active) return;
          var born = b.getData("bornAt") || 0;
          if(born && (self.time.now - born) < 60) return;

          var aoe = b.getData("aoe") || 0;
          var dmg = b.getData("dmg") || 10;

          // explosive hits: spark + (optional) splash also damages obstacle
          if(aoe > 0 && b.getData("explodeOnObstacle")){
            hitSpark(self, b.x, b.y, 2);
            var boom = self.add.circle(b.x, b.y, aoe, 0xff4fd8, 0.14);
            boom.setBlendMode(Phaser.BlendModes.ADD);
            self.time.delayedCall(180, function(){ if(boom.active) boom.destroy(); });
          }else{
            hitSpark(self, b.x, b.y, 1);
          }

          // apply obstacle damage
          var hp = ob.getData("hp");
          var maxHp = ob.getData("maxHp") || 60;
          if(typeof hp !== "number"){ hp = maxHp; }
          hp -= dmg;
          ob.setData("hp", hp);

          // visual feedback (crack-ish): lower alpha + tint toward red
          var ratio = Math.max(0, hp / maxHp);
          ob.setAlpha(0.25 + ratio*0.45);
          if(ob.setTint){
            var tint = ratio < 0.5 ? 0x8a95b5 : 0x6f7ea6;
            if(ratio < 0.25) tint = 0x8b5a5a;
            ob.setTint(tint);
          }

          if(hp <= 0){
            // destroy obstacle
            hitSpark(self, ob.x, ob.y, 2);
            ob.destroy();
            pushMechLog("obj", state.battleTimeMs||0, "OBJECT DESTROYED");
          }

          // bullet is blocked (no piercing in this build)
          b.destroy();
        });


        // mine detonation check handled in update

        // obstacle collisions
        self.physics.add.collider(self.player, self.obstacles);
        self.physics.add.collider(self.enemies, self.obstacles);
        // bullets: pass-through for now

        // input: none (prototype), but tap will "nudge" direction (optional)
      self.input.on("pointerdown", function(ptr: any){
          if(state.dead) return;
          // small impulse for debug feel, not required
          var ang = Phaser.Math.Angle.Between(self.player.x, self.player.y, ptr.worldX, ptr.worldY);
          self.player.rotation = ang + Math.PI/2;
          self.physics.velocityFromRotation(ang, state.speed, self.player.body.velocity);
        });

        // spawn
        self.spawnAcc = 0;
        self.dmgAcc = 0;

        logToast("BATTLE STARTED"); dbg("Battle started");
      }

      function spawnEnemy(self: any): any{
        var px = self.player.x, py = self.player.y;
        var ang = Math.random() * Math.PI * 2;
        var dist = 520 + Math.random()*520;
        var x = px + Math.cos(ang)*dist;
        var y = py + Math.sin(ang)*dist;

        var e = self.physics.add.image(x,y,"e");
        e.setDepth(1);
        e.setCircle(9);
        var hp = 24 + (state.score*0.3);
        var spd = 170 + (state.score*0.08);
        e.setData("hp", hp);
        e.setData("spd", spd);
        self.enemies.add(e);
        return e;
      }

      
      function findNearestEnemy(self: any): any{
        var es = self.enemies.getChildren();
        // pass0: visible only; pass1: any
        for(var pass=0; pass<2; pass++){
          var best = null;
          var bd = 1e18;
          for(var i=0;i<es.length;i++){
            var e = es[i];
            if(!e.active) continue;
            var blocked = losBlocked(self, self.player.x, self.player.y, e.x, e.y);
            if(pass===0 && blocked) continue;
            var dx = e.x - self.player.x;
            var dy = e.y - self.player.y;
            var d = dx*dx + dy*dy;
            if(d < bd){ bd = d; best = e; }
          }
          if(best) return best;
        }
        return null;
      }

      function fireWeapon(self: any, w: any, now: number, tex: string): void{
        if(state.dead) return;
        if(!state.target || !state.target.active) return;

        var W = w;
        var target = state.target;
        var px = self.player.x, py = self.player.y;
        var tx = target.x, ty = target.y;
        var dist = Phaser.Math.Distance.Between(px,py,tx,ty);
        if(W.range > 0 && dist > W.range) return;
        // line-of-sight: cannot fire through obstacles unless weapon pierces
        if(W.type !== "melee" && W.type !== "mine"){
          var blockedLOS = losBlocked(self, px, py, tx, ty);

  if(blockedLOS){
    // shoot the blocking obstacle instead (supports "break cover" behavior)
    var ob = firstBlockingObstacle(self, px, py, tx, ty);
    if(ob && ob.active){
      tx = ob.x; ty = ob.y;
      // small nudge to obstacle center via body center if available
      if(ob.body){
        tx = ob.body.x + ob.body.width*0.5;
        ty = ob.body.y + ob.body.height*0.5;
      }
      // log once per ~1.2s to avoid spam
      self._breakCoverAcc = (self._breakCoverAcc||0) + (state.lastDelta||0);
      if(self._breakCoverAcc > 1200){
        self._breakCoverAcc = 0;
        pushMechLog("obj", state.battleTimeMs||0, "BREAK COVER → obstacle");
      }
    }else{
      return;
    }
  }
        }

        if(W.type === "melee"){
          // fan-shaped slash (sector)
          var fan = Math.PI * 0.65; // ~117deg
          var face = Phaser.Math.Angle.Between(px,py,tx,ty);
          self.player.rotation = face + Math.PI/2;

          // visualize arc briefly
          if(!self.slashG){ self.slashG = self.add.graphics(); self.slashG.setDepth(2); }
          self.slashG.clear();
          self.slashG.fillStyle(0x00ffcc, 0.10);
          self.slashG.lineStyle(2, 0x00ffcc, 0.28);
          self.slashG.beginPath();
          self.slashG.slice(px, py, W.range, face - fan/2, face + fan/2, false);
          self.slashG.closePath();
          self.slashG.fillPath();
          self.slashG.strokePath();
          self.time.delayedCall(90, function(){ if(self.slashG) self.slashG.clear(); });

          var es = self.enemies.getChildren();
          var dmg = Math.max(10, Math.floor(W.dps*W.cd));
          for(var i=0;i<es.length;i++){
            var e = es[i];
            if(!e.active) continue;
            var dx = e.x - px;
            var dy = e.y - py;
            var d = Math.sqrt(dx*dx + dy*dy);
            if(d > W.range) continue;
            var hitAng = Math.atan2(dy, dx);
            var diff = Phaser.Math.Angle.Wrap(hitAng - face);
            if(Math.abs(diff) <= fan/2){
              e.setData("hp", (e.getData("hp")||20) - dmg);
              if(e.getData("hp") <= 0){ e.destroy(); state.score += 1; }
            }
          }
          return;
        }

        if(W.type === "mine"){
          var mn = self.physics.add.image(px, py, "mn");
          mn.setDepth(1);
          mn.setCircle(10);
          mn.body.setImmovable(true);
          mn.body.setVelocity(0,0);
          mn.setAlpha(0.55);
          mn.setData("armed", false);
          mn.setData("armAt", now + (W.armMs || 240));
          mn.setData("radius", W.radius || 120);
          mn.setData("dmg", Math.max(12, Math.floor(W.dps*0.9)));
          self.mines.add(mn);
          return;
        }

        // projectile (straight like shooter)
        var fireAng = Phaser.Math.Angle.Between(px,py,tx,ty);
        self.player.rotation = fireAng + Math.PI/2;

        var ox = Math.cos(fireAng)*26;
        var oy = Math.sin(fireAng)*26;
        var b = self.physics.add.image(px+ox, py+oy, tex);
        b.setDepth(3);
        b.setCircle(4);
        b.setData("dmg", Math.max(6, Math.floor(W.dps * W.cd)));
        b.setData("bornAt", now);
        b.setData("pierce", !!W.pierce);
        b.setData("explodeOnObstacle", !!W.explodeOnObstacle);
        self.bullets.add(b);

        self.physics.velocityFromRotation(fireAng, (W.speed||1000), b.body.velocity);

        // lifetime by range/speed (padding)
        var life = Math.floor(((W.range||900) / ((W.speed||1000))) * 1000) + 1200;
        self.time.delayedCall(life, function(){ if(b.active) b.destroy(); });

        if(W.type === "lob" || W.type === "missile"){
          // AOE on hit by enemy overlap already; add proximity detonation
          // (simple: explode if close to any enemy)
          b.setData("aoe", W.radius || 90);
          b.setData("explodeOnObstacle", !!W.explodeOnObstacle);
        }
      }

      function update(this: any, time: number, delta: number): void{
        var self = this;
        var tSec = (state.startMs!=null) ? ((self.time.now - state.startMs)/1000) : 0;
        state.lastDelta = delta;

        try{
          // throttle debug spam
          self._dbgAcc = (self._dbgAcc||0) + delta;
          if(self._dbgAcc > 700){ self._dbgAcc = 0; dbg("tick " + Math.floor(time)); }
        if(state.dead) return;

        // regen
        state.en = clamp(state.en + state.enRegen*(delta/1000), 0, state.enMax);      // spawn enemies (guaranteed ramp)
        self.spawnAcc += delta/1000;
        if(self.spawnAcc >= self.spawnInterval){
          self.spawnAcc = 0;
          // cap total enemies
          if(self.enemies.getChildren().length < 26){
            var a = Math.random()*Math.PI*2;
            var d = 560 + Math.random()*660;
            var x = self.player.x + Math.cos(a)*d;
            var y = self.player.y + Math.sin(a)*d;
            var e = self.enemies.create(x, y, "e");
            e.setData("hp", 18);
            e.setData("blocked", false);
            e.setRotation(Phaser.Math.Angle.Between(x,y,self.player.x,self.player.y) + Math.PI/2);
            e.setDepth(1);
          }
        }
        self._cntAcc = (self._cntAcc||0) + delta;
        if(self._cntAcc > 2500){
          self._cntAcc = 0;
          dbg("counts enemies=" + self.enemies.getChildren().length + " obstacles=" + (self.obstacles?self.obstacles.getChildren().length:0) + " bullets=" + self.bullets.getChildren().length);
        }

        // snapshot children arrays (avoid undefined)
        var es = (self.enemies && self.enemies.getChildren) ? self.enemies.getChildren() : [];
        // ENEMY CHASE V2: clearer pursuit with simple obstacle escape
        for(var ei=0; ei<es.length; ei++){
          var e = es[ei];
          if(!e.active || !e.body) continue;
          var ang = Phaser.Math.Angle.Between(e.x, e.y, self.player.x, self.player.y);
          var vx = e.body.velocity.x, vy = e.body.velocity.y;
          var sp2 = vx*vx + vy*vy;
          var stuck = (e.body.blocked && (e.body.blocked.left||e.body.blocked.right||e.body.blocked.up||e.body.blocked.down))
            || (e.body.touching && (e.body.touching.left||e.body.touching.right||e.body.touching.up||e.body.touching.down))
            || sp2 < 40;
          var bias = e.getData("turnBias") || 0;
          var biasT = e.getData("turnBiasT") || 0;
          if(stuck || biasT <= 0){
            bias = (Math.random()<0.5 ? -1 : 1) * (0.35 + Math.random()*0.35);
            biasT = 220 + Math.random()*260;
          }
          biasT -= delta;
          e.setData("turnBias", bias);
          e.setData("turnBiasT", biasT);
          var steer = ang + (biasT>0 ? bias : 0);
          var baseSpd = 74;
          var dd = Phaser.Math.Distance.Between(e.x,e.y,self.player.x,self.player.y);
        var enemySpd = baseSpd + (dd<260 ? 26 : 0);
        e.body.setVelocity(Math.cos(steer)*enemySpd, Math.sin(steer)*enemySpd);
          e.rotation = steer + Math.PI/2;
        }

        var ms = (self.mines && self.mines.getChildren) ? self.mines.getChildren() : [];
        var obsArr = (self.obstacles && self.obstacles.getChildren) ? self.obstacles.getChildren() : [];

        
  // OBSTACLE SPAWN TICK (respect density cap)
  self.obsSpawnAcc += delta/1000;
  if(self.obsSpawnAcc >= self.obsSpawnInterval){
    self.obsSpawnAcc = 0;
    var obs = (self.obstacles && self.obstacles.getChildren) ? self.obstacles.getChildren() : [];
    if(obs.length < 70){
      // count nearby obstacles
      var cnt = 0;
      for(var oi=0; oi<obs.length; oi++){
        var o = obs[oi]; if(!o.active) continue;
        if(Phaser.Math.Distance.Between(o.x,o.y,self.player.x,self.player.y) < 520) cnt++;
      }
      if(cnt < 12){
        // spawn at ring around player
        var a = Math.random()*Math.PI*2;
        var d = 360 + Math.random()*560;
        var x = self.player.x + Math.cos(a)*d;
        var y = self.player.y + Math.sin(a)*d;
        var w = 70 + Math.random()*160;
        var h = 50 + Math.random()*150;
        var ob = self.obstacles.create(x, y, "ob");
        ob.setImmovable(true);
        if(ob.body && typeof ob.body.setAllowGravity === "function"){
          ob.body.setAllowGravity(false);
        }
        if(ob.body && typeof ob.body.setSize === "function"){
          ob.body.setSize(w, h, true);
        }
        ob.displayWidth = w; ob.displayHeight = h;
        // HP by size
        var maxHp = Math.max(30, Math.floor((w*h)/10));
        ob.setData("maxHp", maxHp);
        ob.setData("hp", maxHp);
        ob.setAlpha(0.55);
        if(typeof ob.refreshBody === "function"){
          ob.refreshBody();
        }
      }
    }
  }

  // acquire target with 1s switch cooldown
        var tgt = state.target;
        if(tgt && !tgt.active) tgt = null;
        if(!tgt){
          tgt = findNearestEnemy(self);
          if(tgt){ state.target = tgt; state.lastSwitch = time; }
        }else{
          if(time - state.lastSwitch >= 1000){
            var cand = findNearestEnemy(self);
            if(cand && cand !== tgt){
              var d0 = Phaser.Math.Distance.Between(self.player.x, self.player.y, tgt.x, tgt.y);
              var d1 = Phaser.Math.Distance.Between(self.player.x, self.player.y, cand.x, cand.y);
              if(d1 + 40 < d0){
                tgt = cand; state.target = cand; state.lastSwitch = time;
              }
            }
          }
        }
        state.targetDist = (tgt && tgt.active) ? Math.floor(Phaser.Math.Distance.Between(self.player.x, self.player.y, tgt.x, tgt.y)) : 0;

        // line of sight visibility: enemies behind obstacles are not directly visible
        for(var vi=0; vi<es.length; vi++){
          var ev = es[vi];
          if(!ev.active) continue;
          var blocked = losBlocked(self, self.player.x, self.player.y, ev.x, ev.y);
          ev.setAlpha(blocked ? 0.18 : 1.0);
          ev.setData("blocked", blocked);
        }
        // keep target even if blocked; weapons will respect LOS (non-piercing won't fire)

        // lock line + red diamond on target
        self.lockG.clear();
        if(tgt && tgt.active){
          self.lockG.lineStyle(2, 0xff2b2b, 0.55);
          self.lockG.beginPath();
          self.lockG.moveTo(self.player.x, self.player.y);
          self.lockG.lineTo(tgt.x, tgt.y);
          self.lockG.strokePath();
          self.lockG.fillStyle(0xff2b2b, 0.90);
          var s = 7;
          self.lockG.beginPath();
          self.lockG.moveTo(tgt.x, tgt.y - s);
          self.lockG.lineTo(tgt.x + s, tgt.y);
          self.lockG.lineTo(tgt.x, tgt.y + s);
          self.lockG.lineTo(tgt.x - s, tgt.y);
          self.lockG.closePath();
          self.lockG.fillPath();
        }

        // enemies chase player (always re-steer)
        var es = self.enemies.getChildren();
        for(var i=0;i<es.length;i++){
          var e = es[i];
          if(!e.active) continue;
          var angE = Phaser.Math.Angle.Between(e.x, e.y, self.player.x, self.player.y);
          var chaseSpd = e.getData("spd") || 180;
          self.physics.velocityFromRotation(angE, chaseSpd, e.body.velocity);
          e.rotation = angE + Math.PI/2;

          // contact damage
          var dd = Phaser.Math.Distance.Between(e.x, e.y, self.player.x, self.player.y);
          if(dd < 22){
            state.hp -= (0.20 * (delta/16.666)); // steady damage
          }
        }

        // mines: arm + explode
        var ms = self.mines.getChildren();
        for(var mi=0; mi<ms.length; mi++){
          var mn = ms[mi];
          if(!mn.active) continue;
          if(!mn.getData("armed") && time >= (mn.getData("armAt")||0)){
            mn.setData("armed", true);
            mn.setAlpha(0.95);
          }
          if(mn.getData("armed")){
            var radius = mn.getData("radius") || 120;
            var r2 = radius*radius;
            for(var ei=0; ei<es.length; ei++){
              var e2 = es[ei];
              if(!e2.active) continue;
              var dx = e2.x - mn.x;
              var dy = e2.y - mn.y;
              if(dx*dx + dy*dy <= r2){
                // explode
                var dmg = mn.getData("dmg") || 18;
                for(var ej=0; ej<es.length; ej++){
                  var e3 = es[ej];
                  if(!e3.active) continue;
                  var ddx = e3.x - mn.x;
                  var ddy = e3.y - mn.y;
                  if(ddx*ddx + ddy*ddy <= r2){
                    e3.setData("hp", (e3.getData("hp")||20) - dmg);
                    if(e3.getData("hp") <= 0){
                      e3.destroy(); state.score += 1;
                    }
                  }
                }
                var boom = self.add.circle(mn.x, mn.y, radius, 0x00ffcc, 0.18);
                boom.setBlendMode(Phaser.BlendModes.ADD);
                self.time.delayedCall(180, function(){ if(boom.active) boom.destroy(); });
                mn.destroy();
                break;
              }
            }
          }
        }

        // AI movement (simple: keep distance preference)
        if(tgt && tgt.active){
          var ai = state.cfg.ai;
          var prefer = ai.prefer; // near/mid/far
          var dist = Phaser.Math.Distance.Between(self.player.x, self.player.y, tgt.x, tgt.y);
          var desired = 360;
          if(prefer === "near") desired = 220;
          if(prefer === "mid") desired = 380;
          if(prefer === "far") desired = 520;

          // flee if hp low
          var flee = (state.hp / state.hpMax) < ai.fleeHp;

          var aiAng = Phaser.Math.Angle.Between(self.player.x, self.player.y, tgt.x, tgt.y);
          var dir = 1;
          if(flee) dir = -1;
          else {
            if(dist < desired*ai.keep) dir = -1;
            else dir = 1;
          }
          self.physics.velocityFromRotation(aiAng, state.speed*0.85*dir, self.player.body.velocity);
          self.player.rotation = (dir===1 ? (aiAng + Math.PI/2) : (aiAng - Math.PI/2));
        }

        // fire A/B
        var wA = state.cfg.wpnA;
        var wB = state.cfg.wpnB;
        if(time - state.lastA >= wA.cd*1000){
          state.lastA = time;
          fireWeapon(self, wA, time, "ba");
        }
        if(time - state.lastB >= wB.cd*1000){
          state.lastB = time;
          fireWeapon(self, wB, time, "bb");
        }

        // range rings
        self.rangeG.clear();
              // range ticks + labels (concentric rings)
        var maxR = Math.max(wA.range||0, wB.range||0, 0);
        var step = 200;
        var ticks = Math.max(1, Math.floor(maxR/step));
        while(self.rangeTexts.length < ticks){
          var tt = self.add.text(0,0,"", {fontFamily:"system-ui, sans-serif",fontSize:"13px",fill:"#e8eefc",stroke:"#000",strokeThickness:3});
          tt.setDepth(9);
          self.rangeTexts.push(tt);
        }
        for(var ri=0; ri<self.rangeTexts.length; ri++) self.rangeTexts[ri].setVisible(false);
        for(var ti=1; ti<=ticks; ti++){
          var r = ti*step;
          self.rangeG.lineStyle(1, 0xffffff, 0.08);
          self.rangeG.strokeCircle(self.player.x, self.player.y, r);
          var a = -Math.PI/4;
          var lx = self.player.x + Math.cos(a)*r;
          var ly = self.player.y + Math.sin(a)*r;
          var ttxt = self.rangeTexts[ti-1];
          ttxt.setText(String(r));
          ttxt.setPosition(lx + 6, ly - 10);
          ttxt.setVisible(true);
        }
        if(wA.range && wA.range > 0){
          self.rangeG.lineStyle(2, 0x00ffcc, 0.20);
          self.rangeG.strokeCircle(self.player.x, self.player.y, wA.range);
        }
        if(wB.range && wB.range > 0){
          self.rangeG.lineStyle(2, 0xff4fd8, 0.18);
          self.rangeG.strokeCircle(self.player.x, self.player.y, wB.range);
        }

        // radar (shows enemies even if hidden behind obstacles)
        if(self.radarG){
          self.radarG.clear();
          var rx = self.radarX, ry = self.radarY, rr = self.radarR;
          self.radarG.fillStyle(0x000000, 0.35);
          self.radarG.fillCircle(rx, ry, rr+8);
          self.radarG.lineStyle(2, 0x00ffcc, 0.22);
          self.radarG.strokeCircle(rx, ry, rr);
          self.radarG.lineStyle(1, 0xffffff, 0.08);
          self.radarG.strokeCircle(rx, ry, rr*0.66);
          self.radarG.strokeCircle(rx, ry, rr*0.33);
          self.radarG.fillStyle(0x00ffcc, 0.9);
          self.radarG.fillCircle(rx, ry, 3);
          var rng = self.radarRange;
          for(var rj=0; rj<es.length; rj++){
            var e = es[rj]; if(!e.active) continue;
            var dx = e.x - self.player.x;
            var dy = e.y - self.player.y;
            var d = Math.sqrt(dx*dx + dy*dy);
            if(d > rng) continue;
            var sx = rx + (dx / rng) * rr;
            var sy = ry + (dy / rng) * rr;
            var blocked = !!e.getData("blocked");
            self.radarG.fillStyle(blocked ? 0xff4fd8 : 0xff2b2b, blocked ? 0.70 : 0.85);
            self.radarG.fillCircle(sx, sy, blocked ? 2 : 2.5);
          }
        }      // HUD elements (high readability)
        var hudDepth = 1000;
        self.scorePanelG = self.add.graphics().setScrollFactor(0).setDepth(hudDepth);
        self.scoreLabelText = self.add.text(0,0,"SCORE", {fontFamily:"system-ui, sans-serif",fontSize:"12px",fontStyle:"700",fill:"#b8c6ff",stroke:"#000",strokeThickness:3}).setScrollFactor(0).setDepth(hudDepth + 1);
        self.scoreValueText = self.add.text(0,0,"0", {fontFamily:"system-ui, sans-serif",fontSize:"22px",fontStyle:"700",fill:"#e8eefc",stroke:"#000",strokeThickness:4}).setScrollFactor(0).setDepth(hudDepth + 1);
        self.waveTimeText = self.add.text(0,0,"W1  00:00", {fontFamily:"system-ui, sans-serif",fontSize:"14px",fontStyle:"700",fill:"#e8eefc",stroke:"#000",strokeThickness:3}).setScrollFactor(0).setDepth(hudDepth + 1);
        self.hpText = self.add.text(0,0,"HP 0/0", {fontFamily:"system-ui, sans-serif",fontSize:"18px",fontStyle:"700",fill:"#e8eefc",stroke:"#000",strokeThickness:3}).setScrollFactor(0).setDepth(hudDepth + 1);
        self.expText = self.add.text(0,0,"EXP 0", {fontFamily:"system-ui, sans-serif",fontSize:"14px",fontStyle:"700",fill:"#ffd36b",stroke:"#000",strokeThickness:3}).setScrollFactor(0).setDepth(hudDepth + 1);
        self.hpBarG = self.add.graphics().setScrollFactor(0).setDepth(hudDepth);
        self.expBarG = self.add.graphics().setScrollFactor(0).setDepth(hudDepth);
        self.hpGroup = self.add.container(0,0,[self.hpText, self.expText, self.hpBarG, self.expBarG]).setScrollFactor(0).setDepth(hudDepth + 1);
        self.weaponMainText = self.add.text(0,0,"MAIN", {fontFamily:"system-ui, sans-serif",fontSize:"13px",fill:"#e8eefc",stroke:"#000",strokeThickness:3}).setScrollFactor(0).setDepth(hudDepth + 1);
        self.weaponSubText = self.add.text(0,0,"SUB", {fontFamily:"system-ui, sans-serif",fontSize:"13px",fill:"#e8eefc",stroke:"#000",strokeThickness:3}).setScrollFactor(0).setDepth(hudDepth + 1);
        self.weaponG = self.add.graphics().setScrollFactor(0).setDepth(hudDepth + 1);
        self.weaponGroup = self.add.container(0,0,[self.weaponG, self.weaponMainText, self.weaponSubText]).setScrollFactor(0).setDepth(hudDepth + 1);


        // HUD + bars
        updateHUD_V3(self, state, tSec);


        // death
        if(state.hp <= 0){
          state.dead = true;
          state.hp = 0;
          endBattle(state.score, Math.floor(tSec || 0), state.cfg);
        }
        }catch(err: any){ dbg("EXCEPTION: " + (err && err.message ? err.message : err) + ((err && err.stack) ? ("\n"+err.stack) : "")); state.dead = true; }
      }

      game = new Phaser.Game(config);
    }

    function endBattle(score: number, timeSec: number, cfg: BattleLoadout): void{
      try{ if(game) game.scene.pause(); }catch(e){}
      hooks.showResult(score, timeSec, cfg);
    }

    

  dbg("bootGame called");
  bootGame(loadout);

  return {
    destroy: () => {
      try{
        if(game){
          game.destroy(true);
          game = null;
        }
      }catch(e){}
    }
  };
};
