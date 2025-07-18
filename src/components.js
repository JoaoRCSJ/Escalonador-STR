// Simulador de Escalonador de Tarefas
class TaskScheduler {
    constructor() {
        this.tasks = [];
        this.scheduledTasks = [];
        this.currentTime = 0;
    }

    // Gera os campos de entrada para as tarefas
    generateTaskInputs() {
        const numTasks = parseInt(document.getElementById('numTasks').value);
        const container = document.getElementById('tasksContainer');
        
        if (numTasks < 1 || numTasks > 20) {
            alert('Por favor, insira um número entre 1 e 20 tarefas.');
            return;
        }

        container.innerHTML = '';

        for (let i = 1; i <= numTasks; i++) {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task-item';
            taskDiv.innerHTML = `
                <div class="task-header">Tarefa ${i}</div>
                <div class="task-inputs">
                    <div class="input-group">
                        <label for="priority${i}">Prioridade:</label>
                        <input type="number" id="priority${i}" min="1" max="10" value="${i}" placeholder="1-10 (1=maior prioridade)">
                    </div>
                    <div class="input-group">
                        <label for="cost${i}">Custo (tempo):</label>
                        <input type="number" id="cost${i}" min="1" value="${Math.floor(Math.random() * 5) + 1}" placeholder="Tempo de execução">
                    </div>
                    <div class="input-group">
                        <label for="deadline${i}">Deadline:</label>
                        <input type="number" id="deadline${i}" min="1" value="${i * 3 + Math.floor(Math.random() * 3)}" placeholder="Tempo limite">
                    </div>
                </div>
            `;
            container.appendChild(taskDiv);
        }
    }

    // Coleta os dados das tarefas dos campos de entrada
    collectTaskData() {
        const numTasks = parseInt(document.getElementById('numTasks').value);
        this.tasks = [];

        for (let i = 1; i <= numTasks; i++) {
            const priority = parseInt(document.getElementById(`priority${i}`).value);
            const cost = parseInt(document.getElementById(`cost${i}`).value);
            const deadline = parseInt(document.getElementById(`deadline${i}`).value);

            if (isNaN(priority) || isNaN(cost) || isNaN(deadline)) {
                throw new Error(`Por favor, preencha todos os campos da Tarefa ${i}.`);
            }

            if (priority < 1 || priority > 10) {
                throw new Error(`A prioridade da Tarefa ${i} deve estar entre 1 e 10.`);
            }

            if (cost < 1) {
                throw new Error(`O custo da Tarefa ${i} deve ser maior que 0.`);
            }

            if (deadline < 1) {
                throw new Error(`O deadline da Tarefa ${i} deve ser maior que 0.`);
            }

            this.tasks.push({
                id: i,
                priority: priority,
                cost: cost,
                deadline: deadline,
                startTime: 0,
                endTime: 0,
                completed: false,
                missedDeadline: false
            });
        }
    }

    // Algoritmo de escalonamento por prioridade
    priorityScheduling() {
        // Ordena por prioridade (menor número = maior prioridade)
        return [...this.tasks].sort((a, b) => a.priority - b.priority);
    }

    // Algoritmo Shortest Job First (SJF)
    sjfScheduling() {
        // Ordena por custo (menor tempo primeiro)
        return [...this.tasks].sort((a, b) => a.cost - b.cost);
    }

    // Algoritmo Earliest Deadline First (EDF)
    edfScheduling() {
        // Ordena por deadline (deadline mais próximo primeiro)
        return [...this.tasks].sort((a, b) => a.deadline - b.deadline);
    }

    // Algoritmo First Come First Served (FCFS)
    fcfsScheduling() {
        // Mantém a ordem original (por ID)
        return [...this.tasks].sort((a, b) => a.id - b.id);
    }

    // Executa o escalonamento baseado no algoritmo selecionado
    schedule() {
        const algorithm = document.getElementById('algorithm').value;
        let orderedTasks;

        switch (algorithm) {
            case 'priority':
                orderedTasks = this.priorityScheduling();
                break;
            case 'sjf':
                orderedTasks = this.sjfScheduling();
                break;
            case 'edf':
                orderedTasks = this.edfScheduling();
                break;
            case 'fcfs':
                orderedTasks = this.fcfsScheduling();
                break;
            default:
                orderedTasks = this.priorityScheduling();
        }

        // Simula a execução das tarefas
        this.currentTime = 0;
        this.scheduledTasks = [];

        orderedTasks.forEach(task => {
            const scheduledTask = { ...task };
            scheduledTask.startTime = this.currentTime;
            scheduledTask.endTime = this.currentTime + task.cost;
            scheduledTask.completed = true;
            scheduledTask.missedDeadline = scheduledTask.endTime > task.deadline;
            
            this.scheduledTasks.push(scheduledTask);
            this.currentTime += task.cost;
        });

        return this.scheduledTasks;
    }

    // Calcula estatísticas do escalonamento
    calculateStats() {
        const totalTime = this.currentTime;
        const completedTasks = this.scheduledTasks.length;
        const missedDeadlines = this.scheduledTasks.filter(task => task.missedDeadline).length;
        const isSchedulable = missedDeadlines === 0;

        return {
            totalTime,
            completedTasks,
            missedDeadlines,
            isSchedulable
        };
    }

    // Verifica se o sistema é escalonável usando teste de utilização
    checkSchedulability() {
        const totalCost = this.tasks.reduce((sum, task) => sum + task.cost, 0);
        const maxDeadline = Math.max(...this.tasks.map(task => task.deadline));
        
        // Teste básico: soma dos custos deve ser <= menor deadline
        const minDeadline = Math.min(...this.tasks.map(task => task.deadline));
        const utilizationTest = totalCost <= minDeadline;

        // Teste de Liu e Layland para Rate Monotonic (aproximação)
        const n = this.tasks.length;
        const utilizationBound = n * (Math.pow(2, 1/n) - 1);
        const utilization = this.tasks.reduce((sum, task) => sum + (task.cost / task.deadline), 0);
        
        return {
            utilizationTest,
            utilizationBound,
            utilization,
            feasible: utilization <= 1.0
        };
    }
}

// Instância global do escalonador
const scheduler = new TaskScheduler();

// Função para gerar campos de entrada das tarefas
function generateTaskInputs() {
    scheduler.generateTaskInputs();
}

// Função para executar o escalonamento
function runScheduler() {
    try {
        // Coleta dados das tarefas
        scheduler.collectTaskData();
        
        // Executa o escalonamento
        const scheduledTasks = scheduler.schedule();
        
        // Calcula estatísticas
        const stats = scheduler.calculateStats();
        const schedulability = scheduler.checkSchedulability();
        
        // Exibe os resultados
        displayResults(scheduledTasks, stats, schedulability);
        
    } catch (error) {
        alert(error.message);
    }
}

// Função para exibir os resultados
function displayResults(scheduledTasks, stats, schedulability) {
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';

    // Atualiza estatísticas
    document.getElementById('totalTime').textContent = stats.totalTime;
    document.getElementById('completedTasks').textContent = stats.completedTasks;
    document.getElementById('missedDeadlines').textContent = stats.missedDeadlines;
    
    const schedulabilityElement = document.getElementById('schedulability');
    if (stats.isSchedulable) {
        schedulabilityElement.textContent = 'SIM';
        schedulabilityElement.className = 'stat-value schedulable';
    } else {
        schedulabilityElement.textContent = 'NÃO';
        schedulabilityElement.className = 'stat-value not-schedulable';
    }

    // Exibe alertas
    displayAlerts(stats, schedulability);

    // Gera o diagrama de Gantt
    generateGanttChart(scheduledTasks, stats.totalTime);

    // Rola para os resultados
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Função para exibir alertas
function displayAlerts(stats, schedulability) {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = '';

    if (stats.isSchedulable) {
        alertContainer.innerHTML = `
            <div class="alert alert-success">
                ✅ <strong>Sistema Escalonável!</strong> Todas as tarefas foram concluídas dentro do prazo.
            </div>
        `;
    } else {
        alertContainer.innerHTML = `
            <div class="alert alert-danger">
                ❌ <strong>Sistema Não Escalonável!</strong> ${stats.missedDeadlines} tarefa(s) perderam o deadline.
            </div>
        `;
    }

    // Adiciona informações sobre utilização
    if (schedulability.utilization > 1.0) {
        alertContainer.innerHTML += `
            <div class="alert alert-danger">
                ⚠️ <strong>Utilização Excessiva!</strong> Utilização do sistema: ${(schedulability.utilization * 100).toFixed(1)}% (máximo: 100%)
            </div>
        `;
    }
}

// Função para gerar o diagrama de Gantt
function generateGanttChart(scheduledTasks, totalTime) {
    const ganttChart = document.getElementById('ganttChart');
    ganttChart.innerHTML = '';

    // Cria a linha do tempo
    const timeline = document.createElement('div');
    timeline.className = 'timeline';
    
    for (let i = 0; i <= totalTime; i++) {
        const timeUnit = document.createElement('div');
        timeUnit.className = 'time-unit';
        timeUnit.textContent = i;
        timeline.appendChild(timeUnit);
    }
    ganttChart.appendChild(timeline);

    // Cria as barras das tarefas
    scheduledTasks.forEach(task => {
        const taskRow = document.createElement('div');
        taskRow.className = 'task-row';

        // Label da tarefa
        const taskLabel = document.createElement('div');
        taskLabel.className = 'task-label';
        taskLabel.textContent = `T${task.id}`;
        taskRow.appendChild(taskLabel);

        // Container para a barra da tarefa
        const taskBarContainer = document.createElement('div');
        taskBarContainer.style.display = 'flex';
        taskBarContainer.style.flex = '1';
        taskBarContainer.style.position = 'relative';

        // Espaço antes da tarefa
        for (let i = 0; i < task.startTime; i++) {
            const emptyUnit = document.createElement('div');
            emptyUnit.style.flex = '1';
            emptyUnit.style.minWidth = '40px';
            taskBarContainer.appendChild(emptyUnit);
        }

        // Barra da tarefa
        const taskBar = document.createElement('div');
        taskBar.className = 'task-bar';
        taskBar.style.flex = task.cost;
        taskBar.style.minWidth = `${task.cost * 40}px`;
        taskBar.textContent = `T${task.id} (${task.cost})`;
        
        if (task.missedDeadline) {
            taskBar.classList.add('task-missed');
        } else {
            taskBar.classList.add('task-completed');
        }

        taskBarContainer.appendChild(taskBar);

        // Espaço após a tarefa
        for (let i = task.endTime; i < totalTime; i++) {
            const emptyUnit = document.createElement('div');
            emptyUnit.style.flex = '1';
            emptyUnit.style.minWidth = '40px';
            taskBarContainer.appendChild(emptyUnit);
        }

        // Marcador de deadline
        if (task.deadline <= totalTime) {
            const deadlineMarker = document.createElement('div');
            deadlineMarker.className = 'deadline-marker';
            deadlineMarker.style.left = `${(task.deadline / totalTime) * 100}%`;
            deadlineMarker.title = `Deadline da Tarefa ${task.id}: ${task.deadline}`;
            taskBarContainer.appendChild(deadlineMarker);
        }

        taskRow.appendChild(taskBarContainer);
        ganttChart.appendChild(taskRow);
    });

    // Adiciona legenda
    const legend = document.createElement('div');
    legend.style.marginTop = '20px';
    legend.style.fontSize = '14px';
    legend.innerHTML = `
        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 20px; height: 20px; background: linear-gradient(135deg, #0d5a20ff 0%, #143305ff 100%); border-radius: 3px;"></div>
                <span>Tarefa Concluída no Prazo</span>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 20px; height: 20px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); border-radius: 3px;"></div>
                <span>Tarefa com Deadline Perdido</span>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
                <div style="width: 3px; height: 20px; background: #ff4757;"></div>
                <span>⚠ Marcador de Deadline</span>
            </div>
        </div>
    `;
    ganttChart.appendChild(legend);
}

// Função para limpar os resultados
function clearResults() {
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'none';
    
    // Limpa os dados do escalonador
    scheduler.tasks = [];
    scheduler.scheduledTasks = [];
    scheduler.currentTime = 0;
}

// Inicializa a página com 3 tarefas por padrão
document.addEventListener('DOMContentLoaded', function() {
    generateTaskInputs();
});

