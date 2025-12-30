(() => {
  const TARGET_SCORE = 15;

  class SurvivalScene extends Phaser.Scene {
    constructor() {
      super("survival");
      this.score = 0;
      this.energy = 100;
      this.scoreText = null;
      this.energyText = null;
      this.orb = null;
    }

    create() {
      const { width, height } = this.scale;

      this.add.rectangle(width / 2, height / 2, width, height, 0x101826).setDepth(-2);
      this.add.rectangle(width / 2, height / 2, width - 30, height - 30, 0x1f2a40).setDepth(-1);

      const title = this.add
        .text(24, 20, "Energy Run", {
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: "20px",
          color: "#ffffff",
        })
        .setShadow(0, 2, "#0b0f1f", 4, true, true);

      this.scoreText = this.add.text(24, 50, "Score: 0", {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "16px",
        color: "#8be3ff",
      });

      this.energyText = this.add.text(width - 160, 24, "Energy: 100", {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "16px",
        color: "#ffe88a",
      });

      this.orb = this.add.circle(width / 2, height / 2, 26, 0x4de4ff, 0.9);
      this.orb.setStrokeStyle(3, 0xffffff, 0.8);

      this.tweens.add({
        targets: this.orb,
        scale: { from: 0.9, to: 1.1 },
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });

      this.input.on("pointerdown", (pointer) => {
        this.score += 1;
        this.energy = Math.min(100, this.energy + 8);
        this.updateHud();
        this.moveOrb(pointer.x, pointer.y);
      });

      this.time.addEvent({
        delay: 1200,
        loop: true,
        callback: () => {
          this.energy = Math.max(0, this.energy - 6);
          this.updateHud();
        },
      });

      this.time.addEvent({
        delay: 900,
        loop: true,
        callback: () => {
          this.moveOrb(
            Phaser.Math.Between(80, width - 80),
            Phaser.Math.Between(120, height - 80)
          );
        },
      });

      const goal = this.add.text(width - 220, height - 40, "Goal: 15", {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "14px",
        color: "#b3bdd3",
      });

      title.setDepth(1);
      goal.setDepth(1);
    }

    updateHud() {
      if (this.scoreText) {
        this.scoreText.setText(`Score: ${this.score}`);
      }
      if (this.energyText) {
        this.energyText.setText(`Energy: ${this.energy}`);
        if (this.score >= TARGET_SCORE) {
          this.energyText.setColor("#9aff9a");
        }
      }
    }

    moveOrb(x, y) {
      if (!this.orb) return;
      this.tweens.add({
        targets: this.orb,
        x,
        y,
        duration: 260,
        ease: "Sine.out",
      });
    }
  }

  const config = {
    type: Phaser.AUTO,
    parent: "game",
    backgroundColor: "#0f1729",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 500,
    },
    scene: [SurvivalScene],
  };

  new Phaser.Game(config);
})();
