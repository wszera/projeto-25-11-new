// Variáveis para o gerenciamento de tarefas e atividades
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let activities = JSON.parse(localStorage.getItem('activities')) || [];
let streak = parseInt(localStorage.getItem('streak')) || 0;
let completedTasksHistory = JSON.parse(localStorage.getItem('completedTasksHistory')) || [];  // Histórico de tarefas concluídas

// Elementos da UI
const taskInput = document.getElementById('task-input');
const tagSelect = document.getElementById('tag-select');
const taskLists = {
  saude: document.getElementById('task-list-saude'),
  estudo: document.getElementById('task-list-estudo'),
  lazer: document.getElementById('task-list-lazer'),
  trabalho: document.getElementById('task-list-trabalho'),
  outros: document.getElementById('task-list-outros')
};
const streakCount = document.getElementById('streak-count');
const streakBar = document.getElementById('streak-bar');
const finishDayBtn = document.getElementById('finish-day-btn');
const addTaskBtn = document.getElementById('add-task-btn');
const activityInput = document.getElementById('activity');
const historyList = document.getElementById('history-list');
const reportElement = document.getElementById('report');
const activityStatsContainer = document.getElementById("activityStats");
const competitionHistoryContainer = document.getElementById("competitionHistory");

// Função para salvar os dados em um arquivo JSON
function saveDataToJSON() {
  try {
    const dataToSave = {
      tasks,
      activities,
      streak,
      completedTasksHistory
    };

    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'settings.json';
    link.click();
    URL.revokeObjectURL(url);

    console.log('Dados salvos no arquivo JSON:', dataToSave);
  } catch (error) {
    console.error('Erro ao salvar dados no arquivo JSON:', error);
  }
}

// Função para atualizar o progresso do streak
function updateStreak() {
  streakCount.textContent = `Sequência: ${streak} dias`;
  const percentage = Math.min(streak * 2, 100);
  streakBar.style.width = `${percentage}%`;
}

// Função para renderizar a lista de tarefas
function renderTasks() {
  Object.values(taskLists).forEach(list => list.innerHTML = '');

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.classList.toggle('completed', task.completed);
    li.innerHTML = `
      <span>${task.name}</span>
      <button onclick="toggleTaskCompletion(${index})">${task.completed ? 'Desmarcar' : 'Concluir'}</button>
    `;
    taskLists[task.tag].appendChild(li);
  });

  updateStreak();
}

// Função para adicionar uma nova tarefa
function addTask() {
  const taskName = taskInput.value.trim();
  const tag = tagSelect.value;

  if (taskName === '') {
    taskInput.classList.add('error');
    alert('Por favor, insira um nome para a tarefa.');
    return;
  } else {
    taskInput.classList.remove('error');
  }

  const newTask = { name: taskName, tag, completed: false };
  tasks.push(newTask);
  taskInput.value = '';
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

// Função para marcar a tarefa como concluída ou desmarcar
function toggleTaskCompletion(index) {
  tasks[index].completed = !tasks[index].completed;
  if (tasks[index].completed) {
    tasks[index].completionDate = new Date().toISOString().split('T')[0];
  }

  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
}

// Função para finalizar o dia e gerenciar streak
function finishDay() {
  if (tasks.length === 0) {
    alert('Você não adicionou nenhuma tarefa para hoje!');
    return;
  }

  const allCompleted = tasks.every(task => task.completed);

  if (allCompleted) {
    streak++;
    alert('Parabéns! Você completou todas as tarefas do dia!');
    if (streak % 5 === 0) {
      alert(`Parabéns! Você completou ${streak} dias consecutivos! Continue assim! 🎉`);
    }
  } else {
    streak = 0;
    alert('Ainda há tarefas não concluídas! A sequência de dias foi resetada.');
  }

  localStorage.setItem('streak', streak);

  const completedTasksForToday = tasks.filter(task => task.completed).map(task => ({
    name: task.name,
    tag: task.tag,
    completionDate: task.completionDate || new Date().toISOString().split('T')[0]
  }));

  if (completedTasksForToday.length > 0) {
    completedTasksHistory.push({
      date: new Date().toISOString().split('T')[0],
      completedTasks: completedTasksForToday
    });
    localStorage.setItem('completedTasksHistory', JSON.stringify(completedTasksHistory));
  }

  tasks = [];
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
  updateStreak();
}

// Exibe estatísticas de atividades
function displayActivityStats() {
  const completedDaysByType = getCompletedDaysByType();
  const activityData = {
    labels: ["Saúde", "Estudo", "Lazer", "Trabalho", "Outros"],
    data: [
      tasks.filter(task => task.tag === "saude" && task.completed).length,
      tasks.filter(task => task.tag === "estudo" && task.completed).length,
      tasks.filter(task => task.tag === "lazer" && task.completed).length,
      tasks.filter(task => task.tag === "trabalho" && task.completed).length,
      tasks.filter(task => task.tag === "outros" && task.completed).length
    ]
  };

  activityData.labels.forEach((activity, index) => {
    const frequency = activityData.data[index];
    const completedDays = completedDaysByType[activity.toLowerCase()];

    const listItem = document.createElement("li");
    listItem.textContent = `${activity}: ${frequency} tarefas concluídas (${completedDays} dias concluídos neste tipo de atividade)`;
    activityStatsContainer.appendChild(listItem);
  });
}

// Carregar os dados da página ao iniciar
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  displayActivityStats();
  updateStreak();
});

// Eventos de clique dos botões
addTaskBtn.addEventListener('click', addTask);
finishDayBtn.addEventListener('click', finishDay);
document.getElementById('save-btn').addEventListener('click', saveDataToJSON);
