const express = require("express");
const { MongoDBClient, User } = require("../../db/MongoClient");

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

function setSessionCookie(res, sessionId) {
    const isProd = process.env.NODE_ENV === 'production'; //test if in production environment
    res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure:   false,//isProd,
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week should be good enough
    });
}

// middle man to get user info if session id exists
router.use(async (req, res, next) => {
    if (req.cookies == undefined) {
        req.cookies = {};
    }
    if (req.headers == undefined) {
        req.headers = {};
    }
    const sessionId = req.headers["x-session-id"] || req.cookies.sessionId;
    if (sessionId) {
        const user = await MongoDBClient.getUserBySessionId(sessionId);
        if (user) {
            req.user = user;
            req.sessionId = sessionId;
            setSessionCookie(res, sessionId); // refresh cookie
        }
    }
    next();
});

router.get("/", async (req, res) => {
    try {
        const users = await MongoDBClient.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/signin", async (req, res) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }
    
    const sessionId = await MongoDBClient.signInUser(email);
    if (!sessionId) {
        return res.status(404).json({ error: "User not found" });
    }

    setSessionCookie(res, sessionId);
    console.log("set cookie for session:", sessionId);
    console.log(req.cookies)
    // confirm:
    const cookie = req.cookies.sessionId;
    if (cookie === sessionId) {
        console.log("Cookie is set correctly");
    } else {
        console.log("Cookie is not set correctly");
    }

    res.json({ success: true });
});

router.get("/me", (req, res) => {
    //console.log(req.cookies);
    //console.log(req)
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    res.json(req.user);
});

router.post("/signout", async (req, res) => {
    if (!req.sessionId) {
        return res.status(400).json({ error: "No active session" });
    }
    
    await MongoDBClient.signOutUser(req.sessionId);

    res.json({ success: true });
});

router.post("/signup", async (req, res) => {
    const email = req.body.email;
    const name = req.body.name;
    if (!email || !name) {
        return res.status(400).json({ error: "Email and name are required" });
    }

    const existingUser = await MongoDBClient.getUserByEmail(email);
    if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
    }

    const newUser = new User(name, email);
    await MongoDBClient.insertUser(newUser);

    await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second to ensure user is inserted

    // generate session id
    const sessionId = await MongoDBClient.signInUser(email);
    if (!sessionId) {
        console.log("Failed to create session for new user:", email);
        return res.status(500).json({ error: "Failed to create session" });
    }

    console.log("New user signed up and signed in:", email);

    setSessionCookie(res, sessionId);

    res.json({ success: true });
});

module.exports = router;