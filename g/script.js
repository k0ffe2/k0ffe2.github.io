document.addEventListener('DOMContentLoaded', function() {
    const configForm = document.getElementById('configForm');
    const statusDiv = document.getElementById('status');

    configForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(configForm);
        const configData = {};
        formData.forEach(function(value, key) {
            configData[key] = value;
        });

        startBot(configData);
    });

    function startBot(configData) {
        statusDiv.textContent = 'Starting bot...';

        const token = configData.discordToken;
        const channelId = configData.channelID;
        const messages = configData.advertisements.split(';').map(message => message.trim());
        const image = 'img/1.png'; // You need to define how you handle image input, for now let's assume it's empty

        sendMessage(token, channelId, messages, image);
    }

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

        ws.addEventListener('open', () => {
            ws.send(JSON.stringify(data));
            if (image !== '') {
                const formData = new FormData();
                formData.append('payload_json', JSON.stringify({ content: message }));
                formData.append('file', image);

                fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': token
                    },
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Произошла ошибка при отправке сообщения и изображения');
                    }
                    console.log('Сообщение и изображение успешно отправлены.');
                    statusDiv.textContent = 'Message and image sent successfully!';
                })
                .catch(error => {
                    console.error('Произошла ошибка при отправке сообщения и изображения:', error);
                    statusDiv.textContent = 'Error sending message and image';
                });
            } else {
                const payload = {
                    content: message,
                    tts: false
                };

                fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Произошла ошибка при отправке сообщения');
                    }
                    console.log('Сообщение успешно отправлено.');
                    statusDiv.textContent = 'Message sent successfully!';
                })
                .catch(error => {
                    console.error('Произошла ошибка при отправке сообщения:', error);
                    statusDiv.textContent = 'Error sending message';
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
});
