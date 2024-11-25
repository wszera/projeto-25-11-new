// Iniciar com dados vazios
let users = [];
let challenges = [];

// Carregar dados quando a página carregar
window.onload = function() {
    // Inicializar os usuários padrão
    users = [
        { name: 'João', points: 0, maxPoints: 0 },
        { name: 'Maria', points: 0, maxPoints: 0 },
        { name: 'Carlos', points: 0, maxPoints: 0 }
    ];

    // Limpar o localStorage para iniciar do zero
    localStorage.removeItem('users');
    localStorage.removeItem('challenges');

    updateLeaderboard();
    renderChallenges();
};

// Função auxiliar para exibir uma notificação (Sucesso ou Erro)
function showNotification(icon, title, text) {
    Swal.fire({ icon, title, text });
}

// Função para renderizar os desafios
function renderChallenges() {
    const challengesList = document.getElementById('challengesList');
    challengesList.innerHTML = ''; // Limpar lista antes de renderizar

    challenges.forEach((challenge, index) => {
        const challengeDiv = document.createElement('div');
        challengeDiv.classList.add('challenge-item');
        
        // Condição para não mostrar o botão "Começar" se o desafio foi falhado
        let challengeHtml = `
            <strong>Desafio ${index + 1}:</strong> ${challenge.name} (${challenge.days} dias) 
            <span class="challenge-type">${challenge.type}</span>
        `;

        // Verifica se o desafio está concluído
        if (challenge.completedDays === challenge.days) {
            challengeHtml += '<span class="completed">Concluído!</span>';
        } else if (!challenge.failed) { // Se não for falhado, pode mostrar o botão "Começar"
            challengeHtml += `<button onclick="startChallenge(${index})" class="btn">Começar</button>`;
        }

        // Se o desafio falhou, ele não pode ser reiniciado e exibe a mensagem de falha
        if (challenge.failed) {
            challengeHtml += '<span class="failed">Falhou - Não é mais possível completar</span>';
        } else if (challenge.completedDays < challenge.days) {
            // Exibe o botão "Não concluiu no prazo" caso o desafio ainda não tenha sido concluído
            challengeHtml += `<button onclick="failedChallenge(${index})" class="btn">Não Concluiu no Prazo</button>`;
        }

        challengeDiv.innerHTML = challengeHtml;
        challengesList.appendChild(challengeDiv);
    });
}

// Função para criar um novo desafio
document.getElementById('challengeForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('challengeName').value;
    const days = parseInt(document.getElementById('challengeDays').value);
    const type = document.getElementById('challengeType').value;

    if (name && days > 0 && type) {
        challenges.push({ name, days, type, completedDays: 0, completed: false, failed: false });
        renderChallenges();
        showNotification('success', 'Desafio Criado!', `Agora você pode começar a manter a sua consistência no desafio de ${type.toLowerCase()}!`);

        // Salvar desafios no localStorage
        localStorage.setItem('challenges', JSON.stringify(challenges));
    } else {
        showNotification('error', 'Erro', 'Preencha todos os campos corretamente!');
    }
});

// Função para começar um desafio
function startChallenge(index) {
    const challenge = challenges[index];
    challenge.completedDays++;

    if (challenge.completedDays === challenge.days) {
        challenge.completed = true;
        showNotification('success', 'Parabéns!', `Você completou o desafio de ${challenge.type}: ${challenge.name}`);
        addReward('Medalha de Ouro', 10 * challenge.days); // Adiciona 10 pontos por dia concluído no desafio
    } else {
        showNotification('info', 'Continue!', `Você completou ${challenge.completedDays} de ${challenge.days} dias no desafio de ${challenge.type}.`);
    }

    // Salvar desafios no localStorage
    localStorage.setItem('challenges', JSON.stringify(challenges));

    renderChallenges(); // Re-renderiza os desafios para mostrar o status atualizado
}

// Função para quando o usuário não concluir no prazo
function failedChallenge(index) {
    const challenge = challenges[index];
    
    // Alterar o status do desafio para falhado
    challenge.failed = true; // Marcamos o desafio como falhado
    challenge.completed = false; // Garantimos que o desafio não está concluído

    // Mover para a lista de falhados e desabilitar a possibilidade de reiniciar
    const failedChallenge = challenges.splice(index, 1)[0];
    failedChallenge.status = "Falhado"; // Adiciona uma tag de falhado
    challenges.push(failedChallenge);

    // Salvar alterações no localStorage
    localStorage.setItem('challenges', JSON.stringify(challenges));

    // Exibe a notificação de falha
    showNotification('error', 'Falha no Prazo!', `Você não concluiu o desafio de ${challenge.name} no prazo. Desafio movido para a área de falhados.`);

    // Re-renderiza os desafios e o quadro de líderes
    renderChallenges();
    updateLeaderboard();
}

// Função para adicionar recompensas
function addReward(name, points) {
    const rewardsList = document.getElementById('rewardsList');
    const rewardDiv = document.createElement('div');
    rewardDiv.innerHTML = `${name} - +${points} pontos`;
    rewardsList.appendChild(rewardDiv);

    // Atualizar pontos do usuário
    const currentUser = users[0];
    currentUser.points += points;

    // Atualiza a pontuação máxima alcançada
    if (currentUser.points > currentUser.maxPoints) {
        currentUser.maxPoints = currentUser.points;
    }

    // Salvar os usuários no localStorage
    localStorage.setItem('users', JSON.stringify(users));

    updateLeaderboard();
}

// Função para atualizar o Quadro de Líderes
function updateLeaderboard() {
    const currentUser = users[0];
    
    const leaderboard = document.getElementById('leaderboard').getElementsByTagName('tbody')[0];
    leaderboard.innerHTML = '';

    // Contagem de desafios concluídos e falhados
    const completedChallenges = challenges.filter(challenge => challenge.completed).length;
    const failedChallenges = challenges.length - completedChallenges;

    // Total de desafios adicionados
    const totalChallenges = challenges.length;

    // Calcula a média de pontos por desafio, considerando o total de desafios adicionados
    const averagePoints = totalChallenges > 0 ? (currentUser.points / totalChallenges).toFixed(2) : 0;

    // Exibe o desempenho do usuário (sem competidores)
    const row = leaderboard.insertRow();
    row.innerHTML = `
        <td>1</td>
        <td>${currentUser.name}</td>
        <td>Pontos: ${currentUser.points}</td>
        <td>Máximo: ${currentUser.maxPoints}</td>
        <td>Desafios Concluídos: ${completedChallenges}</td>
        <td>Desafios Falhados: ${failedChallenges}</td>
        <td>Média de Pontos/Desafio: ${averagePoints}</td>
    `;
}

function goBack() {
    window.history.back();
}

// Inicializar a aplicação
updateLeaderboard();
renderChallenges();
