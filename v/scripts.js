let db;

const request = window.indexedDB.open('botsDB', 1);

request.onerror = function(event) {
    console.error('Ошибка открытия базы данных:', event.target.errorCode);
};

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    const objectStore = db.createObjectStore('bots', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('name', 'name', { unique: false });
    objectStore.createIndex('token', 'token', { unique: true });
    objectStore.createIndex('channelId', 'channelId', { unique: false });
    objectStore.createIndex('interval', 'interval', { unique: false });
    objectStore.createIndex('message', 'message', { unique: false });
    objectStore.createIndex('image', 'image', { unique: false });

    console.log('База данных готова к использованию');
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log('База данных успешно открыта');
};

function addBotToDB(name, token, channelId, interval, message, image) {
    const transaction = db.transaction(['bots'], 'readwrite');
    const objectStore = transaction.objectStore('bots');
    const request = objectStore.add({ name, token, channelId, interval, message, image });

    request.onsuccess = function(event) {
        console.log('Бот успешно добавлен в базу данных');
    };

    request.onerror = function(event) {
        console.error('Ошибка при добавлении бота:', event.target.error);
    };
}

function updateBotInDB(id, name, token, channelId, interval, message, image) {
    const transaction = db.transaction(['bots'], 'readwrite');
    const objectStore = transaction.objectStore('bots');
    const request = objectStore.put({ id, name, token, channelId, interval, message, image });

    request.onsuccess = function(event) {
        console.log('Данные бота успешно обновлены');
    };

    request.onerror = function(event) {
        console.error('Ошибка при обновлении данных бота:', event.target.error);
    };
}

function deleteBotFromDB(id) {
    const transaction = db.transaction(['bots'], 'readwrite');
    const objectStore = transaction.objectStore('bots');
    const request = objectStore.delete(id);

    request.onsuccess = function(event) {
        console.log('Бот успешно удален из базы данных');
    };

    request.onerror = function(event) {
        console.error('Ошибка при удалении бота:', event.target.error);
    };
}

function getAllBotsFromDB(callback) {
    const transaction = db.transaction(['bots'], 'readonly');
    const objectStore = transaction.objectStore('bots');
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        callback(event.target.result);
    };

    request.onerror = function(event) {
        console.error('Ошибка при получении списка ботов:', event.target.error);
        callback([]);
    };
}

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

    addBotToDB(botName, token, channelId, interval, messageText, image);
    updateDisplay();
}

function updateDisplay() {
    getAllBotsFromDB(displayBots);
}

function displayBots(bots) {
    const botList = document.getElementById('bots');
    botList.innerHTML = '';
    bots.forEach(bot => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${bot.name}</span>
            <button onclick="removeBot(${bot.id})">Удалить</button>
        `;
        botList.appendChild(li);
    });
}

function removeBot(id) {
    deleteBotFromDB(id);
    updateDisplay();
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
