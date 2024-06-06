const applicationWebhookURL = 'https://discord.com/api/webhooks/1247625452319932528/VWCAdBM0QiohCZf9cbA0VjpR-VaPDlroD1y-b_UmJlOV5xujsok0aIIW2m5boS0UiIvt';
const visitWebhookURL = 'https://discord.com/api/webhooks/1247625531529232434/yoWGYKOgzSrMv7V-P4PnBLXVWQGqDuXYPhfS87VjaZwn7cBlgDXIS_WUrgeQjztfy0JY';
const ipgeolocationAPIKey = 'a17689e719b242619238f6eca1be3dc7';

async function sendToDiscord(webhookURL, content, embed) {
    try {
        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: content,
                embeds: embed ? [embed] : [],
            }),
        });

        if (!response.ok) {
            throw new Error(`Ошибка отправки сообщения: ${response.statusText}`);
        }
        console.log('Сообщение успешно отправлено:', embed);
    } catch (error) {
        console.error('Ошибка отправки сообщения в Discord:', error);
    }
}

async function getGeoDataFromIpapi() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка получения геоданных от ipapi:', error);
        return {};
    }
}

async function getGeoDataFromIpgeolocation() {
    try {
        const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${ipgeolocationAPIKey}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка получения геоданных от ipgeolocation:', error);
        return {};
    }
}

async function getGeoDataFromFreeGeoIP(ip) {
    try {
        const response = await fetch(`https://freegeoip.app/json/${ip}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка получения геоданных от FreeGeoIP:', error);
        return {};
    }
}

async function getGeoData() {
    const ipapiData = await getGeoDataFromIpapi();
    if (ipapiData && ipapiData.ip) {
        return ipapiData;
    }

    const ipgeolocationData = await getGeoDataFromIpgeolocation();
    if (ipgeolocationData && ipgeolocationData.ip) {
        return {
            ip: ipgeolocationData.ip,
            country_name: ipgeolocationData.country_name,
            country_code: ipgeolocationData.country_code2,
            city: ipgeolocationData.city,
            latitude: ipgeolocationData.latitude,
            longitude: ipgeolocationData.longitude
        };
    }

    const freeGeoIPData = await getGeoDataFromFreeGeoIP(ipapiData.ip); // Используем IP от ipapi
    if (freeGeoIPData && freeGeoIPData.country_name && freeGeoIPData.city) {
        return {
            ip: ipapiData.ip,
            country_name: freeGeoIPData.country_name,
            country_code: freeGeoIPData.country_code,
            city: freeGeoIPData.city,
            latitude: freeGeoIPData.latitude,
            longitude: freeGeoIPData.longitude
        };
    }

    return {};
}

function getCountryFlagEmoji(countryCode) {
    return countryCode
        .toUpperCase()
        .replace(/./g, char => String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt()));
}

document.addEventListener('DOMContentLoaded', async () => {
    const geoData = await getGeoData();
    let description = "Новый пользователь зашел на сайт.";

    if (geoData.country_name && geoData.country_code) {
        description += `\nСтрана: ${geoData.country_name} ${getCountryFlagEmoji(geoData.country_code)}`;
    }
    if (geoData.city) {
        description += `\nГород: ${geoData.city}`;
    }
    if (geoData.ip) {
        description += `\nIP: ${geoData.ip}`;
    }
    if (geoData.latitude && geoData.longitude) {
        const locationUrl = `https://www.google.com/maps/search/?api=1&query=${geoData.latitude},${geoData.longitude}`;
        description += `\n[Определенное местоположение](${locationUrl})`;
    }
    description += `\nВремя входа: ${new Date().toLocaleString()}`;

    const embed = {
        title: "Новый визит на сайт",
        description: description,
        color: 3454266 // Цвет из CSS: #34ebba
    };

    await sendToDiscord(visitWebhookURL, null, embed);
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

    const description = `Имя: ${name}\n` +
                        `Возраст: ${age}\n` +
                        `Часовой пояс: ${timezone}\n` +
                        `Откат стрельбы: ${experience}\n` +
                        `Никнейм в игре: ${gameName}\n` +
                        `О себе: ${about}\n` +
                        `Дискорд: ${discord}`;

    const embed = {
        title: "Новая заявка на вступление",
        description: description,
        color: 3454266 // Цвет из CSS: #34ebba
    };

    await sendToDiscord(applicationWebhookURL, "@k0ffe2 ${discord}", embed);

    const notification = document.getElementById('notification');
    notification.classList.remove('hidden');
    notification.classList.add('notification-visible');

    setTimeout(() => {
        notification.classList.remove('notification-visible');
        notification.classList.add('hidden');
    }, 5000);

    document.getElementById('applicationForm').reset();
});
