const { MongoClient, ServerApiVersion } = require('mongodb');

// TODO: replace w/ .env variable later
const uri = "[API KEY (OLD WAS DELETED)]";


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

class User {
    constructor(name, email, id=null) {
        this.name = name;
        this.email = email;
        this.id = id; // will be set when inserted into DB so only if getting data set it.
        this.sessions = []; // array of session ids
    }
}

function generateRandomSessionId() {
    return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

class MongoDBClient {
    static client = client;
    static connected = false;

    static hooksForConnection = [];

    static onConnect(func) {
        if (this.connected) func();
        else this.hooksForConnection.push(func);
    }

    static async connect() {
        try {
            // Connect the client to the server	(optional starting in v4.7)
            await client.connect();
            console.log("Connected to MongoDB");

            this.connected = true;

            for (const func of this.hooksForConnection) {
                func();
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    
    static getClient() {
        return this.client;
    }
    

    static async close() {
        try {
            await client.close();
            console.log("Disconnected from MongoDB");
        } catch (e) {
            console.error(e);
        }
    }
    
    static async getAllUsers() {
        try {
            const database = client.db('bigredhacks');
            const users = database.collection('users');
            const allUsers = await users.find({}).toArray();
            return allUsers;
        }
        catch (e) {
            console.error(e);
            return [];
        }
    }

    /**
     * Returns a new session ID for the user with the given email.
     */
    static async signInUser(email) {
        try {
            console.log("Signing in user with email:", email);
            const database = client.db('bigredhacks');
            const users = database.collection('users');

            const user = await users.findOne({ email: email });
            if (!user) {
                console.log("No user found with email:", email);
                return null;
            }

            console.log("Found user:", user);

            const sessionId = generateRandomSessionId();
            console.log("Generated session ID:", sessionId);

            // add session id to user
            await users.updateOne({ email: email }, { $push: { sessions: sessionId } });

            return sessionId;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }

    static async signOutUser(sessionId) {
        try {
            const database = client.db('bigredhacks');
            const users = database.collection('users');
            
            await users.updateOne({ sessions: sessionId }, { $pull: { sessions: sessionId } });
        }
        catch (e) {
            console.error(e);
        }
    }

    static async getUserBySessionId(id) {
        try {
            const database = client.db('bigredhacks');
            const users = database.collection('users');
            const user = await users.findOne({ sessions: id });
            return user;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }

    static async getUserByEmail(email) {
        try {
            const database = client.db('bigredhacks');
            const users = database.collection('users');
            const user = await users.findOne({ email: email });
            return user;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }

    static async insertUser(user) {
        if (!(user instanceof User)) return;

        try {
            const database = client.db('bigredhacks');
            const users = database.collection('users');
            
            const { id, ...nuser } = user; // exclude id field if present
            const result = await users.insertOne(nuser);
            user.id = result.insertedId;
            console.log(`New user created with the following id: ${result.insertedId}`);
        } catch (e) {
            console.error(e);
        }
    }
    
    static async getUser(userId) {
        try {
            const database = client.db('bigredhacks');
            const users = database.collection('users');
            const user = await users.findOne({ _id: userId });
            return user;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}

module.exports = { MongoDBClient, User };