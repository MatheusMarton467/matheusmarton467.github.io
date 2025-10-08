// =========================================================================
// VARIÁVEIS DE CONTROLE GLOBAIS E MAPEAMENTOS
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
// FUNÇÕES DE EXPRESSÃO E BALÃO (GHOST INTERACTION)
// =========================================================================

/**
 * Remove todas as classes de expressão do fantasma, restaurando a face padrão.
 */
function clearExpressions() {
    neonCat.classList.remove('exp-desafio', 'exp-interesse', 'exp-orgulho', 'exp-curriculo');
}

/**
 * Calcula e define a posição do balão, centralizando-o acima do fantasma.
 * Também é chamada repetidamente durante o 'showBubble' para seguir o fantasma.
 */
function positionBubble() {
    if (!bubble || !neonCat) {
        if (positionInterval) clearInterval(positionInterval);
        return; 
    }
    
    // Captura a posição atual do fantasma na janela (viewport)
    const catRect = neonCat.getBoundingClientRect();
    
    // Estima dimensões do balão para cálculo (melhora a estabilidade antes da renderização completa)
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
    
    // Torna o balão visível (com um pequeno delay para garantir a posição)
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
// FUNÇÕES DE CONFETE (ANIMAÇÃO EXTRA)
// =========================================================================

/**
 * Inicia a animação de confete, disparando-a em loop.
 */
function startConfetti() {
    if(typeof confetti === 'undefined') return; // Verifica a biblioteca externa
    
    stopConfetti(); // Garante que não haja animações anteriores rodando
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
    }, 250); // Repete a cada 250ms
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
// INICIALIZAÇÃO DE EVENT LISTENERS (Ao carregar o DOM)
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Seleciona todos os links e cards que possuem o atributo data-speak
    const links = document.querySelectorAll('a[data-speak], .projeto[data-speak]'); 
    
    links.forEach(link => {
        const phraseKey = link.getAttribute('data-speak');
        
        link.addEventListener('mouseenter', () => {
            if (phrases[phraseKey]) {
                showBubble(phrases[phraseKey]);
                
                clearExpressions(); // 1. Limpa expressões anteriores

                // 2. Lógica Modular: Pega e aplica a expressão correta
                const expressionClass = expressionMap[phraseKey];
                if (expressionClass) {
                    neonCat.classList.add(expressionClass);

                    // 3. Ações Extras: Inicia o confete apenas para o CV
                    if (expressionClass === 'exp-curriculo') {
                        startConfetti(); 
                    }
                }
            }
        });
        
        link.addEventListener('mouseleave', () => {
            hideBubble();
            stopConfetti(); // Garante que o confete pare ao sair
        });
    });
});


// =========================================================================
// CANVAS LED (Circuitos de Fundo)
// (IIFE - Função anônima auto-executável para encapsulamento)
// =========================================================================

(function() {
    const canvas = document.getElementById("ledCanvas");
    if(!canvas) return; 

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1; // Para telas HiDPI (Retina)

    let W, H;

    // --- Configurações Gráficas ---
    const NODE_RADIUS = 2.0;
    const LINE_WIDTH = 2.0;
    const NUM_PULSES = 50; 
    const PULSE_MIN_SPEED = 0.002; 
    const PULSE_MAX_SPEED = 0.006;

    const PINK = [255,105,245];
    const CYAN = [0,255,255];

    let cols, rows;
    let nodes = []; 
    let edges = []; 
    let pulses = [];

    // Utilitários de Cor e Matemática
    function rgbToStr(rgb, a=1){ return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`; }
    function lerp(a,b,t){ return a + (b-a)*t; } // Interpolação Linear

    /**
     * Redimensiona o canvas para preencher a tela e ajusta o DPI.
     */
    function resizeCanvas(){
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.style.width = W + "px";
        canvas.style.height = H + "px";
        canvas.width = Math.floor(W * dpr);
        canvas.height = Math.floor(H * dpr);
        ctx.setTransform(dpr,0,0,dpr,0,0); // Aplica o fator DPI
    }

    /**
     * Cria a estrutura de grade (nós e arestas) com aleatoriedade controlada.
     */
    function initGrid(){
        // Recalcula o número de colunas/linhas com base no tamanho da tela
        W = window.innerWidth;
        H = window.innerHeight;
        cols = Math.max(4, Math.floor(W / 200));
        rows = Math.max(3, Math.floor(H / 200));
        let cellW = W / cols;
        let cellH = H / rows;

        nodes = [];
        edges = [];

        // Criação de Nós (LEDs fixos)
        const index = (c,r) => r*cols + c;
        for(let r=0;r<rows;r++){
            for(let c=0;c<cols;c++){
                // Adiciona uma pequena aleatoriedade à posição do nó
                const x = Math.floor((c + 0.5) * cellW + (Math.random()-0.5)*cellW*0.15);
                const y = Math.floor((r + 0.5) * cellH + (Math.random()-0.5)*cellH*0.12);
                nodes.push({x,y,idx: nodes.length});
            }
        }

        // Criação de Arestas (Trilhas de conexão)
        // Conexões são feitas com probabilidade para evitar uma grade rígida
        for(let r=0;r<rows;r++){
            for(let c=0;c<cols;c++){
                const i = index(c,r);
                
                if(c < cols-1 && Math.random() < 0.6){ // Conecta à direita
                    edges.push({a:i, b:index(c+1,r)});
                }
                if(r < rows-1 && Math.random() < 0.45){ // Conecta para baixo
                    edges.push({a:i, b:index(c,r+1)});
                }
                if(c < cols-1 && r < rows-1 && Math.random() < 0.08){ // Conexão diagonal (rara)
                    edges.push({a:i, b:index(c+1,r+1)});
                }
            }
        }

        // Limpeza e Cálculo de Propriedades (Comprimento da Aresta, etc.)
        const seen = new Set();
        edges = edges.filter(e=>{
            const key = e.a < e.b ? `${e.a}-${e.b}` : `${e.b}-${e.a}`;
            if(seen.has(key)) return false;
            seen.add(key);
            const A = nodes[e.a], B = nodes[e.b];
            e.length = Math.hypot(B.x - A.x, B.y - A.y);
            return true;
        });

        // Criação de Pulses (Partículas móveis)
        pulses = [];
        const maxP = Math.min(NUM_PULSES, Math.floor(edges.length*1.2) );
        for(let i=0;i<maxP;i++){
            const edgeIdx = Math.floor(Math.random()*edges.length);
            pulses.push({
                edgeIdx,
                t: Math.random(), // Posição inicial (0 a 1)
                speed: PULSE_MIN_SPEED + Math.random()*(PULSE_MAX_SPEED-PULSE_MIN_SPEED),
                dir: Math.random() > 0.5 ? 1 : -1 // Direção inicial
            });
        }

        resizeCanvas();
    }

    /**
     * Desenha o estado atual do circuito (linhas, nós e pulsos).
     */
    function draw(){
        // Limpa o canvas (com alpha para rastro sutil, se desejar, mas clearRect é mais limpo)
        ctx.clearRect(0,0,canvas.width, canvas.height);

        // 1. Desenhar Trilhas (Edges)
        for(const e of edges){
            const A = nodes[e.a], B = nodes[e.b];
            const grad = ctx.createLinearGradient(A.x, A.y, B.x, B.y);
            grad.addColorStop(0, rgbToStr(CYAN, 0.18));
            grad.addColorStop(0.5, rgbToStr(CYAN, 0.28));
            grad.addColorStop(1, rgbToStr(PINK, 0.18));

            ctx.lineWidth = LINE_WIDTH;
            ctx.strokeStyle = grad;
            ctx.shadowColor = rgbToStr(CYAN, 0.12);
            ctx.shadowBlur = 8;
            
            ctx.beginPath();
            ctx.moveTo(A.x, A.y);
            ctx.lineTo(B.x, B.y);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // 2. Desenhar Nós (LEDs Fixos)
        for(const n of nodes){
            // Efeito de brilho principal
            ctx.beginPath();
            ctx.fillStyle = rgbToStr(CYAN, 0.9);
            ctx.shadowColor = rgbToStr(CYAN, 0.9);
            ctx.shadowBlur = 8;
            ctx.arc(n.x, n.y, NODE_RADIUS*0.9, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // 3. Desenhar Pulses (Partículas Móveis)
        ctx.globalCompositeOperation = "lighter"; // Modo de mistura para brilho
        for(const p of pulses){
            const e = edges[p.edgeIdx];
            if(!e) continue;

            // Atualiza a posição normalizada do pulso (t)
            p.t += p.speed * p.dir;
            // Inverte a direção ao atingir as extremidades (0 ou 1)
            if(p.t > 1){ p.t = 1; p.dir = -1; } 
            if(p.t < 0){ p.t = 0; p.dir = 1; }

            // Calcula a posição real (x, y) no canvas
            const A = nodes[e.a], B = nodes[e.b];
            const px = lerp(A.x, B.x, p.t);
            const py = lerp(A.y, B.y, p.t);

            // Calcula a cor (mistura de cyan e pink)
            const t_color = Math.abs(Math.sin(p.t*Math.PI));
            const r = Math.floor( lerp(CYAN[0], PINK[0], t_color) );
            const g = Math.floor( lerp(CYAN[1], PINK[1], t_color) );
            const b = Math.floor( lerp(CYAN[2], PINK[2], t_color) );

            // Efeito de brilho e desenho do pulso
            ctx.beginPath();
            ctx.shadowColor = `rgba(${r},${g},${b},0.9)`;
            ctx.shadowBlur = 14;
            ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
            ctx.arc(px, py, 3.2, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.globalCompositeOperation = "source-over";
    }

    /**
     * O loop principal de animação, chamando 'draw' a cada frame.
     */
    function loop(){
        draw();
        requestAnimationFrame(loop);
    }

    // --- Inicialização do Canvas ---
    window.addEventListener("resize", initGrid); // Recalcula a grade ao redimensionar
    
    initGrid();
    loop();

})();