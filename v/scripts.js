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

    const formData = new FormData();
    formData.append('token', token);
    formData.append('channelId', channelId);
    formData.append('messages', JSON.stringify([messageText])); // Отправляем сообщение как массив
    formData.append('image', image);

    fetch('/send-message', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Произошла ошибка');
        }
        console.log('Сообщение успешно отправлено');
    })
    .catch(error => {
        console.error('Произошла ошибка:', error);
});
});

function toggleTheme() {
const body = document.body;
body.classList.toggle('light-theme');
body.classList.toggle('dark-theme');
}
