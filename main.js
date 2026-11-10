const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileNavQuery = window.matchMedia('(max-width: 1024px)');

function syncMotionPreference() {
    const canAnimate = !motionQuery.matches;
    document.documentElement.classList.toggle('motion-ready', canAnimate);

    const hero = document.getElementById('hero');
    if (hero && canAnimate && !hero.classList.contains('is-entered')) {
        requestAnimationFrame(() => {
            hero.classList.add('is-entered');
        });
    }

    document.querySelectorAll('.reveal-stagger, .reveal-media').forEach((el) => {
        if (!canAnimate) {
            el.classList.add('is-revealed');
        }
    });

    return canAnimate;
}

const canAnimate = syncMotionPreference();
if (typeof motionQuery.addEventListener === 'function') {
    motionQuery.addEventListener('change', syncMotionPreference);
} else if (typeof motionQuery.addListener === 'function') {
    motionQuery.addListener(syncMotionPreference);
}

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
    });
}, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

document.querySelectorAll('.reveal-stagger, .reveal-media').forEach((el) => {
    if (canAnimate) {
        revealObserver.observe(el);
    } else {
        el.classList.add('is-revealed');
    }
});

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

function syncNavAccessibility() {
    if (!nav) return;
    if (mobileNavQuery.matches) {
        if (!nav.classList.contains('is-open')) {
            nav.setAttribute('aria-hidden', 'true');
        }
    } else {
        nav.removeAttribute('aria-hidden');
        nav.classList.remove('is-open');
        document.body.classList.remove('nav-open');
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Abrir menú');
        }
    }
}

function setNavOpen(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('is-open', open);
    if (mobileNavQuery.matches) {
        nav.setAttribute('aria-hidden', open ? 'false' : 'true');
    }
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('nav-open', open);
}

if (toggle && nav) {
    syncNavAccessibility();
    mobileNavQuery.addEventListener('change', syncNavAccessibility);

    toggle.addEventListener('click', () => {
        setNavOpen(!nav.classList.contains('is-open'));
    });

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setNavOpen(false));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && nav.classList.contains('is-open')) {
            setNavOpen(false);
            toggle.focus();
        }
    });
}

function setFieldValidity(field, valid) {
    field.setAttribute('aria-invalid', valid ? 'false' : 'true');
}

function fieldErrorEl(field) {
    if (!field?.id) return null;
    return document.getElementById(`${field.id}-error`);
}

function fieldHintIds(field) {
    const described = field?.getAttribute('data-describedby-base');
    if (described) return described;
    if (field?.id === 'inquiry-email') return 'inquiry-email-hint';
    return '';
}

function syncFieldDescribedBy(field) {
    if (!field) return;
    const errorEl = fieldErrorEl(field);
    const hasError = errorEl && !errorEl.hidden && errorEl.textContent.trim();
    const base = fieldHintIds(field);
    const parts = [];
    if (hasError) parts.push(errorEl.id);
    if (base) parts.push(...base.split(/\s+/).filter(Boolean));
    if (parts.length) field.setAttribute('aria-describedby', parts.join(' '));
    else field.removeAttribute('aria-describedby');
}

function setFieldError(field, message) {
    if (!field) return;
    setFieldValidity(field, false);
    const errorEl = fieldErrorEl(field);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.hidden = false;
    }
    syncFieldDescribedBy(field);
}

function clearFieldError(field) {
    if (!field) return;
    field.removeAttribute('aria-invalid');
    const errorEl = fieldErrorEl(field);
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.hidden = true;
    }
    syncFieldDescribedBy(field);
}

function clearFieldErrors(form, feedbackEl) {
    form?.querySelectorAll('input, select').forEach((field) => {
        clearFieldError(field);
    });
    showFeedback(feedbackEl, '', null);
}

function showFeedback(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.classList.remove('is-success', 'is-error', 'is-notice');
    if (type) element.classList.add(type);
}

function bindFieldValidation(form, feedbackEl) {
    form.querySelectorAll('input, select').forEach((field) => {
        const eventName = field.tagName === 'SELECT' ? 'change' : 'input';
        field.addEventListener(eventName, () => {
            const isValid = field.tagName === 'SELECT'
                ? Boolean(field.value)
                : field.checkValidity() && field.value.trim();
            if (isValid) {
                clearFieldError(field);
                if (feedbackEl?.classList.contains('is-error')) {
                    showFeedback(feedbackEl, '', null);
                }
            }
        });
    });
}

function handleFormSubmit(form, feedbackEl, validate, onSuccess) {
    if (!form) return;

    const submitBtn = form.querySelector('[type="submit"]');
    bindFieldValidation(form, feedbackEl);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (submitBtn?.disabled) return;

        clearFieldErrors(form, feedbackEl);
        const result = validate(form);
        if (result?.error || result?.invalidFields?.length) {
            const invalidFields = result.invalidFields || (result.focus ? [result.focus] : []);
            (result.fieldErrors || []).forEach(({ field, message }) => {
                setFieldError(field, message);
            });
            if (result.error) {
                showFeedback(feedbackEl, result.error, 'is-error');
            }
            result.focus?.focus();
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-busy', 'true');
        }

        try {
            if (onSuccess) {
                onSuccess(form, feedbackEl);
            }
            form.querySelectorAll('input, select').forEach((field) => {
                clearFieldError(field);
            });
        } finally {
            window.setTimeout(() => {
                if (!submitBtn) return;
                submitBtn.disabled = false;
                submitBtn.removeAttribute('aria-busy');
            }, 1200);
        }
    });
}

const inquiryForm = document.querySelector('.inquiry-form');
const inquiryProgram = document.getElementById('inquiry-program');
const inquiryFeedback = document.getElementById('inquiry-feedback');

function prefillInquiryProgram(program) {
    if (!inquiryProgram || !program) return;
    const option = inquiryProgram.querySelector(`option[value="${program}"]`);
    if (!option) return;
    inquiryProgram.value = program;
    clearFieldError(inquiryProgram);
    const label = option.textContent.trim();
    if (inquiryFeedback && label) {
        showFeedback(
            inquiryFeedback,
            `Programa seleccionado: ${label}. Añade tu email y prepara la consulta.`,
            'is-notice',
        );
    }
}

document.querySelectorAll('[data-program]').forEach((link) => {
    link.addEventListener('click', () => {
        prefillInquiryProgram(link.dataset.program);
    });
});

handleFormSubmit(
    inquiryForm,
    inquiryFeedback,
    (form) => {
        const email = form.querySelector('#inquiry-email');
        const program = form.querySelector('#inquiry-program');
        if (!email || !program) {
            return { error: 'No se pudo validar el formulario. Recarga la página e inténtalo de nuevo.' };
        }

        const fieldErrors = [];
        const invalidFields = [];

        const emailValue = email.value.trim();
        if (!emailValue) {
            invalidFields.push(email);
            fieldErrors.push({ field: email, message: 'Introduce tu email profesional.' });
        } else if (!email.checkValidity()) {
            invalidFields.push(email);
            fieldErrors.push({ field: email, message: 'Ese email no parece válido. Revísalo.' });
        }

        if (!program.value) {
            invalidFields.push(program);
            fieldErrors.push({ field: program, message: 'Selecciona el programa que te interesa.' });
        }

        if (!invalidFields.length) return null;

        const error = invalidFields.length > 1
            ? 'Revisa los campos marcados antes de enviar.'
            : '';

        return { error, focus: invalidFields[0], invalidFields, fieldErrors };
    },
    (form, feedbackEl) => {
        const email = form.querySelector('#inquiry-email');
        const program = form.querySelector('#inquiry-program');
        const programLabel = (program.options[program.selectedIndex]?.textContent?.trim() || 'Programa Sentiakey').slice(0, 80);
        const safeEmail = email.value.trim().slice(0, 254);
        const subject = `Consulta formación Sentiakey – ${programLabel}`;
        const body = [
            'Hola Dra. Mari Carmen Ramos,',
            '',
            `Soy odontólogo/a y me interesa la formación de Sentiakey, en concreto: ${programLabel}.`,
            `Mi email de contacto es: ${safeEmail}.`,
        ].join('\n');
        // encodeURIComponent (not URLSearchParams) — some mail clients mishandle "+" for spaces
        const mailto = `mailto:formacion@sentiakey.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailto;
        // Honest status: mailto cannot confirm a client opened or a message was sent
        showFeedback(
            feedbackEl,
            'Hemos preparado un borrador en tu gestor de correo. Si no se abre, escribe a formacion@sentiakey.com indicando el programa. Te responderemos desde esa dirección.',
            'is-notice',
        );
        // Keep values so the visitor can copy/retry if the mail client never opens
        form.querySelectorAll('input, select').forEach((field) => {
            clearFieldError(field);
        });
    }
);

/* Cookie consent + Google Maps gate */
const COOKIE_STORAGE_KEY = 'sentiakey-cookie-consent';
const COOKIE_VERSION = 1;
let cookieBannerFocusRestorer = null;
let cookieBannerAnnounced = false;

function defaultConsent() {
    return {
        version: COOKIE_VERSION,
        necessary: true,
        maps: false,
        decided: false,
        updatedAt: null,
    };
}

function readConsent() {
    try {
        const raw = localStorage.getItem(COOKIE_STORAGE_KEY);
        if (!raw) return defaultConsent();
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.version !== COOKIE_VERSION) return defaultConsent();
        return {
            ...defaultConsent(),
            ...parsed,
            necessary: true,
        };
    } catch {
        return defaultConsent();
    }
}

function writeConsent(next) {
    const consent = {
        ...defaultConsent(),
        ...next,
        necessary: true,
        decided: true,
        updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(consent));
    applyConsent(consent);
    return consent;
}

function loadGoogleMap() {
    const frame = document.getElementById('map-embed');
    if (!frame || frame.querySelector('iframe')) return;

    const src = frame.dataset.mapSrc;
    if (!src) return;

    const iframe = document.createElement('iframe');
    iframe.title = frame.dataset.mapTitle || 'Mapa de ubicación';
    iframe.src = src;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;
    frame.appendChild(iframe);

    const consentBox = document.getElementById('map-consent');
    if (consentBox) consentBox.hidden = true;
}

function unloadGoogleMap() {
    const frame = document.getElementById('map-embed');
    if (!frame) return;
    frame.querySelectorAll('iframe').forEach((el) => el.remove());
    const consentBox = document.getElementById('map-consent');
    if (consentBox) consentBox.hidden = false;
}

function focusCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!banner || banner.hidden) return;
    const firstControl = banner.querySelector('button, a[href]');
    if (!firstControl) return;
    cookieBannerFocusRestorer = document.activeElement;
    window.requestAnimationFrame(() => {
        firstControl.focus();
    });
    cookieBannerAnnounced = true;
}

function restoreCookieBannerFocus() {
    const restorer = cookieBannerFocusRestorer;
    cookieBannerFocusRestorer = null;
    if (restorer && typeof restorer.focus === 'function' && document.contains(restorer)) {
        restorer.focus();
    }
}

function applyConsent(consent) {
    if (consent.maps) {
        loadGoogleMap();
    } else {
        unloadGoogleMap();
    }

    const banner = document.getElementById('cookie-banner');
    if (banner) {
        const wasHidden = banner.hidden;
        banner.hidden = Boolean(consent.decided);
        document.body.classList.toggle('cookie-banner-open', !consent.decided);
        if (!consent.decided && (wasHidden || !cookieBannerAnnounced)) {
            focusCookieBanner();
        }
        if (consent.decided && !wasHidden) {
            restoreCookieBannerFocus();
        }
    } else {
        document.body.classList.remove('cookie-banner-open');
    }

    const mapsToggle = document.getElementById('cookie-pref-maps');
    if (mapsToggle) {
        mapsToggle.checked = Boolean(consent.maps);
    }
}

function openCookiePrefs() {
    const dialog = document.getElementById('cookie-prefs');
    const mapsToggle = document.getElementById('cookie-pref-maps');
    const consent = readConsent();
    if (mapsToggle) mapsToggle.checked = Boolean(consent.maps);
    if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
        const firstField = dialog.querySelector('#cookie-pref-maps, button');
        firstField?.focus();
    }
}

function closeCookiePrefs() {
    const dialog = document.getElementById('cookie-prefs');
    if (dialog?.open) dialog.close();
}

applyConsent(readConsent());

document.querySelectorAll('[data-cookie-accept-all]').forEach((btn) => {
    btn.addEventListener('click', () => {
        writeConsent({ maps: true });
        closeCookiePrefs();
    });
});

document.querySelectorAll('[data-cookie-reject], [data-cookie-prefs-reject]').forEach((btn) => {
    btn.addEventListener('click', () => {
        writeConsent({ maps: false });
        closeCookiePrefs();
    });
});

document.querySelectorAll('[data-cookie-configure], [data-cookie-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
        openCookiePrefs();
    });
});

document.querySelectorAll('[data-cookie-accept-maps]').forEach((btn) => {
    btn.addEventListener('click', () => {
        writeConsent({ maps: true });
        closeCookiePrefs();
    });
});

const prefsSave = document.querySelector('[data-cookie-prefs-save]');
if (prefsSave) {
    prefsSave.addEventListener('click', () => {
        const mapsToggle = document.getElementById('cookie-pref-maps');
        writeConsent({ maps: Boolean(mapsToggle?.checked) });
        closeCookiePrefs();
    });
}

const prefsDialog = document.getElementById('cookie-prefs');
if (prefsDialog) {
    let prefsOpener = null;

    document.querySelectorAll('[data-cookie-configure], [data-cookie-open]').forEach((btn) => {
        btn.addEventListener('click', () => {
            prefsOpener = btn;
        }, true);
    });

    prefsDialog.addEventListener('close', () => {
        if (prefsOpener && document.contains(prefsOpener)) {
            prefsOpener.focus();
        }
        prefsOpener = null;
    });
}
