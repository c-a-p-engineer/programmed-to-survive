(() => {
  class CombatScene extends Phaser.Scene {
    constructor() {
      super("combat");
      this.state = "intro";
      this.player = null;
      this.enemy = null;
      this.playerStats = { maxHp: 100, hp: 100, damage: 12, cooldown: 350 };
      this.enemyStats = { maxHp: 120, hp: 120, damage: 10, cooldown: 420 };
      this.nextPlayerAttack = 0;
      this.nextEnemyAttack = 0;
      this.target = new Phaser.Math.Vector2(0, 0);
      this.statusText = null;
      this.playerHpText = null;
      this.enemyHpText = null;
      this.logText = null;
      this.logs = [];
    }

    create() {
      const { width, height } = this.scale;
      this.add.rectangle(width / 2, height / 2, width, height, 0x0b1020).setDepth(-2);
      this.createTextures();

      this.player = this.physics.add.image(width / 2, height * 0.65, "player");
      this.player.setCollideWorldBounds(true);
      this.player.body.setCircle(14, 2, 2);

      this.enemy = this.physics.add.image(width / 2, height * 0.25, "enemy");
      this.enemy.setCollideWorldBounds(true);
      this.enemy.body.setCircle(16, 0, 0);

      this.player.setActive(false).setVisible(false);
      this.enemy.setActive(false).setVisible(false);

      this.add.text(16, 12, "フェーズ1: コア戦闘ループ", {
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

      this.statusText = this.add
        .text(width / 2, height / 2, "クリック/タップで戦闘開始", {
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "20px",
          color: "#fef3c7",
        })
        .setOrigin(0.5);

      this.logText = this.add
        .text(16, height - 86, "LOG:\n- 準備完了", {
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "12px",
          color: "#cbd5f5",
        })
        .setDepth(1);

      this.input.on("pointermove", (pointer) => {
        this.target.set(pointer.x, pointer.y);
      });

      this.input.on("pointerdown", () => {
        if (this.state !== "playing") {
          this.startBattle();
        }
      });

      this.target.set(width / 2, height * 0.65);
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
      graphics.destroy();
    }

    startBattle() {
      const { width, height } = this.scale;
      this.state = "playing";
      this.playerStats.hp = this.playerStats.maxHp;
      this.enemyStats.hp = this.enemyStats.maxHp;
      this.nextPlayerAttack = 0;
      this.nextEnemyAttack = 0;
      this.player.setPosition(width / 2, height * 0.65).setActive(true).setVisible(true);
      this.enemy.setPosition(width / 2, height * 0.25).setActive(true).setVisible(true);
      this.player.setVelocity(0, 0);
      this.enemy.setVelocity(0, 0);
      this.statusText.setText("戦闘中... 敵を倒そう");
      this.updateHud();
      this.resetLogs();
      this.pushLog("戦闘開始: 敵が接近中");
    }

    updateHud() {
      this.playerHpText?.setText(`PLAYER HP: ${this.playerStats.hp}`);
      this.enemyHpText?.setText(`ENEMY HP: ${this.enemyStats.hp}`);
    }

    resetLogs() {
      this.logs = [];
      this.logText?.setText("LOG:\n- 戦闘開始");
    }

    pushLog(message) {
      this.logs.unshift(message);
      if (this.logs.length > 4) {
        this.logs.pop();
      }
      const lines = this.logs.map((line) => `- ${line}`).join("\n");
      this.logText?.setText(`LOG:\n${lines}`);
    }

    handleCombat(now) {
      if (now >= this.nextPlayerAttack) {
        this.enemyStats.hp = Math.max(0, this.enemyStats.hp - this.playerStats.damage);
        this.nextPlayerAttack = now + this.playerStats.cooldown;
        this.pushLog(`敵に${this.playerStats.damage}ダメージ`);
      }
      if (now >= this.nextEnemyAttack) {
        this.playerStats.hp = Math.max(0, this.playerStats.hp - this.enemyStats.damage);
        this.nextEnemyAttack = now + this.enemyStats.cooldown;
        this.pushLog(`被弾: ${this.enemyStats.damage}ダメージ`);
      }

      this.updateHud();

      if (this.enemyStats.hp <= 0) {
        this.finishBattle("win");
      } else if (this.playerStats.hp <= 0) {
        this.finishBattle("lose");
      }
    }

    finishBattle(result) {
      this.state = result;
      this.player.setVelocity(0, 0);
      this.enemy.setVelocity(0, 0);
      if (result === "win") {
        this.statusText.setText("勝利！クリックで再挑戦");
        this.pushLog("敵撃破: 勝利");
      } else {
        this.statusText.setText("敗北... クリックで再挑戦");
        this.pushLog("力尽きた: 敗北");
      }
    }

    update(time, delta) {
      if (this.state !== "playing") {
        return;
      }

      const speed = 220;
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

      const enemySpeed = 150;
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
