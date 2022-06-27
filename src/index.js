// Importing phaser module
import Phaser from "phaser";

// Importing scenes
import TitleScene from "./scenes/TitleScene";
import ModeSelectionScene from "./scenes/ModeSelectionScene";
import GameScene from "./scenes/GameScene";
import EndGameScene from "./scenes/EndGameScene";

// Setting game config
const config = {
  type: Phaser.AUTO,

  antialias: false,

  parent: "game-container",

  // 1280x640 || 40x20(base 32x32)
  width: 1280,
  height: 640,
  autoCenter: Phaser.Scale.CENTER_BOTH,

  physics: {
    default: "arcade",
    debug: true
  },

  scale: {
    mode: Phaser.Scale.FIT,
    parent: "game-container",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
  },

  scene: [TitleScene, ModeSelectionScene, GameScene, EndGameScene],
};

// Starting the game
const game = new Phaser.Game(config);
