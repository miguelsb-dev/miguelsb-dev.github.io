document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Manejo funcional del Tema Claro / Oscuro sin problemas de CORS en local
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('portfolio-theme');
        if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        }

        themeToggle.addEventListener('click', () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            if (isLight) {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('portfolio-theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('portfolio-theme', 'light');
            }
        });
    }

    // 2. Lógica interactiva y accesible para abrir/cerrar la foto en tamaño grande
    const profileBtn = document.getElementById('profile-btn');
    const photoModal = document.getElementById('photo-modal');
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = photoModal ? photoModal.querySelector('.modal-overlay') : null;

    if (profileBtn && photoModal && modalClose) {
        const openModal = () => {
            photoModal.classList.add('open');
            photoModal.setAttribute('aria-hidden', 'false');
            modalClose.focus();
        };

        const closeModal = () => {
            photoModal.classList.remove('open');
            photoModal.setAttribute('aria-hidden', 'true');
            profileBtn.focus();
        };

        // Eventos de apertura y cierre por clicks
        profileBtn.addEventListener('click', openModal);
        modalClose.addEventListener('click', closeModal);
        if (modalOverlay) {
            modalOverlay.addEventListener('click', closeModal);
        }

        // Accesibilidad: Cerrar con la tecla Escape si la ventana está abierta
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && photoModal.classList.contains('open')) {
                closeModal();
            }
        });
    }

    // 3. Año automático del footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});