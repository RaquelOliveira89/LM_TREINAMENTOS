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