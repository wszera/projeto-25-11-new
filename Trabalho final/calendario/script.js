const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null;
let events = JSON.parse(localStorage.getItem('events')) || {};

const eventColors = {
    'estudo': '#3498db',
    'lazer': '#f39c12',
    'trabalho': '#e74c3c',
    'saude': '#2ecc71',
    'outros': '#9b59b6'
};

function renderCalendar() {
    const monthYearElement = document.getElementById('month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDay = firstDayOfMonth.getDay();
    const endDay = lastDayOfMonth.getDay();

    monthYearElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Empty spaces for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
        const emptyCell = document.createElement('div');
        calendarGrid.appendChild(emptyCell);
    }

    // Create the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        dayElement.classList.add('calendar-day');
        dayElement.addEventListener('click', () => openEventModal(day));

        // Check if there's an event for this day
        if (events[day]) {
            const event = events[day];
            const eventBox = document.createElement('div');
            eventBox.classList.add('event-box');
            eventBox.style.backgroundColor = eventColors[event.type];
            eventBox.textContent = event.title;
            dayElement.appendChild(eventBox);
        }

        calendarGrid.appendChild(dayElement);
    }

    // Add empty spaces for days after the last day of the month
    for (let i = endDay + 1; i < 7; i++) {
        const emptyCell = document.createElement('div');
        calendarGrid.appendChild(emptyCell);
    }
}

function openEventModal(day) {
    selectedDate = day;
    const modal = document.getElementById('event-modal');
    const titleInput = document.getElementById('event-title');
    const descriptionInput = document.getElementById('event-description');
    const eventTypeSelect = document.getElementById('event-type');
    const reminderInput = document.getElementById('reminder');

    if (events[day]) {
        titleInput.value = events[day].title;
        descriptionInput.value = events[day].description;
        eventTypeSelect.value = events[day].type;
        reminderInput.checked = events[day].reminder;
    } else {
        titleInput.value = '';
        descriptionInput.value = '';
        eventTypeSelect.value = 'estudo';
        reminderInput.checked = false;
    }

    modal.style.display = 'flex';
}

function hideEventModal() {
    document.getElementById('event-modal').style.display = 'none';
}

function saveEvent() {
    const title = document.getElementById('event-title').value;
    const description = document.getElementById('event-description').value;
    const type = document.getElementById('event-type').value;
    const reminder = document.getElementById('reminder').checked;

    events[selectedDate] = { title, description, type, reminder };
    localStorage.setItem('events', JSON.stringify(events));
    renderCalendar();
    hideEventModal();
}

function cancelEvent() {
    hideEventModal();
}

function deleteEvent(day) {
    delete events[day];
    localStorage.setItem('events', JSON.stringify(events));
    renderCalendar();
}

document.getElementById('save-event-btn').addEventListener('click', saveEvent);
document.getElementById('cancel-event-btn').addEventListener('click', cancelEvent);
document.querySelector('.close-btn').addEventListener('click', hideEventModal);
document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
    if (currentMonth === 11) currentYear--;
    renderCalendar();
});
document.getElementById('next-month').addEventListener('click', () => {
    currentMonth = (currentMonth === 11) ? 0 : currentMonth + 1;
    if (currentMonth === 0) currentYear++;
    renderCalendar();
});
document.getElementById('back-btn').addEventListener('click', () => {
    window.history.back();
});

renderCalendar();
