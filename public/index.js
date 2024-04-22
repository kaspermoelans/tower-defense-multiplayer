const canvasEl = document.getElementById("canvas");
canvasEl.width = window.innerWidth;
canvasEl.height = window.innerHeight;
const canvas = canvasEl.getContext("2d");

const socket = io(`ws://localhost:5555`);

const santaImage = new Image();
santaImage.src = "/img/santa.png";

const normalTower1Image = new Image();
normalTower1Image.src = "/img/normalTower1.png";
const normalTower2Image = new Image();
normalTower2Image.src = "/img/normalTower2.png";
const normalTower3Image = new Image();
normalTower3Image.src = "/img/normalTower3.png";

const crossbowTower1Image = new Image();
crossbowTower1Image.src = "/img/crossbowTower1.png";
const crossbowTower2Image = new Image();
crossbowTower2Image.src = "/img/crossbowTower2.png";
const crossbowTower3Image = new Image();
crossbowTower3Image.src = "/img/crossbowTower3.png";

const magicTower1Image = new Image();
magicTower1Image.src = "/img/magicTower1.png";
const magicTower2Image = new Image();
magicTower2Image.src = "/img/magicTower2.png";
const magicTower3Image = new Image();
magicTower3Image.src = "/img/magicTower3.png";

const slimeTower1Image = new Image();
slimeTower1Image.src = "/img/slimeTower1.png";
const slimeTower2Image = new Image();
slimeTower2Image.src = "/img/slimeTower2.png";
const slimeTower3Image = new Image();
slimeTower3Image.src = "/img/slimeTower3.png";

const electricTower1Image = new Image();
electricTower1Image.src = "/img/electricTower1.png";
const electricTower2Image = new Image();
electricTower2Image.src = "/img/electricTower2.png";
const electricTower3Image = new Image();
electricTower3Image.src = "/img/electricTower3.png";

const slingshotTower1Image = new Image();
slingshotTower1Image.src = "/img/slingshotTower1.png";
const slingshotTower2Image = new Image();
slingshotTower2Image.src = "/img/slingshotTower2.png";
const slingshotTower3Image = new Image();
slingshotTower3Image.src = "/img/slingshotTower3.png";

const crystalTower1Image = new Image();
crystalTower1Image.src = "/img/crystalTower1.png";
const crystalTower2Image = new Image();
crystalTower2Image.src = "/img/crystalTower2.png";
const crystalTower3Image = new Image();
crystalTower3Image.src = "/img/crystalTower3.png";

let players = []
let snowballs = []
let towers =  []
let enemies = []

let selectedTower = 'normal'

const TILE_SIZE = 64;
const SNOWBALL_RADIUS = 5

const TOWER_WIDTH = 64
const TOWER_HEIGHT = 128

const PLAYER_SIZE = 32

socket.on("connect", () => {
  console.log("connected");
});

socket.on('players', (serverPlayers) => {
    players = serverPlayers
})

socket.on('snowballs', (serverSnowballs) => {
    snowballs = serverSnowballs
})

socket.on('towers', (serverTowers) => {
  towers = serverTowers
})

socket.on('enemies', (serverEnemies) => {
  enemies = serverEnemies
})

socket.on('gold', (values) => {
  document.querySelector('#gold').innerHTML = Math.floor(values.gold)
  document.querySelector('#damageMultiplier').innerHTML = Math.floor(values.damageMultiplier)
}) 

let inputs = {
  userMouse: {x: undefined, y: undefined},
  serverMouse: {x: 0, y: 0},
  up: false,
  down: false,
  left: false,
  right: false,
  remove: false
}

window.addEventListener('keydown', (e) => {
    console.log(e.key)
    if (e.key === 'z') {
        inputs['up'] = true
    } else if (e.key === 's') {
        inputs['down'] = true
    } else if (e.key === 'q') {
        inputs['left'] = true
    } else if (e.key === 'd') {
        inputs['right'] = true
    } else if (e.key === 'r') {
      inputs['remove'] = true
    } else if (e.key === '1') {
      selectedTower = 'normal'
    } else if (e.key === '2') {
      selectedTower = 'crossbow'
    } else if (e.key === '3') {
      selectedTower = 'magic'
    } else if (e.key === '4') {
      selectedTower = 'slime'
    } else if (e.key === '5') {
      selectedTower = 'electric'
    } else if (e.key === '6') {
      selectedTower = 'slingshot'
    } else if (e.key === '7') {
      selectedTower = 'crystal'
    } else if (e.key === 'u') {
      socket.emit('upgrade', socket.id)
    } else if (e.key === '0') {
      socket.emit('increase damage multiplier', socket.id)
    }
    socket.emit('inputs', inputs)
})

window.addEventListener('keyup', (e) => {
    console.log(e.key)
    if (e.key === 'z') {
        inputs['up'] = false
    } else if (e.key === 's') {
        inputs['down'] = false
    } else if (e.key === 'q') {
        inputs['left'] = false
    } else if (e.key === 'd') {
        inputs['right'] = false
    } else if (e.key === 'r') {
      inputs['remove'] = false
    }
    socket.emit('inputs', inputs)
})

window.addEventListener('click', (e) => {
  const myPlayer = players.find((player) => player.id === socket.id)

  let cameraX = 0
  let cameraY = 0

  if (myPlayer) {
    cameraX = parseInt(myPlayer.x - canvasEl.width / 2)
    cameraY = parseInt(myPlayer.y - canvasEl.height / 2)
  }

  socket.emit('click', {x: e.clientX + cameraX, y: e.clientY + cameraY, selectedTower: selectedTower})
})

window.addEventListener('mousemove', (e) => {
  inputs.userMouse.x = e.clientX
  inputs.userMouse.y = e.clientY

  const myPlayer = players.find((player) => player.id === socket.id)

  let cameraX = 0
  let cameraY = 0

  if (myPlayer) {
    cameraX = parseInt(myPlayer.x - canvasEl.width / 2)
    cameraY = parseInt(myPlayer.y - canvasEl.height / 2)
  }

  inputs.serverMouse.x = e.clientX + cameraX
  inputs.serverMouse.y = e.clientY + cameraY
  socket.emit('inputs', inputs)
})

function loop() {
  canvas.clearRect(0, 0, canvasEl.width, canvasEl.height);

  canvas.fillStyle = "green"
  canvas.fillRect(0, 0, canvasEl.width, canvasEl.height)

  const myPlayer = players.find((player) => player.id === socket.id)

  let cameraX = 0
  let cameraY = 0

  if (myPlayer) {
    cameraX = parseInt(myPlayer.x - canvasEl.width / 2)
    cameraY = parseInt(myPlayer.y - canvasEl.height / 2)
  }

  canvas.fillStyle = 'yellow'
  canvas.fillRect(0 - cameraX, 0 - cameraY , 64, 128)

  for (const tower of towers) {
    if (tower.type === 'normal') {
      if (tower.level === 1) {
        canvas.drawImage(normalTower1Image, tower.x - cameraX, tower.y - cameraY)
      } else if (tower.level === 2) {
        canvas.drawImage(normalTower2Image, tower.x - cameraX, tower.y - cameraY)
      } else if (tower.level === 3) {
        canvas.drawImage(normalTower3Image, tower.x - cameraX, tower.y - cameraY)
      }
    } else if (tower.type === 'crossbow') {
      if (tower.level === 1) {
        canvas.drawImage(crossbowTower1Image, tower.x - cameraX, tower.y - cameraY)
      } else if (tower.level === 2) {
        canvas.drawImage(crossbowTower2Image, tower.x - cameraX, tower.y - cameraY)
      } else if (tower.level === 3) {
        canvas.drawImage(crossbowTower3Image, tower.x - cameraX, tower.y - cameraY)
      }
    } else if (tower.type === 'magic') {
      if (tower.level === 1) {
        canvas.drawImage(magicTower1Image, tower.x - cameraX, tower.y - cameraY)
      } else if (tower.level === 2) {
        canvas.drawImage(magicTower2Image, tower.x - cameraX, tower.y - cameraY)
      } else if (tower.level === 3) {
        canvas.drawImage(magicTower3Image, tower.x - cameraX, tower.y - cameraY)
      }
    } else if (tower.type === 'slime') {
      if (tower.level === 1) {
        canvas.drawImage(slimeTower1Image, tower.x - cameraX, tower.y - cameraY)
      } else if (tower.level === 2) {
        canvas.drawImage(slimeTower2Image, tower.x - cameraX, tower.y - cameraY)
      } else if (tower.level === 3) {
        canvas.drawImage(slimeTower3Image, tower.x - cameraX, tower.y - cameraY)
      }
    } else if (tower.type === 'electric') {
      if (tower.level === 1) {
        canvas.drawImage(electricTower1Image, tower.x - cameraX, tower.y - cameraY)
      } else if (tower.level === 2) {
        canvas.drawImage(electricTower2Image, tower.x - cameraX, tower.y - cameraY)
      } else if (tower.level === 3) {
        canvas.drawImage(electricTower3Image, tower.x - cameraX, tower.y - cameraY)
      }
    } else if (tower.type === 'slingshot') {
      if (tower.level === 1) {
        canvas.drawImage(slingshotTower1Image, tower.x - cameraX, tower.y - cameraY)
      } else if (tower.level === 2) {
        canvas.drawImage(slingshotTower2Image, tower.x - cameraX, tower.y - cameraY)
      } else if (tower.level === 3) {
        canvas.drawImage(slingshotTower3Image, tower.x - cameraX, tower.y - cameraY)
      }
    } else if (tower.type === 'crystal') {
      if (tower.level === 1) {
        canvas.drawImage(crystalTower1Image, tower.x - cameraX, tower.y - cameraY)
      } else if (tower.level === 2) {
        canvas.drawImage(crystalTower2Image, tower.x - cameraX, tower.y - cameraY)
      } else if (tower.level === 3) {
        canvas.drawImage(crystalTower3Image, tower.x - cameraX, tower.y - cameraY)
      }
    }

    if (tower.type === 'normal') {
      canvas.fillStyle = "rgba(150, 150, 150, 1)"
    } else if (tower.type === 'crossbow') {
      canvas.fillStyle = "rgba(230, 100, 0, 1)"
    } else if (tower.type === 'magic') {
      if (tower.level === 1) {
        canvas.fillStyle = "rgba(100, 20, 255, 1)"
      }
      if (tower.level === 2) {
        canvas.fillStyle = "rgba(200, 20, 255, 1)"
      }
      if (tower.level === 3) {
        canvas.fillStyle = "rgba(255, 20, 20, 1)"
      }
    } else if (tower.type === 'slime') {
      canvas.fillStyle = "rgba(0, 255, 0, 1)"
    } else if (tower.type === 'electric') {
      canvas.fillStyle = "rgba(250, 250, 0, 1)"
    } else if (tower.type === 'slingshot') {
      if (tower.level === 1) {
        canvas.fillStyle = "rgba(255, 0, 255, 1)"
      }
      if (tower.level === 2) {
        canvas.fillStyle = "rgba(0, 255, 0, 1)"
      }
      if (tower.level === 3) {
        canvas.fillStyle = "rgba(255, 180, 0, 1)"
      }
    } else if (tower.type === 'crystal') {
      if (tower.level === 1) {
        canvas.fillStyle = "rgba(20, 20, 255, 1)"
      }
      if (tower.level === 2) {
        canvas.fillStyle = "rgba(255, 180, 0, 1)"
      }
      if (tower.level === 3) {
        canvas.fillStyle = "rgba(20, 255, 20, 1)"
      }
    }

    for (const projectile of tower.projectiles) {
      canvas.beginPath()
      canvas.arc(projectile.x - cameraX, projectile.y - cameraY, 10, 0, 2 * Math.PI)
      canvas.fill()
    }
  }

  for (const snowball of snowballs) {
    canvas.fillStyle = '#FFFFFF'
    canvas.beginPath()
    canvas.arc(snowball.x - cameraX, snowball.y - cameraY, SNOWBALL_RADIUS, 0, 2 * Math.PI)
    canvas.fill()
  }

  if (inputs.userMouse.x !== undefined && inputs.userMouse.y !== undefined) {
    if (selectedTower === 'normal') {
      canvas.fillStyle = "rgba(150, 150, 150, 0.5)"
    } else if (selectedTower === 'fire') {
      canvas.fillStyle = "rgba(230, 20, 0, 0.5)"
    } else if (selectedTower === 'stone') {
      canvas.fillStyle = "rgba(200, 100, 0, 0.5)"
    }
    let i = true
    let x = inputs.userMouse.x + cameraX
    let y = inputs.userMouse.y + cameraY
    while (i) {
        if (x % TOWER_WIDTH !== 0) {
            x -= 1
        }
        if (y % TOWER_HEIGHT !== 0) {
            y -= 1
        }
        if (x % TOWER_WIDTH === 0 && y % TOWER_HEIGHT === 0) {
            i = false
        }
    }

    if (selectedTower === 'normal') {
      canvas.drawImage(normalTower1Image, x - cameraX, y - cameraY)
    } else if (selectedTower === 'crossbow') {
      canvas.drawImage(crossbowTower1Image, x - cameraX, y - cameraY)
    } else if (selectedTower === 'magic') {
      canvas.drawImage(magicTower1Image, x - cameraX, y - cameraY)
    } else if (selectedTower === 'slime') {
      canvas.drawImage(slimeTower1Image, x - cameraX, y - cameraY)
    } else if (selectedTower === 'electric') {
      canvas.drawImage(electricTower1Image, x - cameraX, y - cameraY)
    } else if (selectedTower === 'slingshot') {
      canvas.drawImage(slingshotTower1Image, x - cameraX, y - cameraY)
    } else if (selectedTower === 'crystal') {
      canvas.drawImage(crystalTower1Image, x - cameraX, y - cameraY)
    }
  }

  for (const enemy of enemies) {
    canvas.fillStyle = 'lightgreen'
    canvas.fillRect(enemy.x - cameraX, enemy.y - cameraY, TILE_SIZE, TILE_SIZE)
  }

  for (const player of players) {
    canvas.drawImage(santaImage, player.x - cameraX, player.y - cameraY)
  }

  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);
