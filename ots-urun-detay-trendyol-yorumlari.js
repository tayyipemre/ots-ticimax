(function () {
    'use strict';

    var ROOT_ID = 'otsPdpTrendyolReviews';
    var STYLE_ID = 'otsPdpTrendyolReviewsStyle';
    var DATA_URL = 'https://ornekler.com.tr/js/ots/sayfalar/yorumlar.json';
    var SCRIPT_URL = document.currentScript && document.currentScript.getAttribute('data-reviews-url');
    var PAGE_SIZE = 4;
    var MIN_RATE = 3;

    function element(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function clean(value) {
        return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    }

    function formatDate(value) {
        var date = /^(\d{4})-(\d{2})-(\d{2})/.exec(clean(value));
        return date ? date[3] + '.' + date[2] + '.' + date[1] : clean(value);
    }

    function safeImage(value) {
        var url = clean(value);
        return /^https:\/\/[^\s]+$/i.test(url) ? url : '';
    }

    function normalize(raw) {
        var rate = Number(raw.rate != null ? raw.rate : raw.rating);
        var files = Array.isArray(raw.mediaFiles) ? raw.mediaFiles.slice() : [];
        if (raw.mediaFile) files.push(raw.mediaFile);
        return {
            id: clean(raw.id || raw.reviewId),
            text: clean(raw.comment || raw.review || raw.text),
            author: clean(raw.userFullName || raw.userName || raw.user) || 'Trendyol müşterisi',
            date: clean(raw.date || raw.commentDateISOType),
            rate: isFinite(rate) ? Math.max(0, Math.min(5, rate)) : 0,
            images: files.map(function (file) {
                if (!file || (file.mediaType && file.mediaType !== 'IMAGE')) return null;
                var original = safeImage(file.url || file.mobileUrl || file.thumbnailUrl);
                var thumb = safeImage(file.thumbnailUrl || file.mobileUrl || file.url);
                return original ? { original: original, thumb: thumb || original } : null;
            }).filter(Boolean)
        };
    }

    function styles() {
        if (document.getElementById(STYLE_ID)) return;
        var style = element('style');
        style.id = STYLE_ID;
        style.textContent = [
            '#'+ROOT_ID+'{box-sizing:border-box;width:100%;margin:26px auto 36px;padding:0 18px;color:#27313d;font-family:inherit;clear:both}',
            '#'+ROOT_ID+' *{box-sizing:border-box}',
            '#'+ROOT_ID+' [hidden]{display:none!important}',
            '#'+ROOT_ID+' .ots-pdp-reviews-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin:0 0 18px;padding:0 0 15px;border-bottom:1px solid #e2e6eb}',
            '#'+ROOT_ID+' .ots-pdp-reviews-eyebrow{display:block;margin:0 0 5px;color:#0c154c;font-size:11px;font-weight:700;letter-spacing:.11em;text-transform:uppercase}',
            '#'+ROOT_ID+' h2{margin:0;color:#0c154c;font-size:clamp(18px,1.8vw,22px);font-weight:500;letter-spacing:-.025em;line-height:1.3}',
            '#'+ROOT_ID+' .ots-pdp-reviews-meta{display:block;margin:0;color:#778390;font-size:11px;line-height:1.4;text-align:right}',
            '#'+ROOT_ID+' .ots-pdp-reviews-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}',
            '#'+ROOT_ID+' .ots-pdp-review{min-width:0;padding:17px 18px;border:1px solid #e2e6eb;border-radius:12px;background:#fff}',
            '#'+ROOT_ID+' .ots-pdp-review-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}',
            '#'+ROOT_ID+' .ots-pdp-review-stars{color:#f6a317;font-size:14px;letter-spacing:1px;line-height:1;white-space:nowrap}',
            '#'+ROOT_ID+' .ots-pdp-review-stars span{color:#d9dde3}',
            '#'+ROOT_ID+' .ots-pdp-review-date{color:#8b95a2;font-size:11px;white-space:nowrap}',
            '#'+ROOT_ID+' .ots-pdp-review-text{margin:0;color:#2c3540;font-size:13px;line-height:1.6;overflow-wrap:anywhere}',
            '#'+ROOT_ID+' .ots-pdp-review-author{display:block;margin-top:12px;color:#667381;font-size:11px;font-weight:600}',
            '#'+ROOT_ID+' .ots-pdp-review-images{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}',
            '#'+ROOT_ID+' .ots-pdp-review-images button{display:block;width:56px;height:56px;overflow:hidden;padding:0;border:1px solid #e2e6eb;border-radius:7px;background:#fff;cursor:zoom-in}',
            '#'+ROOT_ID+' .ots-pdp-review-images img{display:block;width:100%;height:100%;object-fit:cover}',
            '#'+ROOT_ID+' .ots-pdp-reviews-more{display:block;margin:17px auto 0;padding:8px 4px;border:0;border-bottom:1px solid #0c154c;background:transparent;color:#0c154c;font:inherit;font-size:12px;font-weight:600;cursor:pointer}',
            '#'+ROOT_ID+' .ots-pdp-reviews-more:hover{color:#224492;border-color:#224492}',
            '#'+ROOT_ID+' .ots-pdp-reviews-more:focus-visible,#'+ROOT_ID+' .ots-pdp-review-images button:focus-visible{outline:2px solid #0c154c;outline-offset:3px}',
            '.ots-pdp-review-modal{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;overflow:auto;padding:24px;background:rgba(7,14,38,.89)}',
            '.ots-pdp-review-modal__panel{position:relative;display:flex;align-items:center;justify-content:center;max-width:100%;max-height:100%;margin:auto}',
            '.ots-pdp-review-modal__image{display:block;max-width:100%;max-height:calc(100vh - 48px);object-fit:contain;border-radius:5px}',
            '.ots-pdp-review-modal__close{position:fixed;top:16px;right:16px;display:grid;place-items:center;width:42px;height:42px;padding:0;border:1px solid rgba(255,255,255,.35);border-radius:50%;background:#fff;color:#0c154c;font-size:29px;line-height:1;cursor:pointer}',
            '.ots-pdp-review-modal__close:focus-visible{outline:3px solid #fff;outline-offset:3px}',
            '@media(max-width:1050px){#'+ROOT_ID+' .ots-pdp-reviews-list{grid-template-columns:repeat(2,minmax(0,1fr))}}',
            '@media(max-width:640px){#'+ROOT_ID+'{padding:0 14px;margin:22px auto 30px}#'+ROOT_ID+' .ots-pdp-reviews-head{align-items:flex-start;flex-direction:column;gap:5px}#'+ROOT_ID+' .ots-pdp-reviews-meta{text-align:left}#'+ROOT_ID+' .ots-pdp-reviews-list{grid-template-columns:1fr}#'+ROOT_ID+' .ots-pdp-review{padding:16px}}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function showImage(image, opener) {
        var overlay = element('div', 'ots-pdp-review-modal');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Müşteri yorumu fotoğrafı');
        var panel = element('div', 'ots-pdp-review-modal__panel');
        var close = element('button', 'ots-pdp-review-modal__close', '×');
        close.type = 'button';
        close.setAttribute('aria-label', 'Fotoğrafı kapat');
        var large = element('img', 'ots-pdp-review-modal__image');
        large.src = image.original;
        large.alt = 'Müşteri yorumu fotoğrafı';
        panel.appendChild(large);
        overlay.appendChild(panel);
        overlay.appendChild(close);
        var previousOverflow = document.body.style.overflow;
        function dismiss() {
            document.removeEventListener('keydown', onKeydown);
            document.body.style.overflow = previousOverflow;
            overlay.remove();
            opener.focus();
        }
        function onKeydown(event) {
            if (event.key === 'Escape') dismiss();
            if (event.key === 'Tab') {
                event.preventDefault();
                close.focus();
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
    }

    function reviewCard(review) {
        var card = element('article', 'ots-pdp-review');
        var top = element('div', 'ots-pdp-review-top');
        var stars = element('span', 'ots-pdp-review-stars');
        var filled = Math.round(review.rate);
        stars.setAttribute('aria-label', '5 üzerinden ' + review.rate + ' yıldız');
        stars.appendChild(document.createTextNode('★'.repeat(filled)));
        stars.appendChild(element('span', '', '★'.repeat(5 - filled)));
        top.appendChild(stars);
        if (review.date) {
            var date = element('time', 'ots-pdp-review-date', formatDate(review.date));
            date.dateTime = review.date;
            top.appendChild(date);
        }
        card.appendChild(top);
        card.appendChild(element('p', 'ots-pdp-review-text', review.text));
        card.appendChild(element('span', 'ots-pdp-review-author', review.author));
        if (review.images.length) {
            var images = element('div', 'ots-pdp-review-images');
            review.images.forEach(function (image, index) {
                var button = element('button');
                button.type = 'button';
                button.setAttribute('aria-label', 'Yorum fotoğrafını büyüt ' + (index + 1));
                var img = element('img');
                img.src = image.thumb;
                img.alt = 'Müşteri yorumu fotoğrafı ' + (index + 1);
                img.loading = 'lazy';
                button.appendChild(img);
                button.addEventListener('click', function () { showImage(image, button); });
                images.appendChild(button);
            });
            card.appendChild(images);
        }
        return card;
    }

    function render(target, reviews) {
        styles();
        var root = element('section');
        root.id = ROOT_ID;
        root.setAttribute('aria-labelledby', ROOT_ID + 'Title');
        var head = element('div', 'ots-pdp-reviews-head');
        var titleGroup = element('div');
        titleGroup.appendChild(element('span', 'ots-pdp-reviews-eyebrow', 'Müşteri yorumları'));
        var title = element('h2', '', 'Müşterilerimiz ne diyor?');
        title.id = ROOT_ID + 'Title';
        titleGroup.appendChild(title);
        head.appendChild(titleGroup);
        head.appendChild(element('span', 'ots-pdp-reviews-meta',
            'ÖTS Trendyol yorumları · ' + reviews.length + ' değerlendirme'));
        root.appendChild(head);
        var list = element('div', 'ots-pdp-reviews-list');
        root.appendChild(list);
        var more = element('button', 'ots-pdp-reviews-more');
        more.type = 'button';
        more.hidden = true;
        root.appendChild(more);
        var visible = 0;
        function nextPage() {
            var end = Math.min(visible + PAGE_SIZE, reviews.length);
            for (var i = visible; i < end; i += 1) list.appendChild(reviewCard(reviews[i]));
            visible = end;
            var remaining = reviews.length - visible;
            more.hidden = remaining === 0;
            more.textContent = 'Daha fazla yorum (' + remaining + ')';
        }
        more.addEventListener('click', nextPage);
        target.parentNode.insertBefore(root, target);
        nextPage();
    }

    function mount() {
        var target = document.querySelector('#divUrunOzellikAlani');
        if (!target || document.getElementById(ROOT_ID)) return false;
        var url = SCRIPT_URL || DATA_URL;
        fetch(url, { cache: 'no-cache' }).then(function (response) {
            if (!response.ok) throw new Error('Yorum verisi yüklenemedi');
            return response.json();
        }).then(function (data) {
            var store = data && data.store && data.store.reviews;
            var product = data && data.product && data.product.reviews;
            if (!Array.isArray(store) || !Array.isArray(product)) return;
            var raw = store.concat(product);
            var seen = Object.create(null);
            var reviews = raw.map(normalize).filter(function (review) {
                if (!review.text || review.rate < MIN_RATE) return false;
                if (review.id && seen[review.id]) return false;
                if (review.id) seen[review.id] = true;
                return true;
            }).sort(function (a, b) { return b.date.localeCompare(a.date); });
            if (reviews.length && !document.getElementById(ROOT_ID)) render(target, reviews);
        }).catch(function () {
            // Yorum servisi erişilemezse ürün detayının geri kalanı etkilenmez.
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
