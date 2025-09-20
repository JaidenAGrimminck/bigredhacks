const express = require('express');
const { MongoDBClient, User } = require('./db/MongoClient');
const { promptLLM, generateListOfItems } = require('./ai/llm');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

// Connect to MongoDB
MongoDBClient.connect().catch(console.error);

const app = express();

const expressWs = require('express-ws')(app);

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // adjust this to your frontend's origin
    credentials: true
}))
app.use(cookieParser());
app.use(helmet());
app.use('/users', require('./routes/users/users'));
app.use('/games', require('./routes/games/games'));

app.use('/ws', require("./websocket/socket")(expressWs));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    MongoDBClient.onConnect(() => {
        console.log("MongoDB is connected, you can perform database operations now.");

        // generateListOfItems().then(items => {
        //     console.log("Generated items from LLM:", items);
        // }).catch(err => {
        //     console.error("Error generating items from LLM:", err);
        // });
    });
});