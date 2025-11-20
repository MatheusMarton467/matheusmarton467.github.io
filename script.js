// =========================================================================
// 1. VARIÁVEIS DE CONTROLE GLOBAIS E MAPEAMENTOS
// =========================================================================

// Elementos DOM
const bubble = document.getElementById('ghost-speech-bubble');
const neonCat = document.getElementById('neon-cat');

// Timers e Intervalos para Animação e Limpeza
let hideTimeout;
let positionInterval = null;
let confettiInterval = null;

// Mapeamento de EXPRESSÕES (Chave do data-speak -> Classe CSS do SVG)
const expressionMap = {
    'ver-projeto': 'exp-orgulho',
    'ver-projeto1': 'exp-desafio',
    'ver-curriculo1': 'exp-desafio',
    'ver-curriculo2': 'exp-orgulho',
    'ver-curriculo3': 'exp-orgulho',
    'contato-github': 'exp-orgulho',
    'contato-email': 'exp-interesse',
    'contato-linkedin': 'exp-interesse',
    'baixar-curriculo': 'exp-curriculo'
};

// Mapeamento de FRASES (Chave do data-speak -> Texto exibido no balão)
const phrases = {
    'ver-projeto': 'Em breve teremos mais projetos postados!',
    'ver-projeto1': 'Tão divertido de jogar, Mas deu um trabalho...',
    'ver-curriculo1': 'Muita dedicação por trás deste aqui! Valeu a pena cada hora de estudo!',
    'ver-curriculo2': 'Adorei fazer este curso! Um ótimo complemento para o meu portfólio!',
    'ver-curriculo3': 'Orgulho em mostrar este certificado. Pode clicar para conferir!',
    'contato-email': 'Me mande uma mensagem!',
    'contato-linkedin': 'Me siga para ver mais...',
    'contato-github': 'Os códigos estão aqui!',
    'baixar-curriculo': '✨ Contrate este Dev! ✨'
};

// =========================================================================
// 2. FUNÇÕES DE EXPRESSÃO E BALÃO (GHOST INTERACTION)
// =========================================================================

/**
 * Remove todas as classes de expressão do fantasma, restaurando a face padrão.
 */
function clearExpressions() {
    neonCat.classList.remove('exp-desafio', 'exp-interesse', 'exp-orgulho', 'exp-curriculo');
}

/**
 * Calcula e define a posição do balão, centralizando-o acima do fantasma.
 */
function positionBubble() {
    if (!bubble || !neonCat) {
        if (positionInterval) clearInterval(positionInterval);
        return;
    }

    // Captura a posição atual do fantasma na janela (viewport)
    const catRect = neonCat.getBoundingClientRect();

    // Estima dimensões do balão para cálculo
    const bubbleWidth = bubble.offsetWidth > 0 ? bubble.offsetWidth : 180;
    const bubbleHeight = bubble.offsetHeight > 0 ? bubble.offsetHeight : 50;

    // Calcula o centro X do fantasma e a posição Y final
    const centerX = catRect.left + (catRect.width / 2);
    const targetTop = catRect.top - bubbleHeight - 5;

    // Aplica as posições
    bubble.style.top = targetTop + 'px';
    bubble.style.left = (centerX - (bubbleWidth / 2)) + 'px';
}

/**
 * Exibe o balão, define o texto e inicia o rastreamento de posição.
 * @param {string} text - O texto a ser exibido no balão.
 */
function showBubble(text) {
    clearTimeout(hideTimeout);
    bubble.textContent = text;

    positionBubble(); // Posiciona imediatamente

    // Inicia o rastreamento do fantasma a cada 16ms (para seguir o movimento)
    if (!positionInterval) {
        positionInterval = setInterval(() => {
            if (bubble.classList.contains('bubble-active')) {
                positionBubble();
            } else {
                clearInterval(positionInterval);
                positionInterval = null;
            }
        }, 16);
    }

    // Torna o balão visível
    setTimeout(() => {
        bubble.classList.add('bubble-active');
    }, 10);
}

/**
 * Esconde o balão de fala e limpa o intervalo de rastreamento de posição.
 */
function hideBubble() {
    bubble.classList.remove('bubble-active');

    // Para o rastreamento do fantasma
    if (positionInterval) {
        clearInterval(positionInterval);
        positionInterval = null;
    }

    clearExpressions(); // Limpa as classes de expressão

    // Limpa o texto do balão após a transição CSS
    hideTimeout = setTimeout(() => {
        bubble.textContent = '';
    }, 300);
}


// =========================================================================
// 3. FUNÇÕES DE CONFETE (ANIMAÇÃO EXTRA)
// =========================================================================

/**
 * Inicia a animação de confete, disparando-a em loop.
 */
function startConfetti() {
    if (typeof confetti === 'undefined') return;

    stopConfetti();
    const neonColors = ['#ff69f5', '#00ffff', '#ffffff'];

    confettiInterval = setInterval(() => {
        // Disparo principal do centro da tela (simula chuva)
        confetti({
            particleCount: 20,
            spread: 60,
            origin: { x: 0.5, y: 0.8 },
            colors: neonColors,
            shapes: ['square', 'circle']
        });

        // Disparos laterais (efeito de estouro das laterais)
        confetti({ particleCount: 10, angle: 60, spread: 50, origin: { x: 0, y: 1 }, colors: neonColors });
        confetti({ particleCount: 10, angle: 120, spread: 50, origin: { x: 1, y: 1 }, colors: neonColors });
    }, 250);
}

/**
 * Para a animação de confete limpando o intervalo de repetição.
 */
function stopConfetti() {
    if (confettiInterval) {
        clearInterval(confettiInterval);
        confettiInterval = null;
    }
}


// =========================================================================
// 4. HANDLERS DE EVENTOS
// =========================================================================

/**
 * Gerencia a entrada do mouse para exibir o balão de fala e a expressão.
 * @param {Event} event - O evento mouseenter.
 */
function handleGhostInteractionEnter(event) {
    const link = event.currentTarget;
    const phraseKey = link.getAttribute('data-speak');

    if (phrases[phraseKey]) {
        showBubble(phrases[phraseKey]);

        clearExpressions();

        const expressionClass = expressionMap[phraseKey];
        if (expressionClass) {
            neonCat.classList.add(expressionClass);

            if (expressionClass === 'exp-curriculo') {
                startConfetti();
            }
        }
    }
}

/**
 * Gerencia a saída do mouse para esconder o balão de fala e limpar a expressão.
 */
function handleGhostInteractionLeave() {
    hideBubble();
    stopConfetti();
}

/**
 * Gerencia o clique nos botões de detalhes e certificado.
 * @param {Event} event - O evento click.
 */
function handleDetailToggleClick(event) {
    const botao = event.currentTarget;

    // 1. CHECAGEM CRÍTICA: Se o botão tem a classe 'btn-em-breve', não faça nada.
    if (botao.classList.contains('btn-em-breve')) {
        event.preventDefault(); // Impede rolagem (se for um <a>)
        return; // Sai da função imediatamente
    }

    // Permite que o link (se não for um botão de toggle) execute a ação padrão
    // (Abre o link do certificado ou projeto)
    if (botao.getAttribute('data-target') === null) {
        return;
    }

    event.preventDefault();

    const targetId = botao.getAttribute('data-target');
    const detalhesDiv = document.getElementById(targetId);

    // Encontra o container principal do projeto
    const projetoCard = botao.closest('.projeto');

    if (detalhesDiv && projetoCard) {
        // Alterna a classe 'ativo' para expandir/recolher a div de detalhes
        detalhesDiv.classList.toggle('ativo');

        // Alterna a classe 'expandido' no container principal para o CSS
        projetoCard.classList.toggle('expandido');

        // Altera o texto do botão (somente para os botões de toggle de detalhes)
        if (botao.classList.contains('btn-detalhes-toggle')) {
            if (detalhesDiv.classList.contains('ativo')) {
                botao.textContent = 'Menos detalhes';
                botao.classList.add('fechando');
            } else {
                botao.textContent = 'Mais detalhes';
                botao.classList.remove('fechando');
            }
        }
    }
}


// =========================================================================
// 5. INICIALIZAÇÃO DE EVENT LISTENERS (Ao carregar o DOM)
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- Configuração da Interação do Fantasma ---
    const interactiveElements = document.querySelectorAll('a[data-speak], .projeto[data-speak]');

    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', handleGhostInteractionEnter);
        element.addEventListener('mouseleave', handleGhostInteractionLeave);
    });


    // --- Configuração do Toggle de Detalhes e Certificados ---
    const toggleButtons = document.querySelectorAll('.btn-detalhes-toggle, .btn-ver-certificado');

    toggleButtons.forEach(botao => {
        botao.addEventListener('click', handleDetailToggleClick);
    });
});