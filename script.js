let totalEarnings = 0;
let sessionEarnings = 0;
let log = [];

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

function saveTransaction() {
    const amountInput = document.getElementById('amountInput');
    const commentInput = document.getElementById('commentInput');
    const amount = parseFloat(amountInput.value);
    const comment = commentInput.value.trim();

    if (!isNaN(amount) && comment !== '') {
        const now = new Date();
        const time = now.toLocaleTimeString('en-GB');
        log.unshift({ time, amount, comment });

        sessionEarnings += amount;
        totalEarnings += amount;
        updateDisplay();

        amountInput.value = '';
        commentInput.value = '';
    } else {
        alert('Пожалуйста, введите сумму и комментарий.');
    }
}

function newSession() {
    sessionEarnings = 0;
    updateDisplay();
}

function resetData() {
    sessionEarnings = 0;
    totalEarnings = 0;
    log = [];
    updateDisplay();
}

// Initial display update
updateDisplay();
