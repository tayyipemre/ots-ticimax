/*
 * ÖTS İÇ GİYİM - MÜŞTERİ YORUMLARI SAYFASI
 *
 * Yükleme adresi : https://ornekler.com.tr/js/ots/sayfalar/yorumlar.js
 * Çalıştığı yer  : Müşteri yorumları sayfası
 *
 * Yalnızca bu sayfada çalışan arayüz modülüdür.
 *
 * Bölümler:
 *  1. Yorum verisi, kaydırıcı ve görsel önizleme
 */

/* ========================================================================
 * BÖLÜM 1: YORUM VERİSİ, KAYDIRICI VE GÖRSEL ÖNİZLEME
 *
 * Yorum verisini normalize eder, yinelenen kayıtları tekilleştirir ve
 * erişilebilir sekme/kaydırıcı/ışık kutusu arayüzünü yalnızca bu sayfada kurar.
 * ====================================================================== */
(function () {
    'use strict';

    var ROOT_ID = 'otsCustomerReviews';
    var STYLE_ID = 'otsCustomerReviewsStyles';
    var API_URL = 'https://ornekler.com.tr/js/ots/sayfalar/yorumlar.json';
    var MIN_RATE = 3;
    var AUTOPLAY_MS = 5200;

    var state = {
        root: null,
        activeTab: 'store',
        datasets: {
            store: [],
            product: []
        },
        summaries: {
            store: null,
            product: null
        },
        index: 0,
        lightboxIndex: 0,
        lightboxItems: [],
        timer: null,
        observer: null,
        abortController: null
    };

    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function cleanText(value) {
        return String(value || '').replace(/\s+/g, ' ').trim();
    }

    function safeNumber(value) {
        var number = Number(value);
        return Number.isFinite(number) ? number : 0;
    }

    function normalizeUrl(url) {
        if (!url) return '';
        if (/^https?:\/\//i.test(url)) return url;
        return 'https://www.trendyol.com' + (url.charAt(0) === '/' ? url : '/' + url);
    }

    function initialLetters(name) {
        var cleaned = cleanText(name).replace(/\*/g, '').replace(/\/.*/, '');
        var parts = cleaned.split(' ').filter(Boolean);
        var first = parts[0] ? parts[0].charAt(0) : 'Ö';
        var second = parts[1] ? parts[1].charAt(0) : 'T';
        return (first + second).toLocaleUpperCase('tr-TR');
    }

    function starText(rate) {
        var count = Math.max(0, Math.min(5, Math.round(safeNumber(rate))));
        return '★★★★★'.slice(0, count) + '☆☆☆☆☆'.slice(0, 5 - count);
    }

    function imageFromMedia(mediaFile) {
        if (!mediaFile) return '';
        return mediaFile.mobileUrl || mediaFile.thumbnailUrl || mediaFile.url || '';
    }

    function normalizeReview(raw) {
        var product = raw.product || {};
        var mediaFiles = [];
        var review = {
            reviewId: String(raw.reviewId || raw.id || Math.random()),
            text: cleanText(raw.comment || raw.review || raw.text),
            author: cleanText(raw.userName || raw.userFullName || raw.user || 'ÖTS müşterisi'),
            date: cleanText(raw.date || raw.commentDateISOType || ''),
            rate: safeNumber(raw.rate || raw.rating),
            productTitle: cleanText(product.title || raw.productName || ''),
            productUrl: normalizeUrl(product.link || product.url || raw.url || ''),
            images: []
        };

        if (raw.mediaFile) mediaFiles.push(raw.mediaFile);
        if (Array.isArray(raw.mediaFiles)) mediaFiles = mediaFiles.concat(raw.mediaFiles);

        mediaFiles.forEach(function (mediaFile) {
            var image = imageFromMedia(mediaFile);
            if (!image) return;

            review.images.push({
                url: image,
                // Işık kutusunda küçük önizleme yerine tam boy görsel kullanılır.
                full: mediaFile.url || image,
                alt: review.productTitle || 'Müşteri yorum görseli'
            });
        });

        return review;
    }

    function collectRawReviews(data) {
        var list = [];

        if (Array.isArray(data)) list = list.concat(data);

        ['images', 'reviews', 'content', 'items', 'result'].forEach(function (key) {
            if (Array.isArray(data && data[key])) list = list.concat(data[key]);
        });

        if (data && data.result && Array.isArray(data.result.images)) {
            list = list.concat(data.result.images);
        }

        if (data && data.productReviews && Array.isArray(data.productReviews.content)) {
            list = list.concat(data.productReviews.content);
        }

        return list;
    }

    function normalizeReviews(data) {
        var grouped = Object.create(null);

        collectRawReviews(data).forEach(function (raw) {
            var review = normalizeReview(raw || {});
            if (!review.text || review.rate < MIN_RATE) return;

            if (!grouped[review.reviewId]) {
                grouped[review.reviewId] = review;
                return;
            }

            review.images.forEach(function (image) {
                var exists = grouped[review.reviewId].images.some(function (current) {
                    return current.url === image.url;
                });

                if (!exists) grouped[review.reviewId].images.push(image);
            });
        });

        return Object.keys(grouped).map(function (key) {
            return grouped[key];
        }).sort(function (a, b) {
            var dateA = Date.parse(a.date);
            var dateB = Date.parse(b.date);
            // Missing or invalid dates follow all dated reviews.
            if (!Number.isFinite(dateA)) return Number.isFinite(dateB) ? 1 : 0;
            if (!Number.isFinite(dateB)) return -1;
            return dateB - dateA;
        });
    }

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            'body {',
            '  --ots-review-blue: #0c154c;',
            '  --ots-review-blue-2: #172568;',
            '  --ots-review-sky: #eaf7ff;',
            '  --ots-review-cyan: #75d9ef;',
            '  --ots-review-ink-soft: #66708b;',
            '}',
            '#mainHolder_divDesign { width: 100% !important; max-width: none !important; }',
            '#mainHolder_divDesign > div,',
            '#mainHolder_divDesign .ticiContainer { width: 100% !important; max-width: none !important; padding-left: 0 !important; padding-right: 0 !important; }',
            '.ots-legacy-reviews-hidden { display: none !important; }',
            '#otsCustomerReviews, #otsCustomerReviews * { box-sizing: border-box; }',
            '#otsCustomerReviews {',
            '  width: 100%;',
            '  position: relative;',
            '  overflow: hidden;',
            '  padding: 72px 24px 86px;',
            '  color: var(--ots-review-blue);',
            '  background:',
            '    radial-gradient(circle at 10% 12%, rgba(117,217,239,.28), transparent 32%),',
            '    radial-gradient(circle at 92% 8%, rgba(12,21,76,.09), transparent 34%),',
            '    linear-gradient(180deg, #fbfdff 0%, #f4f9fc 100%);',
            '  font-family: Manrope, "DM Sans", Arial, sans-serif;',
            '}',
            '#otsCustomerReviews::before {',
            '  content: "";',
            '  position: absolute;',
            '  inset: 0;',
            '  opacity: .42;',
            '  pointer-events: none;',
            '  background-image: radial-gradient(circle, rgba(12,21,76,.13) 0 1.2px, transparent 1.4px);',
            '  background-size: 24px 24px;',
            '}',
            '.ots-review-wrap { position: relative; z-index: 1; width: min(1240px, 100%); margin: 0 auto; }',
            '.ots-review-tabs { display: inline-flex; gap: 7px; padding: 7px; margin: 0 0 28px; border: 1px solid rgba(12,21,76,.1); border-radius: 999px; background: rgba(255,255,255,.76); box-shadow: 0 16px 42px rgba(12,21,76,.06); backdrop-filter: blur(10px); }',
            '.ots-review-tab { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 0 20px; color: var(--ots-review-blue); font-size: 13px; font-weight: 850; border: 0; border-radius: 999px; background: transparent; cursor: pointer; transition: color .2s ease, background .2s ease, box-shadow .2s ease, transform .2s ease; }',
            '.ots-review-tab span { min-width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; padding: 0 7px; color: #177d99; font-size: 10px; font-weight: 900; border-radius: 999px; background: #effbff; }',
            '.ots-review-tab:hover { transform: translateY(-1px); background: rgba(12,21,76,.06); }',
            '.ots-review-tab.is-active { color: #fff; background: var(--ots-review-blue); box-shadow: 0 12px 28px rgba(12,21,76,.18); }',
            '.ots-review-tab.is-active span { color: var(--ots-review-blue); background: #fff; }',
            '.ots-review-hero { display: grid; grid-template-columns: minmax(0, .92fr) minmax(360px, .72fr); gap: clamp(24px, 4vw, 56px); align-items: center; margin-bottom: 34px; }',
            '.ots-review-kicker { display: inline-flex; align-items: center; gap: 12px; margin: 0 0 18px; color: var(--ots-review-blue); font-size: 12px; font-weight: 850; letter-spacing: .19em; text-transform: uppercase; }',
            '.ots-review-kicker::before { content: ""; width: 36px; height: 1px; background: currentColor; opacity: .7; }',
            '.ots-review-title { max-width: 760px; margin: 0; color: var(--ots-review-blue); font-size: clamp(38px, 5.3vw, 78px); font-weight: 850; line-height: .96; letter-spacing: -.065em; }',
            '.ots-review-title span { color: #2092b2; }',
            '.ots-review-lead { max-width: 660px; margin: 22px 0 0; color: var(--ots-review-ink-soft); font-size: 16px; font-weight: 650; line-height: 1.8; }',
            '.ots-review-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 30px; }',
            '.ots-review-stat { min-height: 92px; padding: 18px; border: 1px solid rgba(12,21,76,.11); border-radius: 22px; background: rgba(255,255,255,.74); box-shadow: 0 18px 40px rgba(12,21,76,.06); backdrop-filter: blur(10px); }',
            '.ots-review-stat strong { display: block; color: var(--ots-review-blue); font-size: 25px; line-height: 1; letter-spacing: -.04em; }',
            '.ots-review-stat span { display: block; margin-top: 9px; color: var(--ots-review-ink-soft); font-size: 12px; font-weight: 750; line-height: 1.35; }',
            '.ots-review-featured { position: relative; min-height: 430px; padding: 1px; overflow: hidden; border-radius: 34px; background: linear-gradient(135deg, rgba(117,217,239,.9), rgba(12,21,76,.35), rgba(255,255,255,.8)); box-shadow: 0 28px 80px rgba(12,21,76,.14); }',
            '.ots-review-featured::before { content: ""; position: absolute; width: 180%; height: 180%; left: -40%; top: -40%; background: conic-gradient(from 0deg, transparent 0 16%, rgba(117,217,239,.92) 24%, transparent 38%, rgba(12,21,76,.58) 55%, transparent 74%, rgba(255,255,255,.88) 88%, transparent 100%); animation: otsReviewBorder 9s linear infinite; }',
            '.ots-review-featured-inner { position: relative; z-index: 1; min-height: 428px; display: flex; flex-direction: column; justify-content: space-between; padding: 32px; border-radius: 33px; background: radial-gradient(circle at 80% 18%, rgba(117,217,239,.22), transparent 34%), linear-gradient(145deg, #fff 0%, #eef9ff 100%); }',
            '.ots-review-quote-mark { width: 58px; height: 58px; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-size: 40px; font-weight: 800; border-radius: 19px; background: var(--ots-review-blue); box-shadow: 0 16px 36px rgba(12,21,76,.2); }',
            '.ots-review-featured-slide { display: none; animation: otsReviewSlide .48s cubic-bezier(.2,.75,.2,1) both; }',
            '.ots-review-featured-slide.is-active { display: block; }',
            '.ots-review-featured-text { margin: 22px 0 18px; color: var(--ots-review-blue); font-size: clamp(20px, 2vw, 29px); font-weight: 750; line-height: 1.34; letter-spacing: -.035em; }',
            '.ots-review-featured-product { display: inline-block; max-width: 100%; margin: 0 0 18px; color: #66708b !important; font-size: 12px; font-weight: 800; line-height: 1.35; text-decoration: none !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
            '.ots-review-featured-images { display: flex; gap: 8px; max-width: 100%; margin: 0 0 20px; overflow-x: auto; scrollbar-width: thin; }',
            '.ots-review-image-button { position: relative; flex: 0 0 auto; display: block; padding: 0; overflow: hidden; border: 0; background: transparent; cursor: zoom-in; }',
            '.ots-review-image-button::after { content: "Büyüt"; position: absolute; right: 7px; bottom: 7px; padding: 5px 7px; color: #fff; font-size: 9px; font-weight: 850; line-height: 1; border-radius: 999px; background: rgba(12,21,76,.74); opacity: 0; transform: translateY(5px); transition: opacity .2s ease, transform .2s ease; }',
            '.ots-review-image-button:hover::after { opacity: 1; transform: translateY(0); }',
            '.ots-review-featured-images img { width: 72px; height: 72px; display: block; object-fit: cover; border-radius: 16px; border: 1px solid rgba(12,21,76,.1); background: #fff; }',
            '.ots-review-featured-foot { display: flex; align-items: center; gap: 14px; }',
            '.ots-review-avatar { width: 48px; height: 48px; display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; color: #fff; font-size: 13px; font-weight: 900; border-radius: 50%; background: linear-gradient(135deg, var(--ots-review-blue), #2092b2); }',
            '.ots-review-author strong { display: block; color: var(--ots-review-blue); font-size: 14px; font-weight: 850; line-height: 1.2; }',
            '.ots-review-author span { display: block; margin-top: 4px; color: var(--ots-review-ink-soft); font-size: 11px; font-weight: 750; }',
            '.ots-review-stars { margin-bottom: 7px; color: #1d9bbd; font-size: 14px; letter-spacing: .08em; white-space: nowrap; }',
            '.ots-review-controls { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 28px; }',
            '.ots-review-arrows { display: flex; gap: 8px; }',
            '.ots-review-arrow { width: 42px; height: 42px; display: inline-flex; align-items: center; justify-content: center; padding: 0; color: var(--ots-review-blue); font-size: 25px; border: 1px solid rgba(12,21,76,.15); border-radius: 999px; background: rgba(255,255,255,.8); cursor: pointer; transition: transform .2s ease, background .2s ease, color .2s ease; }',
            '.ots-review-arrow:hover { color: #fff; background: var(--ots-review-blue); transform: translateY(-1px); }',
            '.ots-review-dots { display: flex; gap: 6px; }',
            '.ots-review-dot { width: 7px; height: 7px; padding: 0; border: 0; border-radius: 999px; background: rgba(12,21,76,.22); cursor: pointer; transition: width .25s ease, background .25s ease; }',
            '.ots-review-dot.is-active { width: 24px; background: var(--ots-review-blue); }',
            '.ots-review-grid-head { display: flex; align-items: end; justify-content: space-between; gap: 18px; margin: 42px 0 18px; }',
            '.ots-review-grid-head h2 { margin: 0; color: var(--ots-review-blue); font-size: clamp(24px, 3vw, 40px); font-weight: 850; letter-spacing: -.045em; }',
            '.ots-review-grid-note { max-width: 860px; margin: 28px auto 0; color: var(--ots-review-ink-soft); font-size: 11px; font-weight: 650; line-height: 1.6; text-align: center; opacity: .82; }',
            '.ots-review-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }',
            '.ots-review-card { position: relative; min-height: 270px; display: flex; flex-direction: column; justify-content: space-between; padding: 22px; border: 1px solid rgba(12,21,76,.1); border-radius: 28px 28px 28px 10px; background: rgba(255,255,255,.88); box-shadow: 0 18px 45px rgba(12,21,76,.065); transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease; }',
            '.ots-review-card::after { content: ""; position: absolute; left: -2px; bottom: -4px; width: 22px; height: 22px; background: inherit; border-left: 1px solid rgba(12,21,76,.1); border-bottom: 1px solid rgba(12,21,76,.1); transform: rotate(-10deg) skew(-18deg); border-bottom-left-radius: 7px; }',
            '.ots-review-card:hover { transform: translateY(-4px); border-color: rgba(32,146,178,.34); box-shadow: 0 26px 60px rgba(12,21,76,.11); }',
            '.ots-review-card-text { margin: 14px 0 16px; color: #263257; font-size: 14px; font-weight: 650; line-height: 1.62; }',
            '.ots-review-card-images { display: flex; gap: 7px; max-width: 100%; margin: 0 0 16px; overflow-x: auto; scrollbar-width: thin; }',
            '.ots-review-card-images img { width: 64px; height: 64px; display: block; object-fit: cover; border: 1px solid rgba(12,21,76,.1); border-radius: 14px; background: #f5f8fb; }',
            '.ots-review-product { display: block; max-width: 100%; margin: 0 0 14px; color: #6a7390 !important; font-size: 11px; font-weight: 800; line-height: 1.35; text-decoration: none !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
            '.ots-review-card-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; }',
            '.ots-review-card .ots-review-avatar { width: 40px; height: 40px; font-size: 11px; }',
            '.ots-review-source { display: inline-flex; align-items: center; min-height: 28px; padding: 0 10px; color: #177d99; font-size: 10px; font-weight: 850; border: 1px solid rgba(32,146,178,.18); border-radius: 999px; background: #effbff; white-space: nowrap; }',
            '.ots-review-loading, .ots-review-empty { min-height: 260px; display: grid; place-items: center; padding: 40px; color: var(--ots-review-blue); font-size: 18px; font-weight: 850; text-align: center; border: 1px solid rgba(12,21,76,.1); border-radius: 30px; background: rgba(255,255,255,.75); }',
            '.ots-review-lightbox { position: fixed; inset: 0; z-index: 2147483000; display: none; align-items: center; justify-content: center; padding: 28px; background: rgba(4, 8, 31, .72); backdrop-filter: blur(14px); }',
            '.ots-review-lightbox.is-active { display: flex; }',
            '.ots-review-lightbox-dialog { position: relative; width: min(980px, 100%); max-height: calc(100vh - 56px); display: grid; grid-template-rows: minmax(0, 1fr) auto; overflow: hidden; border: 1px solid rgba(255,255,255,.22); border-radius: 28px; background: #fff; box-shadow: 0 32px 110px rgba(0,0,0,.35); }',
            '.ots-review-lightbox-media { min-height: 0; display: grid; place-items: center; padding: 18px; background: linear-gradient(145deg, #f7fbff, #eef6fb); }',
            '.ots-review-lightbox-media img { max-width: 100%; max-height: min(68vh, 720px); object-fit: contain; border-radius: 20px; box-shadow: 0 18px 60px rgba(12,21,76,.16); }',
            '.ots-review-lightbox-caption { padding: 19px 22px 22px; color: var(--ots-review-blue); border-top: 1px solid rgba(12,21,76,.1); background: rgba(255,255,255,.98); }',
            '.ots-review-lightbox-caption p { margin: 8px 0 0; color: #263257; font-size: 14px; font-weight: 650; line-height: 1.58; }',
            '.ots-review-lightbox-meta { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: var(--ots-review-ink-soft); font-size: 11px; font-weight: 850; }',
            '.ots-review-lightbox-product { display: block; max-width: 100%; margin-top: 9px; color: #66708b !important; font-size: 11px; font-weight: 800; text-decoration: none !important; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
            '.ots-review-lightbox-close, .ots-review-lightbox-nav { position: absolute; z-index: 2; display: inline-flex; align-items: center; justify-content: center; padding: 0; color: var(--ots-review-blue); border: 1px solid rgba(12,21,76,.13); border-radius: 999px; background: rgba(255,255,255,.92); box-shadow: 0 14px 34px rgba(12,21,76,.15); cursor: pointer; transition: transform .2s ease, color .2s ease, background .2s ease; }',
            '.ots-review-lightbox-close:hover, .ots-review-lightbox-nav:hover { color: #fff; background: var(--ots-review-blue); transform: translateY(-1px); }',
            '.ots-review-lightbox-close { top: 16px; right: 16px; width: 44px; height: 44px; font-size: 28px; }',
            '.ots-review-lightbox-nav { top: 50%; width: 48px; height: 48px; font-size: 34px; transform: translateY(-50%); }',
            '.ots-review-lightbox-nav:hover { transform: translateY(calc(-50% - 1px)); }',
            '.ots-review-lightbox-prev { left: 18px; }',
            '.ots-review-lightbox-next { right: 18px; }',
            '@keyframes otsReviewBorder { to { transform: rotate(360deg); } }',
            '@keyframes otsReviewSlide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }',
            '@media (max-width: 1024px) {',
            '  .ots-review-hero { grid-template-columns: 1fr; }',
            '  .ots-review-featured { min-height: 0; }',
            '  .ots-review-featured-inner { min-height: 320px; }',
            '  .ots-review-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }',
            '}',
            '@media (max-width: 680px) {',
            '  #otsCustomerReviews { padding: 44px 14px 60px; }',
            '  .ots-review-tabs { width: 100%; display: grid; grid-template-columns: 1fr 1fr; border-radius: 22px; }',
            '  .ots-review-tab { min-height: 40px; padding: 0 10px; font-size: 11px; }',
            '  .ots-review-title { font-size: 40px; }',
            '  .ots-review-lead { font-size: 14px; line-height: 1.65; }',
            '  .ots-review-stats { grid-template-columns: 1fr; }',
            '  .ots-review-featured-inner { min-height: 300px; padding: 23px; border-radius: 25px; }',
            '  .ots-review-featured { border-radius: 26px; }',
            '  .ots-review-featured-text { font-size: 21px; }',
            '  .ots-review-grid-head { display: block; }',
            '  .ots-review-grid-note { margin-top: 22px; text-align: left; }',
            '  .ots-review-grid { grid-template-columns: 1fr; gap: 15px; }',
            '  .ots-review-card { min-height: 0; padding: 21px; border-radius: 23px 23px 23px 10px; }',
            '  .ots-review-card-foot { align-items: flex-start; flex-direction: column; }',
            '  .ots-review-lightbox { padding: 13px; }',
            '  .ots-review-lightbox-dialog { max-height: calc(100vh - 26px); border-radius: 22px; }',
            '  .ots-review-lightbox-media { padding: 12px; }',
            '  .ots-review-lightbox-media img { max-height: 58vh; border-radius: 16px; }',
            '  .ots-review-lightbox-caption { padding: 15px 16px 18px; }',
            '  .ots-review-lightbox-caption p { font-size: 13px; }',
            '  .ots-review-lightbox-close { top: 10px; right: 10px; width: 40px; height: 40px; }',
            '  .ots-review-lightbox-nav { width: 42px; height: 42px; font-size: 30px; }',
            '  .ots-review-lightbox-prev { left: 10px; }',
            '  .ots-review-lightbox-next { right: 10px; }',
            '}',
            '@media (prefers-reduced-motion: reduce) {',
            '  #otsCustomerReviews * { animation: none !important; transition-duration: .01ms !important; }',
            '}'
        ].join('\n');

        document.head.appendChild(style);
    }

    function hideLegacyReviews() {
        qsa('#mainHolder_divDesign .musterikutu').forEach(function (box) {
            box.setAttribute('aria-hidden', 'true');
        });

        var legacySection = qs('#mainHolder_divDesign .musterikutu');
        if (legacySection) {
            var section = legacySection.closest('section');
            if (section) section.classList.add('ots-legacy-reviews-hidden');
        }
    }

    function createShell() {
        var root = document.createElement('section');
        root.id = ROOT_ID;
        root.setAttribute('aria-label', 'Müşteri yorumları');
        root.innerHTML = '<div class="ots-review-wrap"><div class="ots-review-loading">Yorumlar yükleniyor...</div></div>';
        return root;
    }

    function averageFromReviews(reviews, summary) {
        var value = summary && summary.averageRatingText
            ? summary.averageRatingText
            : summary && summary.averageRating
                ? String(summary.averageRating)
                : reviews.length
                    ? String((reviews.reduce(function (total, review) { return total + review.rate; }, 0) / reviews.length).toFixed(1))
                    : '5.0';

        return value.replace('.', ',');
    }

    function renderLayout(root, reviews, activeTab) {
        var summary = state.summaries[activeTab];
        var average = averageFromReviews(reviews, summary);
        var storeCount = state.datasets.store.length;
        var productCount = state.datasets.product.length;
        var isProductTab = activeTab === 'product';
        var kicker = isProductTab ? 'Ürün Yorumları' : 'Satıcı Yorumları';
        var lead = isProductTab
            ? 'Trendyol ürün sayfalarından gelen gerçek ürün yorumlarını, ürün adı ve varsa müşteri görselleriyle birlikte burada listeliyoruz.'
            : 'Trendyol satıcı mağazamızdan gelen yüksek puanlı gerçek müşteri yorumlarını, ürün deneyimi ve görselleriyle birlikte burada listeliyoruz.';
        var totalLabel = isProductTab ? 'yayınlanan ürün yorumu' : 'yayınlanan satıcı yorumu';
        var note = isProductTab
            ? 'Ürünlere ait yorumlar Trendyol satıcı mağazamızda listelenen ürün yorumlarından alınır. 3 yıldız ve üzerindeki yorumlar otomatik olarak çekilir; görsel eklenen yorumlarda fotoğraflar kart içinde yatay kaydırılabilir.'
            : 'Ürünlere ait fotoğraf ve yorumlar Trendyol satıcı mağazamıza ve ürünlerimize ait yorumlardır. 3 yıldız ve üzerindeki yorumlar otomatik olarak çekilir; görsel eklenen yorumlarda fotoğraflar kart içinde yatay kaydırılabilir.';

        root.innerHTML = [
            '<div class="ots-review-wrap">',
            '  <div class="ots-review-tabs" role="tablist" aria-label="Yorum türü">',
            '    <button type="button" class="ots-review-tab' + (activeTab === 'store' ? ' is-active' : '') + '" data-review-tab="store" role="tab" aria-selected="' + (activeTab === 'store' ? 'true' : 'false') + '">Mağaza yorumları <span>' + storeCount + '</span></button>',
            '    <button type="button" class="ots-review-tab' + (activeTab === 'product' ? ' is-active' : '') + '" data-review-tab="product" role="tab" aria-selected="' + (activeTab === 'product' ? 'true' : 'false') + '">Ürün yorumları <span>' + productCount + '</span></button>',
            '  </div>',
            '  <div class="ots-review-hero">',
            '    <div class="ots-review-copy">',
            '      <p class="ots-review-kicker">' + kicker + '</p>',
            '      <h1 class="ots-review-title">Müşterilerimiz <span>ne söylüyor?</span></h1>',
            '      <p class="ots-review-lead">' + lead + '</p>',
            '      <div class="ots-review-stats">',
            '        <div class="ots-review-stat"><strong>' + reviews.length + '+</strong><span>' + totalLabel + '</span></div>',
            '        <div class="ots-review-stat"><strong>' + average + '★</strong><span>listelenen yorumların ortalama puanı</span></div>',
            '      </div>',
            '    </div>',
            '    <div class="ots-review-featured">',
            '      <div class="ots-review-featured-inner">',
            '        <div>',
            '          <div class="ots-review-quote-mark">“</div>',
            '          <div class="ots-review-featured-track"></div>',
            '        </div>',
            '        <div class="ots-review-controls">',
            '          <div class="ots-review-dots" aria-label="Öne çıkan yorumlar"></div>',
            '          <div class="ots-review-arrows">',
            '            <button type="button" class="ots-review-arrow" data-dir="-1" aria-label="Önceki yorum">‹</button>',
            '            <button type="button" class="ots-review-arrow" data-dir="1" aria-label="Sonraki yorum">›</button>',
            '          </div>',
            '        </div>',
            '      </div>',
            '    </div>',
            '  </div>',
            '  <div class="ots-review-grid-head">',
            '    <h2>Tüm yorumlar</h2>',
            '  </div>',
            '  <div class="ots-review-grid"></div>',
            '  <p class="ots-review-grid-note">' + note + '</p>',
            '</div>'
        ].join('');
    }

    function buildLightboxItems(reviews) {
        var items = [];

        reviews.forEach(function (review) {
            review.images.forEach(function (image) {
                image.lightboxIndex = items.length;
                items.push({
                    image: image.full || image.url,
                    alt: image.alt,
                    text: review.text,
                    author: review.author,
                    date: review.date,
                    rate: review.rate,
                    productTitle: review.productTitle,
                    productUrl: review.productUrl
                });
            });
        });

        state.lightboxItems = items;
    }

    function appendImages(container, review, className) {
        if (!review.images.length) return;

        var images = document.createElement('div');
        images.className = className;

        review.images.forEach(function (image) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'ots-review-image-button';
            button.setAttribute('data-lightbox-index', String(image.lightboxIndex));
            button.setAttribute('aria-label', 'Yorum görselini büyüt');

            var img = document.createElement('img');
            img.src = image.url;
            img.alt = image.alt;
            img.loading = 'lazy';

            button.appendChild(img);
            images.appendChild(button);
        });

        container.appendChild(images);
    }

    function createProductLink(review, className) {
        if (!review.productTitle) return null;

        var link = document.createElement(review.productUrl ? 'a' : 'span');
        link.className = className;
        link.textContent = review.productTitle;

        if (review.productUrl) {
            link.href = review.productUrl;
            link.target = '_blank';
            link.rel = 'noopener';
        }

        return link;
    }

    function createFeaturedSlide(review, index) {
        var slide = document.createElement('article');
        slide.className = 'ots-review-featured-slide';
        slide.setAttribute('data-index', String(index));

        var product = createProductLink(review, 'ots-review-featured-product');
        if (product) slide.appendChild(product);

        var text = document.createElement('p');
        text.className = 'ots-review-featured-text';
        text.textContent = review.text;
        slide.appendChild(text);

        appendImages(slide, review, 'ots-review-featured-images');

        var foot = document.createElement('div');
        foot.className = 'ots-review-featured-foot';

        var avatar = document.createElement('span');
        avatar.className = 'ots-review-avatar';
        avatar.textContent = initialLetters(review.author);

        var author = document.createElement('div');
        author.className = 'ots-review-author';
        author.innerHTML = '<strong></strong><span></span>';
        qs('strong', author).textContent = review.author;
        qs('span', author).textContent = review.date ? 'Trendyol · ' + review.date : 'Trendyol';

        var stars = document.createElement('div');
        stars.className = 'ots-review-stars';
        stars.setAttribute('aria-label', review.rate + ' yıldız');
        stars.textContent = starText(review.rate);

        foot.appendChild(avatar);
        foot.appendChild(author);
        foot.appendChild(stars);
        slide.appendChild(foot);

        return slide;
    }

    function createReviewCard(review) {
        var card = document.createElement('article');
        card.className = 'ots-review-card';

        var stars = document.createElement('div');
        stars.className = 'ots-review-stars';
        stars.setAttribute('aria-label', review.rate + ' yıldız');
        stars.textContent = starText(review.rate);

        var product = createProductLink(review, 'ots-review-product');

        var text = document.createElement('p');
        text.className = 'ots-review-card-text';
        text.textContent = review.text;

        var foot = document.createElement('div');
        foot.className = 'ots-review-card-foot';

        var identity = document.createElement('div');
        identity.className = 'ots-review-featured-foot';

        var avatar = document.createElement('span');
        avatar.className = 'ots-review-avatar';
        avatar.textContent = initialLetters(review.author);

        var author = document.createElement('div');
        author.className = 'ots-review-author';
        author.innerHTML = '<strong></strong><span></span>';
        qs('strong', author).textContent = review.author;
        qs('span', author).textContent = review.date || 'Doğrulanmış deneyim';

        var source = document.createElement('span');
        source.className = 'ots-review-source';
        source.textContent = 'Trendyol';

        identity.appendChild(avatar);
        identity.appendChild(author);
        foot.appendChild(identity);
        foot.appendChild(source);

        card.appendChild(stars);
        if (product) card.appendChild(product);
        card.appendChild(text);
        appendImages(card, review, 'ots-review-card-images');
        card.appendChild(foot);

        return card;
    }

    function setActive(index) {
        if (!state.root) return;

        var slides = qsa('.ots-review-featured-slide', state.root);
        if (!slides.length) return;

        state.index = (index + slides.length) % slides.length;

        slides.forEach(function (slide) {
            slide.classList.toggle('is-active', Number(slide.getAttribute('data-index')) === state.index);
        });

        qsa('.ots-review-dot', state.root).forEach(function (dot) {
            var active = Number(dot.getAttribute('data-index')) === state.index;
            dot.classList.toggle('is-active', active);
            dot.setAttribute('aria-current', active ? 'true' : 'false');
        });
    }

    function stopAutoplay() {
        if (!state.timer) return;
        window.clearInterval(state.timer);
        state.timer = null;
    }

    function startAutoplay() {
        stopAutoplay();
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        state.timer = window.setInterval(function () {
            setActive(state.index + 1);
        }, AUTOPLAY_MS);
    }

    function bindSlider(root) {
        if (root.getAttribute('data-ots-review-bound') === 'true') return;
        root.setAttribute('data-ots-review-bound', 'true');

        root.addEventListener('click', function (event) {
            var tab = event.target.closest && event.target.closest('.ots-review-tab');
            var arrow = event.target.closest && event.target.closest('.ots-review-arrow');
            var dot = event.target.closest && event.target.closest('.ots-review-dot');
            var imageButton = event.target.closest && event.target.closest('.ots-review-image-button');

            if (tab) {
                renderReviews(tab.getAttribute('data-review-tab') || 'store');
                return;
            }

            if (imageButton) {
                openLightbox(Number(imageButton.getAttribute('data-lightbox-index')) || 0);
                return;
            }

            if (arrow) {
                setActive(state.index + (Number(arrow.getAttribute('data-dir')) || 1));
                startAutoplay();
            }

            if (dot) {
                setActive(Number(dot.getAttribute('data-index')) || 0);
                startAutoplay();
            }
        });
    }

    /* Öne çıkan alan her sekme değişiminde yeniden üretildiği için hover
       dinleyicileri bindSlider'a değil, her render sonrasına bağlanır. */
    function bindFeaturedHover(root) {
        var featured = qs('.ots-review-featured', root);
        if (!featured) return;
        featured.addEventListener('mouseenter', stopAutoplay);
        featured.addEventListener('mouseleave', startAutoplay);
    }

    function createLightbox() {
        var current = document.getElementById('otsReviewLightbox');
        if (current) return current;

        var modal = document.createElement('div');
        modal.id = 'otsReviewLightbox';
        modal.className = 'ots-review-lightbox';
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Yorum görseli');
        modal.innerHTML = [
            '<div class="ots-review-lightbox-dialog">',
            '  <button type="button" class="ots-review-lightbox-close" aria-label="Kapat">×</button>',
            '  <button type="button" class="ots-review-lightbox-nav ots-review-lightbox-prev" data-dir="-1" aria-label="Önceki görsel">‹</button>',
            '  <button type="button" class="ots-review-lightbox-nav ots-review-lightbox-next" data-dir="1" aria-label="Sonraki görsel">›</button>',
            '  <div class="ots-review-lightbox-media"><img alt=""></div>',
            '  <div class="ots-review-lightbox-caption">',
            '    <div class="ots-review-lightbox-meta"><span class="ots-review-lightbox-author"></span><span class="ots-review-lightbox-rate"></span></div>',
            '    <a class="ots-review-lightbox-product" href="#" target="_blank" rel="noopener"></a>',
            '    <p class="ots-review-lightbox-text"></p>',
            '  </div>',
            '</div>'
        ].join('');

        modal.addEventListener('click', function (event) {
            var close = event.target.closest && event.target.closest('.ots-review-lightbox-close');
            var nav = event.target.closest && event.target.closest('.ots-review-lightbox-nav');

            if (close || event.target === modal) {
                closeLightbox();
                return;
            }

            if (nav) {
                moveLightbox(Number(nav.getAttribute('data-dir')) || 1);
            }
        });

        document.body.appendChild(modal);
        return modal;
    }

    function updateLightbox() {
        var modal = createLightbox();
        var item = state.lightboxItems[state.lightboxIndex];
        if (!item) return;

        var img = qs('.ots-review-lightbox-media img', modal);
        var author = qs('.ots-review-lightbox-author', modal);
        var rate = qs('.ots-review-lightbox-rate', modal);
        var product = qs('.ots-review-lightbox-product', modal);
        var text = qs('.ots-review-lightbox-text', modal);
        var navButtons = qsa('.ots-review-lightbox-nav', modal);

        img.src = item.image;
        img.alt = item.alt || 'Yorum görseli';
        author.textContent = item.author + (item.date ? ' · ' + item.date : '');
        rate.textContent = starText(item.rate);
        text.textContent = item.text;

        if (item.productTitle) {
            product.textContent = item.productTitle;
            product.href = item.productUrl || '#';
            product.style.display = '';
        } else {
            product.style.display = 'none';
        }

        navButtons.forEach(function (button) {
            button.style.display = state.lightboxItems.length > 1 ? '' : 'none';
        });
    }

    function openLightbox(index) {
        if (!state.lightboxItems.length) return;

        state.lightboxIndex = (index + state.lightboxItems.length) % state.lightboxItems.length;
        updateLightbox();

        var modal = createLightbox();
        if (!modal.classList.contains('is-active')) state.lightboxReturnFocus = document.activeElement;
        modal.classList.add('is-active');
        modal.setAttribute('aria-hidden', 'false');
        document.documentElement.style.overflow = 'hidden';

        var closeButton = qs('.ots-review-lightbox-close', modal);
        if (closeButton) closeButton.focus();
    }

    function closeLightbox() {
        var modal = document.getElementById('otsReviewLightbox');
        if (!modal || !modal.classList.contains('is-active')) return;

        modal.classList.remove('is-active');
        modal.setAttribute('aria-hidden', 'true');
        document.documentElement.style.overflow = '';

        var returnFocus = state.lightboxReturnFocus;
        state.lightboxReturnFocus = null;
        if (returnFocus && returnFocus.isConnected && returnFocus.focus) returnFocus.focus();
    }

    function moveLightbox(dir) {
        if (!state.lightboxItems.length) return;
        state.lightboxIndex = (state.lightboxIndex + dir + state.lightboxItems.length) % state.lightboxItems.length;
        updateLightbox();
    }

    function bindLightboxKeyboard() {
        if (document.documentElement.getAttribute('data-ots-review-lightbox-keyboard') === 'true') return;
        document.documentElement.setAttribute('data-ots-review-lightbox-keyboard', 'true');

        document.addEventListener('keydown', function (event) {
            var modal = document.getElementById('otsReviewLightbox');
            if (!modal || !modal.classList.contains('is-active')) return;

            if (event.key === 'Escape') closeLightbox();
            if (event.key === 'ArrowLeft') moveLightbox(-1);
            if (event.key === 'ArrowRight') moveLightbox(1);
        });
    }

    function renderReviews(activeTab) {
        if (!state.root) return;

        stopAutoplay();
        closeLightbox();
        state.lightboxItems = [];
        bindSlider(state.root);
        state.activeTab = activeTab === 'product' ? 'product' : 'store';

        var reviews = state.datasets[state.activeTab] || [];

        if (!reviews.length) {
            qs('.ots-review-wrap', state.root).innerHTML = [
                '<div class="ots-review-tabs" role="tablist" aria-label="Yorum türü">',
                '  <button type="button" class="ots-review-tab' + (state.activeTab === 'store' ? ' is-active' : '') + '" data-review-tab="store" role="tab" aria-selected="' + (state.activeTab === 'store' ? 'true' : 'false') + '">Mağaza yorumları <span>' + state.datasets.store.length + '</span></button>',
                '  <button type="button" class="ots-review-tab' + (state.activeTab === 'product' ? ' is-active' : '') + '" data-review-tab="product" role="tab" aria-selected="' + (state.activeTab === 'product' ? 'true' : 'false') + '">Ürün yorumları <span>' + state.datasets.product.length + '</span></button>',
                '</div>',
                '<div class="ots-review-empty">Şu anda gösterilecek 3 yıldız ve üzeri yorum bulunamadı.</div>'
            ].join('');
            return;
        }

        buildLightboxItems(reviews);
        renderLayout(state.root, reviews, state.activeTab);

        var featuredReviews = reviews.slice(0, Math.min(5, reviews.length));
        var track = qs('.ots-review-featured-track', state.root);
        var dots = qs('.ots-review-dots', state.root);
        var grid = qs('.ots-review-grid', state.root);

        featuredReviews.forEach(function (review, index) {
            track.appendChild(createFeaturedSlide(review, index));

            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'ots-review-dot';
            dot.setAttribute('data-index', String(index));
            dot.setAttribute('aria-label', (index + 1) + '. öne çıkan yorumu göster');
            dots.appendChild(dot);
        });

        reviews.forEach(function (review) {
            grid.appendChild(createReviewCard(review));
        });

        bindSlider(state.root);
        bindFeaturedHover(state.root);
        bindLightboxKeyboard();
        setActive(0);
        startAutoplay();
    }

    function fetchJson(url) {
        return fetch(url, {
            method: 'GET',
            cache: 'no-cache',
            credentials: 'omit',
            signal: state.abortController ? state.abortController.signal : undefined
        }).then(function (response) {
            if (!response.ok) throw new Error('Yorum API isteği başarısız: ' + response.status);
            return response.json();
        });
    }

    function fetchReviews() {
        if (!window.fetch) return Promise.reject(new Error('Fetch desteklenmiyor'));

        if (state.abortController) state.abortController.abort();
        state.abortController = window.AbortController ? new AbortController() : null;

        return fetchJson(API_URL).then(function (data) {
            if (!data || data.schemaVersion !== 1 || !data.store || !data.product ||
                !Array.isArray(data.store.reviews) || !Array.isArray(data.product.reviews)) {
                throw new Error('Yorum JSON biçimi geçersiz');
            }
            state.datasets.store = normalizeReviews(data.store.reviews);
            state.datasets.product = normalizeReviews(data.product.reviews);
            // Gösterilen ortalamalar, görünen sayılarla aynı filtrelenmiş yorumlardan hesaplanır.
            return state.datasets.store.length ? 'store' : 'product';
        });
    }

    function mount() {
        var holder = qs('#mainHolder_divDesign');
        if (!holder || document.getElementById(ROOT_ID)) return false;

        injectStyles();

        var root = createShell();
        holder.insertBefore(root, holder.firstChild);
        hideLegacyReviews();

        state.root = root;

        fetchReviews().then(renderReviews).catch(function () {
            if (!state.root) return;
            qs('.ots-review-wrap', state.root).innerHTML = '<div class="ots-review-empty">Yorumlar şu anda yüklenemedi. Lütfen kısa süre sonra tekrar deneyin.</div>';
        });

        return true;
    }

    function init() {
        if (mount()) return;

        if (state.observer || !document.documentElement) return;

        state.observer = new MutationObserver(function () {
            if (mount() && state.observer) {
                state.observer.disconnect();
                state.observer = null;
            }
        });

        state.observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        window.setTimeout(function () {
            if (state.observer) {
                state.observer.disconnect();
                state.observer = null;
            }
        }, 12000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.otsCustomerReviewsInit = init;
}());
