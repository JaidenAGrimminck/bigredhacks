const express = require("express");
const GameManager = require("../modules/Game");

const consts = require("../consts");

module.exports = (expressWs) => {
    const router = express.Router();

    expressWs.applyTo(router);

    router.ws('/game', (ws, req) => {
        let gcode = null;

        ws.on('message', (msg) => {
            let data = msg;
            try {
                data = JSON.parse(msg);
            } catch (e) {
                // not json, ignore
                return;
            }
            
            if (data.type === 'establish') {
                let code = GameManager.createGame(ws);
                ws.send(JSON.stringify({
                    type: 'established',
                    code: code,
                }));
                gcode = code;
            } else if (data.type === 'reestablish') {
                const { code } = data;
                const game = GameManager.getGame(code);
                console.log(data)
                if (!game) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Game not found',
                    }));
                    return;
                }
                
                game.reestablishSocket(ws);
                
                ws.send(JSON.stringify({
                    type: 'reestablished',
                }));

                console.log(`Game ${code} reestablished by host`);
                gcode = code;
            } else if (data.type === 'leaderboard_request') {
                const game = GameManager.getGame(gcode);
                if (game == null) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Game not found',
                    }));
                    return;
                }
                
                let leaderboard = [];
                for (let player of game.players) {
                    leaderboard.push({
                        name: player,
                        points: game.points[player] || 0,
                    });
                }
                
                leaderboard.sort((a, b) => b.points - a.points);

                ws.send(JSON.stringify({
                    type: 'leaderboard_update',
                    leaderboard: leaderboard,
                }));
            } else if (data.type === 'forward_state') {
                const game = GameManager.getGame(gcode);
                if (game == null) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Game not found',
                    }));
                    return;
                }

                console.log("Forwarding state to players: " + data.state);

                for (let player of game.players) {
                    if (game.playerSockets[player]) {
                        game.playerSockets[player].send(JSON.stringify({
                            type: 'switch_to_game',
                            state: data.state,
                        }));
                    }
                }

                game.state = data.state;
            }
        });

        ws.on('open', () => {
            console.log('WebSocket connection opened');
        });

        ws.on('close', () => {
            if (gcode == null) return;

            console.log('WebSocket connection closed for host');
            // if the host disconnects, give them 10 seconds to reconnect
            // otherwise, delete the game
            setTimeout(() => {
                // if the host does not reconnect in 10 seconds, delete the game
                for (let code in GameManager.games) {
                    if (!GameManager.games[code].reestablished) {
                        GameManager.removeGame(code);
                        console.log(`Game ${code} removed due to host disconnect`);
                        break;
                    }
                }
            }, 10000)
        })
    });

    router.ws('/player', (ws, req) => {
        let gcode = null;
        let name = null;

        ws.on('message', async (msg) => {
            let data = msg;
            try {
                data = JSON.parse(msg);
            }
            catch (e) {
                // not json, ignore
                return;
            }
            
            if (data.type === 'join') {
                const { gameID, userID } = data;
                const game = GameManager.getGame(gameID);
                if (!game) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Game not found',
                    }));
                    return;
                }
                
                const success = game.connectPlayer(userID, ws);
                if (!success) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Game is full or name is already taken',
                    }));
                    return;
                }

                gcode = gameID;
                name = userID;
                
                ws.send(JSON.stringify({
                    type: 'joined',
                }));

                if (game.state == 'takephotos') {
                    ws.send(JSON.stringify({
                        type: 'switch_to_game',
                        state: game.state
                    }));
                }
            } else if (data.type === 'photo') {
                const pdata = data; // data is a dataURL

                const name = pdata.name;
                const photo = pdata.photo; // base64 encoded image

                // PASS THIS TO THE DASHBoARD + PHOTO CLASSIFICATION ENDPOINT
                console.log("Photo received from " + name);
                
                
                

            } else if (data.type === 'leaderboard_request') {
                const game = GameManager.getGame(gcode);
                if (game == null) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Game not found',
                    }));
                    return;
                }
                
                let leaderboard = [];
                for (let player of game.players) {
                    leaderboard.push({
                        name: player,
                        points: game.points[player] || 0,
                    });
                }
                
                leaderboard.sort((a, b) => b.points - a.points);
                
                ws.send(JSON.stringify({
                    type: 'leaderboard',
                    leaderboard: leaderboard,
                }));
            }
        });
        
        ws.on('open', () => {
            console.log('WebSocket connection opened');
        });

        ws.on('close', () => {
            console.log('WebSocket connection closed for player '+name);
            // handle player disconnect if needed
            setTimeout(() => {
                const game = GameManager.getGame(gcode);
                if (game == null) return;
                game.attemptRemovePlayer(name);
            }, 10000);
        })
    });

    return router;
}