/* ==========================================================
   IM CLINIC — Scripts
   1. Comparador antes/depois
   2. Abas do portfólio
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
   Cada botão guarda "Título|Descrição" no atributo data-caso.
   Ao clicar, a aba fica ativa e a legenda abaixo do comparador muda.
   Para trocar a foto também, veja o comentário em style.css (comparador). */
const abas = document.querySelectorAll('.portfolio-abas button');
const tituloCaso = document.getElementById('caso-titulo');
const descricaoCaso = document.getElementById('caso-descricao');

abas.forEach((aba) => {
  aba.addEventListener('click', () => {
    abas.forEach((outra) => outra.setAttribute('aria-pressed', 'false'));
    aba.setAttribute('aria-pressed', 'true');

    const [titulo, descricao] = aba.dataset.caso.split('|');
    tituloCaso.textContent = titulo;
    descricaoCaso.textContent = descricao;
  });
});


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
  { alvo: '.fotografia-grade > div', passo: 0.08 },
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