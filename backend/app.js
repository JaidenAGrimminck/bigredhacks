const express = require('express');
const { MongoDBClient, User } = require('./db/MongoClient');
const { promptLLM } = require('./ai/llm');

// Connect to MongoDB
MongoDBClient.connect().catch(console.error);

const app = express();

app.use(express.json());

app.use('/users', require('./routes/users/users'));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    MongoDBClient.onConnect(() => {
        console.log("MongoDB is connected, you can perform database operations now.");
    });
});