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
      this.nextPlayerAttack = 0;
      this.nextEnemyAttack = 0;
      this.nextSubAttack = 0;
      this.target = new Phaser.Math.Vector2(0, 0);
      this.backgroundRect = null;
      this.headerBar = null;
      this.headerTitle = null;
      this.headerTag = null;
      this.statusText = null;
      this.shipText = null;
      this.weaponMainText = null;
      this.weaponSubText = null;
      this.aiText = null;
      this.startButton = null;
      this.startButtonContainer = null;
      this.startHintText = null;
      this.startUiElements = [];
      this.startOptions = [];
      this.themePanels = [];
      this.resultText = null;
      this.retryButton = null;
      this.randomButton = null;
      this.randomButtonContainer = null;
      this.debugBar = null;
      this.debugText = null;
      this.hudPanel = null;
      this.hudHpPlayer = null;
      this.hudHpEnemy = null;
      this.hudWaveTime = null;
      this.hudScore = null;
      this.hudLoadout = null;
      this.hudHpBaseWidth = 0;
      this.logPanel = null;
      this.logText = null;
      this.logLines = [];
      this.battleStartTime = 0;
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

      this.headerBar = this.add
        .rectangle(width / 2, 26, width - 24, 36, 0x0f172a, 0.95)
        .setStrokeStyle(1, 0x223240, 0.9);
      this.headerTitle = this.add.text(28, 16, "PROGRAMMED TO SURVIVE", {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "14px",
        color: "#00f0c8",
        fontStyle: "600",
      });
      this.headerTag = this.add.text(width - 28, 16, "prototype / one file", {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "12px",
        color: "#94a3b8",
      });
      this.headerTag.setOrigin(1, 0);

      this.debugBar = this.add
        .rectangle(width / 2, 68, width - 24, 32, 0x111827, 0.9)
        .setStrokeStyle(1, 0x223240, 0.7);
      this.debugText = this.add.text(width / 2, 60, "DEBUG", {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "12px",
        color: "#cbd5f5",
      });
      this.debugText.setOrigin(0.5, 0);

      this.hudPanel = this.add
        .rectangle(width * 0.34, 120, width * 0.62, 70, 0x0b121a, 0.9)
        .setStrokeStyle(1, 0x223240, 0.6)
        .setVisible(false);
      this.hudWaveTime = this.add.text(width * 0.06, 96, "WAVE 1  TIME 00:00", {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "12px",
        color: "#e2e8f0",
      });
      this.hudWaveTime.setVisible(false);
      this.hudScore = this.add.text(width * 0.6, 96, "SCORE 0", {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "18px",
        color: "#e2e8f0",
      });
      this.hudScore.setVisible(false);
      this.hudHpPlayer = this.add
        .rectangle(width * 0.1, 126, width * 0.26, 10, 0x00f0c8, 1)
        .setOrigin(0, 0.5)
        .setVisible(false);
      this.hudHpEnemy = this.add
        .rectangle(width * 0.1, 142, width * 0.26, 8, 0xd946ef, 0.9)
        .setOrigin(0, 0.5)
        .setVisible(false);
      this.hudLoadout = this.add.text(width * 0.06, 154, "", {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "11px",
        color: "#94a3b8",
      });
      this.hudLoadout.setVisible(false);
      this.logPanel = this.add
        .rectangle(width * 0.74, 200, width * 0.4, 120, 0x0b121a, 0.85)
        .setStrokeStyle(1, 0x223240, 0.5)
        .setVisible(false);
      this.logText = this.add.text(width * 0.58, 152, "", {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "10px",
        color: "#cbd5f5",
      });
      this.logText.setVisible(false);

      this.statusText = this.add
        .text(width / 2, height / 2 - 120, this.config.ui.startHeadline, {
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "12px",
          color: "#94a3b8",
        })
        .setOrigin(0, 0);

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
      this.shipText = shipOption.text;
      this.weaponMainText = mainOption.text;
      this.weaponSubText = subOption.text;
      this.aiText = aiOption.text;
      this.startOptions = [shipOption, mainOption, subOption, aiOption];
      this.startUiElements.push(
        shipOption.container,
        mainOption.container,
        subOption.container,
        aiOption.container,
      );

      const actionButtonWidth = Math.min(220, width * 0.4);
      const startButton = this.createActionButton(
        width / 2,
        height / 2 + 70,
        this.config.ui.startButton,
        () => {
          if (this.state === "start") {
            this.startBattle();
          }
        },
        actionButtonWidth,
      );
      this.startButton = startButton.text;
      this.startButtonContainer = startButton.container;
      this.startUiElements.push(startButton.container);

      const randomButton = this.createActionButton(
        width / 2,
        height / 2 + 120,
        "RANDOM (構成だけ)",
        () => {
          if (this.state === "start") {
            this.randomizeLoadout();
          }
        },
        actionButtonWidth,
      );
      this.randomButton = randomButton.text;
      this.randomButtonContainer = randomButton.container;
      this.startUiElements.push(randomButton.container);

      this.startHintText = this.add
        .text(width / 2, height / 2 + 110, this.config.ui.startHint, {
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "10px",
          color: "#cbd5f5",
        })
        .setOrigin(0, 0.5);
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
      const text = this.add.text(-width / 2 + 16, 0, label, {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "14px",
        color: "#c7d2fe",
      });
      text.setOrigin(0, 0.5);
      const chevron = this.add.text(width / 2 - 18, -1, "▾", {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "14px",
        color: "#94a3b8",
      });
      chevron.setOrigin(0.5);
      container.add([background, text, chevron]);
      container.setSize(width, height);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
        Phaser.Geom.Rectangle.Contains,
      );
      container.on("pointerdown", onTap);
      return { container, text, background, chevron };
    }

    createActionButton(x, y, label, onTap, width) {
      const container = this.add.container(x, y);
      const background = this.add
        .rectangle(0, 0, width, 40, 0x1f2937, 0.9)
        .setStrokeStyle(1, 0xfde68a, 0.7);
      const text = this.add.text(0, 0, label, {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "14px",
        color: "#fef08a",
      });
      text.setOrigin(0.5);
      container.add([background, text]);
      container.setSize(width, 40);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-width / 2, -20, width, 40),
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

    updateLoadoutText() {
      const ship = this.config.loadouts.ships[this.shipIndex];
      const weaponMain = this.config.loadouts.weaponsMain[this.weaponMainIndex];
      const weaponSub = this.config.loadouts.weaponsSub[this.weaponSubIndex];
      const aiType = this.config.loadouts.aiTypes[this.aiIndex];
      this.shipText?.setText(`機体  ${ship.label}`);
      this.weaponMainText?.setText(`武器 (MAIN)  ${weaponMain.label}`);
      this.weaponSubText?.setText(`武器 (SUB)  ${weaponSub.label}`);
      this.aiText?.setText(`AI (性格)  ${aiType.label}`);
    }

    randomizeLoadout() {
      this.shipIndex = Phaser.Math.Between(0, this.config.loadouts.ships.length - 1);
      this.weaponMainIndex = Phaser.Math.Between(0, this.config.loadouts.weaponsMain.length - 1);
      this.weaponSubIndex = Phaser.Math.Between(0, this.config.loadouts.weaponsSub.length - 1);
      this.aiIndex = Phaser.Math.Between(0, this.config.loadouts.aiTypes.length - 1);
      this.updateLoadoutText();
    }

    toCssColor(value) {
      return `#${value.toString(16).padStart(6, "0")}`;
    }

    applyTheme() {
      const theme = this.config.uiThemes[0];
      const palette = theme.palette;
      const { width, height } = this.scale;
      this.backgroundRect?.setFillStyle(palette.bg, 1);

      const panelCss = this.toCssColor(palette.panel);

      this.headerBar?.setFillStyle(palette.panel, 0.95).setStrokeStyle(1, palette.panelBorder, 0.9);
      this.headerTitle?.setColor(palette.accentText);
      this.headerTag?.setColor(palette.subText);
      this.debugBar?.setFillStyle(palette.panel, 0.9).setStrokeStyle(1, palette.panelBorder, 0.6);
      this.debugText?.setColor(palette.text);
      this.statusText?.setColor(palette.subText);
      this.hudPanel?.setFillStyle(palette.panel, 0.7).setStrokeStyle(1, palette.panelBorder, 0.6);
      this.hudWaveTime?.setColor(palette.text);
      this.hudScore?.setColor(palette.text);
      this.hudLoadout?.setColor(palette.subText);
      this.logPanel?.setFillStyle(palette.panel, 0.6).setStrokeStyle(1, palette.panelBorder, 0.5);
      this.logText?.setColor(palette.text);
      this.resultText?.setColor(palette.highlightText);
      this.startHintText?.setColor(palette.subText);
      this.retryButton?.setStyle({ color: palette.highlightText, backgroundColor: panelCss });
      this.hudHpPlayer?.setFillStyle(palette.accent, 1);
      this.hudHpEnemy?.setFillStyle(0xd946ef, 0.9);

      this.startOptions.forEach((option) => {
        option.background.setFillStyle(palette.panel, 0.8);
        option.background.setStrokeStyle(1, palette.panelBorder, 0.8);
        option.text.setColor(palette.text);
        option.chevron.setColor(palette.subText);
      });

      if (this.startButtonContainer && this.startButton) {
        const background = this.startButtonContainer.list[0];
        background.setFillStyle(palette.panel, 0.9);
        background.setStrokeStyle(1, palette.accent, 0.9);
        this.startButton.setColor(palette.accentText);
      }
      if (this.randomButtonContainer && this.randomButton) {
        const background = this.randomButtonContainer.list[0];
        background.setFillStyle(palette.panel, 0.7);
        background.setStrokeStyle(1, palette.panelBorder, 0.7);
        this.randomButton.setColor(palette.text);
      }

      this.updateLayout(theme.layout, width, height);
      this.updateThemePanels(theme.layout, palette, width, height);
    }

    updateLayout(layout, width, height) {
      const layoutConfig = this.getLayoutConfig(layout, width, height);
      this.headerBar?.setPosition(layoutConfig.header.x, layoutConfig.header.y);
      this.headerBar?.setSize(layoutConfig.header.width, layoutConfig.header.height);
      this.headerTitle?.setPosition(layoutConfig.header.titleX, layoutConfig.header.titleY);
      this.headerTag?.setPosition(layoutConfig.header.tagX, layoutConfig.header.tagY);
      this.debugBar?.setPosition(layoutConfig.debug.x, layoutConfig.debug.y);
      this.debugBar?.setSize(layoutConfig.debug.width, layoutConfig.debug.height);
      this.debugText?.setPosition(layoutConfig.debug.textX, layoutConfig.debug.textY);
      if (this.statusText) {
        this.statusText.setPosition(layoutConfig.start.noticeX, layoutConfig.start.noticeY);
        this.statusText.setWordWrapWidth(layoutConfig.start.noticeWidth);
      }
      this.hudPanel?.setPosition(layoutConfig.hud.panelX, layoutConfig.hud.panelY);
      this.hudPanel?.setSize(layoutConfig.hud.panelW, layoutConfig.hud.panelH);
      this.hudWaveTime?.setPosition(layoutConfig.hud.waveX, layoutConfig.hud.waveY);
      this.hudScore?.setPosition(layoutConfig.hud.scoreX, layoutConfig.hud.scoreY);
      this.hudHpPlayer?.setPosition(layoutConfig.hud.hpX, layoutConfig.hud.hpPlayerY);
      this.hudHpEnemy?.setPosition(layoutConfig.hud.hpX, layoutConfig.hud.hpEnemyY);
      this.hudHpBaseWidth = layoutConfig.hud.hpWidth;
      this.hudHpPlayer?.setSize(layoutConfig.hud.hpWidth, 10);
      this.hudHpEnemy?.setSize(layoutConfig.hud.hpWidth, 8);
      this.hudLoadout?.setPosition(layoutConfig.hud.loadoutX, layoutConfig.hud.loadoutY);
      this.logPanel?.setPosition(layoutConfig.log.panelX, layoutConfig.log.panelY);
      this.logPanel?.setSize(layoutConfig.log.panelW, layoutConfig.log.panelH);
      this.logText?.setPosition(layoutConfig.log.textX, layoutConfig.log.textY);

      this.startOptions.forEach((option, index) => {
        const optionLayout = layoutConfig.start.options[index];
        option.container.setPosition(optionLayout.x, optionLayout.y);
        option.background.setSize(optionLayout.width, optionLayout.height);
        option.container.setSize(optionLayout.width, optionLayout.height);
        option.text.setPosition(-optionLayout.width / 2 + 16, 0);
        option.chevron.setPosition(optionLayout.width / 2 - 18, -1);
      });

      if (this.startButtonContainer) {
        this.startButtonContainer.setPosition(layoutConfig.start.buttonX, layoutConfig.start.buttonY);
      }
      if (this.randomButtonContainer) {
        this.randomButtonContainer.setPosition(
          layoutConfig.start.randomButtonX,
          layoutConfig.start.randomButtonY,
        );
      }

      this.startHintText?.setPosition(layoutConfig.start.hintX, layoutConfig.start.hintY);
      this.startHintText?.setWordWrapWidth(layoutConfig.start.noticeWidth);
      this.resultText?.setPosition(layoutConfig.result.x, layoutConfig.result.y);
      this.retryButton?.setPosition(layoutConfig.retry.x, layoutConfig.retry.y);
    }

    getLayoutConfig(layout, width, height) {
      const panelWidth = Math.min(width - 40, 520);
      const panelLeft = width / 2 - panelWidth / 2;
      const optionWidth = panelWidth;
      const optionHalfWidth = (panelWidth - 16) / 2;
      const optionHeight = 36;
      const optionsTop = 140;
      const optionGap = 18;

      return {
        header: {
          x: width / 2,
          y: 26,
          width: width - 24,
          height: 36,
          titleX: panelLeft,
          titleY: 16,
          tagX: panelLeft + panelWidth,
          tagY: 16,
        },
        debug: {
          x: width / 2,
          y: 68,
          width: width - 24,
          height: 32,
          textX: width / 2,
          textY: 60,
        },
        start: {
          noticeX: panelLeft,
          noticeY: 108,
          noticeWidth: panelWidth,
          options: [
            { x: width / 2, y: optionsTop, width: optionWidth, height: optionHeight },
            {
              x: panelLeft + optionHalfWidth / 2,
              y: optionsTop + optionGap + optionHeight,
              width: optionHalfWidth,
              height: optionHeight,
            },
            {
              x: panelLeft + optionHalfWidth + 8 + optionHalfWidth / 2,
              y: optionsTop + optionGap + optionHeight,
              width: optionHalfWidth,
              height: optionHeight,
            },
            {
              x: width / 2,
              y: optionsTop + (optionGap + optionHeight) * 2,
              width: optionWidth,
              height: optionHeight,
            },
          ],
          buttonX: panelLeft + optionWidth * 0.32,
          buttonY: optionsTop + (optionGap + optionHeight) * 3 + 16,
          randomButtonX: panelLeft + optionWidth * 0.74,
          randomButtonY: optionsTop + (optionGap + optionHeight) * 3 + 16,
          hintX: panelLeft,
          hintY: optionsTop + (optionGap + optionHeight) * 3 + 58,
        },
        hud: {
          panelX: width * 0.36,
          panelY: 120,
          panelW: width * 0.66,
          panelH: 72,
          waveX: width * 0.06,
          waveY: 96,
          scoreX: width * 0.58,
          scoreY: 92,
          hpX: width * 0.06,
          hpWidth: width * 0.3,
          hpPlayerY: 128,
          hpEnemyY: 144,
          loadoutX: width * 0.06,
          loadoutY: 154,
        },
        log: {
          panelX: width * 0.74,
          panelY: 200,
          panelW: width * 0.42,
          panelH: 130,
          textX: width * 0.58,
          textY: 152,
        },
        result: { x: width / 2, y: height / 2 + 80 },
        retry: { x: width / 2, y: height / 2 + 120 },
      };
    }

    updateThemePanels(layout, palette, width, height) {
      this.themePanels.forEach((panel) => panel.destroy());
      this.themePanels = [];

      const startPanel = this.add
        .rectangle(width / 2, 240, Math.min(width - 32, 560), 260, palette.panel, 0.35)
        .setStrokeStyle(1, palette.panelBorder, 0.6)
        .setDepth(-1);
      this.themePanels.push(startPanel);
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
      this.setBattleUiVisible(false);
      this.logLines = [];
      this.logText?.setText("");
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
      this.setBattleUiVisible(true);
      this.battleStartTime = this.time.now;
      this.logLines = [];
      this.appendLog("Battle started");
      this.hudLoadout?.setText(
        `${this.config.loadouts.ships[this.shipIndex].label} | ${this.config.loadouts.aiTypes[this.aiIndex].label} | ` +
          `${this.config.loadouts.weaponsMain[this.weaponMainIndex].label} / ${this.config.loadouts.weaponsSub[this.weaponSubIndex].label}`,
      );
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
      this.appendLog(`WAVE ${this.wave} start`);
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

    setBattleUiVisible(isVisible) {
      this.hudPanel?.setVisible(isVisible);
      this.hudWaveTime?.setVisible(isVisible);
      this.hudScore?.setVisible(isVisible);
      this.hudHpPlayer?.setVisible(isVisible);
      this.hudHpEnemy?.setVisible(isVisible);
      this.hudLoadout?.setVisible(isVisible);
      this.logPanel?.setVisible(isVisible);
      this.logText?.setVisible(isVisible);
      this.themePanels.forEach((panel) => panel.setVisible(!isVisible));
    }

    appendLog(message) {
      const timestamp = new Date().toLocaleTimeString("ja-JP", { hour12: false });
      this.logLines.unshift(`[${timestamp}] ${message}`);
      this.logLines = this.logLines.slice(0, 8);
      this.logText?.setText(this.logLines.join("\n"));
    }

    updateHud() {
      const maxWaves = this.config.waves.max;
      const elapsedMs = Math.max(0, this.time.now - this.battleStartTime);
      const elapsedSec = Math.floor(elapsedMs / 1000);
      const minutes = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
      const seconds = String(elapsedSec % 60).padStart(2, "0");

      this.hudWaveTime?.setText(`WAVE ${this.wave}/${maxWaves}  TIME ${minutes}:${seconds}`);
      this.hudScore?.setText(`SCORE ${this.score}`);
      const playerRatio = this.playerStats.maxHp
        ? this.playerStats.hp / this.playerStats.maxHp
        : 0;
      const enemyRatio = this.enemyStats.maxHp ? this.enemyStats.hp / this.enemyStats.maxHp : 0;
      if (this.hudHpPlayer) {
        this.hudHpPlayer.width = this.hudHpBaseWidth * Phaser.Math.Clamp(playerRatio, 0, 1);
      }
      if (this.hudHpEnemy) {
        this.hudHpEnemy.width = this.hudHpBaseWidth * Phaser.Math.Clamp(enemyRatio, 0, 1);
      }
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
      this.appendLog(`WAVE ${this.wave} clear +${waveScore}`);
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
      this.appendLog(win ? "Battle complete" : "Player destroyed");
    }

    update(time) {
      if (this.state !== "playing") {
        this.statusText?.setVisible(true);
        return;
      }

      this.statusText?.setVisible(false);
      this.updateHud();

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
