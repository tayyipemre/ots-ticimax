(function () {
    'use strict';

    var SELECTOR = '.ots-instagram-videos';
    var STYLE_ID = 'otsInstagramVideosStyle';
    var HIGHLIGHT_URL = 'https://www.instagram.com/stories/highlights/17994209442115512/';
    var MANIFEST_URL = 'https://cdn.jsdelivr.net/gh/tayyipemre/ots-ticimax@d5292b6/ots-instagram-videolari.json';
    var cleanupArrows = null;

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function safeUrl(value) {
        if (!value || typeof value !== 'string') return '';
        try {
            var url = new URL(value, window.location.href);
            if (url.protocol === 'https:' || url.origin === window.location.origin) return url.href;
        } catch (error) {
            return '';
        }
        return '';
    }

    function normalize(item, index) {
        if (!item || typeof item !== 'object') return null;
        if (item.media_type && item.media_type !== 'VIDEO') return null;
        var src = safeUrl(item.src || item.video || item.media_url);
        if (!src) return null;
        return {
            src: src,
            poster: safeUrl(item.poster || item.thumbnail || item.thumbnail_url),
            title: String(item.title || item.caption || 'ÖTS videosu ' + (index + 1)).trim()
        };
    }

    function styles() {
        if (document.getElementById(STYLE_ID)) return;
        var style = el('style');
        style.id = STYLE_ID;
        style.textContent = [
            '.ots-instagram-videos{box-sizing:border-box;width:100%;max-width:1480px;margin:0 auto;padding:38px 20px 52px;color:#0c154c;font-family:inherit}',
            '.ots-instagram-videos[hidden]{display:none!important}',
            '.ots-instagram-videos *{box-sizing:border-box}',
            '.ots-instagram-videos [hidden]{display:none!important}',
            '.ots-instagram-videos__head{display:flex;align-items:end;justify-content:space-between;gap:24px;margin:0 0 22px}',
            '.ots-instagram-videos__eyebrow{display:block;margin:0 0 8px;color:#e13c50;font-size:11px;font-weight:700;letter-spacing:.13em;text-transform:uppercase}',
            '.ots-instagram-videos__title{margin:0;color:#0c154c;font-size:clamp(22px,2.7vw,34px);font-weight:600;letter-spacing:-.035em;line-height:1.2}',
            '.ots-instagram-videos__link{flex:none;color:#0c154c;font-size:13px;font-weight:600;text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:3px}',
            '.ots-instagram-videos__link:hover{color:#e13c50}',
            '.ots-instagram-videos__viewport{position:relative}',
            '.ots-instagram-videos__track{--ots-video-gap:16px;display:grid;grid-auto-flow:column;grid-auto-columns:calc((100% - 2 * var(--ots-video-gap))/3);gap:var(--ots-video-gap);overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch}',
            '.ots-instagram-videos__track::-webkit-scrollbar{display:none}',
            '.ots-instagram-videos__card{position:relative;display:block;width:100%;aspect-ratio:9/16;overflow:hidden;border:0;border-radius:17px;background:linear-gradient(145deg,#1e2a57,#090f2d);color:#fff;cursor:pointer;scroll-snap-align:start;text-align:left}',
            '.ots-instagram-videos__poster{display:block;width:100%;height:100%;object-fit:cover}',
            '.ots-instagram-videos__card:after{content:"";position:absolute;inset:42% 0 0;background:linear-gradient(transparent,rgba(5,10,31,.7));pointer-events:none}',
            '.ots-instagram-videos__play{position:absolute;top:50%;left:50%;z-index:1;display:grid;place-items:center;width:58px;height:58px;border:1px solid rgba(255,255,255,.72);border-radius:50%;background:rgba(12,21,76,.43);backdrop-filter:blur(5px);transform:translate(-50%,-50%);transition:transform .2s,background .2s}',
            '.ots-instagram-videos__play svg{width:22px;height:22px;margin-left:3px;fill:#fff}',
            '.ots-instagram-videos__card:hover .ots-instagram-videos__play{background:rgba(12,21,76,.82);transform:translate(-50%,-50%) scale(1.08)}',
            '.ots-instagram-videos__card-title{position:absolute;right:18px;bottom:20px;left:18px;z-index:1;color:#fff;font-size:16px;font-weight:600;line-height:1.35}',
            '.ots-instagram-videos__controls{display:flex;justify-content:flex-end;gap:9px;margin-top:18px}',
            '.ots-instagram-videos__arrow{display:grid;place-items:center;width:42px;height:42px;border:1px solid #d9dfea;border-radius:50%;background:#fff;color:#0c154c;cursor:pointer}',
            '.ots-instagram-videos__arrow:hover:not(:disabled){border-color:#0c154c;background:#f5f7fb}',
            '.ots-instagram-videos__arrow:disabled{opacity:.38;cursor:default}',
            '.ots-instagram-videos__arrow svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2}',
            '.ots-instagram-videos button:focus-visible,.ots-instagram-videos__link:focus-visible{outline:3px solid #e13c50;outline-offset:3px}',
            '.ots-instagram-video-modal{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(4,8,25,.92)}',
            '.ots-instagram-video-modal__panel{position:relative;display:flex;align-items:center;justify-content:center;width:min(100%,440px);max-height:100%}',
            '.ots-instagram-video-modal__video{display:block;max-width:100%;max-height:calc(100vh - 40px);aspect-ratio:9/16;border-radius:12px;background:#000}',
            '.ots-instagram-video-modal__close{position:fixed;top:18px;right:18px;display:grid;place-items:center;width:44px;height:44px;padding:0;border:1px solid rgba(255,255,255,.35);border-radius:50%;background:#fff;color:#0c154c;font-size:29px;line-height:1;cursor:pointer}',
            '.ots-instagram-video-modal__close:focus-visible{outline:3px solid #fff;outline-offset:3px}',
            '@media(max-width:900px){.ots-instagram-videos__track{grid-auto-columns:calc((100% - var(--ots-video-gap))/2)}}',
            '@media(max-width:620px){.ots-instagram-videos{padding:28px 14px 38px}.ots-instagram-videos__head{align-items:start;flex-direction:column;gap:12px}.ots-instagram-videos__track{grid-auto-columns:82%}.ots-instagram-videos__card-title{font-size:15px}.ots-instagram-videos__controls{margin-top:14px}}',
            '@media(prefers-reduced-motion:reduce){.ots-instagram-videos__play{transition:none}}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function openVideo(item, opener) {
        var overlay = el('div', 'ots-instagram-video-modal');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', item.title);
        var panel = el('div', 'ots-instagram-video-modal__panel');
        var video = el('video', 'ots-instagram-video-modal__video');
        video.src = item.src;
        if (item.poster) video.poster = item.poster;
        video.controls = true;
        video.playsInline = true;
        video.preload = 'metadata';
        var close = el('button', 'ots-instagram-video-modal__close', '×');
        close.type = 'button';
        close.setAttribute('aria-label', 'Videoyu kapat');
        panel.appendChild(video);
        overlay.appendChild(close);
        overlay.appendChild(panel);
        var previousOverflow = document.body.style.overflow;
        function dismiss() {
            document.removeEventListener('keydown', onKeydown);
            video.pause();
            video.removeAttribute('src');
            video.load();
            overlay.remove();
            document.body.style.overflow = previousOverflow;
            opener.focus();
        }
        function onKeydown(event) {
            if (event.key === 'Escape') dismiss();
            if (event.key === 'Tab') {
                var first = close;
                var last = video;
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        }
        close.addEventListener('click', dismiss);
        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) dismiss();
        });
        document.addEventListener('keydown', onKeydown);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
        close.focus();
        var playback = video.play();
        if (playback && playback.catch) playback.catch(function () {});
    }

    function render(root, videos) {
        if (cleanupArrows) cleanupArrows();
        if (!videos.length) {
            root.hidden = true;
            root.replaceChildren();
            return;
        }
        styles();
        root.hidden = false;
        root.setAttribute('aria-label', 'ÖTS Instagram videoları');
        var head = el('div', 'ots-instagram-videos__head');
        var copy = el('div');
        copy.appendChild(el('span', 'ots-instagram-videos__eyebrow', 'ÖTS × Instagram'));
        copy.appendChild(el('h2', 'ots-instagram-videos__title', 'ÖTS ile paylaşılan anlar'));
        var link = el('a', 'ots-instagram-videos__link', 'Instagram’da gör ↗');
        link.href = HIGHLIGHT_URL;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        head.appendChild(copy);
        head.appendChild(link);
        var viewport = el('div', 'ots-instagram-videos__viewport');
        var track = el('div', 'ots-instagram-videos__track');
        track.setAttribute('aria-label', 'Instagram videoları');
        videos.forEach(function (item, index) {
            var card = el('button', 'ots-instagram-videos__card');
            card.type = 'button';
            card.setAttribute('aria-label', item.title + ' videosunu oynat');
            if (item.poster) {
                var poster = el('img', 'ots-instagram-videos__poster');
                poster.src = item.poster;
                poster.alt = '';
                poster.loading = index < 3 ? 'eager' : 'lazy';
                card.appendChild(poster);
            }
            var play = el('span', 'ots-instagram-videos__play');
            play.setAttribute('aria-hidden', 'true');
            play.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 3.5 21 12 6 20.5z"/></svg>';
            card.appendChild(play);
            card.appendChild(el('span', 'ots-instagram-videos__card-title', item.title));
            card.addEventListener('click', function () { openVideo(item, card); });
            track.appendChild(card);
        });
        viewport.appendChild(track);
        var controls = el('div', 'ots-instagram-videos__controls');
        function arrow(label, path) {
            var button = el('button', 'ots-instagram-videos__arrow');
            button.type = 'button';
            button.setAttribute('aria-label', label);
            button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + path + '"/></svg>';
            return button;
        }
        var previous = arrow('Önceki videolar', 'm15 5-7 7 7 7');
        var next = arrow('Sonraki videolar', 'm9 5 7 7-7 7');
        function updateArrows() {
            previous.disabled = track.scrollLeft < 2;
            next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
        }
        function move(direction) {
            var card = track.querySelector('.ots-instagram-videos__card');
            if (!card) return;
            var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
            var distance = (card.getBoundingClientRect().width + gap) * direction;
            track.scrollBy({ left: distance, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        }
        previous.addEventListener('click', function () { move(-1); });
        next.addEventListener('click', function () { move(1); });
        track.addEventListener('scroll', updateArrows, { passive: true });
        window.addEventListener('resize', updateArrows);
        cleanupArrows = function () { window.removeEventListener('resize', updateArrows); };
        controls.appendChild(previous);
        controls.appendChild(next);
        root.replaceChildren(head, viewport, controls);
        updateArrows();
    }

    function mount() {
        var root = document.querySelector(SELECTOR);
        if (!root) {
            var comments = document.querySelector('.customer-comments');
            if (comments && comments.parentNode) {
                root = el('section', 'ots-instagram-videos');
                comments.parentNode.insertBefore(root, comments);
            }
        }
        if (!root || root.getAttribute('data-ots-instagram-ready') === 'true') return false;
        root.setAttribute('data-ots-instagram-ready', 'true');
        root.hidden = true;
        window.OTSInstagramVideos = {
            setVideos: function (items) {
                if (!Array.isArray(items)) return;
                render(root, items.map(normalize).filter(Boolean));
            }
        };
        var inline = window.OTS_INSTAGRAM_VIDEOS;
        var url = safeUrl(root.getAttribute('data-videos-url') || MANIFEST_URL);
        var source = Array.isArray(inline) ? Promise.resolve(inline) :
            (url ? fetch(url, { cache: 'no-cache' }).then(function (response) {
                if (!response.ok) throw new Error('Video listesi yüklenemedi');
                return response.json();
            }) : Promise.resolve([]));
        source.then(function (items) {
            if (!Array.isArray(items)) return;
            window.OTSInstagramVideos.setVideos(items);
        }).catch(function () {
            // Video listesi yüklenemezse sayfanın geri kalanı etkilenmez.
        });
        return true;
    }

    function init() {
        if (mount() || !document.documentElement || !window.MutationObserver) return;
        var observer = new MutationObserver(function () {
            if (mount()) observer.disconnect();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
        window.setTimeout(function () { observer.disconnect(); }, 15000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
}());
