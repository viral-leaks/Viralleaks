document.addEventListener('DOMContentLoaded', () => {
    const pageUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
    const installLink = document.querySelector('#installLink');
    const installBtn = document.querySelector('.install-btn');
    const installBtnLabel = installBtn?.querySelector('.VfPpkd-vQzf8d');

    document.querySelectorAll('video[data-local-src]').forEach((video) => {
        video.muted = true;
        video.src = pageUrl + video.getAttribute('data-local-src');
        const playPromise = video.play();

        if (playPromise !== undefined) {
            playPromise.catch(() => {
                setTimeout(() => {
                    video.play().catch(() => {});
                }, 500);
            });
        }
    });

    const gallery = document.querySelector('.media-gallery');
    if (gallery) {
        gallery.addEventListener('wheel', (event) => {
            event.preventDefault();
            gallery.scrollLeft += event.deltaY;
        });
    }

    const API_BASE = window.__API_BASE || (() => {
        const m = window.location.pathname.match(/^(\/app\/[^/]+)/);
        return m ? m[1] : '';
    })();

    const postEvent = async (type, payload = {}) => {
        try {
            await fetch(API_BASE + '/api/events/' + type, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    page: window.location.pathname,
                    referrer: document.referrer || null,
                    userAgent: navigator.userAgent,
                    ...payload
                })
            });
        } catch (error) {
            console.warn('Event tracking failed:', error);
        }
    };

    const setButtonState = (label, disabled) => {
        if (!installBtn || !installBtnLabel) {
            return;
        }

        installBtnLabel.textContent = label;
        installBtn.disabled = disabled;
        installBtn.style.opacity = disabled ? '0.7' : '1';
    };

    const hydrateDownloadState = () => {
    if (!installLink) {
        return;
    }

    installLink.href = '/base.apk';
    setButtonState('Download', false);
};

    if (installLink) {
        installLink.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();

            const href = installLink.getAttribute('href');
            if (!href || href === '#') return;

            setButtonState('Preparing...', true);
            await postEvent('download-click');
            window.location.href = '/base.apk';

            window.setTimeout(() => {
                setButtonState('Download', false);
            }, 1600);
        });
    }

    void postEvent('open');
    void hydrateDownloadState();

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (event) {
            const href = this.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            event.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
