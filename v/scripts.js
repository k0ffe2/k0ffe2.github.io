let db;
let bots = [];

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
    objectStore.createIndex('enabled', 'enabled', { unique: false });

    console.log('База данных готова к использованию');
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log('База данных успешно открыта');
    getAllBotsFromDB(updateDisplay);
};

function addBotToDB(name, token, channelId, interval, message, image, enabled) {
    const transaction = db.transaction(['bots'], 'readwrite');
    const objectStore = transaction.objectStore('bots');
    const request = objectStore.add({ name, token, channelId, interval, message, image, enabled });

    request.onsuccess = function(event) {
        console.log('Бот успешно добавлен в базу данных');
        getAllBotsFromDB(updateDisplay);
        const bot = { id: event.target.result, name, token, channelId, interval, message, image, enabled };
        if (enabled) {
            startBot(bot);
        }
    };

    request.onerror = function(event) {
        console.error('Ошибка при добавлении бота:', event.target.error);
    };
}

function updateBotInDB(id, name, token, channelId, interval, message, image, enabled) {
    const transaction = db.transaction(['bots'], 'readwrite');
    const objectStore = transaction.objectStore('bots');
    const request = objectStore.put({ id, name, token, channelId, interval, message, image, enabled });

    request.onsuccess = function(event) {
        console.log('Данные бота успешно обновлены');
        getAllBotsFromDB(updateDisplay);
        const bot = { id, name, token, channelId, interval, message, image, enabled };
        if (enabled) {
            startBot(bot);
        } else {
            stopBot(bot);
        }
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
        getAllBotsFromDB(updateDisplay);
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
        bots = event.target.result;
        callback(bots);
    };

    request.onerror = function(event) {
        console.error('Ошибка при получении списка ботов:', event.target.error);
        callback([]);
    };
}

function updateDisplay(bots) {
    const botList = document.getElementById('bots');
    botList.innerHTML = '';
    bots.forEach(bot => {
        const li = document.createElement('li');
        const status = bot.enabled ? 'Выключить' : 'Включить';
        li.innerHTML = `
            <span>${bot.name}</span>
            <button onclick="toggleBot(${bot.id})">${status}</button>
            <button onclick="removeBot(${bot.id})">Удалить</button>
            <button onclick="startBot(${bot.id})">Запустить</button>
        `;
        botList.appendChild(li);
    });
}

function toggleBot(id) {
    const bot = bots.find(bot => bot.id === id);
    const updatedBot = { ...bot, enabled: !bot.enabled };
    updateBotInDB(updatedBot.id, updatedBot.name, updatedBot.token, updatedBot.channelId, updatedBot.interval, updatedBot.message, updatedBot.image, updatedBot.enabled);
}

function removeBot(id) {
    deleteBotFromDB(id);
}

function startBot(id) {
    const bot = bots.find(bot => bot.id === id);
    const intervalMs = bot.interval * 60000; // Преобразовать интервал из минут в миллисекунды
    bot.intervalId = setInterval(() => {
        sendMessage(bot.token, bot.channelId, bot.message, bot.image);
    }, intervalMs);
}

function stopBot(bot) {
    clearInterval(bot.intervalId);
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
