/*const express = require('express');
const app = express();
const PORT = 8000;

app.get('/', (req, res) => {
    res.send('Academic Backend is running!');
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});
*/
/*
const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 8000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Academic Backend is running!");
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});
*/

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Academic Backend is running!');
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});