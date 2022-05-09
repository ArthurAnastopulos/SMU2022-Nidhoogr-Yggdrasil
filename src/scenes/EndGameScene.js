import Phaser from "phaser";

import WebFontFile from '../assets/font/WebFontFile'

class EndGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "EndGameScene" });
  }

  preload()
  {
    this.load.addFile(new WebFontFile(this.load, 'Press Start 2P'));
  }

  create() {
    this.add
      .text(640, 300, "You died!", {
        fontFamily: '"Press Start 2P"',
        fontSize: "40pt"
      })
      .setOrigin(0.5, 0.5);

    this.add
      .text(640, 360, "Restart", {
        fontFamily: '"Press Start 2P"',
        fontSize: "30pt"
      })
      .setInteractive()
      .setOrigin(0.5, 0.5)
      .on(
        "pointerdown",
        () => {
          this.scene.start("ModeSelectionScene");
        },
        this
      );
  }
}

export default EndGameScene;
