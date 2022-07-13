// Import Phaser module
import Phaser from "phaser";
import { io } from "socket.io-client";
// Importing assets
import * as images from "../assets/images";
import * as audio from "../assets/audio";
import WebFontFile from '../assets/font/WebFontFile'

var ice_servers = {
  iceServers: [
    { 
      urls: "stun:ifsc.cloud" 
    },
    {
      urls: "turns:ifsc.cloud",
      username: "etorresini",
      credential: "matrix",
    }
  ],
};
var socket = undefined;
var start = false;
var localConnection;
var remoteConnection;
var midias;
const audioOutput = document.querySelector("audio");

var playerDetails = {
  userId: undefined,
  player: undefined,
  userIdSocket: undefined,
  roomId: 'SMU2022',
  isRoomOwner: false
}

var player1, player2, player3, player4 = undefined;
var cursors = undefined;

// Create scene
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.addFile(new WebFontFile(this.load, 'Press Start 2P'));

    this.load.audio("backgroundMusic", audio.runGameMusic);

    this.load.audio("jumpSound1", audio.jumpSound1);
    this.load.audio("jumpSound2", audio.jumpSound2);
    this.load.audio("jumpSound3", audio.jumpSound3);

    this.load.image("ground", images.ground);

    this.load.image("skyBackground", images.skyBackground);
    this.load.image("lowCloud", images.lowCloud);
    this.load.image("yggdrasil", images.yggdrasil);
    this.load.image("montainTips", images.montainTips);
    this.load.image("highClouds", images.highClouds);

    this.load.spritesheet("playerRun", images.playerRun, {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("playerJump", images.playerJump, {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create( option ) {
    // Define canvas
    this.gameWidth = 1280;
    this.gameHeight = 640;

    // Adding music
    this.backgroundMusic = this.sound.add("backgroundMusic", {
      volume: 0.2,
      loop: true,
    });

    // Initiating music
    this.backgroundMusic.play();

    // Adding jump sounds
    this.jumpSound1 = this.sound.add("jumpSound1", {
      volume: 0.3,
    });

    this.jumpSound2 = this.sound.add("jumpSound2", {
      volume: 0.3,
    });

    this.jumpSound3 = this.sound.add("jumpSound3", {
      volume: 0.3,
    });

    // Creating array of jump sounds to random select
    this.jumpSound = [this.jumpSound1, this.jumpSound2, this.jumpSound3];

    // Adding static background
    this.add.image(0, 0, "skyBackground").setOrigin(0, 0);
    this.add.image(0, 0, "yggdrasil").setOrigin(0, 0);

    // Adding background parallax effect
    this.lowCloudBackground = this.add
      .tileSprite(0, 0, this.gameWidth, this.gameHeight, "lowCloud")
      .setOrigin(0, 0);

    this.montainTipsBackground = this.add
      .tileSprite(0, 0, this.gameWidth, this.gameHeight, "montainTips")
      .setOrigin(0, 0);

    this.highCloudsBackground = this.add
      .tileSprite(0, 0, this.gameWidth, this.gameHeight, "highClouds")
      .setOrigin(0, 0);

    if(option == "singleplayer") {
      // Creating groups for the ground
      this.groundGroup = this.add.group({
        removeCallback: (ground) => {
          ground.scene.groundPool.add(ground);
        },
      });

      this.groundPool = this.add.group({
        removeCallback: (ground) => {
          ground.scene.groundGroup.add(ground);
        },
      });

      this.addGround(this.gameWidth, this.gameWidth / 2);

      player1 = this.physics.add
        .sprite(640, 360, "playerRun")
        .setScale(2)
        .setBounce(0.05)
        .setGravityY(600);

      this.physics.add.collider(player1, this.groundGroup);

      this.input.on("pointerdown", this.jump, this);

      this.anims.create({
        key: "run",
        frameRate: 15,
        repeat: -1,
        frames: this.anims.generateFrameNumbers("playerRun", {
          start: 1,
          end: 6,
        }),
      });

      this.anims.create({
        key: "jump",
        frameRate: 8,
        repeat: -1,
        frames: this.anims.generateFrameNumbers("playerJump", {
          start: 1,
          end: 8,
        }),
      });

      //
      // ----------
      // Add the score text
      //
      this.score = 0;
      this.scoreText = this.add
        .text(0, 0, "00000", {
          fill: "535353",
          fontFamily: '"Press Start 2P"',
          fontSize: "900 35px",
          resolution: 5,
        })
        .setOrigin(0, 0);
      //
      //-------------
      // Calling the function
      //
      this.handleScore();
    } else {

      this.socket = io();
      socket = this.socket;

      playerDetails.userId = makeid(5);

      socket.emit('join', playerDetails)

      socket.on('room-created', async (response, playerNum) => {
        console.log(`Room was created by ${response.player_details.userId}: SocketId:${response.player_details.userIdSocket} Call:${response.call} - Response:${response.response} - ${response.code}`);
        playerDetails.userIdSocket = response.player_details.userIdSocket;
        playerDetails.isRoomOwner = response.player_details.isRoomOwner;
        playerDetails.player = playerNum;

        navigator.mediaDevices
          .getUserMedia({ video: false, audio: true })
          .then((stream) => {
            midias = stream;
          })
          .catch((error) => console.log(error));
      })

      socket.on('room-joined', async (response, playerNum) => {
        console.log(`Room of was joined: Call: SocketId:${response.player_details.userIdSocket} Call:${response.call} - Response:${response.response} - ${response.code}`);
        playerDetails.userIdSocket = response.player_details.userIdSocket;
        playerDetails.isRoomOwner = response.player_details.isRoomOwner;
        playerDetails.player = playerNum;

        navigator.mediaDevices
          .getUserMedia({ video: false, audio: true })
          .then((stream) => {
            midias = stream;
            localConnection = new RTCPeerConnection(ice_servers);
            midias
              .getTracks()
              .forEach((track) => localConnection.addTrack(track, midias));
            localConnection.onicecandidate = ({ candidate }) => {
              candidate && socket.emit("candidate", playerDetails.roomId, candidate); //
            };
            console.log(midias);
            localConnection.ontrack = ({ streams: [midias] }) => {
              audioOutput.srcObject = midias;
          };
          localConnection
            .createOffer()
            .then((offer) => localConnection.setLocalDescription(offer))
            .then(() => {
              socket.emit("offer", playerDetails.roomId, localConnection.localDescription);
            });
        }).catch((error) => console.log(error));

      })

      socket.on('full-room', (response) => {
        console.log(`Room was Full: SocketId:${response.player_details.userIdSocket} Call:${response.call} - Response:${response.response} - ${response.code}`);
        alert("Room is Full, try another time.");
        location.reload();
      });
      
      //Desconnection trigger
      var FKey = this.input.keyboard.addKey("F");
      FKey.on("down", () => {
        socket.emit('bye', playerDetails);
        location.reload();
      })
      

      socket.on('leave-room', async (response) => {
        console.log(`User ${response.response.player_details.userId} Room left: Call:${response.response.call} - Response:${response.response.response} - ${response.response.code}`)
      
        if(response.nisRoomOwner == playerDetails.userId){
          playerDetails.isRoomOwner = true
        }
      
      })

      socket.on('ack-bye', async () => {
        console.log('Socket event callback: ack-bye')
        loginDetails.isRoomCreator = false
      })

      socket.on("offer", (room, description) => {
        remoteConnection = new RTCPeerConnection(ice_servers);
        midias
          .getTracks()
          .forEach((track) => remoteConnection.addTrack(track, midias));
        remoteConnection.onicecandidate = ({ candidate }) => {
          candidate && socket.emit("candidate", room, candidate);
        };
        remoteConnection.ontrack = ({ streams: [midias] }) => {
          audioOutput.srcObject = midias;
        };
        remoteConnection
          .setRemoteDescription(description)
          .then(() => remoteConnection.createAnswer())
          .then((answer) => remoteConnection.setLocalDescription(answer))
          .then(() => {
            socket.emit("answer", room, remoteConnection.localDescription);
          });
      });

      socket.on("candidate", (candidate) => {
        const conn = localConnection || remoteConnection;
        conn.addIceCandidate(new RTCIceCandidate(candidate));
      });

      socket.on("answer", (description) => {
        localConnection.setRemoteDescription(description);
      });

      socket.on("startGame", () =>{
        console.log("Minimum Required Players in room, starting game Now.");
        start = true;
        // Creating groups for the ground
        this.groundGroup = this.add.group({
          removeCallback: (ground) => {
            ground.scene.groundPool.add(ground);
          },
        });

        this.groundPool = this.add.group({
          removeCallback: (ground) => {
            ground.scene.groundGroup.add(ground);
          },
        });

        this.addGround(this.gameWidth, this.gameWidth / 2);

        if(playerDetails.player == 1)
        {
          player1 = this.physics.add
            .sprite(640, 405, "playerRun")
            .setScale(2)
            .setBounce(0.05)
            .setGravityY(600);
        
          player2 = this.physics.add
              .sprite(740, 405, "playerRun")
              .setScale(2)
              .setBounce(0.05)
              .setGravityY(false);

          player3 = this.physics.add
              .sprite(540, 405, "playerRun")
              .setScale(2)
              .setBounce(0.05)
              .setGravityY(false);  

          player4 = this.physics.add
              .sprite(840, 405, "playerRun")
              .setScale(2)
              .setBounce(0.05)
              .setGravityY(false);

          cursors = this.input.keyboard.createCursorKeys()  
          
          this.physics.add.collider(player1, this.groundGroup);
        }

        if(playerDetails.player == 2)
        {
          player1 = this.physics.add
            .sprite(640, 405, "playerRun")
            .setScale(2)
            .setBounce(0.05)
            .setGravityY(false);
        
          player2 = this.physics.add
              .sprite(740, 405, "playerRun")
              .setScale(2)
              .setBounce(0.05)
              .setGravityY(600);

          player3 = this.physics.add
              .sprite(540, 405, "playerRun")
              .setScale(2)
              .setBounce(0.05)
              .setGravityY(false);  

          player4 = this.physics.add
              .sprite(840, 410, "playerRun")
              .setScale(2)
              .setBounce(0.05)
              .setGravityY(false);

          cursors = this.input.keyboard.createCursorKeys()  
          
          this.physics.add.collider(player2, this.groundGroup);
        }

        if(playerDetails.player == 3)
        {
          player1 = this.physics.add
            .sprite(640, 405, "playerRun")
            .setScale(2)
            .setBounce(0.05)
            .setGravityY(false);
        
          player2 = this.physics.add
              .sprite(740, 405, "playerRun")
              .setScale(2)
              .setBounce(0.05)
              .setGravityY(false);

          player3 = this.physics.add
              .sprite(540, 405, "playerRun")
              .setScale(2)
              .setBounce(0.05)
              .setGravityY(600);  

          player4 = this.physics.add
              .sprite(840, 405, "playerRun")
              .setScale(2)
              .setBounce(0.05)
              .setGravityY(false);

          cursors = this.input.keyboard.createCursorKeys()  
          
          this.physics.add.collider(player3, this.groundGroup);
        }

        if(playerDetails.player == 4)
        {
          player1 = this.physics.add
            .sprite(640, 405, "playerRun")
            .setScale(2)
            .setBounce(0.05)
            .setGravityY(false);
        
          player2 = this.physics.add
              .sprite(740, 405, "playerRun")
              .setScale(2)
              .setBounce(0.05)
              .setGravityY(false);

          player3 = this.physics.add
              .sprite(540, 405, "playerRun")
              .setScale(2)
              .setBounce(0.05)
              .setGravityY(false);  

          player4 = this.physics.add
              .sprite(840, 405, "playerRun")
              .setScale(2)
              .setBounce(0.05)
              .setGravityY(600);

          cursors = this.input.keyboard.createCursorKeys()  
          
          this.physics.add.collider(player4, this.groundGroup);
        }
       
        this.anims.create({
          key: "run",
          frameRate: 15,
          repeat: -1,
          frames: this.anims.generateFrameNumbers("playerRun", {
            start: 1,
            end: 6,
          }),
        });

        this.anims.create({
          key: "jump",
          frameRate: 8,
          repeat: -1,
          frames: this.anims.generateFrameNumbers("playerJump", {
            start: 1,
            end: 8,
          }),
        });

        // ----------
        // Add the score text
        this.score = 0;
        this.scoreText = this.add
          .text(0, 0, "00000", {
            fill: "535353",
            fontFamily: '"Press Start 2P"',
            fontSize: "900 35px",
            resolution: 5,
          })
          .setOrigin(0, 0);
        
        //-------------
        // Calling the function
        this.handleScore(); 

      });
    
      socket.on("playerDraw", ({ who, frame, x, y }) => {
        if (who === 1) {
          player1.setFrame(frame);
          player1.x = x;
          player1.y = y;
        } 
        if ( who === 2) {
          player2.setFrame(frame);
          player2.x = x;
          player2.y = y;
        }
        if ( who === 3) {
          player3.setFrame(frame);
          player3.x = x;
          player3.y = y;
        }
        if ( who === 4) {
          player4.setFrame(frame);
          player4.x = x;
          player.y = y;
        }
      });
    }
  }
  
  // Increase the score over the time
  handleScore() {
    this.time.addEvent({
      delay: 1000 / 10,
      loop: true,
      callbackScope: this,
      callback: () => {
        this.score++;

        const score = Array.from(String(this.score), Number);

        for (let i = 0; i < 5 - String(this.score).length; i++) {
          score.unshift(0);
        }
        this.scoreText.setText(score.join(""));
      },
    });
  }

  jump() {
    if (player1.body.touching.down) {
      const randomIndex = Math.floor(Math.random() * 3);

      this.jumpSound[randomIndex].play();

      player1.setVelocityY(5000000);
    }
  }

  addGround(groundWidth, posX) {
    let ground;

    if (this.groundPool.getLength()) {
      ground = this.groundPool.getFirst();

      ground.x = posX;

      ground.active = true;
      ground.visible = true;

      this.groundPool.remove(ground);
    } else {
      ground = this.physics.add.sprite(posX, 600, "ground");

      ground.setImmovable(true);
      ground.setVelocityX(-200);

      this.groundGroup.add(ground);
    }

    ground.displayWidth = groundWidth;

    this.nextGroundDistance = Phaser.Math.Between(100, 350);
  }

  update() {
    if(start == true)
    {
      //verfica se o player morreu
      if (player1.y > 720 && playerDetails.player == 1) {
        socket.emit('bye', playerDetails);
        this.scene.start("EndGameScene");
        this.backgroundMusic.stop();
      }

      if (player2.y > 720 && playerDetails.player == 2) {
        socket.emit('bye', playerDetails);
        this.scene.start("EndGameScene");
        this.backgroundMusic.stop();
      }

      if (player3.y > 720 && playerDetails.player == 3) {
        socket.emit('bye', playerDetails);
        this.scene.start("EndGameScene");
        this.backgroundMusic.stop();
      }

      if (player4.y > 720 && playerDetails.player == 4) {
        socket.emit('bye', playerDetails);
        this.scene.start("EndGameScene");
        this.backgroundMusic.stop();
      }

      //verfica se o movimento de cada player
      if(playerDetails.player == 1)
      {
        if(cursors.space.isDown){
          const randomIndex = Math.floor(Math.random() * 3);
          this.jumpSound[randomIndex].play();

          player1.setVelocityY(5000000);
          player1.anims.play("jump", true);
        } else {
          player1.anims.play("run", true);
        }
        
        player1.x = this.gameHeight;
        socket.emit("playerState", {
          who: 1,
          frame: player1.anims.getFrameName(),
          x: this.gameHeight,
          y: player1.y
        });
      }  

      if(playerDetails.player == 2)
      {
        if(cursors.space.isDown){
          const randomIndex = Math.floor(Math.random() * 3);
          this.jumpSound[randomIndex].play();

          player2.setVelocityY(5000000);
          player2.anims.play("jump", true);
        } else {
          player2.anims.play("run", true);
        }
        player2.x = this.gameHeight + 100;
        socket.emit("playerState", {
          who: 2,
          frame: player2.anims.getFrameName(),
          x: this.gameHeight + 100,
          y: player2.y
        });
      }

      if(playerDetails.player == 3)
      {
        if(cursors.space.isDown){
          const randomIndex = Math.floor(Math.random() * 3);
          this.jumpSound[randomIndex].play();

          player3.setVelocityY(5000000);
          player3.anims.play("jump", true);
        } else {
          player3.anims.play("run", true);
        } 
        player3.x = this.gameHeight - 100;
        socket.emit("playerState", {
          who: 3,
          frame: player3.anims.getFrameName(),
          x: this.gameHeight - 100,
          y: player3.y
        });
      }

      if(playerDetails.player == 4)
      {
        if(cursors.space.isDown){
          const randomIndex = Math.floor(Math.random() * 3);
          this.jumpSound[randomIndex].play();

          player4.setVelocityY(5000000);
          player4.anims.play("jump", true);
        } else {
          player4.anims.play("run", true);
        }
        player4.x = this.gameHeight + 200;
        socket.emit("playerState", {
          who: 4,
          frame: player4.anims.getFrameName(),
          x: this.gameHeight + 200,
          y: player4.y
        });
      }


      let minDistance = this.gameWidth;

      this.groundGroup.getChildren().forEach((ground) => {
        let groundDistance = this.gameWidth - ground.x - ground.displayWidth / 2;

        minDistance = Math.min(minDistance, groundDistance);

        if (ground.x < -ground.displayWidth / 2) {
          this.groundGroup.killAndHide(ground);
          this.groundGroup.remove(ground);
        }
      }, this);

      // if (minDistance > this.nextGroundDistance) {
      //   // if(playerDetails.player == 1)
      //   // {
      //   //   let nextGroundWidth = Phaser.Math.Between(100, 350);
      //   //   //this.addGround(nextGroundWidth, this.gameWidth + nextGroundWidth / 2);
      //   //   groundDetails = {
      //   //     nextGroundWidth: nextGroundWidth,
      //   //     posX: this.gameWidth + nextGroundWidth / 2,
      //   //   }
      //   //   socket.emit("gameState", groundDetails);
      //   // }
      // }

      // socket.on("drawGame", (groundDetails) => {
      //   this.addGround(groundDetails.nextGroundWidth, groundDetails.posX);
      // });

      this.addGround(this.gameWidth, this.gameWidth / 2);

      // Parallax
      this.lowCloudBackground.tilePositionX += 0.15;
      this.montainTipsBackground.tilePositionX += 0.1;
      this.highCloudsBackground.tilePositionX += 0.2;
    }
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

export default GameScene;
