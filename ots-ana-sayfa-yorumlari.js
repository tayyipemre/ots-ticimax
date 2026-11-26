(function () {
    'use strict';

    var SELECTOR = '.customer-comments';
    var STYLE_ID = 'ots-home-reviews-style';
    var DEFAULT_URL = 'https://ornekler.com.tr/js/ots/sayfalar/yorumlar.json';
    var PAGE_SIZE = 9;
    var MIN_RATE = 3;
    var state = {
        root: null,
        reviews: [],
        visible: 0,
        sort: 'newest',
        photosOnly: false
    };

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function clean(value) {
        return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    }

    function imageUrl(value) {
        var url = clean(value);
        return /^https:\/\/[^\s]+$/i.test(url) ? url : '';
    }

    function normalize(raw) {
        var media = [];
        if (raw.mediaFile) media.push(raw.mediaFile);
        if (Array.isArray(raw.mediaFiles)) media = media.concat(raw.mediaFiles);
        var images = media.map(function (file) {
            if (!file || (file.mediaType && file.mediaType !== 'IMAGE')) return null;
            var original = imageUrl(file.url || file.mobileUrl || file.thumbnailUrl);
            var thumb = imageUrl(file.thumbnailUrl || file.mobileUrl || file.url);
            return original ? { original: original, thumb: thumb || original } : null;
        }).filter(Boolean);
        var rate = Number(raw.rate != null ? raw.rate : raw.rating);
        return {
            id: clean(raw.id || raw.reviewId),
            text: clean(raw.comment || raw.review || raw.text),
            author: clean(raw.userFullName || raw.userName || raw.user) || 'ÖTS müşterisi',
            date: clean(raw.date || raw.commentDateISOType),
            rate: isFinite(rate) ? Math.max(0, Math.min(5, rate)) : 0,
            images: images
        };
    }

    function dateValue(value) {
        var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
        if (!match) return 0;
        return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }

    function displayDate(value) {
        var match = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?/.exec(value);
        if (!match) return value;
        return match[3] + '.' + match[2] + '.' + match[1] +
            (match[4] ? ' | ' + match[4] + ':' + match[5] : '');
    }

    function initials(name) {
        var words = name.replace(/\*/g, '').split(/\s+/).filter(Boolean);
        return (words.length > 1 ? words[0].charAt(0) + words[1].charAt(0) :
            (words[0] || 'Ö').slice(0, 2)).toLocaleUpperCase('tr-TR');
    }

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        var style = el('style');
        style.id = STYLE_ID;
        style.textContent = [
            '.customer-comments.ots-home-reviews{box-sizing:border-box;width:100%;max-width:1480px;margin:0 auto;padding:28px 20px 48px;color:#28333d;font-family:inherit}',
            '.customer-comments.ots-home-reviews *{box-sizing:border-box}',
            '.ots-home-reviews [hidden]{display:none!important}',
            '.ots-home-reviews .ots-review-intro{position:relative;display:flex;align-items:center;justify-content:space-between;gap:32px;overflow:hidden;margin-bottom:30px;padding:36px 42px;border-radius:22px;background:radial-gradient(circle at 78% 10%,#263a78 0%,#0c154c 49%,#091136 100%);color:#fff}',
            '.ots-home-reviews .ots-review-intro:after{content:"";position:absolute;right:-80px;bottom:-180px;width:360px;height:360px;border:1px solid rgba(255,255,255,.12);border-radius:50%;pointer-events:none}',
            '.ots-home-reviews .ots-review-intro-copy,.ots-home-reviews .ots-review-proof{position:relative;z-index:1}',
            '.ots-home-reviews .ots-review-eyebrow{display:flex;align-items:center;gap:10px;margin:0 0 15px;color:#cdd6f5;font-size:12px;font-weight:700;letter-spacing:.15em;text-transform:uppercase}',
            '.ots-home-reviews .ots-review-eyebrow:before{content:"";display:block;width:27px;height:3px;border-radius:3px;background:#ff4658}',
            '.ots-home-reviews .ots-review-intro h2{max-width:710px;margin:0;color:#fff;font-size:clamp(28px,3.4vw,44px);font-weight:700;letter-spacing:-.035em;line-height:1.13}',
            '.ots-home-reviews .ots-review-intro-desc{max-width:630px;margin:15px 0 0;color:#d9e0f2;font-size:16px;line-height:1.55}',
            '.ots-home-reviews .ots-review-proof{display:flex;flex:none;flex-direction:column;justify-content:center;min-width:214px;min-height:152px;padding:20px 24px;border:1px solid rgba(255,255,255,.2);border-radius:16px;background:rgba(255,255,255,.07)}',
            '.ots-home-reviews .ots-review-count{color:#fff;font-size:48px;font-weight:700;letter-spacing:-.045em;line-height:1}',
            '.ots-home-reviews .ots-review-proof-label{max-width:170px;margin-top:9px;color:#d9e0f2;font-size:13px;line-height:1.35}',
            '.ots-home-reviews .ots-review-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 20px}',
            '.ots-home-reviews .ots-review-sort{min-width:158px;height:50px;padding:0 42px 0 17px;border:2px solid #288a35;border-radius:10px;background:#fff;color:#18222c;font:inherit;font-size:16px;cursor:pointer}',
            '.ots-home-reviews .ots-review-photo{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:8px 14px;border:1px solid #e2e5e8;border-radius:9px;background:#fff;color:#28333d;font:inherit;font-size:15px;cursor:pointer;transition:background .2s,border-color .2s}',
            '.ots-home-reviews .ots-review-photo:hover,.ots-home-reviews .ots-review-photo[aria-pressed="true"]{border-color:#288a35;background:#f1f8f2}',
            '.ots-home-reviews .ots-review-photo svg{width:19px;height:19px;flex:none;fill:currentColor}',
            '.ots-home-reviews .ots-review-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}',
            '.ots-home-reviews .ots-review-card{min-width:0;min-height:276px;padding:26px;border:1px solid #dce5de;border-radius:20px;background:#fff;box-shadow:0 7px 25px rgba(29,48,40,.035)}',
            '.ots-home-reviews .ots-review-head{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0}',
            '.ots-home-reviews .ots-review-person{display:flex;align-items:center;gap:10px;min-width:0}',
            '.ots-home-reviews .ots-review-person>div{min-width:0}',
            '.ots-home-reviews .ots-review-avatar{display:grid;place-items:center;flex:none;width:42px;height:42px;border-radius:50%;background:#f4f5f7;color:#9da4b0;font-size:17px;font-weight:700}',
            '.ots-home-reviews .ots-review-author{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:16px;font-weight:700;line-height:1.25}',
            '.ots-home-reviews .ots-review-date{display:block;margin-top:3px;color:#97a1ae;font-size:13px;line-height:1.25}',
            '.ots-home-reviews .ots-review-rating{display:flex;align-items:center;gap:6px;flex:none;white-space:nowrap;font-size:17px;font-weight:700}',
            '.ots-home-reviews .ots-review-stars{color:#ffa313;letter-spacing:1px;font-size:21px;line-height:1}',
            '.ots-home-reviews .ots-review-stars .ots-review-empty-star{color:#d8dce1}',
            '.ots-home-reviews .ots-review-text{margin:19px 0 0;white-space:pre-line;overflow-wrap:anywhere;font-size:17px;line-height:1.65}',
            '.ots-home-reviews .ots-review-images{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}',
            '.ots-home-reviews .ots-review-images button{display:block;width:66px;height:66px;overflow:hidden;padding:0;border:1px solid #e5e8e9;border-radius:8px;background:#fff;cursor:zoom-in}',
            '.ots-home-reviews .ots-review-images img{width:100%;height:100%;object-fit:cover}',
            '.ots-home-reviews .ots-review-more{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;min-height:56px;margin-top:22px;border:2px solid #075dcb;border-radius:13px;background:#fff;color:#28333d;font:inherit;font-size:17px;cursor:pointer;transition:background .2s,color .2s}',
            '.ots-home-reviews .ots-review-more:hover{background:#f0f6ff}',
            '.ots-home-reviews .ots-review-more svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2}',
            '.ots-home-reviews .ots-review-message{padding:36px 16px;text-align:center;color:#687583;font-size:16px}',
            '.ots-home-reviews .ots-review-sort:focus{outline:none!important;box-shadow:none!important}',
            '.ots-home-reviews .ots-review-sort:focus-visible{background:#f4faf5}',
            '.ots-home-reviews button:focus-visible{outline:3px solid #075dcb;outline-offset:3px}',
            '.ots-home-review-modal{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;overflow:auto;padding:24px;background:rgba(7,14,38,.89)}',
            '.ots-home-review-modal__panel{position:relative;display:flex;align-items:center;justify-content:center;max-width:100%;max-height:100%;margin:auto}',
            '.ots-home-review-modal__image{display:block;max-width:100%;max-height:calc(100vh - 48px);object-fit:contain;border-radius:5px}',
            '.ots-home-review-modal__close{position:fixed;top:16px;right:16px;display:grid;place-items:center;width:42px;height:42px;padding:0;border:1px solid rgba(255,255,255,.35);border-radius:50%;background:#fff;color:#0c154c;font-size:29px;line-height:1;cursor:pointer}',
            '.ots-home-review-modal__close:focus-visible{outline:3px solid #fff;outline-offset:3px}',
            '@media(max-width:1050px){.ots-home-reviews .ots-review-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
            '@media(max-width:850px){.ots-home-reviews .ots-review-intro{align-items:flex-start;flex-direction:column;gap:24px}.ots-home-reviews .ots-review-proof{min-height:0;width:100%;flex-direction:row;align-items:center;justify-content:flex-start;gap:14px}.ots-home-reviews .ots-review-proof-label{max-width:none;margin:0}}',
            '@media(max-width:680px){.customer-comments.ots-home-reviews{padding:20px 14px 38px}.ots-home-reviews .ots-review-intro{gap:22px;margin-bottom:24px;padding:28px 23px;border-radius:17px}.ots-home-reviews .ots-review-intro-desc{font-size:14px}.ots-home-reviews .ots-review-count{font-size:38px}.ots-home-reviews .ots-review-grid{grid-template-columns:1fr;gap:14px}.ots-home-reviews .ots-review-card{min-height:0;padding:20px}.ots-home-reviews .ots-review-sort{min-width:0;width:52%;font-size:14px}.ots-home-reviews .ots-review-photo{font-size:14px}.ots-home-reviews .ots-review-text{font-size:16px}.ots-home-reviews .ots-review-rating{font-size:15px}.ots-home-reviews .ots-review-stars{font-size:17px}}',
            '@media(prefers-reduced-motion:reduce){.ots-home-reviews .ots-review-photo,.ots-home-reviews .ots-review-more{transition:none}}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function showImage(image, opener) {
        var overlay = el('div', 'ots-home-review-modal');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Müşteri yorumu fotoğrafı');
        var panel = el('div', 'ots-home-review-modal__panel');
        var close = el('button', 'ots-home-review-modal__close', '×');
        close.type = 'button';
        close.setAttribute('aria-label', 'Fotoğrafı kapat');
        var large = el('img', 'ots-home-review-modal__image');
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

    function filteredReviews() {
        var list = state.reviews.filter(function (review) {
            return !state.photosOnly || review.images.length > 0;
        }).slice();
        list.sort(function (a, b) {
            var dates = dateValue(b.date) - dateValue(a.date);
            if (state.sort === 'oldest') return -dates;
            if (state.sort === 'highest') return b.rate - a.rate || dates;
            if (state.sort === 'lowest') return a.rate - b.rate || dates;
            return dates;
        });
        return list;
    }

    function card(review) {
        var article = el('article', 'ots-review-card');
        var head = el('div', 'ots-review-head');
        var person = el('div', 'ots-review-person');
        var avatar = el('span', 'ots-review-avatar', initials(review.author));
        avatar.setAttribute('aria-hidden', 'true');
        var details = el('div');
        details.appendChild(el('strong', 'ots-review-author', review.author));
        if (review.date) details.appendChild(el('time', 'ots-review-date', displayDate(review.date)));
        person.appendChild(avatar);
        person.appendChild(details);
        var rating = el('div', 'ots-review-rating');
        rating.setAttribute('aria-label', '5 üzerinden ' + review.rate + ' yıldız');
        var stars = el('span', 'ots-review-stars');
        stars.setAttribute('aria-hidden', 'true');
        var filled = Math.round(review.rate);
        stars.appendChild(document.createTextNode('★'.repeat(filled)));
        stars.appendChild(el('span', 'ots-review-empty-star', '★'.repeat(5 - filled)));
        rating.appendChild(stars);
        rating.appendChild(el('span', '', review.rate.toFixed(1)));
        head.appendChild(person);
        head.appendChild(rating);
        article.appendChild(head);
        article.appendChild(el('p', 'ots-review-text', review.text));
        if (review.images.length) {
            var gallery = el('div', 'ots-review-images');
            review.images.forEach(function (image, index) {
                var button = el('button');
                button.type = 'button';
                button.setAttribute('aria-label', 'Yorum fotoğrafını büyüt ' + (index + 1));
                var img = el('img');
                img.src = image.thumb;
                img.alt = 'Müşteri yorumu fotoğrafı ' + (index + 1);
                img.loading = 'lazy';
                button.appendChild(img);
                button.addEventListener('click', function () { showImage(image, button); });
                gallery.appendChild(button);
            });
            article.appendChild(gallery);
        }
        return article;
    }

    function updateMore(total) {
        var button = state.root.querySelector('.ots-review-more');
        var remaining = total - state.visible;
        button.hidden = remaining <= 0;
        button.querySelector('.ots-review-more-label').textContent =
            'Devamını Göster (' + remaining + ')';
    }

    function appendPage() {
        var list = filteredReviews();
        var grid = state.root.querySelector('.ots-review-grid');
        var end = Math.min(state.visible + PAGE_SIZE, list.length);
        for (var i = state.visible; i < end; i += 1) grid.appendChild(card(list[i]));
        state.visible = end;
        updateMore(list.length);
    }

    function resetList() {
        state.visible = 0;
        var grid = state.root.querySelector('.ots-review-grid');
        grid.replaceChildren();
        var empty = state.root.querySelector('.ots-review-message');
        var hasReviews = filteredReviews().length > 0;
        empty.hidden = hasReviews;
        if (!hasReviews) {
            empty.textContent = state.photosOnly ? 'Fotoğraflı yorum bulunamadı.' : 'Henüz yorum bulunamadı.';
        }
        appendPage();
    }

    function renderShell(root) {
        var intro = el('section', 'ots-review-intro');
        intro.setAttribute('aria-labelledby', 'ots-review-intro-title');
        var introCopy = el('div', 'ots-review-intro-copy');
        introCopy.appendChild(el('p', 'ots-review-eyebrow', 'ÖTS müşteri deneyimleri'));
        var title = el('h2', '', 'Konforu yaşayanlar anlatıyor.');
        title.id = 'ots-review-intro-title';
        introCopy.appendChild(title);
        introCopy.appendChild(el('p', 'ots-review-intro-desc',
            'ÖTS’i tercih eden müşterilerimizin Trendyol’da paylaştığı deneyimleri keşfedin.'));
        var proof = el('div', 'ots-review-proof');
        proof.appendChild(el('strong', 'ots-review-count', '—'));
        proof.appendChild(el('span', 'ots-review-proof-label', '3 yıldız ve üzeri Trendyol yorumu'));
        intro.appendChild(introCopy);
        intro.appendChild(proof);
        root.appendChild(intro);
        var toolbar = el('div', 'ots-review-toolbar');
        var sort = el('select', 'ots-review-sort');
        sort.setAttribute('aria-label', 'Yorum sıralaması');
        [['newest', 'Sıralama'], ['newest', 'En yeni'], ['oldest', 'En eski'], ['highest', 'En yüksek puan'],
            ['lowest', 'En düşük puan']].forEach(function (item) {
            var option = el('option', '', item[1]);
            option.value = item[0];
            sort.appendChild(option);
        });
        sort.addEventListener('change', function () {
            state.sort = sort.value;
            resetList();
        });
        var photo = el('button', 'ots-review-photo');
        photo.type = 'button';
        photo.setAttribute('aria-pressed', 'false');
        photo.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5a2 2 0 0 1 2-2Zm0 2v13l5-5 3 3 4-5 5 6V5H3Zm4 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg><span>Fotoğraflı</span>';
        photo.addEventListener('click', function () {
            state.photosOnly = !state.photosOnly;
            photo.setAttribute('aria-pressed', String(state.photosOnly));
            resetList();
        });
        toolbar.appendChild(sort);
        toolbar.appendChild(photo);
        root.appendChild(toolbar);
        var grid = el('div', 'ots-review-grid');
        grid.setAttribute('aria-live', 'polite');
        root.appendChild(grid);
        var message = el('p', 'ots-review-message', 'Yorumlar yükleniyor...');
        message.setAttribute('role', 'status');
        root.appendChild(message);
        var more = el('button', 'ots-review-more');
        more.type = 'button';
        more.hidden = true;
        more.appendChild(el('span', 'ots-review-more-label'));
        more.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 9 7 7 7-7"/></svg>');
        more.addEventListener('click', appendPage);
        root.appendChild(more);
    }

    function mount() {
        var root = document.querySelector(SELECTOR);
        if (!root || root.getAttribute('data-ots-home-reviews') === 'ready') return false;
        root.setAttribute('data-ots-home-reviews', 'ready');
        root.classList.add('ots-home-reviews');
        root.setAttribute('aria-label', 'Müşteri yorumları');
        state.root = root;
        injectStyles();
        root.replaceChildren();
        renderShell(root);
        var url = root.getAttribute('data-reviews-url') || DEFAULT_URL;
        var type = root.getAttribute('data-review-type') === 'product' ? 'product' : 'store';
        fetch(url, { cache: 'no-cache' }).then(function (response) {
            if (!response.ok) throw new Error('Yorum isteği başarısız');
            return response.json();
        }).then(function (data) {
            var raw = data && data[type] && data[type].reviews;
            if (!Array.isArray(raw)) throw new Error('Yorum verisi geçersiz');
            var seen = Object.create(null);
            state.reviews = raw.map(normalize).filter(function (review) {
                if (!review.text || review.rate < MIN_RATE) return false;
                if (review.id && seen[review.id]) return false;
                if (review.id) seen[review.id] = true;
                return true;
            });
            root.querySelector('.ots-review-count').textContent = state.reviews.length.toLocaleString('tr-TR');
            resetList();
        }).catch(function () {
            var message = root.querySelector('.ots-review-message');
            message.textContent = 'Yorumlar şu anda yüklenemedi. Lütfen daha sonra tekrar deneyin.';
            message.hidden = false;
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
