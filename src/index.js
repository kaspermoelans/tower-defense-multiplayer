const express = require('express')
const { createServer } = require("http");
const { resolve } = require('path');
const { Server } = require("socket.io");

const app = express()
const httpServer = createServer(app);
const PORT = process.env.PORT || 5555;

const io = new Server(httpServer);

const { disconnect } = require('process');

const SPEED = 5
const SNOWBALL_SPEED = 11
const TICK_RATE = 30

const TOWER_WIDTH = 64
const TOWER_HEIGHT = 128

const PLAYER_SIZE = 32

const GOLD_PER_ENEMY = 1

let players = []
let snowballs = []
let towers = []
let enemies = []

const towerStatsLevel1 = [
    {
        type: 'normal',
        damage: 1,
        speed: 1000,
        timeRange: 3000,
        projectiles: [],
        countdown: 1000,
        projectileSpeed: 5,
        cost: 10
    },
    {
        type: 'crossbow',
        damage: 3,
        speed: 2000,
        timeRange: 5000,
        projectiles: [],
        countdown: 1000,
        projectileSpeed: 7,
        cost: 50
    },
    {
        type: 'magic',
        damage: 0.5,
        speed: 500,
        timeRange: 5000,
        projectiles: [],
        countdown: 500,
        projectileSpeed: 15,
        cost: 100
    },
    {
        type: 'slime',
        damage: 0.2,
        speed: 1000,
        timeRange: 3000,
        projectiles: [],
        countdown: 1000,
        projectileSpeed: 7,
        cost: 200   
    },
    {
        type: 'electric',
        damage: 1,
        speed: 250,
        timeRange: 1000,
        projectiles: [],
        countdown: 250,
        projectileSpeed: 15,
        cost: 400
    },
    {
        type: 'slingshot',
        damage: 10,
        speed: 3000,
        timeRange: 10000,
        projectiles: [],
        countdown: 3000,
        projectileSpeed: 40,
        cost: 800
    },
    {
        type: 'crystal',
        damage: 50,
        speed: 2000,
        timeRange: 1000,
        projectiles: [],
        countdown: 3000,
        projectileSpeed: 15,
        cost: 1600
    }
]

const towerStatsLevel2 = [
    {
        type: 'normal',
        damage: 1,
        speed: 500,
        timeRange: 3000,
        projectiles: [],
        countdown: 1000,
        projectileSpeed: 5,
        cost: 10
    },
    {
        type: 'crossbow',
        damage: 5,
        speed: 1750,
        timeRange: 5500,
        projectiles: [],
        countdown: 1000,
        projectileSpeed: 7,
        cost: 50
    },
    {
        type: 'magic',
        damage: 1,
        speed: 250,
        timeRange: 10000,
        projectiles: [],
        countdown: 250,
        projectileSpeed: 20,
        cost: 100
    },
    {
        type: 'slime',
        damage: 0.5,
        speed: 750,
        timeRange: 3000,
        projectiles: [],
        countdown: 750,
        projectileSpeed: 10,
        cost: 200   
    },
    {
        type: 'electric',
        damage: 2,
        speed: 125,
        timeRange: 1500,
        projectiles: [],
        countdown: 125,
        projectileSpeed: 20,
        cost: 400
    },
    {
        type: 'slingshot',
        damage: 20,
        speed: 2500,
        timeRange: 10000,
        projectiles: [],
        countdown: 2500,
        projectileSpeed: 50,
        cost: 800
    },
    {
        type: 'crystal',
        damage: 100,
        speed: 2000,
        timeRange: 1000,
        projectiles: [],
        countdown: 3000,
        projectileSpeed: 20,
        cost: 1600
    }
]

const towerStatsLevel3 = [
    {
        type: 'normal',
        damage: 1,
        speed: 250,
        timeRange: 3000,
        projectiles: [],
        countdown: 1000,
        projectileSpeed: 5,
        cost: 10
    },
    {
        type: 'crossbow',
        damage: 7,
        speed: 1500,
        timeRange: 6000,
        projectiles: [],
        countdown: 1000,
        projectileSpeed: 8,
        cost: 50
    },
    {
        type: 'magic',
        damage: 2,
        speed: 125,
        timeRange: 15000,
        projectiles: [],
        countdown: 250,
        projectileSpeed: 25,
        cost: 100
    },
    {
        type: 'slime',
        damage: 1,
        speed: 500,
        timeRange: 3000,
        projectiles: [],
        countdown: 500,
        projectileSpeed: 13,
        cost: 200   
    },
    {
        type: 'electric',
        damage: 3,
        speed: 75,
        timeRange: 2000,
        projectiles: [],
        countdown: 75,
        projectileSpeed: 25,
        cost: 200
    },
    {
        type: 'slingshot',
        damage: 20,
        speed: 2000,
        timeRange: 10000,
        projectiles: [],
        countdown: 2000,
        projectileSpeed: 65,
        cost: 800
    },
    {
        type: 'crystal',
        damage: 150,
        speed: 2000,
        timeRange: 1000,
        projectiles: [],
        countdown: 3000,
        projectileSpeed: 25,
        cost: 1600
    }
]

let damageMultiplier = 1
let damageMultiplierCost = 100

let gold = 10
let difficulty = {
    enemySpawnCount: 1,
    enemyHealth: 1
}
let waveCountdown = 1000

let spawnDistance = {
    minX: -500,
    maxX: 500,
    minY: -500,
    maxY: 500
}

const inputsMap = {}

function randomNumber(min, max) {
    // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function isColliding(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.h + rect1.y > rect2.y
    );
}

function isPlayerCollidingWithTowers(player) {
    for (const tower of towers) {
        if (isColliding({x: tower.x, y: tower.y, w: TOWER_WIDTH, h: TOWER_HEIGHT}, {x: player.x, y: player.y, w: PLAYER_SIZE, h: PLAYER_SIZE})) {
            return true
        }
    }
    return false
}

function tick(delta) {
    for (const player of players) {
        const inputs = inputsMap[player.id]
        const previousY = player.y
        const previousX = player.x

        if (inputs.up) {
            player.y -= SPEED
        } else if (inputs.down) {
            player.y += SPEED
        }

        if (isPlayerCollidingWithTowers(player)) {
            player.y = previousY
        }

        if (inputs.left) {
            player.x -= SPEED
        } else if (inputs.right) {
            player.x += SPEED
        }

        if (isPlayerCollidingWithTowers(player)) {
            player.x = previousX
        }

        if (inputs.remove && inputs.serverMouse.x !== undefined && inputs.serverMouse.y !== undefined) {
            let removed = undefined
            for (const tower of towers) {
                if (isColliding({x: inputs.serverMouse.x - 5, y: inputs.serverMouse.y - 5, w: 10, h: 10}, {x: tower.x, y: tower.y, w: TOWER_WIDTH, h: TOWER_HEIGHT})) {
                    towers = towers.filter(filterTower => filterTower !== tower)
                    gold += towerStatsLevel1.find(findTower => findTower.type === tower.type).cost * tower.level
                }
            }
        }
    }

    for (const snowball of snowballs) {
        snowball.x += Math.cos(snowball.angle) * SNOWBALL_SPEED
        snowball.y += Math.sin(snowball.angle) * SNOWBALL_SPEED
        snowball.timeLeft -= delta

        for (const player of players) {
            if (player.id === snowball.playerId) continue
            const distance = Math.sqrt((player.x + 8 - snowball.x) ** 2 * (player.y + 8 - snowball.y) ** 2)
            if (distance <= 8) {
                player.x = 0
                player.y = 0
                snowball.timeLeft = -1
                break
            }
        }
    }

    for (const tower of towers) {
        if (tower.countdown <= 0) {
            const min = {disctance: undefined, x: undefined, y: undefined, enemy: undefined}
            for (const enemy of enemies) {
                if (Math.abs(enemy.x - tower.x) + Math.abs(enemy.y - tower.y) < min.disctance || min.disctance === undefined) {
                    min.disctance = Math.abs(enemy.x - tower.x) + Math.abs(enemy.y - tower.y)
                    min.x = enemy.x - 32 - tower.x + TOWER_WIDTH / 2
                    min.y = enemy.y - 32 - tower.y + TOWER_HEIGHT / 4
                    min.enemy = enemy
                }
            }
            if (min.disctance < tower.projectileSpeed * (tower.timeRange / 1000 * TICK_RATE) && min.x !== undefined && min.y !== undefined && !min.inRange) {
                const angle = Math.atan2(min.y, min.x)
                tower.projectiles.push({x: tower.x + TOWER_WIDTH / 2, y: tower.y + TOWER_HEIGHT / 2, angle: angle, delete: true, target: {x: min.enemy.x, y: min.enemy.y}, timeRange: tower.timeRange})
            }
            tower.countdown = tower.speed
        } else {
            tower.countdown -= delta
        }

        for (const projectile of tower.projectiles) {
            projectile.x += Math.cos(projectile.angle) * tower.projectileSpeed
            projectile.y += Math.sin(projectile.angle) * tower.projectileSpeed

            for (const enemy of enemies) {
                if (enemy.health > 0 && isColliding({x: projectile.x, y: projectile.y, w: 10, h: 10}, {x: enemy.x, y: enemy.y, w: 64, h: 64})) {
                    enemy.health -= tower.damage * damageMultiplier
                    if (enemy.health <= 0) {
                        if (players.length === 0) {
                            gold += GOLD_PER_ENEMY / 2
                        } else {
                            gold += GOLD_PER_ENEMY
                        }
                    }
                    if (tower.type !== 'slime') {
                        projectile.timeRange = 0
                    }
                }
            }

            projectile.timeRange -= delta
        }
        tower.projectiles = tower.projectiles.filter(projectile => projectile.timeRange > 0)
    }

    for (const enemy of enemies) {
        const angle = Math.atan2(0 - enemy.y + 32, 0 - enemy.x + 32)
        enemy.x += Math.cos(angle) * 1
        enemy.y += Math.sin(angle) * 1

        if (isColliding({x: -16, y: -16, w: 64, h: 64}, {x: enemy.x, y: enemy.y, w: 64, h: 64})) {
            for (const player of players) {
                player.x = 16
                player.y = 16
            }

            snowballs = []
            towers = []
            enemies = []

            gold = 10
            difficulty = {
                enemySpawnCount: 1,
                enemyHealth: 1
            }
            waveCountdown = 1000

            spawnDistance = {
                minX: -500,
                maxX: 500,
                minY: -500,
                maxY: 500
            }
        }
    }

    enemies = enemies.filter(enemy => enemy.health > 0)

    snowballs = snowballs.filter(snowball => snowball.timeLeft >= 0)

    if (players.length === 0 && enemies.length > difficulty.enemySpawnCount / 2) {
        enemies = []
    }

    if (enemies.length <= 0) {
        if (waveCountdown <= 0) {
            if(players.length === 0) {
                for (x = 0; x < difficulty.enemySpawnCount / 2; x++) {
                    const health = difficulty.enemyHealth / 2
    
                    if (randomNumber(1, 4) === 1) {
                        enemies.push({
                            x: spawnDistance.minX,
                            y: randomNumber(spawnDistance.minY, spawnDistance.maxY),
                            health: health
                        })
                    } else if (randomNumber(2, 4) === 2) {
                        enemies.push({
                            x: spawnDistance.maxX,
                            y: randomNumber(spawnDistance.minY, spawnDistance.maxY),
                            health: health
                        })
                    } else if (randomNumber(3, 4) === 3) {
                        enemies.push({
                            x: randomNumber(spawnDistance.minX, spawnDistance.maxX),
                            y: spawnDistance.minY,
                            health: health
                        })
                    } else{
                        enemies.push({
                            x: randomNumber(spawnDistance.minX, spawnDistance.maxX),
                            y: spawnDistance.maxY,
                            health: health
                        })
                    }
                }
            } else {
                for (x = 0; x < difficulty.enemySpawnCount; x++) {
                    const health = difficulty.enemyHealth

                    if (randomNumber(1, 4) === 1) {
                        enemies.push({
                            x: spawnDistance.minX,
                            y: randomNumber(spawnDistance.minY, spawnDistance.maxY),
                            health: health
                        })
                    } else if (randomNumber(2, 4) === 2) {
                        enemies.push({
                            x: spawnDistance.maxX,
                            y: randomNumber(spawnDistance.minY, spawnDistance.maxY),
                            health: health
                        })
                    } else if (randomNumber(3, 4) === 3) {
                        enemies.push({
                            x: randomNumber(spawnDistance.minX, spawnDistance.maxX),
                            y: spawnDistance.minY,
                            health: health
                        })
                    } else{
                        enemies.push({
                            x: randomNumber(spawnDistance.minX, spawnDistance.maxX),
                            y: spawnDistance.maxY,
                            health: health
                        })
                    }
                }

                difficulty.enemySpawnCount += 0.5
                difficulty.enemyHealth += 0.5
                waveCountdown = 2000
            }
            
           
        } else {
            waveCountdown -= delta
        }
    }
        

    io.emit('players', players)
    io.emit('snowballs', snowballs)
    io.emit('towers', towers)
    io.emit('enemies', enemies)
    io.emit('gold', {gold: gold, damageMultiplier: damageMultiplierCost})
}

async function main() {
    io.on('connect', (socket) => {
        console.log("user connected", socket.id)

        inputsMap[socket.id] = {
            up: false,
            down: false,
            left: false,
            right: false
        }

        players.push({
            id: socket.id,
            x: 16,
            y: 16
        })

        socket.on('inputs', (inputs) => {
            inputsMap[socket.id] = inputs
        })

        socket.on('snowball', (angle) => {
            const player = players.find(player => player.id === socket.id)
            snowballs.push({
                angle,
                x: player.x,
                y: player.y,
                timeLeft: 1000,
                playerId: socket.id
            })
        })

        socket.on('increase damage multiplier', () => {
            if (gold >= damageMultiplierCost) {
                gold -= damageMultiplierCost
                damageMultiplier += 1
                damageMultiplierCost += 100
            }
        })

        socket.on('click', (position) => {
            let placeBuilding = true
            for (const enemy of enemies) {
                if (isColliding({x: position.x - 32, y: position.y - 32, w: 64, h: 64}, {x: enemy.x, y: enemy.y, w: 64, h: 64})) {
                    enemy.health -= damageMultiplier
                    if (enemy.health <= 0) {
                        gold += GOLD_PER_ENEMY
                    }

                    placeBuilding = false
                }
            }
            if (placeBuilding) {
                placeBuilding = false
                const selectedTower = towerStatsLevel1.find(tower => tower.type === position.selectedTower)
                if (gold >= selectedTower.cost) {
                    let i = true
                    let x = position.x
                    let y = position.y
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

                    let collidingWithTowers = false
                    for (const tower of towers) {
                        if (isColliding({x: x, y: y, w: TOWER_WIDTH, h: TOWER_HEIGHT}, {x: tower.x, y: tower.y, w: TOWER_WIDTH, h: TOWER_HEIGHT})) {
                            collidingWithTowers = true
                        }
                    }

                    if (!collidingWithTowers) {
                        towers.push({
                            x: x,
                            y: y,
                            damage: selectedTower.damage,
                            speed: selectedTower.speed,
                            timeRange: selectedTower.timeRange,
                            projectiles: [],
                            countdown: selectedTower.speed,
                            projectileSpeed: selectedTower.projectileSpeed,
                            type: position.selectedTower,
                            level: 1
                        })
                        gold -= selectedTower.cost
                        placeBuilding = true
                    }
                }
                
                if (placeBuilding) {
                    if (position.x + 500 > spawnDistance.maxX) {
                        spawnDistance.maxX = position.x + 500
                    } else if (position.x - 500 < spawnDistance.minX) {
                        spawnDistance.minX = position.x -500
                    } else if (position.y + 500 > spawnDistance.maxY) {
                        spawnDistance.maxY = position.y + 500
                    } else if (position.y - 500 < spawnDistance.minY) {
                        spawnDistance.minY = position.y - 500
                    } 
                }
            }
        })

        socket.on('upgrade', (id) => {
            const mouse = inputsMap[id].serverMouse
            for (const tower of towers) {
                if (isColliding({x: mouse.x - 5, y: mouse.y - 5, w: 10, h: 10}, {x: tower.x, y: tower.y, w: TOWER_WIDTH, h: TOWER_HEIGHT})) {
                    
                    if (tower.level < 3) {
                        if (tower.level === 1) {
                            towerStats = towerStatsLevel2.find(findTower => findTower.type === tower.type)
                        } else if (tower.level === 2) {
                            towerStats = towerStatsLevel3.find(findTower => findTower.type === tower.type)
                        }

                        if (gold >= towerStats.cost) {
                            tower.damage = towerStats.damage
                            tower.speed = towerStats.speed
                            tower.timeRange = towerStats.timeRange
                            tower.level += 1
                            gold -= towerStats.cost
                        }
                    }
                }
            }
        })

        socket.on('disconnect', () => {
            players = players.filter(player => player.id !== socket.id)
        })
    })
    
    app.use(express.static("public"))
    
    httpServer.listen(PORT);

    let lastUpdate = Date.now()
    setInterval(() => {
        const now = Date.now()
        const delta = now - lastUpdate
        tick(delta)
        lastUpdate = now
    }, 1000 / TICK_RATE)
}

main()
