/*
 * ÖTS İÇ GİYİM - SEPET SAYFASI MODÜLLERİ
 *
 * Yükleme adresi : https://ornekler.com.tr/js/ots/sepet.js
 * Çalıştığı yer  : Checkout (/checkout) sayfası; tumsayfalar.js Bölüm 2 tarafından yüklenir
 *
 * Ticimax checkout uygulamasındaki boş sepet görünümünü, hediye çarkını ve
 * ücretsiz kargo ilerleme çubuğunu yönetir.
 * Her bölüm kendi kapsamında (IIFE) bağımsız çalışır.
 *
 * Bölümler:
 *  1. Boş sepet görünümü
 *  2. Dinamik hediye çarkı (devre dışı)
 *  3. Ücretsiz kargo ilerleme çubuğu ve sepet indirimi hedefi
 *  4. Sepet adımında WhatsApp butonunu gizleme
 */

/* ========================================================================
 * BÖLÜM 1: BOŞ SEPET GÖRÜNÜMÜ
 *
 * Sepette ürün bulunmadığında açıklayıcı boş durum ekranını ve alışverişe dönüş çağrısını gösterir.
 * Ticimax sepet içeriği sonradan değiştiğinde boş sepet görünümünü yeniden kontrol eder.
 * ====================================================================== */
(function () {
    'use strict';

    // Dosya doğrudan ve ortak yükleyiciyle aynı anda çağrılsa bile boş sepet
    // modülünü yalnızca bir kez başlatır.
    if (!/^\/checkout(?:\/|$)/i.test(window.location.pathname || '')) return;
    if (window.__otsCheckoutEmptyCartV3) return;
    window.__otsCheckoutEmptyCartV3 = true;
    window.__otsCheckoutScriptV3 = true;

    /* Boş sepet kartının tüm stillerini tek bir style etiketi altında kurar.
       Bu sayede Vue yeniden render yapsa bile CSS tekrar eklenmez. */
    function addStyles() {
        if (document.getElementById('otsEmptyCartStyles')) return;

        var style = document.createElement('style');
        style.id = 'otsEmptyCartStyles';
        style.textContent = `
            :root {
                --ots-empty-ink: #0c154c;
                --ots-empty-ink-2: #1a2357;
                --ots-empty-muted: #5f6680;
                --ots-empty-soft: #f2f4fa;
                --ots-empty-line: #d9deee;
                --ots-empty-card: rgba(255, 255, 255, .84);
            }

            #otsEmptyCart,
            #otsEmptyCart * {
                box-sizing: border-box;
            }

            #otsEmptyCart {
                position: relative;
                isolation: isolate;
                min-height: 0;
                padding: 0;
                overflow: hidden;
                background: transparent;
            }

            #otsEmptyCart::before,
            #otsEmptyCart::after {
                display: none;
            }

            #otsEmptyCart::before {
                width: 620px;
                height: 620px;
                right: -260px;
                top: -280px;
                border: 1px solid rgba(12,21,76,.14);
                box-shadow: 0 0 0 76px rgba(12,21,76,.035), 0 0 0 152px rgba(12,21,76,.018);
            }

            #otsEmptyCart::after {
                width: 420px;
                height: 420px;
                left: -190px;
                bottom: -210px;
                background: rgba(12,21,76,.055);
                filter: blur(4px);
            }

            .ots-empty-shell {
                width: min(1180px, 100%);
                min-height: 0;
                display: grid;
                grid-template-columns: minmax(0, 1fr) minmax(220px, .72fr);
                align-items: center;
                gap: clamp(20px, 3vw, 36px);
                margin: 0 auto;
                padding: clamp(22px, 3vw, 38px);
                border: 1px solid rgba(12,21,76,.10);
                border-radius: 24px;
                background: var(--ots-empty-card);
                box-shadow: 0 14px 36px rgba(12,21,76,.10);
                backdrop-filter: none;
                animation: otsEmptyIn .72s cubic-bezier(.2,.7,.2,1) both;
            }

            .ots-empty-copy {
                max-width: 550px;
            }

            .ots-empty-kicker {
                display: inline-flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 14px;
                color: var(--ots-empty-muted);
                font-size: 11px;
                font-weight: 700;
                letter-spacing: .18em;
                text-transform: uppercase;
            }

            .ots-empty-kicker::before {
                content: '';
                width: 34px;
                height: 1px;
                background: currentColor;
            }

            .ots-empty-logo {
                width: 108px;
                height: auto;
                display: block;
                margin: 0 0 18px;
            }

            .ots-empty-copy h1 {
                margin: 0;
                color: var(--ots-empty-ink);
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                font-size: clamp(28px, 3.2vw, 46px);
                font-weight: 600;
                line-height: .96;
                letter-spacing: -.065em;
            }

            .ots-empty-copy p {
                max-width: 430px;
                margin: 15px 0 0;
                color: var(--ots-empty-muted);
                font-size: 15px;
                line-height: 1.6;
            }

            .ots-empty-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                margin-top: 24px;
            }

            .ots-empty-btn {
                min-height: 46px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                padding: 0 19px;
                color: var(--ots-empty-ink);
                font-size: 13px;
                font-weight: 700;
                letter-spacing: .02em;
                text-decoration: none;
                border: 1px solid rgba(12,21,76,.18);
                border-radius: 999px;
                background: #fff;
                transition: transform .22s, border-color .22s, background .22s, color .22s;
            }

            .ots-empty-btn-primary {
                color: #fff;
                border-color: var(--ots-empty-ink);
                background: var(--ots-empty-ink);
            }

            .ots-empty-btn:hover {
                transform: translateY(-2px);
                border-color: var(--ots-empty-ink);
            }

            .ots-empty-btn-primary:hover {
                background: var(--ots-empty-ink-2);
            }

            .ots-empty-cues {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 10px;
                grid-column: 1 / -1;
                margin: 0;
            }

            .ots-empty-cue {
                min-height: 0;
                padding: 12px;
                border: 1px solid rgba(12,21,76,.1);
                border-radius: 14px;
                background: rgba(255,255,255,.62);
            }

            .ots-empty-cue strong {
                display: block;
                margin-bottom: 5px;
                color: var(--ots-empty-ink);
                font-size: 12px;
            }

            .ots-empty-cue span {
                display: block;
                color: var(--ots-empty-muted);
                font-size: 11px;
                line-height: 1.45;
            }

            .ots-empty-visual {
                position: relative;
                min-height: 300px;
                display: grid;
                place-items: center;
                overflow: hidden;
                border: 1px solid rgba(12,21,76,.1);
                border-radius: 20px;
                background:
                    linear-gradient(145deg, rgba(255,255,255,.86), rgba(232,236,248,.74)),
                    var(--ots-empty-soft);
            }

            .ots-empty-visual::before {
                content: '';
                position: absolute;
                inset: 17%;
                border: 1px solid rgba(12,21,76,.1);
                border-radius: 50%;
                box-shadow: 0 0 0 25px rgba(12,21,76,.03), 0 0 0 50px rgba(12,21,76,.016);
            }

            .ots-empty-badge {
                position: absolute;
                top: 14px;
                right: 14px;
                z-index: 2;
                padding: 10px 14px;
                color: var(--ots-empty-ink);
                font-size: 11px;
                font-weight: 700;
                letter-spacing: .12em;
                text-transform: uppercase;
                border: 1px solid rgba(12,21,76,.14);
                border-radius: 999px;
                background: rgba(255,255,255,.72);
                backdrop-filter: blur(12px);
            }

            .ots-empty-image {
                position: relative;
                z-index: 1;
                width: min(190px, 63%);
                height: auto;
                display: block;
                filter: grayscale(1) contrast(.95);
                mix-blend-mode: multiply;
                animation: otsEmptyFloat 4.5s ease-in-out infinite;
            }

            .ots-empty-categories {
                position: absolute;
                left: 12px;
                right: 12px;
                bottom: 12px;
                z-index: 3;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                justify-content: center;
            }

            .ots-empty-categories a {
                padding: 6px 8px;
                color: var(--ots-empty-ink);
                font-size: 10px;
                font-weight: 700;
                text-decoration: none;
                border: 1px solid rgba(12,21,76,.12);
                border-radius: 999px;
                background: rgba(255,255,255,.72);
                backdrop-filter: blur(10px);
                transition: background .2s, transform .2s;
            }

            .ots-empty-categories a:hover {
                background: #fff;
                transform: translateY(-1px);
            }

            @keyframes otsEmptyIn {
                from { opacity: 0; transform: translateY(18px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @keyframes otsEmptyFloat {
                0%, 100% { transform: translateY(0) rotate(-1deg); }
                50% { transform: translateY(-12px) rotate(1deg); }
            }

            @media (max-width: 900px) {
                #otsEmptyCart {
                    padding: 0;
                }

                .ots-empty-shell {
                    grid-template-columns: 1fr;
                    padding: 24px;
                    border-radius: 20px;
                }

                .ots-empty-copy {
                    max-width: none;
                    text-align: center;
                }

                .ots-empty-kicker {
                    justify-content: center;
                }

                .ots-empty-logo {
                    margin-left: auto;
                    margin-right: auto;
                }

                .ots-empty-actions {
                    justify-content: center;
                }

                .ots-empty-cues {
                    width: 100%;
                }

                .ots-empty-visual {
                    min-height: 240px;
                    order: -1;
                }

                .ots-empty-image {
                    width: min(170px, 65%);
                }
            }

            @media (max-width: 560px) {
                #otsEmptyCart {
                    padding: 0;
                }

                .ots-empty-shell {
                    padding: 20px 16px;
                    border-radius: 18px;
                    gap: 20px;
                }

                .ots-empty-visual {
                    min-height: 175px;
                    border-radius: 16px;
                }

                .ots-empty-image {
                    width: min(145px, 62%);
                }

                .ots-empty-badge {
                    top: 16px;
                    right: 16px;
                    font-size: 9px;
                }

                .ots-empty-copy h1 {
                    font-size: 31px;
                }

                .ots-empty-copy p {
                    margin-top: 16px;
                    font-size: 13px;
                }

                .ots-empty-actions {
                    display: grid;
                    grid-template-columns: 1fr;
                }

                .ots-empty-btn {
                    width: 100%;
                }

                .ots-empty-cues {
                    grid-template-columns: 1fr;
                    margin-top: 26px;
                }

                .ots-empty-categories {
                    position: static;
                    margin-top: -10px;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .ots-empty-shell,
                .ots-empty-image {
                    animation: none;
                }

                #otsEmptyCart * {
                    transition-duration: .01ms !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /* Vue checkout hazır olmadan #app alanını değiştirmemek için yalnızca
       platformun boş-sepet başlığını gördüğümüzde tasarımı devreye alırız. */
    /* Ticimax'ın boş sepet başlığından en dar güvenli kapsayıcıyı bulur.
       Arama sadece checkout uygulamasıyla sınırlıdır; diğer sayfalara dokunmaz. */
    function findEmptyCartHost() {
        var title = document.querySelector('#app .empty-cart--title');
        var text = (title && title.textContent || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('tr-TR');
        if (text !== 'sepetin boş' && text !== 'sepetiniz boş') return null;
        return title.closest && title.closest('.v-col-sm-12.v-col-md-8.v-col-lg-6') || title.parentElement;
    }

    /* Yalnızca boş sepet kartını değiştirir; checkout'un öneri ve ürün
       carousel'ları Vue tarafından yönetilmeye devam eder. */
    function renderEmptyCart() {
        if (document.getElementById('otsEmptyCart')) return true;
        var host = findEmptyCartHost();
        if (!host) return false;
        addStyles();

        host.innerHTML = `
            <section id="otsEmptyCart" aria-label="Boş sepet ekranı">
                <div class="ots-empty-shell">
                    <div class="ots-empty-copy">
                        <span class="ots-empty-kicker">Sepet boş</span>
                        <img class="ots-empty-logo" src="https://static.ticimax.cloud/30662/uploads/images/logo/logo.svg" alt="ÖTS">
                        <h1>Sepetinde şu an hiç ürün yok.</h1>
                        <p>Favori iç giyim parçalarını seçmeye başladığında sipariş özetin burada görünecek. Rahatlık, kalite ve günlük kullanım için koleksiyonlara hızlıca dönebilirsin.</p>

                        <div class="ots-empty-actions">
                            <a class="ots-empty-btn ots-empty-btn-primary" href="/">Alışverişe başla <span aria-hidden="true">→</span></a>
                            <a class="ots-empty-btn" href="/UyeGiris">Üye girişi yap</a>
                        </div>

                    </div>

                    <div class="ots-empty-visual" aria-label="ÖTS koleksiyonları">
                        <span class="ots-empty-badge">ÖTS Underwear</span>
                        <svg class="ots-empty-image" viewBox="0 0 180 180" fill="none" aria-hidden="true"><path d="M42 61h96l-10 82H52L42 61Z" fill="#f4c4b5" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M63 61c0-24 12-37 27-37s27 13 27 37" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><circle cx="74" cy="91" r="4" fill="currentColor"/><circle cx="106" cy="91" r="4" fill="currentColor"/><path d="M74 113c10 8 22 8 32 0" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>
                        <nav class="ots-empty-categories" aria-label="Popüler kategoriler">
                            <a href="/erkek-ic-giyim">Erkek İç Giyim</a>
                            <a href="/kadin-ic-giyim">Kadın İç Giyim</a>
                            <a href="/erkek-cocuk">Erkek Çocuk</a>
                            <a href="/kiz-cocuk-ic-giyim">Kız Çocuk</a>
                        </nav>
                    </div>

                    <div class="ots-empty-cues" aria-label="Alışveriş avantajları">
                        <div class="ots-empty-cue">
                            <strong>Güvenli alışveriş</strong>
                            <span>Ödeme adımlarında bilgiler koruma altındadır.</span>
                        </div>
                        <div class="ots-empty-cue">
                            <strong>Kolay takip</strong>
                            <span>Üye girişiyle sipariş durumunu hızlıca görüntüle.</span>
                        </div>
                        <div class="ots-empty-cue">
                            <strong>Geniş koleksiyon</strong>
                            <span>Kadın, erkek ve çocuk iç giyim seçenekleri.</span>
                        </div>
                    </div>
                </div>
            </section>
        `;

        return true;
    }

    /* Vue render'ı gecikebildiği için kısa süreli, tek observer kullanır.
       Periyodik tarama yerine 50 ms debounce ile ana iş parçacığı korunur. */
    function boot() {
        var root = document.documentElement;
        var observer;
        var scheduled = false;
        var stopTimer;

        if (renderEmptyCart() || !window.MutationObserver || !root) return;
        observer = new MutationObserver(function () {
            if (scheduled) return;
            scheduled = true;
            window.setTimeout(function () {
                scheduled = false;
                if (renderEmptyCart()) {
                    observer.disconnect();
                    window.clearTimeout(stopTimer);
                }
            }, 50);
        });
        observer.observe(root, { childList: true, subtree: true });
        stopTimer = window.setTimeout(function () { observer.disconnect(); }, 30000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    window.addEventListener('load', function () {
        window.setTimeout(renderEmptyCart, 650);
    });
}());

/* ========================================================================
 * BÖLÜM 2: DİNAMİK HEDİYE ÇARKI
 *
 * Sepet ve ödeme akışında kampanya çarkını, kazanım sonucunu ve kupon kodunu yönetir.
 * Kazandırılan kodun gösterilmesi ve kopyalanması için kullanıcı arayüzü sağlar.
 *
 * ŞU AN DEVRE DIŞI: Kod yoruma alınmıştır. Tekrar açmak için aşağıdaki
 * satırların başındaki "// " işaretlerini kaldırın (VS Code: satırları seçip
 * Cmd+/ veya Ctrl+/).
 * ====================================================================== */
// /* Çark yöneticisi, kullanıcıya gösterimden sonra yerel tercih kaydını tutar.
//  * Ödül seçimi yalnızca kullanıcı etkileşimiyle yapılır; sayfa yüklenmesini
//  * engelleyen sürekli sayaç veya tekrar eden ağ isteği çalıştırmaz. */
// (function () {
//     if (window.__otsCheckoutGiftWheelV3) return;
//     window.__otsCheckoutGiftWheelV3 = true;
//
//     const currentUrl = window.location.href;
//     const isCheckout = currentUrl.includes('/checkout');
//     const WHEEL_SHOWN_KEY = 'otsWheelShown_v1.0.455';
//
//     /* Yerel depolama kapalı olduğunda dahi çarkın hata vermeden çalışması için
//        okuma işlemini güvenli hale getirir. */
//     function getStoredValue(key) {
//         try { return localStorage.getItem(key); } catch (error) { return null; }
//     }
//
//     /* Çarkın gösterim ve kazanım bilgisini tarayıcı profiline kaydeder.
//        Depolama erişilemezse kullanıcı deneyimi bozulmadan devam eder. */
//     function setStoredValue(key, value) {
//         try { localStorage.setItem(key, value); } catch (error) { /* Depolama engelliyse çark yine çalışır. */ }
//     }
//
//     // Aynı tarayıcı kullanıcısına çark yalnızca bir kez gösterilir.
//     if (getStoredValue('otsWheelSpun_v1.0.454') === 'true' ||
//         getStoredValue(WHEEL_SHOWN_KEY) === 'true') {
//         return;
//     }
//     // Çark yalnızca sepette, sayfa açıldıktan 20 saniye sonra gösterilir.
//     // Önceki sayfalardan kalan oturum süresi bu beklemeyi kısaltmaz.
//     if (!isCheckout) return;
//     const WHEEL_DELAY_MS = 20 * 1000;
//     window.setTimeout(initWheel, WHEEL_DELAY_MS);
//
//     /* Çarkın stilini, erişilebilir diyalog yapısını ve olaylarını tek seferde kurar.
//        Aynı kimlikte bir katman varsa tekrar DOM üretmeyerek çift popup'ı engeller. */
//     function initWheel() {
//         // Çift tetiklenmeyi önlemek için fonksiyon başında son bir kontrol
//         if (document.getElementById('otsWheelOverlay')) return;
//
//         const style = document.createElement('style');
//         style.id = 'otsGiftWheelStyles';
//         style.textContent = `
//       #otsWheelOverlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(44, 62, 80, 0.6); display: none; justify-content: center; align-items: center; z-index: 9999999; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; backdrop-filter: blur(4px); }
//       .otsw-container { background: #fff; padding: 40px 30px; border-radius: 24px; text-align: center; position: relative; width: 400px; max-width: 92%; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
//       .otsw-close { position: absolute; top: 15px; right: 20px; font-size: 28px; background: none; border: none; cursor: pointer; color: #a4b0be; transition: color 0.3s; }
//       .otsw-close:hover { color: #2f3542; }
//       .otsw-container h3 { margin: 0 0 10px 0; color: #2f3542; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;}
//       .otsw-container p { margin: 0 0 25px 0; color: #747d8c; font-size: 14px; line-height: 1.5; }
//       .otsw-wrapper { position: relative; width: 300px; height: 300px; margin: 0 auto 30px auto; }
//       .otsw-pointer { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 18px solid transparent; border-right: 18px solid transparent; border-top: 35px solid #ff7f50; z-index: 10; filter: drop-shadow(0px 4px 4px rgba(0,0,0,0.15)); }
//       .otsw-wheel { width: 100%; height: 100%; border-radius: 50%; position: relative; overflow: hidden; border: 8px solid #ffffff; box-sizing: border-box; box-shadow: 0 0 20px rgba(0,0,0,0.1); background: conic-gradient(#FDEBD0 0deg 60deg, #FADBD8 60deg 120deg, #E8DAEF 120deg 180deg, #D0ECE7 180deg 240deg, #FCF3CF 240deg 300deg, #F5CBA7 300deg 360deg); transition: transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99); }
//       .otsw-slice-text { position: absolute; top: 50%; left: 50%; width: 50%; height: 40px; transform-origin: 0% 50%; margin-top: -20px; font-weight: 800; font-size: 12px; color: #2f3542; text-align: right; padding-right: 25px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; align-items: flex-end; line-height: 1.1; }
//       .otsw-slice-text small { display: block; font-size: 9px; font-weight: 600; color: #57606f; margin-top: 3px; }
//       .otsw-spin-btn { background: #ff7f50; color: #fff; border: none; padding: 15px 0; font-size: 18px; border-radius: 30px; cursor: pointer; font-weight: bold; width: 100%; text-transform: uppercase; box-shadow: 0 8px 15px rgba(0,0,0, 0.1); transition: filter 0.2s, transform 0.2s, box-shadow 0.2s; letter-spacing: 1px; }
//       .otsw-spin-btn:hover { filter: brightness(0.9); transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0, 0.2); }
//       .otsw-spin-btn:disabled { filter: grayscale(1); cursor: not-allowed; box-shadow: none; transform: none;}
//       .otsw-result { margin-top: 20px; padding: 25px 20px; background: #f8f9fa; border-radius: 16px; border: 2px dashed #7bed9f; display: none; animation: otsPopIn 0.5s ease;}
//       .otsw-result h4 { color: #2ed573; margin: 0 0 12px 0; font-size: 22px; text-transform: uppercase;}
//       .otsw-result .code-box { font-size: 28px; font-weight: 900; color: #2f3542; letter-spacing: 3px; margin: 10px 0; background: #fff; padding: 12px 20px; border-radius: 8px; border: 1px solid #dfe4ea; display:inline-block;}
//       .otsw-result small { display: block; margin-bottom: 15px; color: #747d8c; font-size: 13px;}
//       .otsw-copy-btn { background: #2ed573; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; width: 100%; text-transform: uppercase; letter-spacing: 1px; transition: background 0.3s;}
//       .otsw-copy-btn:hover { background: #26de81; }
//       @keyframes otsPopIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
//     `;
//         document.head.appendChild(style);
//
//         const popupHTML = `
//       <div id="otsWheelOverlay">
//         <div class="otsw-container">
//           <button id="otswCloseBtn" class="otsw-close">&times;</button>
//           <h3>ÖTS Fırsat Çarkı</h3>
//           <p>Şansını Dene!<br/>Özel İndirimini Anında Kazan.</p>
//           <div class="otsw-wrapper">
//             <div class="otsw-pointer"></div>
//             <div id="otswWheel" class="otsw-wheel">
//               <div class="otsw-slice-text" style="transform: rotate(-60deg);">%6 İNDİRİM<small>Min 2.500 TL</small></div><div class="otsw-slice-text" style="transform: rotate(0deg);">100 TL<small>Min 2.000 TL</small></div><div class="otsw-slice-text" style="transform: rotate(60deg);">%5 İNDİRİM<small>Min 1.500 TL</small></div><div class="otsw-slice-text" style="transform: rotate(120deg);">50 TL<small>Min 1.000 TL</small></div><div class="otsw-slice-text" style="transform: rotate(180deg);">%3 İNDİRİM<small>Min 750 TL</small></div><div class="otsw-slice-text" style="transform: rotate(240deg);">25 TL<small>Min 500 TL</small></div>
//             </div>
//           </div>
//           <button id="otswSpinBtn" class="otsw-spin-btn">Hemen Çevir</button>
//           <div id="otswResultBox" class="otsw-result">
//             <h4 id="otswResultTitle">Tebrikler!</h4>
//             <div><span id="otswResultCode" class="code-box"></span></div>
//             <small id="otswResultLimit"></small>
//             <button id="otswCopyBtnInner" class="otsw-copy-btn">Kodu Kopyala</button>
//           </div>
//         </div>
//       </div>
//     `;
//
//         const wheelContainer = document.createElement('div');
//         wheelContainer.innerHTML = popupHTML;
//         document.body.appendChild(wheelContainer);
//
//         const overlay = document.getElementById('otsWheelOverlay');
//         const wheel = document.getElementById('otswWheel');
//         const spinBtn = document.getElementById('otswSpinBtn');
//         const closeBtn = document.getElementById('otswCloseBtn');
//         const resultBox = document.getElementById('otswResultBox');
//         const copyBtn = document.getElementById('otswCopyBtnInner');
//
//         const prizes = [
//             { id: 1, text: "%6 İNDİRİM", code: "LlDV1gVQ", limit: "Kullanım Şartı: Min 2.500 TL", prob: 1, angle: 30 },
//             { id: 2, text: "100 TL", code: "NVUNMJTU", limit: "Kullanım Şartı: Min 2.000 TL", prob: 3, angle: 90 },
//             { id: 3, text: "%5 İNDİRİM", code: "YNzQalDU", limit: "Kullanım Şartı: Min 1.500 TL", prob: 8, angle: 150 },
//             { id: 4, text: "50 TL", code: "ORTMSl1U", limit: "Kullanım Şartı: Min 1.000 TL", prob: 12, angle: 210 },
//             { id: 5, text: "%3 İNDİRİM", code: "yQkU0UFT", limit: "Kullanım Şartı: Min 750 TL", prob: 26, angle: 270 },
//             { id: 6, text: "25 TL", code: "BJEOOJFV", limit: "Kullanım Şartı: Min 500 TL", prob: 50, angle: 330 }
//         ];
//
//         let currentRotation = 0;
//
//         // Görünür olduğu anda kalıcı gösterim kaydını oluştur.
//         overlay.style.display = 'flex';
//         setStoredValue(WHEEL_SHOWN_KEY, 'true');
//         // Çark dönerken kapatılırsa kazanılan kod görülmeden "çevrildi" kaydı
//         // oluşuyor ve çark bir daha açılmıyordu; dönüş bitene kadar kapatma beklenir.
//         let spinning = false;
//         closeBtn.addEventListener('click', () => {
//             if (spinning) return;
//             overlay.style.display = 'none';
//         });
//
//         /* Ödül oranlarını ağırlıklı rastgele seçimle değerlendirir. Toplam olasılık
//            değişse dahi son ödül güvenli varsayılan olarak kullanılır. */
//         function getPrize() {
//             let rand = Math.random() * 100;
//             let sum = 0;
//             for (let prize of prizes) {
//                 sum += prize.prob;
//                 if (rand <= sum) return prize;
//             }
//             return prizes[prizes.length - 1];
//         }
//
//         /* Kaynakta ters/Base64 biçiminde tutulan kuponu görünür metne dönüştürür.
//            Beklenmeyen veride arayüzün bozulmaması için güvenli hata metni döner. */
//         function dec(str) {
//             try {
//                 return decodeURIComponent(atob(str.split('').reverse().join('')));
//             } catch (e) { return "HATA"; }
//         }
//
//         spinBtn.addEventListener('click', () => {
//             spinBtn.disabled = true;
//             spinning = true;
//             spinBtn.innerText = "ÇEVRİLİYOR...";
//
//             const selectedPrize = getPrize();
//             const extraSpins = Math.floor(Math.random() * 3) + 6;
//             const targetAngle = 360 - selectedPrize.angle;
//             currentRotation += (extraSpins * 360) + targetAngle;
//             wheel.style.transform = `rotate(${currentRotation}deg)`;
//
//             setTimeout(() => {
//                 document.getElementById('otswResultTitle').innerText = `${selectedPrize.text} Kazandın!`;
//                 document.getElementById('otswResultCode').innerText = dec(selectedPrize.code);
//                 document.getElementById('otswResultLimit').innerText = selectedPrize.limit;
//                 spinBtn.style.display = 'none';
//                 resultBox.style.display = 'block';
//                 spinning = false;
//                 setStoredValue('otsWheelSpun_v1.0.454', 'true');
//             }, 5000);
//         });
//
//         copyBtn.addEventListener('click', () => {
//             const codeText = document.getElementById('otswResultCode').innerText;
//             if (navigator.clipboard && navigator.clipboard.writeText) {
//                 navigator.clipboard.writeText(codeText).then(() => kopyalandi()).catch(() => manuel(codeText));
//             } else {
//                 manuel(codeText);
//             }
//             /* Başarılı veya elle kopyalama sonrasında buton geri bildirimini günceller. */
//             function kopyalandi() {
//                 copyBtn.innerText = "KOPYALANDI!";
//                 copyBtn.style.background = "#2f3542";
//             }
//             /* Clipboard API yoksa kuponu kullanıcıya seçip kopyalayabileceği biçimde sunar. */
//             function manuel(kod) { alert("Kupon Kodunuz: " + kod); kopyalandi(); }
//         });
//     }
// })();

/* ========================================================================
 * BÖLÜM 3: ÜCRETSİZ KARGO İLERLEME ÇUBUĞU VE SEPET İNDİRİMİ HEDEFİ
 *
 * "Alışverişi Tamamla" butonunun üzerinde iki hedef gösterir:
 * 1. Ücretsiz kargo çubuğu: limit, Ticimax checkout uygulamasının sepet
 *    verisinden (basketCargoCompany.freeShipmentLimit) okunur; tanımlı değilse
 *    FALLBACK_LIMIT kullanılır.
 * 2. Sepet indirimi kartı (DISCOUNT_GOAL): belirli tutarın üzerindeki
 *    siparişlerde tanımlı indirime kalan tutarı kupon görünümünde gösterir.
 *    Bu kart yalnızca bilgilendirir; indirimin kendisi Ticimax panelindeki
 *    sepet kampanyasıyla uygulanır, ikisinin değerleri aynı tutulmalıdır.
 * Sepet tutarı değiştikçe iki alan da güncellenir.
 * ====================================================================== */
(function () {
    'use strict';

    if (!/^\/checkout(?:\/|$)/i.test(window.location.pathname || '')) return;
    if (window.__otsFreeShippingBarLoaded) return;
    window.__otsFreeShippingBarLoaded = true;

    // Sistemden limit okunamazsa kullanılacak ücretsiz kargo alt limiti (TL).
    var FALLBACK_LIMIT = 2000;
    // Sepet indirimi hedefi; Ticimax'taki sepet kampanyası ile aynı tutulmalıdır.
    // Kartı kapatmak için enabled: false yapılabilir.
    var DISCOUNT_GOAL = { enabled: true, threshold: 3000, amount: 250 };
    var STYLE_ID = 'otsFreeShippingBarStyles';
    var GOALS_CLASS = 'ots-cart-goals';
    var BAR_CLASS = 'ots-free-shipping';
    var REWARD_CLASS = 'ots-cart-reward';
    var BUTTON_TEXT = 'Alışverişi Tamamla';
    var renderTimer = null;

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .${GOALS_CLASS} {
                display: grid;
                gap: 8px;
                margin: 0 0 12px;
            }

            .${BAR_CLASS} {
                box-sizing: border-box;
                margin: 0;
                padding: 12px 14px;
                color: #0c154c;
                border: 1px solid #e0e6ee;
                border-radius: 12px;
                background: #f7f9fc;
                font-family: inherit;
                text-align: left;
            }

            .${BAR_CLASS}.is-complete {
                border-color: #cfe9da;
                background: #f0f9f4;
            }

            .${BAR_CLASS}__head {
                display: flex;
                align-items: center;
                gap: 9px;
                margin: 0 0 9px;
                font-size: 13px;
                font-weight: 600;
                line-height: 1.35;
            }

            .${BAR_CLASS}__head svg {
                flex: 0 0 auto;
                width: 22px;
                height: 22px;
                color: #0c154c;
            }

            .${BAR_CLASS}.is-complete .${BAR_CLASS}__head svg {
                color: #26744d;
            }

            .${BAR_CLASS}__head strong {
                font-weight: 800;
            }

            .${BAR_CLASS}__track {
                position: relative;
                height: 8px;
                overflow: hidden;
                border-radius: 999px;
                background: #e3e8f0;
            }

            .${BAR_CLASS}__fill {
                display: block;
                width: 0;
                height: 100%;
                border-radius: inherit;
                background: linear-gradient(90deg, #1a2357, #0c154c);
                transition: width .45s cubic-bezier(.2,.78,.28,1);
            }

            .${BAR_CLASS}.is-complete .${BAR_CLASS}__fill {
                background: linear-gradient(90deg, #36a46b, #26744d);
            }

            .${BAR_CLASS}__amount {
                margin: 6px 0 0;
                color: #727d91;
                font-size: 11px;
                font-weight: 600;
                text-align: right;
            }

            /* Sepet indirimi kartı: kupon görünümü, kargo çubuğundan ayrışan kırmızı vurgu. */
            .${REWARD_CLASS} {
                position: relative;
                box-sizing: border-box;
                display: grid;
                grid-template-columns: 40px minmax(0, 1fr);
                gap: 11px;
                align-items: center;
                padding: 11px 14px;
                color: #0c154c;
                border: 1.5px dashed #f0b8bd;
                border-radius: 12px;
                background: #fff7f7;
                font-family: inherit;
                text-align: left;
            }

            /* Kupon kenarındaki yarım daire kesikler. */
            .${REWARD_CLASS}::before,
            .${REWARD_CLASS}::after {
                content: "";
                position: absolute;
                top: 50%;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #fff;
                transform: translateY(-50%);
            }

            .${REWARD_CLASS}::before { left: -7px; border-right: 1.5px dashed #f0b8bd; }
            .${REWARD_CLASS}::after { right: -7px; border-left: 1.5px dashed #f0b8bd; }

            .${REWARD_CLASS}__icon {
                display: grid;
                place-items: center;
                width: 40px;
                height: 40px;
                color: #fff;
                border-radius: 50%;
                background: linear-gradient(135deg, #f04452, #e31d2b);
                box-shadow: 0 6px 14px rgba(227,29,43,.22);
            }

            .${REWARD_CLASS}__icon svg {
                width: 21px;
                height: 21px;
            }

            .${REWARD_CLASS}__title {
                display: flex;
                align-items: center;
                gap: 6px;
                margin: 0;
                font-size: 13px;
                font-weight: 800;
                line-height: 1.3;
            }

            .${REWARD_CLASS}__badge {
                display: none;
                padding: 2px 7px;
                color: #fff;
                border-radius: 999px;
                background: #26744d;
                font-size: 9px;
                font-weight: 800;
                letter-spacing: .06em;
            }

            .${REWARD_CLASS}__text {
                margin: 2px 0 7px;
                color: #5d667a;
                font-size: 12px;
                font-weight: 500;
                line-height: 1.4;
            }

            .${REWARD_CLASS}__text strong {
                color: #e31d2b;
                font-weight: 800;
            }

            .${REWARD_CLASS}__track {
                height: 5px;
                overflow: hidden;
                border-radius: 999px;
                background: #f6dadd;
            }

            .${REWARD_CLASS}__fill {
                display: block;
                width: 0;
                height: 100%;
                border-radius: inherit;
                background: linear-gradient(90deg, #f47a84, #e31d2b);
                transition: width .45s cubic-bezier(.2,.78,.28,1);
            }

            .${REWARD_CLASS}.is-complete {
                border-color: #9fd3b6;
                background: #f0f9f4;
            }

            .${REWARD_CLASS}.is-complete::before { border-right-color: #9fd3b6; }
            .${REWARD_CLASS}.is-complete::after { border-left-color: #9fd3b6; }

            .${REWARD_CLASS}.is-complete .${REWARD_CLASS}__icon {
                background: linear-gradient(135deg, #36a46b, #26744d);
                box-shadow: 0 6px 14px rgba(38,116,77,.22);
            }

            .${REWARD_CLASS}.is-complete .${REWARD_CLASS}__badge { display: inline-block; }
            .${REWARD_CLASS}.is-complete .${REWARD_CLASS}__text strong { color: #26744d; }
            .${REWARD_CLASS}.is-complete .${REWARD_CLASS}__track { display: none; }
            .${REWARD_CLASS}.is-complete .${REWARD_CLASS}__text { margin-bottom: 0; }

            /* Mobil: hedefler alt sabit çubuğun (.mobile-order-summary) içine değil,
               hemen üstüne tam genişlik ince şerit olarak yerleşir. Böylece Ticimax'ın
               çubuk yüksekliği ve "Sepet Özeti" paneli etkilenmez. */
            .${GOALS_CLASS}--mobile {
                position: absolute;
                z-index: 1;
                right: 0;
                bottom: 100%;
                left: 0;
                gap: 7px;
                margin: 0;
                padding: 9px 14px;
                background: rgba(255,255,255,.97);
                border-top: 1px solid #e3e8f0;
                box-shadow: 0 -8px 18px rgba(12,21,76,.07);
            }

            /* Sepet Özeti paneli açıkken şerit gizlenir. */
            .mobile-order-summary.active .${GOALS_CLASS}--mobile {
                display: none;
            }

            /* Şerit alt çubuğa ~60px ekler; sayfa sonu içeriği arkasında kalmasın. */
            #app:has(.${GOALS_CLASS}--mobile) {
                padding-bottom: 64px;
            }

            .${GOALS_CLASS}--mobile .${BAR_CLASS},
            .${GOALS_CLASS}--mobile .${REWARD_CLASS} {
                display: flex;
                align-items: center;
                gap: 9px;
                padding: 0;
                border: 0;
                border-radius: 0;
                background: transparent;
                box-shadow: none;
            }

            .${GOALS_CLASS}--mobile .${REWARD_CLASS}::before,
            .${GOALS_CLASS}--mobile .${REWARD_CLASS}::after {
                content: none;
            }

            .${GOALS_CLASS}--mobile .${BAR_CLASS}__head {
                flex: 1 1 auto;
                min-width: 0;
                gap: 8px;
                margin: 0;
                font-size: 12px;
                font-weight: 600;
            }

            .${GOALS_CLASS}--mobile .${BAR_CLASS}__head svg {
                width: 18px;
                height: 18px;
            }

            .${GOALS_CLASS}--mobile .${BAR_CLASS}__track,
            .${GOALS_CLASS}--mobile .${REWARD_CLASS}__track {
                flex: 0 0 56px;
                height: 5px;
            }

            .${GOALS_CLASS}--mobile .${BAR_CLASS}__amount,
            .${GOALS_CLASS}--mobile .${REWARD_CLASS}__title {
                display: none;
            }

            .${GOALS_CLASS}--mobile .${REWARD_CLASS}__icon {
                flex: 0 0 18px;
                width: 18px;
                height: 18px;
                color: #e31d2b;
                background: none;
                box-shadow: none;
            }

            .${GOALS_CLASS}--mobile .${REWARD_CLASS}__icon svg {
                width: 18px;
                height: 18px;
            }

            .${GOALS_CLASS}--mobile .${REWARD_CLASS}.is-complete .${REWARD_CLASS}__icon {
                color: #26744d;
                background: none;
                box-shadow: none;
            }

            .${GOALS_CLASS}--mobile .${REWARD_CLASS} > div {
                display: flex;
                flex: 1 1 auto;
                align-items: center;
                gap: 9px;
                min-width: 0;
            }

            .${GOALS_CLASS}--mobile .${REWARD_CLASS}__text {
                flex: 1 1 auto;
                min-width: 0;
                margin: 0;
                color: #0c154c;
                font-size: 12px;
                font-weight: 600;
                line-height: 1.35;
            }

            .${GOALS_CLASS}--mobile .${REWARD_CLASS}.is-complete .${REWARD_CLASS}__text {
                margin: 0;
            }

            @media (prefers-reduced-motion: reduce) {
                .${BAR_CLASS}__fill,
                .${REWARD_CLASS}__fill { transition: none; }
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    // Ticimax checkout bir Vue uygulamasıdır; sepet verisi Pinia "basket" store'undadır.
    function getBasketStore() {
        try {
            var container = document.getElementById('app');
            var app = container && container.__vue_app__;
            var pinia = app && app.config && app.config.globalProperties && app.config.globalProperties.$pinia;
            return pinia && pinia._s && typeof pinia._s.get === 'function' ? pinia._s.get('basket') || null : null;
        } catch (error) {
            return null;
        }
    }

    function toNumber(value) {
        var number = Number(value);
        return Number.isFinite(number) ? number : 0;
    }

    /* Ticimax'ın kendi kargo bilgisindeki hesapla aynıdır: hediye paketi
       ücreti ücretsiz kargo limitine sayılmaz. */
    function readCartState() {
        var store = getBasketStore();
        var basket = store && store.basket;
        var price = basket && basket.price;
        if (!price) return null;

        var products = typeof store.getBasketProducts === 'object' && store.getBasketProducts ? store.getBasketProducts : null;
        if (products && typeof products.length === 'number' && !products.length) return null;

        var cargo = store.basketCargoCompany;
        var systemLimit = cargo ? toNumber(cargo.freeShipmentLimit) : 0;

        return {
            limit: systemLimit > 0 ? systemLimit : FALLBACK_LIMIT,
            total: Math.max(0, toNumber(price.totalBasketPrice) - toNumber(price.giftPackagePrice)),
            rewardApplied: isRewardApplied(basket),
            currency: (basket.validationInfo && basket.validationInfo.currencyCode) || 'TRY'
        };
    }

    /* Ticimax uygulanan kampanyaları basket.campaignDefinitions listesinde tutar
       (sipariş özetindeki kampanya satırları). Sepet tutarı indirim düşülmüş
       geldiği için 3.000-3.250 TL arasında indirim uygulanınca toplam eşiğin altına
       iner; bu yüzden kampanyanın uygulanıp uygulanmadığı doğrudan buradan okunur.
       Eşleşme: tutarı DISCOUNT_GOAL.amount olan ve adında eşik tutarı geçen kampanya. */
    function isRewardApplied(basket) {
        var list = basket && basket.campaignDefinitions;
        if (!list || typeof list.length !== 'number') return false;

        var threshold = String(DISCOUNT_GOAL.threshold);
        return Array.prototype.some.call(list, function (campaign) {
            var name = String(campaign && campaign.definition || '').replace(/[.\s]/g, '');
            return Math.abs(toNumber(campaign && campaign.value) - DISCOUNT_GOAL.amount) < 0.01 &&
                name.indexOf(threshold) !== -1;
        });
    }

    function formatMoney(value, currency) {
        try {
            return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: String(currency).toUpperCase() }).format(value);
        } catch (error) {
            return value.toFixed(2).replace('.', ',') + ' TL';
        }
    }

    // Kampanya tutarları gibi tam sayılar kuruşsuz yazılır: ₺3.000, ₺250.
    function formatWhole(value, currency) {
        try {
            return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: String(currency).toUpperCase(), maximumFractionDigits: 0 }).format(value);
        } catch (error) {
            return Math.round(value) + ' TL';
        }
    }

    function findCompleteButtons() {
        return Array.prototype.filter.call(document.querySelectorAll('#app button'), function (button) {
            return (button.textContent || '').replace(/\s+/g, ' ').trim() === BUTTON_TEXT;
        });
    }

    function createBar() {
        var bar = document.createElement('div');
        bar.className = BAR_CLASS;
        bar.setAttribute('role', 'status');
        bar.innerHTML =
            '<div class="' + BAR_CLASS + '__head">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>' +
            '<span class="' + BAR_CLASS + '__text"></span>' +
            '</div>' +
            '<div class="' + BAR_CLASS + '__track" role="progressbar" aria-label="Ücretsiz kargo ilerlemesi" aria-valuemin="0" aria-valuemax="100"><span class="' + BAR_CLASS + '__fill"></span></div>' +
            '<p class="' + BAR_CLASS + '__amount"></p>';
        return bar;
    }

    function updateBar(bar, state) {
        var remaining = Math.max(0, state.limit - state.total);
        var complete = remaining <= 0;
        var percent = Math.min(100, Math.round((state.total / state.limit) * 100));
        var text = bar.querySelector('.' + BAR_CLASS + '__text');
        var track = bar.querySelector('.' + BAR_CLASS + '__track');
        var fill = bar.querySelector('.' + BAR_CLASS + '__fill');
        var amount = bar.querySelector('.' + BAR_CLASS + '__amount');
        var html = complete
            ? 'Tebrikler! <strong>Ücretsiz kargo</strong> kazandınız.'
            : 'Ücretsiz kargoya <strong>' + formatMoney(remaining, state.currency) + '</strong> kaldı.';
        var amountText = formatMoney(Math.min(state.total, state.limit), state.currency) + ' / ' + formatMoney(state.limit, state.currency);

        // Yalnızca değişen değerler yazılır; Vue uygulamasının gözlemcisini gereksiz tetiklemez.
        bar.classList.toggle('is-complete', complete);
        if (text.innerHTML !== html) text.innerHTML = html;
        if (fill.style.width !== percent + '%') fill.style.width = percent + '%';
        if (track.getAttribute('aria-valuenow') !== String(percent)) track.setAttribute('aria-valuenow', String(percent));
        if (amount.textContent !== amountText) amount.textContent = amountText;
    }

    function createReward() {
        var reward = document.createElement('div');
        reward.className = REWARD_CLASS;
        reward.setAttribute('role', 'status');
        reward.innerHTML =
            '<span class="' + REWARD_CLASS + '__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16v10H4zM12 10v10M3 7h18v3H3zM12 7H8.5a2.25 2.25 0 1 1 2.2-2.8L12 7Zm0 0h3.5a2.25 2.25 0 1 0-2.2-2.8L12 7Z"/></svg></span>' +
            '<div>' +
            '<p class="' + REWARD_CLASS + '__title"><span class="' + REWARD_CLASS + '__heading"></span><span class="' + REWARD_CLASS + '__badge">KAZANILDI</span></p>' +
            '<p class="' + REWARD_CLASS + '__text"></p>' +
            '<div class="' + REWARD_CLASS + '__track" role="progressbar" aria-label="Sepet indirimi ilerlemesi" aria-valuemin="0" aria-valuemax="100"><span class="' + REWARD_CLASS + '__fill"></span></div>' +
            '</div>';
        return reward;
    }

    function updateReward(reward, state) {
        var goal = DISCOUNT_GOAL;
        var remaining = Math.max(0, goal.threshold - state.total);
        var complete = state.rewardApplied || remaining <= 0;
        var percent = complete ? 100 : Math.min(100, Math.round((state.total / goal.threshold) * 100));
        var heading = reward.querySelector('.' + REWARD_CLASS + '__heading');
        var text = reward.querySelector('.' + REWARD_CLASS + '__text');
        var track = reward.querySelector('.' + REWARD_CLASS + '__track');
        var fill = reward.querySelector('.' + REWARD_CLASS + '__fill');
        var amount = formatWhole(goal.amount, state.currency);
        var headingText = formatWhole(goal.threshold, state.currency) + ' üzeri siparişe ' + amount + ' indirim';
        // Mobil şeritte metin tek satıra sığacak kadar kısadır.
        var compact = !!reward.closest('.' + GOALS_CLASS + '--mobile');
        var html;
        if (compact) {
            html = complete
                ? '<strong>' + amount + ' indirim</strong> ' + (state.rewardApplied ? 'uygulandı.' : 'kazandınız.')
                : '<strong>' + formatMoney(remaining, state.currency) + '</strong> ekle, <strong>' + amount + ' indirim</strong> kazan.';
        } else {
            html = complete
                ? (state.rewardApplied
                    ? '<strong>' + amount + ' indirim</strong> sepetinize uygulandı.'
                    : '<strong>' + amount + ' indirim</strong> kazandınız, ödeme adımında sepetinize yansır.')
                : 'Sepetinize <strong>' + formatMoney(remaining, state.currency) + '</strong> daha ekleyin, <strong>' + amount + ' indirim</strong> kazanın.';
        }

        reward.classList.toggle('is-complete', complete);
        if (heading.textContent !== headingText) heading.textContent = headingText;
        if (text.innerHTML !== html) text.innerHTML = html;
        if (fill.style.width !== percent + '%') fill.style.width = percent + '%';
        if (track.getAttribute('aria-valuenow') !== String(percent)) track.setAttribute('aria-valuenow', String(percent));
    }

    /* Kargo çubuğu ve indirim kartı ortak bir kapsayıcıda tutulur; masaüstünde
       butonun hemen önünde, mobilde alt sabit çubuğun üstündedir. */
    function render() {
        var state = readCartState();
        var buttons = state ? findCompleteButtons() : [];

        var placed = [];

        buttons.forEach(function (button) {
            var mobileBar = button.closest('.mobile-order-summary');
            var goals;

            if (mobileBar) {
                // Mobil: alt sabit çubuğun üstünde şerit olarak tek kez yer alır.
                goals = Array.prototype.find.call(mobileBar.children, function (child) {
                    return child.classList.contains(GOALS_CLASS);
                });
                if (!goals) {
                    goals = document.createElement('div');
                    goals.className = GOALS_CLASS + ' ' + GOALS_CLASS + '--mobile';
                    goals.appendChild(createBar());
                    mobileBar.appendChild(goals);
                }
            } else {
                // Masaüstü: sipariş özetinde butonun hemen önünde yer alır.
                goals = button.previousElementSibling;
                if (!goals || !goals.classList.contains(GOALS_CLASS)) {
                    goals = document.createElement('div');
                    goals.className = GOALS_CLASS;
                    goals.appendChild(createBar());
                    button.parentNode.insertBefore(goals, button);
                }
            }
            placed.push(goals);

            updateBar(goals.querySelector('.' + BAR_CLASS), state);

            var reward = goals.querySelector('.' + REWARD_CLASS);
            if (DISCOUNT_GOAL.enabled && DISCOUNT_GOAL.threshold > 0) {
                if (!reward) {
                    reward = createReward();
                    goals.appendChild(reward);
                }
                updateReward(reward, state);
            } else if (reward) {
                reward.remove();
            }
        });

        // Butonu artık bulunmayan veya sepeti boş olan alanlar kaldırılır.
        Array.prototype.forEach.call(document.querySelectorAll('.' + GOALS_CLASS), function (goals) {
            if (placed.indexOf(goals) === -1) goals.remove();
        });
    }

    function scheduleRender() {
        window.clearTimeout(renderTimer);
        renderTimer = window.setTimeout(render, 120);
    }

    function init() {
        var app = document.getElementById('app');
        if (!app) return;

        addStyles();
        render();

        if (window.MutationObserver) {
            new MutationObserver(function (mutations) {
                for (var i = 0; i < mutations.length; i += 1) {
                    var target = mutations[i].target;
                    if (target.nodeType === 3) target = target.parentElement;
                    // Hedef alanının kendi güncellemeleri yeniden çizim gerektirmez.
                    if (target && target.closest && target.closest('.' + GOALS_CLASS)) continue;
                    scheduleRender();
                    return;
                }
            }).observe(app, { childList: true, subtree: true, characterData: true });
        }

        // Sepet tutarı değiştiğinde (adet, ürün silme, kupon) store aboneliğiyle hemen güncellenir.
        var subscribed = false;
        var trySubscribe = function () {
            var store = getBasketStore();
            if (subscribed || !store || typeof store.$subscribe !== 'function') return;
            subscribed = true;
            store.$subscribe(scheduleRender);
        };
        trySubscribe();
        [500, 1500, 3000, 6000].forEach(function (delay) {
            window.setTimeout(function () { trySubscribe(); scheduleRender(); }, delay);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
}());

/* ========================================================================
 * BÖLÜM 4: SEPET ADIMINDA WHATSAPP BUTONUNU GİZLEME
 *
 * Sepet adımında sabit WhatsApp butonu (tumsayfalar.js Bölüm 8) gizlenir;
 * alışverişi tamamlamaya odaklanılır ve mobil alt çubuğun üzerine binmez.
 * Sepet adımı, adreste "step" parametresi olmayan checkout ekranıdır; ödeme gibi
 * sonraki adımlarda (?step=payment) buton yeniden görünür. Checkout adımları
 * sayfa yenilenmeden değiştiği için adım, sayfa değişimlerinde yeniden kontrol edilir.
 * ====================================================================== */
(function () {
    'use strict';

    if (!/^\/checkout(?:\/|$)/i.test(window.location.pathname || '')) return;
    if (window.__otsCheckoutWhatsappHideLoaded) return;
    window.__otsCheckoutWhatsappHideLoaded = true;

    var STYLE_ID = 'otsCheckoutWhatsappHideStyles';
    var BASKET_STEP_CLASS = 'ots-checkout-basket-step';
    var checkTimer = null;

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            body.${BASKET_STEP_CLASS} .ots-whatsapp-modern,
            body.${BASKET_STEP_CLASS} #otsWhatsappModernFallback {
                display: none !important;
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    function syncStep() {
        if (!document.body) return;
        var isBasketStep = !new URLSearchParams(window.location.search).get('step');
        if (document.body.classList.contains(BASKET_STEP_CLASS) !== isBasketStep) {
            document.body.classList.toggle(BASKET_STEP_CLASS, isBasketStep);
        }
    }

    function scheduleSync() {
        window.clearTimeout(checkTimer);
        checkTimer = window.setTimeout(syncStep, 100);
    }

    function init() {
        addStyles();
        syncStep();

        window.addEventListener('popstate', syncStep);

        // Adım değişimi adres çubuğunu sayfa yenilemeden değiştirir; uygulama
        // içeriği yeniden çizildiğinde adım tekrar kontrol edilir.
        var app = document.getElementById('app');
        if (app && window.MutationObserver) {
            new MutationObserver(scheduleSync).observe(app, { childList: true, subtree: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
}());
