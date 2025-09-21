const express = require("express");
const GameManager = require("../modules/Game");

const consts = require("../consts");
const YOLO_URL = "http://localhost:3333/detect";

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
            } else if (data.type === 'get_reel') {
                const game = GameManager.getGame(gcode);
                if (game == null) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Game not found',
                    }));
                    return;
                }

                console.log("sending reel to host ", game.reel);

                ws.send(JSON.stringify({
                    type: 'reel_data',
                    reel: game.reel
                }));

                setTimeout(() => {
                    for (let player of game.players) {
                        if (game.playerSockets[player]) {
                            game.playerSockets[player].send(JSON.stringify({
                                type: 'reel_questions',
                                questions: game.reel.questions,
                            }));
                        }
                    }
                }, 5000);
            } else if (data.type === 'request_responses') {
                const game = GameManager.getGame(gcode);
                if (game == null) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Game not found',
                    }));
                    return;
                }
                
                console.log("Sending responses to players");
                for (let player of game.players) {
                    if (game.playerSockets[player]) {
                        game.playerSockets[player].send(JSON.stringify({
                            type: 'responses',
                            responses: data.responses,
                        }));
                    }
                }
            } else if (data.type === 'time_update') {
                const game = GameManager.getGame(gcode);
                if (game == null) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Game not found',
                    }));
                    return;
                }
                
                for (let player of game.players) {
                    if (game.playerSockets[player]) {
                        game.playerSockets[player].send(JSON.stringify({
                            type: 'update_time',
                            startTime: data.startTime,
                        }));
                    }
                }
            } else if (data.type === 'get_items') {
                const game = GameManager.getGame(gcode);
                if (game == null) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Game not found',
                    }));
                    return;
                }
                
                const f = async () => {
                    await game.generateItems();
                
                    ws.send(JSON.stringify({
                        type: 'game_items',
                        items: game.items,
                    }));
                };

                f();
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
                const id = pdata.id; // unique id for the photo

                const yolo = await (await fetch(YOLO_URL, {
                    method: "POST",
                    headers: { "content-type": "application/json", "accept": "application/json" },
                    body: JSON.stringify({
                            image: photo, 
                            items: GameManager.getGame(gcode).items,
                        }),
                })).json();

                console.log(yolo);

                ws.send(JSON.stringify({ type: "photo_result", name, yolo }));

                const game = GameManager.getGame(gcode);
                if (game == null) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Game not found',
                    }));
                    return;
                }

                if (yolo.labels) {
                    yolo["detections"] = yolo.labels;
                }
                
                yolo.detections = yolo.detections.map(d => {
                    if (typeof d === 'object') {
                        d.class_name = d.class_name.toLowerCase();
                    } else {
                        d = { class_name: d.toLowerCase() };
                    }
                    return d;
                })
                

                for (let detection of yolo.detections) {
                    const playerDetectedefore = game.detectedItems[name] || [];
                    if (game.items.includes(detection.class_name) && !playerDetectedefore.includes(detection.class_name)) {
                        game.points[name] = (game.points[name] || 0) + consts.POINTS_PER_ITEM;
                        if (!game.detectedItems[name]) {
                            game.detectedItems[name] = [];
                        }
                        game.detectedItems[name].push(detection.class_name);

                        console.log(`Player ${name} detected item ${detection.class_name} (+${consts.POINTS_PER_ITEM} points)`);

                    
                        ws.send(JSON.stringify({
                            type: 'detection',
                            name: name,
                            item: detection.class_name,
                            correct: true,
                            id,
                        }));
                        
                        return;
                    }
                }

                
                ws.send(JSON.stringify({
                    type: 'detection',
                    name: name,
                    item: yolo.detections.length > 0 ? yolo.detections[0].class_name : "????",
                    correct: false,
                    id,
                }));

                console.log("Photo received from " + name + " (photo indx " + id + ")");

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
            } else if (data.type === 'submit_reel_responses') {
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