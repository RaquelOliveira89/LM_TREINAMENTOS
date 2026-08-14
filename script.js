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
    initAutoRedirect();
    initCourseFilter();
    initCaseLightbox();
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
 * Lightbox simples para ampliar os prints de planilha nos cases
 * (sem depender do modal do Bootstrap, para manter leve).
 */
function initCaseLightbox() {
    const overlay = document.getElementById('case-lightbox');
    const overlayImg = document.getElementById('case-lightbox-img');
    const closeBtn = document.getElementById('case-lightbox-close');
    const triggers = document.querySelectorAll('.case-screenshot-img');
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