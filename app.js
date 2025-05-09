let time = 25 * 60;
let timerInterval;
let isRunning = false;
let currentMode = 'pomodoro';
let totalCount = +localStorage.getItem('pomodoroCount') || 0;
let dailyDate = localStorage.getItem('dailyDate') || new Date().toLocaleDateString();
let dailyCount = dailyDate === new Date().toLocaleDateString() ? +localStorage.getItem('dailyPomodoroCount') || 0 : 0;
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const timeSettings = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

let motivationalQuotes = [
  "Great job! Keep up the good work!",
  "Productivity is your superpower!",
  "One step at a time - you're doing amazing!",
  "Every pomodoro brings you closer to your goals!",
  "Stay focused, stay awesome!",
  "You're making progress with every session!",
  "Consistency is key - and you're nailing it!",
  "Your dedication is inspiring!",
  "Another session down, another step forward!",
  "The expert in anything was once a beginner - keep going!"
];
let usedQuotes = [];

const timerEl = document.getElementById('timer');
const alarmSound = document.getElementById('alarmSound');
const countEl = document.getElementById('count');
const dailyCountEl = document.getElementById('dailyCount');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const progressBar = document.getElementById('progressBar');

let originalTime = timeSettings[currentMode];

function updateDisplay() {
  const minutes = Math.floor(time / 60).toString().padStart(2, '0');
  const seconds = (time % 60).toString().padStart(2, '0');
  timerEl.textContent = `${minutes}:${seconds}`;
  updateProgress();
}

function updateProgress() {
  const percent = ((originalTime - time) / originalTime) * 100;
  progressBar.style.width = percent + "%";
}

function setMode(mode) {
  currentMode = mode;
  time = timeSettings[mode];
  originalTime = timeSettings[mode];
  resetTimer();
}

function showMotivationalQuote() {
  if (motivationalQuotes.length === 0) {
    motivationalQuotes = [...usedQuotes];
    usedQuotes = [];
  }
  
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  const quote = motivationalQuotes.splice(randomIndex, 1)[0];
  usedQuotes.push(quote);
  
  const quoteEl = document.createElement('div');
  quoteEl.className = 'motivational-quote';
  quoteEl.textContent = quote;
  document.body.appendChild(quoteEl);
  
  setTimeout(() => {
    quoteEl.remove();
  }, 300000); // 5 minutes = 300,000 milliseconds
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timerInterval = setInterval(() => {
    if (time > 0) {
      time--;
      updateDisplay();
    } else {
      clearInterval(timerInterval);
      isRunning = false;
      alarmSound.play();
      sendNotification(`${currentMode} session done!`);

      if (currentMode === 'pomodoro') {
        totalCount++;
        localStorage.setItem('pomodoroCount', totalCount);
        dailyCount++;
        localStorage.setItem('dailyPomodoroCount', dailyCount);
        localStorage.setItem('dailyDate', new Date().toLocaleDateString());
        countEl.textContent = totalCount;
        dailyCountEl.textContent = dailyCount;
        setMode('short');
        startTimer();
        showMotivationalQuote();
      } else {
        setMode('pomodoro');
        startTimer();
      }
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  isRunning = false;
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  time = timeSettings[currentMode];
  originalTime = time;
  updateDisplay();
}

function toggleDarkMode() {
  document.body.classList.toggle('dark');
  renderTasks();
}

function applyCustomTimes() {
  const pomo = parseInt(document.getElementById("customPomodoro").value);
  const short = parseInt(document.getElementById("customShort").value);
  const long = parseInt(document.getElementById("customLong").value);

  if (!isNaN(pomo) && pomo > 0) timeSettings.pomodoro = pomo * 60;
  if (!isNaN(short) && short > 0) timeSettings.short = short * 60;
  if (!isNaN(long) && long > 0) timeSettings.long = long * 60;

  setMode('pomodoro');
}

function addTask(text) {
  tasks.push(text);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, i) => {
    const li = document.createElement('li');
    li.classList.toggle('dark', document.body.classList.contains('dark'));
    li.innerHTML = `${task} <button onclick="deleteTask(${i})">❌</button>`;
    taskList.appendChild(li);
  });
}

function sendNotification(msg) {
  if (Notification.permission === "granted") {
    new Notification("Pomodoro Timer", { body: msg });
  }
}

taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && taskInput.value.trim()) {
    addTask(taskInput.value.trim());
    taskInput.value = '';
  }
});

updateDisplay();
renderTasks();
countEl.textContent = totalCount;
dailyCountEl.textContent = dailyCount;