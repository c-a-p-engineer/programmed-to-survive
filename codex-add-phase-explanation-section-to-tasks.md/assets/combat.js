(() => {
  class CombatScene extends Phaser.Scene {
    constructor() {
      super("combat");
      this.config = window.PTS_CONFIG;
      this.state = "start";
      this.player = null;
      this.enemy = null;
      this.obstacles = null;
      this.playerStats = { maxHp: 120, hp: 120, damage: 12, cooldown: 320, speed: 240 };
      this.enemyStats = { maxHp: 80, hp: 80, damage: 8, cooldown: 420 };
      this.subWeaponStats = { damage: 6, cooldown: 900 };
      this.score = 0;
      this.wave = 1;
      this.shipIndex = 0;
      this.weaponMainIndex = 0;
      this.weaponSubIndex = 0;
      this.aiIndex = 0;
      this.themeIndex = 0;
      this.nextPlayerAttack = 0;
      this.nextEnemyAttack = 0;
      this.nextSubAttack = 0;
      this.target = new Phaser.Math.Vector2(0, 0);
      this.backgroundRect = null;
      this.titleText = null;
      this.statusText = null;
      this.playerHpText = null;
      this.enemyHpText = null;
      this.waveText = null;
      this.scoreText = null;
      this.shipText = null;
      this.weaponMainText = null;
      this.weaponSubText = null;
      this.aiText = null;
      this.themeText = null;
      this.startButton = null;
      this.startButtonContainer = null;
      this.startHintText = null;
      this.startUiElements = [];
      this.startOptions = [];
      this.themePanels = [];
      this.resultText = null;
      this.retryButton = null;
    }

    create() {
      const { width, height } = this.scale;
      this.backgroundRect = this.add
        .rectangle(width / 2, height / 2, width, height, 0x0b1020)
        .setDepth(-2);
      this.createTextures();

      this.player = this.physics.add.image(width / 2, height * 0.7, "player");
      this.player.setCollideWorldBounds(true);
      this.player.body.setCircle(14, 2, 2);

      this.enemy = this.physics.add.image(width / 2, height * 0.3, "enemy");
      this.enemy.setCollideWorldBounds(true);
      this.enemy.body.setCircle(16, 0, 0);

      this.obstacles = this.physics.add.staticGroup();

      this.titleText = this.add.text(16, 12, this.config.ui.title, {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "14px",
        color: "#8be3ff",
      });

      this.playerHpText = this.add.text(16, 36, "PLAYER HP: --", {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "14px",
        color: "#a7f3d0",
      });
      this.enemyHpText = this.add.text(width - 180, 36, "ENEMY HP: --", {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "14px",
        color: "#fca5a5",
      });

      this.waveText = this.add.text(16, 58, "WAVE: --", {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "13px",
        color: "#fcd34d",
      });
      this.scoreText = this.add.text(width - 180, 58, "SCORE: 0", {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "13px",
        color: "#c4b5fd",
      });

      this.statusText = this.add
        .text(width / 2, height / 2 - 120, this.config.ui.startHeadline, {
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "22px",
          color: "#fef3c7",
        })
        .setOrigin(0.5);

      const optionWidth = Math.min(320, width * 0.8);
      const optionHeight = 32;
      const optionGap = 36;
      const optionX = width / 2;
      const optionY = height / 2 - 70;
      const shipOption = this.createOptionButton(
        optionX,
        optionY,
        "機体: --",
        () => this.cycleShip(),
        optionWidth,
        optionHeight,
      );
      const mainOption = this.createOptionButton(
        optionX,
        optionY + optionGap,
        "メイン武器: --",
        () => this.cycleWeaponMain(),
        optionWidth,
        optionHeight,
      );
      const subOption = this.createOptionButton(
        optionX,
        optionY + optionGap * 2,
        "サブ武器: --",
        () => this.cycleWeaponSub(),
        optionWidth,
        optionHeight,
      );
      const aiOption = this.createOptionButton(
        optionX,
        optionY + optionGap * 3,
        "AI性格: --",
        () => this.cycleAi(),
        optionWidth,
        optionHeight,
      );
      const themeOption = this.createOptionButton(
        optionX,
        optionY + optionGap * 4,
        "UIテーマ: --",
        () => this.cycleTheme(),
        optionWidth,
        optionHeight,
      );
      this.shipText = shipOption.text;
      this.weaponMainText = mainOption.text;
      this.weaponSubText = subOption.text;
      this.aiText = aiOption.text;
      this.themeText = themeOption.text;
      this.startOptions = [shipOption, mainOption, subOption, aiOption, themeOption];
      this.startUiElements.push(
        shipOption.container,
        mainOption.container,
        subOption.container,
        aiOption.container,
        themeOption.container,
      );

      const startButton = this.createActionButton(
        width / 2,
        height / 2 + 70,
        this.config.ui.startButton,
        () => {
          if (this.state === "start") {
            this.startBattle();
          }
        },
        Math.min(240, width * 0.6),
      );
      this.startButton = startButton.text;
      this.startButtonContainer = startButton.container;
      this.startUiElements.push(startButton.container);

      this.startHintText = this.add
        .text(width / 2, height / 2 + 110, this.config.ui.startHint, {
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "12px",
          color: "#cbd5f5",
        })
        .setOrigin(0.5);
      this.startUiElements.push(this.startHintText);

      this.resultText = this.add
        .text(width / 2, height / 2 + 110, "", {
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "16px",
          color: "#fef08a",
        })
        .setOrigin(0.5)
        .setVisible(false);

      this.retryButton = this.add
        .text(width / 2, height / 2 + 150, this.config.ui.retryButton, {
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "18px",
          color: "#fde68a",
          backgroundColor: "#1f2937",
          padding: { left: 12, right: 12, top: 6, bottom: 6 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setVisible(false);

      this.retryButton.on("pointerdown", () => {
        if (this.state === "result") {
          this.toStart();
        }
      });

      this.input.on("pointerdown", (pointer) => {
        if (this.state === "playing") {
          this.target.set(pointer.x, pointer.y);
        }
      });

      this.input.on("pointermove", (pointer) => {
        if (this.state === "playing") {
          this.target.set(pointer.x, pointer.y);
        }
      });

      this.target.set(width / 2, height * 0.7);
      this.applyTheme();
      this.toStart();
    }

    createTextures() {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x7ef5c5, 1);
      graphics.fillCircle(16, 16, 14);
      graphics.generateTexture("player", 32, 32);
      graphics.clear();

      graphics.fillStyle(0xff8fa1, 1);
      graphics.fillCircle(18, 18, 16);
      graphics.generateTexture("enemy", 36, 36);
      graphics.clear();

      const obstacle = this.config.obstacles.texture;
      graphics.fillStyle(obstacle.color, 1);
      graphics.fillRoundedRect(0, 0, obstacle.width, obstacle.height, obstacle.radius);
      graphics.generateTexture("obstacle", obstacle.width, obstacle.height);
      graphics.destroy();
    }

    createOptionButton(x, y, label, onTap, width, height) {
      const container = this.add.container(x, y);
      const background = this.add
        .rectangle(0, 0, width, height, 0x1f2937, 0.6)
        .setStrokeStyle(1, 0x475569, 0.6);
      const text = this.add.text(0, 0, label, {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "16px",
        color: "#c7d2fe",
      });
      text.setOrigin(0.5);
      container.add([background, text]);
      container.setSize(width, height);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
        Phaser.Geom.Rectangle.Contains,
      );
      container.on("pointerdown", onTap);
      return { container, text, background };
    }

    createActionButton(x, y, label, onTap, width) {
      const container = this.add.container(x, y);
      const background = this.add
        .rectangle(0, 0, width, 36, 0x1f2937, 0.9)
        .setStrokeStyle(1, 0xfde68a, 0.7);
      const text = this.add.text(0, 0, label, {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "18px",
        color: "#fef08a",
      });
      text.setOrigin(0.5);
      container.add([background, text]);
      container.setSize(width, 36);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-width / 2, -18, width, 36),
        Phaser.Geom.Rectangle.Contains,
      );
      container.on("pointerdown", onTap);
      return { container, text, background };
    }

    cycleShip() {
      this.shipIndex = (this.shipIndex + 1) % this.config.loadouts.ships.length;
      this.updateLoadoutText();
    }

    cycleWeaponMain() {
      this.weaponMainIndex = (this.weaponMainIndex + 1) % this.config.loadouts.weaponsMain.length;
      this.updateLoadoutText();
    }

    cycleWeaponSub() {
      this.weaponSubIndex = (this.weaponSubIndex + 1) % this.config.loadouts.weaponsSub.length;
      this.updateLoadoutText();
    }

    cycleAi() {
      this.aiIndex = (this.aiIndex + 1) % this.config.loadouts.aiTypes.length;
      this.updateLoadoutText();
    }

    cycleTheme() {
      this.themeIndex = (this.themeIndex + 1) % this.config.uiThemes.length;
      this.applyTheme();
      this.updateLoadoutText();
    }

    updateLoadoutText() {
      const ship = this.config.loadouts.ships[this.shipIndex];
      const weaponMain = this.config.loadouts.weaponsMain[this.weaponMainIndex];
      const weaponSub = this.config.loadouts.weaponsSub[this.weaponSubIndex];
      const aiType = this.config.loadouts.aiTypes[this.aiIndex];
      const theme = this.config.uiThemes[this.themeIndex];
      this.shipText?.setText(`機体: ${ship.label}`);
      this.weaponMainText?.setText(`メイン武器: ${weaponMain.label}`);
      this.weaponSubText?.setText(`サブ武器: ${weaponSub.label}`);
      this.aiText?.setText(`AI性格: ${aiType.label}`);
      this.themeText?.setText(`UIテーマ: ${theme.label}`);
    }

    toCssColor(value) {
      return `#${value.toString(16).padStart(6, "0")}`;
    }

    applyTheme() {
      const theme = this.config.uiThemes[this.themeIndex];
      const palette = theme.palette;
      const { width, height } = this.scale;
      this.backgroundRect?.setFillStyle(palette.bg, 1);

      const panelCss = this.toCssColor(palette.panel);

      this.titleText?.setColor(palette.accentText);
      this.statusText?.setColor(palette.text);
      this.playerHpText?.setColor(palette.accentText);
      this.enemyHpText?.setColor(palette.highlightText);
      this.waveText?.setColor(palette.text);
      this.scoreText?.setColor(palette.subText);
      this.resultText?.setColor(palette.highlightText);
      this.startHintText?.setColor(palette.subText);
      this.retryButton?.setStyle({ color: palette.highlightText, backgroundColor: panelCss });

      this.startOptions.forEach((option) => {
        option.background.setFillStyle(palette.panel, 0.7);
        option.background.setStrokeStyle(1, palette.panelBorder, 0.8);
        option.text.setColor(palette.text);
      });

      if (this.startButtonContainer && this.startButton) {
        const background = this.startButtonContainer.list[0];
        background.setFillStyle(palette.panel, 0.9);
        background.setStrokeStyle(1, palette.highlight, 0.8);
        this.startButton.setColor(palette.highlightText);
      }

      this.updateLayout(theme.layout, width, height);
      this.updateThemePanels(theme.layout, palette, width, height);
    }

    updateLayout(layout, width, height) {
      const layoutConfig = this.getLayoutConfig(layout, width, height);
      if (this.titleText) {
        if (layoutConfig.title.originX !== undefined) {
          this.titleText.setOrigin(layoutConfig.title.originX, 0);
        }
        this.titleText.setPosition(layoutConfig.title.x, layoutConfig.title.y);
      }
      this.statusText?.setPosition(layoutConfig.status.x, layoutConfig.status.y);
      this.playerHpText?.setPosition(layoutConfig.hud.playerHp.x, layoutConfig.hud.playerHp.y);
      this.enemyHpText?.setPosition(layoutConfig.hud.enemyHp.x, layoutConfig.hud.enemyHp.y);
      this.waveText?.setPosition(layoutConfig.hud.wave.x, layoutConfig.hud.wave.y);
      this.scoreText?.setPosition(layoutConfig.hud.score.x, layoutConfig.hud.score.y);

      this.startOptions.forEach((option, index) => {
        const y = layoutConfig.start.optionsY + layoutConfig.start.optionGap * index;
        option.container.setPosition(layoutConfig.start.optionsX, y);
      });

      if (this.startButtonContainer) {
        this.startButtonContainer.setPosition(layoutConfig.start.buttonX, layoutConfig.start.buttonY);
      }

      this.startHintText?.setPosition(layoutConfig.start.hintX, layoutConfig.start.hintY);
      this.resultText?.setPosition(layoutConfig.result.x, layoutConfig.result.y);
      this.retryButton?.setPosition(layoutConfig.retry.x, layoutConfig.retry.y);
    }

    getLayoutConfig(layout, width, height) {
      if (layout === "split") {
        return {
          title: { x: width * 0.06, y: 16, originX: 0 },
          status: { x: width * 0.68, y: height * 0.24 },
          hud: {
            playerHp: { x: 16, y: 68 },
            enemyHp: { x: 16, y: 90 },
            wave: { x: width - 180, y: 68 },
            score: { x: width - 180, y: 90 },
          },
          start: {
            optionsX: width * 0.28,
            optionsY: height * 0.32,
            optionGap: 34,
            buttonX: width * 0.28,
            buttonY: height * 0.62,
            hintX: width * 0.28,
            hintY: height * 0.67,
          },
          result: { x: width * 0.7, y: height * 0.56 },
          retry: { x: width * 0.7, y: height * 0.64 },
        };
      }

      if (layout === "bottom") {
        return {
          title: { x: width * 0.5, y: 16, originX: 0.5 },
          status: { x: width * 0.5, y: height * 0.2 },
          hud: {
            playerHp: { x: 16, y: height - 52 },
            enemyHp: { x: width - 180, y: height - 52 },
            wave: { x: width * 0.5 - 40, y: height - 74 },
            score: { x: width * 0.5 - 40, y: height - 52 },
          },
          start: {
            optionsX: width * 0.5,
            optionsY: height * 0.46,
            optionGap: 32,
            buttonX: width * 0.5,
            buttonY: height * 0.72,
            hintX: width * 0.5,
            hintY: height * 0.77,
          },
          result: { x: width * 0.5, y: height * 0.65 },
          retry: { x: width * 0.5, y: height * 0.73 },
        };
      }

      return {
        title: { x: 16, y: 12, originX: 0 },
        status: { x: width / 2, y: height / 2 - 120 },
        hud: {
          playerHp: { x: 16, y: 36 },
          enemyHp: { x: width - 180, y: 36 },
          wave: { x: 16, y: 58 },
          score: { x: width - 180, y: 58 },
        },
        start: {
          optionsX: width / 2,
          optionsY: height / 2 - 70,
          optionGap: 36,
          buttonX: width / 2,
          buttonY: height / 2 + 70,
          hintX: width / 2,
          hintY: height / 2 + 110,
        },
        result: { x: width / 2, y: height / 2 + 110 },
        retry: { x: width / 2, y: height / 2 + 150 },
      };
    }

    updateThemePanels(layout, palette, width, height) {
      this.themePanels.forEach((panel) => panel.destroy());
      this.themePanels = [];

      if (layout === "split") {
        const leftPanel = this.add
          .rectangle(width * 0.24, height / 2, width * 0.46, height * 0.86, palette.panel, 0.35)
          .setStrokeStyle(1, palette.panelBorder, 0.6)
          .setDepth(-1);
        const rightPanel = this.add
          .rectangle(width * 0.72, height / 2, width * 0.48, height * 0.78, palette.panel, 0.2)
          .setStrokeStyle(1, palette.panelBorder, 0.4)
          .setDepth(-1);
        this.themePanels.push(leftPanel, rightPanel);
        return;
      }

      if (layout === "bottom") {
        const bottomPanel = this.add
          .rectangle(width / 2, height - 48, width - 32, 72, palette.panel, 0.45)
          .setStrokeStyle(1, palette.panelBorder, 0.5)
          .setDepth(-1);
        this.themePanels.push(bottomPanel);
        return;
      }

      const topPanel = this.add
        .rectangle(width / 2, 36, width - 32, 46, palette.panel, 0.35)
        .setStrokeStyle(1, palette.panelBorder, 0.5)
        .setDepth(-1);
      this.themePanels.push(topPanel);
    }

    applyLoadout() {
      const ship = this.config.loadouts.ships[this.shipIndex];
      const weaponMain = this.config.loadouts.weaponsMain[this.weaponMainIndex];
      const weaponSub = this.config.loadouts.weaponsSub[this.weaponSubIndex];
      this.playerStats.maxHp = ship.hp;
      this.playerStats.hp = ship.hp;
      this.playerStats.speed = ship.speed;
      this.playerStats.damage = weaponMain.damage;
      this.playerStats.cooldown = weaponMain.cooldown;
      this.subWeaponStats.damage = weaponSub.damage;
      this.subWeaponStats.cooldown = weaponSub.cooldown;
    }

    toStart() {
      this.state = "start";
      this.score = 0;
      this.wave = 1;
      this.player.setActive(false).setVisible(false);
      this.enemy.setActive(false).setVisible(false);
      this.clearObstacles();
      this.updateHud();
      this.statusText.setText(this.config.ui.startHeadline);
      this.startUiElements.forEach((element) => element.setVisible(true));
      this.resultText.setVisible(false);
      this.retryButton.setVisible(false);
      this.target.set(this.scale.width / 2, this.scale.height * 0.7);
      this.updateLoadoutText();
    }

    startBattle() {
      this.state = "playing";
      this.score = 0;
      this.wave = 1;
      this.startUiElements.forEach((element) => element.setVisible(false));
      this.resultText.setVisible(false);
      this.retryButton.setVisible(false);
      this.applyLoadout();
      this.setupWave();
    }

    setupWave() {
      const { width, height } = this.scale;
      const enemyConfig = this.config.enemy;
      this.playerStats.hp = this.playerStats.maxHp;
      this.enemyStats.maxHp = Math.round(enemyConfig.baseHp + this.wave * enemyConfig.hpPerWave);
      this.enemyStats.hp = this.enemyStats.maxHp;
      this.enemyStats.damage = Math.round(
        enemyConfig.baseDamage + this.wave * enemyConfig.damagePerWave,
      );
      this.nextPlayerAttack = 0;
      this.nextEnemyAttack = 0;
      this.nextSubAttack = 0;

      this.player.setPosition(width / 2, height * 0.7).setActive(true).setVisible(true);
      this.enemy.setPosition(width / 2, height * 0.3).setActive(true).setVisible(true);
      this.player.setVelocity(0, 0);
      this.enemy.setVelocity(0, 0);

      this.statusText.setText(`WAVE ${this.wave} 開始`);
      this.target.set(width / 2, height * 0.7);
      this.createObstacles();
      this.updateHud();
    }

    createObstacles() {
      this.clearObstacles();
      const { width, height } = this.scale;
      this.config.obstacles.placements.forEach((placement) => {
        const obstacle = this.obstacles.create(
          width * placement.xRatio,
          height * placement.yRatio,
          "obstacle",
        );
        obstacle.setScale(placement.scale);
        obstacle.refreshBody();
      });

      this.physics.add.collider(this.player, this.obstacles);
      this.physics.add.collider(this.enemy, this.obstacles);
    }

    clearObstacles() {
      if (!this.obstacles) {
        return;
      }
      this.obstacles.clear(true, true);
    }

    updateHud() {
      const ui = this.config.ui;
      const maxWaves = this.config.waves.max;
      this.playerHpText?.setText(
        this.playerStats.hp ? `${ui.hudPlayerHp}: ${this.playerStats.hp}` : `${ui.hudPlayerHp}: --`,
      );
      this.enemyHpText?.setText(
        this.enemyStats.hp ? `${ui.hudEnemyHp}: ${this.enemyStats.hp}` : `${ui.hudEnemyHp}: --`,
      );
      this.waveText?.setText(`${ui.hudWave}: ${this.wave}/${maxWaves}`);
      this.scoreText?.setText(`${ui.hudScore}: ${this.score}`);
    }

    handleCombat(now) {
      if (now >= this.nextPlayerAttack) {
        this.enemyStats.hp = Math.max(0, this.enemyStats.hp - this.playerStats.damage);
        this.nextPlayerAttack = now + this.playerStats.cooldown;
      }
      if (now >= this.nextSubAttack) {
        this.enemyStats.hp = Math.max(0, this.enemyStats.hp - this.subWeaponStats.damage);
        this.nextSubAttack = now + this.subWeaponStats.cooldown;
      }
      if (now >= this.nextEnemyAttack) {
        this.playerStats.hp = Math.max(0, this.playerStats.hp - this.enemyStats.damage);
        this.nextEnemyAttack = now + this.enemyStats.cooldown;
      }

      this.updateHud();

      if (this.enemyStats.hp <= 0) {
        this.finishWave();
      } else if (this.playerStats.hp <= 0) {
        this.finishBattle(false);
      }
    }

    finishWave() {
      const weaponSub = this.config.loadouts.weaponsSub[this.weaponSubIndex];
      const waveScore = Math.round(this.config.waves.scoreBase * this.wave * weaponSub.scoreBonus);
      this.score += waveScore;
      this.updateHud();
      if (this.wave >= this.config.waves.max) {
        this.finishBattle(true);
        return;
      }
      this.state = "waveClear";
      this.statusText.setText(`WAVE ${this.wave} クリア +${waveScore}`);
      this.wave += 1;
      this.time.delayedCall(1200, () => {
        this.state = "playing";
        this.setupWave();
      });
    }

    finishBattle(win) {
      this.state = "result";
      this.player.setVelocity(0, 0);
      this.enemy.setVelocity(0, 0);
      if (win) {
        this.statusText.setText(this.config.ui.resultWin);
      } else {
        this.statusText.setText(this.config.ui.resultLose);
      }
      this.resultText.setText(`最終スコア: ${this.score}`);
      this.resultText.setVisible(true);
      this.retryButton.setVisible(true);
    }

    update(time) {
      if (this.state !== "playing") {
        return;
      }

      const speed = this.playerStats.speed;
      const dx = this.target.x - this.player.x;
      const dy = this.target.y - this.player.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 6) {
        const vx = (dx / distance) * speed;
        const vy = (dy / distance) * speed;
        this.player.setVelocity(vx, vy);
      } else {
        this.player.setVelocity(0, 0);
      }

      const aiType = this.config.loadouts.aiTypes[this.aiIndex];
      const enemySpeed =
        (this.config.enemy.baseSpeed + this.wave * this.config.enemy.speedPerWave) *
        aiType.enemySpeed;
      const ex = this.player.x - this.enemy.x;
      const ey = this.player.y - this.enemy.y;
      const enemyDist = Math.hypot(ex, ey);
      if (enemyDist > 0) {
        const evx = (ex / enemyDist) * enemySpeed;
        const evy = (ey / enemyDist) * enemySpeed;
        this.enemy.setVelocity(evx, evy);
      }

      if (this.physics.overlap(this.player, this.enemy)) {
        this.handleCombat(time);
      }
    }
  }

  window.PTS_CombatScene = CombatScene;
})();
