(() => {
  const config = window.PTS_CONFIG;
  const gameConfig = {
    type: Phaser.AUTO,
    parent: "game",
    backgroundColor: config.game.backgroundColor,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.ENVELOP,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: config.game.width,
      height: config.game.height,
    },
    scene: [window.PTS_CombatScene],
  };

  new Phaser.Game(gameConfig);
})();
