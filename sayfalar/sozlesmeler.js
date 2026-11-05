/*
 * ÖTS İÇ GİYİM - SÖZLEŞMELER SAYFASI
 *
 * Yükleme adresi : https://ornekler.com.tr/js/ots/sayfalar/sozlesmeler.js
 * Çalıştığı yer  : Sözleşme sayfaları (UyelikSozlesme.aspx)
 *
 * Yalnızca bu sayfada çalışan arayüz modülüdür.
 *
 * Bölümler:
 *  1. Sözleşme gezintisi ve içerik yükleme
 */

/* ========================================================================
 * BÖLÜM 1: SÖZLEŞME GEZİNTİSİ VE İÇERİK YÜKLEME
 *
 * Mevcut sözleşme içeriğini korur; sekmeler arasında geçişte yalnızca
 * gereken belgeyi getirir, istekleri iptal eder ve tarayıcı geçmişini günceller.
 * ====================================================================== */
(function () {
    'use strict';

    var DOCUMENTS = [
        { id: '1', short: 'Üyelik Sözleşmesi', title: 'Üyelik Sözleşmesi', url: '/UyelikSozlesme.aspx?sozlemeTipi=1', local: 'uyelik-sozlesmesi.html', selector: '.uyelik-sozlesmesi' },
        { id: '2', short: 'Kargo & Teslimat', title: 'Kargo ve Teslimat', url: '/UyelikSozlesme.aspx?sozlemeTipi=2', local: 'kargo-teslimat.html', selector: '.kargo-teslimat' },
        { id: '3', short: 'Mesafeli Satış Sözleşmesi', title: 'Mesafeli Satış Sözleşmesi', url: '/UyelikSozlesme.aspx?sozlemeTipi=3', local: 'mesafeli-satis.html', selector: '.sozlesme' },
        { id: '4', short: 'İade & İptal', title: 'İade ve Değişim Koşulları', url: '/UyelikSozlesme.aspx?sozlemeTipi=4', local: 'iade-degisisim.html', selector: '.iade-politikasi' },
        { id: '5', short: 'KVKK', title: 'KVKK Politikası', url: '/UyelikSozlesme.aspx?sozlemeTipi=5', local: 'kvkk.html', selector: '.kvkk-politikasi' }
    ];

    function initLegalCenter() {
        if (document.getElementById('otsLegalShell')) return;

        var params = new URLSearchParams(window.location.search);
        var currentId = params.get('sozlemeTipi') || detectCurrentId();
        var currentDocument = findDocument(currentId) || DOCUMENTS[0];
        var source = document.querySelector(currentDocument.selector);
        if (!source) {
            // Sayfadaki içerik başka bir belgeye aitse önbelleğe doğru kimlikle alınır.
            source = findAnySource();
            if (!source) return;
            currentDocument = findDocument(detectCurrentId()) || currentDocument;
        }

        if (!document.querySelector('link[data-ots-account-fonts]')) {
            var fontLink = document.createElement('link');
            fontLink.rel = 'stylesheet';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800;900&display=swap';
            fontLink.setAttribute('data-ots-account-fonts', 'true');
            document.head.appendChild(fontLink);
        }

        var style = document.createElement('style');
        style.id = 'otsLegalStyles';
        style.textContent = `
            :root {
                --ots-legal-ink: #11110f;
                --ots-legal-muted: #706e68;
                --ots-legal-paper: #f3f2ee;
                --ots-legal-line: #d9d7d0;
                --ots-legal-white: #fff;
            }
            body.ots-legal-page { margin: 0 !important; color: var(--ots-legal-ink); background: var(--ots-legal-paper) !important; font-family: 'DM Sans', sans-serif; }
            body.ots-legal-page > form { margin: 0; }
            body.ots-legal-page .aspNetHidden { display: none !important; }
            #otsLegalShell, #otsLegalShell * { box-sizing: border-box; }
            #otsLegalShell {
                position: relative;
                isolation: isolate;
                min-height: 100vh;
                padding: 64px 24px 80px;
                overflow: hidden;
                background:
                    radial-gradient(circle at 14% 16%, rgba(0,0,0,.04) 0 1px, transparent 1.4px) 0 0 / 18px 18px,
                    var(--ots-legal-paper);
            }
            #otsLegalShell::before {
                content: '';
                position: absolute;
                z-index: -1;
                width: 520px;
                height: 520px;
                top: -280px;
                right: -270px;
                border: 1px solid rgba(17,17,15,.12);
                border-radius: 50%;
                box-shadow: 0 0 0 75px rgba(17,17,15,.024), 0 0 0 150px rgba(17,17,15,.014);
            }
            .ots-legal-wrap { width: min(1220px, 100%); margin: 0 auto; }
            .ots-legal-brand { display: inline-flex; width: 118px; margin: 4px 12px 28px; }
            .ots-legal-brand img { display: block; width: 100%; height: auto; filter: brightness(0) invert(1); }
            .ots-legal-hero { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 28px; margin-bottom: 32px; }
            .ots-legal-kicker { display: flex; align-items: center; gap: 11px; margin-bottom: 13px; color: var(--ots-legal-muted); font-size: 10px; font-weight: 600; letter-spacing: .17em; text-transform: uppercase; }
            .ots-legal-kicker::before { content: ''; width: 30px; height: 1px; background: currentColor; }
            .ots-legal-hero h1 { max-width: 780px; margin: 0; color: var(--ots-legal-ink); font: 600 clamp(36px, 5.2vw, 66px)/1.02 'Manrope', sans-serif; letter-spacing: -.055em; }
            .ots-legal-meta { max-width: 270px; margin: 0 0 7px; color: var(--ots-legal-muted); font-size: 11px; line-height: 1.65; text-align: right; }

            .ots-legal-card { display: grid; grid-template-columns: 270px minmax(0, 1fr); overflow: visible; border: 1px solid rgba(17,17,15,.12); border-radius: 24px; background: var(--ots-legal-white); box-shadow: 0 28px 80px rgba(23,22,19,.09); }
            .ots-legal-nav { position: relative; padding: 24px 16px; border-right: 1px solid var(--ots-legal-line); border-radius: 24px 0 0 24px; background: #0c154c; }
            .ots-legal-nav-inner { position: sticky; top: 24px; }
            .ots-legal-nav-title { display: block; margin: 5px 12px 18px; color: rgba(255,255,255,.4); font-size: 9px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; }
            .ots-legal-tabs { display: grid; gap: 5px; }
            .ots-legal-tab {
                position: relative;
                display: grid;
                grid-template-columns: 27px minmax(0, 1fr);
                align-items: center;
                gap: 10px;
                width: 100%;
                min-height: 52px;
                padding: 9px 12px;
                color: rgba(255,255,255,.58);
                font: 500 11px/1.35 'DM Sans', sans-serif;
                text-align: left;
                cursor: pointer;
                border: 1px solid transparent;
                border-radius: 11px;
                background: transparent;
                transition: color .2s, background .2s, border-color .2s;
            }
            .ots-legal-tab:hover { color: #fff; background: rgba(255,255,255,.06); }
            .ots-legal-tab[aria-selected='true'] { color: #171715; border-color: #fff; background: #fff; }
            .ots-tab-number { display: grid; place-items: center; width: 27px; height: 27px; color: inherit; font-size: 9px; border: 1px solid currentColor; border-radius: 50%; opacity: .75; }
            .ots-legal-help { margin: 28px 12px 5px; padding-top: 20px; color: rgba(255,255,255,.43); font-size: 9px; line-height: 1.6; border-top: 1px solid rgba(255,255,255,.12); }
            .ots-legal-help a { display: inline-block; margin-top: 7px; color: #fff; font-weight: 600; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,.5); }

            .ots-legal-main { min-width: 0; padding: clamp(30px, 5vw, 68px); }
            .ots-legal-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 28px; padding-bottom: 18px; border-bottom: 1px solid var(--ots-legal-line); }
            .ots-legal-current { color: var(--ots-legal-muted); font-size: 10px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; }
            .ots-legal-print { display: inline-flex; align-items: center; gap: 7px; padding: 8px 11px; color: #55534e; font: 600 10px 'DM Sans', sans-serif; cursor: pointer; border: 1px solid var(--ots-legal-line); border-radius: 9px; background: #fff; }
            .ots-legal-print:hover { border-color: #aaa89f; background: #f8f7f4; }

            .ots-legal-content { position: relative; min-height: 420px; color: #45443f; font-size: 14px; line-height: 1.82; animation: otsLegalContentIn .35s ease both; }
            .ots-legal-content > h2:first-child { display: none !important; }
            .ots-legal-content h2, .ots-legal-content h3, .ots-legal-content h4 { color: var(--ots-legal-ink); font-family: 'Manrope', sans-serif; }
            .ots-legal-content h2 { margin: 0 0 28px !important; font-size: 28px; line-height: 1.2; letter-spacing: -.035em; }
            .ots-legal-content h3 { margin: 38px 0 13px !important; padding-top: 2px; font-size: 17px; line-height: 1.35; letter-spacing: -.018em; }
            .ots-legal-content h4 { margin: 26px 0 10px !important; font-size: 14px; }
            .ots-legal-content p { margin: 0 0 16px !important; color: #55534e; }
            .ots-legal-content p > strong:only-child { display: block; margin-top: 34px; color: var(--ots-legal-ink); font: 600 16px/1.45 'Manrope', sans-serif; letter-spacing: -.015em; }
            .ots-legal-content ul, .ots-legal-content ol { margin: 8px 0 22px !important; padding-left: 0 !important; list-style: none; counter-reset: legal-list; }
            .ots-legal-content li { position: relative; margin: 8px 0; padding: 11px 14px 11px 38px; color: #55534e; border: 1px solid #e4e2dc; border-radius: 10px; background: #fafaf8; }
            .ots-legal-content ul > li::before { content: '✓'; position: absolute; top: 11px; left: 14px; color: #426651; font-weight: 600; }
            .ots-legal-content ol > li { counter-increment: legal-list; }
            .ots-legal-content ol > li::before { content: counter(legal-list, decimal-leading-zero); position: absolute; top: 11px; left: 11px; color: #8d8a83; font-size: 9px; font-weight: 600; }
            .ots-legal-content a { color: var(--ots-legal-ink); font-weight: 600; text-decoration-thickness: 1px; text-underline-offset: 3px; }
            .ots-legal-content table { display: block; width: 100% !important; max-width: 100%; margin: 22px 0; overflow-x: auto; border-collapse: collapse; -webkit-overflow-scrolling: touch; }
            .ots-legal-content td, .ots-legal-content th { min-width: 150px; padding: 12px !important; border: 1px solid var(--ots-legal-line) !important; }
            .ots-legal-content th { color: var(--ots-legal-ink); background: #f3f2ee; }
            .ots-legal-content strong { color: #282723; }

            .ots-legal-loading { min-height: 460px; overflow: hidden; }
            .ots-legal-loading::before { content: ''; display: block; width: 58%; height: 28px; margin-bottom: 30px; border-radius: 6px; background: #ebe9e3; }
            .ots-legal-loading::after { content: ''; display: block; width: 100%; height: 330px; border-radius: 10px; background: repeating-linear-gradient(to bottom, #f1f0ec 0 13px, transparent 13px 29px); animation: otsLegalPulse 1.1s ease-in-out infinite alternate; }
            .ots-legal-error { padding: 35px; color: #7e2925; text-align: center; border: 1px solid #e6c9c6; border-radius: 13px; background: #fff7f6; }
            .ots-legal-error a { display: inline-block; margin-top: 13px; padding: 9px 13px; color: #fff; text-decoration: none; border-radius: 8px; background: #171715; }

            .ots-reading-progress { position: fixed; z-index: 30; top: 0; left: 0; width: 0; height: 3px; background: #171715; transition: width .1s linear; }
            .ots-back-top { position: fixed; z-index: 25; right: 22px; bottom: 22px; display: grid; place-items: center; width: 42px; height: 42px; color: #fff; font-size: 17px; cursor: pointer; border: 0; border-radius: 50%; background: #171715; box-shadow: 0 10px 28px rgba(17,17,15,.2); opacity: 0; pointer-events: none; transform: translateY(8px); transition: opacity .2s, transform .2s; }
            .ots-back-top.is-visible { opacity: 1; pointer-events: auto; transform: none; }

            @keyframes otsLegalContentIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
            @keyframes otsLegalPulse { from { opacity: .5; } to { opacity: 1; } }
            @media (max-width: 860px) {
                #otsLegalShell { padding: 34px 16px 60px; }
                .ots-legal-hero { grid-template-columns: 1fr; gap: 12px; margin-bottom: 23px; }
                .ots-legal-meta { max-width: 520px; margin: 0; text-align: left; }
                .ots-legal-card { grid-template-columns: 1fr; overflow: hidden; border-radius: 20px; }
                .ots-legal-nav { padding: 12px; overflow: hidden; border-right: 0; border-bottom: 1px solid var(--ots-legal-line); border-radius: 0; }
                .ots-legal-nav-inner { position: static; }
                .ots-legal-brand { width: 92px; margin: 2px 2px 14px; }
                .ots-legal-nav-title, .ots-legal-help { display: none; }
                .ots-legal-tabs { display: flex; gap: 7px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; scroll-snap-type: x proximity; }
                .ots-legal-tabs::-webkit-scrollbar { display: none; }
                .ots-legal-tab { flex: 0 0 auto; width: auto; min-height: 43px; grid-template-columns: 22px auto; padding: 7px 11px; white-space: nowrap; scroll-snap-align: start; }
                .ots-tab-number { width: 22px; height: 22px; }
                .ots-legal-main { padding: 34px; }
            }
            @media (max-width: 520px) {
                #otsLegalShell { padding: 24px 10px 54px; }
                .ots-legal-hero { padding: 0 9px; }
                .ots-legal-hero h1 { font-size: 35px; }
                .ots-legal-main { padding: 27px 20px 34px; }
                .ots-legal-toolbar { align-items: flex-start; }
                .ots-legal-print { width: 34px; height: 34px; justify-content: center; padding: 0; font-size: 0; }
                .ots-legal-print::before { content: '↗'; font-size: 14px; }
                .ots-legal-content { font-size: 13px; line-height: 1.75; }
                .ots-legal-content h3 { margin-top: 31px !important; font-size: 16px; }
                .ots-legal-content li { padding: 10px 11px 10px 34px; }
                .ots-back-top { right: 14px; bottom: 14px; }
            }
            @media print {
                body.ots-legal-page { background: #fff !important; }
                #otsLegalShell { padding: 0; background: #fff !important; }
                .ots-legal-hero, .ots-legal-nav, .ots-legal-toolbar, .ots-reading-progress, .ots-back-top { display: none !important; }
                .ots-legal-card { display: block; border: 0; box-shadow: none; }
                .ots-legal-main { padding: 0; }
                .ots-legal-content { font-size: 11pt; }
            }
            @media (prefers-reduced-motion: reduce) { #otsLegalShell * { animation: none !important; transition-duration: .01ms !important; scroll-behavior: auto !important; } }
        `;
        document.head.appendChild(style);
        document.body.classList.add('ots-legal-page');

        var shell = document.createElement('main');
        shell.id = 'otsLegalShell';
        shell.innerHTML = `
            <div class="ots-reading-progress" aria-hidden="true"></div>
            <div class="ots-legal-wrap">
                <header class="ots-legal-hero">
                    <div><span class="ots-legal-kicker">ÖTS / Bilgi merkezi</span><h1 id="otsLegalTitle"></h1></div>
                    <p class="ots-legal-meta">Hakların, koşullar ve süreçler hakkında aradığın tüm resmi bilgiler tek bir yerde.</p>
                </header>
                <div class="ots-legal-card">
                    <aside class="ots-legal-nav" aria-label="Sözleşmeler menüsü">
                        <div class="ots-legal-nav-inner"><a class="ots-legal-brand" href="/" aria-label="ÖTS ana sayfa"><img src="https://static.ticimax.cloud/30662/uploads/editoruploads/logo/logo.svg" alt="ÖTS İç Giyim"></a><span class="ots-legal-nav-title">Belgeler</span><div class="ots-legal-tabs" role="tablist"></div><p class="ots-legal-help">Soruların için müşteri deneyimi ekibimize ulaşabilirsin.<br><a href="/Iletisim">Bize ulaşın</a></p></div>
                    </aside>
                    <section class="ots-legal-main">
                        <div class="ots-legal-toolbar"><span class="ots-legal-current"></span><button class="ots-legal-print" type="button">Yazdır / PDF</button></div>
                        <article class="ots-legal-content" role="tabpanel" aria-live="polite"></article>
                    </section>
                </div>
            </div>
            <button class="ots-back-top" type="button" aria-label="Sayfanın başına dön">↑</button>`;

        source.parentNode.insertBefore(shell, source);
        var content = shell.querySelector('.ots-legal-content');
        var tabs = shell.querySelector('.ots-legal-tabs');
        var title = shell.querySelector('#otsLegalTitle');
        var currentLabel = shell.querySelector('.ots-legal-current');
        var cache = new Map();
        var activeRequest = null;

        cache.set(currentDocument.id, cleanContent(source));
        source.remove();

        DOCUMENTS.forEach(function (item, index) {
            var tab = document.createElement('button');
            tab.type = 'button';
            tab.className = 'ots-legal-tab';
            tab.setAttribute('role', 'tab');
            tab.dataset.id = item.id;
            tab.innerHTML = '<span class="ots-tab-number">0' + (index + 1) + '</span><span>' + item.short + '</span>';
            tab.addEventListener('click', function () { loadDocument(item, true); });
            tabs.appendChild(tab);
        });

        // Yalnızca aktif sekme Tab ile odaklandığı için diğer belgelere ok tuşlarıyla geçilir.
        tabs.addEventListener('keydown', function (event) {
            var keys = { ArrowLeft: -1, ArrowRight: 1, Home: 'first', End: 'last' };
            if (!(event.key in keys)) return;
            var index = DOCUMENTS.indexOf(currentDocument);
            var step = keys[event.key];
            if (step === 'first') index = 0;
            else if (step === 'last') index = DOCUMENTS.length - 1;
            else index = (index + step + DOCUMENTS.length) % DOCUMENTS.length;
            event.preventDefault();
            loadDocument(DOCUMENTS[index], true);
            var target = tabs.querySelector('.ots-legal-tab[data-id="' + DOCUMENTS[index].id + '"]');
            if (target) target.focus();
        });

        shell.querySelector('.ots-legal-print').addEventListener('click', function () { window.print(); });
        shell.querySelector('.ots-back-top').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

        function setActive(item) {
            currentDocument = item;
            title.textContent = item.title;
            currentLabel.textContent = 'Belge 0' + item.id + ' / 05';
            document.title = item.title + ' | ÖTS İç Giyim';
            tabs.querySelectorAll('.ots-legal-tab').forEach(function (tab) {
                var active = tab.dataset.id === item.id;
                tab.setAttribute('aria-selected', String(active));
                tab.tabIndex = active ? 0 : -1;
                if (active) tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            });
        }

        function render(item, html) {
            setActive(item);
            content.className = 'ots-legal-content';
            content.innerHTML = html;
            content.setAttribute('aria-label', item.title);
            decorateContent(content);
            var cardTop = shell.querySelector('.ots-legal-card').getBoundingClientRect().top + window.scrollY - 18;
            if (window.scrollY > cardTop + 140) window.scrollTo({ top: cardTop, behavior: 'smooth' });
        }

        function loadDocument(item, pushHistory) {
            if (item.id === currentDocument.id && content.innerHTML && !content.querySelector('.ots-legal-error')) return;
            if (activeRequest) activeRequest.abort();
            setActive(item);
            if (cache.has(item.id)) {
                render(item, cache.get(item.id));
                if (pushHistory) window.history.pushState({ legalId: item.id }, '', getNavigationUrl(item));
                return;
            }

            content.className = 'ots-legal-content ots-legal-loading';
            content.innerHTML = '';
            activeRequest = new AbortController();
            fetch(getRequestUrl(item), { headers: { 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'same-origin', signal: activeRequest.signal })
                .then(function (response) {
                    if (!response.ok) throw new Error('HTTP ' + response.status);
                    return response.text();
                })
                .then(function (html) {
                    var page = new DOMParser().parseFromString(html, 'text/html');
                    var remoteContent = page.querySelector(item.selector);
                    if (!remoteContent) throw new Error('İçerik bulunamadı');
                    var cleaned = cleanContent(remoteContent);
                    cache.set(item.id, cleaned);
                    render(item, cleaned);
                    if (pushHistory) window.history.pushState({ legalId: item.id }, '', getNavigationUrl(item));
                })
                .catch(function (error) {
                    if (error.name === 'AbortError') return;
                    content.className = 'ots-legal-content';
                    content.innerHTML = '<div class="ots-legal-error">İçerik şu anda yüklenemedi.<br><a href="' + getNavigationUrl(item) + '">Sayfayı doğrudan aç</a></div>';
                });
        }

        function updateProgress() {
            var rect = content.getBoundingClientRect();
            var scrollable = Math.max(content.offsetHeight - window.innerHeight * .55, 1);
            var passed = Math.min(Math.max(-rect.top + window.innerHeight * .18, 0), scrollable);
            shell.querySelector('.ots-reading-progress').style.width = (passed / scrollable * 100) + '%';
            shell.querySelector('.ots-back-top').classList.toggle('is-visible', window.scrollY > 500);
        }

        window.addEventListener('scroll', updateProgress, { passive: true });
        window.addEventListener('popstate', function (event) {
            var id = event.state && event.state.legalId;
            if (!id) id = new URLSearchParams(window.location.search).get('sozlemeTipi');
            if (!id && isLocalPreview()) {
                var localDocument = DOCUMENTS.find(function (item) { return window.location.pathname.endsWith(item.local); });
                id = localDocument && localDocument.id;
            }
            if (!id) id = '1';
            loadDocument(findDocument(id) || DOCUMENTS[0], false);
        });

        render(currentDocument, cache.get(currentDocument.id));
        // İlk geçmiş kaydı da belge kimliği taşır; Geri tuşu doğru belgeye döner.
        window.history.replaceState({ legalId: currentDocument.id }, '', window.location.href);
        updateProgress();
    }

    function cleanContent(element) {
        var clone = element.cloneNode(true);
        clone.querySelectorAll('script, style, form, input, button, .aspNetHidden').forEach(function (node) { node.remove(); });
        clone.removeAttribute('style');
        return clone.innerHTML;
    }

    function decorateContent(container) {
        var headingIndex = 0;
        container.querySelectorAll('h2, h3, h4, p > strong:only-child').forEach(function (heading) {
            headingIndex += 1;
            if (!heading.id) heading.id = 'bolum-' + headingIndex;
        });
        container.querySelectorAll('[style]').forEach(function (element) {
            element.removeAttribute('style');
        });
    }

    function detectCurrentId() {
        for (var i = 0; i < DOCUMENTS.length; i += 1) {
            if (document.querySelector(DOCUMENTS[i].selector)) return DOCUMENTS[i].id;
        }
        return '1';
    }

    function findAnySource() {
        for (var i = 0; i < DOCUMENTS.length; i += 1) {
            var source = document.querySelector(DOCUMENTS[i].selector);
            if (source) return source;
        }
        return null;
    }

    function findDocument(id) {
        return DOCUMENTS.find(function (item) { return item.id === String(id); });
    }

    function isLocalPreview() {
        return window.location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
    }

    function getRequestUrl(item) {
        return isLocalPreview() ? item.local : item.url;
    }

    function getNavigationUrl(item) {
        return isLocalPreview() ? item.local : item.url;
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLegalCenter);
    else initLegalCenter();
}());
