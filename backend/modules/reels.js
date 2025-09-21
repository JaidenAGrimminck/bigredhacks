const fs = require('fs');
const path = require('path');

const reels = [
    {
        reel: "/reels/reel1.mp4",
        questions: [
            "(3pt) What is the name of the main character?",
            "(5pt) What is the main character's favorite food?",
            "(7pt) What is the name of the main character's pet?"
        ]
    }
];

module.exports = {
    getRandomReel() {
        const reelsData = fs.readFileSync(path.join(__dirname, "..", "reels.json"), 'utf8');
        const reels = JSON.parse(reelsData);

        const randomReel = reels[Math.floor(Math.random() * reels.length)];

        randomReel.reel = "/reels/" + randomReel.reel;

        randomReel.questions = [
            "(1pt) NAME",
            "(1pt) DATE",
            ...randomReel.questions
        ]

        return randomReel;
    }
};