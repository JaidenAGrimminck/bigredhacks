const { generateListOfItems } = require("../ai/llm");
const { getRandomReel } = require("./reels");

function generateEasyCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

class Game {
    constructor(hostSocket) {
        this.players = []; // list of user ids of players in the game
        this.playerSockets = {}; // map of user id to websocket

        this.points = {};

        this.hostSocket = hostSocket; // websocket of the host
        this.reestablished = false;
        
        this.code = generateEasyCode(); // 4 letter code for joining the game
        this.state = 'waiting';

        this.detectedItems = {}; // map of player name to list of detected items

        this.items = ["bottle", "statue", "tree", "chair", "couch"]; // list of items to find

        this.reel = getRandomReel(); // get a random reel
    }

    async startGame() {
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait for next tick to ensure it's on the next page.
        await new Promise(resolve => setTimeout(() => { if (this.hostSocket != null) { resolve(); } }, 100)); // wait till host is back
        console.log("Starting game " + this.code);
        this.state = 'playing';

        for (let player of this.players) {
            this.points[player] = 0;
        }

        if (this.hostSocket !== null) {
            this.hostSocket.send(JSON.stringify({
                type: 'item_data',
                items: this.items,
            }));
        }
    }

    async generateItems() {
        const items = await generateListOfItems();

        if (items.length > 5) {
            items.splice(5); // limit to 5 items
        }
        if (items.length < 5) {
            while (items.length < 5) {
                items.push("bottle"); // pad with bottles if less than 5 items
            }
        }

        this.items = items;

        return items;
    }

    reestablishSocket(newSocket) {
        this.hostSocket = newSocket;
        this.reestablished = true;
    }

    connectPlayer(name, socket) {
        if (!this.players.includes(name)) {
            return false; // player not in game
        }
        socket.send(JSON.stringify({
            type: 'connected',
            name,
        }));

        this.playerSockets[name] = socket;

        return true;
    }

    attemptRemovePlayer(name) {
        if (!this.players.includes(name)) {
            return false; // player not in game
        }
        this.players = this.players.filter(p => p !== name);
        delete this.playerSockets[name];
        
        if (this.hostSocket !== null) {
            this.hostSocket.send(JSON.stringify({
                type: 'player_left',
                name,
            }));
        }
        
        return true;
    }

    addPlayer(name) {
        if (this.players.length >= 4) {
            return false; // game full
        }
        if (this.players.includes(name)) {
            return false; // name already taken
        }
        
        if (this.hostSocket === null) {
            return false; // host disconnected
        }

        this.hostSocket.send(JSON.stringify({
            type: 'player_joined',
            name,
        }));

        this.players.push(name);
        return true;
    }

    hasPlayer(name) {
        return this.players.includes(name) && this.playerSockets[name] !== undefined;
    }
}

class GameManager {
    static games = {}; // map of game code to Game instance

    static createGame(socket) {
        const game = new Game(socket);
        this.games[game.code] = game;
        return game.code;
    }

    static getGame(code) {
        return this.games[code] || null;
    }

    static removeGame(code) {
        delete this.games[code];
    }
}

module.exports = GameManager;