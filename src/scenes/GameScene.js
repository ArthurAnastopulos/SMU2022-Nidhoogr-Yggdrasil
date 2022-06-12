// Import Phaser module
import Phaser from "phaser";
import { io } from "socket.io-client";
// Importing assets
import * as images from "../assets/images";
import * as audio from "../assets/audio";
import WebFontFile from '../assets/font/WebFontFile'

const audio = document.querySelector("audio");

var ice_servers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};
var localConnection;
var remoteConnection;
var midias;
var jogador;

var playerDetails = {
  userId: undefined,
  userIdSocket: undefined,
  roomId: 'SMU2022',
  isRoomOwner: false
}

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

      this.player = this.physics.add
        .sprite(640, 360, "playerRun")
        .setScale(2)
        .setBounce(0.05)
        .setGravityY(600);

      this.physics.add.collider(this.player, this.groundGroup);

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
      var socket = this.socket;

      playerDetails.userId = makeid(5);

      socket.emit('join', playerDetails)

      socket.on('room-created', async (response) => {
        console.log(`Room was created by ${response.player_details.userId}: SocketId:${response.player_details.userIdSocket} Call:${response.call} - Response:${response.response} - ${response.code}`);
        playerDetails.userIdSocket = response.player_details.userIdSocket;
        playerDetails.isRoomOwner = response.player_details.isRoomOwner;
      })

      socket.on('room-joined', async (response) => {
        console.log(`Room of was joined: Call: SocketId:${response.player_details.userIdSocket} Call:${response.call} - Response:${response.response} - ${response.code}`);
        playerDetails.userIdSocket = response.player_details.userIdSocket;
        playerDetails.isRoomOwner = response.player_details.isRoomOwner;

      })

      socket.on('full-room', (response) => {
        console.log(`Room was Full: SocketId:${response.player_details.userIdSocket} Call:${response.call} - Response:${response.response} - ${response.code}`);
        alert("Room is Full, try another time.");
        location.reload();
      });
      
      socket.on("clientes", (jogadores) => {
        if (jogadores[0].player_details.socketId=== socket.id) {
          // Define jogador como o primeiro
          jogador = 1;

          navigator.mediaDevices
            .getUserMedia({audio: true })
            .then((stream) => {
              midias = stream;
            })
            .catch((error) => console.log(error));
        } else if (jogadores[1].player_details.socketId === socket.id) {
          // Define jogador como o segundo
          jogador = 2;
          navigator.mediaDevices
            .getUserMedia({audio: true })
            .then((stream) => {
              midias = stream;
              localConnection = new RTCPeerConnection(ice_servers);
              midias
                .getTracks()
                .forEach((track) => localConnection.addTrack(track, midias));
              localConnection.onicecandidate = ({ candidate }) => {
                candidate &&
                  socket.emit("candidate", jogadores[0], candidate);
                console.log(`1 jogador candidate: ${jogadores[0]} - Candiate:${candidate}`)
              };
              console.log(midias);
              localConnection.ontrack = ({ streams: [midias] }) => {
                audio.srcObject = midias;
              };
              localConnection
                .createOffer()
                .then((offer) => localConnection.setLocalDescription(offer))
                .then(() => {
                  socket.emit(
                    "offer",
                    jogadores[0],
                    localConnection.localDescription
                  );
                });
            })
            .catch((error) => console.log(error));
        }
        // else if (jogadores[2].player_details.socketId === socket.id) {
        //   // Define jogador como o terceiro
        //   jogador = 3;
        //   navigator.mediaDevices
        //     .getUserMedia({audio: true })
        //     .then((stream) => {
        //       midias = stream;
        //       localConnection = new RTCPeerConnection(ice_servers);
        //       midias
        //         .getTracks()
        //         .forEach((track) => localConnection.addTrack(track, midias));
        //       localConnection.onicecandidate = ({ candidate }) => {
        //         candidate &&
        //           socket.emit("candidate", jogadores[2], candidate);
        
        //       };
        //       console.log(midias);
        //       localConnection.ontrack = ({ streams: [midias] }) => {
        //         audio.srcObject = midias;
        //       };
        //       localConnection
        //         .createOffer()
        //         .then((offer) => localConnection.setLocalDescription(offer))
        //         .then(() => {
        //           socket.emit(
        //             "offer",
        //             jogadores[2],
        //             localConnection.localDescription
        //           );
        //         });
        //     })
        //     .catch((error) => console.log(error));
        // }
        // else{
        //   // Define jogador como o quarto
        //   jogador = 4;
        //   navigator.mediaDevices
        //     .getUserMedia({audio: true })
        //     .then((stream) => {
        //       midias = stream;
        //       localConnection = new RTCPeerConnection(ice_servers);
        //       midias
        //         .getTracks()
        //         .forEach((track) => localConnection.addTrack(track, midias));
        //       localConnection.onicecandidate = ({ candidate }) => {
        //         candidate &&
        //           socket.emit("candidate", jogadores[3], candidate);
        //       };
        //       console.log(midias);
        //       localConnection.ontrack = ({ streams: [midias] }) => {
        //         audio.srcObject = midias;
        //       };
        //       localConnection
        //         .createOffer()
        //         .then((offer) => localConnection.setLocalDescription(offer))
        //         .then(() => {
        //           socket.emit(
        //             "offer",
        //             jogadores[3],
        //             localConnection.localDescription
        //           );
        //         });
        //     })
        //     .catch((error) => console.log(error));
        // }
        // Os dois jogadores estão conectados
        console.log(jogadores);
        if (jogadores[0] !== undefined && jogadores[1] !== undefined) {
          // Contagem regressiva em segundos (1.000 milissegundos)
          timer = 60;
          timedEvent = time.addEvent({
            delay: 1000,
            callback: countdown,
            callbackScope: this,
            loop: true,
          });
        }
      });
      //ofertas
      socket.on("offer", (socketId, description) => {    
        remoteConnection = new RTCPeerConnection(ice_servers);
        midias
          .getTracks()
          .forEach((track) => remoteConnection.addTrack(track, midias));
        remoteConnection.onicecandidate = ({ candidate }) => {
          candidate && socket.emit("candidate", socketId, candidate);
          console.log(`Offer: SocketId:${socketId} Candidate:${candidate} - Description:${description}`)
        };
        remoteConnection.ontrack = ({ streams: [midias] }) => {
          audio.srcObject = midias;
        };
        remoteConnection
          .setRemoteDescription(description)
          .then(() => remoteConnection.createAnswer())
          .then((answer) => remoteConnection.setLocalDescription(answer))
          .then(() => {
          console.log(`Answer: SocketId:${socketId} localDescription:${remoteConnection.localDescription}- Description:${description}`)  
          socket.emit("answer", socketId, remoteConnection.localDescription);
          
          });
  
        console.log(`An offer has been sent: Description:${description}`)
        socket.to(socketId).emit("offer", socket.id, description);
      });

      socket.on("answer", (description) => {
        localConnection.setRemoteDescription(description);
        console.log(`An offer has been answered: Description:${description}`)
        // socket.to(socketId).emit("answer", description);
      });

      socket.on("candidate", (candidate) => {
        const conn = localConnection || remoteConnection;
        conn.addIceCandidate(new RTCIceCandidate(candidate));
        // console.log(`An offer has been applied: Description:${description}`)
        // console.log(`An offer wants to apply: Description:${description}`)
        // socket.to(socketId).emit("candidate", signal);
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

      // // Creating groups for the ground
      // this.groundGroup = this.add.group({
      //   removeCallback: (ground) => {
      //     ground.scene.groundPool.add(ground);
      //   },
      // });

      // this.groundPool = this.add.group({
      //   removeCallback: (ground) => {
      //     ground.scene.groundGroup.add(ground);
      //   },
      // });

      // this.addGround(this.gameWidth, this.gameWidth / 2);

      // this.player = this.physics.add
      //   .sprite(640, 360, "playerRun")
      //   .setScale(2)
      //   .setBounce(0.05)
      //   .setGravityY(600);

      // this.physics.add.collider(this.player, this.groundGroup);

      // this.input.on("pointerdown", this.jump, this);

      // this.anims.create({
      //   key: "run",
      //   frameRate: 15,
      //   repeat: -1,
      //   frames: this.anims.generateFrameNumbers("playerRun", {
      //     start: 1,
      //     end: 6,
      //   }),
      // });

      // this.anims.create({
      //   key: "jump",
      //   frameRate: 8,
      //   repeat: -1,
      //   frames: this.anims.generateFrameNumbers("playerJump", {
      //     start: 1,
      //     end: 8,
      //   }),
      // });

      //
      // ----------
      // Add the score text
      //
      // this.score = 0;
      // this.scoreText = this.add
      //   .text(0, 0, "00000", {
      //     fill: "535353",
      //     fontFamily: '"Press Start 2P"',
      //     fontSize: "900 35px",
      //     resolution: 5,
      //   })
      //   .setOrigin(0, 0);
      // //
      // //-------------
      // // Calling the function
      // //
      // this.handleScore();
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
    if (this.player.body.touching.down) {
      const randomIndex = Math.floor(Math.random() * 3);

      this.jumpSound[randomIndex].play();

      this.player.setVelocityY(5000000);
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
    if (this.player.y > 720) {
      this.scene.start("EndGameScene");
      this.backgroundMusic.stop();
    }

    if (!this.player.body.touching.down) {
      this.player.anims.play("jump", true);
    } else {
      this.player.anims.play("run", true);
    }

    this.player.x = this.gameHeight;

    let minDistance = this.gameWidth;

    this.groundGroup.getChildren().forEach((ground) => {
      let groundDistance = this.gameWidth - ground.x - ground.displayWidth / 2;

      minDistance = Math.min(minDistance, groundDistance);

      if (ground.x < -ground.displayWidth / 2) {
        this.groundGroup.killAndHide(ground);
        this.groundGroup.remove(ground);
      }
    }, this);

    if (minDistance > this.nextGroundDistance) {
      let nextGroundWidth = Phaser.Math.Between(100, 350);

      this.addGround(nextGroundWidth, this.gameWidth + nextGroundWidth / 2);
    }


    // Parallax
    this.lowCloudBackground.tilePositionX += 0.15;
    this.montainTipsBackground.tilePositionX += 0.1;
    this.highCloudsBackground.tilePositionX += 0.2;
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