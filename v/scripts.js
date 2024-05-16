document.getElementById('add-bot').addEventListener('click', addBot);

function addBot() {
    const botName = document.getElementById('bot-name').value;
    const token = document.getElementById('discord-token').value;
    const channelId = document.getElementById('channel-id').value;
    const interval = document.getElementById('message-interval').value;
    const messageText = document.getElementById('message-text').value;
    const image = document.getElementById('image-upload').files[0];

    if (!botName || !token || !channelId || !messageText) {
        alert('Пожалуйста, заполните все поля.');
        return;
    }

    const botItem = document.createElement('li');
    botItem.innerHTML = `
        <span>${botName}</span>
        <button onclick="removeBot(this)">Удалить</button>
    `;
    document.getElementById('bots').appendChild(botItem);

    scheduleBot(token, channelId, messageText, interval, image);
}

function removeBot(button) {
    button.parentElement.remove();
}

function scheduleBot(token, channelId, message, interval, image) {
    const intervalMs = interval * 60 * 1000;

    setInterval(() => {
        sendMessage(token, channelId, message, image);
    }, intervalMs);
}

function sendMessage(token, channelId, message, image) {
    const formData = new FormData();
    formData.append('content', message);
    if (image) {
        formData.append('file', image);
    }

    fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bot ${token}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Сообщение отправлено:', data);
    })
    .catch(error => {
        console.error('Ошибка при отправке сообщения:', error);
    });
}

function toggleTheme() {
    const body = document.body;
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        themeToggleBtn.textContent = '☀️';
    } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeToggleBtn.textContent = '🌙';
    }
}
