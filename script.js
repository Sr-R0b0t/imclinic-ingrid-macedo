/* ==========================================================
   IM CLINIC — Scripts
   1. Comparador antes/depois
   2. Abas do portfólio
   3. Revelar ao rolar
   ========================================================== */

/* ---------- 1. COMPARADOR ANTES/DEPOIS ----------
   Ao arrastar o slider, a camada "depois" é recortada da esquerda
   e a linha branca acompanha a posição. */
const slider = document.querySelector('.comparador input');
const camadaDepois = document.querySelector('.comparador-depois');
const linha = document.querySelector('.comparador-linha');

slider.addEventListener('input', () => {
  camadaDepois.style.clipPath = 'inset(0 0 0 ' + slider.value + '%)';
  linha.style.left = slider.value + '%';
});


/* ---------- 2. ABAS DO PORTFÓLIO ----------
   Cada botão guarda:
   - data-caso: "Título|Descrição"
   - data-antes / data-depois: caminho das duas fotos
   - data-ajuste-antes / data-ajuste-depois (opcional): ajuste fino do
     enquadramento, em CSS transform. Ex.: "scale(1.15) translate(-4%, 3%)" */
const abas = document.querySelectorAll('.portfolio-abas button');
const tituloCaso = document.getElementById('caso-titulo');
const descricaoCaso = document.getElementById('caso-descricao');
const imgAntes = document.getElementById('img-antes');
const imgDepois = document.getElementById('img-depois');

// Mostra o caso da aba: legenda, fotos, ajuste de enquadramento e slider no meio
function mostrarCaso(aba) {
  abas.forEach((outra) => outra.setAttribute('aria-pressed', 'false'));
  aba.setAttribute('aria-pressed', 'true');

  const [titulo, descricao] = aba.dataset.caso.split('|');
  tituloCaso.textContent = titulo;
  descricaoCaso.textContent = descricao;

  imgAntes.src = aba.dataset.antes;
  imgAntes.alt = 'Antes: ' + titulo;
  imgDepois.src = aba.dataset.depois;
  imgDepois.alt = 'Depois: ' + titulo;

  // Ajuste fino do enquadramento (sem atributo = foto sem ajuste)
  imgAntes.style.transform = aba.dataset.ajusteAntes || 'none';
  imgDepois.style.transform = aba.dataset.ajusteDepois || 'none';

  // Volta o comparador para o meio
  slider.value = 50;
  slider.dispatchEvent(new Event('input'));
}

abas.forEach((aba) => {
  // Baixa as fotos da aba quando o mouse passa ou o teclado foca,
  // para a troca ser instantânea no clique
  const preCarregar = () => {
    new Image().src = aba.dataset.antes;
    new Image().src = aba.dataset.depois;
  };
  aba.addEventListener('pointerenter', preCarregar, { once: true });
  aba.addEventListener('focus', preCarregar, { once: true });

  aba.addEventListener('click', () => mostrarCaso(aba));
});

// Aplica o caso que já começa ativo (para ele também receber o ajuste)
const abaInicial = document.querySelector('.portfolio-abas button[aria-pressed="true"]');
if (abaInicial) mostrarCaso(abaInicial);


/* ---------- 3. REVELAR AO ROLAR ----------
   Cada grupo é um seletor CSS + o intervalo (em segundos) entre
   irmãos, para os itens de uma lista entrarem um depois do outro.
   O topo da página (hero) fica de fora: ele já tem animação própria. */
const gruposRevelar = [
  { alvo: '.container > h2', passo: 0 },
  { alvo: '.sobre-foto, .sobre .container > div:last-child', passo: 0.15 },
  { alvo: '.tratamentos-colunas > div', passo: 0.12 },
  { alvo: '.portfolio-abas, .comparador, .comparador-legenda', passo: 0 },
  { alvo: '.diferenciais-lista > div', passo: 0.12 },
  { alvo: '.por-que ul', passo: 0 },
  { alvo: '.depoimentos-lista > blockquote', passo: 0.15 },
  { alvo: '.fotografia-grade > figure', passo: 0.08 },
  { alvo: '.final .container > p, .final-botoes', passo: 0.1 },
];

const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('IntersectionObserver' in window && !reduzirMovimento) {
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visivel');
          observador.unobserve(entrada.target); // anima só na primeira vez
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );

  gruposRevelar.forEach(({ alvo, passo }) => {
    document.querySelectorAll(alvo).forEach((el) => {
      // Atraso conforme a posição entre os irmãos (limitado a 5 itens)
      const posicao = Array.from(el.parentElement.children).indexOf(el);
      el.style.setProperty('--atraso', Math.min(posicao, 5) * passo + 's');
      el.classList.add('revelar');
      observador.observe(el);
    });
  });
}



/* ---------- 4. CARROSSEL DE FEEDBACKS ----------
   Passa sozinho a cada 4,5 s. Pausa com mouse ou foco do teclado em cima,
   para de vez se a pessoa tocar na tela ou clicar nas setas, e só anda
   quando está visível na tela. Sem movimento para quem prefere menos animação. */
const feedbacks = document.querySelector('.feedbacks');
const trilho = document.querySelector('.feedbacks-trilho');

if (feedbacks && trilho) {
  const cartoes = Array.from(trilho.children);
  const setas = feedbacks.querySelectorAll('.feedbacks-seta');
  const intervalo = 4500; // tempo entre os prints, em milissegundos

  let pausado = false;
  let parado = false;
  let visivel = false;

  // Índice do print que está mais alinhado à esquerda agora
  const atual = () => {
    let melhor = 0;
    let menor = Infinity;
    cartoes.forEach((cartao, i) => {
      const distancia = Math.abs(cartao.offsetLeft - trilho.scrollLeft);
      if (distancia < menor) { menor = distancia; melhor = i; }
    });
    return melhor;
  };

  const irPara = (i) => trilho.scrollTo({ left: cartoes[i].offsetLeft, behavior: 'smooth' });
  const noFim = () => trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 4;

  // dir = 1 avança, dir = -1 volta; no fim ou no começo dá a volta
  const mover = (dir) => {
    if (dir > 0 && noFim()) return irPara(0);
    if (dir < 0 && trilho.scrollLeft <= 4) return irPara(cartoes.length - 1);
    irPara(Math.max(0, Math.min(cartoes.length - 1, atual() + dir)));
  };

  setas.forEach((seta) => {
    seta.addEventListener('click', () => {
      parado = true; // quem clica nas setas quer controlar sozinho
      mover(Number(seta.dataset.dir));
    });
  });

  if (!reduzirMovimento) {
    setInterval(() => {
      if (!pausado && !parado && visivel && !document.hidden) mover(1);
    }, intervalo);

    feedbacks.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') pausado = true; });
    feedbacks.addEventListener('pointerleave', () => { pausado = false; });
    feedbacks.addEventListener('focusin', () => { pausado = true; });
    feedbacks.addEventListener('focusout', () => { pausado = false; });
    trilho.addEventListener('touchstart', () => { parado = true; }, { passive: true });

    new IntersectionObserver(
      ([entrada]) => { visivel = entrada.isIntersecting; },
      { threshold: 0.4 }
    ).observe(trilho);
  }
}