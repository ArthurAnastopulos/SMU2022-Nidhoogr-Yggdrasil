// Importing Phaser modules
import Phaser from "phaser";

import WebFontFile from '../assets/font/WebFontFile'
import * as images from "../assets/images";

// Creating Scene
class TitleScene extends Phaser.Scene {
  constructor() {
    super({
      // Assigning a key to the scene
      key: "TitleScene",
    });
  }

  // Preload assets
  preload()
  {
    this.load.addFile(new WebFontFile(this.load, 'Press Start 2P'));

    this.load.image("skyBackground", images.skyBackground);
    this.load.image("lowCloud", images.lowCloud);
    this.load.image("yggdrasil", images.yggdrasil);
    this.load.image("montainTips", images.montainTips);
    this.load.image("highClouds", images.highClouds);
  }

  // Create all that will be used in the scene
  create() {
    // Adding static background
    this.add.image(0, 0, "skyBackground").setOrigin(0, 0);
    this.add.image(0, 0, "yggdrasil").setOrigin(0, 0);

    // Adding interactive text to turn fullscreen
    this.add
      .text(0, 0, "Toggle Fullscreen", {
        fontFamily: '"Press Start 2P"',
        fontSize: "20pt"
      })
      .setInteractive()
      .on("pointerdown", () => {
        !this.scale.isFullscreen
          ? this.scale.startFullscreen()
          : this.scale.stopFullscreen();
      });

    // Creating play interactive text
    this.add
      .text(640, 360, "Play", {
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

export default TitleScene;
