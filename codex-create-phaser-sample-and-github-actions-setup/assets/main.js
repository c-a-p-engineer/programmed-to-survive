(() => {
  class BreakoutScene extends Phaser.Scene {
    constructor() {
      super("breakout");
      this.score = 0;
      this.scoreText = null;
      this.lives = 3;
      this.livesText = null;
    }

    preload() {
      this.load.image("ball", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAJElEQVQYV2NkYGD4z8DAwMgABYwMDAwMSgYkYgAAACfSBmsn0pNTAAAAABJRU5ErkJggg==");
      this.load.image("paddle", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAGCAYAAABOl8ncAAAAP0lEQVQYV2NkYGD4z0AEYBxVSFJhGMRQ6k0WmG3aQhplg9EJDCIhFIMIYd1UQwZgGQAAqF6B+9UrGbcAAAAASUVORK5CYII=");
      this.load.image("brick", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAGCAYAAABi6S9ZAAAAO0lEQVQYV2NkYGD4z0AEYhzQwMAw4P///2FIFyEwMDAwkgxDqSgYI0Gqg0YxwIBADrKBp2NaSWPAAAAAElFTkSuQmCC");
    }

    create() {
      const { width, height } = this.scale;
      this.add.rectangle(width / 2, height / 2, width, height, 0x0f1729).setDepth(-2);

      this.scoreText = this.add.text(16, 12, "Score: 0", {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "16px",
        color: "#8be3ff",
      });
      this.livesText = this.add.text(width - 120, 12, "Lives: 3", {
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: "16px",
        color: "#ffe88a",
      });

      this.ball = this.physics.add.image(width / 2, height - 120, "ball");
      this.ball.setCollideWorldBounds(true);
      this.ball.setBounce(1);
      this.ball.setData("speed", 240);

      this.paddle = this.physics.add.image(width / 2, height - 60, "paddle");
      this.paddle.setImmovable(true);
      this.paddle.body.allowGravity = false;

      this.bricks = this.physics.add.staticGroup();
      const colors = [0x4de4ff, 0x7ef5c5, 0xffd26a, 0xff8fa1];
      const rows = 4;
      const cols = 8;
      const offsetX = 80;
      const offsetY = 70;
      const gapX = 60;
      const gapY = 26;
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const brick = this.bricks.create(offsetX + col * gapX, offsetY + row * gapY, "brick");
          brick.setTint(colors[row % colors.length]);
        }
      }

      this.physics.add.collider(this.ball, this.paddle, this.handlePaddleHit, null, this);
      this.physics.add.collider(this.ball, this.bricks, this.handleBrickHit, null, this);

      this.input.on("pointermove", (pointer) => {
        this.paddle.x = Phaser.Math.Clamp(pointer.x, 40, width - 40);
      });

      this.input.on("pointerdown", () => {
        if (!this.ball.body.velocity.length()) {
          const speed = this.ball.getData("speed");
          this.ball.setVelocity(speed, -speed);
        }
      });

      this.resetBall();
    }

    handlePaddleHit(ball, paddle) {
      const diff = ball.x - paddle.x;
      ball.setVelocityX(diff * 6);
    }

    handleBrickHit(ball, brick) {
      brick.disableBody(true, true);
      this.score += 10;
      this.scoreText?.setText(`Score: ${this.score}`);

      if (this.bricks.countActive() === 0) {
        this.scoreText?.setText(`Score: ${this.score} (Clear!)`);
        this.resetBall();
      }
    }

    resetBall() {
      const { width, height } = this.scale;
      this.ball.setVelocity(0, 0);
      this.ball.setPosition(width / 2, height - 120);
    }

    update() {
      const { height, width } = this.scale;
      if (this.ball.y > height + 20) {
        this.lives -= 1;
        this.livesText?.setText(`Lives: ${this.lives}`);
        if (this.lives <= 0) {
          this.scoreText?.setText(`Score: ${this.score} (Game Over)`);
          this.ball.setVelocity(0, 0);
          this.ball.setPosition(width / 2, height / 2);
          return;
        }
        this.resetBall();
      }
    }
  }

  const config = {
    type: Phaser.AUTO,
    parent: "game",
    backgroundColor: "#0f1729",
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
      width: 800,
      height: 500,
    },
    scene: [BreakoutScene],
  };

  new Phaser.Game(config);
})();
