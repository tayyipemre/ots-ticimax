/*
 * ÖTS İÇ GİYİM - TÜM SAYFALAR ORTAK MODÜLLERİ
 *
 * Yükleme adresi : https://ornekler.com.tr/js/ots/tumsayfalar.js
 * Çalıştığı yer  : Sitenin tüm sayfaları
 *
 * Header, footer, arama, açılır menüler ve ürün kartı iyileştirmeleri gibi her
 * sayfada ortak kullanılan arayüz modüllerini tek dosyada toplar.
 * Her bölüm kendi kapsamında (IIFE) bağımsız çalışır.
 *
 * Bölümler:
 *   1. Header misafir üye menüsü
 *   2. Checkout sepet modülü yükleyicisi
 *   3. Genel footer
 *   4. Sipariş takip sayfası
 *   5. Hesabım sayfası
 *   6. Kampanya üst bilgi bandı
 *   7. Arama modalı ve canlı sonuçlar
 *   8. WhatsApp iletişim butonu
 *   9. Yapay zekâ görsel bilgisi
 *  10. Sayfa başına dön butonu
 *  11. Açılır sepet menüsü
 *  12. Açılır üye hesabı menüsü
 *  13. Ana sayfa ürün vitrini
 *  14. Kategori kartı ücretsiz kargo rozeti
 *  15. Ana sayfa vitrin sepet ve varyant arayüzü
 *  16. Sol tarafta sabit üyelik daveti
 *  17. Üstü çizili indirimli fiyat ve birim fiyat gösterimi
 *  18. Sabit (sticky) header
 *  19. Tükendi etiketi
 *  20. Ana sayfa bannerları tam genişlik
 */

/* ========================================================================
 * BÖLÜM 1: HEADER MİSAFİR ÜYE MENÜSÜ
 *
 * Ticimax'ın boş/sonradan doldurulan #divMemberPanel alanının header akışını
 * büyütmesini engeller. Misafir seçeneklerini kullanıcı ikonundan açılan,
 * sayfa yerleşiminden bağımsız bir panelde gösterir.
 * ====================================================================== */
(function () {
    'use strict';

    if (window.__otsGuestHeaderV2) return;
    window.__otsGuestHeaderV2 = true;

    var MENU_ID = 'otsHeaderGuestMenu';
    var STYLE_ID = 'otsHeaderGuestMenuStyle';
    var OPEN_CLASS = 'ots-header-guest-open';
    var triggerElement = null;

    function isLoggedIn() {
        var panel = document.getElementById('divMemberPanel');
        return !!(
            (window.globalModel && window.globalModel.isAuthenticated === true) ||
            (window.siteSettings && window.siteSettings.isAuthenticated === true) ||
            (panel && panel.querySelector('.useLogin, .useName, .cikisbtn, [href*="UyeCikis"]'))
        );
    }

    function addStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            body:not(.ots-member-authenticated) #divMemberPanel {
                display: flex !important;
                align-items: center !important;
                width: auto !important;
                height: 38px !important;
                min-width: 0 !important;
                min-height: 38px !important;
                max-height: 38px !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            body:not(.ots-member-authenticated) #divMemberPanel > #divMemberWelcomeContent {
                display: block !important;
                width: auto !important;
                height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                position: static !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            body:not(.ots-member-authenticated) #divMemberWelcomeContent > ul {
                display: flex !important;
                align-items: center !important;
                gap: 4px !important;
                width: auto !important;
                height: 34px !important;
                min-height: 34px !important;
                max-height: 34px !important;
                margin: 0 !important;
                padding: 0 !important;
                list-style: none !important;
                position: static !important;
                background: transparent !important;
                box-shadow: none !important;
            }
            body:not(.ots-member-authenticated) #divMemberWelcomeContent > ul > li.headerUyeGiris,
            body:not(.ots-member-authenticated) #divMemberWelcomeContent > ul > li.headerUyeOl {
                display: block !important;
                float: none !important;
                width: auto !important;
                height: 34px !important;
                min-height: 34px !important;
                max-height: 34px !important;
                margin: 0 !important;
                padding: 0 !important;
                border: 0 !important;
                background: transparent !important;
            }
            body:not(.ots-member-authenticated) #divMemberWelcomeContent .headerUyeGiris > a,
            body:not(.ots-member-authenticated) #divMemberWelcomeContent .headerUyeOl > a {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 5px !important;
                height: 34px !important;
                min-height: 34px !important;
                max-height: 34px !important;
                width: auto !important;
                margin: 0 !important;
                padding: 0 8px !important;
                color: #0c154c !important;
                font-family: inherit !important;
                font-size: 11px !important;
                font-weight: 600 !important;
                line-height: 1.2 !important;
                text-align: center !important;
                text-indent: 0 !important;
                white-space: nowrap !important;
                border: 0 !important;
                border-radius: 7px !important;
                background: transparent !important;
                box-shadow: none !important;
                text-decoration: none !important;
            }
            body:not(.ots-member-authenticated) #divMemberWelcomeContent .headerUyeGiris > a::before,
            body:not(.ots-member-authenticated) #divMemberWelcomeContent .headerUyeGiris > a::after,
            body:not(.ots-member-authenticated) #divMemberWelcomeContent .headerUyeOl > a::before,
            body:not(.ots-member-authenticated) #divMemberWelcomeContent .headerUyeOl > a::after {
                content: none !important;
                display: none !important;
            }
            body:not(.ots-member-authenticated) #divMemberWelcomeContent .ots-native-member-icon {
                display: inline-flex !important;
                flex: 0 0 17px !important;
                align-items: center !important;
                justify-content: center !important;
                width: 17px !important;
                height: 17px !important;
                margin: 0 !important;
                padding: 0 !important;
                color: currentColor !important;
            }
            body:not(.ots-member-authenticated) #divMemberWelcomeContent .ots-native-member-icon svg {
                display: block !important;
                width: 17px !important;
                height: 17px !important;
            }
            body:not(.ots-member-authenticated) #divMemberWelcomeContent .headerUyeGiris > a:hover,
            body:not(.ots-member-authenticated) #divMemberWelcomeContent .headerUyeOl > a:hover {
                color: #263a80 !important;
                background: #f1f3f8 !important;
            }
            body:not(.ots-member-authenticated) #divMemberWelcomeContent .headerSocialConnect {
                display: none !important;
            }
            #${MENU_ID}, #${MENU_ID} * { box-sizing: border-box !important; }
            #${MENU_ID} {
                position: fixed !important;
                z-index: 2147483000 !important;
                top: var(--ots-menu-top, 76px) !important;
                left: var(--ots-menu-left, 12px) !important;
                display: none !important;
                width: min(340px, calc(100vw - 24px)) !important;
                max-height: calc(100dvh - var(--ots-menu-top, 76px) - 12px) !important;
                margin: 0 !important;
                padding: 10px !important;
                overflow: auto !important;
                border: 1px solid #e1e5ee !important;
                border-radius: 16px !important;
                background: #fff !important;
                box-shadow: 0 20px 55px rgba(12,21,76,.2) !important;
                font-family: inherit !important;
                text-align: left !important;
            }
            #${MENU_ID}.${OPEN_CLASS} { display: block !important; }
            #${MENU_ID} .ots-header-member-action {
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                width: 100% !important;
                min-height: 52px !important;
                margin: 0 0 7px !important;
                padding: 10px 12px !important;
                color: #111a43 !important;
                font: inherit !important;
                font-size: 13px !important;
                font-weight: 700 !important;
                line-height: 1.25 !important;
                text-align: left !important;
                text-decoration: none !important;
                border: 1px solid #e4e8f0 !important;
                border-radius: 11px !important;
                background: #f7f8fb !important;
                cursor: pointer !important;
                appearance: none !important;
            }
            #${MENU_ID} .ots-header-member-action:last-child { margin-bottom: 0 !important; }
            #${MENU_ID} .ots-header-member-action:hover,
            #${MENU_ID} .ots-header-member-action:focus-visible {
                border-color: #bcc5da !important;
                background: #eef2f8 !important;
                outline: none !important;
            }
            #${MENU_ID} .ots-header-member-icon {
                display: inline-flex !important;
                flex: 0 0 34px !important;
                align-items: center !important;
                justify-content: center !important;
                width: 34px !important;
                height: 34px !important;
                color: #fff !important;
                font-size: 15px !important;
                font-weight: 800 !important;
                border-radius: 9px !important;
                background: #0c154c !important;
            }
            #${MENU_ID} .ots-header-socials {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 7px !important;
                margin-top: 9px !important;
                padding-top: 9px !important;
                border-top: 1px solid #edf0f5 !important;
            }
            #${MENU_ID} .ots-header-socials .ots-header-member-action {
                justify-content: center !important;
                min-height: 42px !important;
                margin: 0 !important;
                padding: 9px !important;
                font-size: 11px !important;
                background: #fff !important;
            }
            #${MENU_ID} .ots-header-socials .ots-header-member-icon {
                flex-basis: 24px !important;
                width: 28px !important;
                height: 28px !important;
                border: 0 !important;
                border-radius: 0 !important;
                background: transparent !important;
            }
            #${MENU_ID} .ots-header-socials .ots-header-member-icon svg {
                display: block !important;
                width: 28px !important;
                height: 28px !important;
            }
            @media (max-width: 420px) {
                #${MENU_ID} { width: calc(100vw - 20px) !important; }
                #${MENU_ID} .ots-header-socials { grid-template-columns: 1fr !important; }
            }
            @media (max-width: 767px) {
                body:not(.ots-member-authenticated) #divMemberPanel {
                    display: none !important;
                    width: 0 !important;
                    height: 0 !important;
                    min-width: 0 !important;
                    min-height: 0 !important;
                    overflow: hidden !important;
                    pointer-events: none !important;
                }
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    function createMenu() {
        var existing = document.getElementById(MENU_ID);
        if (existing) return existing;
        var menu = document.createElement('div');
        menu.id = MENU_ID;
        menu.setAttribute('role', 'dialog');
        menu.setAttribute('aria-label', 'Üyelik işlemleri');
        menu.setAttribute('aria-hidden', 'true');
        menu.innerHTML = `
            <button type="button" class="ots-header-member-action" data-ots-member-action="login"><span class="ots-header-member-icon" aria-hidden="true">↪</span><span>Üye Girişi</span></button>
            <button type="button" class="ots-header-member-action" data-ots-member-action="register"><span class="ots-header-member-icon" aria-hidden="true">+</span><span>Üye Kaydı</span></button>
            <div class="ots-header-socials">
                <button type="button" class="ots-header-member-action" data-ots-member-action="google"><span class="ots-header-member-icon" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><g opacity="0.8"><path d="M24.6678 14.2369C24.6678 13.3599 24.5952 12.7199 24.438 12.0562H14.2188V16.0147H20.2173C20.0964 16.9984 19.4432 18.4799 17.992 19.4754L17.9716 19.608L21.2028 22.061L21.4266 22.0829C23.4826 20.2222 24.6678 17.4843 24.6678 14.2369Z" fill="#4285F4"/><path d="M14.2176 24.667C17.1563 24.667 19.6234 23.7188 21.4255 22.0832L17.9908 19.4758C17.0717 20.1039 15.8381 20.5424 14.2176 20.5424C11.3393 20.5424 8.89634 18.6817 8.0255 16.1099L7.89786 16.1205L4.53808 18.6687L4.49414 18.7884C6.28401 22.2728 9.96054 24.667 14.2176 24.667Z" fill="#34A853"/><path d="M8.02633 16.11C7.79655 15.4463 7.66357 14.7351 7.66357 14.0003C7.66357 13.2654 7.79655 12.5543 8.01424 11.8906L8.00815 11.7492L4.60626 9.16016L4.49496 9.21204C3.75727 10.658 3.33398 12.2817 3.33398 14.0003C3.33398 15.7188 3.75727 17.3425 4.49496 18.7884L8.02633 16.11Z" fill="#FBBC05"/><path d="M14.2176 7.45795C16.2615 7.45795 17.6401 8.32313 18.4263 9.04615L21.4981 6.10685C19.6115 4.38832 17.1564 3.3335 14.2176 3.3335C9.96053 3.3335 6.28401 5.72757 4.49414 9.21201L8.01343 11.8906C8.89637 9.31872 11.3393 7.45795 14.2176 7.45795Z" fill="#EB4335"/></g></svg></span><span>Google ile bağlan</span></button>
                <button type="button" class="ots-header-member-action" data-ots-member-action="facebook"><span class="ots-header-member-icon" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M24.6673 14.0653C24.6673 11.2191 23.544 8.48939 21.5446 6.47678C19.5451 4.46417 16.8333 3.3335 14.0056 3.3335C11.3209 3.33101 8.73405 4.3481 6.76184 6.18163C4.78963 8.01516 3.57723 10.5301 3.3668 13.2242C3.15638 15.9182 3.96343 18.593 5.62675 20.7142C7.29007 22.8355 9.6872 24.247 12.3393 24.6668V17.1668H9.63427V14.0653H12.3408V11.7013C12.3408 9.01217 13.9325 7.52504 16.3679 7.52504C17.5346 7.52504 18.7546 7.73508 18.7546 7.73508V10.3766H17.4097C16.0846 10.3766 15.6734 11.2045 15.6734 12.0523V14.0653H18.6297L18.1576 17.1668H15.6719V24.6668C18.1797 24.2671 20.4635 22.9797 22.1124 21.0363C23.7614 19.093 24.6674 16.6211 24.6673 14.0653Z" fill="#1877F2"/></svg></span><span>Facebook ile bağlan</span></button>
            </div>`;
        document.body.appendChild(menu);
        return menu;
    }

    function decorateNativeMemberLinks() {
        var login = document.querySelector('#divMemberPanel .headerUyeGiris > a');
        var register = document.querySelector('#divMemberPanel .headerUyeOl > a');
        if (login && !login.querySelector('.ots-native-member-icon')) {
            login.insertAdjacentHTML('afterbegin', '<span class="ots-native-member-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M14 8.5 17.5 12 14 15.5M17 12H7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 5H6.8A2.8 2.8 0 0 0 4 7.8v8.4A2.8 2.8 0 0 0 6.8 19H11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>');
        }
        if (register && !register.querySelector('.ots-native-member-icon')) {
            register.insertAdjacentHTML('afterbegin', '<span class="ots-native-member-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3.5" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 20c.4-4 2.2-6 5.5-6 1.2 0 2.2.2 3 .7M17.5 12v7M14 15.5h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span>');
        }
    }

    function findTrigger(target) {
        if (!target || !target.closest) return null;
        if (target.closest('#divMemberPanel .headerUyeGiris a, #divMemberPanel .headerUyeOl a')) return null;
        var direct = target.closest('#divMemberPanel, a.headerHesabim, button.headerHesabim, .headerHesabim a, .headerHesabim button');
        if (direct) return direct;
        var icon = target.closest('i.fa-user, .fa-user, [class*="icon-user"], [class*="userIcon"]');
        if (!icon || !icon.closest('#header, header, .headerContent')) return null;
        return icon.closest('a, button') || icon;
    }

    function position(menu, trigger) {
        var vw = document.documentElement.clientWidth || window.innerWidth;
        var width = Math.min(340, vw - 24);
        var rect = trigger && trigger.getBoundingClientRect ? trigger.getBoundingClientRect() : null;
        var top = rect ? rect.bottom + 9 : 76;
        var left = rect ? rect.right - width : vw - width - 12;
        menu.style.setProperty('--ots-menu-top', Math.max(8, Math.round(top)) + 'px');
        menu.style.setProperty('--ots-menu-left', Math.max(10, Math.min(Math.round(left), vw - width - 10)) + 'px');
    }

    function closeMenu() {
        var menu = document.getElementById(MENU_ID);
        if (!menu) return;
        menu.classList.remove(OPEN_CLASS);
        menu.setAttribute('aria-hidden', 'true');
        if (triggerElement) triggerElement.setAttribute('aria-expanded', 'false');
    }

    function toggleMenu(trigger) {
        var menu = createMenu();
        if (menu.classList.contains(OPEN_CLASS)) { closeMenu(); return; }
        triggerElement = trigger;
        position(menu, trigger);
        menu.classList.add(OPEN_CLASS);
        menu.setAttribute('aria-hidden', 'false');
        trigger.setAttribute('aria-expanded', 'true');
    }

    function runAction(action) {
        closeMenu();
        if (action === 'login' || action === 'register') {
            var mode = action === 'login' ? 'login' : 'quickmembership';
            if (window.mem && window.mem.init && typeof window.mem.init.bind === 'function' && window.mem.init.bind !== Function.prototype.bind) window.mem.init.bind(mode);
            else window.location.href = action === 'login' ? '/UyeGiris' : '/UyeOl';
            return;
        }
        if (typeof window.doSocialLogin === 'function') window.doSocialLogin(action === 'google' ? 3 : 1, 'login');
        else window.location.href = '/UyeGiris';
    }

    function syncMemberState() {
        var loggedIn = isLoggedIn();
        document.body.classList.toggle('ots-member-authenticated', loggedIn);
        if (loggedIn) {
            closeMenu();
            var menu = document.getElementById(MENU_ID);
            if (menu) menu.remove();
        } else {
            document.body.classList.add('ots-guest-member-menu-enabled');
            var obsoleteTrigger = document.getElementById('otsDesktopMemberTrigger');
            if (obsoleteTrigger) obsoleteTrigger.remove();
            decorateNativeMemberLinks();
            createMenu();
        }
    }

    function init() {
        addStyle();
        syncMemberState();
        var nativePanel = document.getElementById('divMemberPanel');
        if (nativePanel && window.MutationObserver) {
            new MutationObserver(syncMemberState).observe(nativePanel, { childList: true, subtree: true });
        }
        document.addEventListener('click', function (event) {
            var action = event.target.closest && event.target.closest('#' + MENU_ID + ' [data-ots-member-action]');
            if (action) {
                event.preventDefault();
                event.stopPropagation();
                runAction(action.getAttribute('data-ots-member-action'));
                return;
            }
            var trigger = findTrigger(event.target);
            if (trigger && !isLoggedIn()) {
                event.preventDefault();
                event.stopPropagation();
                if (event.stopImmediatePropagation) event.stopImmediatePropagation();
                toggleMenu(trigger);
                return;
            }
            var menu = document.getElementById(MENU_ID);
            if (menu && menu.classList.contains(OPEN_CLASS) && !menu.contains(event.target)) closeMenu();
        }, true);
        document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeMenu(); });
        window.addEventListener('resize', function () {
            var menu = document.getElementById(MENU_ID);
            if (menu && menu.classList.contains(OPEN_CLASS)) position(menu, triggerElement);
        }, { passive: true });
    }

    addStyle();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
}());

/* ========================================================================
 * BÖLÜM 2: CHECKOUT SEPET MODÜLÜ YÜKLEYİCİSİ
 *
 * Ticimax checkout, ana şablondan ayrı çalışan bir Vue uygulamasıdır. Bazı
 * dinamik alanlarda dış script etiketi çalıştırılmadığı için sepet modülünü
 * yalnızca checkout adresinde buradan ekler. Dosyanın kendi başlatma bayrağı,
 * doğrudan eklenen etiketle aynı anda gelse bile çifte çalışmayı önler.
 * ====================================================================== */
(function (window, document) {
    'use strict';

    var CHECKOUT_PATH = /^\/checkout(?:\/|$)/i;
    var MODULE_SRC = 'https://cdn.jsdelivr.net/gh/tayyipemre/ots-ticimax@bd8995d/sepet.min.js';
    var MODULE_SELECTOR = 'script[data-ots-checkout-module="true"]';

    /* Scripti yalnızca bir defa ekler. Dinamik scriptlerde `defer` etkisiz
       olduğundan sıralı çalışma için async=false kullanılır. */
    function loadCheckoutModule() {
        if (!CHECKOUT_PATH.test(window.location.pathname || '')) return;
        if (window.__otsCheckoutScriptV3 || window.__otsCheckoutModuleRequested) return;
        if (document.querySelector(MODULE_SELECTOR)) return;

        var script = document.createElement('script');
        script.src = MODULE_SRC;
        script.async = false;
        script.setAttribute('data-ots-checkout-module', 'true');
        script.onerror = function () {
            window.__otsCheckoutModuleRequested = false;
            script.remove();
        };

        window.__otsCheckoutModuleRequested = true;
        (document.head || document.documentElement).appendChild(script);
    }

    loadCheckoutModule();
}(window, document));

/* ========================================================================
 * BÖLÜM 3: GENEL FOOTER
 *
 * Site alt bilgi alanını ÖTS kurumsal kimliğine uygun biçimde yeniden oluşturur.
 * Kurumsal bağlantıları, kategorileri, e-bülten alanını ve mobil açılır menüleri yönetir.
 * ====================================================================== */
(function () {
    'use strict';

    function renderModernFooter() {
        var footer = document.querySelector('footer');
        if (!footer || footer.dataset.otsModernized === 'true') return;

        footer.dataset.otsModernized = 'true';
        footer.className = 'ots-footer';
        footer.id = 'customFooterContent';

        if (!document.querySelector('link[data-ots-footer-fonts]')) {
            var fontLink = document.createElement('link');
            fontLink.rel = 'stylesheet';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800;900&display=swap';
            fontLink.setAttribute('data-ots-footer-fonts', 'true');
            document.head.appendChild(fontLink);
        }

        var style = document.createElement('style');
        style.id = 'otsModernFooterStyles';
        style.textContent = `
            .ots-footer,
            .ots-footer * { box-sizing: border-box; }

            .ots-footer {
                --ots-footer-bg: #0c154c;
                --ots-footer-ink: #ffffff;
                --ots-footer-soft: rgba(255,255,255,.76);
                --ots-footer-muted: rgba(255,255,255,.58);
                --ots-footer-line: rgba(255,255,255,.16);
                --ots-footer-glass: rgba(255,255,255,.08);
                width: auto !important;
                float: none !important;
                margin: 50px clamp(14px, 2.6vw, 50px) 34px !important;
                padding: 0 !important;
                overflow: hidden;
                color: var(--ots-footer-ink);
                font-family: 'DM Sans', sans-serif;
                background:
                    radial-gradient(circle at 12% 10%, rgba(255,255,255,.16), transparent 28%),
                    radial-gradient(circle at 92% 82%, rgba(255,255,255,.10), transparent 30%),
                    var(--ots-footer-bg);
                border: 1px solid rgba(255,255,255,.14);
                border-radius: 18px;
                box-shadow: 0 18px 48px rgba(12, 21, 76, .22);
            }

            .ots-footer a { color: inherit; text-decoration: none; }
            .ots-footer ul { margin: 0; padding: 0; list-style: none; }

            .ots-footer-main {
                display: grid;
                grid-template-columns: minmax(260px, 1.35fr) repeat(3, minmax(150px, .72fr)) minmax(300px, 1.4fr);
                gap: 0;
                padding: clamp(48px, 5vw, 78px) clamp(34px, 4.3vw, 74px) clamp(42px, 4vw, 65px);
            }

            .ots-footer-brand { padding-right: clamp(28px, 4vw, 68px); }

            .ots-footer-logo {
                display: inline-flex;
                width: 116px;
                margin-bottom: 31px;
            }

            .ots-footer-logo img {
                display: block;
                width: 100%;
                height: auto;
                filter: brightness(0) invert(1);
            }

            .ots-footer-about {
                max-width: 360px;
                margin: 0;
                color: var(--ots-footer-soft);
                font-size: 13px;
                line-height: 1.85;
            }

            .ots-footer-socials {
                display: flex;
                flex-wrap: nowrap;
                gap: 9px;
                margin-top: 39px;
                white-space: nowrap;
            }

            .ots-footer-socials a {
                position: static !important;
                inset: auto !important;
                width: 42px;
                height: 42px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-size: 17px;
                border: 1px solid var(--ots-footer-line);
                border-radius: 50%;
                background: var(--ots-footer-glass);
                box-shadow: none !important;
                transform: none;
                transition: color .2s, background .2s, border-color .2s, transform .2s;
            }

            .ots-footer-socials a.ots-footer-whatsapp,
            .ots-footer-socials a[href*="api.whatsapp.com"] {
                position: static !important;
                left: auto !important;
                right: auto !important;
                top: auto !important;
                bottom: auto !important;
                z-index: auto !important;
                width: 42px !important;
                min-width: 42px !important;
                max-width: 42px !important;
                height: 42px !important;
                min-height: 42px !important;
                max-height: 42px !important;
                margin: 0 !important;
                padding: 0 !important;
                color: #fff !important;
                font-size: 17px !important;
                border: 1px solid var(--ots-footer-line) !important;
                border-radius: 50% !important;
                background: var(--ots-footer-glass) !important;
                box-shadow: none !important;
                transform: none !important;
                animation: none !important;
            }

            .ots-footer-socials a.ots-footer-whatsapp::before,
            .ots-footer-socials a.ots-footer-whatsapp::after,
            .ots-footer-socials a[href*="api.whatsapp.com"]::before,
            .ots-footer-socials a[href*="api.whatsapp.com"]::after {
                display: none !important;
                content: none !important;
            }

            .ots-footer-socials a.ots-footer-whatsapp i,
            .ots-footer-socials a[href*="api.whatsapp.com"] i {
                display: inline-flex !important;
                align-items: center;
                justify-content: center;
                color: #fff !important;
                font-size: 17px !important;
            }

            .ots-footer-socials a:hover {
                color: #0c154c;
                border-color: #fff;
                background: #fff;
                transform: translateY(-2px);
            }

            .ots-footer-socials a.ots-footer-whatsapp:hover,
            .ots-footer-socials a[href*="api.whatsapp.com"]:hover {
                color: #0c154c !important;
                border-color: #fff !important;
                background: #fff !important;
                transform: translateY(-2px) !important;
            }

            .ots-footer-socials a.ots-footer-whatsapp:hover i,
            .ots-footer-socials a[href*="api.whatsapp.com"]:hover i {
                color: #0c154c !important;
            }

            .ots-footer-col {
                min-width: 0;
                padding: 2px clamp(22px, 2.8vw, 48px);
                border-left: 1px solid var(--ots-footer-line);
            }

            .ots-footer-heading {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 0 0 27px;
                padding: 0;
                color: var(--ots-footer-ink);
                font: 700 12px 'Manrope', sans-serif;
                letter-spacing: .045em;
                text-align: left;
                text-transform: uppercase;
                border: 0;
                background: transparent;
            }

            .ots-footer-heading::after {
                content: '';
                display: none;
                width: 8px;
                height: 8px;
                border-right: 1.5px solid currentColor;
                border-bottom: 1.5px solid currentColor;
                transform: rotate(45deg);
                transition: transform .2s;
            }

            .ots-footer-title-line {
                display: block;
                width: 24px;
                height: 2px;
                margin: -14px 0 25px;
                background: rgba(255,255,255,.42);
            }

            .ots-footer-links {
                display: grid;
                gap: 16px;
            }

            .ots-footer-links a {
                display: inline-block;
                color: var(--ots-footer-soft);
                font-size: 12.5px;
                line-height: 1.35;
                transition: color .2s, transform .2s;
            }

            .ots-footer-links a:hover { color: #fff; transform: translateX(3px); }

            .ots-footer-newsletter {
                min-width: 0;
                padding: 2px 0 0 clamp(28px, 3vw, 50px);
                border-left: 1px solid var(--ots-footer-line);
            }

            .ots-footer-newsletter-copy {
                max-width: 370px;
                margin: 0 0 18px;
                color: var(--ots-footer-soft);
                font-size: 12.5px;
                line-height: 1.75;
            }

            .ots-footer-form {
                position: relative;
                display: flex;
                width: 100%;
                max-width: 430px;
                height: 49px;
                margin-bottom: 17px;
                border-radius: 9px;
                box-shadow: 0 10px 24px rgba(0,0,0,.12);
            }

            .ots-footer #txtbxNewsletterMail {
                width: 100% !important;
                height: 49px !important;
                margin: 0 !important;
                padding: 0 67px 0 15px !important;
                color: #fff !important;
                font: 400 12px 'DM Sans', sans-serif !important;
                outline: 0 !important;
                border: 1px solid rgba(255,255,255,.22) !important;
                border-radius: 9px !important;
                background: rgba(255,255,255,.10) !important;
                box-shadow: none !important;
                transition: border-color .2s, box-shadow .2s !important;
            }

            .ots-footer #txtbxNewsletterMail::placeholder { color: rgba(255,255,255,.62); }

            .ots-footer #txtbxNewsletterMail:focus {
                border-color: rgba(255,255,255,.72) !important;
                box-shadow: 0 0 0 3px rgba(255,255,255,.10) !important;
            }

            .ots-footer #btnMailKaydet {
                position: absolute !important;
                top: 0 !important;
                right: 0 !important;
                bottom: auto !important;
                width: 58px !important;
                height: 49px !important;
                display: flex !important;
                align-items: center;
                justify-content: center;
                margin: 0 !important;
                padding: 0 !important;
                color: #0c154c !important;
                font-size: 20px !important;
                line-height: 1 !important;
                cursor: pointer;
                border: 0 !important;
                border-radius: 9px !important;
                background: #fff !important;
                transition: background .2s, transform .2s !important;
            }

            .ots-footer #btnMailKaydet:hover { background: #e8ebff !important; }
            .ots-footer #btnMailKaydet span { transition: transform .2s; }
            .ots-footer #btnMailKaydet:hover span { transform: translateX(3px); }

            .ots-footer-permission {
                display: grid;
                grid-template-columns: 16px minmax(0, 1fr);
                gap: 10px;
                align-items: start;
                max-width: 430px;
            }

            .ots-footer #permission_0 {
                position: static !important;
                display: block !important;
                width: 15px !important;
                height: 15px !important;
                margin: 2px 0 0 !important;
                padding: 0 !important;
                opacity: 1 !important;
                visibility: visible !important;
                cursor: pointer;
                accent-color: #fff;
                appearance: auto !important;
                -webkit-appearance: checkbox !important;
            }

            .ots-footer-permission label {
                margin: 0 !important;
                color: var(--ots-footer-muted);
                font-size: 10.5px;
                line-height: 1.7;
                cursor: pointer;
            }

            .ots-footer-permission a {
                color: #fff;
                font-weight: 600;
                text-decoration: underline;
                text-underline-offset: 2px;
            }

            .ots-footer-bottom {
                min-height: 83px;
                display: grid;
                grid-template-columns: 1fr auto;
                gap: 30px;
                align-items: center;
                padding: 15px clamp(34px, 4.3vw, 74px);
                border-top: 1px solid var(--ots-footer-line);
            }

            .ots-footer-copy {
                margin: 0;
                color: var(--ots-footer-muted);
                font-size: 11.5px;
            }

            .ots-footer-copy strong { color: #fff; font-weight: 700; }

            .ots-footer-payment {
                min-height: 54px;
                min-width: min(430px, 38vw);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 10px 18px;
                border: 1px solid rgba(255,255,255,.18);
                border-radius: 10px;
                background: rgba(255,255,255,.95);
            }

            .ots-footer-payment img {
                display: block;
                max-width: 100%;
                max-height: 34px;
                object-fit: contain;
                filter: grayscale(.25);
            }

            @media (max-width: 1180px) {
                .ots-footer-main { grid-template-columns: 1.15fr repeat(3, .7fr); }
                .ots-footer-newsletter {
                    grid-column: 1 / -1;
                    margin-top: 42px;
                    padding: 36px 0 0;
                    border-top: 1px solid var(--ots-footer-line);
                    border-left: 0;
                }
                .ots-footer-newsletter-inner { max-width: 540px; }
            }

            @media (max-width: 780px) {
                .ots-footer { margin: 28px 12px 20px !important; border-radius: 14px; }
                .ots-footer-main { display: block; padding: 38px 25px 35px; }
                .ots-footer-brand { padding: 0 0 34px; }
                .ots-footer-logo { margin-bottom: 23px; }
                .ots-footer-about { font-size: 12px; line-height: 1.75; }
                .ots-footer-socials { margin-top: 26px; }
                .ots-footer-socials a { width: clamp(34px, 11vw, 39px); height: clamp(34px, 11vw, 39px); font-size: 15px; }
                .ots-footer-col {
                    padding: 0;
                    border-top: 1px solid var(--ots-footer-line);
                    border-left: 0;
                }
                .ots-footer-heading {
                    margin: 0;
                    padding: 19px 2px;
                    cursor: pointer;
                }
                .ots-footer-heading::after { display: block; }
                .ots-footer-col.is-open .ots-footer-heading::after { transform: rotate(225deg) translate(-2px, -2px); }
                .ots-footer-title-line { display: none; }
                .ots-footer-links {
                    display: none;
                    gap: 13px;
                    padding: 0 2px 22px;
                }
                .ots-footer-col.is-open .ots-footer-links { display: grid; }
                .ots-footer-newsletter {
                    margin-top: 0;
                    padding: 28px 0 0;
                }
                .ots-footer-newsletter .ots-footer-heading { padding: 0 0 19px; cursor: default; }
                .ots-footer-newsletter .ots-footer-heading::after { display: none; }
                .ots-footer-bottom {
                    grid-template-columns: 1fr;
                    gap: 18px;
                    padding: 24px 25px 27px;
                }
                .ots-footer-payment { min-width: 0; width: 100%; }
            }

            @media (prefers-reduced-motion: reduce) {
                .ots-footer * { transition-duration: .01ms !important; }
            }
        `;
        document.head.appendChild(style);

        footer.innerHTML = `
            <div class="ots-footer-main">
                <section class="ots-footer-brand" aria-label="ÖTS İç Giyim">
                    <a class="ots-footer-logo" href="/" aria-label="ÖTS ana sayfa" target="_blank" rel="noopener">
                        <img src="https://static.ticimax.cloud/30662/uploads/editoruploads/logo/logo.svg" alt="ÖTS Underwear">
                    </a>
                    <p class="ots-footer-about">Yarım asrı aşan deneyimimizle kadın, erkek ve çocuk iç giyiminde kalite ve konfor sunuyoruz. ÖTS ve JUST INNER markalarımızla 50’den fazla ülkede faaliyet gösteriyoruz.</p>
                    <nav class="ots-footer-socials" aria-label="Sosyal medya">
                        <a class="ots-footer-whatsapp" href="https://api.whatsapp.com/send?phone=902163135687&amp;text=Merhaba!" aria-label="WhatsApp" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i></a>
                        <a href="https://www.instagram.com/otsunderwear/" aria-label="Instagram" target="_blank" rel="noopener"><i class="fab fa-instagram"></i></a>
                        <a href="https://www.tiktok.com/@otsunderwear/" aria-label="TikTok" target="_blank" rel="noopener"><i class="fab fa-tiktok"></i></a>
                        <a href="https://www.youtube.com/@otsunderwear/" aria-label="YouTube" target="_blank" rel="noopener"><i class="fab fa-youtube"></i></a>
                        <a href="https://www.facebook.com/otsunderwear/" aria-label="Facebook" target="_blank" rel="noopener"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://tr.pinterest.com/otsunderwear/" aria-label="Pinterest" target="_blank" rel="noopener"><i class="fab fa-pinterest-p"></i></a>
                    </nav>
                </section>

                <nav class="ots-footer-col" aria-label="Kurumsal bağlantılar">
                    <button class="ots-footer-heading" type="button" aria-expanded="false">Kurumsal</button>
                    <span class="ots-footer-title-line"></span>
                    <ul class="ots-footer-links">
                        <li><a href="/" target="_blank" rel="noopener">Anasayfa</a></li>
                        <li><a href="/hakkimizda" target="_blank" rel="noopener">Hakkımızda</a></li>
                        <li><a href="/UyelikSozlesme.aspx?sozlemeTipi=5" target="_blank" rel="noopener">KVKK</a></li>
                        <li><a href="/blog" target="_blank" rel="noopener">Blog</a></li>
                        <li><a href="/iletisim" target="_blank" rel="noopener">Bize Ulaşın</a></li>
                        <li><a href="/musteri-yorumlari" target="_blank" rel="noopener">Müşteri Yorumları</a></li>
                    </ul>
                </nav>

                <nav class="ots-footer-col" aria-label="Müşteri ilişkileri bağlantıları">
                    <button class="ots-footer-heading" type="button" aria-expanded="false">Müşteri İlişkileri</button>
                    <span class="ots-footer-title-line"></span>
                    <ul class="ots-footer-links">
                        <li><a href="/UyelikSozlesme.aspx?sozlemeTipi=1" target="_blank" rel="noopener">Üyelik Sözleşmesi</a></li>
                        <li><a href="/SiparisTakip" target="_blank" rel="noopener">Sipariş Takibi</a></li>
                        <li><a href="/UyelikSozlesme.aspx?sozlemeTipi=2" target="_blank" rel="noopener">Kargo &amp; Teslimat</a></li>
                        <li><a href="/UyelikSozlesme.aspx?sozlemeTipi=4" target="_blank" rel="noopener">İade &amp; İptal</a></li>
                        <li><a href="/Iletisim" target="_blank" rel="noopener">Banka Bilgileri</a></li>
                        <li><a href="/kampanyalar" target="_blank" rel="noopener">Kampanyalar</a></li>
                    </ul>
                </nav>

                <nav class="ots-footer-col" aria-label="Kategori bağlantıları">
                    <button class="ots-footer-heading" type="button" aria-expanded="false">Kategoriler</button>
                    <span class="ots-footer-title-line"></span>
                    <ul class="ots-footer-links">
                        <li><a href="/erkek-ic-giyim" target="_blank" rel="noopener">Erkek İç Giyim</a></li>
                        <li><a href="/kadin-ic-giyim" target="_blank" rel="noopener">Kadın İç Giyim</a></li>
                        <li><a href="/erkek-cocuk" target="_blank" rel="noopener">Erkek Çocuk İç Giyim</a></li>
                        <li><a href="/kiz-cocuk-ic-giyim" target="_blank" rel="noopener">Kız Çocuk İç Giyim</a></li>
                    </ul>
                </nav>

                <section class="ots-footer-newsletter" aria-labelledby="otsNewsletterTitle">
                    <div class="ots-footer-newsletter-inner">
                        <h2 class="ots-footer-heading" id="otsNewsletterTitle">E-Bülten Kayıt</h2>
                        <span class="ots-footer-title-line"></span>
                        <p class="ots-footer-newsletter-copy">Kampanyalarımızdan ve yeniliklerimizden ilk siz haberdar olun.</p>
                        <div class="ots-footer-form" id="UpdatePanel1">
                            <input class="newstext textbox" id="txtbxNewsletterMail" name="txtbxNewsletterMail" type="email" inputmode="email" autocomplete="email" placeholder="E-posta adresinizi yazın..." aria-label="E-posta adresi">
                            <button class="newsbutton button" id="btnMailKaydet" type="button" onclick="saveNewsletter()" aria-label="E-bültene kaydol"><span aria-hidden="true">→</span></button>
                        </div>
                        <div class="ots-footer-permission">
                            <input data-req="true" id="permission_0" name="KVKK" type="checkbox">
                            <label for="permission_0"><a href="/UyelikSozlesme.aspx" target="_blank" rel="noopener">Üyelik koşullarını</a> ve <a href="/UyelikSozlesme.aspx?sozlemeTipi=5" target="_blank" rel="noopener">kişisel verilerimin korunmasını</a> kabul ediyorum.</label>
                        </div>
                    </div>
                </section>
            </div>

            <div class="ots-footer-bottom">
                <p class="ots-footer-copy">© ${new Date().getFullYear()} <strong>otsicgiyim.com</strong> – Tüm Hakları Saklıdır.</p>
                <div class="ots-footer-payment">
                    <img src="https://static.ticimax.cloud/30662/uploads/footertasarim/9/3f341198-0ee3-4495-b5e0-5677c31c9810.jpg" alt="Güvenli alışveriş ve ödeme yöntemleri">
                </div>
            </div>
            <input type="hidden" name="ctl00$YeniFooter$ltrCustomFooterID" id="YeniFooter_ltrCustomFooterID" value="9">`;

        footer.querySelectorAll('.ots-footer-col .ots-footer-heading').forEach(function (button) {
            button.addEventListener('click', function () {
                if (window.innerWidth > 780) return;
                var column = button.closest('.ots-footer-col');
                var willOpen = !column.classList.contains('is-open');
                column.classList.toggle('is-open', willOpen);
                button.setAttribute('aria-expanded', String(willOpen));
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderModernFooter);
    } else {
        renderModernFooter();
    }
}());

/* ========================================================================
 * BÖLÜM 4: SİPARİŞ TAKİP SAYFASI
 *
 * Sipariş sorgulama formunu ve sipariş sonucu görünümünü modern, anlaşılır bir düzene taşır.
 * Ticimax doğrulama, güvenlik kodu ve sipariş sorgulama işlevlerini korur.
 * ====================================================================== */
(function () {
    'use strict';

    function modernizeOrderTracking() {
        var source = document.querySelector('.siparisTakipSayfasi');
        var content = document.getElementById('divIcerik');

        if (!source || !content || document.getElementById('otsOrderShell')) return;

        if (!document.querySelector('link[data-ots-account-fonts]')) {
            var fontLink = document.createElement('link');
            fontLink.rel = 'stylesheet';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800;900&display=swap';
            fontLink.setAttribute('data-ots-account-fonts', 'true');
            document.head.appendChild(fontLink);
        }

        var style = document.createElement('style');
        style.id = 'otsModernOrderStyles';
        style.textContent = `
            body {
                --ots-order-ink: #11110f;
                --ots-order-muted: #6f6d67;
                --ots-order-paper: #f3f2ee;
                --ots-order-line: #d7d5ce;
                --ots-order-white: #fff;
                --ots-order-success: #426651;
                --ots-order-blue: #1a2357;
                --ots-order-blue-dark: #111947;
            }

            body #divIcerik.ticiContainer {
                width: 100% !important;
                max-width: none !important;
                padding: 0 !important;
            }

            body #divIcerik > .centerCount,
            body #divIcerik .hesabimBolumuTutucu {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            #otsOrderShell,
            #otsOrderShell * { box-sizing: border-box; }

            #otsOrderShell {
                position: relative;
                isolation: isolate;
                width: 100%;
                min-height: clamp(700px, 78vh, 920px);
                display: grid;
                place-items: center;
                padding: 72px 24px;
                overflow: hidden;
                color: var(--ots-order-ink);
                background:
                    radial-gradient(circle at 14% 16%, rgba(0,0,0,.045) 0 1px, transparent 1.4px) 0 0 / 18px 18px,
                    var(--ots-order-paper);
                font-family: 'DM Sans', sans-serif;
            }

            #otsOrderShell::before {
                content: '';
                position: absolute;
                z-index: -1;
                width: 500px;
                height: 500px;
                right: -250px;
                top: -250px;
                border: 1px solid rgba(17,17,15,.12);
                border-radius: 50%;
                box-shadow: 0 0 0 72px rgba(17,17,15,.024), 0 0 0 144px rgba(17,17,15,.014);
            }

            .ots-order-card {
                width: min(1160px, 100%);
                min-height: 640px;
                display: grid;
                grid-template-columns: minmax(370px, .88fr) minmax(0, 1.12fr);
                overflow: hidden;
                background: var(--ots-order-white);
                border: 1px solid rgba(17,17,15,.12);
                border-radius: 28px;
                box-shadow: 0 28px 80px rgba(23,22,19,.11);
                animation: otsOrderIn .7s cubic-bezier(.2,.7,.2,1) both;
            }

            .ots-order-visual {
                position: relative;
                min-height: 640px;
                padding: 52px;
                overflow: hidden;
                color: #fff;
                background: var(--ots-order-blue);
            }

            .ots-order-visual::after {
                content: '';
                position: absolute;
                inset: 0;
                opacity: .14;
                pointer-events: none;
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E");
                mix-blend-mode: soft-light;
            }

            .ots-order-kicker,
            .ots-order-visual-copy { position: relative; z-index: 2; }

            .ots-order-kicker {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 12px;
                font-weight: 600;
                letter-spacing: .18em;
                text-transform: uppercase;
            }

            .ots-order-kicker::before { content: ''; width: 32px; height: 1px; background: currentColor; }

            .ots-order-art {
                position: absolute;
                width: min(500px, 112%);
                height: auto;
                top: 40px;
                right: -75px;
                color: #deddd8;
                opacity: .86;
            }

            .ots-order-visual-copy {
                position: absolute;
                left: 52px;
                right: 45px;
                bottom: 50px;
            }

            .ots-order-visual-copy h2 {
                max-width: 430px;
                margin: 0 0 17px;
                color: #fff;
                font-family: 'Manrope', sans-serif;
                font-size: clamp(36px, 4vw, 58px);
                font-weight: 500;
                line-height: 1.02;
                letter-spacing: -.055em;
            }

            .ots-order-visual-copy p {
                max-width: 350px;
                margin: 0;
                color: rgba(255,255,255,.62);
                font-size: 14px;
                line-height: 1.7;
            }

            .ots-order-panel {
                min-width: 0;
                padding: 58px clamp(38px, 5vw, 72px) 64px;
                background: #fff;
            }

            #otsOrderShell .siparisTakipSayfasi,
            #otsOrderShell .siparisTakipSolBolum,
            #otsOrderShell .siparisTakipSagBolum {
                display: block;
                float: none !important;
                width: 100% !important;
                max-width: none !important;
                min-height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                border: 0 !important;
                background: transparent !important;
                box-shadow: none !important;
            }

            #otsOrderShell .siparisTakipBaslik { margin: 0 !important; border: 0 !important; }
            #otsOrderShell .siparisTakipBaslik::before {
                content: 'Sipariş asistanı';
                display: block;
                margin-bottom: 15px;
                color: var(--ots-order-muted);
                font-size: 12px;
                font-weight: 600;
                letter-spacing: .16em;
                text-transform: uppercase;
            }

            #otsOrderShell .siparisTakipBaslik h3 {
                margin: 0 !important;
                color: var(--ots-order-ink) !important;
                font-family: 'Manrope', sans-serif !important;
                font-size: clamp(36px, 3.2vw, 48px) !important;
                font-weight: 600 !important;
                line-height: 1.08 !important;
                letter-spacing: -.045em !important;
                text-transform: none !important;
            }

            #otsOrderShell .ots-order-intro {
                margin: 13px 0 30px;
                color: var(--ots-order-muted);
                font-size: 13px;
                line-height: 1.65;
            }

            #otsOrderShell #frmSiparisTakip {
                position: static !important;
                display: grid !important;
                float: none !important;
                clear: both !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                gap: 16px;
                transform: none !important;
            }
            #otsOrderShell #frmSiparisTakip .satirBlok2 {
                position: relative;
                display: block !important;
                float: none !important;
                clear: both !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                height: auto !important;
                left: auto !important;
                right: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                transform: none !important;
            }

            #otsOrderShell #frmSiparisTakip .satirBlokSag {
                position: static !important;
                display: block !important;
                float: none !important;
                clear: both !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                height: auto !important;
                left: auto !important;
                right: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                transform: none !important;
            }
            #otsOrderShell #frmSiparisTakip .hsbmSpan {
                position: absolute !important;
                z-index: 2;
                top: 9px !important;
                left: 17px !important;
                float: none !important;
                width: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                color: #77756f !important;
                font: 500 11px 'DM Sans', sans-serif !important;
                line-height: 1 !important;
                letter-spacing: .035em;
                pointer-events: none;
            }

            #otsOrderShell #frmSiparisTakip .hsbmTextbox,
            #otsOrderShell #frmSiparisTakip .textbox {
                position: static !important;
                display: block !important;
                float: none !important;
                clear: both !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                height: 58px !important;
                left: auto !important;
                right: auto !important;
                margin: 0 !important;
                padding: 22px 17px 8px !important;
                color: var(--ots-order-ink) !important;
                font: 500 14px 'DM Sans', sans-serif !important;
                outline: 0 !important;
                border: 1px solid var(--ots-order-line) !important;
                border-radius: 12px !important;
                background: #fafaf8 !important;
                box-shadow: none !important;
                transition: border-color .2s, background .2s, box-shadow .2s !important;
            }

            #otsOrderShell #frmSiparisTakip .xIDDiv {
                grid-template-columns: minmax(110px, 1fr) 42px;
                align-items: center;
                gap: 9px;
                padding: 12px !important;
                border: 1px solid var(--ots-order-line) !important;
                border-radius: 12px;
                background: #fafaf8;
            }

            #otsOrderShell #frmSiparisTakip .xIDDiv[style*='display: block'],
            #otsOrderShell #frmSiparisTakip .xIDDiv[style*='display:block'],
            #otsOrderShell #frmSiparisTakip .xIDDiv:not([style*='display: none']):not([style*='display:none']) {
                display: grid !important;
            }

            #otsOrderShell #frmSiparisTakip .xIDDiv[style*='display: none'],
            #otsOrderShell #frmSiparisTakip .xIDDiv[style*='display:none'] { display: none !important; }

            #otsOrderShell #frmSiparisTakip .xIDDiv #imgTicimaxCaptcha {
                display: block !important;
                width: 100% !important;
                max-width: 220px !important;
                height: 48px !important;
                margin: 0 !important;
                object-fit: contain;
                object-position: left center;
                border: 0 !important;
            }

            #otsOrderShell #frmSiparisTakip .xIDDiv > a {
                display: grid !important;
                place-items: center;
                width: 42px !important;
                height: 42px !important;
                margin: 0 !important;
                color: var(--ots-order-ink) !important;
                font-size: 17px !important;
                text-decoration: none;
                border: 1px solid var(--ots-order-line);
                border-radius: 9px;
                background: #fff;
            }

            #otsOrderShell #frmSiparisTakip .xIDDiv .textbox {
                grid-column: 1 / -1;
                width: 100% !important;
            }

            #otsOrderShell #frmSiparisTakip .xIDDiv .isRequired {
                grid-column: 1 / -1;
                width: 100% !important;
            }

            #otsOrderShell #frmSiparisTakip .hsbmTextbox:hover,
            #otsOrderShell #frmSiparisTakip .textbox:hover { border-color: #aaa89f !important; }
            #otsOrderShell #frmSiparisTakip .hsbmTextbox:focus,
            #otsOrderShell #frmSiparisTakip .textbox:focus {
                border-color: var(--ots-order-ink) !important;
                background: #fff !important;
                box-shadow: 0 0 0 3px rgba(17,17,15,.07) !important;
            }

            #otsOrderShell #frmSiparisTakip .kirmiziUyari,
            #otsOrderShell #frmSiparisTakip .alert-danger {
                display: block;
                margin: 6px 0 0 !important;
                padding: 0 !important;
                color: #9d2722 !important;
                font-size: 12px !important;
                border: 0 !important;
                background: transparent !important;
            }

            #otsOrderShell #frmSiparisTakip .altButonTutucu {
                position: static !important;
                display: block !important;
                float: none !important;
                clear: both !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                left: auto !important;
                right: auto !important;
                margin: 2px 0 0 !important;
                padding: 0 !important;
                transform: none !important;
            }
            #otsOrderShell #frmSiparisTakip .yesilButon {
                float: none !important;
                width: 100% !important;
                height: 56px !important;
                margin: 0 !important;
                padding: 0 22px !important;
                color: #fff !important;
                font: 600 13px 'DM Sans', sans-serif !important;
                letter-spacing: .03em;
                border: 1px solid var(--ots-order-blue) !important;
                border-radius: 12px !important;
                background: var(--ots-order-blue) !important;
                box-shadow: none !important;
                cursor: pointer;
                transition: transform .2s, background .2s, opacity .2s !important;
            }

            #otsOrderShell #frmSiparisTakip .yesilButon:hover:not(:disabled) { background: var(--ots-order-blue-dark) !important; transform: translateY(-1px); }
            #otsOrderShell #frmSiparisTakip .yesilButon:disabled,
            #otsOrderShell #frmSiparisTakip .yesilButon.butonDisabled { opacity: .42 !important; cursor: not-allowed; }

            .ots-order-privacy {
                margin: 18px 0 0;
                padding-left: 16px;
                color: #88857e;
                font-size: 12px;
                line-height: 1.55;
                border-left: 2px solid #c9c7c0;
            }

            #otsOrderShell .siparisTakipSagBolum { margin-top: 38px !important; animation: otsOrderResultIn .45s ease both; }
            #otsOrderShell .siparisDurumBilgileri {
                display: grid !important;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 1px;
                float: none !important;
                width: 100% !important;
                margin: 0 0 18px !important;
                padding: 1px !important;
                overflow: hidden;
                color: #fff;
                border: 0 !important;
                border-radius: 14px;
                background: var(--ots-order-blue-dark) !important;
            }

            #otsOrderShell .bilgiSatir {
                float: none !important;
                width: auto !important;
                min-width: 0;
                padding: 15px !important;
                border: 0 !important;
                background: var(--ots-order-blue);
            }
            #otsOrderShell .bilgiSatir span { color: #fff !important; font-size: 13px !important; overflow-wrap: anywhere; }
            #otsOrderShell .bilgiSatir strong {
                display: block;
                margin-bottom: 5px;
                color: rgba(255,255,255,.5) !important;
                font-size: 11px !important;
                font-weight: 500 !important;
                letter-spacing: .07em;
                text-transform: uppercase;
            }

            #otsOrderShell .altButonTutucu2 { grid-column: 1 / -1; margin: 0 !important; padding: 10px 14px; background: var(--ots-order-blue); }
            #otsOrderShell .kargoTakibiBtn {
                display: inline-flex !important;
                align-items: center;
                justify-content: center;
                gap: 8px;
                float: none !important;
                margin: 0 !important;
                padding: 10px 14px !important;
                color: var(--ots-order-blue) !important;
                font-size: 12px !important;
                font-weight: 600 !important;
                text-decoration: none !important;
                border: 1px solid #fff !important;
                border-radius: 9px !important;
                background: #fff !important;
            }

            #otsOrderShell .siparisTakipDetayi,
            #otsOrderShell .siparisBlokRow { float: none !important; width: 100% !important; }
            #otsOrderShell .siparisTutucu {
                display: grid !important;
                grid-template-columns: 78px minmax(0, 1fr);
                gap: 15px;
                float: none !important;
                width: 100% !important;
                margin: 0 0 10px !important;
                padding: 12px !important;
                border: 1px solid #e2e0da !important;
                border-radius: 12px !important;
                background: #fafaf8 !important;
            }

            #otsOrderShell .siparisResim {
                float: none !important;
                width: 78px !important;
                height: 96px !important;
                overflow: hidden;
                border-radius: 8px;
                background: #eeede8;
            }
            #otsOrderShell .siparisResim img { width: 100% !important; height: 100% !important; object-fit: cover !important; }
            #otsOrderShell .siparisBilgi {
                display: grid !important;
                grid-template-columns: minmax(0, 1fr) auto;
                gap: 14px;
                align-items: center;
                float: none !important;
                width: auto !important;
            }
            #otsOrderShell .siparisBilgiSol,
            #otsOrderShell .siparisBilgiSag { float: none !important; width: auto !important; }
            #otsOrderShell .siparisBilgiSol > span { color: var(--ots-order-ink) !important; font-size: 14px !important; font-weight: 600; line-height: 1.45; }
            #otsOrderShell .siparisBilgiSol strong { display: block; margin-top: 5px; color: var(--ots-order-muted) !important; font-size: 12px !important; font-weight: 400 !important; }
            #otsOrderShell .siparisBilgiSag { min-width: 125px; text-align: right; }
            #otsOrderShell .siparisBilgiSag > span { display: block; margin: 2px 0; color: var(--ots-order-muted) !important; font-size: 12px !important; }
            #otsOrderShell .siparisBilgiSag .siparisTakipDurum {
                display: inline-block !important;
                margin-top: 7px !important;
                padding: 6px 9px !important;
                color: var(--ots-order-success) !important;
                font-size: 11px !important;
                font-weight: 600;
                letter-spacing: .04em;
                text-transform: uppercase;
                border-radius: 99px;
                background: #e8efea !important;
            }

            #otsOrderShell .siparisBlokRow { display: grid !important; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 18px !important; }
            #otsOrderShell .siparisIkiliBlok { float: none !important; width: auto !important; margin: 0 !important; }
            #otsOrderShell .siparisAdres,
            #otsOrderShell .siparisEkstresi {
                float: none !important;
                width: 100% !important;
                min-height: 0 !important;
                margin: 0 0 10px !important;
                padding: 16px !important;
                border: 1px solid #e2e0da !important;
                border-radius: 12px !important;
                background: #fafaf8 !important;
            }
            #otsOrderShell .siparisAdresBaslik,
            #otsOrderShell .ekstreBaslik { display: block; margin-bottom: 8px; color: var(--ots-order-ink) !important; font-size: 12px !important; font-weight: 600; }
            #otsOrderShell .siparisAdres p { margin: 0 !important; color: var(--ots-order-muted) !important; font-size: 12px !important; line-height: 1.55 !important; }
            #otsOrderShell .ekstreTutar { display: flex !important; justify-content: space-between; gap: 10px; padding: 5px 0; color: var(--ots-order-muted) !important; font-size: 12px !important; }
            #otsOrderShell .ekstreTutar strong { color: var(--ots-order-ink) !important; }
            #otsOrderShell .ekstreGenelToplam { margin-top: 8px; padding-top: 11px; border-top: 1px solid #d7d5ce; }
            #otsOrderShell .ekstreGenelToplam span { display: flex; justify-content: space-between; color: var(--ots-order-ink) !important; font-size: 13px !important; font-weight: 600; }

            /* Sorgu sonrası sonuç deneyimi */
            #otsOrderShell.ots-has-result .ots-order-card {
                width: min(1380px, 100%);
                grid-template-columns: minmax(310px, .68fr) minmax(0, 1.32fr);
                transition: width .45s cubic-bezier(.2,.7,.2,1), grid-template-columns .45s cubic-bezier(.2,.7,.2,1);
            }

            #otsOrderShell.ots-has-result .ots-order-panel { padding: 46px clamp(30px, 4vw, 58px) 58px; }

            .ots-result-heading {
                display: flex;
                align-items: flex-end;
                justify-content: space-between;
                gap: 24px;
                margin: 0 0 20px;
                padding-bottom: 18px;
                border-bottom: 1px solid #e2e0da;
            }

            .ots-result-heading-copy { min-width: 0; }
            .ots-result-eyebrow {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 7px;
                color: var(--ots-order-success);
                font-size: 11px;
                font-weight: 600;
                letter-spacing: .13em;
                text-transform: uppercase;
            }
            .ots-result-eyebrow::before {
                content: '';
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: var(--ots-order-success);
                box-shadow: 0 0 0 4px rgba(66,102,81,.11);
            }
            .ots-result-heading h2 {
                margin: 0;
                color: var(--ots-order-ink);
                font-family: 'Manrope', sans-serif;
                font-size: clamp(23px, 2.3vw, 32px);
                font-weight: 600;
                line-height: 1.15;
                letter-spacing: -.035em;
            }
            .ots-result-heading p { margin: 7px 0 0; color: var(--ots-order-muted); font-size: 13px; line-height: 1.55; }
            .ots-result-change {
                flex: 0 0 auto;
                padding: 9px 12px;
                color: #55534e;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                border: 1px solid #d7d5ce;
                border-radius: 9px;
                background: #fff;
                transition: background .2s, border-color .2s;
            }
            .ots-result-change:hover { border-color: #aaa89f; background: #f7f6f3; }

            .ots-order-progress {
                position: relative;
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                margin: 0 0 22px;
                padding: 20px 18px 17px;
                overflow: hidden;
                border: 1px solid #e2e0da;
                border-radius: 14px;
                background: #fafaf8;
            }
            .ots-order-progress::before {
                content: '';
                position: absolute;
                top: 31px;
                left: calc(12.5% + 9px);
                right: calc(12.5% + 9px);
                height: 1px;
                background: #d7d5ce;
            }
            .ots-progress-step { position: relative; z-index: 1; min-width: 0; text-align: center; }
            .ots-progress-dot {
                display: grid;
                place-items: center;
                width: 23px;
                height: 23px;
                margin: 0 auto 9px;
                color: transparent;
                font-size: 11px;
                border: 1px solid #c8c6bf;
                border-radius: 50%;
                background: #fafaf8;
            }
            .ots-progress-step.is-complete .ots-progress-dot,
            .ots-progress-step.is-active .ots-progress-dot { color: #fff; border-color: var(--ots-order-blue); background: var(--ots-order-blue); }
            .ots-progress-step.is-active .ots-progress-dot { box-shadow: 0 0 0 5px rgba(26,35,87,.11); }
            .ots-progress-label { display: block; color: #99968e; font-size: 12px; font-weight: 500; line-height: 1.35; }
            .ots-progress-step.is-complete .ots-progress-label,
            .ots-progress-step.is-active .ots-progress-label { color: var(--ots-order-blue); font-weight: 600; }
            .ots-order-progress.is-cancelled { grid-template-columns: 1fr; padding: 17px; color: #9d2722; text-align: center; border-color: #e8c7c4; background: #fff7f6; }

            #otsOrderShell .siparisDurumBilgileri {
                margin-bottom: 22px !important;
                border-radius: 14px !important;
                background: var(--ots-order-blue) !important;
            }
            #otsOrderShell .bilgiSatir { position: relative; padding: 18px !important; }
            #otsOrderShell .bilgiSatir:not(:last-of-type)::after {
                content: '';
                position: absolute;
                top: 15px;
                right: 0;
                bottom: 15px;
                width: 1px;
                background: rgba(255,255,255,.12);
            }
            #otsOrderShell .bilgiSatir span { font-size: 13px !important; font-weight: 500; }

            #otsOrderShell .siparisTakipDetayi { display: grid !important; gap: 12px; }
            #otsOrderShell .siparisTutucu {
                position: relative;
                grid-template-columns: 112px minmax(0, 1fr) !important;
                gap: 20px !important;
                margin: 0 !important;
                padding: 16px !important;
                overflow: hidden;
                border-color: #dfddd6 !important;
                border-radius: 16px !important;
                background: #fff !important;
                transition: border-color .2s, transform .2s, box-shadow .2s;
            }
            #otsOrderShell .siparisTutucu::before {
                content: 'ÜRÜN';
                position: absolute;
                top: 0;
                right: 0;
                padding: 7px 10px;
                color: #8a877f;
                font-size: 8px;
                font-weight: 600;
                letter-spacing: .12em;
                border-bottom: 1px solid #e2e0da;
                border-left: 1px solid #e2e0da;
                border-radius: 0 15px 0 9px;
                background: #fafaf8;
            }
            #otsOrderShell .siparisTutucu:hover { transform: translateY(-2px); border-color: #c7c4bc !important; box-shadow: 0 12px 28px rgba(23,22,19,.07); }
            #otsOrderShell .siparisResim {
                width: 112px !important;
                height: 132px !important;
                border-radius: 11px !important;
                background: #f3f2ee !important;
            }
            #otsOrderShell .siparisBilgi { gap: 24px !important; }
            #otsOrderShell .siparisBilgiSol > span { display: block; max-width: 430px; font-size: 15px !important; line-height: 1.48; }
            #otsOrderShell .siparisBilgiSol strong {
                margin-top: 10px !important;
                color: #8a877f !important;
                font-size: 12px !important;
                letter-spacing: .045em;
            }
            #otsOrderShell .siparisBilgiSag { min-width: 150px; padding: 12px 0 0 18px; border-left: 1px solid #e8e6e0; }
            #otsOrderShell .siparisBilgiSag > span { margin: 4px 0 !important; font-size: 12px !important; }
            #otsOrderShell .siparisBilgiSag > span strong { color: #45443f; font-weight: 600; }
            #otsOrderShell .siparisBilgiSag .siparisTakipDurum:empty { display: none !important; }

            #otsOrderShell .siparisBlokRow {
                display: grid !important;
                grid-template-columns: minmax(0, 1fr) minmax(300px, .88fr) !important;
                gap: 14px !important;
                margin-top: 12px !important;
            }
            #otsOrderShell .siparisIkiliBlok:first-child { display: grid; gap: 12px; }
            #otsOrderShell .siparisAdres,
            #otsOrderShell .siparisEkstresi {
                position: relative;
                margin: 0 !important;
                padding: 20px !important;
                border-color: #dfddd6 !important;
                border-radius: 14px !important;
                background: #fafaf8 !important;
            }
            #otsOrderShell .siparisAdres { padding-left: 52px !important; }
            #otsOrderShell .siparisAdres::before {
                content: '';
                position: absolute;
                top: 20px;
                left: 19px;
                width: 19px;
                height: 19px;
                border: 1.5px solid #77756f;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg) scale(.72);
            }
            #otsOrderShell .siparisAdres::after {
                content: '';
                position: absolute;
                top: 26px;
                left: 25px;
                width: 5px;
                height: 5px;
                border: 1px solid #77756f;
                border-radius: 50%;
            }
            #otsOrderShell .siparisAdresBaslik,
            #otsOrderShell .ekstreBaslik { margin-bottom: 11px !important; font-size: 12px !important; }
            #otsOrderShell .siparisAdres p { font-size: 12px !important; line-height: 1.7 !important; }
            #otsOrderShell .siparisEkstresi { height: 100%; display: flex; flex-direction: column; }
            #otsOrderShell .ekstreBaslik { padding-bottom: 12px; border-bottom: 1px solid #e2e0da; }
            #otsOrderShell .ekstreTutar { padding: 7px 0 !important; font-size: 12px !important; }
            #otsOrderShell .ekstreGenelToplam { margin-top: auto !important; padding-top: 15px !important; }
            #otsOrderShell .ekstreGenelToplam span { align-items: baseline; font-size: 14px !important; }
            #otsOrderShell .ekstreGenelToplam strong { font-family: 'Manrope', sans-serif; font-size: 19px; font-weight: 600; letter-spacing: -.025em; }

            #otsOrderShell .sayfaYukleniyor { position: relative; min-height: 190px; pointer-events: none; }
            #otsOrderShell .sayfaYukleniyor::after {
                content: 'Siparişin getiriliyor…';
                position: absolute;
                z-index: 5;
                inset: 0;
                display: grid;
                place-items: center;
                color: var(--ots-order-muted);
                font-size: 12px;
                background: rgba(255,255,255,.92);
            }

            @keyframes otsOrderIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes otsOrderResultIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

            @media (max-width: 900px) {
                #otsOrderShell { padding: 34px 16px; }
                .ots-order-card { grid-template-columns: 1fr; max-width: 640px; }
                .ots-order-visual { min-height: 275px; padding: 34px; }
                .ots-order-art { width: 340px; top: -50px; right: -10px; opacity: .62; }
                .ots-order-visual-copy { left: 34px; right: 34px; bottom: 29px; }
                .ots-order-visual-copy h2 { max-width: 390px; margin-bottom: 0; font-size: 34px; }
                .ots-order-visual-copy p { display: none; }
                .ots-order-panel { padding: 42px 34px 48px; }
                #otsOrderShell.ots-has-result .ots-order-card { grid-template-columns: 1fr; max-width: 760px; }
                #otsOrderShell.ots-has-result .ots-order-panel { padding: 42px 34px 48px; }
            }

            @media (max-width: 540px) {
                #otsOrderShell { padding: 18px 12px 30px; }
                .ots-order-card { border-radius: 20px; }
                .ots-order-visual { min-height: 205px; padding: 25px; }
                .ots-order-art { width: 250px; top: -52px; right: -22px; }
                .ots-order-visual-copy { left: 25px; right: 25px; bottom: 22px; }
                .ots-order-visual-copy h2 { max-width: 290px; font-size: 27px; }
                .ots-order-kicker { font-size: 11px; }
                .ots-order-panel { padding: 34px 23px 38px; }
                #otsOrderShell .siparisTakipBaslik h3 { font-size: 34px !important; }
                #otsOrderShell .siparisDurumBilgileri { grid-template-columns: 1fr; }
                #otsOrderShell .bilgiSatir:not(:last-of-type)::after { top: auto; left: 15px; right: 15px; bottom: 0; width: auto; height: 1px; }
                .ots-result-heading { align-items: flex-start; }
                .ots-result-change { display: none; }
                .ots-order-progress { padding-left: 4px; padding-right: 4px; }
                .ots-progress-label { font-size: 8px; }
                #otsOrderShell .siparisTutucu { grid-template-columns: 82px minmax(0, 1fr) !important; gap: 13px !important; padding: 12px !important; }
                #otsOrderShell .siparisResim { width: 82px !important; height: 105px !important; }
                #otsOrderShell .siparisBilgi { grid-template-columns: 1fr; }
                #otsOrderShell .siparisBilgiSag { min-width: 0; padding: 10px 0 0; text-align: left; border-top: 1px solid #e8e6e0; border-left: 0; }
                #otsOrderShell .siparisBlokRow { grid-template-columns: 1fr !important; }
            }

            @media (prefers-reduced-motion: reduce) {
                .ots-order-card,
                #otsOrderShell .siparisTakipSagBolum { animation: none; }
                #otsOrderShell * { transition-duration: .01ms !important; }
            }
        `;
        document.head.appendChild(style);

        var shell = document.createElement('section');
        shell.id = 'otsOrderShell';
        shell.setAttribute('aria-label', 'Sipariş takip alanı');
        shell.innerHTML = `
            <div class="ots-order-card">
                <aside class="ots-order-visual" aria-hidden="true">
                    <div class="ots-order-kicker">ÖTS / Sipariş takip</div>
                    <svg class="ots-order-art" viewBox="0 0 560 650" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M332 43c-27 12-44 43-39 74 4 22 17 41 35 53-9 25-29 43-51 58-27 19-57 35-72 64-15 30-9 65-3 99 8 46 13 94-7 136-12 24-31 44-54 58" stroke="currentColor" stroke-width="1.3"/>
                        <path d="M347 45c24 13 37 42 35 69-2 28-17 53-39 70 29 2 57 12 78 32 28 27 36 68 38 107 4 68-3 139 21 203 8 22 21 42 39 57" stroke="currentColor" stroke-width="1.3"/>
                        <path d="M282 220c-2 61 7 122 16 182 10 69 20 138 15 207M409 213c-21 45-34 94-39 144-8 80 1 160 22 237" stroke="currentColor" stroke-width="1.05"/>
                        <path d="M237 262c53 30 117 40 176 21M205 353c74 37 165 43 241 9M195 443c78 34 172 39 251 4" stroke="currentColor" stroke-width=".8" opacity=".48"/>
                        <path d="M326 170c13 8 27 8 40 0M320 82c17-10 36-9 51 4M356 91c-1 12 2 23 8 33-5 4-11 6-17 5" stroke="currentColor" stroke-width="1"/>
                        <circle cx="452" cy="132" r="78" stroke="currentColor" stroke-width=".8" opacity=".17"/>
                        <circle cx="452" cy="132" r="107" stroke="currentColor" stroke-width=".8" opacity=".1"/>
                        <path d="M72 500c67-39 132-34 190 15M72 525c69-31 133-21 190 30" stroke="currentColor" stroke-width=".8" opacity=".22"/>
                        <path d="M105 185h84M147 143v84" stroke="currentColor" stroke-width=".8" opacity=".18"/>
                    </svg>
                    <div class="ots-order-visual-copy">
                        <h2>Siparişin nerede, hep bil.</h2>
                        <p>Hazırlıktan teslimata kadar siparişinin güncel durumunu tek bir ekranda takip et.</p>
                    </div>
                </aside>
                <main class="ots-order-panel">
                    <div id="otsOrderContentSlot"></div>
                </main>
            </div>`;

        source.parentNode.insertBefore(shell, source);
        document.getElementById('otsOrderContentSlot').appendChild(source);

        var heading = source.querySelector('.siparisTakipBaslik');
        if (heading && !heading.querySelector('.ots-order-intro')) {
            var intro = document.createElement('p');
            intro.className = 'ots-order-intro';
            intro.textContent = 'E-posta adresin ve sipariş numaranla gönderinin güncel durumuna ulaş.';
            heading.appendChild(intro);
        }

        var form = source.querySelector('#frmSiparisTakip');
        if (form && !source.querySelector('.ots-order-privacy')) {
            var privacy = document.createElement('p');
            privacy.className = 'ots-order-privacy';
            privacy.textContent = 'Bilgilerin yalnızca siparişini bulmak için kullanılır.';
            form.parentNode.insertBefore(privacy, form.nextSibling);
        }

        var mail = source.querySelector('#txtSiparisTakipMail');
        var orderNo = source.querySelector('#mainHolder_txtSiparisNumarasi');
        var button = source.querySelector('#frmSiparisTakip .yesilButon');
        var captchaRow = source.querySelector('.xIDDiv');
        var captchaImage = source.querySelector('#imgTicimaxCaptcha');

        if (mail) {
            mail.setAttribute('aria-label', 'E-posta adresi');
            mail.setAttribute('autocomplete', 'email');
            mail.setAttribute('inputmode', 'email');
            mail.setAttribute('placeholder', 'ornek@eposta.com');
        }

        if (orderNo) {
            orderNo.setAttribute('aria-label', 'Sipariş numarası');
            orderNo.setAttribute('autocomplete', 'off');
            orderNo.setAttribute('autocapitalize', 'characters');
            orderNo.setAttribute('placeholder', 'Örn. 668CW7335I');
            orderNo.addEventListener('input', function () {
                var start = this.selectionStart;
                this.value = this.value.toUpperCase().replace(/\s/g, '');
                if (start !== null) this.setSelectionRange(start, start);
            });
        }

        if (button) {
            button.setAttribute('aria-label', 'Siparişimi sorgula');
            var normalizeButtonText = function () {
                if (!button.value || button.value.indexOf('{{') !== -1) button.value = 'Siparişimi sorgula';
            };
            normalizeButtonText();
            window.setTimeout(normalizeButtonText, 800);
        }

        function refreshCaptchaWhenNeeded() {
            if (!captchaRow || !captchaImage) return;
            var isVisible = window.getComputedStyle(captchaRow).display !== 'none';
            var imageSource = captchaImage.getAttribute('src');
            if (isVisible && (!imageSource || imageSource === '#') && typeof window.GuvenlikKoduYenile === 'function') {
                window.GuvenlikKoduYenile();
            }
        }

        if (captchaRow) {
            refreshCaptchaWhenNeeded();
            new MutationObserver(refreshCaptchaWhenNeeded).observe(captchaRow, {
                attributes: true,
                attributeFilter: ['class', 'style']
            });
        }

        var result = source.querySelector('.siparisTakipSagBolum');
        var resultUpdateQueued = false;

        function getOrderStatus() {
            if (!result) return '';
            var rows = result.querySelectorAll('.siparisDurumBilgileri .bilgiSatir');
            if (!rows.length) return '';
            var statusText = rows[rows.length - 1].textContent || '';
            return statusText.replace(/^\s*Durum\s*:?\s*/i, '').trim();
        }

        function getProgressIndex(status) {
            var normalized = status.toLocaleLowerCase('tr-TR');
            if (/iptal|iade|başarısız|reddedildi/.test(normalized)) return -1;
            // "Kargoya hazırlanıyor" hazırlık, "Kargoya teslim edildi" kargoda adımıdır;
            // genel "kargo" ve "teslim" kontrollerinden önce ayrıştırılır.
            if (/kargoya hazır/.test(normalized)) return 1;
            if (/kargoya (teslim|verildi)|kargoda/.test(normalized)) return 2;
            if (/teslim/.test(normalized)) return 3;
            if (/kargo|dağıtım|yolda|sevk/.test(normalized)) return 2;
            if (/hazır|tedarik|paket|işleniyor/.test(normalized)) return 1;
            return 0;
        }

        function renderResultExperience() {
            resultUpdateQueued = false;
            if (!result) return;

            var isVisible = window.getComputedStyle(result).display !== 'none' && !result.classList.contains('ng-hide');
            var hasProducts = Boolean(result.querySelector('.siparisTutucu'));
            shell.classList.toggle('ots-has-result', isVisible && hasProducts);
            if (!isVisible || !hasProducts) return;

            result.setAttribute('aria-live', 'polite');

            var statusBox = result.querySelector('.siparisDurumBilgileri');
            if (!statusBox) return;

            var resultHeading = result.querySelector('.ots-result-heading');
            if (!resultHeading) {
                resultHeading = document.createElement('div');
                resultHeading.className = 'ots-result-heading';
                resultHeading.innerHTML = `
                    <div class="ots-result-heading-copy">
                        <span class="ots-result-eyebrow">Sipariş bulundu</span>
                        <h2>Siparişinin güncel durumu</h2>
                        <p>Ürün, teslimat ve ödeme bilgilerini aşağıda inceleyebilirsin.</p>
                    </div>
                    <button class="ots-result-change" type="button">Bilgileri değiştir</button>`;
                result.insertBefore(resultHeading, statusBox);

                resultHeading.querySelector('.ots-result-change').addEventListener('click', function () {
                    if (mail) {
                        mail.focus({ preventScroll: true });
                        mail.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            }

            var progress = result.querySelector('.ots-order-progress');
            if (!progress) {
                progress = document.createElement('div');
                progress.className = 'ots-order-progress';
                progress.setAttribute('aria-label', 'Sipariş ilerleme durumu');
                statusBox.parentNode.insertBefore(progress, statusBox.nextSibling);
            }

            var status = getOrderStatus();
            var progressIndex = getProgressIndex(status);
            var progressState = String(progressIndex) + '|' + status;
            if (progress.dataset.state !== progressState) {
                progress.dataset.state = progressState;
                if (progressIndex === -1) {
                    progress.className = 'ots-order-progress is-cancelled';
                    progress.textContent = status || 'Sipariş işlemi sonlandırıldı';
                } else {
                    var steps = ['Sipariş alındı', 'Hazırlanıyor', 'Kargoya verildi', 'Teslim edildi'];
                    progress.className = 'ots-order-progress';
                    progress.innerHTML = steps.map(function (label, index) {
                        var stateClass = index < progressIndex ? ' is-complete' : (index === progressIndex ? ' is-active' : '');
                        return '<div class="ots-progress-step' + stateClass + '">' +
                            '<span class="ots-progress-dot">✓</span>' +
                            '<span class="ots-progress-label">' + label + '</span>' +
                            '</div>';
                    }).join('');
                }
            }

            var productCount = result.querySelectorAll('.siparisTutucu').length;
            var resultDescription = resultHeading.querySelector('p');
            var descriptionText = productCount + ' ürünün teslimat ve ödeme bilgilerini aşağıda inceleyebilirsin.';
            if (resultDescription && resultDescription.textContent !== descriptionText) {
                resultDescription.textContent = descriptionText;
            }
        }

        function queueResultUpdate() {
            if (resultUpdateQueued) return;
            resultUpdateQueued = true;
            window.requestAnimationFrame(renderResultExperience);
        }

        if (result) {
            queueResultUpdate();
            new MutationObserver(queueResultUpdate).observe(result, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true,
                attributeFilter: ['class', 'style']
            });
        }

        [mail, orderNo].forEach(function (input) {
            if (!input) return;
            input.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' && button && !button.disabled) {
                    event.preventDefault();
                    button.click();
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', modernizeOrderTracking);
    } else {
        modernizeOrderTracking();
    }
}());

/* ========================================================================
 * BÖLÜM 5: HESABIM SAYFASI
 *
 * Üye hesap panelini, hesap menüsünü ve özet kartlarını kurumsal bir kontrol paneline dönüştürür.
 * Sipariş, favori, adres, iade ve hesap ayarları bağlantılarını düzenler.
 * ====================================================================== */
(function () {
    'use strict';

    var LOGO_URL = 'https://static.ticimax.cloud/30662/uploads/images/logo/logo.svg';

    function addFonts() {
        if (document.querySelector('link[data-ots-account-dashboard-fonts]')) return;

        var fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800;900&display=swap';
        fontLink.setAttribute('data-ots-account-dashboard-fonts', 'true');
        document.head.appendChild(fontLink);
    }

    function addStyles() {
        if (document.getElementById('otsAccountDashboardStyles')) return;

        var style = document.createElement('style');
        style.id = 'otsAccountDashboardStyles';
        style.textContent = `
            body {
                --ots-account-blue: #0c154c;
                --ots-account-blue-2: #132365;
                --ots-account-blue-3: #213b83;
                --ots-account-paper: #f5f7fb;
                --ots-account-line: #e1e6f1;
                --ots-account-text: #0c154c;
                --ots-account-muted: #53617f;
            }

            body.ots-account-page {
                background: var(--ots-account-paper) !important;
                font-family: 'DM Sans', sans-serif;
            }

            body.ots-account-page #header {
                display: none !important;
            }

            body.ots-account-page #divIcerik.ticiContainer {
                width: 100% !important;
                max-width: none !important;
                padding: 0 !important;
                background: var(--ots-account-paper) !important;
            }

            .ots-account-page .hesabimContent,
            .ots-account-page .hesabimBolumuTutucu {
                width: 100% !important;
                max-width: none !important;
                min-height: 100vh !important;
                margin: 0 !important;
                padding: 0 !important;
                background: var(--ots-account-paper) !important;
            }

            .ots-account-page .hesabimBolumuTutucu {
                display: grid !important;
                grid-template-columns: 350px minmax(0, 1fr);
                align-items: stretch;
            }

            .ots-account-page .solAnaMenu {
                position: sticky !important;
                top: 0;
                align-self: start;
                width: 100% !important;
                min-height: 100vh;
                float: none !important;
                margin: 0 !important;
                padding: 42px 40px 34px !important;
                color: #fff;
                border: 0 !important;
                background:
                    radial-gradient(circle at 20% 10%, rgba(65,102,190,.42), transparent 28%),
                    radial-gradient(circle at 86% 76%, rgba(65,102,190,.26), transparent 30%),
                    linear-gradient(160deg, #071c3d 0%, var(--ots-account-blue) 52%, #061936 100%) !important;
                box-shadow: inset -1px 0 0 rgba(255,255,255,.08);
                overflow: hidden;
            }

            .ots-account-page .solAnaMenu::before {
                content: '';
                position: absolute;
                inset: 0;
                pointer-events: none;
                opacity: .22;
                background:
                    linear-gradient(115deg, transparent 0 38%, rgba(255,255,255,.12) 39%, transparent 40%),
                    repeating-linear-gradient(120deg, transparent 0 16px, rgba(255,255,255,.035) 17px 18px);
            }

            .ots-account-sidebar-brand {
                position: relative;
                z-index: 1;
                display: block;
                margin: 0 0 36px;
            }

            .ots-account-sidebar-brand img {
                width: 100px;
                height: auto;
                display: block;
                filter: brightness(0) invert(1);
            }

            .ots-account-page .solAnaMenu ul {
                position: relative;
                z-index: 1;
                display: grid !important;
                gap: 7px;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                list-style: none !important;
                border: 0 !important;
                background: transparent !important;
            }

            .ots-account-page .solAnaMenu li {
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                border: 0 !important;
                background: transparent !important;
            }

            .ots-account-page .solAnaMenu li > a {
                min-height: 50px;
                display: flex !important;
                align-items: center;
                gap: 17px;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 18px !important;
                color: rgba(255,255,255,.88) !important;
                font-size: 15px !important;
                font-weight: 650 !important;
                line-height: 1.2 !important;
                text-decoration: none !important;
                border: 1px solid transparent !important;
                border-radius: 11px !important;
                background: transparent !important;
                transition: background .2s, color .2s, border-color .2s, transform .2s;
            }

            .ots-account-page .solAnaMenu li > a i {
                width: 22px;
                min-width: 22px;
                color: #fff !important;
                font-size: 18px !important;
                text-align: center;
                opacity: .98;
            }

            .ots-account-page .solAnaMenu li > a:hover,
            .ots-account-page .solAnaMenu li > a.aktif,
            .ots-account-page .solAnaMenu li.ots-current > a,
            .ots-account-page.ots-account-home-active .solAnaMenu li.ots-account-summary-link > a {
                color: #fff !important;
                border-color: rgba(255,255,255,.10) !important;
                background: linear-gradient(135deg, rgba(83,126,219,.54), rgba(56,92,170,.22)) !important;
                transform: translateX(2px);
                box-shadow: 0 12px 26px rgba(0,0,0,.12);
            }

            .ots-account-page .solAnaMenu li ul {
                display: none !important;
            }

            .ots-account-page .solAnaMenu .menuHesapAyarlarim,
            .ots-account-page .solAnaMenu .menuParaPuan,
            .ots-account-page .solAnaMenu .menuIptalTaleplerim,
            .ots-account-page .solAnaMenu .menuYorumlarim,
            .ots-account-page .solAnaMenu .menuIstekListelerim,
            .ots-account-page .solAnaMenu .menuFiyatAlarmListem,
            .ots-account-page .solAnaMenu .menuStokAlarmListem,
            .ots-account-page .solAnaMenu .menuHavaleBildirim {
                display: none !important;
            }

            .ots-account-sidebar-separator {
                height: 1px;
                margin: 17px 0;
                background: rgba(255,255,255,.17);
            }

            .ots-account-page .sagIcerikTutucu {
                width: 100% !important;
                float: none !important;
                min-width: 0;
                margin: 0 !important;
                padding: 18px 18px 24px !important;
                background: var(--ots-account-paper) !important;
            }

            .ots-account-page .hesabimMenuDon {
                display: none !important;
            }

            .ots-account-page .sagIcerikBolumu {
                width: 100% !important;
                min-height: calc(100vh - 42px);
                margin: 0 !important;
                padding: 0 !important;
                color: var(--ots-account-text);
                background: transparent !important;
                border: 0 !important;
                box-shadow: none !important;
            }

            .ots-account-page.ots-account-home-active .sagIcerikBolumu > [ng-view] {
                display: none !important;
            }

            .ots-account-dashboard,
            .ots-account-dashboard * {
                box-sizing: border-box;
            }

            .ots-account-dashboard {
                display: none;
                width: 100%;
                animation: otsAccountIn .58s cubic-bezier(.2,.7,.2,1) both;
            }

            .ots-account-page.ots-account-home-active .ots-account-dashboard {
                display: block;
            }

            .ots-account-hero {
                position: relative;
                min-height: 292px;
                display: grid;
                grid-template-columns: minmax(0, 1fr) minmax(390px, .72fr);
                align-items: center;
                overflow: hidden;
                padding: clamp(34px, 4vw, 62px);
                color: #fff;
                border-radius: 15px;
                background:
                    radial-gradient(circle at 94% 8%, rgba(65,102,190,.55), transparent 22%),
                    radial-gradient(circle at 38% 120%, rgba(72,118,212,.35), transparent 34%),
                    linear-gradient(135deg, #061936 0%, #0b2754 48%, #071c3d 100%);
                box-shadow: 0 24px 55px rgba(12,21,76,.16);
            }

            .ots-account-hero::before {
                content: '';
                position: absolute;
                inset: 0;
                opacity: .32;
                pointer-events: none;
                background:
                    radial-gradient(ellipse at 68% 62%, transparent 0 38%, rgba(96,143,232,.14) 39%, transparent 40% 43%, rgba(96,143,232,.1) 44%, transparent 45%),
                    repeating-linear-gradient(145deg, transparent 0 18px, rgba(255,255,255,.04) 19px 20px);
            }

            .ots-account-hero-copy,
            .ots-account-hero-art {
                position: relative;
                z-index: 1;
            }

            .ots-account-hero h1 {
                max-width: 620px;
                margin: 0;
                color: #fff;
                font-family: 'Manrope', sans-serif;
                font-size: clamp(32px, 4vw, 44px);
                font-weight: 800;
                line-height: 1.08;
                letter-spacing: -.04em;
            }

            .ots-account-hero p {
                max-width: 430px;
                margin: 18px 0 0;
                color: rgba(255,255,255,.9);
                font-size: clamp(16px, 1.5vw, 21px);
                line-height: 1.55;
            }

            .ots-account-hero-art {
                min-height: 210px;
                display: grid;
                place-items: center;
            }

            .ots-account-hero-art svg {
                width: min(420px, 100%);
                height: auto;
                display: block;
                filter: drop-shadow(0 24px 28px rgba(0,0,0,.24));
            }

            .ots-account-card-grid {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 18px;
                margin-top: 24px;
            }

            .ots-account-card {
                position: relative;
                min-height: 260px;
                display: flex;
                flex-direction: column;
                padding: 28px 28px 24px;
                color: var(--ots-account-text);
                text-decoration: none !important;
                border: 1px solid var(--ots-account-line);
                border-radius: 13px;
                background:
                    linear-gradient(145deg, rgba(255,255,255,.96), rgba(255,255,255,.78)),
                    #fff;
                box-shadow: 0 14px 34px rgba(12,21,76,.055);
                transition: transform .22s, box-shadow .22s, border-color .22s;
            }

            .ots-account-card:hover {
                transform: translateY(-4px);
                border-color: rgba(12,21,76,.24);
                box-shadow: 0 22px 48px rgba(12,21,76,.12);
            }

            .ots-account-card-icon {
                width: 64px;
                height: 64px;
                display: grid;
                place-items: center;
                margin-bottom: 25px;
                color: var(--ots-account-blue);
                border-radius: 50%;
                background: #eef2f8;
            }

            .ots-account-card-icon i {
                font-size: 31px;
            }

            .ots-account-card h3 {
                margin: 0 0 12px;
                color: var(--ots-account-text);
                font-family: 'Manrope', sans-serif;
                font-size: 23px;
                font-weight: 800;
                line-height: 1.12;
                letter-spacing: -.03em;
            }

            .ots-account-card p {
                max-width: 230px;
                margin: 0;
                color: var(--ots-account-muted);
                font-size: 15px;
                line-height: 1.45;
            }

            .ots-account-card-arrow {
                margin-top: auto;
                align-self: flex-end;
                color: var(--ots-account-blue);
                font-size: 33px;
                line-height: 1;
            }

            .ots-account-help {
                min-height: 88px;
                display: grid;
                grid-template-columns: 60px 1fr auto;
                align-items: center;
                gap: 20px;
                margin-top: 20px;
                padding: 20px 28px;
                border: 1px solid var(--ots-account-line);
                border-radius: 13px;
                background: linear-gradient(135deg, #f8faff, #eaf0f9);
            }

            .ots-account-help-icon {
                width: 58px;
                height: 58px;
                display: grid;
                place-items: center;
                color: #fff;
                border-radius: 50%;
                background: var(--ots-account-blue);
            }

            .ots-account-help h3 {
                margin: 0 0 6px;
                color: var(--ots-account-text);
                font-family: 'Manrope', sans-serif;
                font-size: 20px;
                font-weight: 800;
            }

            .ots-account-help p {
                margin: 0;
                color: var(--ots-account-muted);
                font-size: 13px;
            }

            .ots-account-help a {
                min-height: 48px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 18px;
                padding: 0 22px;
                color: #fff !important;
                font-size: 14px;
                font-weight: 700;
                text-decoration: none !important;
                border-radius: 9px;
                background: linear-gradient(135deg, var(--ots-account-blue), #071c3d);
            }

            @keyframes otsAccountIn {
                from { opacity: 0; transform: translateY(14px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @media (max-width: 1180px) {
                .ots-account-page .hesabimBolumuTutucu {
                    grid-template-columns: 300px minmax(0, 1fr);
                }

                .ots-account-page .solAnaMenu {
                    padding-left: 26px !important;
                    padding-right: 26px !important;
                }

                .ots-account-card-grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }
            }

            @media (max-width: 840px) {
                .ots-account-page .hesabimBolumuTutucu {
                    display: block !important;
                }

                .ots-account-page .solAnaMenu {
                    position: relative !important;
                    min-height: 0;
                    padding: 22px 16px !important;
                    border-radius: 0 0 24px 24px;
                }

                .ots-account-page .solAnaMenu ul {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }

                .ots-account-sidebar-brand img {
                    width: 82px;
                }

                .ots-account-page .sagIcerikTutucu {
                    padding: 14px !important;
                }

                .ots-account-hero {
                    grid-template-columns: 1fr;
                    min-height: 0;
                    padding: 32px;
                }

                .ots-account-hero-art {
                    min-height: 180px;
                    order: -1;
                    margin-bottom: 10px;
                }
            }

            @media (max-width: 560px) {
                .ots-account-page .solAnaMenu ul {
                    grid-template-columns: 1fr;
                }

                .ots-account-card-grid {
                    grid-template-columns: 1fr;
                    gap: 12px;
                }

                .ots-account-card {
                    min-height: 210px;
                    padding: 24px;
                }

                .ots-account-help {
                    grid-template-columns: 1fr;
                    text-align: center;
                }

                .ots-account-help-icon {
                    margin: 0 auto;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .ots-account-dashboard {
                    animation: none;
                }

                .ots-account-page * {
                    transition-duration: .01ms !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function getMemberName() {
        var sources = [
            document.getElementById('divMemberWelcomeContent'),
            document.querySelector('.memberWelcomeContent'),
            document.querySelector('.welcome')
        ];

        for (var i = 0; i < sources.length; i += 1) {
            if (!sources[i]) continue;
            var text = (sources[i].textContent || '').replace(/\s+/g, ' ').trim();
            text = text.replace(/hoşgeldiniz|hoş geldiniz|merhaba|çıkış yap/gi, '').replace(/[,:-]/g, '').trim();
            if (text && text.length < 45) return text.split(' ')[0];
        }

        if (window.globalModel && window.globalModel.member) {
            return window.globalModel.member.name || window.globalModel.member.firstName || '';
        }

        return '';
    }

    function makeHeroArt() {
        return `
            <svg viewBox="0 0 460 250" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g opacity=".95">
                    <path d="M233 59c0-14 11-26 25-28l83-11c17-2 33 10 35 28l16 128c2 17-10 33-28 35l-83 10c-17 3-33-10-35-27L233 59Z" fill="#f6f8ff"/>
                    <path d="M233 59c0-14 11-26 25-28l83-11c17-2 33 10 35 28l16 128c2 17-10 33-28 35l-83 10c-17 3-33-10-35-27L233 59Z" stroke="#5476db" stroke-width="5"/>
                    <circle cx="309" cy="78" r="22" fill="#17327c"/>
                    <path d="M269 140c7-25 29-37 54-31 20 5 32 20 34 38" stroke="#17327c" stroke-width="13" stroke-linecap="round"/>
                    <path d="M276 166h76M284 187h65" stroke="#c4cde4" stroke-width="7" stroke-linecap="round"/>
                </g>
                <path d="M154 85c-23 33-39 64-44 102M184 88c-20 43-25 78-15 116M205 111c6 34 23 61 50 83" stroke="#244692" stroke-width="14" stroke-linecap="round" opacity=".62"/>
                <path d="M376 100h67l-9 105h-71l-9-105h22Z" fill="#f7f8fc" stroke="#d2d9ec" stroke-width="3"/>
                <path d="M374 101c2-31 47-31 50 0" stroke="#f7f8fc" stroke-width="5"/>
                <path d="M306 127l49-15 47 23-9 69-37 24-38-24-12-77Z" fill="#1d397e"/>
                <path d="M337 166l20 20 38-46" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="120" cy="202" r="15" fill="#6d8bea"/>
                <g fill="#5476db" opacity=".55">
                    <circle cx="410" cy="55" r="3"/><circle cx="430" cy="55" r="3"/><circle cx="450" cy="55" r="3"/>
                    <circle cx="410" cy="75" r="3"/><circle cx="430" cy="75" r="3"/><circle cx="450" cy="75" r="3"/>
                </g>
            </svg>
        `;
    }

    function buildDashboard() {
        return `
            <section class="ots-account-dashboard" aria-label="Hesap özeti">
                <div class="ots-account-hero">
                    <div class="ots-account-hero-copy">
                        <h1 data-ots-account-title>Merhaba 👋</h1>
                        <p>Hesabınızdan tüm işlemlerinizi kolayca yönetebilirsiniz.</p>
                    </div>
                    <div class="ots-account-hero-art">${makeHeroArt()}</div>
                </div>
                <div class="ots-account-card-grid">
                    ${accountCard('#Siparislerim', 'fa-shopping-bag', 'Siparişlerim', 'Siparişlerinizi inceleyin, kargo durumunu takip edin.')}
                    ${accountCard('#IadeTaleplerim', 'fa-refresh', 'İade & Değişim', 'İade ve değişim taleplerinizi buradan oluşturun.')}
                    ${accountCard('#/Uyelik-Bilgilerim', 'fa-user', 'Üyelik Bilgilerim', 'Kişisel bilgilerinizi ve şifre ayarlarınızı güncelleyin.')}
                    ${accountCard('#/AdresDefterim', 'fa-map-marker', 'Adres Defterim', 'Kayıtlı adreslerinizi yönetin, yeni adres ekleyin.')}
                    ${accountCard('#Favorilerim', 'fa-heart', 'Favorilerim', 'Favori ürünlerinizi görüntüleyin ve kolayca satın alın.')}
                    ${accountCard('#HediyeCeklerim', 'fa-ticket', 'Hediye Çeklerim', 'Hediye çeklerinizi görüntüleyin ve kullanın.')}
                    ${accountCard('#ParaPuanlarim', 'fa-star', 'Para Puanlarım', 'Kazanmış olduğunuz puanları görüntüleyin ve kullanın.')}
                    ${accountCard('/checkout', 'fa-shopping-cart', 'Alışveriş Sepetim', 'Sepetinizdeki ürünleri görüntüleyin ve siparişinizi tamamlayın.')}
                </div>
                <div class="ots-account-help">
                    <div class="ots-account-help-icon"><i class="fa fa-headphones"></i></div>
                    <div>
                        <h3>Yardımınıza ihtiyacımız var?</h3>
                        <p>Destek taleplerinizi bizimle paylaşın, en kısa sürede yardımcı olalım.</p>
                    </div>
                    <a href="#DestekTaleplerim">Destek Talebi Oluştur <span aria-hidden="true">→</span></a>
                </div>
            </section>
        `;
    }

    function accountCard(href, icon, title, desc) {
        return `
            <a class="ots-account-card" href="${href}">
                <span class="ots-account-card-icon"><i class="fa ${icon}"></i></span>
                <h3>${title}</h3>
                <p>${desc}</p>
                <span class="ots-account-card-arrow" aria-hidden="true">→</span>
            </a>
        `;
    }

    function insertSidebarExtras(menu) {
        if (!menu || menu.querySelector('.ots-account-sidebar-brand')) return;

        var brand = document.createElement('a');
        brand.className = 'ots-account-sidebar-brand';
        brand.href = '/';
        brand.innerHTML = '<img src="' + LOGO_URL + '" alt="ÖTS">';
        menu.insertBefore(brand, menu.firstChild);

        var list = menu.querySelector(':scope > ul');
        if (!list) list = menu.querySelector('ul');
        if (!list || list.querySelector('.ots-account-summary-link')) return;

        var summary = document.createElement('li');
        summary.className = 'ots-account-summary-link';
        summary.innerHTML = '<a href="#/Hesabim-Anasayfa" class="btnShowContent btnHashChange"><i class="fa fa-home"></i>Hesap Özeti</a>';
        list.insertBefore(summary, list.firstChild);

        var fav = list.querySelector('.menuFavorilerim');
        if (fav) {
            insertAfter(fav, menuItem('ots-direct-address', '#/AdresDefterim', 'fa-map-marker', 'Adres Defterim'));
            insertAfter(list.querySelector('.ots-direct-address'), menuItem('ots-direct-member', '#/Uyelik-Bilgilerim', 'fa-user', 'Üyelik Bilgilerim'));
            insertAfter(list.querySelector('.ots-direct-member'), separatorItem());
        }

        var support = list.querySelector('.menuDestekTaleplerim');
        if (support) {
            list.insertBefore(menuItem('ots-direct-gift', '#HediyeCeklerim', 'fa-ticket', 'Hediye Çeklerim'), support);
            list.insertBefore(menuItem('ots-direct-points', '#ParaPuanlarim', 'fa-star', 'Para Puanlarım'), support);
        }

        var exit = list.querySelector('.menuUyeCikis');
        if (exit) {
            list.insertBefore(menuItem('ots-direct-notify', '#/IletisimIzinlerim', 'fa-bell-o', 'Bildirimler'), exit);
            list.insertBefore(menuItem('ots-direct-settings', '/SifremiUnuttum/SifreDegistir', 'fa-cog', 'Ayarlar'), exit);
            list.insertBefore(separatorItem(), exit);
        }
    }

    function menuItem(className, href, icon, text) {
        var item = document.createElement('li');
        item.className = className;
        item.innerHTML = '<a href="' + href + '" class="btnShowContent btnHashChange"><i class="fa ' + icon + '"></i>' + text + '</a>';
        return item;
    }

    function separatorItem() {
        var item = document.createElement('li');
        item.className = 'ots-account-sidebar-separator';
        return item;
    }

    function insertAfter(target, node) {
        if (!target || !target.parentNode || !node) return;
        target.parentNode.insertBefore(node, target.nextSibling);
    }

    function insertDashboard(content) {
        if (!content || document.querySelector('.ots-account-dashboard')) return;

        content.insertAdjacentHTML('afterbegin', buildDashboard());
    }

    function isHomeHash() {
        var hash = window.location.hash || '';
        return hash === '' || hash === '#' || hash === '#/Hesabim-Anasayfa' || hash === '#Hesabim-Anasayfa';
    }

    function normalizeHash(hash) {
        return (hash || '').replace(/^#\/?/, '').toLocaleLowerCase('tr-TR');
    }

    function syncState() {
        document.body.classList.toggle('ots-account-home-active', isHomeHash());

        var title = document.querySelector('[data-ots-account-title]');
        if (title) {
            var name = getMemberName();
            title.textContent = name ? 'Merhaba, ' + name + ' 👋' : 'Merhaba 👋';
        }

        var activeHash = normalizeHash(window.location.hash || '#/Hesabim-Anasayfa');
        document.querySelectorAll('.solAnaMenu li').forEach(function (item) {
            var link = item.querySelector('a[href]');
            if (!link) return;
            var linkHash = normalizeHash(link.getAttribute('href'));
            item.classList.toggle('ots-current', linkHash && activeHash && linkHash === activeHash);
        });
    }

    function modernizeAccount() {
        var page = document.querySelector('.hesabimContent');
        var menu = document.querySelector('.solAnaMenu');
        var content = document.querySelector('.sagIcerikBolumu');

        if (!page || !menu || !content || document.body.getAttribute('data-ots-account-modern') === 'true') return false;

        document.body.setAttribute('data-ots-account-modern', 'true');
        document.body.classList.add('ots-account-page');

        addFonts();
        addStyles();
        insertSidebarExtras(menu);
        insertDashboard(content);
        syncState();

        window.addEventListener('hashchange', syncState);
        window.setTimeout(syncState, 600);
        window.setTimeout(syncState, 1500);

        return true;
    }

    function boot() {
        var accountPath = /hesabim/i.test(String(window.location.pathname || '') + String(window.location.hash || ''));
        if (!accountPath && !document.querySelector('.hesabimContent, .solAnaMenu, .sagIcerikBolumu')) return;

        if (modernizeAccount()) return;

        // Hesap içeriği AJAX ile eklenebiliyor; sürekli sorgu yerine yalnızca DOM'u bekle.
        if (window.MutationObserver && document.documentElement) {
            var observer = new MutationObserver(function () {
                if (modernizeAccount()) observer.disconnect();
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
            window.setTimeout(function () { observer.disconnect(); }, 12000);
            return;
        }

        // MutationObserver olmayan eski tarayıcılar için sınırlı geri dönüş.
        [300, 1000, 2500].forEach(function (delay) {
            window.setTimeout(modernizeAccount, delay);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
}());

/* ========================================================================
 * BÖLÜM 6: KAMPANYA ÜST BİLGİ BANDI
 *
 * Kargo, indirim ve kampanya mesajlarını sayfanın üstünde dönüşümlü olarak gösterir.
 * Masaüstü ve mobil cihazlarda kampanya metinlerinin okunabilirliğini yönetir.
 * ====================================================================== */
(function () {
    const STYLE_ID = "otsCampaignBarModernStyles";

    // Kampanya metinleri: yeni kampanya eklemek veya çıkarmak için bu listeyi düzenleyin.
    const ITEMS = [{
        text: "2000 TL VE ÜZERİ SİPARİŞLERDE ÜCRETSİZ KARGO",
        highlight: true,
        tag: "KARGO"
    },
    {
        text: "İLK ALIŞVERİŞİNE ÖZEL 100 TL HEDİYE",
        highlight: true,
        tag: "YENİ"
    },
    {
        text: "HAVALE / EFT İLE ÖDEMELERDE %5 EKSTRA KAZANÇ",
        highlight: true,
        tag: "AVANTAJ"
    },
    {
        text: "TÜM ÜRÜNLERDE SEPETTE %30 İNDİRİM FIRSATI",
        highlight: false,
        tag: "KAMPANYA"
    },
    {
        text: "3000 TL ÜZERİ ALIŞVERİŞLERDE 250 TL İNDİRİM",
        highlight: false,
        tag: "KAMPANYA"
    },
    ];

    function cleanLeakedCampaignCssText() {
        if (!document.body || !document.createTreeWalker) return;

        const patterns = [
            "position: relative; z-index: 9999; width: 100%; height: 52px;",
            "overflow: hidden; display: flex; align-items: center; background:",
            "border-top: 1px solid rgba(255, 255, 255, 0.08);",
            "border-bottom: 1px solid rgba(255, 255, 255, 0.08);"
        ];

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                const parent = node.parentNode;
                const text = node.nodeValue || "";

                if (!parent || /^(SCRIPT|STYLE|TEXTAREA|INPUT)$/i.test(parent.nodeName)) {
                    return NodeFilter.FILTER_REJECT;
                }

                const hits = patterns.reduce(function (count, pattern) {
                    return count + (text.indexOf(pattern) > -1 ? 1 : 0);
                }, 0);

                return hits >= 2 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });

        const nodes = [];
        let node;
        while ((node = walker.nextNode())) nodes.push(node);
        nodes.forEach(function (textNode) {
            textNode.parentNode.removeChild(textNode);
        });
    }

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = [
            '',
            '            :root {',
            '                --ots-topbar-blue: #0e174d;',
            '                --ots-topbar-white: #ffffff;',
            '                --ots-topbar-ice: #edf7ff;',
            '                --ots-topbar-aqua: #7de7f2;',
            '                --ots-topbar-aqua-soft: rgba(125,231,242,.16);',
            '                --ots-topbar-line: rgba(255,255,255,.16);',
            '            }',
            '',
            '            .campaign-bar,',
            '            .campaign-bar * {',
            '                box-sizing: border-box;',
            '            }',
            '',
            '            .campaign-bar {',
            '                position: relative;',
            '                z-index: 9999;',
            '                width: 100%;',
            '                min-height: 40px;',
            '                display: flex;',
            '                align-items: center;',
            '                overflow: hidden;',
            '                color: #fff;',
            '                border-bottom: 1px solid rgba(125,231,242,.22);',
            '                background: var(--ots-topbar-blue);',
            '                box-shadow: 0 9px 24px rgba(12,21,76,.18);',
            '                font-family: "Manrope", "DM Sans", "Segoe UI", Arial, sans-serif;',
            '            }',
            '',
            '            .campaign-bar::before {',
            '                content: "";',
            '                position: absolute;',
            '                inset: 0;',
            '                pointer-events: none;',
            '                opacity: .55;',
            '                background:',
            '                    radial-gradient(circle at 18% 50%, rgba(125,231,242,.14), transparent 25%),',
            '                    radial-gradient(circle at 82% 50%, rgba(255,255,255,.08), transparent 28%),',
            '                    linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,0) 48%, rgba(0,0,0,.10));',
            '            }',
            '',
            '            .campaign-bar::after {',
            '                content: "";',
            '                position: absolute;',
            '                left: 0;',
            '                right: 0;',
            '                bottom: 0;',
            '                z-index: 2;',
            '                height: 1px;',
            '                pointer-events: none;',
            '                background: linear-gradient(90deg, transparent, rgba(125,231,242,.72), transparent);',
            '            }',
            '',
            '            .campaign-fade {',
            '                position: absolute;',
            '                z-index: 3;',
            '                top: 0;',
            '                bottom: 0;',
            '                width: 72px;',
            '                pointer-events: none;',
            '            }',
            '',
            '            .campaign-fade--left {',
            '                left: 0;',
            '                background: linear-gradient(90deg, var(--ots-topbar-blue), rgba(12,21,76,0));',
            '            }',
            '',
            '            .campaign-fade--right {',
            '                right: 0;',
            '                background: linear-gradient(270deg, var(--ots-topbar-blue), rgba(12,21,76,0));',
            '            }',
            '',
            '            .campaign-track {',
            '                position: relative;',
            '                z-index: 2;',
            '                width: max-content;',
            '                display: inline-flex;',
            '                align-items: center;',
            '                gap: 18px;',
            '                padding: 0 9px;',
            '                white-space: nowrap;',
            '                will-change: transform;',
            '                animation: otsCampaignMarquee 60s linear infinite;',
            '            }',
            '',
            '            .campaign-bar:hover .campaign-track {',
            '                animation-play-state: paused;',
            '            }',
            '',
            '            .campaign-item {',
            '                min-height: 40px;',
            '                display: inline-flex;',
            '                align-items: center;',
            '                gap: 9px;',
            '                color: rgba(255,255,255,.96);',
            '                font-size: 11px;',
            '                font-weight: 800;',
            '                letter-spacing: .065em;',
            '                text-transform: uppercase;',
            '                text-shadow: 0 1px 12px rgba(0,0,0,.18);',
            '            }',
            '',
            '            .campaign-item--highlight {',
            '                color: var(--ots-topbar-ice);',
            '            }',
            '',
            '            .campaign-tag {',
            '                min-width: 54px;',
            '                height: 22px;',
            '                display: inline-flex;',
            '                align-items: center;',
            '                justify-content: center;',
            '                padding: 0 9px;',
            '                color: var(--ots-topbar-white);',
            '                font-size: 9px;',
            '                font-weight: 900;',
            '                line-height: 1;',
            '                letter-spacing: .09em;',
            '                border-radius: 999px;',
            '                border: 1px solid rgba(255,255,255,.24);',
            '                background: rgba(255,255,255,.09);',
            '                box-shadow: inset 0 1px 0 rgba(255,255,255,.15), 0 0 18px rgba(125,231,242,.12);',
            '            }',
            '',
            '            .campaign-item--highlight .campaign-tag {',
            '                color: #061143;',
            '                border-color: rgba(237,247,255,.9);',
            '                background: var(--ots-topbar-ice);',
            '                box-shadow: 0 0 0 1px rgba(125,231,242,.28), 0 0 22px rgba(125,231,242,.30);',
            '            }',
            '',
            '            .campaign-text {',
            '                display: inline-block;',
            '            }',
            '',
            '            .campaign-dot {',
            '                color: rgba(125,231,242,.68);',
            '                font-size: 7px;',
            '                line-height: 1;',
            '            }',
            '',
            '            @keyframes otsCampaignMarquee {',
            '                from { transform: translate3d(0, 0, 0); }',
            '                to { transform: translate3d(-50%, 0, 0); }',
            '            }',
            '',
            '            @media (max-width: 768px) {',
            '                .campaign-bar {',
            '                    min-height: 35px;',
            '                }',
            '',
            '                .campaign-track {',
            '                    gap: 12px;',
            '                    padding: 0 6px;',
            '                    animation-duration: 46s;',
            '                }',
            '',
            '                .campaign-item {',
            '                    min-height: 35px;',
            '                    gap: 7px;',
            '                    font-size: 9px;',
            '                    letter-spacing: .045em;',
            '                }',
            '',
            '                .campaign-tag {',
            '                    min-width: 45px;',
            '                    height: 19px;',
            '                    padding: 0 7px;',
            '                    font-size: 8px;',
            '                }',
            '',
            '                .campaign-fade {',
            '                    width: 34px;',
            '                }',
            '            }',
            '',
            '            @media (prefers-reduced-motion: reduce) {',
            '                .campaign-track {',
            '                    animation: none;',
            '                    transform: none;',
            '                }',
            '            }',
            '        '
        ].join("\n");
        document.head.appendChild(style);
    }

    function buildSegment() {
        return ITEMS.map(function (item, i) {
            const cls = "campaign-item" + (item.highlight ? " campaign-item--highlight" : "");
            const dot = i < ITEMS.length - 1 ? '<span class="campaign-dot">●</span>' : "";
            return '<span class="' + cls + '">' +
                '<span class="campaign-tag">' + item.tag + '</span>' +
                '<span class="campaign-text">' + item.text + '</span>' +
                "</span>" + dot;
        }).join("");
    }

    function render() {
        cleanLeakedCampaignCssText();
        if (document.querySelector(".campaign-bar")) return;

        injectStyles();

        /* Sonsuz kayan efekt: -50% kaydırmanın dikişsiz olması için iki yarı
           birebir aynıdır (her biri ayırıcılı iki segment) ve kenar boşluğu
           gap'in yarısıdır. Yarının iki segment olması geniş ekranlarda da
           şeridin ekranı doldurmasını sağlar; süre buna göre iki katıdır. */
        const dotHtml = '<span class="campaign-dot" aria-hidden="true">●</span>';
        const half = buildSegment() + dotHtml + buildSegment() + dotHtml;
        const bar = document.createElement("div");
        bar.className = "campaign-bar";
        bar.setAttribute("role", "region");
        bar.setAttribute("aria-label", "Kampanya duyuruları");
        bar.innerHTML =
            '<span class="campaign-fade campaign-fade--left" aria-hidden="true"></span>' +
            '<div class="campaign-track">' +
            half +
            half +
            "</div>" +
            '<span class="campaign-fade campaign-fade--right" aria-hidden="true"></span>';
        document.body.insertAdjacentElement("afterbegin", bar);
        // Temizlik tüm sayfa metnini taradığı için boyutlandırma bitene kadar beklenir;
        // aksi halde pencere boyutlanırken saniyede onlarca kez çalışır.
        let cleanupTimer = null;
        const scheduleCleanup = function () {
            clearTimeout(cleanupTimer);
            cleanupTimer = setTimeout(cleanLeakedCampaignCssText, 250);
        };
        window.addEventListener("resize", scheduleCleanup, { passive: true });
        window.addEventListener("orientationchange", scheduleCleanup);
    }

    document.readyState === "loading" ?
        document.addEventListener("DOMContentLoaded", render) :
        render();
})();

/* ========================================================================
 * BÖLÜM 7: ARAMA MODALI VE CANLI SONUÇLAR
 *
 * Site aramasını modern bir modal içinde açar ve ürün/kategori sonuçlarını düzenler.
 * Ticimax otomatik tamamlama verileri ile API sonuçlarını mobil uyumlu biçimde sunar.
 * ====================================================================== */
(function () {
    'use strict';

    var STYLE_ID = 'otsSearchModalStyles';
    var MODAL_ID = 'otsSearchModal';
    var SEARCH_SLOT_ID = 'otsSearchFormSlot';
    var RESULTS_ID = 'otsSearchResults';
    var READY_CLASS = 'ots-search-modal-ready';
    var OPEN_CLASS = 'ots-search-modal-open';
    var API_URL = '/api/product/Search?c=trtry0010&Keyword=';
    var searchTimer = null;
    var searchAbortController = null;
    var nativeResultsObserver = null;
    var lastKeyword = '';

    var quickSearches = [
        'Kadın İç Giyim',
        'Erkek İç Giyim',
        'Çocuk İç Giyim',
        'Pijama',
        'Atlet',
        'Sütyen',
        'Külot',
        'Termal'
    ];

    function cleanLeakedCampaignCssText() {
        if (!document.body || !document.createTreeWalker) return;

        var suspicious = [
            'position: relative; z-index: 9999; width: 100%; height: 52px;',
            'overflow: hidden; display: flex; align-items: center; background:',
            'border-top: 1px solid rgba(255, 255, 255, 0.08);',
            'border-bottom: 1px solid rgba(255, 255, 255, 0.08);'
        ];

        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                var parent = node.parentNode;
                var text = node.nodeValue || '';

                if (!parent || /^(SCRIPT|STYLE|TEXTAREA|INPUT)$/i.test(parent.nodeName)) {
                    return NodeFilter.FILTER_REJECT;
                }

                var hitCount = suspicious.reduce(function (count, pattern) {
                    return count + (text.indexOf(pattern) > -1 ? 1 : 0);
                }, 0);

                return hitCount >= 2 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });

        var nodes = [];
        var node;
        while ((node = walker.nextNode())) {
            nodes.push(node);
        }

        nodes.forEach(function (textNode) {
            textNode.parentNode.removeChild(textNode);
        });
    }

    function hideNativeAutocompleteResults() {
        if (!document.body.classList.contains(OPEN_CLASS)) return;

        var selectors = [
            '#divAramaSonuc',
            '.searchV2',
            '.ticimax-search-content',
            '.quickSearchContent'
        ];

        selectors.forEach(function (selector) {
            document.querySelectorAll(selector).forEach(function (node) {
                node.style.setProperty('display', 'none', 'important');
                node.style.setProperty('visibility', 'hidden', 'important');
                node.style.setProperty('opacity', '0', 'important');
                node.style.setProperty('pointer-events', 'none', 'important');
            });
        });
    }

    function parseNativeProductList(nativeRoot) {
        if (!nativeRoot) return [];

        return Array.prototype.slice.call(nativeRoot.querySelectorAll('.products > li')).map(function (item) {
            var link = item.querySelector('a');
            var image = item.querySelector('.ticimax-search-product-image img');
            var name = item.querySelector('.ticimax-search-product-info-name');
            var category = item.querySelector('.ticimax-search-product-info-category');
            var price = item.querySelector('.ticimax-search-product-info-price');

            return {
                url: link ? link.getAttribute('href') : '',
                image: image ? image.getAttribute('src') : '',
                productName: name ? name.textContent.trim() : '',
                categoryName: category ? category.textContent.trim() : '',
                price: price ? price.textContent.trim() : '',
                oldPrice: ''
            };
        }).filter(function (product) {
            return product.productName;
        });
    }

    function parseNativeCategoryList(nativeRoot) {
        if (!nativeRoot) return [];

        return Array.prototype.slice.call(nativeRoot.querySelectorAll('.categories > li a')).map(function (link) {
            return {
                name: link.textContent.trim(),
                url: link.getAttribute('href') || ''
            };
        }).filter(function (category) {
            return category.name;
        });
    }

    function transformNativeAutocompleteResults() {
        if (!document.body.classList.contains(OPEN_CLASS)) return;

        var nativeRoot = document.getElementById('divAramaSonuc');
        if (!nativeRoot || nativeRoot.getAttribute('data-ots-native-parsed') === 'true') return;

        var products = parseNativeProductList(nativeRoot);
        var categories = parseNativeCategoryList(nativeRoot);
        var input = document.getElementById('txtbxArama');
        var keyword = input && input.value ? input.value.trim() : lastKeyword;

        if (products.length || categories.length) {
            nativeRoot.setAttribute('data-ots-native-parsed', 'true');
            lastKeyword = keyword || lastKeyword;
            renderApiResults({
                products: products,
                categories: categories
            }, keyword || 'Arama');
        }
    }

    function watchNativeAutocompleteResults() {
        if (nativeResultsObserver || !window.MutationObserver || !document.body) return;

        nativeResultsObserver = new MutationObserver(function () {
            transformNativeAutocompleteResults();
            hideNativeAutocompleteResults();
        });

        nativeResultsObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function stopWatchingNativeAutocompleteResults() {
        if (!nativeResultsObserver) return;
        nativeResultsObserver.disconnect();
        nativeResultsObserver = null;
    }

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '',
            '            body.ots-search-modal-open { overflow: hidden; }',
            '            body.ots-search-modal-open #divTopProductSearch.searchContent.active {',
            '                height: 0 !important;',
            '                padding: 0 !important;',
            '                overflow: hidden !important;',
            '                border: 0 !important;',
            '            }',
            '',
            '            body.ots-search-modal-open #divAramaSonuc {',
            '                display: none !important;',
            '                visibility: hidden !important;',
            '                opacity: 0 !important;',
            '                pointer-events: none !important;',
            '            }',
            '',
            '            #otsSearchModal #divAramaSonuc,',
            '            #otsSearchModal .searchV2,',
            '            #otsSearchModal .ticimax-search-content,',
            '            #otsSearchModal .quickSearchContent {',
            '                display: none !important;',
            '                visibility: hidden !important;',
            '                opacity: 0 !important;',
            '                pointer-events: none !important;',
            '            }',
            '',
            '            body.ots-search-modal-open .searchV2,',
            '            body.ots-search-modal-open .ticimax-search-content,',
            '            body.ots-search-modal-open .quickSearchContent {',
            '                display: none !important;',
            '                visibility: hidden !important;',
            '                opacity: 0 !important;',
            '                pointer-events: none !important;',
            '            }',
            '',
            '            .aramaButonu {',
            '                cursor: pointer;',
            '            }',
            '',
            '            .searchClick {',
            '                cursor: pointer;',
            '            }',
            '',
            '            #otsSearchModal,',
            '            #otsSearchModal * {',
            '                box-sizing: border-box;',
            '            }',
            '',
            '            #otsSearchModal {',
            '                position: fixed;',
            '                inset: 0;',
            '                z-index: 100000;',
            '                display: none;',
            '                align-items: center;',
            '                justify-content: center;',
            '                padding: 24px;',
            '                color: #101426;',
            '                font-family: "Manrope", "DM Sans", "Segoe UI", Arial, sans-serif;',
            '            }',
            '',
            '            #otsSearchModal.is-active {',
            '                display: flex;',
            '            }',
            '',
            '            .ots-search-backdrop {',
            '                position: absolute;',
            '                inset: 0;',
            '                background: rgba(8, 12, 38, .64);',
            '                backdrop-filter: blur(12px);',
            '                -webkit-backdrop-filter: blur(12px);',
            '                animation: otsSearchFade .22s ease both;',
            '            }',
            '',
            '            .ots-search-dialog {',
            '                position: relative;',
            '                z-index: 2;',
            '                width: min(1040px, 100%);',
            '                max-height: min(760px, calc(100vh - 42px));',
            '                display: grid;',
            '                grid-template-columns: minmax(0, 1.12fr) minmax(320px, .88fr);',
            '                overflow: hidden;',
            '                border: 1px solid rgba(255,255,255,.72);',
            '                border-radius: 30px;',
            '                background: #ffffff;',
            '                box-shadow: 0 34px 90px rgba(6, 10, 34, .28);',
            '                animation: otsSearchIn .34s cubic-bezier(.2,.72,.2,1) both;',
            '            }',
            '',
            '            #otsSearchModal.has-results .ots-search-dialog {',
            '                width: min(1180px, 100%);',
            '                grid-template-columns: 1fr;',
            '            }',
            '',
            '            #otsSearchModal.has-results .ots-search-visual {',
            '                display: none;',
            '            }',
            '',
            '            #otsSearchModal.has-results .ots-search-content {',
            '                padding: 30px;',
            '            }',
            '',
            '            #otsSearchModal.has-results .ots-search-kicker,',
            '            #otsSearchModal.has-results .ots-search-title,',
            '            #otsSearchModal.has-results .ots-search-copy {',
            '                display: none;',
            '            }',
            '',
            '            .ots-search-content {',
            '                padding: clamp(28px, 5vw, 58px);',
            '                background:',
            '                    radial-gradient(circle at 0 0, rgba(15,24,78,.08), transparent 32%),',
            '                    linear-gradient(180deg, #fff 0%, #f7f8fc 100%);',
            '            }',
            '',
            '            .ots-search-kicker {',
            '                display: inline-flex;',
            '                align-items: center;',
            '                gap: 9px;',
            '                margin: 0 0 17px;',
            '                color: #0f184e;',
            '                font-size: 11px;',
            '                font-weight: 900;',
            '                letter-spacing: .16em;',
            '                text-transform: uppercase;',
            '            }',
            '',
            '            .ots-search-kicker::before {',
            '                content: "";',
            '                width: 28px;',
            '                height: 1px;',
            '                background: #0f184e;',
            '            }',
            '',
            '            .ots-search-title {',
            '                margin: 0;',
            '                max-width: 560px;',
            '                color: #0f184e;',
            '                font-size: clamp(34px, 4.8vw, 58px);',
            '                font-weight: 800;',
            '                line-height: .98;',
            '                letter-spacing: -.055em;',
            '            }',
            '',
            '            .ots-search-copy {',
            '                max-width: 480px;',
            '                margin: 16px 0 28px;',
            '                color: #66708b;',
            '                font-size: 14px;',
            '                line-height: 1.75;',
            '            }',
            '',
            '            #otsSearchFormSlot {',
            '                width: 100%;',
            '            }',
            '',
            '            #otsSearchModal #divArama {',
            '                position: relative !important;',
            '                float: none !important;',
            '                width: 100% !important;',
            '                max-width: none !important;',
            '                height: auto !important;',
            '                display: grid !important;',
            '                grid-template-columns: minmax(0, 1fr) auto;',
            '                gap: 10px;',
            '                margin: 0 !important;',
            '                padding: 10px !important;',
            '                border: 1px solid #d9deea !important;',
            '                border-radius: 18px !important;',
            '                background: #fff !important;',
            '                box-shadow: 0 18px 45px rgba(15,24,78,.10) !important;',
            '            }',
            '',
            '            #otsSearchModal #divArama::before,',
            '            #otsSearchModal #divArama::after {',
            '                display: none !important;',
            '            }',
            '',
            '            #otsSearchModal .ButtonMic {',
            '                display: none !important;',
            '            }',
            '',
            '            #otsSearchModal #txtbxArama {',
            '                float: none !important;',
            '                width: 100% !important;',
            '                height: 58px !important;',
            '                margin: 0 !important;',
            '                padding: 0 20px !important;',
            '                color: #0f184e !important;',
            '                font: 700 17px "Manrope", "DM Sans", Arial, sans-serif !important;',
            '                letter-spacing: -.01em;',
            '                outline: 0 !important;',
            '                border: 0 !important;',
            '                border-radius: 13px !important;',
            '                background: #f4f6fb !important;',
            '                box-shadow: none !important;',
            '                appearance: none;',
            '            }',
            '',
            '            #otsSearchModal #txtbxArama::placeholder {',
            '                color: #8b94aa;',
            '                opacity: 1;',
            '            }',
            '',
            '            #otsSearchModal #txtbxArama:focus {',
            '                background: #fff !important;',
            '                box-shadow: inset 0 0 0 2px rgba(15,24,78,.18) !important;',
            '            }',
            '',
            '            #otsSearchModal #btnKelimeAra {',
            '                float: none !important;',
            '                width: auto !important;',
            '                min-width: 112px;',
            '                height: 58px !important;',
            '                margin: 0 !important;',
            '                padding: 0 24px !important;',
            '                color: #fff !important;',
            '                font: 900 13px "Manrope", "DM Sans", Arial, sans-serif !important;',
            '                letter-spacing: .05em;',
            '                text-transform: uppercase;',
            '                cursor: pointer;',
            '                border: 0 !important;',
            '                border-radius: 13px !important;',
            '                background: #0f184e !important;',
            '                box-shadow: 0 12px 25px rgba(15,24,78,.20) !important;',
            '                transition: transform .2s ease, background .2s ease, box-shadow .2s ease;',
            '            }',
            '',
            '            #otsSearchModal #btnKelimeAra:hover {',
            '                background: #1a2357 !important;',
            '                transform: translateY(-1px);',
            '                box-shadow: 0 16px 30px rgba(15,24,78,.26) !important;',
            '            }',
            '',
            '            .ots-search-suggestions {',
            '                margin-top: 22px;',
            '            }',
            '',
            '            .ots-search-suggestions.is-muted {',
            '                display: none;',
            '            }',
            '',
            '            .ots-search-suggestions-title {',
            '                margin: 0 0 11px;',
            '                color: #0f184e;',
            '                font-size: 12px;',
            '                font-weight: 900;',
            '                letter-spacing: .10em;',
            '                text-transform: uppercase;',
            '            }',
            '',
            '            .ots-search-chip-list {',
            '                display: flex;',
            '                flex-wrap: wrap;',
            '                gap: 9px;',
            '                margin: 0;',
            '                padding: 0;',
            '                list-style: none;',
            '            }',
            '',
            '            .ots-search-chip {',
            '                display: inline-flex;',
            '                align-items: center;',
            '                justify-content: center;',
            '                min-height: 36px;',
            '                padding: 0 14px;',
            '                color: #0f184e;',
            '                font-size: 12px;',
            '                font-weight: 800;',
            '                cursor: pointer;',
            '                border: 1px solid #dbe1ee;',
            '                border-radius: 999px;',
            '                background: #fff;',
            '                transition: color .2s ease, background .2s ease, border-color .2s ease, transform .2s ease;',
            '            }',
            '',
            '            .ots-search-chip:hover {',
            '                color: #fff;',
            '                border-color: #0f184e;',
            '                background: #0f184e;',
            '                transform: translateY(-1px);',
            '            }',
            '',
            '            .ots-search-results {',
            '                display: none;',
            '                margin-top: 24px;',
            '                overflow: hidden;',
            '                border: 1px solid #e1e6f1;',
            '                border-radius: 20px;',
            '                background: #fff;',
            '                box-shadow: 0 18px 45px rgba(15,24,78,.08);',
            '            }',
            '',
            '            .ots-search-results.is-active {',
            '                display: grid;',
            '                grid-template-columns: 300px minmax(0, 1fr);',
            '                max-height: min(620px, calc(100vh - 190px));',
            '                overflow: hidden;',
            '            }',
            '',
            '            .ots-search-results-sidebar {',
            '                padding: 24px 20px;',
            '                background: #f5f6fa;',
            '                border-right: 1px solid #e8ecf4;',
            '                overflow: auto;',
            '            }',
            '',
            '            .ots-search-results-title {',
            '                margin: 0 0 15px;',
            '                color: #0f184e;',
            '                font-size: 15px;',
            '                font-weight: 900;',
            '                letter-spacing: -.01em;',
            '            }',
            '',
            '            .ots-search-category-list {',
            '                display: grid;',
            '                gap: 10px;',
            '                margin: 0;',
            '                padding: 0;',
            '                list-style: none;',
            '            }',
            '',
            '            .ots-search-category-link {',
            '                display: block;',
            '                max-width: 100%;',
            '                color: #5f6678;',
            '                font-size: 13px;',
            '                font-weight: 700;',
            '                line-height: 1.35;',
            '                text-decoration: none;',
            '                overflow: hidden;',
            '                white-space: nowrap;',
            '                text-overflow: ellipsis;',
            '                transition: color .2s ease, transform .2s ease;',
            '            }',
            '',
            '            .ots-search-category-link:hover {',
            '                color: #0f184e;',
            '                transform: translateX(2px);',
            '            }',
            '',
            '            .ots-search-results-main {',
            '                padding: 24px;',
            '                min-width: 0;',
            '                overflow: auto;',
            '            }',
            '',
            '            .ots-search-results-head {',
            '                display: flex;',
            '                align-items: center;',
            '                justify-content: space-between;',
            '                gap: 14px;',
            '                margin: 0 0 18px;',
            '            }',
            '',
            '            .ots-search-results-heading {',
            '                margin: 0;',
            '                color: #4f5565;',
            '                font-size: 18px;',
            '                font-weight: 800;',
            '                line-height: 1.35;',
            '                letter-spacing: -.02em;',
            '            }',
            '',
            '            .ots-search-all-link {',
            '                flex: 0 0 auto;',
            '                color: #0f184e;',
            '                font-size: 12px;',
            '                font-weight: 900;',
            '                text-decoration: none;',
            '                border-bottom: 1px solid currentColor;',
            '            }',
            '',
            '            .ots-search-product-grid {',
            '                display: grid;',
            '                grid-template-columns: repeat(2, minmax(0, 1fr));',
            '                gap: 12px;',
            '                margin: 0;',
            '                padding: 0;',
            '                list-style: none;',
            '            }',
            '',
            '            .ots-search-product-card {',
            '                min-width: 0;',
            '                border: 1px solid #dde2eb;',
            '                border-radius: 12px;',
            '                background: #fff;',
            '                overflow: hidden;',
            '                transition: border-color .2s ease, transform .2s ease, box-shadow .2s ease;',
            '            }',
            '',
            '            .ots-search-product-card:hover {',
            '                border-color: rgba(15,24,78,.32);',
            '                transform: translateY(-1px);',
            '                box-shadow: 0 12px 24px rgba(15,24,78,.10);',
            '            }',
            '',
            '            .ots-search-product-card a {',
            '                display: grid;',
            '                grid-template-columns: 118px minmax(0, 1fr);',
            '                min-height: 116px;',
            '                color: inherit;',
            '                text-decoration: none;',
            '            }',
            '',
            '            .ots-search-product-image {',
            '                width: 118px;',
            '                height: 116px;',
            '                background: #f4f5f8;',
            '                overflow: hidden;',
            '            }',
            '',
            '            .ots-search-product-image img {',
            '                display: block;',
            '                width: 100%;',
            '                height: 100%;',
            '                object-fit: cover;',
            '            }',
            '',
            '            .ots-search-product-info {',
            '                min-width: 0;',
            '                padding: 18px 14px;',
            '            }',
            '',
            '            .ots-search-product-category {',
            '                margin: 0 0 7px;',
            '                color: #a0a6b2;',
            '                font-size: 12px;',
            '                font-weight: 800;',
            '                line-height: 1.25;',
            '                overflow: hidden;',
            '                white-space: nowrap;',
            '                text-overflow: ellipsis;',
            '            }',
            '',
            '            .ots-search-product-name {',
            '                margin: 0 0 8px;',
            '                color: #4f5565;',
            '                font-size: 15px;',
            '                font-weight: 800;',
            '                line-height: 1.28;',
            '                display: -webkit-box;',
            '                -webkit-line-clamp: 2;',
            '                -webkit-box-orient: vertical;',
            '                overflow: hidden;',
            '            }',
            '',
            '            .ots-search-price-row {',
            '                display: flex;',
            '                align-items: baseline;',
            '                gap: 8px;',
            '                color: #6e7480;',
            '                font-size: 13px;',
            '                font-weight: 900;',
            '            }',
            '',
            '            .ots-search-old-price {',
            '                color: #b7bbc4;',
            '                text-decoration: line-through;',
            '                font-weight: 800;',
            '            }',
            '',
            '            .ots-search-state {',
            '                padding: 24px;',
            '                color: #68728c;',
            '                font-size: 14px;',
            '                line-height: 1.6;',
            '            }',
            '',
            '            .ots-search-visual {',
            '                position: relative;',
            '                min-height: 520px;',
            '                display: flex;',
            '                align-items: center;',
            '                justify-content: center;',
            '                padding: 44px;',
            '                overflow: hidden;',
            '                color: #d8dbe3;',
            '                background:',
            '                    radial-gradient(circle at 50% 30%, rgba(255,255,255,.14), transparent 36%),',
            '                    #0f184e;',
            '            }',
            '',
            '            .ots-search-visual::before {',
            '                content: "";',
            '                position: absolute;',
            '                width: 430px;',
            '                height: 430px;',
            '                border: 1px solid rgba(255,255,255,.16);',
            '                border-radius: 50%;',
            '                box-shadow: 0 0 0 62px rgba(255,255,255,.045), 0 0 0 124px rgba(255,255,255,.024);',
            '            }',
            '',
            '            .ots-search-visual::after {',
            '                content: "";',
            '                position: absolute;',
            '                inset: 0;',
            '                opacity: .14;',
            '                background-image: radial-gradient(circle, rgba(255,255,255,.8) 0 1px, transparent 1.4px);',
            '                background-size: 22px 22px;',
            '            }',
            '',
            '            .ots-search-art {',
            '                position: relative;',
            '                z-index: 1;',
            '                width: min(390px, 94%);',
            '                height: auto;',
            '                opacity: .88;',
            '                filter: grayscale(1);',
            '            }',
            '',
            '            .ots-search-close {',
            '                position: absolute;',
            '                z-index: 4;',
            '                top: 18px;',
            '                right: 18px;',
            '                width: 42px;',
            '                height: 42px;',
            '                display: inline-flex;',
            '                align-items: center;',
            '                justify-content: center;',
            '                color: #0f184e;',
            '                font-size: 25px;',
            '                line-height: 1;',
            '                cursor: pointer;',
            '                border: 1px solid rgba(15,24,78,.12);',
            '                border-radius: 999px;',
            '                background: rgba(255,255,255,.92);',
            '                box-shadow: 0 12px 25px rgba(0,0,0,.10);',
            '                transition: transform .2s ease, background .2s ease;',
            '            }',
            '',
            '            .ots-search-close:hover {',
            '                background: #fff;',
            '                transform: rotate(90deg);',
            '            }',
            '',
            '            @keyframes otsSearchFade {',
            '                from { opacity: 0; }',
            '                to { opacity: 1; }',
            '            }',
            '',
            '            @keyframes otsSearchIn {',
            '                from { opacity: 0; transform: translateY(18px) scale(.98); }',
            '                to { opacity: 1; transform: translateY(0) scale(1); }',
            '            }',
            '',
            '            @media (max-width: 820px) {',
            '                #otsSearchModal {',
            '                    padding: 10px;',
            '                    align-items: flex-start;',
            '                    overflow-y: auto;',
            '                    min-height: 100dvh;',
            '                }',
            '',
            '                .ots-search-dialog {',
            '                    grid-template-columns: 1fr;',
            '                    max-height: none;',
            '                    width: 100%;',
            '                    margin: 10px 0;',
            '                    border-radius: 22px;',
            '                }',
            '',
            '                .ots-search-content {',
            '                    padding: 32px 18px 24px;',
            '                }',
            '',
            '                .ots-search-title {',
            '                    font-size: 31px;',
            '                    letter-spacing: -.045em;',
            '                }',
            '',
            '                .ots-search-copy {',
            '                    margin: 12px 0 20px;',
            '                    font-size: 13px;',
            '                }',
            '',
            '                #otsSearchModal #divArama {',
            '                    grid-template-columns: 1fr;',
            '                    gap: 9px;',
            '                    padding: 8px !important;',
            '                }',
            '',
            '                #otsSearchModal #txtbxArama,',
            '                #otsSearchModal #btnKelimeAra {',
            '                    height: 50px !important;',
            '                }',
            '',
            '                #otsSearchModal #txtbxArama {',
            '                    font-size: 15px !important;',
            '                    padding: 0 15px !important;',
            '                }',
            '',
            '                #otsSearchModal #btnKelimeAra {',
            '                    width: 100% !important;',
            '                }',
            '',
            '                .ots-search-visual {',
            '                    min-height: 170px;',
            '                    order: -1;',
            '                    padding: 22px;',
            '                }',
            '',
            '                .ots-search-art {',
            '                    width: 190px;',
            '                }',
            '',
            '                .ots-search-chip-list {',
            '                    gap: 7px;',
            '                }',
            '',
            '                .ots-search-chip {',
            '                    min-height: 32px;',
            '                    padding: 0 11px;',
            '                    font-size: 11px;',
            '                }',
            '',
            '                .ots-search-results.is-active {',
            '                    grid-template-columns: 1fr;',
            '                    margin-top: 18px;',
            '                    border-radius: 16px;',
            '                }',
            '',
            '                .ots-search-results-sidebar {',
            '                    padding: 18px;',
            '                    border-right: 0;',
            '                    border-bottom: 1px solid #e8ecf4;',
            '                }',
            '',
            '                .ots-search-category-list {',
            '                    display: flex;',
            '                    overflow-x: auto;',
            '                    gap: 8px;',
            '                    padding-bottom: 4px;',
            '                }',
            '',
            '                .ots-search-category-link {',
            '                    max-width: 190px;',
            '                    padding: 8px 11px;',
            '                    border: 1px solid #dfe4ee;',
            '                    border-radius: 999px;',
            '                    background: #fff;',
            '                    white-space: nowrap;',
            '                }',
            '',
            '                .ots-search-results-main {',
            '                    padding: 18px;',
            '                }',
            '',
            '                .ots-search-results-head {',
            '                    align-items: flex-start;',
            '                    flex-direction: column;',
            '                    gap: 8px;',
            '                }',
            '',
            '                .ots-search-product-grid {',
            '                    grid-template-columns: 1fr;',
            '                    gap: 10px;',
            '                }',
            '',
            '                .ots-search-product-card a {',
            '                    grid-template-columns: 96px minmax(0, 1fr);',
            '                    min-height: 104px;',
            '                }',
            '',
            '                .ots-search-product-image {',
            '                    width: 96px;',
            '                    height: 104px;',
            '                }',
            '',
            '                .ots-search-product-info {',
            '                    padding: 13px 12px;',
            '                }',
            '',
            '                .ots-search-product-name {',
            '                    font-size: 13px;',
            '                }',
            '',
            '                .ots-search-close {',
            '                    top: 12px;',
            '                    right: 12px;',
            '                }',
            '            }',
            '',
            '            @media (prefers-reduced-motion: reduce) {',
            '                #otsSearchModal,',
            '                #otsSearchModal * {',
            '                    animation: none !important;',
            '                    transition-duration: .01ms !important;',
            '                }',
            '            }',
            '        '
        ].join("\n")
            .replace(/\$\{OPEN_CLASS\}/g, OPEN_CLASS)
            .replace(/\$\{MODAL_ID\}/g, MODAL_ID)
            .replace(/\$\{SEARCH_SLOT_ID\}/g, SEARCH_SLOT_ID);
        document.head.appendChild(style);
    }

    function buildModal() {
        if (document.getElementById(MODAL_ID)) return document.getElementById(MODAL_ID);

        var chips = quickSearches.map(function (item) {
            return '<li><button class="ots-search-chip" type="button" data-search="' + item + '">' + item + '</button></li>';
        }).join('');

        var modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = [
            '<div class="ots-search-backdrop" data-ots-search-close></div>',
            '<section class="ots-search-dialog" role="dialog" aria-modal="true" aria-labelledby="otsSearchTitle">',
            '<button class="ots-search-close" type="button" aria-label="Arama penceresini kapat" data-ots-search-close>×</button>',
            '<div class="ots-search-content">',
            '<p class="ots-search-kicker">ÖTS / Hızlı arama</p>',
            '<h2 class="ots-search-title" id="otsSearchTitle">Aradığın ürüne daha hızlı ulaş.</h2>',
            '<p class="ots-search-copy">Ürün adı, kategori veya koleksiyon yazarak arama yapabilirsin. Sık aranan kelimelerle tek tıkla başlayabilirsin.</p>',
            '<div id="' + SEARCH_SLOT_ID + '"></div>',
            '<div class="ots-search-suggestions">',
            '<p class="ots-search-suggestions-title">Popüler aramalar</p>',
            '<ul class="ots-search-chip-list">' + chips + '</ul>',
            '</div>',
            '<div class="ots-search-results" id="' + RESULTS_ID + '" aria-live="polite"></div>',
            '</div>',
            '<aside class="ots-search-visual" aria-hidden="true">',
            '<svg class="ots-search-art" viewBox="0 0 520 520" fill="none" xmlns="http://www.w3.org/2000/svg">',
            '<circle cx="233" cy="222" r="118" stroke="currentColor" stroke-width="18"/>',
            '<path d="M318 307l91 91" stroke="currentColor" stroke-width="24" stroke-linecap="round"/>',
            '<path d="M155 205c18-50 63-79 112-73" stroke="currentColor" stroke-width="8" stroke-linecap="round" opacity=".55"/>',
            '<path d="M118 382c74-38 153-43 238-13M96 414c102-37 211-36 327 3" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".22"/>',
            '<circle cx="390" cy="112" r="32" stroke="currentColor" stroke-width="6" opacity=".32"/>',
            '<circle cx="113" cy="116" r="15" fill="currentColor" opacity=".24"/>',
            '<path d="M408 196c19 6 34 20 41 39M78 273c-13-20-17-43-12-66" stroke="currentColor" stroke-width="6" stroke-linecap="round" opacity=".28"/>',
            '</svg>',
            '</aside>',
            '</section>'
        ].join('');

        document.body.appendChild(modal);
        return modal;
    }

    function prepareSearchForm(modal) {
        var source = document.getElementById('divArama');
        var slot = document.getElementById(SEARCH_SLOT_ID);

        if (!source || !slot) return !!source;

        if (slot.contains(source)) {
            bindSearchInput();
            return true;
        }

        source.setAttribute('data-ots-search-modal-source', 'true');
        source.classList.add('ots-search-native-form');
        slot.appendChild(source);

        var input = document.getElementById('txtbxArama');
        var button = document.getElementById('btnKelimeAra');

        if (input) {
            input.setAttribute('tabindex', '0');
            input.setAttribute('placeholder', 'Ne aramıştın?');
        }

        if (button && !button.value) {
            button.value = 'Ara';
        }

        bindSearchInput();
        return true;
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[char];
        });
    }

    function normalizeUrl(url) {
        if (!url) return '#';
        if (/^https?:\/\//i.test(url)) return url;
        return url.charAt(0) === '/' ? url : '/' + url;
    }

    function getResultsEl() {
        return document.getElementById(RESULTS_ID);
    }

    function setSuggestionsMuted(isMuted) {
        var suggestions = document.querySelector('#' + MODAL_ID + ' .ots-search-suggestions');
        if (suggestions) suggestions.classList.toggle('is-muted', !!isMuted);
    }

    function categoryUrl(category, keyword) {
        var raw = category && (category.url || category.Url || category.link || category.Link);
        if (raw) return normalizeUrl(raw);
        return '/Arama?1&kelime=' + encodeURIComponent(keyword || '');
    }

    function productCategory(product, keyword) {
        var category = product.categoryName || product.CategoryName;
        var name = product.productName || product.name || product.Name || '';
        var lowered = name.toLocaleLowerCase('tr-TR');

        if (category) return category;
        if (lowered.indexOf('bebek') > -1) return 'Bebek / Çocuk İç Giyim';
        if (lowered.indexOf('erkek çocuk') > -1) return 'Erkek Çocuk İç Giyim';
        if (lowered.indexOf('kız çocuk') > -1 || lowered.indexOf('kiz çocuk') > -1) return 'Kız Çocuk İç Giyim';
        if (lowered.indexOf('erkek') > -1) return 'Erkek İç Giyim';
        if (lowered.indexOf('kadın') > -1 || lowered.indexOf('kadin') > -1) return 'Kadın İç Giyim';
        if (lowered.indexOf('pijama') > -1) return 'Pijama';
        if (lowered.indexOf('atlet') > -1) return 'Atlet';
        if (lowered.indexOf('boxer') > -1) return 'Boxer';

        return keyword || 'Ürün';
    }

    function fallbackCategories(products, keyword) {
        var seen = {};
        var list = [];

        (products || []).forEach(function (product) {
            var name = product.categoryName || product.CategoryName;
            if (!name || seen[name]) return;
            seen[name] = true;
            list.push({ name: name });
        });

        if (!list.length && keyword) {
            quickSearches.forEach(function (item) {
                // Yalnızca aramayla eşleşen hızlı aramalar kategori olarak önerilir;
                // aksi halde "sonuç bulunamadı" mesajı hiç gösterilemiyordu.
                if (item.toLocaleLowerCase('tr-TR').indexOf(keyword.toLocaleLowerCase('tr-TR')) > -1) {
                    list.push({ name: item });
                }
            });
        }

        return list.slice(0, 10);
    }

    function normalizeCategories(data, products, keyword) {
        var rawCategories = data && data.categories;
        if (!Array.isArray(rawCategories) || !rawCategories.length) {
            return fallbackCategories(products, keyword);
        }

        return rawCategories.map(function (category) {
            if (typeof category === 'string') return { name: category };
            return {
                name: category.categoryName || category.name || category.Name || category.text || category.Text || '',
                url: category.url || category.Url || category.link || category.Link || ''
            };
        }).filter(function (category) {
            return category.name;
        }).slice(0, 10);
    }

    function renderSearchState(message) {
        var results = getResultsEl();
        var modal = document.getElementById(MODAL_ID);
        if (!results) return;
        if (modal) modal.classList.add('has-results');
        results.classList.add('is-active');
        setSuggestionsMuted(true);
        results.innerHTML = '<div class="ots-search-state">' + escapeHtml(message) + '</div>';
    }

    function renderApiResults(data, keyword) {
        var results = getResultsEl();
        var modal = document.getElementById(MODAL_ID);
        if (!results) return;
        if (modal) modal.classList.add('has-results');

        var products = Array.isArray(data && data.products) ? data.products.slice(0, 10) : [];
        var categories = normalizeCategories(data, products, keyword);
        var allUrl = '/Arama?1&kelime=' + encodeURIComponent(keyword);

        if (!products.length && !categories.length) {
            renderSearchState('“' + keyword + '” için sonuç bulunamadı. Farklı bir kelime deneyebilirsiniz.');
            return;
        }

        var categoryItems = categories.map(function (category) {
            return '<li><a class="ots-search-category-link" href="' + escapeHtml(categoryUrl(category, keyword)) + '">' + escapeHtml(category.name) + '</a></li>';
        }).join('');

        if (!categoryItems) {
            categoryItems = '<li><a class="ots-search-category-link" href="' + escapeHtml(allUrl) + '">' + escapeHtml(keyword) + ' araması</a></li>';
        }

        var productItems = products.map(function (product) {
            var name = product.productName || product.name || product.Name || '';
            var price = product.price || '';
            var oldPrice = product.oldPrice && product.oldPrice !== product.price ? product.oldPrice : '';
            var image = product.image || product.ImagePath || '';
            var url = normalizeUrl(product.url || product.Url);
            var category = productCategory(product, keyword);

            return [
                '<li class="ots-search-product-card">',
                '<a href="' + escapeHtml(url) + '">',
                '<div class="ots-search-product-image">',
                '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(name) + '" loading="lazy">',
                '</div>',
                '<div class="ots-search-product-info">',
                '<p class="ots-search-product-category">' + escapeHtml(category) + '</p>',
                '<p class="ots-search-product-name">' + escapeHtml(name) + '</p>',
                '<div class="ots-search-price-row">',
                '<span>' + escapeHtml(price) + '</span>',
                (oldPrice ? '<span class="ots-search-old-price">' + escapeHtml(oldPrice) + '</span>' : ''),
                '</div>',
                '</div>',
                '</a>',
                '</li>'
            ].join('');
        }).join('');

        results.classList.add('is-active');
        setSuggestionsMuted(true);
        results.innerHTML = [
            '<aside class="ots-search-results-sidebar">',
            '<h3 class="ots-search-results-title">Kategoriler</h3>',
            '<ul class="ots-search-category-list">' + categoryItems + '</ul>',
            '</aside>',
            '<div class="ots-search-results-main">',
            '<div class="ots-search-results-head">',
            '<h3 class="ots-search-results-heading">' + escapeHtml(keyword) + ' için öne çıkan ürünler</h3>',
            '<a class="ots-search-all-link" href="' + escapeHtml(allUrl) + '">Tümünü gör</a>',
            '</div>',
            '<ul class="ots-search-product-grid">' + productItems + '</ul>',
            '</div>'
        ].join('');
    }

    function clearApiResults() {
        var results = getResultsEl();
        var modal = document.getElementById(MODAL_ID);
        if (!results) return;
        if (modal) modal.classList.remove('has-results');
        results.classList.remove('is-active');
        results.innerHTML = '';
        setSuggestionsMuted(false);
    }

    function fetchApiResults(keyword) {
        if (!window.fetch) return;

        if (searchAbortController && typeof searchAbortController.abort === 'function') {
            searchAbortController.abort();
        }

        searchAbortController = window.AbortController ? new AbortController() : null;
        renderSearchState('Sonuçlar yükleniyor...');

        fetch(API_URL + encodeURIComponent(keyword), {
            signal: searchAbortController ? searchAbortController.signal : undefined,
            credentials: 'same-origin'
        })
            .then(function (response) {
                if (!response.ok) throw new Error('Arama servisi yanıt vermedi');
                return response.json();
            })
            .then(function (data) {
                renderApiResults(data || {}, keyword);
            })
            .catch(function (error) {
                if (error && error.name === 'AbortError') return;
                renderSearchState('Sonuçlar şu anda yüklenemedi. Aramayı tamamlamak için “Ara” butonunu kullanabilirsiniz.');
            });
    }

    function scheduleApiSearch() {
        var input = document.getElementById('txtbxArama');
        if (!input) return;

        transformNativeAutocompleteResults();
        hideNativeAutocompleteResults();

        var keyword = (input.value || '').trim();
        window.clearTimeout(searchTimer);

        if (keyword.length < 2) {
            lastKeyword = '';
            clearApiResults();
            return;
        }

        searchTimer = window.setTimeout(function () {
            if (keyword === lastKeyword) return;
            lastKeyword = keyword;
            fetchApiResults(keyword);
        }, 260);
    }

    function bindSearchInput() {
        var input = document.getElementById('txtbxArama');
        if (!input || input.getAttribute('data-ots-api-search-bound') === 'true') return;

        input.setAttribute('data-ots-api-search-bound', 'true');
        input.addEventListener('input', scheduleApiSearch, true);
        input.addEventListener('keyup', scheduleApiSearch, true);
        input.addEventListener('keydown', hideNativeAutocompleteResults, true);
    }

    function openModal() {
        cleanLeakedCampaignCssText();
        var nativeMobileSearch = document.getElementById('divTopProductSearch');
        if (nativeMobileSearch) {
            nativeMobileSearch.classList.remove('active');
        }

        injectStyles();
        var modal = buildModal();

        if (!prepareSearchForm(modal)) return;

        modal.classList.add('is-active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add(OPEN_CLASS);
        hideNativeAutocompleteResults();
        watchNativeAutocompleteResults();

        window.setTimeout(function () {
            var input = document.getElementById('txtbxArama');
            if (input) {
                input.focus();
                if (typeof input.select === 'function') input.select();
                scheduleApiSearch();
            }
            transformNativeAutocompleteResults();
            hideNativeAutocompleteResults();
        }, 80);
    }

    function closeModal() {
        var modal = document.getElementById(MODAL_ID);
        var nativeMobileSearch = document.getElementById('divTopProductSearch');
        if (!modal) return;

        window.clearTimeout(searchTimer);
        if (searchAbortController && typeof searchAbortController.abort === 'function') {
            searchAbortController.abort();
        }
        stopWatchingNativeAutocompleteResults();
        clearApiResults();
        // Sonuçlar temizlendiği için modal yeniden açıldığında aynı kelime tekrar aranır.
        lastKeyword = '';

        modal.classList.remove('is-active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove(OPEN_CLASS);

        if (nativeMobileSearch) {
            nativeMobileSearch.classList.remove('active');
        }
    }

    function runSearch(term) {
        var input = document.getElementById('txtbxArama');
        var button = document.getElementById('btnKelimeAra');

        if (input && term) {
            input.value = term;
            input.focus();
        }

        window.setTimeout(function () {
            if (typeof window.ProductSearchTop === 'function') {
                window.ProductSearchTop();
            } else if (button) {
                button.click();
            }
        }, 60);
    }

    function bindEvents() {
        if (document.body.classList.contains(READY_CLASS)) return;
        document.body.classList.add(READY_CLASS);

        document.addEventListener('click', function (event) {
            var trigger = event.target.closest('.aramaButonu, .searchClick');
            var closeTrigger = event.target.closest('[data-ots-search-close]');
            var chip = event.target.closest('.ots-search-chip');

            if (trigger) {
                event.preventDefault();
                event.stopPropagation();
                if (typeof event.stopImmediatePropagation === 'function') {
                    event.stopImmediatePropagation();
                }
                openModal();
                return;
            }

            if (closeTrigger) {
                event.preventDefault();
                closeModal();
                return;
            }

            if (chip) {
                event.preventDefault();
                runSearch(chip.getAttribute('data-search'));
            }
        }, true);

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeModal();
        });

        // Tüm sayfa metnini tarayan temizlik, boyutlandırma bitince bir kez çalışır.
        var cleanupTimer = null;
        var scheduleCleanup = function () {
            window.clearTimeout(cleanupTimer);
            cleanupTimer = window.setTimeout(cleanLeakedCampaignCssText, 250);
        };
        window.addEventListener('resize', scheduleCleanup, { passive: true });
        window.addEventListener('orientationchange', scheduleCleanup);
    }

    function init() {
        cleanLeakedCampaignCssText();
        injectStyles();
        buildModal();
        bindEvents();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
/* ========================================================================
 * BÖLÜM 8: WHATSAPP İLETİŞİM BUTONU
 *
 * Mevcut WhatsApp bağlantısını kurumsal sabit iletişim butonuna dönüştürür.
 * Sayfada uygun bağlantı yoksa tanımlı destek numarasıyla yedek buton oluşturur.
 * ====================================================================== */
(function () {
    'use strict';

    var STYLE_ID = 'otsWhatsappModernStyles';
    var READY_CLASS = 'ots-whatsapp-modern';
    var FALLBACK_ID = 'otsWhatsappModernFallback';
    var DEFAULT_WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=902163135687&text=Merhaba!';
    var renderTimer = null;
    var lastCleanupAt = 0;

    function injectStyles() {
        var style = document.getElementById(STYLE_ID);
        if (!style) {
            style = document.createElement('style');
            style.id = STYLE_ID;
            document.head.appendChild(style);
        }

        var css = [
            '.' + READY_CLASS + ', .' + READY_CLASS + ' * { box-sizing: border-box; }',
            '.' + READY_CLASS + ' {',
            '  position: fixed !important;',
            '  left: 11px !important;',
            '  right: auto !important;',
            '  bottom: 15% !important;',
            '  z-index: 2147482400 !important;',
            '  width: 62px !important;',
            '  height: 62px !important;',
            '  min-width: 62px !important;',
            '  min-height: 62px !important;',
            '  display: inline-flex !important;',
            '  visibility: visible !important;',
            '  opacity: 1 !important;',
            '  align-items: center !important;',
            '  justify-content: center !important;',
            '  text-align: center !important;',
            '  margin: 0 !important;',
            '  padding: 0 !important;',
            '  color: #fff !important;',
            '  text-decoration: none !important;',
            '  border: 2px solid rgba(255,255,255,.78) !important;',
            '  border-radius: 999px !important;',
            '  background: linear-gradient(135deg, #22d566 0%, #12a84f 100%) !important;',
            '  box-shadow: 0 16px 38px rgba(18,168,79,.28), 0 8px 22px rgba(5,11,42,.14) !important;',
            '  transform: translateZ(0);',
            '  isolation: isolate;',
            '  overflow: visible !important;',
            '  cursor: pointer !important;',
            '  transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;',
            '  animation: otsWhatsappFloat 3.2s ease-in-out infinite;',
            '}',
            '.' + READY_CLASS + '::before {',
            '  content: "";',
            '  position: absolute;',
            '  inset: -8px;',
            '  z-index: -1;',
            '  border-radius: inherit;',
            '  background: rgba(34,213,102,.2);',
            '  animation: otsWhatsappPulse 2.4s ease-out infinite;',
            '}',
            '.' + READY_CLASS + '::after {',
            '  content: "WhatsApp";',
            '  position: absolute;',
            '  left: calc(100% + 10px);',
            '  top: 50%;',
            '  padding: 9px 12px;',
            '  color: #0c154c;',
            '  font: 800 12px Arial, Helvetica, sans-serif;',
            '  line-height: 1;',
            '  white-space: nowrap;',
            '  border: 1px solid rgba(12,21,76,.1);',
            '  border-radius: 999px;',
            '  background: rgba(255,255,255,.96);',
            '  box-shadow: 0 10px 26px rgba(5,11,42,.16);',
            '  opacity: 0;',
            '  pointer-events: none;',
            '  transform: translate(-8px, -50%);',
            '  transition: opacity .18s ease, transform .18s ease;',
            '}',
            '.' + READY_CLASS + ':hover {',
            '  transform: translateY(-2px) scale(1.035);',
            '  filter: saturate(1.05);',
            '  box-shadow: 0 20px 46px rgba(18,168,79,.34), 0 10px 28px rgba(5,11,42,.18) !important;',
            '}',
            '.' + READY_CLASS + ':hover::after { opacity: 1; transform: translate(0, -50%); }',
            '.' + READY_CLASS + ' i,',
            '.' + READY_CLASS + ' svg {',
            '  position: relative !important;',
            '  z-index: 1 !important;',
            '  width: 31px !important;',
            '  height: 31px !important;',
            '  display: inline-flex !important;',
            '  align-items: center !important;',
            '  justify-content: center !important;',
            '  color: #fff !important;',
            '  font-size: 31px !important;',
            '  line-height: 1 !important;',
            '  margin: 0 !important;',
            '  padding: 0 !important;',
            '  transform: none !important;',
            '}',
            '.' + READY_CLASS + ' i::before {',
            '  display: block !important;',
            '  width: 1em !important;',
            '  height: 1em !important;',
            '  line-height: 1 !important;',
            '  margin: 0 !important;',
            '}',
            '.' + READY_CLASS + ' img {',
            '  position: relative;',
            '  z-index: 1;',
            '  width: 31px !important;',
            '  height: 31px !important;',
            '  object-fit: contain !important;',
            '}',
            '.' + READY_CLASS + ' label,',
            '.' + READY_CLASS + ' span:not(.ots-whatsapp-icon) { display: none !important; }',
            '.' + READY_CLASS + '.ots-whatsapp-empty::before {',
            '  background: rgba(34,213,102,.2);',
            '}',
            '.' + READY_CLASS + '.ots-whatsapp-empty .ots-whatsapp-icon {',
            '  position: relative;',
            '  z-index: 1;',
            '  width: 31px;',
            '  height: 31px;',
            '  display: inline-flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  color: #fff;',
            '}',
            '.' + READY_CLASS + '.ots-whatsapp-empty .ots-whatsapp-icon svg { width: 31px !important; height: 31px !important; }',
            '@keyframes otsWhatsappPulse {',
            '  0% { opacity: .65; transform: scale(.82); }',
            '  70%, 100% { opacity: 0; transform: scale(1.18); }',
            '}',
            '@keyframes otsWhatsappFloat {',
            '  0%, 100% { margin-bottom: 0; }',
            '  50% { margin-bottom: 4px; }',
            '}',
            '@media (max-width: 768px) {',
            '  html body .' + READY_CLASS + ' {',
            '    display: inline-flex !important;',
            '    visibility: visible !important;',
            '    opacity: 1 !important;',
            '    pointer-events: auto !important;',
            '  }',
            '  .' + READY_CLASS + ' {',
            '    left: 11px !important;',
            '    bottom: 15% !important;',
            '    width: 56px !important;',
            '    height: 56px !important;',
            '    min-width: 56px !important;',
            '    min-height: 56px !important;',
            '  }',
            '  .' + READY_CLASS + '::after { display: none !important; }',
            '  .' + READY_CLASS + ' i,',
            '  .' + READY_CLASS + ' svg,',
            '  .' + READY_CLASS + ' img,',
            '  .' + READY_CLASS + '.ots-whatsapp-empty .ots-whatsapp-icon,',
            '  .' + READY_CLASS + '.ots-whatsapp-empty .ots-whatsapp-icon svg {',
            '    width: 28px !important;',
            '    height: 28px !important;',
            '    font-size: 28px !important;',
            '  }',
            '}',
            '@media (prefers-reduced-motion: reduce) {',
            '  .' + READY_CLASS + ', .' + READY_CLASS + '::before { animation: none !important; }',
            '  .' + READY_CLASS + ' { transition-duration: .01ms !important; }',
            '}'
        ].join('\n');
        // Aynı CSS'i yeniden yazmak tüm sayfanın stilini yeniden hesaplatır.
        if (style.textContent !== css) style.textContent = css;
    }

    function isWhatsappElement(element) {
        if (!element || element.nodeType !== 1) return false;

        var tagName = (element.tagName || '').toLowerCase();
        var href = element.getAttribute('href') || '';
        var onclick = element.getAttribute('onclick') || '';
        var className = element.className || '';
        var id = element.id || '';
        var isClickable = tagName === 'a' || tagName === 'button' || Boolean(href || onclick);

        if (!isClickable) return false;

        return /\bwhatsBtn\b|whatsapp|whatsap|watsapp/i.test(className + ' ' + id + ' ' + onclick + ' ' + href) ||
            /wa\.me|api\.whatsapp\.com|web\.whatsapp\.com/i.test(href);
    }

    function getCandidates() {
        var selectors = [
            '.whatsBtn',
            '.whatsApp',
            '.whatsapp',
            '.whatsapp-button',
            '#divwhatsap',
            '.UWhatsApp',
            'a.whatsApp',
            'a.whatsapp',
            'a.whatsapp-button',
            'button.whatsApp',
            'button.whatsapp',
            'a[href*="wa.me"]',
            'a[href*="api.whatsapp.com"]',
            'a[href*="web.whatsapp.com"]'
        ];

        return Array.prototype.slice.call(document.querySelectorAll(selectors.join(',')))
            .filter(isWhatsappElement)
            .filter(function (element) {
                // Sayfa içeriğindeki WhatsApp bağlantıları (ürün geri bildirim formu,
                // kampanya sayfası, ürün açıklaması) yerinde kalır; sabit butona çevrilmez.
                return !element.closest('#otsFindSizeButton') &&
                    !element.closest('.ots-product-feedback, .ots-feedback-whatsapp, #otsCampaignPage, .RightDetail, .urunTab, #divUrunAciklama') &&
                    !element.closest('.ots-footer') &&
                    !element.closest('.ots-footer-socials') &&
                    !element.classList.contains('ots-footer-whatsapp') &&
                    element.id !== FALLBACK_ID;
            });
    }

    function createFallback() {
        if (!document.body || document.getElementById(FALLBACK_ID)) return null;

        var link = document.createElement('a');
        link.id = FALLBACK_ID;
        link.href = DEFAULT_WHATSAPP_URL;
        link.target = '_blank';
        link.rel = 'noopener';
        link.setAttribute('aria-label', 'WhatsApp');
        link.className = READY_CLASS + ' ots-whatsapp-empty';
        link.innerHTML = [
            '<span class="ots-whatsapp-icon" aria-hidden="true">',
            '  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">',
            '    <path d="M16 4.5A11.2 11.2 0 0 0 6.4 21.6L5 27l5.6-1.35A11.2 11.2 0 1 0 16 4.5Z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>',
            '    <path d="M12.1 11.4c.25-.55.5-.56.74-.56h.62c.2 0 .47.08.72.37.25.3.95 1.04.95 2.02 0 .98-.72 1.93-.82 2.06-.1.13-.18.28-.04.5.14.22.62 1.02 1.34 1.66.92.82 1.7 1.08 1.95 1.2.25.12.4.1.55-.06.15-.17.64-.75.81-1 .17-.25.34-.21.57-.13.23.08 1.48.7 1.73.83.25.12.42.19.48.29.06.1.06.58-.14 1.14-.2.56-1.16 1.1-1.62 1.17-.42.06-.95.09-1.53-.1-.35-.11-.8-.26-1.38-.51-2.42-1.05-4-3.5-4.12-3.66-.12-.16-.98-1.3-.98-2.49 0-1.18.62-1.76.84-2Z" fill="currentColor"/>',
            '  </svg>',
            '</span>'
        ].join('');

        document.body.appendChild(link);
        return link;
    }

    function ensureIcon(element) {
        var hasVisibleIcon = element.querySelector('i, svg, img');
        if (hasVisibleIcon) return;

        element.classList.add('ots-whatsapp-empty');
        element.insertAdjacentHTML('afterbegin', [
            '<span class="ots-whatsapp-icon" aria-hidden="true">',
            '  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">',
            '    <path d="M16 4.5A11.2 11.2 0 0 0 6.4 21.6L5 27l5.6-1.35A11.2 11.2 0 1 0 16 4.5Z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>',
            '    <path d="M12.1 11.4c.25-.55.5-.56.74-.56h.62c.2 0 .47.08.72.37.25.3.95 1.04.95 2.02 0 .98-.72 1.93-.82 2.06-.1.13-.18.28-.04.5.14.22.62 1.02 1.34 1.66.92.82 1.7 1.08 1.95 1.2.25.12.4.1.55-.06.15-.17.64-.75.81-1 .17-.25.34-.21.57-.13.23.08 1.48.7 1.73.83.25.12.42.19.48.29.06.1.06.58-.14 1.14-.2.56-1.16 1.1-1.62 1.17-.42.06-.95.09-1.53-.1-.35-.11-.8-.26-1.38-.51-2.42-1.05-4-3.5-4.12-3.66-.12-.16-.98-1.3-.98-2.49 0-1.18.62-1.76.84-2Z" fill="currentColor"/>',
            '  </svg>',
            '</span>'
        ].join(''));
    }

    function modernize(element) {
        if (!element) return;

        ensureIcon(element);
        element.classList.add(READY_CLASS);
        element.setAttribute('aria-label', element.getAttribute('aria-label') || 'WhatsApp');

        if (document.body && element.parentNode !== document.body && !element.closest('.ots-footer')) {
            document.body.appendChild(element);
        }

        element.style.removeProperty('display');
        element.style.removeProperty('left');
        element.style.removeProperty('right');
        element.style.removeProperty('bottom');
        element.style.removeProperty('top');
        element.style.removeProperty('opacity');
        element.style.removeProperty('visibility');
    }

    function render() {
        injectStyles();
        var now = Date.now();
        if (now - lastCleanupAt > 2000) {
            cleanupLeakedCssText();
            lastCleanupAt = now;
        }
        var candidates = getCandidates();

        if (!candidates.length) {
            createFallback();
            return;
        }

        candidates.forEach(modernize);

        var fallback = document.getElementById(FALLBACK_ID);
        if (fallback) fallback.parentNode.removeChild(fallback);
    }

    function cleanupLeakedCssText() {
        if (!document.body || !document.createTreeWalker) return;

        var filter = window.NodeFilter || { SHOW_TEXT: 4 };
        var walker = document.createTreeWalker(document.body, filter.SHOW_TEXT);
        var leaked = [];

        while (walker.nextNode()) {
            var node = walker.currentNode;
            var text = node.nodeValue || '';

            if (
                text.indexOf('ots-whatsapp-modern') !== -1 ||
                text.indexOf('otsWhatsappFloat') !== -1 ||
                text.indexOf('otsWhatsappPulse') !== -1
            ) {
                leaked.push(node);
            }
        }

        leaked.forEach(function (node) {
            if (node.parentNode) node.parentNode.removeChild(node);
        });
    }

    function scheduleRender() {
        clearTimeout(renderTimer);
        renderTimer = setTimeout(render, 120);
    }

    function observePage() {
        if (!window.MutationObserver || !document.body) return;

        var observer = new MutationObserver(scheduleRender);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        [0, 300, 900, 1800, 3000].forEach(function (delay) {
            setTimeout(render, delay);
        });
        observePage();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());

/* ========================================================================
 * BÖLÜM 9: YAPAY ZEKÂ GÖRSEL BİLGİSİ
 *
 * Yapay zekâ ile oluşturulan ürün görsellerine sade bir bilgilendirme etiketi ekler.
 * Yeni yüklenen veya sonradan eklenen ürün kartlarını otomatik olarak izler.
 *
 * NOT: Şimdilik devre dışı; ileride yeniden etkinleştirilecek.
 * ====================================================================== */
/*
(function () {
    'use strict';

    var STYLE_ID = 'otsAiVisualBadgeStyles';
    var BADGE_CLASS = 'ots-ai-visual-badge';
    var ANCHOR_CLASS = 'ots-ai-visual-anchor';
    var renderTimer = null;

    function injectStyles() {
        var style = document.getElementById(STYLE_ID);
        if (!style) {
            style = document.createElement('style');
            style.id = STYLE_ID;
            document.head.appendChild(style);
        }

        var css = [
            '.' + ANCHOR_CLASS + ' {',
            '  position: relative !important;',
            '  display: block !important;',
            '}',
            '.' + BADGE_CLASS + ' {',
            '  position: absolute !important;',
            '  right: 8px !important;',
            '  bottom: 8px !important;',
            '  z-index: 999999 !important;',
            '  display: inline-block !important;',
            '  color: #8c919a !important;',
            '  font-family: Arial, Helvetica, sans-serif !important;',
            '  font-size: 11px !important;',
            '  font-weight: 500 !important;',
            '  line-height: 1 !important;',
            '  letter-spacing: .01em !important;',
            '  white-space: nowrap !important;',
            '  pointer-events: none !important;',
            '  background: transparent !important;',
            '  border: none !important;',
            '  opacity: 0.9 !important;',
            '  text-shadow: none !important;',
            '}',
            '@media (max-width: 768px) {',
            '  .' + BADGE_CLASS + ' {',
            '    right: 5px !important;',
            '    bottom: 5px !important;',
            '    font-size: 10px !important;',
            '  }',
            '}'
        ].join('\n');
        // Aynı CSS'i yeniden yazmak tüm sayfanın stilini yeniden hesaplatır.
        if (style.textContent !== css) style.textContent = css;
    }

    function createBadge() {
        var badge = document.createElement('span');
        badge.className = BADGE_CLASS;
        badge.textContent = '* AI Görsel';
        return badge;
    }

    function render() {
        injectStyles();

        var productImgs = document.querySelectorAll(
            'img[src*="/UrunResimleri/"], ' +
            'img[data-original*="/UrunResimleri/"], ' +
            'img.resimOrginal, ' +
            '#imgUrunResim, ' +
            '.productImage img, ' +
            '.leftImage img'
        );

        productImgs.forEach(function (img) {
            // Küçük ikonlar ve ilk koddaki varyant alanları hariç tutuluyor
            if (img.closest('.AltUrunImages, .smallImages, .productIcon, .mycartIcon, .favori, .variant-strip, .variant-thumb')) {
                return;
            }

            var parent = img.parentElement;
            if (!parent) return;

            parent.classList.add(ANCHOR_CLASS);

            if (!parent.querySelector('.' + BADGE_CLASS)) {
                parent.appendChild(createBadge());
            }
        });

        return true;
    }

    function scheduleRender() {
        clearTimeout(renderTimer);
        renderTimer = setTimeout(render, 100);
    }

    function observePage() {
        if (!window.MutationObserver || !document.body) return;

        var observer = new MutationObserver(function (mutations) {
            var shouldRender = false;
            for (var i = 0; i < mutations.length; i += 1) {
                var target = mutations[i].target;
                if (target && target.closest && target.closest('.' + BADGE_CLASS)) continue;
                shouldRender = true;
                break;
            }
            if (shouldRender) scheduleRender();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        [0, 100, 300, 600, 1200, 2500].forEach(function (delay) {
            setTimeout(render, delay);
        });
        observePage();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
*/

/* ========================================================================
 * BÖLÜM 10: SAYFA BAŞINA DÖN BUTONU
 *
 * Sayfa kaydırıldığında görünen erişilebilir bir yukarı dönme butonu sağlar.
 * Tıklamada sayfayı yumuşak geçişle en üste taşır ve mobil konumu düzenler.
 * ====================================================================== */
(function () {
    'use strict';

    var STYLE_ID = 'otsBackToTopStyles';
    var READY_CLASS = 'ots-back-to-top-ready';
    var VISIBLE_CLASS = 'is-visible';
    var TARGET_ID = 'back-to-top';

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '#back-to-top, #back-to-top * { box-sizing: border-box; }',
            '#back-to-top {',
            '  position: fixed !important;',
            '  right: 22px !important;',
            '  bottom: 100px !important;',
            '  z-index: 2147482300 !important;',
            '  width: 54px !important;',
            '  height: 54px !important;',
            '  margin: 0 !important;',
            '  padding: 0 !important;',
            '  display: block !important;',
            '  opacity: 0;',
            '  visibility: hidden;',
            '  pointer-events: none;',
            '  transform: translateY(12px) scale(.92);',
            '  transition: opacity .22s ease, visibility .22s ease, transform .22s ease;',
            '}',
            '#back-to-top.is-visible {',
            '  opacity: 1;',
            '  visibility: visible;',
            '  pointer-events: auto;',
            '  transform: translateY(0) scale(1);',
            '}',
            '#back-to-top a {',
            '  position: relative;',
            '  width: 54px !important;',
            '  height: 54px !important;',
            '  min-width: 54px !important;',
            '  min-height: 54px !important;',
            '  display: inline-flex !important;',
            '  align-items: center !important;',
            '  justify-content: center !important;',
            '  overflow: hidden;',
            '  color: #fff !important;',
            '  text-decoration: none !important;',
            '  border: 1px solid rgba(255,255,255,.7) !important;',
            '  border-radius: 18px !important;',
            '  background:',
            '    radial-gradient(circle at 32% 22%, rgba(255,255,255,.28), transparent 28%),',
            '    linear-gradient(135deg, #0c154c 0%, #172568 100%) !important;',
            '  box-shadow: 0 18px 42px rgba(12,21,76,.22), 0 5px 16px rgba(0,0,0,.08) !important;',
            '  transform: translateZ(0);',
            '  transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;',
            '}',
            '#back-to-top a::before {',
            '  content: "";',
            '  position: absolute;',
            '  inset: 8px;',
            '  border: 1px solid rgba(255,255,255,.16);',
            '  border-radius: 13px;',
            '}',
            '#back-to-top a::after {',
            '  content: "";',
            '  width: 13px;',
            '  height: 13px;',
            '  border-top: 3px solid currentColor;',
            '  border-left: 3px solid currentColor;',
            '  transform: rotate(45deg) translate(2px, 2px);',
            '}',
            '#back-to-top i {',
            '  display: none !important;',
            '}',
            '#back-to-top a:hover {',
            '  filter: brightness(1.06);',
            '  transform: translateY(-3px);',
            '  box-shadow: 0 24px 52px rgba(12,21,76,.28), 0 8px 20px rgba(0,0,0,.1) !important;',
            '}',
            '#back-to-top a:active {',
            '  transform: translateY(-1px) scale(.98);',
            '}',
            '@media (max-width: 768px) {',
            '  html body #back-to-top {',
            '    display: block !important;',
            '    visibility: visible;',
            '  }',
            '  #back-to-top {',
            '    right: 14px !important;',
            '    bottom: calc(210px + env(safe-area-inset-bottom, 0px)) !important;',
            '    width: 48px !important;',
            '    height: 48px !important;',
            '  }',
            '  #back-to-top a {',
            '    width: 48px !important;',
            '    height: 48px !important;',
            '    min-width: 48px !important;',
            '    min-height: 48px !important;',
            '    border-radius: 16px !important;',
            '  }',
            '  #back-to-top a::before {',
            '    inset: 7px;',
            '    border-radius: 12px;',
            '  }',
            '  #back-to-top a::after {',
            '    width: 11px;',
            '    height: 11px;',
            '    border-width: 3px;',
            '  }',
            '}',
            '@media (prefers-reduced-motion: reduce) {',
            '  #back-to-top, #back-to-top a { transition-duration: .01ms !important; }',
            '}'
        ].join('\n');

        document.head.appendChild(style);
    }

    function ensureButton() {
        var button = document.getElementById(TARGET_ID);

        if (!button) {
            button = document.createElement('div');
            button.id = TARGET_ID;
            button.innerHTML = '<a href="#" aria-label="Sayfa başına dön"><i class="fa fa-chevron-circle-up" aria-hidden="true"></i></a>';
            document.body.appendChild(button);
        }

        var link = button.querySelector('a');
        if (!link) {
            link = document.createElement('a');
            link.href = '#';
            link.setAttribute('aria-label', 'Sayfa başına dön');
            link.innerHTML = '<i class="fa fa-chevron-circle-up" aria-hidden="true"></i>';
            button.appendChild(link);
        }

        if (button.parentNode !== document.body) document.body.appendChild(button);

        button.classList.add(READY_CLASS);
        link.setAttribute('aria-label', 'Sayfa başına dön');
        link.setAttribute('title', 'Sayfa başına dön');

        link.addEventListener('click', function (event) {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        return button;
    }

    function syncVisibility(button) {
        if (!button) return;
        button.classList.toggle(VISIBLE_CLASS, window.pageYOffset > 360);
    }

    function init() {
        injectStyles();

        var button = ensureButton();
        var ticking = false;

        syncVisibility(button);

        window.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(function () {
                syncVisibility(button);
                ticking = false;
            });
        }, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());

/* ========================================================================
 * BÖLÜM 11: AÇILIR SEPET MENÜSÜ
 *
 * Başlıktaki sepet ön izlemesini ürün görselleri, adet, fiyat ve toplam alanlarıyla düzenler.
 * Sepet ve alışverişi tamamlama düğmelerini okunabilir, mobil uyumlu biçimde gösterir.
 * ====================================================================== */
(function () {
    'use strict';
    var STYLE_ID = 'otsDropdownCartStyles';
    if (window.otsDropdownCartInit) { window.otsDropdownCartInit(); return; }
    var pending = false;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
.CartProduct.ots-dropdown-cart { box-sizing:border-box!important; width:390px!important; max-width:calc(100vw - 24px)!important; padding:0!important; margin-top:0!important; border:1px solid #e2e7ef!important; border-radius:16px!important; background:#fff!important; color:#0c154c; box-shadow:0 18px 54px rgba(12,21,48,.15)!important; text-align:left!important; font-family:inherit; overflow:hidden; z-index:1001; }
.ots-dropdown-cart * { box-sizing:border-box; }
.ots-dropdown-cart::before,.ots-dropdown-cart::after { display:none!important; }
.ots-dropdown-cart .ots-cart-heading { display:flex; align-items:center; gap:10px; margin:0; padding:19px 20px 17px; border-bottom:1px solid #edf0f5; color:#0c154c; font:inherit; font-size:16px; font-weight:700; letter-spacing:-.3px; }
.ots-cart-heading svg { width:21px; height:21px; flex:none; }
.ots-dropdown-cart .SProduct { width:100%!important; max-height:min(360px,48vh); overflow-y:auto; overscroll-behavior:contain; scrollbar-width:thin; scrollbar-color:#ced8e5 transparent; margin:0!important; padding:0 20px!important; list-style:none; background:transparent!important; }
.ots-dropdown-cart .SProduct > .topCardItem { position:relative; display:block!important; float:none!important; width:100%!important; min-height:108px; padding:16px 28px 16px 0!important; margin:0!important; border:0!important; border-bottom:1px solid #edf0f5!important; background:transparent!important; }
.ots-dropdown-cart .SProduct > .topCardItem:last-child { border-bottom:0!important; }
.ots-dropdown-cart .topCardItem > a:first-child { display:grid!important; grid-template-columns:62px minmax(0,1fr); column-gap:12px; row-gap:5px; float:none!important; width:100%!important; margin:0!important; padding:0!important; color:#0c154c!important; text-decoration:none!important; }
.ots-dropdown-cart .topCardItem > a:first-child > img { grid-column:1; grid-row:1 / span 3; display:block; width:62px!important; height:78px!important; margin:0!important; float:none!important; object-fit:contain; border-radius:8px; background:#f6f8fa; }
.ots-dropdown-cart .SepettopAd { grid-column:2; display:block!important; width:auto!important; margin:0!important; padding:0!important; float:none!important; white-space:normal!important; font-size:12px!important; line-height:1.5!important; color:#0c154c!important; }
.ots-dropdown-cart .SepettopAd > span:first-child { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; font-weight:600; }
.ots-dropdown-cart .SepettopAd > span + span { display:block; margin-top:3px; color:#7a8395; font-size:11px; }
.ots-dropdown-cart .SepetTopAdet { display:inline-flex!important; align-items:baseline!important; gap:5px; white-space:nowrap!important; grid-column:2; width:auto!important; float:none!important; margin:0!important; padding:0!important; color:#536078!important; font-size:14px!important; font-weight:600!important; line-height:1.5!important; text-align:left!important; }
.ots-dropdown-cart .SepetTopAdet::before { position:static!important; display:inline!important; float:none!important; margin:0!important; padding:0!important; font:inherit!important; line-height:inherit!important; vertical-align:baseline!important; }
.ots-dropdown-cart .sepetTopFiyat { grid-column:2; display:block!important; width:auto!important; float:none!important; margin:0!important; padding:0!important; color:#0c154c!important; font-size:13px!important; font-weight:700; text-align:left!important; }
.ots-dropdown-cart .topCardItem > a.ots-cart-remove { position:absolute!important; top:15px!important; right:0!important; display:flex!important; align-items:center; justify-content:center; width:26px!important; height:28px!important; padding:0!important; margin:0!important; border:0!important; border-radius:6px; background:transparent!important; color:#8c95a6!important; cursor:pointer; text-decoration:none; }
.ots-dropdown-cart .ots-cart-remove:hover { background:#fff0f0!important; color:#aa4545!important; }
.ots-dropdown-cart .SPrice { display:flow-root; position:static!important; float:none!important; clear:both!important; height:auto!important; width:100%!important; list-style:none; margin:0!important; padding:17px 20px!important; border-top:1px solid #edf0f5; background:#f8fafc!important; }
.ots-dropdown-cart .SPrice > li { position:static!important; height:auto!important; float:none!important; width:100%!important; margin:0!important; padding:0!important; color:#697386; font-size:12px; line-height:1.8; }
.ots-dropdown-cart .SPrice > li::after { content:""; display:block; clear:both; }
.ots-dropdown-cart .sepetToplamTutar { position:static!important; float:right!important; color:#0c154c!important; font-size:17px!important; font-weight:700; }
.ots-dropdown-cart > a.headerCartBtn,.ots-dropdown-cart > a.headerOrderBtn { display:flex!important; align-items:center; justify-content:center; position:static!important; clear:both!important; float:none!important; width:calc(100% - 40px)!important; min-height:44px; padding:11px 16px!important; margin:12px 20px!important; border:1px solid #dce3ed!important; border-radius:9px!important; color:#0c154c!important; background:white!important; font-family:inherit; font-size:13px!important; line-height:1.5!important; font-weight:600; text-align:center; text-decoration:none!important; }
.ots-dropdown-cart > a.headerOrderBtn { margin-top:8px!important; margin-bottom:20px!important; color:white!important; background:#0c154c!important; border-color:#0c154c!important; }
.ots-dropdown-cart > a.headerCartBtn { margin-top:20px!important; }
.ots-dropdown-cart > a.headerCartBtn:hover { background:#f0f7fb!important; }
.ots-dropdown-cart > a.headerOrderBtn:hover { background:#202d66!important; }
.ots-dropdown-cart .divustSepetteUrunYok { list-style:none; margin:0!important; padding:32px 24px!important; color:#697386; text-align:center; font-size:14px; line-height:1.7; }
.ots-dropdown-cart.ots-cart-is-empty .SPrice,.ots-dropdown-cart.ots-cart-is-empty > a.headerOrderBtn { display:none!important; }
.ots-dropdown-cart a:focus-visible { outline:2px solid #4b9bb7!important; outline-offset:-2px; }
@media(max-width:480px) { .CartProduct.ots-dropdown-cart { width:calc(100vw - 24px)!important; } .ots-dropdown-cart .SProduct { max-height:40vh; } }
`;
        document.head.appendChild(style);
    }
    function refresh() {
        injectStyles();
        document.querySelectorAll('.CartProduct').forEach(function (panel) {
            panel.classList.add('ots-dropdown-cart');
            panel.classList.toggle('ots-cart-is-empty', !!panel.querySelector('.divustSepetteUrunYok') && !panel.querySelector('.topCardItem'));
            if (!panel.querySelector('.ots-cart-heading')) {
                var heading = document.createElement('div');
                heading.className = 'ots-cart-heading';
                heading.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg><span>Sepetim</span>';
                panel.insertBefore(heading, panel.firstChild);
            }
            panel.querySelectorAll('.topCardItem > a[onclick]').forEach(function (link) {
                if (link.classList.contains('ots-cart-remove')) return;
                link.classList.add('ots-cart-remove');
                link.setAttribute('aria-label', 'Ürünü sepetten kaldır');
                link.setAttribute('role', 'button');
                link.setAttribute('tabindex', '0');
                link.addEventListener('keydown', function (event) {
                    if (event.key === ' ' || (event.key === 'Enter' && !link.hasAttribute('href'))) {
                        event.preventDefault(); link.click();
                    }
                });
            });
        });
    }
    function schedule() {
        if (pending) return;
        pending = true;
        (window.requestAnimationFrame || function (callback) {
            return window.setTimeout(callback, 16);
        })(function () { pending = false; refresh(); });
    }
    function init() {
        refresh();
        if (window.MutationObserver) new MutationObserver(function (records) {
            var affectsCart = records.some(function (record) {
                var target = record.target;
                if (target && target.closest && target.closest('.CartProduct')) return true;
                return Array.prototype.some.call(record.addedNodes, function (node) {
                    return node && node.nodeType === 1 && (
                        (node.matches && node.matches('.CartProduct')) ||
                        (node.querySelector && node.querySelector('.CartProduct'))
                    );
                });
            });
            if (affectsCart) schedule();
        }).observe(document.body, { childList: true, subtree: true });
    }
    window.otsDropdownCartInit = schedule;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}());

/* ========================================================================
 * BÖLÜM 12: AÇILIR ÜYE HESABI MENÜSÜ
 *
 * Giriş yapmış kullanıcıların hesap açılır menüsünü kurumsal görünümle düzenler.
 * Siparişler, favoriler, adresler, iadeler ve çıkış bağlantılarının mevcut işlevlerini korur.
 * ====================================================================== */
(function () {
    'use strict';
    var STYLE_ID = 'otsDropdownUserStyles';
    if (window.otsDropdownUserInit) { window.otsDropdownUserInit(); return; }
    var pending = false;

    function styles() {
        if (document.getElementById(STYLE_ID)) return;
        var el = document.createElement('style');
        el.id = STYLE_ID;
        el.textContent = `
.useLogin.ots-user-dropdown { box-sizing:border-box!important; width:260px!important; max-width:calc(100vw - 24px)!important; padding:9px!important; border:1px solid #e2e7ef!important; border-radius:14px!important; background:#fff!important; color:#0c154c!important; box-shadow:0 18px 54px rgba(12,21,48,.15)!important; font-family:inherit; text-align:left!important; z-index:1001; }
.useLogin.ots-user-dropdown::before,.useLogin.ots-user-dropdown::after { display:none!important; }
.useLogin.ots-user-dropdown > .useName { display:block!important; float:none!important; width:100%!important; margin:0 0 6px!important; padding:12px 12px 15px!important; border:0!important; border-bottom:1px solid #edf0f5!important; background:none!important; color:#0c154c!important; font-size:15px!important; font-weight:700; line-height:1.4!important; letter-spacing:-.2px; }
.useLogin.ots-user-dropdown ul,.useLogin.ots-user-dropdown li { box-sizing:border-box; list-style:none!important; float:none!important; width:100%!important; padding:0!important; margin:0!important; border:0!important; background:none!important; }
.useLogin.ots-user-dropdown a { box-sizing:border-box; display:flex!important; align-items:center; justify-content:flex-start; gap:10px; float:none!important; width:100%!important; min-height:42px; margin:2px 0!important; padding:10px 12px!important; border:0!important; border-radius:8px!important; background:transparent!important; color:#47516c!important; font-family:inherit; font-size:13px!important; font-weight:500; line-height:1.5!important; text-decoration:none!important; white-space:normal!important; transition:background .15s,color .15s; }
.useLogin.ots-user-dropdown a:hover { color:#0c154c!important; background:#eff6fb!important; }
.useLogin.ots-user-dropdown a i,.useLogin.ots-user-dropdown a svg { flex:none; color:inherit; }
.useLogin.ots-user-dropdown a.ots-user-signout { margin-top:7px!important; color:#995050!important; border-top:1px solid #edf0f5!important; border-radius:0 0 8px 8px!important; }
.useLogin.ots-user-dropdown a.ots-user-signout:hover { color:#923c3c!important; background:#fff3f3!important; }
.useLogin.ots-user-dropdown a:focus-visible { outline:2px solid #4b9bb7!important; outline-offset:-2px; }
.useLogin.ots-user-dropdown > .useName { box-sizing:border-box; text-align:left!important; height:auto!important; min-height:0!important; white-space:normal!important; }
.useLogin.ots-user-dropdown > .useName::before { content:'HOŞ GELDİNİZ'; display:block; margin-bottom:6px; color:#8791a5; font-size:9px; font-weight:600; letter-spacing:1.5px; }
.useLogin.ots-user-dropdown > .useName > span { display:block!important; padding:0!important; margin:0!important; color:#0c154c!important; font-family:inherit; font-size:14px!important; font-weight:600; line-height:1.5!important; overflow-wrap:anywhere; }
.useLogin.ots-user-dropdown > ul { position:static!important; box-shadow:none!important; border-radius:0!important; }
.useLogin.ots-user-dropdown > ul > li { display:block!important; height:auto!important; }
.useLogin.ots-user-dropdown a > span { flex:1; float:none!important; color:inherit!important; font:inherit!important; text-align:left!important; }
.useLogin.ots-user-dropdown a > i.fa-angle-right { order:2; position:static!important; float:none!important; margin:0!important; color:#a7b0c0; font-size:13px; }
@media(prefers-reduced-motion:reduce) { .useLogin.ots-user-dropdown a { transition:none; } }
`;
        document.head.appendChild(el);
    }

    function refresh() {
        styles();
        document.querySelectorAll('.useLogin').forEach(function (menu) {
            menu.classList.add('ots-user-dropdown');
            menu.querySelectorAll('a').forEach(function (link) {
                var text = link.textContent.replace(/\s+/g, ' ').trim().toLocaleLowerCase('tr-TR');
                link.classList.toggle('ots-user-signout', !!link.closest('.cikisbtn') || /^(çıkış|çıkış yap|güvenli çıkış|oturumu kapat)$/.test(text));
            });
        });
    }
    function schedule() {
        if (pending) return;
        pending = true;
        (window.requestAnimationFrame || function (callback) {
            return window.setTimeout(callback, 16);
        })(function () { pending = false; refresh(); });
    }
    function init() {
        refresh();
        document.addEventListener('click', function (event) {
            if (event.target.closest && event.target.closest('a.headerHesabim')) schedule();
        });
        if (window.MutationObserver) new MutationObserver(function (records) {
            var affectsUserMenu = records.some(function (record) {
                var target = record.target;
                if (target && target.closest && target.closest('.useLogin')) return true;
                return Array.prototype.some.call(record.addedNodes, function (node) {
                    return node && node.nodeType === 1 && (
                        (node.matches && node.matches('.useLogin')) ||
                        (node.querySelector && node.querySelector('.useLogin'))
                    );
                });
            });
            if (affectsUserMenu) schedule();
        }).observe(document.body, { childList: true, subtree: true });
    }
    window.otsDropdownUserInit = schedule;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}());

/* ========================================================================
 * BÖLÜM 13: ANA SAYFA ÜRÜN VİTRİNİ
 *
 * Ürün kartlarında açılan sepete ekle, favori ve ürünü incele katmanlarını gizler.
 * Ürün görseline tıklamayı güvenilir biçimde ürün detay sayfasına yönlendirir.
 * ====================================================================== */
(function (window, document) {
    'use strict';

    var STYLE_ID = 'ots-vitrin-mod-style';
    var ROOT_CLASS = 'ots-vitrin-mod';
    var refreshQueued = false;

    function addStyles() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            'body.' + ROOT_CLASS + ' .ProductList .productItem > .productIcon,',
            'body.' + ROOT_CLASS + ' .ProductList .productItem .productIcon .favori,',
            'body.' + ROOT_CLASS + ' .ProductList .productItem .productIcon .mycartIcon,',
            'body.' + ROOT_CLASS + ' .ProductList .productItem .productIcon .examineIcon,',
            'body.' + ROOT_CLASS + ' .ProductList .productItem .productIconWrap .favori,',
            'body.' + ROOT_CLASS + ' .ProductList .productItem .productIconWrap .mycartIcon,',
            'body.' + ROOT_CLASS + ' .ProductList .productItem .productIconWrap .examineIcon {',
            '    display: none !important;',
            '    opacity: 0 !important;',
            '    visibility: hidden !important;',
            '    pointer-events: none !important;',
            '}',
            '',
            'body.' + ROOT_CLASS + ' .ProductList .productItem .productIconWrap {',
            '    pointer-events: none !important;',
            '}',
            '',
            'body.' + ROOT_CLASS + ' .ProductList .productItem .productImage {',
            '    position: relative !important;',
            '    z-index: 2 !important;',
            '}',
            '',
            'body.' + ROOT_CLASS + ' .ProductList .productItem .productImage > a.ots-vitrin-detail-link {',
            '    display: block !important;',
            '    position: relative !important;',
            '    z-index: 3 !important;',
            '    width: 100% !important;',
            '    height: 100% !important;',
            '    pointer-events: auto !important;',
            '    cursor: pointer !important;',
            '}',
            '',
            'body.' + ROOT_CLASS + ' .ProductList .productItem .productImage > a.ots-vitrin-detail-link img {',
            '    pointer-events: none !important;',
            '}'
        ].join('\n');

        (document.head || document.documentElement).appendChild(style);
    }

    function isUsableHref(href) {
        return Boolean(
            href &&
            href !== '#' &&
            !/^javascript:/i.test(href) &&
            !/^void\s*\(/i.test(href)
        );
    }

    function getProductName(card, imageLink) {
        var nameLink = card.querySelector('.productName a');
        var image = imageLink.querySelector('img');

        return (nameLink && (nameLink.textContent || '').trim()) ||
            (image && (image.getAttribute('alt') || '').trim()) ||
            (imageLink.getAttribute('title') || '').trim();
    }

    function prepareProductCard(card) {
        var imageLink = card.querySelector('.productImage > a');
        var fallbackLink;
        var href;
        var productName;

        if (!imageLink) {
            return;
        }

        href = imageLink.getAttribute('href');
        if (!isUsableHref(href)) {
            fallbackLink = card.querySelector('.productName a[href], .examineIcon a[href]');
            if (fallbackLink && isUsableHref(fallbackLink.getAttribute('href'))) {
                href = fallbackLink.getAttribute('href');
                imageLink.setAttribute('href', href);
            }
        }

        if (!isUsableHref(href)) {
            return;
        }

        imageLink.classList.add('ots-vitrin-detail-link');
        productName = getProductName(card, imageLink);

        if (productName && !imageLink.getAttribute('aria-label')) {
            imageLink.setAttribute('aria-label', productName + ' ürününü incele');
        }
    }

    function refresh() {
        var cards = document.querySelectorAll('.ProductList .productItem');
        var i;

        refreshQueued = false;
        addStyles();

        if (document.body) {
            document.body.classList.add(ROOT_CLASS);
        }

        for (i = 0; i < cards.length; i += 1) {
            prepareProductCard(cards[i]);
        }
    }

    function queueRefresh() {
        if (refreshQueued) {
            return;
        }

        refreshQueued = true;
        (window.requestAnimationFrame || function (callback) {
            return window.setTimeout(callback, 16);
        })(refresh);
    }

    function init() {
        refresh();

        if (window.MutationObserver && document.body) {
            new MutationObserver(function (records) {
                var relevant = records.some(function (record) {
                    var target = record.target;
                    if (target && target.matches && target.matches('.ProductList')) return true;

                    return Array.prototype.some.call(record.addedNodes, function (node) {
                        return node && node.nodeType === 1 && (
                            (node.matches && node.matches('.ProductList, .productItem')) ||
                            (node.querySelector && node.querySelector('.ProductList, .productItem'))
                        );
                    });
                });
                if (relevant) queueRefresh();
            }).observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    window.otsVitrinModRefresh = queueRefresh;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}(window, document));

/* ========================================================================
 * BÖLÜM 14: KATEGORİ KARTI ÜCRETSİZ KARGO ROZETİ
 *
 * Gizli productIcon içindeki Ücretsiz Kargo bilgisini ürün kodu satırına taşır.
 * Badge tasarımını uygular ve dinamik ürün yenilemelerinde görünürlüğü korur.
 * ====================================================================== */
(function () {
    'use strict';

    var STYLE_ID = 'otsCategoryCargoIconStyles';
    var VISIBLE_CLASS = 'ots-cargo-icon-visible';
    var refreshQueued = false;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            body.ots-listing-ui .productItem .productStokKodu,
            .productItem .productStokKodu {
                display: flex !important;
                align-items: center !important;
                flex-wrap: wrap !important;
                gap: 5px !important;
                width: 100% !important;
                height: auto !important;
                min-height: 20px !important;
                overflow: visible !important;
            }

            body.ots-listing-ui .productItem .productStokKodu > .cargoIcon.${VISIBLE_CLASS},
            .productItem .productStokKodu > .cargoIcon.${VISIBLE_CLASS} {
                box-sizing: border-box !important;
                position: static !important;
                top: auto !important;
                left: auto !important;
                right: auto !important;
                bottom: auto !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 5px !important;
                float: none !important;
                flex: 0 0 auto !important;
                width: auto !important;
                min-width: 0 !important;
                max-width: none !important;
                height: 20px !important;
                min-height: 20px !important;
                margin: 0 0 0 auto !important;
                padding: 3px 6px !important;
                overflow: hidden !important;
                color: #21633c !important;
                font-family: inherit !important;
                font-size: 8px !important;
                font-weight: 650 !important;
                line-height: 1 !important;
                letter-spacing: .01em !important;
                text-align: left !important;
                text-indent: 0 !important;
                white-space: nowrap !important;
                visibility: visible !important;
                opacity: 1 !important;
                transform: none !important;
                border: 1px solid #add9bd !important;
                border-radius: 5px !important;
                background: #e8f6ed !important;
                box-shadow: 0 2px 7px rgba(30,105,61,.1) !important;
                pointer-events: none !important;
                vertical-align: baseline !important;
            }

            .productItem .productStokKodu > .cargoIcon.${VISIBLE_CLASS}::before,
            .productItem .productStokKodu > .cargoIcon.${VISIBLE_CLASS}::after {
                content: none !important;
                display: none !important;
            }

            .productItem .productStokKodu > .cargoIcon.${VISIBLE_CLASS} .ots-cargo-icon-svg {
                display: inline-flex !important;
                flex: 0 0 12px !important;
                align-items: center !important;
                justify-content: center !important;
                width: 12px !important;
                height: 12px !important;
                margin: 0 !important;
                padding: 0 !important;
                color: #287647 !important;
            }

            .productItem .productStokKodu > .cargoIcon.${VISIBLE_CLASS} .ots-cargo-icon-svg svg {
                display: block !important;
                width: 12px !important;
                height: 12px !important;
            }

            @media (max-width: 767px) {
                body.ots-listing-ui .productItem .productStokKodu > .cargoIcon.${VISIBLE_CLASS},
                .productItem .productStokKodu > .cargoIcon.${VISIBLE_CLASS} {
                    height: 18px !important;
                    min-height: 18px !important;
                    margin-left: auto !important;
                    padding: 2px 4px !important;
                    font-size: 7px !important;
                }
            }
        `;

        (document.head || document.documentElement).appendChild(style);
    }

    function addIcon(cargo) {
        if (cargo.querySelector('.ots-cargo-icon-svg')) return;

        cargo.insertAdjacentHTML(
            'afterbegin',
            '<span class="ots-cargo-icon-svg" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none">' +
            '<path d="M3.5 6.5h10v9h-10zM13.5 9h3.2l3.8 4v2.5h-7z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
            '<circle cx="7" cy="17.5" r="1.8" stroke="currentColor" stroke-width="1.6"/>' +
            '<circle cx="17" cy="17.5" r="1.8" stroke="currentColor" stroke-width="1.6"/>' +
            '</svg>' +
            '</span>'
        );
    }

    function revealCargoIcons(root) {
        var scope = root && root.querySelectorAll ? root : document;
        var icons = [];

        if (scope.matches && scope.matches('.cargoIcon')) icons.push(scope);
        Array.prototype.push.apply(icons, scope.querySelectorAll('.productItem .cargoIcon'));

        icons.forEach(function (cargo) {
            var card = cargo.closest('.productItem');
            if (!card) return;

            var oldPriceGroup = card.querySelector('.ots-price-cargo-group');
            if (oldPriceGroup) {
                var oldPriceLine = oldPriceGroup.querySelector('.discountPriceSpan');
                if (oldPriceLine && oldPriceGroup.parentNode) {
                    oldPriceGroup.parentNode.insertBefore(oldPriceLine, oldPriceGroup);
                }
                oldPriceGroup.remove();
            }

            var codeLine = card.querySelector('.productStokKodu');
            if (!codeLine) return;

            // Satır sonunda zaten bir kargo ikonu varsa taşınmaz; aynı kartta iki ikon
            // olduğunda sürekli yer değiştirip gözlemciyi döngüye sokuyordu.
            if (cargo.parentElement !== codeLine || !codeLine.lastElementChild.matches('.cargoIcon')) {
                codeLine.appendChild(cargo);
            }
            cargo.classList.add(VISIBLE_CLASS);
            cargo.removeAttribute('style');
            cargo.setAttribute('aria-label', (cargo.textContent || 'Ücretsiz Kargo').replace(/\s+/g, ' ').trim());
            addIcon(cargo);
        });
    }

    function scheduleRefresh() {
        if (refreshQueued) return;
        refreshQueued = true;

        window.requestAnimationFrame(function () {
            refreshQueued = false;
            revealCargoIcons(document);
        });
    }

    function observeProductList() {
        if (!window.MutationObserver || !document.body) return;

        var observer = new MutationObserver(function (records) {
            var hasRelevantChange = records.some(function (record) {
                return Array.prototype.some.call(record.addedNodes, function (node) {
                    if (!node || node.nodeType !== 1) return false;
                    return (node.matches && node.matches('.cargoIcon, .productStokKodu, .productItem, .ProductList')) ||
                        (node.querySelector && node.querySelector('.cargoIcon, .productStokKodu'));
                });
            });

            if (hasRelevantChange) scheduleRefresh();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function init() {
        if (window.otsCategoryCargoIconReady) {
            scheduleRefresh();
            return;
        }

        window.otsCategoryCargoIconReady = true;
        injectStyles();
        revealCargoIcons(document);
        observeProductList();

        [300, 900, 1800].forEach(function (delay) {
            window.setTimeout(scheduleRefresh, delay);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
}());

/* ========================================================================
 * BÖLÜM 15: ANA SAYFA VİTRİN SEPET VE VARYANT ARAYÜZÜ
 *
 * Ana sayfa vitrinlerinde ürün kartlarını, iki satırlı ürün adlarını, paket
 * adet fiyatlarını, ücretsiz kargo rozetini ve renk/beden seçimli sepete
 * ekleme modalını yönetir. Stokta olmayan ürün görsellerini gri gösterir.
 * ====================================================================== */
(function () {
    'use strict';

    if (window.otsHomeShowcaseCartReady) {
        if (typeof window.otsHomeShowcaseCartRefresh === 'function') window.otsHomeShowcaseCartRefresh();
        return;
    }
    window.otsHomeShowcaseCartReady = true;

    var STYLE_ID = 'otsHomeShowcaseCartStyles';
    var CARD_SELECTOR = '.anasayfa_urun_slider .ProductList .productItem, .landing-block[id^="urunblok_"] .ProductList .productItem';
    var activeDialog = null;
    var activeRequest = null;
    var refreshQueued = false;
    var successTimer = null;
    var productNames = Object.create(null);
    // Yalnızca bu modülün modalından başlatılan ekleme yakalanır; aynı ürünün
    // ana buton veya başka modülden eklenmesinde Ticimax'ın kendi akışı çalışır.
    var pendingUnique = null;

    function markDetailShowcases() {
        if (!document.querySelector('#ProductDetailMain, #contentProductDetail, .ProductDetail')) return;

        document.querySelectorAll('#BenzerUrunDiv, .middleBottomBlock .OzelUrunlerBlok, #divSonZiyaretEdilenUrunler').forEach(function (container) {
            container.classList.add('anasayfa_urun_slider', 'ots-detail-product-showcase');
        });

        document.querySelectorAll('.ProductList .categoryTitle, .ProductList .JKatAdi').forEach(function (heading) {
            var title = heading.textContent.replace(/\s+/g, ' ').trim().toLocaleLowerCase('tr-TR');
            var list;
            var container;

            if (!/(benzer ürünler|en çok ziyaret edilen ürünler|son ziyaret edilen ürünler)/.test(title)) return;
            list = heading.closest('.ProductList');
            container = list && list.parentElement;
            if (container) container.classList.add('anasayfa_urun_slider', 'ots-detail-product-showcase');
        });
    }

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            body.ots-home-showcase-cart .anasayfa_urun_slider .productItem,
            body.ots-home-showcase-cart .landing-block[id^="urunblok_"] .productItem {
                box-sizing: border-box !important;
                display: flex !important;
                flex-direction: column !important;
                height: 100% !important;
            }

            body.ots-home-showcase-cart .anasayfa_urun_slider .productItem .productName,
            body.ots-home-showcase-cart .landing-block[id^="urunblok_"] .productItem .productName {
                height: auto !important;
                min-height: 2.8em !important;
                max-height: 2.8em !important;
                overflow: hidden !important;
                white-space: normal !important;
            }

            body.ots-home-showcase-cart .anasayfa_urun_slider .productItem .productName > a,
            body.ots-home-showcase-cart .landing-block[id^="urunblok_"] .productItem .productName > a {
                display: -webkit-box !important;
                height: auto !important;
                min-height: 2.8em !important;
                max-height: 2.8em !important;
                overflow: hidden !important;
                line-height: 1.4 !important;
                white-space: normal !important;
                text-overflow: ellipsis !important;
                -webkit-box-orient: vertical !important;
                -webkit-line-clamp: 2 !important;
                line-clamp: 2 !important;
            }

            body.ots-home-showcase-cart .anasayfa_urun_slider .productItem .productOnYazi,
            body.ots-home-showcase-cart .landing-block[id^="urunblok_"] .productItem .productOnYazi {
                min-height: 34px !important;
                max-height: 34px !important;
                overflow: hidden !important;
            }

            body.ots-home-showcase-cart .anasayfa_urun_slider .productItem .productStokKodu,
            body.ots-home-showcase-cart .anasayfa_urun_slider .productItem .productStokKodu span,
            body.ots-home-showcase-cart .landing-block[id^="urunblok_"] .productItem .productStokKodu,
            body.ots-home-showcase-cart .landing-block[id^="urunblok_"] .productItem .productStokKodu span {
                color: #7b8598 !important;
                font-size: 11px !important;
                line-height: 1.4 !important;
            }

            body.ots-home-showcase-cart .productItem .productStokKodu {
                display: flex !important;
                align-items: center !important;
                flex-wrap: wrap !important;
                gap: 5px !important;
                width: 100% !important;
                min-height: 20px !important;
                overflow: visible !important;
            }

            body.ots-home-showcase-cart .productItem .productStokKodu > .cargoIcon.ots-cargo-icon-visible {
                box-sizing: border-box !important;
                position: static !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 5px !important;
                flex: 0 0 auto !important;
                float: none !important;
                width: auto !important;
                height: 20px !important;
                min-height: 20px !important;
                margin: 0 0 0 auto !important;
                padding: 3px 6px !important;
                overflow: hidden !important;
                color: #21633c !important;
                font-family: inherit !important;
                font-size: 8px !important;
                font-weight: 650 !important;
                line-height: 1 !important;
                text-indent: 0 !important;
                white-space: nowrap !important;
                visibility: visible !important;
                opacity: 1 !important;
                transform: none !important;
                border: 1px solid #add9bd !important;
                border-radius: 5px !important;
                background: #e8f6ed !important;
                box-shadow: 0 2px 7px rgba(30,105,61,.1) !important;
                pointer-events: none !important;
            }

            body.ots-home-showcase-cart .productItem .productStokKodu > .cargoIcon.ots-cargo-icon-visible::before,
            body.ots-home-showcase-cart .productItem .productStokKodu > .cargoIcon.ots-cargo-icon-visible::after {
                content: none !important;
                display: none !important;
            }

            body.ots-home-showcase-cart .productItem .cargoIcon .ots-cargo-icon-svg {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 12px !important;
                height: 12px !important;
                color: #287647 !important;
            }

            body.ots-home-showcase-cart .productItem .cargoIcon .ots-cargo-icon-svg svg {
                display: block !important;
                width: 12px !important;
                height: 12px !important;
            }

            body.ots-home-showcase-cart .productItem.StokYok .productImage img {
                filter: grayscale(1) saturate(0) !important;
                opacity: .62 !important;
            }

            body.ots-home-showcase-cart .productItem .discountPriceSpan {
                white-space: nowrap !important;
            }

            body.ots-home-showcase-cart .productItem .discountPriceSpan > .ots-home-unit-price {
                display: inline !important;
                margin-left: 5px !important;
                color: #778297 !important;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                font-size: 10px !important;
                font-weight: 500 !important;
                line-height: 1.2 !important;
                white-space: nowrap !important;
                vertical-align: baseline !important;
            }

            body.ots-home-showcase-cart .productItem > .ots-home-cart-button {
                box-sizing: border-box !important;
                position: static !important;
                display: block !important;
                float: none !important;
                clear: both !important;
                width: 100% !important;
                height: auto !important;
                margin: auto 0 0 !important;
                padding: 7px 7px 9px !important;
                visibility: visible !important;
                opacity: 1 !important;
                transform: none !important;
                pointer-events: auto !important;
            }

            body.ots-home-showcase-cart .productItem > .ots-home-cart-button > a {
                box-sizing: border-box !important;
                position: static !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                float: none !important;
                width: 100% !important;
                min-height: 38px !important;
                height: auto !important;
                margin: 0 !important;
                padding: 9px 7px !important;
                color: #fff !important;
                font-family: inherit !important;
                font-size: 11px !important;
                font-weight: 700 !important;
                line-height: 1.25 !important;
                text-align: center !important;
                text-indent: 0 !important;
                text-decoration: none !important;
                white-space: nowrap !important;
                border: 1px solid #0c154c !important;
                border-radius: 8px !important;
                background: #0c154c !important;
                box-shadow: none !important;
                cursor: pointer !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
            }

            body.ots-home-showcase-cart .productItem > .ots-home-cart-button > a:hover {
                border-color: #263774 !important;
                background: #263774 !important;
            }

            body.ots-home-showcase-cart .productItem > .ots-home-cart-button > a::before,
            body.ots-home-showcase-cart .productItem > .ots-home-cart-button > a::after {
                content: none !important;
                display: none !important;
            }

            body.ots-home-showcase-cart .productItem > .ots-home-cart-button > a > span {
                display: inline !important;
                color: inherit !important;
                font: inherit !important;
            }

            html.ots-home-variant-open {
                overflow: hidden !important;
            }

            dialog.ots-home-variant-dialog,
            dialog.ots-home-cart-success {
                box-sizing: border-box !important;
                position: fixed !important;
                inset: 0 !important;
                height: fit-content !important;
                margin: auto !important;
                color: #0c154c !important;
                font-family: inherit !important;
                background: #fff !important;
                border: 1px solid #dfe6ef !important;
                box-shadow: 0 24px 85px rgba(12,21,76,.24) !important;
            }

            dialog.ots-home-variant-dialog {
                width: calc(100% - 32px) !important;
                max-width: 440px !important;
                max-height: calc(100dvh - 36px) !important;
                padding: 25px !important;
                overflow: auto !important;
                text-align: left !important;
                border-radius: 18px !important;
            }

            dialog.ots-home-variant-dialog:not([open]),
            dialog.ots-home-cart-success:not([open]) {
                display: none !important;
            }

            dialog.ots-home-variant-dialog::backdrop,
            dialog.ots-home-cart-success::backdrop {
                background: rgba(10,17,55,.5) !important;
                backdrop-filter: blur(3px);
            }

            .ots-home-variant-dialog h2 {
                display: -webkit-box !important;
                margin: 2px 40px 0 0 !important;
                color: #0c154c !important;
                font-size: 15px !important;
                font-weight: 750 !important;
                line-height: 1.4 !important;
                overflow: hidden !important;
                -webkit-box-orient: vertical !important;
                -webkit-line-clamp: 3 !important;
                line-clamp: 3 !important;
            }

            .ots-home-variant-dialog .ots-home-product-summary {
                display: grid !important;
                grid-template-columns: 72px minmax(0,1fr) !important;
                gap: 13px !important;
                align-items: center !important;
                margin: 0 0 17px !important;
                padding: 0 0 17px !important;
                border-bottom: 1px solid #edf0f5 !important;
            }

            .ots-home-variant-dialog .ots-home-product-image {
                display: block !important;
                width: 72px !important;
                height: 88px !important;
                object-fit: contain !important;
                border-radius: 9px !important;
                background: #f5f7fa !important;
            }

            .ots-home-variant-dialog .ots-home-product-kicker {
                display: block !important;
                margin: 0 !important;
                color: #7c8799 !important;
                font-size: 9px !important;
                font-weight: 750 !important;
                line-height: 1.2 !important;
                letter-spacing: .08em !important;
                text-transform: uppercase !important;
            }

            .ots-home-variant-dialog .ots-home-variant-help,
            .ots-home-variant-dialog .ots-home-variant-loading {
                margin: 0 0 17px !important;
                color: #7a8496 !important;
                font-size: 11px !important;
                line-height: 1.5 !important;
            }

            .ots-home-variant-dialog .ots-home-variant-close {
                position: absolute !important;
                top: 12px !important;
                right: 12px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 36px !important;
                height: 36px !important;
                padding: 0 !important;
                color: #526078 !important;
                font-size: 23px !important;
                border: 0 !important;
                border-radius: 50% !important;
                background: #f1f4f8 !important;
                cursor: pointer !important;
            }

            .ots-home-variant-dialog .productItemVariantDetail {
                position: static !important;
                display: block !important;
                float: none !important;
                width: 100% !important;
                height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                border: 0 !important;
                background: transparent !important;
                box-shadow: none !important;
            }

            .ots-home-variant-dialog .ots-home-native-product-context.productItem {
                position: static !important;
                display: block !important;
                float: none !important;
                width: 100% !important;
                height: auto !important;
                min-height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
                border: 0 !important;
                background: transparent !important;
                box-shadow: none !important;
            }

            .ots-home-variant-dialog .ots-home-variant-boxes {
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 8px !important;
                width: 100% !important;
                margin: 0 0 17px !important;
                padding: 0 !important;
            }

            .ots-home-variant-dialog .ots-home-variant-step-title {
                flex: 0 0 100% !important;
                margin: 0 0 3px !important;
                color: #0c154c !important;
                font-size: 12px !important;
                font-weight: 700 !important;
                line-height: 1.4 !important;
            }

            .ots-home-variant-dialog .ots-home-variant-box {
                box-sizing: border-box !important;
                position: relative !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                float: none !important;
                width: auto !important;
                min-width: 52px !important;
                min-height: 42px !important;
                height: auto !important;
                margin: 0 !important;
                padding: 9px 13px !important;
                color: #0c154c !important;
                font-family: inherit !important;
                font-size: 12px !important;
                font-weight: 650 !important;
                line-height: 1.3 !important;
                text-align: center !important;
                text-indent: 0 !important;
                border: 1px solid #d3dce8 !important;
                border-radius: 8px !important;
                background: #fff !important;
                box-shadow: none !important;
                cursor: pointer !important;
            }

            .ots-home-variant-dialog .ots-home-variant-box.selected,
            .ots-home-variant-dialog .ots-home-variant-box[aria-pressed="true"] {
                color: #fff !important;
                border-color: #0c154c !important;
                background: #0c154c !important;
            }

            .ots-home-variant-dialog .ots-home-variant-box:disabled {
                opacity: .38 !important;
                text-decoration: line-through !important;
                cursor: not-allowed !important;
            }

            .ots-home-variant-dialog .ots-home-modal-add {
                box-sizing: border-box !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 100% !important;
                min-height: 46px !important;
                margin: 2px 0 0 !important;
                padding: 12px 16px !important;
                color: #fff !important;
                font-family: inherit !important;
                font-size: 13px !important;
                font-weight: 750 !important;
                line-height: 1.3 !important;
                border: 1px solid #0c154c !important;
                border-radius: 9px !important;
                background: #0c154c !important;
                box-shadow: none !important;
                cursor: pointer !important;
            }

            .ots-home-variant-dialog .ots-home-modal-add:disabled {
                color: #929aaa !important;
                border-color: #e0e5ed !important;
                background: #eef1f5 !important;
                cursor: not-allowed !important;
            }

            dialog.ots-home-cart-success {
                width: calc(100% - 40px) !important;
                max-width: 350px !important;
                padding: 28px 22px !important;
                text-align: center !important;
                border-radius: 18px !important;
            }

            .ots-home-cart-success .ots-home-success-icon {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 58px !important;
                height: 58px !important;
                margin: 0 auto 15px !important;
                color: #26744d !important;
                border-radius: 50% !important;
                background: #e8f6ee !important;
            }

            .ots-home-cart-success .ots-home-success-icon svg {
                width: 28px !important;
                height: 28px !important;
            }

            .ots-home-cart-success h2 {
                margin: 0 0 8px !important;
                color: #0c154c !important;
                font-size: 19px !important;
                line-height: 1.35 !important;
            }

            .ots-home-cart-success p {
                margin: 0 !important;
                color: #727d91 !important;
                font-size: 12px !important;
                line-height: 1.5 !important;
            }

            .ots-home-cart-success .ots-home-success-actions {
                display: grid !important;
                gap: 8px !important;
                margin: 20px 0 0 !important;
            }

            .ots-home-cart-success .ots-home-success-cart {
                box-sizing: border-box !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 8px !important;
                width: 100% !important;
                min-height: 46px !important;
                margin: 0 !important;
                padding: 12px 16px !important;
                color: #fff !important;
                font-family: inherit !important;
                font-size: 13px !important;
                font-weight: 750 !important;
                line-height: 1.3 !important;
                text-decoration: none !important;
                border: 1px solid #0c154c !important;
                border-radius: 9px !important;
                background: #0c154c !important;
                cursor: pointer !important;
                transition: background .18s ease !important;
            }

            .ots-home-cart-success .ots-home-success-cart:hover {
                background: #1a2357 !important;
            }

            .ots-home-cart-success .ots-home-success-cart svg {
                width: 18px !important;
                height: 18px !important;
            }

            .ots-home-cart-success .ots-home-success-continue {
                margin: 0 !important;
                padding: 8px !important;
                color: #727d91 !important;
                font-family: inherit !important;
                font-size: 12px !important;
                font-weight: 700 !important;
                border: 0 !important;
                background: transparent !important;
                cursor: pointer !important;
            }

            .ots-home-cart-success .ots-home-success-continue:hover {
                color: #0c154c !important;
            }

            .ots-home-cart-success a:focus-visible,
            .ots-home-cart-success button:focus-visible {
                outline: 3px solid rgba(76,135,196,.35) !important;
                outline-offset: 2px !important;
            }

            @media (max-width: 767px) {
                body.ots-home-showcase-cart .productItem .productStokKodu {
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    gap: 4px !important;
                }

                body.ots-home-showcase-cart .productItem .productStokKodu > .cargoIcon.ots-cargo-icon-visible {
                    align-self: center !important;
                    height: 20px !important;
                    min-height: 20px !important;
                    margin: 0 auto !important;
                    padding: 3px 6px !important;
                    font-size: 8px !important;
                }

                body.ots-home-showcase-cart .productItem .discountPriceSpan {
                    box-sizing: border-box !important;
                    position: static !important;
                    display: flex !important;
                    flex-wrap: wrap !important;
                    float: none !important;
                    width: 100% !important;
                    height: auto !important;
                    min-height: 0 !important;
                    overflow: visible !important;
                    white-space: normal !important;
                }

                body.ots-home-showcase-cart .productItem .productDetail,
                body.ots-home-showcase-cart .productItem .productPrice,
                body.ots-home-showcase-cart .productItem .discountPrice {
                    position: static !important;
                    float: none !important;
                    height: auto !important;
                    min-height: 0 !important;
                    overflow: visible !important;
                }

                body.ots-home-showcase-cart .productItem .productPrice {
                    padding-bottom: 6px !important;
                }

                body.ots-home-showcase-cart .productItem .discountPriceSpan > .ots-home-unit-price {
                    display: block !important;
                    flex: 0 0 100% !important;
                    width: 100% !important;
                    margin: 3px 0 0 !important;
                    font-size: 9px !important;
                    line-height: 1.3 !important;
                    text-align: left !important;
                }

                body.ots-home-showcase-cart .productItem > .ots-home-cart-button {
                    padding: 5px 4px 7px !important;
                }
                body.ots-home-showcase-cart .productItem > .ots-home-cart-button > a {
                    min-height: 34px !important;
                    padding: 7px 4px !important;
                    font-size: 9px !important;
                    border-radius: 6px !important;
                }
                dialog.ots-home-variant-dialog {
                    padding: 22px 17px !important;
                }
            }
        `;

        (document.head || document.documentElement).appendChild(style);
    }

    function getCardName(card) {
        var name = card.querySelector('.productName a, .productName');
        return name ? name.textContent.replace(/\s+/g, ' ').trim() : '';
    }

    function getCardImage(card) {
        var image = card.querySelector('.productImage img');
        if (!image) return '';
        return image.getAttribute('data-src') ||
            image.getAttribute('data-original') ||
            image.currentSrc ||
            image.getAttribute('src') ||
            '';
    }

    function scrollDialogTo(element) {
        if (!activeDialog || !element || !activeDialog.dialog.open) return;
        window.requestAnimationFrame(function () {
            if (!activeDialog || !element.isConnected) return;
            try {
                element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            } catch (error) {
                activeDialog.dialog.scrollTop = Math.max(0, element.offsetTop - 18);
            }
        });
    }

    function updateModalAddButton() {
        if (!activeDialog) return;
        var button = activeDialog.dialog.querySelector('.ots-home-modal-add');
        if (!button) return;
        var ready = Number(activeDialog.selectedVariantId) > 0;
        button.disabled = !ready;
        button.textContent = ready ? 'Sepete Ekle' : 'Renk ve beden seçin';
    }

    function showSuccess(productName) {
        if (activeDialog && activeDialog.dialog.open) activeDialog.dialog.close();

        var modal = document.getElementById('otsHomeCartSuccess');
        if (!modal) {
            modal = document.createElement('dialog');
            modal.id = 'otsHomeCartSuccess';
            modal.className = 'ots-home-cart-success';
            modal.innerHTML = '<div class="ots-home-success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg></div><h2>Ürün sepetinize eklendi</h2><p></p>' +
                '<div class="ots-home-success-actions">' +
                '<a class="ots-home-success-cart" href="/checkout"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L20.5 8H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/></svg><span>Sepete Git</span></a>' +
                '<button class="ots-home-success-continue" type="button">Alışverişe Devam Et</button>' +
                '</div>';
            document.body.appendChild(modal);

            modal.querySelector('.ots-home-success-continue').addEventListener('click', function () {
                closeSuccess(modal);
            });
            // Arka plana tıklayınca kapanır.
            modal.addEventListener('click', function (event) {
                if (event.target === modal) closeSuccess(modal);
            });
            // Fare modal üzerindeyken otomatik kapanma bekletilir.
            modal.addEventListener('mouseenter', function () { window.clearTimeout(successTimer); });
            modal.addEventListener('mouseleave', function () { scheduleSuccessClose(modal); });
        }

        modal.querySelector('p').textContent = productName || 'Alışverişinize devam edebilirsiniz.';
        window.clearTimeout(successTimer);
        if (!modal.open) {
            if (typeof modal.showModal === 'function') modal.showModal();
            else modal.setAttribute('open', '');
        }
        scheduleSuccessClose(modal);
    }

    // "Sepete Git" butonuna ulaşmaya yetecek süre; fare üzerindeyken sayılmaz.
    var SUCCESS_VISIBLE_MS = 6000;

    function closeSuccess(modal) {
        window.clearTimeout(successTimer);
        if (typeof modal.close === 'function') modal.close();
        else modal.removeAttribute('open');
    }

    function scheduleSuccessClose(modal) {
        window.clearTimeout(successTimer);
        successTimer = window.setTimeout(function () {
            if (modal.open) closeSuccess(modal);
        }, SUCCESS_VISIBLE_MS);
    }

    function installSuccessHook() {
        var add = window.cart && window.cart.add;
        if (!add || typeof add.diagram !== 'function' || add.diagram.otsHomeShowcaseNotice) return;

        var original = add.diagram;
        var wrapped = function (response) {
            var unique = add.model && add.model.productUnique;
            var fromShowcase = pendingUnique !== null && unique === pendingUnique;
            pendingUnique = null;
            if (fromShowcase && response && response.isError === false && Object.prototype.hasOwnProperty.call(productNames, unique)) {
                showSuccess(productNames[unique]);
                return;
            }
            return original.apply(this, arguments);
        };
        wrapped.otsHomeShowcaseNotice = true;
        add.diagram = wrapped;
    }

    function installManualApproveHook(module) {
        if (!module || typeof module.approve !== 'function' || module.approve.otsHomeManualApprove) return;

        var originalApprove = module.approve;
        var wrappedApprove = function () {
            if (activeDialog && module.params.unique === activeDialog.unique) {
                activeDialog.selectedVariantId = Number(module.params.variantId) || 0;
                updateModalAddButton();
                scrollDialogTo(activeDialog.dialog.querySelector('.ots-home-modal-add'));
                return;
            }
            return originalApprove.apply(this, arguments);
        };
        wrappedApprove.otsHomeManualApprove = true;
        module.approve = wrappedApprove;
    }

    function addSelectedVariantToCart() {
        if (!activeDialog || !activeDialog.cartData || Number(activeDialog.selectedVariantId) <= 0) return;

        var data = activeDialog.cartData;
        var button = activeDialog.dialog.querySelector('.ots-home-modal-add');
        var add = window.cart && window.cart.add;
        if (!add || typeof add.createModel !== 'function' || typeof add.execute !== 'function') return;

        installSuccessHook();
        button.disabled = true;
        button.textContent = 'Sepete ekleniyor…';

        add.model = add.createModel();
        add.model.productUnique = data.unique;
        add.model.productId = data.productId;
        add.model.variantId = Number(activeDialog.selectedVariantId);
        add.model.piece = data.piece;
        add.model.assortmentProductId = data.assortmentProductId;
        add.model.productUrl = data.url;
        pendingUnique = data.unique;
        add.execute();

        window.setTimeout(function () {
            if (!activeDialog || activeDialog.dialog !== button.closest('dialog') || !activeDialog.dialog.open) return;
            updateModalAddButton();
        }, 2500);
    }

    function renderVariantBoxes(values) {
        if (!activeDialog || !Array.isArray(values) || !values.length) return;

        var panel = activeDialog.panel;
        var lastStep = values.every(function (value) {
            return !value.subVariantValues || !value.subVariantValues.length;
        });
        var step = panel.querySelectorAll('.ots-home-variant-boxes').length + 1;
        var group = document.createElement('div');
        var title = document.createElement('p');

        group.className = 'ekSecenek ots-home-variant-boxes' + (lastStep ? ' sonSecenek' : '');
        group.setAttribute('role', 'group');
        title.className = 'ots-home-variant-step-title';
        title.textContent = step + '. ' + (lastStep ? 'Beden seçin' : 'Renk seçin');
        group.setAttribute('aria-label', title.textContent);
        group.appendChild(title);

        values.forEach(function (value) {
            var button = document.createElement('button');
            var unavailable = Number(value.stockAmount) === 0;

            button.type = 'button';
            button.className = 'ekSecenekValues ots-home-variant-box' + (unavailable ? ' noStock' : '');
            button.disabled = unavailable;
            button.textContent = value.name;
            button.setAttribute('data-varintid', String(value.variantId || 0));
            button.setAttribute('data-stockAmount', String(value.stockAmount));
            button.setAttribute('aria-pressed', 'false');
            if (unavailable) button.title = 'Stokta yok';

            button.addEventListener('click', function () {
                if (button.disabled || !window.listVariantModule) return;
                if (activeDialog && !lastStep) {
                    activeDialog.selectedVariantId = 0;
                    updateModalAddButton();
                }
                group.querySelectorAll('.ots-home-variant-box').forEach(function (item) {
                    item.classList.toggle('selected', item === button);
                    item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
                });
                // Renk değişince önceki rengin beden adımı kaldırılır (kategori.js ile aynı davranış).
                var following = group.nextElementSibling;
                while (following) {
                    var next = following.nextElementSibling;
                    if (following.classList.contains('ots-home-variant-boxes')) following.remove();
                    following = next;
                }
                window.listVariantModule.setVariant(button, value.rootVariantTypeValueId, value.variantTypeValueId);
            });

            group.appendChild(button);
        });

        panel.appendChild(group);
        panel.style.display = 'block';
        if (lastStep) scrollDialogTo(group);
    }

    function startVariantSelection(module, panel, trigger) {
        if (!module.render.otsHomeVariantBoxes) {
            var originalRender = module.render;
            var wrappedRender = function (values) {
                if (activeDialog && module.params.unique === activeDialog.unique) {
                    renderVariantBoxes(values);
                    return;
                }
                return originalRender.apply(this, arguments);
            };
            wrappedRender.otsHomeVariantBoxes = true;
            module.render = wrappedRender;
        }

        panel.replaceChildren();
        panel.classList.add('active');
        module.get(function () {
            if (!activeDialog || activeDialog.panel !== panel) {
                trigger.removeAttribute('aria-busy');
                activeRequest = null;
                return;
            }
            if (!Array.isArray(module.data) || !module.data.length) {
                activeDialog.dialog.querySelector('.ots-home-variant-loading').textContent = 'Seçenekler yüklenemedi. Lütfen tekrar deneyin.';
                trigger.removeAttribute('aria-busy');
                activeRequest = null;
                return;
            }
            window.VariantValue0 = module.data;
            module.render(module.data);
        });
    }

    function openDialog(card, panel, trigger, data, piece) {
        var dialog = document.createElement('dialog');
        dialog.className = 'ots-home-variant-dialog';
        dialog.setAttribute('aria-label', 'Renk ve beden seçimi');
        dialog.innerHTML = '<button type="button" class="ots-home-variant-close" aria-label="Kapat">×</button><div class="ots-home-product-summary"><img class="ots-home-product-image" alt=""><div><span class="ots-home-product-kicker">Ürün seçimi</span><h2></h2></div></div><p class="ots-home-variant-help">Önce renginizi, ardından bedeninizi seçin. Seçimlerinizi tamamladıktan sonra aşağıdaki butonla sepetinize ekleyin.</p><p class="ots-home-variant-loading" role="status">Seçenekler yükleniyor…</p><div class="ots-home-native-product-context productItem"></div><button type="button" class="ots-home-modal-add" disabled>Renk ve beden seçin</button>';
        var productName = getCardName(card);
        var productImage = dialog.querySelector('.ots-home-product-image');
        dialog.querySelector('h2').textContent = productName;
        productImage.src = getCardImage(card);
        productImage.alt = productName;
        document.body.appendChild(dialog);
        dialog.querySelector('.ots-home-native-product-context').appendChild(panel);

        dialog.querySelector('.ots-home-variant-close').addEventListener('click', function () {
            dialog.close();
        });
        dialog.querySelector('.ots-home-modal-add').addEventListener('click', addSelectedVariantToCart);
        dialog.addEventListener('click', function (event) {
            var rect = dialog.getBoundingClientRect();
            if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
        });
        dialog.addEventListener('close', function () {
            document.documentElement.classList.remove('ots-home-variant-open');
            trigger.removeAttribute('aria-busy');
            if (activeDialog && activeDialog.dialog === dialog) activeDialog = null;
            if (activeRequest && activeRequest.trigger === trigger) activeRequest = null;
            if (trigger.isConnected) trigger.focus();
            dialog.remove();
        });

        activeDialog = {
            dialog: dialog,
            panel: panel,
            trigger: trigger,
            unique: data.unique,
            selectedVariantId: 0,
            cartData: {
                unique: data.unique,
                productId: data.productId,
                assortmentProductId: data.assortmentProductId,
                piece: piece,
                url: data.url
            },
            loaded: false
        };
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
        document.documentElement.classList.add('ots-home-variant-open');
        return dialog;
    }

    function parseButton(link) {
        var handler = link.getAttribute('onclick') || '';
        var args = handler.match(/productListAddToCartV2\('([^']+)',\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+),\s*'([^']*)',\s*\d+,\s*this\)/);
        if (!args) return null;

        return {
            unique: args[1],
            productId: Number(args[2]),
            variantId: Number(args[3]),
            assortmentProductId: Number(args[4]),
            piece: Number(args[5]),
            url: args[6]
        };
    }

    function normalizeStockCode(card) {
        var holder = card.querySelector('.productStokKodu');
        if (!holder || holder.hasAttribute('data-ots-stock-code')) return;

        var stockCode = Array.prototype.find.call(holder.children, function (child) {
            return child.tagName === 'SPAN' && !child.classList.contains('ots-cargo-icon-svg');
        });
        var text = '';

        if (stockCode) {
            text = stockCode.textContent;
        } else {
            Array.prototype.forEach.call(holder.childNodes, function (node) {
                if (node.nodeType === 3) text += node.textContent;
            });
            stockCode = document.createElement('span');
            stockCode.className = 'ots-stock-code-text';
            Array.prototype.slice.call(holder.childNodes).forEach(function (node) {
                if (node.nodeType === 3) node.remove();
            });
            holder.insertBefore(stockCode, holder.firstChild);
        }

        text = text.replace(/\s+/g, ' ').trim();
        var colonIndex = text.indexOf(':');
        var value = colonIndex >= 0 ? text.slice(colonIndex + 1).trim() : text;

        stockCode.textContent = 'Ürün Kodu : ' + value.split('-')[0].trim();
        holder.setAttribute('data-ots-stock-code', 'true');
    }

    function prepareCargoBadge(card) {
        var cargo = card.querySelector('.cargoIcon');
        var codeLine = card.querySelector('.productStokKodu');
        if (!cargo || !codeLine) return;

        // Satır sonunda zaten bir kargo ikonu varsa taşınmaz (iki ikonlu kartta döngüyü önler).
        if (cargo.parentElement !== codeLine || !codeLine.lastElementChild.matches('.cargoIcon')) {
            codeLine.appendChild(cargo);
        }
        cargo.classList.add('ots-cargo-icon-visible');
        cargo.removeAttribute('style');
        cargo.setAttribute('aria-label', 'Ücretsiz Kargo');

        if (!cargo.querySelector('.ots-cargo-icon-svg')) {
            cargo.insertAdjacentHTML(
                'afterbegin',
                '<span class="ots-cargo-icon-svg" aria-hidden="true">' +
                '<svg viewBox="0 0 24 24" fill="none">' +
                '<path d="M3.5 6.5h10v9h-10zM13.5 9h3.2l3.8 4v2.5h-7z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
                '<circle cx="7" cy="17.5" r="1.8" stroke="currentColor" stroke-width="1.6"/>' +
                '<circle cx="17" cy="17.5" r="1.8" stroke="currentColor" stroke-width="1.6"/>' +
                '</svg>' +
                '</span>'
            );
        }
    }

    function getPackageQuantity(name) {
        var match = String(name || '').match(/(?:^|[\s(])(\d+)\s*['’ʼ]?\s*[lL][ıiİIuUüÜ](?=$|[\s),])/);
        var quantity = match ? Number(match[1]) : 0;
        return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 0;
    }

    function parseTurkishPrice(text) {
        var value = String(text || '').replace(/\s/g, '').replace(/[^\d,.-]/g, '');
        var comma = value.lastIndexOf(',');
        var dot = value.lastIndexOf('.');

        if (comma > -1 && dot > -1) {
            value = comma > dot
                ? value.replace(/\./g, '').replace(',', '.')
                : value.replace(/,/g, '');
        } else if (comma > -1) {
            value = value.length - comma - 1 <= 2
                ? value.replace(/\./g, '').replace(',', '.')
                : value.replace(/,/g, '');
        } else if (dot > -1 && value.length - dot - 1 > 2) {
            value = value.replace(/\./g, '');
        }

        value = Number(value);
        return Number.isFinite(value) ? value : 0;
    }

    function prepareUnitPrice(card) {
        var quantity = getPackageQuantity(getCardName(card));
        var current = card.querySelector('.ots-home-unit-price');

        if (!quantity) {
            if (current) current.remove();
            return;
        }

        var price = card.querySelector('.discountPriceSpan, .salePrice, .productPrice .price');
        var priceText = '';
        if (price) {
            Array.prototype.forEach.call(price.childNodes, function (node) {
                if (node.nodeType === 3) priceText += node.textContent;
            });
        }

        var total = parseTurkishPrice(priceText);
        if (!price || !total) {
            if (current) current.remove();
            return;
        }

        var unitText = (total / quantity).toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        if (!current) {
            current = document.createElement('span');
            current.className = 'ots-home-unit-price';
        }
        if (current.parentElement !== price) price.appendChild(current);
        var label = '( ' + unitText + ' / adet )';
        var ariaLabel = 'Adet fiyatı ' + unitText + ' Türk lirası';
        if (current.textContent !== label) current.textContent = label;
        if (current.getAttribute('aria-label') !== ariaLabel) current.setAttribute('aria-label', ariaLabel);
    }

    function prepareCard(card) {
        normalizeStockCode(card);
        prepareCargoBadge(card);
        prepareUnitPrice(card);

        var link = card.querySelector('.productIcon .btnAddToCart, .mycartIcon .btnAddToCart');
        if (!link || link.hasAttribute('data-ots-home-cart')) return;

        var data = parseButton(link);
        var holder = link.closest('.mycartIcon');
        var panel = card.querySelector('.productItemVariantDetail');
        if (!data || !holder || !panel) return;

        productNames[data.unique] = getCardName(card);
        holder.classList.add('ots-home-cart-button');
        // Panel kartın doğrudan çocuğu olmayabilir; kendi ebeveynine eklenir.
        panel.parentNode.insertBefore(holder, panel);
        link.setAttribute('data-ots-home-cart', 'true');
        link.setAttribute('href', data.url);
        link.setAttribute('role', 'button');
        link.setAttribute('aria-controls', panel.id || 'productListVariantDetail' + data.unique);
        link.removeAttribute('onclick');

        link.addEventListener('click', function (event) {
            var module = window.listVariantModule;
            installSuccessHook();

            if (!module || typeof module.get !== 'function' || typeof module.render !== 'function' || typeof module.setVariant !== 'function' || typeof module.approve !== 'function' || !window.HTMLDialogElement) return;

            event.preventDefault();
            if (card.classList.contains('StokYok')) return;
            if (activeRequest) return;

            var quantity = card.querySelector('.urunListeAdetTextBox');
            var piece = quantity ? Number(String(quantity.value).replace(',', '.')) : data.piece;
            if (!Number.isFinite(piece) || piece <= 0) piece = 1;

            module.params.unique = data.unique;
            module.params.productId = data.productId;
            module.params.variantId = 0;
            module.params.assortmentProductId = data.assortmentProductId;
            module.params.piece = piece;
            module.params.url = data.url;
            module.params.redirectToDetail = 0;
            module.params.approveCallback = '';
            module.params.processType = 0;

            activeRequest = { panel: panel, trigger: link, started: Date.now() };
            link.setAttribute('aria-busy', 'true');

            try {
                installManualApproveHook(module);
                openDialog(card, panel, link, data, piece);
                startVariantSelection(module, panel, link);
            } catch (error) {
                link.removeAttribute('aria-busy');
                activeRequest = null;
                window.location.assign(data.url);
            }
        });
    }

    function refresh() {
        injectStyles();
        if (document.body) document.body.classList.add('ots-home-showcase-cart');
        markDetailShowcases();

        document.querySelectorAll(CARD_SELECTOR).forEach(prepareCard);

        if (activeDialog && activeDialog.dialog.isConnected) {
            if (activeDialog.panel.children.length) {
                activeDialog.loaded = true;
                activeDialog.dialog.querySelector('.ots-home-variant-loading').hidden = true;
            }
            if (activeDialog.loaded && !activeDialog.panel.classList.contains('active') && activeDialog.dialog.open) {
                activeDialog.dialog.close();
            }
        }

        if (activeRequest && activeRequest.panel.children.length) {
            activeRequest.trigger.removeAttribute('aria-busy');
            activeRequest = null;
        }

        installSuccessHook();
    }

    function scheduleRefresh() {
        if (refreshQueued) return;
        refreshQueued = true;
        window.requestAnimationFrame(function () {
            refreshQueued = false;
            refresh();
        });
    }

    function init() {
        refresh();

        if (window.MutationObserver && document.body) {
            new MutationObserver(function (records) {
                var relevant = records.some(function (record) {
                    if (record.type === 'attributes') return record.target.matches && record.target.matches('.productItemVariantDetail');
                    return Array.prototype.some.call(record.addedNodes, function (node) {
                        if (!node || node.nodeType !== 1) return false;
                        return (node.matches && node.matches('.productItem, .productItemVariantDetail, .owl-item')) ||
                            (node.querySelector && node.querySelector('.productItem, .productItemVariantDetail'));
                    });
                });
                if (relevant) scheduleRefresh();
            }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
        }
    }

    window.otsHomeShowcaseCartRefresh = scheduleRefresh;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
}());
/* ========================================================================
 * BÖLÜM 16: SOL TARAFTA SABİT ÜYELİK DAVETİ
 *
 * Giriş yapmamış ziyaretçilere solda açılabilir üyelik daveti gösterir.
 * Davet sitede 25 sn aktif geçirildikten sonra görünür, 60 sn ekranda kalır ve
 * kaybolur; oturum başına bir kez gösterilir. Sekmedeki küçük kapatma, paneldeki
 * × ve "Şimdi değil" butonları daveti oturum boyunca gizler.
 * ====================================================================== */
(function () {
    'use strict';

    if (window.__otsStickyRegisterLoaded) return;
    window.__otsStickyRegisterLoaded = true;

    var ROOT_ID = 'otsStickyRegister';
    var STYLE_ID = 'otsStickyRegisterStyles';
    var OPEN_CLASS = 'is-open';
    var MEMBER_CLASS = 'is-member';
    var VISIBLE_CLASS = 'is-visible';
    var watchdogStarted = false;

    /* Gösterim zamanlaması (oturum başına bir kez):
       - SHOW_AFTER_MS: Sitede aktif geçen süre. 25 sn, hemen çıkan ziyaretçileri
         ayıklar ve ilgisi oluşmuş kişiye ürünleri gezerken teklif sunar.
       - VISIBLE_FOR_MS: Ekranda kalma süresi. 60 sn fark edilmek için yeterli,
         alışverişi uzun süre rahatsız etmeyecek kadar kısadır.
       Süreler sayfa geçişlerinde devam eder; sekme arka plandayken sayılmaz. */
    var SHOW_AFTER_MS = 25000;
    var VISIBLE_FOR_MS = 60000;
    var RECHECK_MS = 4000;
    var SESSION_KEY = 'otsStickyRegisterSession';
    var session = readSession();
    var activeSince = document.hidden ? null : Date.now();
    var phaseTimer = null;

    function readSession() {
        try {
            var saved = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || 'null');
            if (saved && typeof saved.active === 'number') return saved;
        } catch (error) { /* Depolama kapalıysa süre yalnızca bu sayfada sayılır. */ }
        return { active: 0, shownAt: null, done: false };
    }

    function saveSession() {
        try {
            window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        } catch (error) { /* Depolama kapalıysa sessizce devam edilir. */ }
    }

    function getActiveTime() {
        return session.active + (activeSince === null ? 0 : Date.now() - activeSince);
    }

    // Geçen aktif süreyi oturum kaydına işler; sekme gizlenince ve sayfadan çıkarken çağrılır.
    function commitActiveTime() {
        session.active = getActiveTime();
        activeSince = document.hidden ? null : Date.now();
        saveSession();
    }

    function isTrue(value) {
        return value === true || value === 1 || value === '1' || value === 'true' || value === 'True';
    }

    function isLoggedIn() {
        var memberPanel = document.getElementById('divMemberPanel');
        var nativeMemberContent = memberPanel && memberPanel.querySelector(
            '.useLogin, .useName, .cikisbtn, [href*="UyeCikis"], [href*="uyecikis"]'
        );

        return !!(
            nativeMemberContent ||
            (document.body && document.body.classList.contains('ots-member-authenticated')) ||
            (window.globalModel && isTrue(window.globalModel.isAuthenticated)) ||
            (window.siteSettings && isTrue(window.siteSettings.isAuthenticated))
        );
    }

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            #${ROOT_ID},
            #${ROOT_ID} * {
                box-sizing: border-box;
            }

            #${ROOT_ID} {
                --ots-register-navy: #0c154c;
                --ots-register-navy-light: #182665;
                --ots-register-red: #e31d2b;
                --ots-register-text: #20263b;
                --ots-register-muted: #70788d;
                position: fixed !important;
                z-index: 3 !important;
                top: 50% !important;
                right: auto !important;
                bottom: auto !important;
                left: 0 !important;
                display: block !important;
                width: 54px !important;
                height: 230px !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
                opacity: 1 !important;
                visibility: visible !important;
                pointer-events: auto !important;
                font-family: Arial, Helvetica, sans-serif !important;
                transform: translateY(-50%) !important;
            }

            #${ROOT_ID}.${MEMBER_CLASS} {
                display: none !important;
            }

            /* Gösterim süresi dışında davet sol kenarın dışına kayar. */
            #${ROOT_ID} {
                transition: transform .45s cubic-bezier(.2,.78,.28,1), visibility .45s ease !important;
            }

            #${ROOT_ID}:not(.${VISIBLE_CLASS}) {
                visibility: hidden !important;
                pointer-events: none !important;
                transform: translate(calc(-100% - 24px), -50%) !important;
            }

            #${ROOT_ID}:not(.${VISIBLE_CLASS}) .ots-sticky-register-tab,
            #${ROOT_ID}:not(.${VISIBLE_CLASS}) .ots-sticky-register-hide {
                visibility: hidden !important;
            }

            #${ROOT_ID} .ots-sticky-register-hide {
                position: absolute;
                z-index: 4;
                top: -9px;
                right: -9px;
                display: grid;
                place-items: center;
                width: 24px;
                height: 24px;
                margin: 0;
                padding: 0;
                color: var(--ots-register-navy);
                border: 1px solid rgba(12,21,76,.14);
                border-radius: 50%;
                background: #fff;
                box-shadow: 0 4px 12px rgba(12,21,76,.18);
                cursor: pointer;
                transition: transform .18s ease, background .18s ease;
            }

            #${ROOT_ID} .ots-sticky-register-hide:hover {
                background: #f3f5f9;
                transform: scale(1.08);
            }

            #${ROOT_ID} .ots-sticky-register-hide svg {
                width: 12px;
                height: 12px;
            }

            #${ROOT_ID}.${OPEN_CLASS} .ots-sticky-register-hide {
                display: none;
            }

            #${ROOT_ID} .ots-sticky-register-tab {
                position: relative;
                z-index: 3;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 11px;
                width: 54px;
                height: 230px;
                margin: 0;
                padding: 14px 0;
                color: #fff;
                border: 0;
                border-radius: 0 15px 15px 0;
                outline: 0;
                background:
                    radial-gradient(circle at 70% 12%, rgba(255,255,255,.14), transparent 24%),
                    linear-gradient(180deg, var(--ots-register-navy-light), var(--ots-register-navy));
                box-shadow: 8px 12px 28px rgba(12,21,76,.2);
                cursor: pointer;
                opacity: 1 !important;
                visibility: visible !important;
                -webkit-tap-highlight-color: transparent;
                transition: background .2s ease, box-shadow .2s ease;
            }

            #${ROOT_ID} .ots-sticky-register-tab:hover {
                background: linear-gradient(180deg, #22337a, var(--ots-register-navy));
                box-shadow: 10px 14px 32px rgba(12,21,76,.27);
            }

            #${ROOT_ID} .ots-sticky-register-tab:focus-visible {
                outline: 3px solid rgba(97,177,218,.48);
                outline-offset: 3px;
            }

            #${ROOT_ID} .ots-sticky-register-tab-text {
                display: block;
                color: inherit;
                font-size: 15px;
                font-weight: 800;
                line-height: 1;
                letter-spacing: .02em;
                white-space: nowrap;
                writing-mode: vertical-rl;
                transform: rotate(180deg);
            }

            #${ROOT_ID} .ots-sticky-register-tab-icon {
                position: absolute;
                top: 14px;
                left: 50%;
                width: 22px;
                height: 22px;
                transform: translateX(-50%);
                transition: transform .25s ease;
            }

            #${ROOT_ID}.${OPEN_CLASS} .ots-sticky-register-tab-icon {
                transform: translateX(-50%) rotate(180deg);
            }

            #${ROOT_ID} .ots-sticky-register-panel {
                position: absolute;
                z-index: 2;
                top: 50%;
                left: 54px;
                width: min(410px, calc(100vw - 72px));
                min-height: 310px;
                display: flex !important;
                flex-direction: column;
                justify-content: center;
                padding: 34px 34px 30px;
                overflow: hidden;
                color: var(--ots-register-text);
                border: 1px solid rgba(12,21,76,.11);
                border-left: 0;
                border-radius: 0 18px 18px 0;
                background:
                    radial-gradient(circle at 100% 0, rgba(76,135,196,.12), transparent 38%),
                    #fff;
                box-shadow: 18px 22px 54px rgba(12,21,76,.18);
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transform: translate(calc(-100% - 54px), -50%);
                transition: transform .34s cubic-bezier(.2,.78,.28,1), opacity .2s ease, visibility .34s ease;
            }

            #${ROOT_ID}.${OPEN_CLASS} .ots-sticky-register-panel {
                opacity: 1;
                visibility: visible;
                pointer-events: auto;
                transform: translate(0, -50%);
            }

            #${ROOT_ID} .ots-sticky-register-close {
                position: absolute;
                top: 14px;
                right: 14px;
                display: grid;
                place-items: center;
                width: 34px;
                height: 34px;
                margin: 0;
                padding: 0;
                color: #697187;
                border: 0;
                border-radius: 50%;
                background: #f3f5f9;
                cursor: pointer;
                transition: color .18s ease, background .18s ease, transform .18s ease;
            }

            #${ROOT_ID} .ots-sticky-register-close:hover {
                color: var(--ots-register-navy);
                background: #e9edf5;
                transform: rotate(4deg);
            }

            #${ROOT_ID} .ots-sticky-register-close svg {
                width: 17px;
                height: 17px;
            }

            #${ROOT_ID} .ots-sticky-register-eyebrow {
                display: inline-flex;
                align-items: center;
                align-self: flex-start;
                gap: 7px;
                min-height: 28px;
                margin: 0 0 17px;
                padding: 0 11px;
                color: var(--ots-register-navy);
                border: 1px solid rgba(12,21,76,.1);
                border-radius: 999px;
                background: #f2f4fa;
                font-size: 10px;
                font-weight: 900;
                line-height: 1;
                letter-spacing: .11em;
                text-transform: uppercase;
            }

            #${ROOT_ID} .ots-sticky-register-eyebrow svg {
                width: 15px;
                height: 15px;
                color: var(--ots-register-red);
            }

            #${ROOT_ID} .ots-sticky-register-title {
                margin: 0;
                color: var(--ots-register-navy);
                font-size: 25px;
                font-weight: 800;
                line-height: 1.24;
                letter-spacing: -.025em;
            }

            #${ROOT_ID} .ots-sticky-register-title strong {
                color: var(--ots-register-red);
                font-weight: 900;
            }

            #${ROOT_ID} .ots-sticky-register-description {
                margin: 12px 0 22px;
                color: var(--ots-register-muted);
                font-size: 13px;
                font-weight: 500;
                line-height: 1.55;
            }

            #${ROOT_ID} .ots-sticky-register-cta {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 9px;
                width: 100%;
                min-height: 50px;
                margin: 0;
                padding: 0 22px;
                color: #fff;
                border: 1px solid var(--ots-register-navy);
                border-radius: 12px;
                background: linear-gradient(135deg, var(--ots-register-navy), var(--ots-register-navy-light));
                box-shadow: 0 12px 24px rgba(12,21,76,.18);
                font: 800 15px/1 Arial, Helvetica, sans-serif;
                cursor: pointer;
                transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
            }

            #${ROOT_ID} .ots-sticky-register-cta:hover {
                filter: brightness(1.08);
                box-shadow: 0 16px 30px rgba(12,21,76,.23);
                transform: translateY(-2px);
            }

            #${ROOT_ID} .ots-sticky-register-cta svg {
                width: 19px;
                height: 19px;
            }

            #${ROOT_ID} .ots-sticky-register-dismiss {
                align-self: center;
                margin: 15px 0 0;
                padding: 3px 5px;
                color: #737b8f;
                border: 0;
                border-bottom: 1px solid currentColor;
                background: transparent;
                font: 700 12px/1.2 Arial, Helvetica, sans-serif;
                cursor: pointer;
            }

            #${ROOT_ID} button:focus-visible {
                outline: 3px solid rgba(76,135,196,.35);
                outline-offset: 3px;
            }

            @media (max-width: 600px) {
                #${ROOT_ID} {
                    top: 52% !important;
                    width: 44px !important;
                    height: 188px !important;
                }

                #${ROOT_ID} .ots-sticky-register-tab {
                    width: 44px;
                    height: 188px;
                    border-radius: 0 12px 12px 0;
                }

                #${ROOT_ID} .ots-sticky-register-tab-text {
                    font-size: 13px;
                }

                #${ROOT_ID} .ots-sticky-register-hide {
                    top: -8px;
                    right: -8px;
                    width: 22px;
                    height: 22px;
                }

                #${ROOT_ID} .ots-sticky-register-tab-icon {
                    top: 12px;
                    width: 19px;
                    height: 19px;
                }

                #${ROOT_ID} .ots-sticky-register-panel {
                    left: 44px;
                    width: calc(100vw - 56px);
                    min-height: 292px;
                    max-height: calc(100vh - 36px);
                    padding: 30px 22px 24px;
                    border-radius: 0 15px 15px 0;
                    transform: translate(calc(-100% - 44px), -50%);
                }

                #${ROOT_ID} .ots-sticky-register-title {
                    padding-right: 24px;
                    font-size: 21px;
                }

                #${ROOT_ID} .ots-sticky-register-description {
                    margin-bottom: 18px;
                    font-size: 12px;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                #${ROOT_ID} *,
                #${ROOT_ID} *::before,
                #${ROOT_ID} *::after {
                    scroll-behavior: auto !important;
                    transition: none !important;
                }
            }

            @media print {
                #${ROOT_ID} {
                    display: none !important;
                }
            }
        `;

        (document.head || document.documentElement).appendChild(style);
    }

    function createWidget() {
        var existing = document.getElementById(ROOT_ID);
        if (existing) {
            if (existing.parentNode !== document.body) document.body.appendChild(existing);
            return existing;
        }

        var root = document.createElement('aside');
        root.id = ROOT_ID;
        root.setAttribute('aria-label', 'Üyelik fırsatı');
        root.innerHTML = `
            <button class="ots-sticky-register-tab" type="button" aria-expanded="false" aria-controls="otsStickyRegisterPanel">
                <svg class="ots-sticky-register-tab-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="ots-sticky-register-tab-text">Üye ol, 100 TL kazan</span>
            </button>
            <button class="ots-sticky-register-hide" type="button" aria-label="Üyelik davetini gizle">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>
            </button>
            <section class="ots-sticky-register-panel" id="otsStickyRegisterPanel" role="dialog" aria-modal="false" aria-labelledby="otsStickyRegisterTitle" aria-hidden="true">
                <button class="ots-sticky-register-close" type="button" aria-label="Üyelik fırsatını kapat">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
                <span class="ots-sticky-register-eyebrow">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9h16v11H4V9Zm8 0v11M3 9h18V5H3v4Zm9 0H8.5A2.5 2.5 0 1 1 11 6.5V9Zm0 0h3.5A2.5 2.5 0 1 0 13 6.5V9Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Yeni üyelere özel
                </span>
                <h2 class="ots-sticky-register-title" id="otsStickyRegisterTitle">Şimdi üye ol, <strong>100 TL sepette indirim</strong> hesabına tanımlansın.</h2>
                <p class="ots-sticky-register-description">ÖTS İç Giyim ayrıcalıklarından yararlanmak ve alışverişe avantajlı başlamak için üyeliğini hemen oluştur.</p>
                <button class="ots-sticky-register-cta" type="button">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="8" r="3.5" stroke="currentColor" stroke-width="1.8"/><path d="M3.5 20c.4-4 2.2-6 5.5-6 1.2 0 2.2.2 3 .7M17.5 12v7M14 15.5h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                    <span>Hemen Üye Ol</span>
                </button>
                <button class="ots-sticky-register-dismiss" type="button">Şimdi değil</button>
            </section>
        `;

        document.body.appendChild(root);
        return root;
    }

    function setOpen(root, open) {
        var tab = root.querySelector('.ots-sticky-register-tab');
        var panel = root.querySelector('.ots-sticky-register-panel');
        if (!tab || !panel) return;

        root.classList.toggle(OPEN_CLASS, open);
        tab.setAttribute('aria-expanded', open ? 'true' : 'false');
        panel.setAttribute('aria-hidden', open ? 'false' : 'true');

        if (open) {
            window.setTimeout(function () {
                var closeButton = root.querySelector('.ots-sticky-register-close');
                if (closeButton) closeButton.focus({ preventScroll: true });
            }, 360);
        }
    }

    function openRegistration() {
        var nativeRegister = document.querySelector('#divMemberPanel .headerUyeOl > a');
        if (nativeRegister) {
            nativeRegister.click();
            return;
        }

        if (window.mem && window.mem.init && typeof window.mem.init.bind === 'function' && window.mem.init.bind !== Function.prototype.bind) {
            window.mem.init.bind('quickmembership');
            return;
        }

        window.location.href = '/UyeOl';
    }

    function syncMemberState(root) {
        var loggedIn = isLoggedIn();
        root.classList.toggle(MEMBER_CLASS, loggedIn);
        root.setAttribute('aria-hidden', loggedIn || !root.classList.contains(VISIBLE_CLASS) ? 'true' : 'false');
        if (loggedIn) setOpen(root, false);
    }

    function setVisible(root, visible) {
        if (root.classList.contains(VISIBLE_CLASS) !== visible) root.classList.toggle(VISIBLE_CLASS, visible);
        if (!visible && root.contains(document.activeElement)) document.activeElement.blur();
        syncMemberState(root);
    }

    // Ziyaretçi kapattığında veya süre dolduğunda davet bu oturumda tekrar gösterilmez.
    function dismiss(root) {
        session.done = true;
        commitActiveTime();
        window.clearTimeout(phaseTimer);
        setOpen(root, false);
        setVisible(root, false);
    }

    function isEngaged(root) {
        return root.classList.contains(OPEN_CLASS) ||
            root.contains(document.activeElement) ||
            (root.matches && root.matches(':hover'));
    }

    /* Bekleme, gösterim ve kaybolma aşamalarını aktif süreye göre yönetir. */
    function updatePhase() {
        var root = document.getElementById(ROOT_ID);
        window.clearTimeout(phaseTimer);
        if (!root) return;

        if (session.done) {
            setVisible(root, false);
            return;
        }

        // Sekme arka plandayken süre durur; görünür olunca kalan süreden devam edilir.
        if (document.hidden) return;

        var active = getActiveTime();

        if (session.shownAt === null) {
            if (active < SHOW_AFTER_MS) {
                setVisible(root, false);
                phaseTimer = window.setTimeout(updatePhase, SHOW_AFTER_MS - active);
                return;
            }
            session.shownAt = active;
            saveSession();
        }

        var remaining = session.shownAt + VISIBLE_FOR_MS - active;
        if (remaining > 0) {
            setVisible(root, true);
            phaseTimer = window.setTimeout(updatePhase, remaining);
            return;
        }

        // Ziyaretçi davetle ilgileniyorsa (açık panel, odak, fare) süre dolsa da beklenir.
        if (isEngaged(root)) {
            setVisible(root, true);
            phaseTimer = window.setTimeout(updatePhase, RECHECK_MS);
            return;
        }

        dismiss(root);
    }

    function bindEvents(root) {
        if (root.getAttribute('data-ots-register-bound') === 'true') return;
        root.setAttribute('data-ots-register-bound', 'true');

        var tab = root.querySelector('.ots-sticky-register-tab');
        var hide = root.querySelector('.ots-sticky-register-hide');
        var close = root.querySelector('.ots-sticky-register-close');
        var later = root.querySelector('.ots-sticky-register-dismiss');
        var register = root.querySelector('.ots-sticky-register-cta');

        tab.addEventListener('click', function () {
            setOpen(root, !root.classList.contains(OPEN_CLASS));
        });

        // Sekmedeki küçük kapatma, paneldeki × ve "Şimdi değil" daveti oturum boyunca gizler.
        [hide, close, later].forEach(function (button) {
            if (!button) return;
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                dismiss(root);
            });
        });

        register.addEventListener('click', function () {
            dismiss(root);
            openRegistration();
        });

        document.addEventListener('keydown', function (event) {
            if (!root.isConnected) return;
            if (event.key === 'Escape' && root.classList.contains(OPEN_CLASS)) {
                setOpen(root, false);
                tab.focus({ preventScroll: true });
            }
        });

        document.addEventListener('click', function (event) {
            if (!root.isConnected) return;
            if (root.classList.contains(OPEN_CLASS) && !root.contains(event.target)) {
                setOpen(root, false);
            }
        });
    }

    function ensureWidget() {
        if (!document.body) return null;

        addStyles();

        var root = createWidget();
        bindEvents(root);
        syncMemberState(root);
        updatePhase();
        return root;
    }

    function startWatchdog() {
        if (watchdogStarted) return;
        watchdogStarted = true;

        if (window.MutationObserver && document.body) {
            var observer = new MutationObserver(function (records) {
                var relevant = !document.getElementById(ROOT_ID) || records.some(function (record) {
                    var target = record.target;
                    if (target && target.closest && target.closest('#divMemberPanel, #' + ROOT_ID)) return true;

                    return Array.prototype.some.call(record.addedNodes, function (node) {
                        return node && node.nodeType === 1 && (
                            node.id === ROOT_ID ||
                            node.id === 'divMemberPanel' ||
                            (node.querySelector && node.querySelector('#' + ROOT_ID + ', #divMemberPanel'))
                        );
                    }) || Array.prototype.some.call(record.removedNodes, function (node) {
                        return node && node.nodeType === 1 && (
                            node.id === ROOT_ID ||
                            node.id === 'divMemberPanel' ||
                            (node.querySelector && node.querySelector('#' + ROOT_ID + ', #divMemberPanel'))
                        );
                    });
                });

                if (relevant) ensureWidget();
            });

            observer.observe(document.body, { childList: true, subtree: true });
        }

        window.addEventListener('pageshow', function () {
            ensureWidget();
        });

        document.addEventListener('visibilitychange', function () {
            commitActiveTime();
            if (!document.hidden) ensureWidget();
        });

        // Sayfadan çıkarken aktif süre kaydedilir; sonraki sayfada kaldığı yerden devam eder.
        window.addEventListener('pagehide', commitActiveTime);
    }

    function init() {
        ensureWidget();
        startWatchdog();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
}());
/* ========================================================================
 * BÖLÜM 17: ÜSTÜ ÇİZİLİ İNDİRİMLİ FİYAT VE BİRİM FİYAT GÖSTERİMİ
 *
 * Özel Alan 4'teki indirim oranına göre indirimli tutarı ve önceki fiyatı gösterir.
 * ====================================================================== */
(function () {
    'use strict';

    if (window.__otsCalculatedOldPriceLoaded) return;
    window.__otsCalculatedOldPriceLoaded = true;

    var STYLE_ID = 'otsCategoryCalculatedOldPriceStyles';
    var OLD_PRICE_CLASS = 'ots-category-calculated-old-price';

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .ProductList .productItem .ozelAlan4,
            #ProductPageProductList .productItem .ozelAlan4 {
                display: none !important;
            }

            .ProductList .productItem .ots-unit-price,
            #ProductPageProductList .productItem .ots-unit-price {
                display: none !important;
            }

            .ProductList .productItem .productPrice,
            .ProductList .productItem .productPrice .discountPriceSpan,
            .ProductList .productItem .productPrice .salePrice,
            .ProductList .productItem .productPrice .price,
            .ProductList .productItem .ots-home-unit-price,
            #ProductPageProductList .productItem .productPrice,
            #ProductPageProductList .productItem .productPrice .discountPriceSpan,
            #ProductPageProductList .productItem .productPrice .salePrice,
            #ProductPageProductList .productItem .productPrice .price,
            #ProductPageProductList .productItem .ots-home-unit-price {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
            }

            .ProductList .productItem .${OLD_PRICE_CLASS},
            #ProductPageProductList .productItem .${OLD_PRICE_CLASS} {
                display: inline-block !important;
                width: auto;
                max-width: 100%;
                margin: 0 7px 0 0 !important;
                padding: 0 !important;
                color: #8a91a3 !important;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                font-size: 13px !important;
                font-weight: 100 !important;
                line-height: 1.2 !important;
                letter-spacing: 0 !important;
                text-decoration: line-through !important;
                text-decoration-thickness: 1.5px !important;
                text-decoration-color: #a7a3a3 !important;
                white-space: nowrap !important;
            }

            .ProductList .productItem .ots-discounted-price,
            #ProductPageProductList .productItem .ots-discounted-price {
                color: #d72638 !important;
                font-weight: 800 !important;
            }

            @media (max-width: 767px) {
                .ProductList .productItem .${OLD_PRICE_CLASS},
                #ProductPageProductList .productItem .${OLD_PRICE_CLASS} {
                    margin-right: 5px !important;
                    font-size: 9px !important;
                }
            }
        `;

        (document.head || document.documentElement).appendChild(style);
    }

    function parseTurkishNumber(value) {
        var clean = String(value || '').replace(/\s/g, '').replace(/[^\d,.-]/g, '');
        var comma = clean.lastIndexOf(',');
        var dot = clean.lastIndexOf('.');

        if (comma > -1 && dot > -1) {
            clean = comma > dot
                ? clean.replace(/\./g, '').replace(',', '.')
                : clean.replace(/,/g, '');
        } else if (comma > -1) {
            clean = clean.length - comma - 1 <= 2
                ? clean.replace(/\./g, '').replace(',', '.')
                : clean.replace(/,/g, '');
        } else if (dot > -1 && clean.length - dot - 1 > 2) {
            clean = clean.replace(/\./g, '');
        }

        var parsed = Number(clean);
        return Number.isFinite(parsed) ? parsed : NaN;
    }

    function readPercentage(source) {
        if (!source) return NaN;

        var text = source.textContent.trim();
        var match = text.match(/%\s*(-?\d+(?:[.,]\d+)?)/) ||
            text.match(/(-?\d+(?:[.,]\d+)?)\s*%/) ||
            text.match(/^\s*(-?\d+(?:[.,]\d+)?)\s*$/);
        if (!match) return NaN;

        var percentage = Number.parseFloat(match[1].replace(',', '.'));
        // %100 fiyatı sıfırlar ve sonsuz geri yükleme döngüsüne girer; geçerli aralık 0-100 (hariç).
        return percentage > 0 && percentage < 100 ? percentage : NaN;
    }

    function readMainPrice(priceElement) {
        if (!priceElement) return NaN;

        var clone = priceElement.cloneNode(true);
        var ignored = clone.querySelectorAll(
            '.ots-home-unit-price, .' + OLD_PRICE_CLASS
        );

        Array.prototype.forEach.call(ignored, function (element) {
            element.remove();
        });

        return parseTurkishNumber(clone.textContent);
    }

    function getPackageQuantity(card) {
        var name = card.querySelector('.productName a, .productName');
        var match = String(name ? name.textContent : '').match(
            /(?:^|[\s(])(\d+)\s*['’ʼ]?\s*[lL][ıiİIuUüÜ](?=$|[\s),])/
        );
        var quantity = match ? Number(match[1]) : 0;
        return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : 0;
    }

    function updateHomeUnitPrice(card, priceElement) {
        var current = priceElement && priceElement.querySelector('.ots-home-unit-price');
        var quantity = getPackageQuantity(card);
        var total = readMainPrice(priceElement);

        if (!priceElement || !quantity || !Number.isFinite(total) || total <= 0) {
            if (current) current.remove();
            return;
        }

        var unitText = (total / quantity).toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        if (!current) {
            current = document.createElement('span');
            current.className = 'ots-home-unit-price';
            priceElement.appendChild(current);
        }

        var label = '( ' + unitText + ' / adet )';
        var ariaLabel = 'Adet fiyatı ' + unitText + ' Türk lirası';
        if (current.textContent !== label) current.textContent = label;
        if (current.getAttribute('aria-label') !== ariaLabel) current.setAttribute('aria-label', ariaLabel);
    }


    function formatPrice(value) {
        try {
            return new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        } catch (error) {
            return '₺' + value.toFixed(2)
                .replace('.', ',')
                .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }
    }

    function pricesEqual(first, second) {
        return Number.isFinite(first) && Number.isFinite(second) && Math.abs(first - second) < 0.005;
    }

    function setPrimaryPriceText(priceElement, formattedPrice) {
        var textNode = null;

        Array.prototype.some.call(priceElement.childNodes, function (node) {
            if (node.nodeType === 3 && /\d/.test(node.textContent)) {
                textNode = node;
                return true;
            }
            return false;
        });

        if (textNode) {
            if (textNode.nodeValue.trim() !== formattedPrice) textNode.nodeValue = formattedPrice;
            return;
        }

        var oldPrice = priceElement.querySelector('.' + OLD_PRICE_CLASS);
        var referenceNode = oldPrice ? oldPrice.nextSibling : priceElement.firstChild;
        priceElement.insertBefore(document.createTextNode(formattedPrice), referenceNode);
    }

    function getBasePrice(priceElement) {
        var visiblePrice = readMainPrice(priceElement);
        var storedBase = Number.parseFloat(priceElement.dataset.otsBasePrice || '');
        var lastDiscounted = Number.parseFloat(priceElement.dataset.otsDiscountedPrice || '');

        if (!Number.isFinite(visiblePrice) || visiblePrice <= 0) return NaN;

        if (!Number.isFinite(storedBase) ||
            (!pricesEqual(visiblePrice, lastDiscounted) && !pricesEqual(visiblePrice, storedBase))) {
            storedBase = visiblePrice;
            priceElement.dataset.otsBasePrice = String(storedBase);
        }

        return storedBase;
    }

    function removeOldPrice(card) {
        var oldPrice = card.querySelector('.' + OLD_PRICE_CLASS);
        if (oldPrice) oldPrice.remove();
        card.querySelectorAll('.ots-discounted-price').forEach(function (price) {
            price.classList.remove('ots-discounted-price');
        });
        card.removeAttribute('data-ots-old-price-ready');
    }

    function removeLegacyUnitPrices(card) {
        card.querySelectorAll('.ots-unit-price').forEach(function (unitPrice) {
            unitPrice.remove();
        });
    }

    function restoreBasePrice(card, priceElement) {
        if (priceElement) {
            var storedBase = Number.parseFloat(priceElement.dataset.otsBasePrice || '');

            if (Number.isFinite(storedBase) && storedBase > 0) {
                setPrimaryPriceText(priceElement, formatPrice(storedBase));
            }

            delete priceElement.dataset.otsBasePrice;
            delete priceElement.dataset.otsDiscountedPrice;
            priceElement.removeAttribute('aria-label');
            updateHomeUnitPrice(card, priceElement);
        }

        removeOldPrice(card);
    }

    function updateCard(card) {
        if (!card || !card.querySelector) return;

        removeLegacyUnitPrices(card);

        var source = card.querySelector('.ozelAlan4');
        var priceElement = card.querySelector(
            '.productPrice .discountPriceSpan, ' +
            '.productPrice .salePrice, ' +
            '.productPrice .price'
        );
        var priceBlock = priceElement && priceElement.closest('.productPrice');
        var percentage = readPercentage(source);
        var basePrice = priceElement ? getBasePrice(priceElement) : NaN;

        if (!source || !priceElement || !priceBlock ||
            !Number.isFinite(percentage) || !Number.isFinite(basePrice) || basePrice <= 0) {
            restoreBasePrice(card, priceElement);
            return;
        }

        // Ekranda gösterilen kuruşa yuvarlanır; yuvarlanmamış değer saklanırsa
        // gözlemci gösterilen fiyatı yeni taban sanıp indirimi ikinci kez uygular.
        var discountedPrice = Math.round(basePrice * (100 - percentage)) / 100;
        var formattedBasePrice = formatPrice(basePrice);
        var formattedDiscountedPrice = formatPrice(discountedPrice);
        var oldPrice = card.querySelector('.' + OLD_PRICE_CLASS);

        if (!oldPrice) {
            oldPrice = document.createElement('span');
            oldPrice.className = OLD_PRICE_CLASS;
            priceElement.insertBefore(oldPrice, priceElement.firstChild);
        } else if (oldPrice.parentElement !== priceElement) {
            priceElement.insertBefore(oldPrice, priceElement.firstChild);
        }

        if (oldPrice.textContent !== formattedBasePrice ||
            oldPrice.dataset.basePrice !== String(basePrice) ||
            oldPrice.dataset.percentage !== String(percentage)) {
            oldPrice.textContent = formattedBasePrice;
            oldPrice.dataset.basePrice = String(basePrice);
            oldPrice.dataset.percentage = String(percentage);
            oldPrice.setAttribute(
                'aria-label',
                'İndirim öncesi fiyat ' + formattedBasePrice
            );
        }

        setPrimaryPriceText(priceElement, formattedDiscountedPrice);
        priceElement.classList.add('ots-discounted-price');
        updateHomeUnitPrice(card, priceElement);
        priceElement.dataset.otsBasePrice = String(basePrice);
        priceElement.dataset.otsDiscountedPrice = String(discountedPrice);
        priceElement.setAttribute(
            'aria-label',
            'Yüzde ' + percentage + ' indirimli satış fiyatı ' + formattedDiscountedPrice
        );

        source.setAttribute('aria-hidden', 'true');
        source.dataset.otsPricePercentageSource = 'true';
        card.setAttribute('data-ots-old-price-ready', 'true');
    }

    function updateAllCards() {
        var cards = document.querySelectorAll(
            '#ProductPageProductList .productItem, ' +
            '.ProductList .productItem'
        );

        updateCards(cards);
        return cards.length;
    }

    function updateCards(cards) {
        Array.prototype.forEach.call(cards, updateCard);
    }

    function addAffectedCard(cards, card) {
        if (card && cards.indexOf(card) === -1) cards.push(card);
    }

    function collectAffectedCards(mutations) {
        var cards = [];
        var needsFullUpdate = false;

        mutations.forEach(function (mutation) {
            var target = mutation.target.nodeType === 3 ? mutation.target.parentElement : mutation.target;
            if (!target || target.closest('.' + OLD_PRICE_CLASS + ', .ots-home-unit-price')) return;

            addAffectedCard(cards, target.closest('.productItem'));
            if (target.matches && target.matches('#ProductPageProductList, .ProductList')) {
                needsFullUpdate = true;
            }

            Array.prototype.forEach.call(mutation.addedNodes || [], function (node) {
                if (!node || node.nodeType !== 1) return;
                if (node.matches && node.matches('.productItem')) addAffectedCard(cards, node);
                if (node.querySelectorAll) {
                    Array.prototype.forEach.call(node.querySelectorAll('.productItem'), function (card) {
                        addAffectedCard(cards, card);
                    });
                }
            });
        });

        return { cards: cards, needsFullUpdate: needsFullUpdate };
    }

    /* Fiyat senkronizasyonunu tüm sayfa yerine ürün listesiyle sınırlar.
       Liste geç yüklenirse kısa ömürlü bir başlangıç gözlemcisi hedefi bulur;
       böylece header, modal ve sepet değişimleri bu modülü tetiklemez. */
    function observeProductList() {
        if (!window.MutationObserver) return;

        // Ana sayfada birden çok vitrin listesi bulunur; her biri ayrı izlenir.
        // İç içe listelerde yalnızca dıştaki gözlemlenir.
        var attachedLists = [];

        function attachAll() {
            Array.prototype.forEach.call(document.querySelectorAll('#ProductPageProductList, .ProductList'), function (list) {
                var covered = attachedLists.some(function (attached) { return attached.contains(list); });
                if (!covered) attach(list);
            });
        }

        function attach(list) {
            if (!list) return false;
            attachedLists.push(list);
            var observer = new MutationObserver(function (mutations) {
                var affected = collectAffectedCards(mutations);

                // Gözlemci geri çağrısı çizimden önce çalışır; fiyat ara karesini önler.
                if (affected.cards.length) updateCards(affected.cards);
                else if (affected.needsFullUpdate) updateAllCards();
            });

            observer.observe(list, {
                childList: true,
                subtree: true,
                characterData: true
            });
            return true;
        }

        attachAll();

        // Geç yüklenen vitrinler için başlangıç gözlemcisi 15 saniye boyunca yeni listeleri bağlar.
        var bootstrapTimer = null;
        var bootstrapObserver = new MutationObserver(function () {
            if (bootstrapTimer) return;
            bootstrapTimer = window.setTimeout(function () {
                bootstrapTimer = null;
                var before = attachedLists.length;
                attachAll();
                if (attachedLists.length > before) updateAllCards();
            }, 150);
        });
        bootstrapObserver.observe(document.documentElement, { childList: true, subtree: true });
        window.setTimeout(function () { bootstrapObserver.disconnect(); }, 15000);
    }

    function init() {
        addStyles();
        updateAllCards();
        observeProductList();

        window.addEventListener('pageshow', updateAllCards);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
}());
/* ========================================================================
 * BÖLÜM 18: SABİT (STICKY) HEADER
 *
 * Site header'ını (#header; ana sayfada .homeHeader, kategoride .categoryHeader)
 * sayfa kaydırılırken üstte sabit tutar. Header yapışınca hafif gölge eklenir.
 * Header yüksekliği --ots-header-height değişkenine yazılır; kategori filtre
 * çubuğu gibi diğer sticky alanlar bu değer kadar aşağıdan yapışır.
 * ====================================================================== */
(function () {
    'use strict';

    if (window.__otsStickyHeaderLoaded) return;
    window.__otsStickyHeaderLoaded = true;

    var STYLE_ID = 'otsStickyHeaderStyles';
    var SENTINEL_ID = 'otsStickyHeaderSentinel';
    var STUCK_CLASS = 'ots-header-stuck';
    var HEIGHT_VAR = '--ots-header-height';

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            #header {
                position: sticky !important;
                top: 0 !important;
                z-index: 1000 !important;
                transition: box-shadow .2s ease;
            }

            #header.${STUCK_CLASS} {
                box-shadow: 0 6px 18px rgba(12,21,76,.08);
            }

            #${SENTINEL_ID} {
                display: block;
                height: 0;
                margin: 0;
                padding: 0;
            }

            @media print {
                #header {
                    position: static !important;
                }
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    // Header yüksekliğini diğer sticky alanların kullanması için kök değişkene yazar.
    function watchHeight(header) {
        var root = document.documentElement;
        var lastHeight = -1;

        function update() {
            var height = Math.round(header.getBoundingClientRect().height);
            if (height === lastHeight) return;
            lastHeight = height;
            root.style.setProperty(HEIGHT_VAR, height + 'px');
        }

        update();
        if (window.ResizeObserver) new window.ResizeObserver(update).observe(header);
        else window.addEventListener('resize', update, { passive: true });
    }

    // Header'ın hemen önündeki görünmez işaret ekrandan çıkınca header yapışmış demektir.
    // Kaydırma olayı dinlenmediği için performans maliyeti yoktur.
    function watchStuckState(header) {
        if (!window.IntersectionObserver) return;

        var sentinel = document.getElementById(SENTINEL_ID);
        if (!sentinel) {
            sentinel = document.createElement('div');
            sentinel.id = SENTINEL_ID;
            sentinel.setAttribute('aria-hidden', 'true');
            header.parentNode.insertBefore(sentinel, header);
        }

        new window.IntersectionObserver(function (entries) {
            var stuck = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
            if (header.classList.contains(STUCK_CLASS) !== stuck) header.classList.toggle(STUCK_CLASS, stuck);
        }).observe(sentinel);
    }

    function init() {
        var header = document.getElementById('header');
        if (!header || !header.parentNode) return;

        addStyles();
        watchHeight(header);
        watchStuckState(header);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
}());

/* ========================================================================
 * BÖLÜM 19: TÜKENDİ ETİKETİ
 *
 * Ticimax'ın ürün kartlarındaki .TukendiIco etiketini görünür ve belirgin yapar.
 * Panel CSS'indeki 480px altı kural (padding: 0 170px) etiketi kartın dışına
 * taşıdığı için mobilde yazı görünmüyordu; burada etiket kart genişliğine
 * sığdırılır, marka rengine çekilir ve tükenen ürünün görseli soluklaştırılır.
 * ====================================================================== */
(function () {
    'use strict';

    if (window.__otsSoldOutBadgeLoaded) return;
    window.__otsSoldOutBadgeLoaded = true;

    var STYLE_ID = 'otsSoldOutBadgeStyles';

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .productItem .TukendiIco span {
                box-sizing: border-box !important;
                width: max-content !important;
                max-width: calc(100% - 20px) !important;
                height: 34px !important;
                padding: 0 18px !important;
                overflow: hidden !important;
                color: #fff !important;
                background: #0c154c !important;
                border-radius: 999px !important;
                box-shadow: 0 6px 18px rgba(12, 21, 76, .28) !important;
                font-size: 13px !important;
                font-weight: 700 !important;
                line-height: 34px !important;
                letter-spacing: .08em !important;
                text-overflow: ellipsis !important;
                text-transform: uppercase !important;
                white-space: nowrap !important;
            }

            .productItem:has(.TukendiIco) .productImage img,
            .productItem.StokYok .productImage img {
                filter: grayscale(1) saturate(0) !important;
                opacity: .62 !important;
            }

            @media (max-width: 768px) {
                .productItem .TukendiIco span {
                    max-width: calc(100% - 12px) !important;
                    height: 26px !important;
                    padding: 0 12px !important;
                    font-size: 11px !important;
                    line-height: 26px !important;
                    letter-spacing: .06em !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    if (document.head) {
        addStyles();
    } else {
        document.addEventListener('DOMContentLoaded', addStyles, { once: true });
    }
}());

/* ========================================================================
 * BÖLÜM 20: ANA SAYFA BANNERLARI TAM GENİŞLİK
 *
 * Ana sayfadaki resim bloklarını (section[id^="resimblok_"]) her ekran
 * boyutunda %100 genişliğe yayar. Ticimax'ın .ticiContainer kutusundaki
 * max-width/padding ve .txrow kenar boşlukları sıfırlanır; görsel link ve
 * lazy yüklenen görsel kap genişliğini tam doldurur.
 * ====================================================================== */
(function () {
    'use strict';

    if (window.__otsFullWidthBannersLoaded) return;
    window.__otsFullWidthBannersLoaded = true;

    var STYLE_ID = 'otsFullWidthBannerStyles';

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            #mainHolder_divDesign section[id^="resimblok_"] .ticiContainer.hazirBlokContent {
                width: 100% !important;
                max-width: 100% !important;
                padding: 0 !important;
            }

            #mainHolder_divDesign section[id^="resimblok_"] .txrow {
                margin: 0 !important;
            }

            #mainHolder_divDesign section[id^="resimblok_"] a.blokResimLink {
                display: block;
                width: 100%;
            }

            #mainHolder_divDesign section[id^="resimblok_"] a.blokResimLink img.lazyImage {
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                display: block;
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    if (document.head) {
        addStyles();
    } else {
        document.addEventListener('DOMContentLoaded', addStyles, { once: true });
    }
}());
