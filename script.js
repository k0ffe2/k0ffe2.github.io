let totalEarnings = 0;
let sessionEarnings = 0;
let log = JSON.parse(localStorage.getItem('log')) || [];

function updateDisplay() {
    document.getElementById('sessionEarnings').textContent = `${sessionEarnings}$`;
    document.getElementById('totalEarnings').textContent = `${totalEarnings}$`;
    displayLog();
    updateTime();
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

function saveTransaction() {
    const amountInput = document.getElementById('amountInput');
    const commentInput = document.getElementById('commentInput');
    const amount = parseFloat(amountInput.value);
    const comment = commentInput.value.trim();

    if (!isNaN(amount) && comment !== '') {
        const now = new Date();
        const moscowTime = now.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' });
        const almatyTime = now.toLocaleTimeString('ru-RU', { timeZone: 'Asia/Almaty' });
        log.unshift({ time: `МСК: ${moscowTime}, Алматы: ${almatyTime}`, amount, comment });

        sessionEarnings += amount;
        totalEarnings += amount;
        updateDisplay();

        amountInput.value = '';
        commentInput.value = '';

        localStorage.setItem('log', JSON.stringify(log));
        localStorage.setItem('totalEarnings', totalEarnings);
        localStorage.setItem('sessionEarnings', sessionEarnings);
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

function updateTime() {
    const now = new Date();
    const moscowTime = now.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' });
    const almatyTime = now.toLocaleTimeString('ru-RU', { timeZone: 'Asia/Almaty' });
    document.getElementById('moscowTime').textContent = moscowTime;
    document.getElementById('almatyTime').textContent = almatyTime;
}

setInterval(updateTime, 1000);

document.addEventListener('DOMContentLoaded', () => {
    totalEarnings = parseFloat(localStorage.getItem('totalEarnings')) || 0;
    sessionEarnings = parseFloat(localStorage.getItem('sessionEarnings')) || 0;
    updateDisplay();
});
