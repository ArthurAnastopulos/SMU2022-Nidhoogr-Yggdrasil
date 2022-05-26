// Import Phaser modules
import Phaser from "phaser";
import { io } from "socket.io-client";
import WebFontFile from '../assets/font/WebFontFile'

var clientDetails = {
    roomId: "SMU",
    userId: "player",
    isRoomOwner: false
}

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
  create( data ) {
    console.log("LobbyScene loaded");

    var socket = io();

    if(data == 'create-room'){
      clientDetails.userId = makeid(5)
      clientDetails.isRoomOwner = true

      socket.emit('create-room', clientDetails);
    }

    if(data == 'join-room'){
      clientDetails.userId = makeid(5)
      clientDetails.isRoomOwner = false

      socket.emit('join-room', clientDetails);
    }


    socket.on('room-created', async (response) => {
        console.log(`Room was created: Response:${response.res} - ${response.code}`);
    })

    socket.on('room-joined', async (response) => {
      console.log(`Room was joined: Response:${response.res} - ${response.code}`);
    })

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

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

export default LobbyScene;
