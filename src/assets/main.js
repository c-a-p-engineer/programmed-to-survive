(() => {
  class CombatScene extends Phaser.Scene {
    constructor() {
      super("combat");
      this.state = "settings";
      this.player = null;
      this.enemy = null;
      this.obstacles = null;
      this.playerStats = { maxHp: 120, hp: 120, damage: 12, cooldown: 320 };
      this.enemyStats = { maxHp: 80, hp: 80, damage: 8, cooldown: 420 };
      this.score = 0;
      this.wave = 1;
      this.maxWaves = 3;
      this.difficultyIndex = 0;
      this.difficulties = [
        { label: "EASY", enemyHp: 0.9, enemyDamage: 0.8, score: 0.8 },
        { label: "NORMAL", enemyHp: 1, enemyDamage: 1, score: 1 },
        { label: "HARD", enemyHp: 1.2, enemyDamage: 1.2, score: 1.3 },
      ];
      this.nextPlayerAttack = 0;
      this.nextEnemyAttack = 0;
      this.target = new Phaser.Math.Vector2(0, 0);
      this.statusText = null;
      this.playerHpText = null;
      this.enemyHpText = null;
      this.waveText = null;
      this.scoreText = null;
      this.difficultyText = null;
      this.settingsHintText = null;
      this.resultText = null;
    }

    create() {
      const { width, height } = this.scale;
      this.add.rectangle(width / 2, height / 2, width, height, 0x0b1020).setDepth(-2);
      this.createTextures();

      this.player = this.physics.add.image(width / 2, height * 0.7, "player");
      this.player.setCollideWorldBounds(true);
      this.player.body.setCircle(14, 2, 2);

      this.enemy = this.physics.add.image(width / 2, height * 0.3, "enemy");
      this.enemy.setCollideWorldBounds(true);
      this.enemy.body.setCircle(16, 0, 0);

      this.obstacles = this.physics.add.staticGroup();

      this.add.text(16, 12, "フェーズ1: 戦闘ループ試作", {
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
        .text(width / 2, height / 2 - 40, "設定を選んで開始", {
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "20px",
          color: "#fef3c7",
        })
        .setOrigin(0.5);

      this.difficultyText = this.add
        .text(width / 2, height / 2 + 8, "難易度: NORMAL", {
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "16px",
          color: "#93c5fd",
        })
        .setOrigin(0.5);

      this.settingsHintText = this.add
        .text(width / 2, height / 2 + 40, "クリックで難易度変更 / 右クリックで開始", {
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "12px",
          color: "#cbd5f5",
        })
        .setOrigin(0.5);

      this.resultText = this.add
        .text(width / 2, height / 2 + 110, "", {
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "16px",
          color: "#fef08a",
        })
        .setOrigin(0.5)
        .setVisible(false);

      this.input.on("pointermove", (pointer) => {
        if (this.state === "playing") {
          this.target.set(pointer.x, pointer.y);
        }
      });

      this.input.on("pointerdown", (pointer) => {
        if (this.state === "settings") {
          if (pointer.rightButtonDown()) {
            this.startBattle();
          } else {
            this.cycleDifficulty();
          }
          return;
        }

        if (this.state === "result") {
          this.toSettings();
        }
      });

      this.target.set(width / 2, height * 0.7);
      this.toSettings();
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

      graphics.fillStyle(0x334155, 1);
      graphics.fillRoundedRect(0, 0, 120, 28, 6);
      graphics.generateTexture("obstacle", 120, 28);
      graphics.destroy();
    }

    cycleDifficulty() {
      this.difficultyIndex = (this.difficultyIndex + 1) % this.difficulties.length;
      const difficulty = this.difficulties[this.difficultyIndex];
      this.difficultyText?.setText(`難易度: ${difficulty.label}`);
    }

    toSettings() {
      this.state = "settings";
      this.score = 0;
      this.wave = 1;
      this.player.setActive(false).setVisible(false);
      this.enemy.setActive(false).setVisible(false);
      this.clearObstacles();
      this.updateHud();
      this.statusText.setText("設定を選んで開始");
      this.difficultyText.setVisible(true);
      this.settingsHintText.setVisible(true);
      this.resultText.setVisible(false);
      this.target.set(this.scale.width / 2, this.scale.height * 0.7);
    }

    startBattle() {
      this.state = "playing";
      this.score = 0;
      this.wave = 1;
      this.difficultyText.setVisible(false);
      this.settingsHintText.setVisible(false);
      this.resultText.setVisible(false);
      this.setupWave();
    }

    setupWave() {
      const { width, height } = this.scale;
      const difficulty = this.difficulties[this.difficultyIndex];
      this.playerStats.hp = this.playerStats.maxHp;
      this.enemyStats.maxHp = Math.round(80 + this.wave * 20 * difficulty.enemyHp);
      this.enemyStats.hp = this.enemyStats.maxHp;
      this.enemyStats.damage = Math.round((8 + this.wave * 2) * difficulty.enemyDamage);
      this.nextPlayerAttack = 0;
      this.nextEnemyAttack = 0;

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
      const placements = [
        { x: width / 2, y: height / 2, scale: 1 },
        { x: width / 2 - 180, y: height / 2 + 80, scale: 0.8 },
        { x: width / 2 + 180, y: height / 2 - 70, scale: 0.8 },
      ];
      placements.forEach((placement) => {
        const obstacle = this.obstacles.create(placement.x, placement.y, "obstacle");
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
      this.playerHpText?.setText(
        this.playerStats.hp ? `PLAYER HP: ${this.playerStats.hp}` : "PLAYER HP: --",
      );
      this.enemyHpText?.setText(
        this.enemyStats.hp ? `ENEMY HP: ${this.enemyStats.hp}` : "ENEMY HP: --",
      );
      this.waveText?.setText(`WAVE: ${this.wave}/${this.maxWaves}`);
      this.scoreText?.setText(`SCORE: ${this.score}`);
    }

    handleCombat(now) {
      if (now >= this.nextPlayerAttack) {
        this.enemyStats.hp = Math.max(0, this.enemyStats.hp - this.playerStats.damage);
        this.nextPlayerAttack = now + this.playerStats.cooldown;
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
      const difficulty = this.difficulties[this.difficultyIndex];
      const waveScore = Math.round(150 * this.wave * difficulty.score);
      this.score += waveScore;
      this.updateHud();
      if (this.wave >= this.maxWaves) {
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
        this.statusText.setText("全WAVE制覇！");
        this.resultText.setText(`最終スコア: ${this.score}（クリックで再挑戦）`);
      } else {
        this.statusText.setText("敗北... もう一度挑戦");
        this.resultText.setText(`最終スコア: ${this.score}（クリックで再挑戦）`);
      }
      this.resultText.setVisible(true);
    }

    update(time) {
      if (this.state !== "playing") {
        return;
      }

      const speed = 240;
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

      const enemySpeed = 150 + this.wave * 10;
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

  const config = {
    type: Phaser.AUTO,
    parent: "game",
    backgroundColor: "#0b1020",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 820,
      height: 520,
    },
    scene: [CombatScene],
  };

  new Phaser.Game(config);
})();
