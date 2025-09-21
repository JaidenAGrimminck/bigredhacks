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
        const randomReel = reels[Math.floor(Math.random() * reels.length)];

        randomReel.questions = [
            "(1pt) NAME",
            "(1pt) DATE",
            ...randomReel.questions
        ]

        return randomReel;
    }
};