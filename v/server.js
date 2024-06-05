const express = require('express');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const request = require('request');
const fs = require('fs');

const app = express();
const wss = new WebSocket.Server({ port: 8080 });

app.use(bodyParser.json());

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        // Обработка сообщений от клиента, если это необходимо
    });
});

function sendMessage(token, channelId, messages, image) {
    const message = messages[Math.floor(Math.random() * messages.length)];
    const ws = new WebSocket("wss://gateway.discord.gg/");
    const data = {
        op: 2,
        d: {
            token: token,
            properties: {
                $os: "linux",
                $browser: "ubuntu",
                $device: "ubuntu"
            }
        }
    };
    ws.on('open', () => {
        ws.send(JSON.stringify(data));
        if (image !== '') {
            const headers = {
                'Authorization': token
            };
            const formData = {
                'payload_json': JSON.stringify({
                    content: message
                }),
                'file': fs.createReadStream(image)
            };
            request.post({
                url: `https://discord.com/api/v9/channels/${channelId}/messages`,
                headers: headers,
                formData: formData
            }, (error, response, body) => {
                if (error) {
                    console.error('Произошла ошибка при отправке сообщения и изображения:', error);
                } else {
                    console.log('Сообщение и изображение успешно отправлены.');
                }
            });
        } else {
            const headers = {
                'Authorization': token,
                'Content-Type': 'application/json'
            };
            const payload = {
                content: message,
                tts: false
            };
            request.post({
                url: `https://discord.com/api/v9/channels/${channelId}/messages`,
                headers: headers,
                json: payload
            }, (error, response, body) => {
                if (error) {
                    console.error('Произошла ошибка при отправке сообщения:', error);
                } else {
                    console.log('Сообщение успешно отправлено.');
                }
            });
        }
        try {
            ws.close();
        } catch (error) {
            console.error('Ошибка при закрытии WebSocket:', error);
        }
        const currentDatetime = new Date().toISOString();
        console.log(`${currentDatetime}  |  отправлено  ${channelId}`);
    });
}

function time(token, channelId, messages, image) {
    sendMessage(token, channelId, messages, image);
}

app.post('/send-message', (req, res) => {
    const { token, channelId, messages, image } = req.body;
    sendMessage(token, channelId, messages, image);
    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});
