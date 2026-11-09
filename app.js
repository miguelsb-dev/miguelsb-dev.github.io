document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
 
    // 1. Tema claro/oscuro (respeta la preferencia del sistema la primera vez)
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const toLight = root.getAttribute('data-theme') !== 'light';
            if (toLight) root.setAttribute('data-theme', 'light');
            else root.removeAttribute('data-theme');
            try { localStorage.setItem('portfolio-theme', toLight ? 'light' : 'dark'); } catch (e) {}
        });
    }
 
    // 2. Foto de perfil: si no carga, se muestran las iniciales
    const profileImg = document.querySelector('.profile-img');
    if (profileImg) {
        const showFallback = () => {
            const fallback = document.createElement('span');
            fallback.className = 'avatar-fallback';
            fallback.textContent = 'MSB';
            profileImg.replaceWith(fallback);
        };
        if (profileImg.complete && profileImg.naturalWidth === 0) showFallback();
        else profileImg.addEventListener('error', showFallback);
    }
 
    // 3. Foto ampliada (se cierra con clic fuera, con la X o con Escape)
    const profileBtn = document.getElementById('profile-btn');
    const photoModal = document.getElementById('photo-modal');
    const modalClose = document.getElementById('modal-close');
 
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
 
        profileBtn.addEventListener('click', openModal);
        modalClose.addEventListener('click', closeModal);
        photoModal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && photoModal.classList.contains('open')) closeModal();
        });
    }
 
    // 4. Año del pie de página
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});

