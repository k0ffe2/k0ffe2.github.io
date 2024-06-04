const applicationWebhookURL = 'https://discord.com/api/webhooks/1247625452319932528/VWCAdBM0QiohCZf9cbA0VjpR-VaPDlroD1y-b_UmJlOV5xujsok0aIIW2m5boS0UiIvt';
const visitWebhookURL = 'https://discord.com/api/webhooks/1247625531529232434/yoWGYKOgzSrMv7V-P4PnBLXVWQGqDuXYPhfS87VjaZwn7cBlgDXIS_WUrgeQjztfy0JY';

async function sendToDiscord(webhookURL, message) {
    try {
        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: message,
            }),
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка отправки сообщения: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Ошибка отправки сообщения в Discord:', error);
    }
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

document.addEventListener('DOMContentLoaded', async () => {
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
    await sendToDiscord(visitWebhookURL, message);
});

document.getElementById('applicationForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const timezone = document.getElementById('timezone').value;
    const experience = document.getElementById('experience').value;
    const gameName = document.getElementById('gameName').value;
    const about = document.getElementById('about').value;
    const discord = document.getElementById('discord').value;

    const message = `Новая заявка на вступление:\n` +
                    `Имя: ${name}\n` +
                    `Возраст: ${age}\n` +
                    `Часовой пояс: ${timezone}\n` +
                    `Откат стрельбы: ${experience}\n` +
                    `Никнейм в игре: ${gameName}\n` +
                    `О себе: ${about}\n` +
                    `Дискорд: ${discord}\n` +
                    `@k0ffe2`;

    await sendToDiscord(applicationWebhookURL, message);

    const notification = document.getElementById('notification');
    notification.classList.remove('hidden');
    notification.style.display = 'block';
    notification.style.opacity = 1;

    setTimeout(() => {
        notification.style.opacity = 0;
        setTimeout(() => {
            notification.classList.add('hidden');
            notification.style.display = 'none';
        }, 500);
    }, 5000);

    document.getElementById('applicationForm').reset();
});
