// Import Phaser modules
import Phaser from "phaser";

import WebFontFile from '../assets/font/WebFontFile'

// Create scene
class LobbyScene extends Phaser.Scene {
  constructor() {
    super({
      // Assigning a key to the the scene
      key: "LobbyScene",
    });
  }

  // Preload assets
  preload()
  {
    this.load.addFile(new WebFontFile(this.load, 'Press Start 2P'));
  }

  // Creating all that will be used in the scene
  create() {
    console.log("LobbyScene loaded");

    // Creating interactive text to go back to mode selection scene
    this.add
      .text(640, 460, "Go back", {
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

export default LobbyScene;
