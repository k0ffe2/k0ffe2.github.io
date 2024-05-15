let totalEarnings = 0;
let sessionEarnings = 0;
let log = JSON.parse(localStorage.getItem('log')) || [];
let uniqueVisitors = JSON.parse(localStorage.getItem('uniqueVisitors')) || {};

async function sendToDiscord(message) {
    const webhookURL = 'https://discord.com/api/webhooks/1240196568817205248/oJXHMG7H1HRUXp-HOfsq1PA2hlfo4n-rs73EfbOIRxeH-eiNQ8JQ8yZP-1LQVf5hsEU4'; // Замените на свой URL вебхука Discord
    await fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: message,
        }),
    });
}

async function getGeoData() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка получения геоданных:', error);
        return {};
    }
}

function updateDisplay() {
    document.getElementById('sessionEarnings').textContent = `${sessionEarnings}$`;
    document.getElementById('totalEarnings').textContent = `${totalEarnings}$`;
    displayLog();
}

function displayLog() {
    const logList = document.getElementById('logList');
    logList.innerHTML = '';
    log.forEach(entry => {
        const li = document.createElement('li');
        li.className = entry.amount > 0 ? 'earning' : 'expense';
        li.innerHTML = `<span>${entry.time}</span><span>${entry.amount}$</span><span>${entry.comment}</span>`;
        logList.appendChild(li);
    });
}

async function saveTransaction() {
    const amountInput = document.getElementById('amountInput');
    const commentInput = document.getElementById('commentInput');
    const amount = parseFloat(amountInput.value);
    const comment = commentInput.value.trim();

    if (!isNaN(amount) && comment !== '') {
        try {
            const now = new Date();
            const moscowTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Moscow"}));
            const almatyTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Astana"}));
            const timeString = `МСК: ${moscowTime.toLocaleTimeString()}, Алматы: ${almatyTime.toLocaleTimeString()}`;
            log.unshift({ time: timeString, amount, comment });

            sessionEarnings += amount;
            totalEarnings += amount;
            updateDisplay();

            amountInput.value = '';
            commentInput.value = '';

            localStorage.setItem('log', JSON.stringify(log));
            localStorage.setItem('totalEarnings', totalEarnings);
            localStorage.setItem('sessionEarnings', sessionEarnings);
        } catch (error) {
            console.error('Ошибка сохранения транзакции:', error);
        }
    } else {
        alert('Пожалуйста, введите сумму и комментарий.');
    }
}

function newSession() {
    sessionEarnings = 0;
    updateDisplay();
    localStorage.setItem('sessionEarnings', sessionEarnings);
}

function resetData() {
    sessionEarnings = 0;
    totalEarnings = 0;
    log = [];
    updateDisplay();
    localStorage.clear();
}

document.addEventListener('DOMContentLoaded', async () => {
    totalEarnings = parseFloat(localStorage.getItem('totalEarnings')) || 0;
    sessionEarnings = parseFloat(localStorage.getItem('sessionEarnings')) || 0;
    updateDisplay();

    try {
        const geoData = await getGeoData();
        let message = "Новый пользователь зашел на сайт.\n";

        if (geoData.country_name) {
            message += `Страна: ${geoData.country_name}\n`;
        }
        if (geoData.city) {
            message += `Город: ${geoData.city}\n`;
        }
        if (geoData.ip) {
            message += `IP: ${geoData.ip}\n`;
        }
        message += `Время входа: ${new Date().toLocaleString()}`;

        // Собираем статистику уникальных посетителей
        const today = new Date().toLocaleDateString();
        const visitorId = geoData.ip; // Предполагаем, что ip - это уникальный идентификатор пользователя
        if (!uniqueVisitors[today]) {
            uniqueVisitors[today] = [];
        }
        if (!uniqueVisitors[today].includes(visitorId)) {
            uniqueVisitors[today].push(visitorId);
            // Отправляем сообщение на Discord только для новых посетителей
            await sendToDiscord(message);
        }
        localStorage.setItem('uniqueVisitors', JSON.stringify(uniqueVisitors));
    } catch (error) {
        console.error('Ошибка отправки сообщения на Discord:', error);
    }
});
