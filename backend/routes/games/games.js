const express = require('express');

const router = express.Router();

router.post('/join', (req, res) => {
    const { gameId, name } = req.body;
    const game = require('../../modules/Game').getGame(gameId);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }

    const success = game.addPlayer(name);
    if (!success) {
        return res.status(400).json({ error: 'Game is full or name is already taken' });
    }

    setTimeout(() => {
        if (!game.hasPlayer(name)) {
            game.attemptRemovePlayer(name);
            console.log(`Player ${name} failed to reconnect in time and was removed from game ${gameId}`);
        }
    }, 10000);

    res.json({ message: 'Joined game' });
})

router.post('/start', (req, res) => {
    const { gameId } = req.body;
    const game = require('../../modules/Game').getGame(gameId);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }
    
    if (game.players.length < 1) {
        return res.status(400).json({ error: 'At least one player is required to start the game' });
    }
    
    game.startGame();
    res.json({ message: 'Game started' });
});

module.exports = router;