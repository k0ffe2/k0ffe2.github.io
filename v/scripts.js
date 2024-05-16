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
    objectStore.createIndex('active', 'active', { unique: false });
};

request.onsuccess = function(event) {
    db = event.target.result;
    updateDisplay();
};

function addBotToDB(name, token, channelId, interval, message, image) {
    const transaction = db.transaction(['bots'], 'readwrite');
    const objectStore = transaction.objectStore('bots');
    const request = objectStore.add({ name, token, channelId, interval, message, image, active: false });

    request.onsuccess = function(event) {
        console.log('Бот успешно добавлен в базу данных');
        updateDisplay();
    };

    request.onerror = function(event) {
        console.error('Ошибка при добавлении бота:', event.target.error);
    };
}

function updateBotInDB(id, name, token, channelId, interval, message, image, active) {
    const transaction = db.transaction(['bots'], 'readwrite');
    const objectStore = transaction.objectStore('bots');
    const request = objectStore.put({ id, name, token, channelId, interval, message, image, active });

    request.onsuccess = function(event) {
        console.log('Данные бота успешно обновлены');
        updateDisplay();
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
        updateDisplay();
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

request.onsuccess = function(event) {
    console.log('Бот успешно добавлен в базу данных');
    updateDisplay();
};


function toggleBot(id) {
    const transaction = db.transaction(['bots'], 'readwrite');
    const objectStore = transaction.objectStore('bots');
    const request = objectStore.get(id);

    request.onsuccess = function(event) {
        const bot = event.target.result;
        bot.active = !bot.active;
        updateBotInDB(bot.id, bot.name, bot.token, bot.channelId, bot.interval, bot.message, bot.image, bot.active);
        if (bot.active) {
            scheduleBot(bot);
        } else {
            clearInterval(bot.intervalId);
        }
    };

    request.onerror = function(event) {
        console.error('Ошибка при получении бота:', event.target.error);
    };
}

function scheduleBot(bot) {
    bot.intervalId = setInterval(() => {
        sendMessage(bot);
    }, bot.interval * 60000); // переводим в миллисекунды
}

function sendMessage(bot) {
    const formData = new FormData();
    formData.append('content', bot.message);
    if (bot.image) {
        formData.append('file', bot.image);
    }

    fetch(`https://discord.com/api/v9/channels/${bot.channelId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bot ${bot.token}`
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

document.getElementById('add-bot').addEventListener('click', function() {
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
});

function updateDisplay() {
    getAllBotsFromDB(function(bots) {
        const botList = document.getElementById('bots');
        botList.innerHTML = '';
        bots.forEach(bot => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>${bot.name}</span>
                <button onclick="toggleBot(${bot.id})">${bot.active ? 'Выключить' : 'Включить'}</button>
                <button onclick="deleteBotFromDB(${bot.id})">Удалить</button>
            `;
            botList.appendChild(listItem);
        });
    });
}
