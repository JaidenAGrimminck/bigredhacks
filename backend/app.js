const express = require('express');
const { MongoDBClient, User } = require('./db/MongoClient');
const { promptLLM } = require('./ai/llm');

// Connect to MongoDB
MongoDBClient.connect().catch(console.error);

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    MongoDBClient.onConnect(() => {
        console.log("MongoDB is connected, you can perform database operations now.");

        // try adding one user
        MongoDBClient.insertUser(new User("John Doe", "john.doe@example.com"));

        promptLLM("Tell me a joke!").then(response => {
            console.log("LLM Response:", response);
        }).catch(console.error);
    });
});