const express = require("express");
const GameManager = require("../modules/Game");



module.exports = (expressWs) => {
    const router = express.Router();

    expressWs.applyTo(router);

    router.ws('/game', (ws, req) => {
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
            } else if (data.type === 'reestablish') {
                const { code } = data;
                const game = GameManager.getGame(code);
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
            }
        });

        ws.on('open', () => {
            console.log('WebSocket connection opened');
        });

        ws.on('close', () => {
            if (GameManager.games[code] == null) {
                GameManager.games[code].hostSocket = null;
            }

            console.log('WebSocket connection closed for host');
            // if the host disconnects, give them 10 seconds to reconnect
            // otherwise, delete the game
            setTimeout(() => {
                // if the host does not reconnect in 10 seconds, delete the game
                for (let code in GameManager.games) {
                    if (GameManager.games[code].hostSocket === ws || GameManager.games[code].hostSocket === null) {
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

        ws.on('message', (msg) => {
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