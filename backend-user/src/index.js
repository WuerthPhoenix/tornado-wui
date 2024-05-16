const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 80;

let userInfo = {
    "user": "admin",
    "preferences": {
        "language": "en_US",
        "theme": "dark",
        "timezone": null,
        "processing_tree_collapsed_view_mode": true
    },
    "user_tenants": {
        "root": [
            "edit",
            "view",
            "test_event_execute_actions"
        ],
    },
    "system_available_tenants": [
        "root",
    ]
}

app.use(bodyParser.json());

app.post('/user/translation', (req, res) => {
    res.send(req.body);
});

app.get('/user/info', (req, res) => {
    res.send(userInfo);
});

app.post('/user/info', (req, res) => {
    userInfo.preferences = { ...userInfo.preferences, ...req.body };
    console.log(userInfo);
    res.send(userInfo);
});

app.listen(port, () => {
    console.log(`Proxy listening on port ${port}`);
});