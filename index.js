// Collect necessary libraries
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');

// Initialize express app
const app = express();
app.use(express.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Initialze REST API
app.get('/', (req, res) => res.status(200).sendFile(path.join(__dirname, '/html/index.html')));
app.get('/favicon.ico', (req, res) => res.status(200).sendFile(path.join(__dirname, '/html/favicon.ico')));
app.get('/agent', async (req, res) => {

    // We want to get a fresh version of the agent if it is older than 1 minute
    const max_age_seconds = 60;
    const age_seconds = await new Promise((resolve, reject) => {
        fs.stat('./scripts/agent.js', (err, stats) => {
            if (stats === undefined) {
                resolve(undefined);
            }
            else {
                resolve(Math.floor((Date.now() - stats.mtimeMs) / 1000));
            }
        });
    });

    if (age_seconds === undefined || age_seconds > max_age_seconds) {
        const response = await fetch("https://fpjscdn.net/v3/9LPPFowgE7CqfuxXzBNq", { method: 'GET', redirect: 'follow'});
        const result = await response.text();

        await new Promise((resolve, reject) => {
            fs.writeFile('./scripts/agent.js', result, (err) => { resolve() });
        });
    }

    res.status(200).sendFile(path.join(__dirname, '/scripts/agent.js'));  
});

const port = process.env.PORT || 3000;
app.listen(port, (err) => {
    if (err) console.log(err);
    console.log(`Listening on port ${port}...`)
});