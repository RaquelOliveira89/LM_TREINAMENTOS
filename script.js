/**
 * LM Treinamentos e Consultoria - Scripts de Conversão e UX
 * Focado em Google Ads e Performance
 */

document.addEventListener('DOMContentLoaded', () => {
    initAOS();
    initNavbarScroll();
    initTracking();
    initFormHandling();
    initMobileMenu();
    initSmoothAnchors();
    initAutoRedirect();
    initCourseFilter();
    initCaseLightbox();
    initExperienceCarousel();
});

/**
 * Inicializa biblioteca de animações
 */
function initAOS() {
    // Desativar animações em dispositivos muito antigos ou se o usuário preferir redução de movimento
    const isMobile = window.innerWidth < 768;
    
    AOS.init({
        duration: 800,
        once: true,
        disable: isMobile ? 'phone' : false // Opcional: simplifica a carga em celulares
    });

    // O AOS calcula a posição-gatilho de cada elemento uma única vez (no init).
    // Como há imagens e um iframe que carregam depois e empurram o conteúdo para
    // baixo, essas posições ficam desatualizadas — e seções acessadas por link
    // âncora (ex.: #contato via "Garantir Vaga") podiam ficar presas em opacity:0.
    // Recalcular no load e a cada mudança de hash resolve sem re-animar nada
    // (once:true mantém o que já apareceu).
    const refreshAOS = () => { if (window.AOS) AOS.refresh(); };
    window.addEventListener('load', refreshAOS);
    window.addEventListener('hashchange', refreshAOS);
}

/**
 * Gerencia o comportamento da Navbar ao rolar a página
 */
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const handleScroll = () => {
        // Usando classList para evitar manipulação de style inline e permitir transições CSS
        navbar.classList.toggle('navbar-scrolled', window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * Fecha o menu mobile automaticamente ao clicar em um link (UX Mobile)
 */
function initMobileMenu() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.nav-contact-btn)');
    const menuToggle = document.getElementById('navbarNav');
    
    if (!menuToggle) return;
    const bsCollapse = new bootstrap.Collapse(menuToggle, { toggle: false });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) {
                bsCollapse.hide();
            }
        });
    });
}

/**
 * Rolagem suave e precisa para âncoras internas (menu, "Garantir Vaga", CTAs do hero).
 *
 * Corrige dois problemas:
 *  - a navbar fixa cobria o topo da seção de destino (faltava compensar o offset);
 *  - no primeiro acesso, imagens/iframe abaixo da dobra carregavam DEPOIS do clique,
 *    aumentavam a altura da página e a rolagem "parava na seção de cima" — era
 *    preciso clicar duas vezes.
 *
 * Solução: intercepta o clique, calcula a posição real do alvo já com a altura da
 * navbar descontada e, após a rolagem, reconfere a posição algumas vezes enquanto
 * o layout termina de assentar — sem depender de um segundo clique.
 */
function initSmoothAnchors() {
    const navbar = document.querySelector('.navbar');
    const collapseEl = document.getElementById('navbarNav');
    const GAP = 18; // respiro entre a navbar e o topo da seção

    const navOffset = () => (navbar ? Math.round(navbar.getBoundingClientRect().height) : 0) + GAP;

    let navToken = 0; // invalida a correção anterior se um novo link for clicado

    function goToElement(el) {
        const myToken = ++navToken;
        const top = Math.max(0, Math.round(el.getBoundingClientRect().top + window.pageYOffset - navOffset()));
        window.scrollTo({ top, behavior: 'smooth' });

        // Reposiciona enquanto a página ainda muda de altura (lazy images, iframe,
        // troca de fonte, fim do colapso do menu). Para quando fica estável ou
        // quando o usuário assume o controle da rolagem.
        let ticks = 0, lastScroll = -1, stable = 0, cancelled = false;
        const release = () => { cancelled = true; };
        const evts = ['wheel', 'touchmove', 'keydown'];
        evts.forEach(evt => window.addEventListener(evt, release, { once: true, passive: true }));

        const settle = () => {
            if (cancelled || myToken !== navToken) {
                evts.forEach(evt => window.removeEventListener(evt, release));
                return;
            }
            const now = Math.round(window.pageYOffset);
            stable = (now === lastScroll) ? stable + 1 : 0;
            lastScroll = now;

            // só corrige depois que a rolagem suave parou (2 leituras iguais)
            if (stable >= 2) {
                const drift = Math.round(el.getBoundingClientRect().top - navOffset());
                if (Math.abs(drift) > 2) {
                    window.scrollBy(0, drift);
                    stable = 0;
                }
            }

            if (++ticks < 22) {
                setTimeout(settle, 120);
            } else {
                evts.forEach(evt => window.removeEventListener(evt, release));
                if (window.AOS) AOS.refresh();
            }
        };
        setTimeout(settle, 120);
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        const hash = link.getAttribute('href');
        if (!hash || hash.length < 2) return; // ignora href="#"

        link.addEventListener('click', (e) => {
            const el = document.querySelector(hash);
            if (!el) return; // alvo inexistente: deixa o navegador decidir
            e.preventDefault();

            const menuOpen = collapseEl && collapseEl.classList.contains('show');
            if (menuOpen && window.bootstrap) {
                // espera o menu mobile fechar para medir já com a navbar "curta"
                collapseEl.addEventListener('hidden.bs.collapse', () => goToElement(el), { once: true });
                bootstrap.Collapse.getOrCreateInstance(collapseEl).hide();
            } else {
                goToElement(el);
            }

            if (history.pushState) history.pushState(null, '', hash);
        });
    });

    // Acesso direto com hash (link de outra página, nova aba, Ctrl+F5): o pulo
    // nativo acontece antes das imagens carregarem. Reposiciona depois do load.
    const initialHash = window.location.hash;
    if (initialHash && initialHash.length > 1) {
        const el = document.querySelector(initialHash);
        if (el) window.addEventListener('load', () => setTimeout(() => goToElement(el), 250));
    }
}

/**
 * Centraliza o rastreamento de eventos do Google Ads
 */
function initTracking() {
    // Função auxiliar para disparar eventos
    const sendGtagEvent = (action, label) => {
        if (typeof gtag === 'function') {
            gtag('event', action, {
                'event_category': 'Engagement',
                'event_label': label
            });
        }
    };

    // Rastreamento de cliques no WhatsApp
    document.querySelectorAll('.whatsapp-float').forEach(el => {
        el.addEventListener('click', () => sendGtagEvent('click_whatsapp', 'Botão Flutuante'));
    });

    // Rastreamento de cliques em "Ver Detalhes" dos cursos
    document.querySelectorAll('.btn-outline-primary').forEach(btn => {
        btn.addEventListener('click', () => sendGtagEvent('view_details', btn.closest('.card')?.querySelector('h3')?.innerText || 'Curso'));
    });
}

/**
 * Gerencia o envio do formulário, UX e conversão
 */
function initFormHandling() {
    const leadForm = document.getElementById('lead-form');
    if (!leadForm) return;

    leadForm.addEventListener('submit', () => {
        // 1. Disparar conversão do Google Ads (sem bloquear o evento)
        if (typeof gtag === 'function') {
            gtag('event', 'conversion', { 'send_to': 'AW-XXXXXXXXX/YYYYYYYY' });
        }

        // 2. Feedback visual e prevenção de clique duplo
        const submitBtn = leadForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';
        }
    });
}

/**
 * Filtro de trilhas na seção de Cursos, com exibição inicial limitada
 * (evita uma grade muito longa/repetitiva) e botão "ver todos".
 */
function initCourseFilter() {
    const pills = document.querySelectorAll('.filter-pill');
    const items = Array.from(document.querySelectorAll('.course-item'));
    const emptyMsg = document.getElementById('cursos-empty');
    const toggleBtn = document.getElementById('cursos-toggle');
    if (!pills.length || !items.length) return;

    const INITIAL_COUNT = 6;
    let currentFilter = 'todos';
    let expanded = false;

    // Torna o item visível imediatamente, sem depender do scroll-reveal do AOS
    // (necessário porque itens escondidos com display:none nunca disparam o
    // observer de interseção do AOS sozinhos).
    const showItem = (item) => {
        item.style.display = '';
        item.classList.add('aos-animate');
    };
    const hideItem = (item) => {
        item.style.display = 'none';
    };

    function applyVisibility() {
        const matched = items.filter(item => currentFilter === 'todos' || item.dataset.category === currentFilter);
        const matchedSet = new Set(matched);

        items.forEach(item => {
            if (!matchedSet.has(item)) {
                hideItem(item);
            }
        });

        matched.forEach((item, idx) => {
            const shouldShow = expanded || currentFilter !== 'todos' || idx < INITIAL_COUNT;
            shouldShow ? showItem(item) : hideItem(item);
        });

        if (emptyMsg) {
            emptyMsg.style.display = matched.length === 0 ? 'block' : 'none';
        }

        if (toggleBtn) {
            const hasMore = currentFilter === 'todos' && matched.length > INITIAL_COUNT;
            toggleBtn.style.display = hasMore ? '' : 'none';
            toggleBtn.textContent = expanded ? 'Ver menos' : `Ver todos os cursos (${matched.length})`;
        }
    }

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.dataset.filter;
            expanded = false;
            applyVisibility();
        });
    });

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            expanded = !expanded;
            applyVisibility();
            if (!expanded) {
                document.getElementById('cursos-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    applyVisibility();
}

/**
 * Lightbox simples para ampliar imagens (prints dos cases e fotos da galeria)
 * (sem depender do modal do Bootstrap, para manter leve).
 */
function initCaseLightbox() {
    const overlay = document.getElementById('case-lightbox');
    const overlayImg = document.getElementById('case-lightbox-img');
    const closeBtn = document.getElementById('case-lightbox-close');
    const triggers = document.querySelectorAll('.case-screenshot-img, .gallery-photo');
    if (!overlay || !overlayImg || !closeBtn || !triggers.length) return;

    const open = (src, alt) => {
        overlayImg.src = src;
        overlayImg.alt = alt || '';
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const close = () => {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    triggers.forEach(img => {
        img.addEventListener('click', () => open(img.src, img.alt));
    });

    closeBtn.addEventListener('click', close);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });
}

/**
 * Carrossel da seção "Experiência LM" — nativo, com scroll-snap.
 * Swipe funciona de graça no celular; as setas rolam uma "página" por vez.
 */
function initExperienceCarousel() {
    const carousel = document.querySelector('.exp-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.exp-track');
    const prev = carousel.querySelector('.exp-arrow-prev');
    const next = carousel.querySelector('.exp-arrow-next');
    if (!track || !prev || !next) return;

    const page = () => track.clientWidth * 0.9;

    const updateArrows = () => {
        const maxScroll = track.scrollWidth - track.clientWidth - 1;
        prev.disabled = track.scrollLeft <= 0;
        next.disabled = track.scrollLeft >= maxScroll;
    };

    prev.addEventListener('click', () => track.scrollBy({ left: -page(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: page(), behavior: 'smooth' }));
    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows, { passive: true });

    updateArrows();
}

/**
 * Gerencia o redirecionamento automático na página de obrigado
 */
function initAutoRedirect() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;

    let timeLeft = 10;
    const timer = setInterval(() => {
        timeLeft--;
        if (countdownEl) {
            countdownEl.textContent = timeLeft;
        }
        if (timeLeft <= 0) {
            clearInterval(timer);
            window.location.href = 'index.html';
        }
    }, 1000);
}