/*
 * ÖTS İÇ GİYİM - ÜRÜN DETAY SAYFASI MODÜLLERİ
 *
 * Yükleme adresi : https://ornekler.com.tr/js/ots/urundetay.js
 * Çalıştığı yer  : Ürün detay sayfaları
 *
 * Ürün detayındaki bağımsız arayüz modüllerini tek dosyada toplar. Bölümler ortak
 * DOM alanlarını gereksiz yere tekrar işlememek için kapsamlı seçiciler ve ayrı
 * yükleme korumaları kullanır; her bölüm kendi kapsamında (IIFE) çalışır.
 *
 * Bölümler:
 *   1. SizeWithMe beden bulucu widget
 *   2. Varyant bazlı ürün görselleri
 *   3. Kargo bilgisi ve geri sayım
 *   4. Ürün geri bildirim formu
 *   5. Beden tablosu oluşturma ve düzenleme
 *   6. Havale indirim bilgisi
 *   7. Ödeme ve taksit seçenekleri
 *   8. Bedenimi bul butonu
 *   9. Sabit sepete ekle barı
 *  10. Yorum yaz butonu ve uyarı pencereleri
 *  11. Adet fiyatı, paylaşım ve detay düzenlemeleri
 *  12. Ürün detay işlem ikonları
 *  13. Ürün detayında üstü çizili indirimli fiyat
 *  14. Ürün yorumları görünümü
 */

/* ========================================================================
 * BÖLÜM 1: SIZEWITHME BEDEN BULUCU WIDGET
 *
 * SizeWithMe beden öneri servisini ürün detay sayfasına bağlar.
 * Ürün ve kullanıcı ölçülerini kullanarak uygun beden önerisi akışını çalıştırır.
 *
 * Widget: SizeWithMe (ID 6, sürüm 1.0.0), Sizeportal API ile çalışır.
 * - Statik beden tablosu yoktur; her ürünün tablosu Sizeportal API'sinden çekilir.
 * - Ürün kimliği #divOzelAlan2 içinden okunur; boşsa widget gösterilmez.
 * - Cinsiyet API yanıtındaki product.gender alanından belirlenir.
 * - Kolonlar (boy, kilo, bel vb.) üründen ürüne değişebilir.
 * ====================================================================== */
(function () {
    'use strict';

    // --- Ayarlar ---
    var SWM_CONFIG = {
        widgetId: 6,
        siteName: 'OTS İç Giyim',
        customerUuid: '721a6477-65f1-41b5-867c-482bc155d782',
        trackUrl: 'https://widget.sizewithme.com/api/track',
        imagePath: 'https://widget.sizewithme.com/images/',
        defaultLang: 'tr',

        // Beden tablosu API
        sizeTableApi: 'https://panel.sizeportal.com/api/table-json.php',
        sizeTableApiKey: '2dd3572e8777315e9a2d86616b53f53193611ad0cb0ecb154763da2774a70a2b',
        productIdSelector: '#divOzelAlan2',

        selectors: {
            // Ticimax DOM kancaları (sabriozel ile aynı tema)
            productTitle: '.ProductName h1, .RightDetail h1',
            productNameInput: '#divUrunKodu',
            ogTitle: 'meta[property="og:title"]',
            sizeRowContainer: '#divUrunEkSecenek',
            sizeRow: '.eksecenekLine',
            sizeRowLabel: '.left_line',
            sizeRowLabelKeywords: ['beden', 'size', 'numara'],
            sizeButton: '.size_box',
            sizeValueAttr: 'title',
            addToCartArea: '.bedenTablolar a.bedenTablosu, .bedenTablolar .bedenT a, a.fancybox.bedenTablosu',
            insertPosition: 'beforeend',
            addToCartFallbacks: ['.bedenTablolar', '#divSatinAl', '.buybutton', '#btnHemenAl'],
            categoryRow: '.teknikDetayItem.urun-alt-grubu .t2 span'
        },

        validation: {
            heightMin: 110,
            heightMax: 220,
            weightMin: 30,
            weightMax: 200,
            ageMin: 15,
            ageMax: 80
        },

        excludedKeywords: ['çocuk', 'cocuk', 'kids', 'kid', 'bebek', 'junior'],
        excludedSizes: ['STD', 'STANDART', 'STANDARD', 'TEK BEDEN', 'TEK'],

        genderKeywords: {
            kadin: ['kadın', 'kadin', 'bayan', 'kız', 'kiz', 'women', 'woman', 'female', 'girl'],
            erkek: ['erkek', 'oğlan', 'oglan', 'men ', 'man ', 'male', 'bay ', 'boy '],
            unisex: ['unisex', 'uniseks']
        },

        defaultGender: 'unisex',

        sizesOrder: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL']
    };

    /* Geliştirme günlükleri yalnızca açıkça etkinleştirildiğinde yazılır.
       Canlı ürün sayfalarında sürekli console çıktısı üretmek performansı ve
       hata ayıklama okunabilirliğini olumsuz etkiler. */
    function debug() {
        if (!window.__OTS_DEBUG__ || !window.console || !window.console.log) return;
        window.console.log.apply(window.console, arguments);
    }

    // --- API'den çekilen beden tablosu (çalışma anında doldurulur) ---
    var API_TABLE = null;     // tüm JSON response
    var API_SIZES = [];       // sizes array
    var ACTIVE_COLUMNS = [];  // settings.active_columns


    // --- Stiller (ID-1 widget'ı ile aynı görsel dil) ---
    var SWM_CSS = `
        /* Widget her zaman inline-block — "Beden Tablosu" linkinin yanına oturmasını sağlar */
        .swm-action-area#swmWidget { display: inline-block; vertical-align: middle; margin: 0 0 0 10px; padding: 0; background: transparent; }
        /* "Beden Tablosu" linki ile widget'ı aynı satırda tutmak için parent'a yardım */
        a.fancybox.bedenTablosu, a.bedenTablosu, a[href="#BedenTabloHtml"] { display: inline-block; vertical-align: middle; }
        .swm-action-area { padding: 0; background: transparent; font-family: 'Open Sans','Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif; }
        .swm-action-area * { box-sizing: border-box; }
        .swm-trigger-btn { display: inline-flex; align-items: center; gap: 6px; background: #fff; color: #000; height: 32px; padding: 0 12px; margin-bottom: 10px; border: 1px solid #111; border-radius: 6px; font-weight: 600; font-size: 12px; line-height: 1; letter-spacing: .2px; cursor: pointer; transition: all .2s ease; white-space: nowrap; }
        .swm-trigger-btn:hover { background: #000; color: #fff; }
        .swm-trigger-btn svg { width: 14px; height: 14px; flex-shrink: 0; }

        .swm-modal-overlay { display: none; position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.6); z-index: 2147483647; justify-content: center; align-items: center; overflow-y: auto; padding: 20px; }
        .swm-modal-overlay.show { display: flex; }
        .swm-modal-content { background:#fff; border-radius:24px; width:95%; max-width:460px; max-height:85vh; overflow:hidden; box-shadow:0 15px 50px rgba(0,0,0,0.2); animation: swmModalIn .3s ease; display:flex; flex-direction:column; font-family:'Open Sans','Segoe UI',sans-serif; }
        @keyframes swmModalIn { from { opacity:0; transform: scale(.95) translateY(20px); } to { opacity:1; transform: scale(1) translateY(0); } }

        .swm-modal-header { padding: 16px 20px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; position: relative; }
        .swm-header-left { display:flex; align-items:center; gap:10px; z-index:10; }
        .swm-modal-title { font-weight:800; font-size:20px; color:#000; position:absolute; left:50%; transform: translateX(-50%); z-index:1; }
        .swm-nav-btn { background:none; border:2px solid #eee; border-radius:8px; height:36px; min-width:36px; display:flex; align-items:center; justify-content:center; color:#333; cursor:pointer; transition:.2s; padding: 0 8px; font-size:14px; }
        .swm-nav-btn:hover { background:#f0f0f0; border-color:#ddd; }
        .swm-nav-btn.hidden { display:none; }
        .swm-nav-btn svg { width:20px; height:20px; }
        .swm-lang-text { margin-left:8px; font-weight:700; font-size:12px; }
        .swm-close-btn { background:none; border:none; font-size:24px; color:#333; cursor:pointer; z-index:10; padding:0; line-height:1; }

        .swm-modal-body { padding: 10px 40px; display:flex; flex-direction:column; overflow-y:auto; flex:1; }
        .swm-step-content { display:none; animation: swmFade .35s ease-in-out; }
        .swm-step-content.active { display:block; }
        @keyframes swmFade { from { opacity:0; transform: translateX(10px); } to { opacity:1; transform: translateX(0); } }
        .swm-step-title { text-align:center; font-weight:700; margin: 0 0 24px; color:#222; font-size:18px; }

        .swm-gender-info { font-size:13px; color:#666; background:#f8f8f8; padding:10px 12px; border-radius:8px; margin-bottom:18px; text-align:center; }
        .swm-gender-info b { color:#111; }
        .swm-gender-group { display:flex; justify-content:center; margin-bottom:20px; }
        .swm-btn-group { display:flex; width:100%; }
        .swm-btn-check { position:absolute; clip: rect(0,0,0,0); pointer-events:none; }
        .swm-btn-outline { flex:1; padding:10px 18px; border:2px solid #000; background:#fff; color:#000; font-weight:600; cursor:pointer; transition:.2s; text-align:center; font-size:13px; }
        .swm-btn-outline:first-of-type { border-radius:8px 0 0 8px; }
        .swm-btn-outline:last-of-type { border-radius:0 8px 8px 0; }
        .swm-btn-outline:not(:first-of-type) { margin-left:-2px; }
        .swm-btn-check:checked + .swm-btn-outline { background:#000; color:#fff; }

        .swm-input-row { display:flex; gap:15px; margin-bottom:15px; }
        .swm-input-col { flex:1; }
        .swm-input-label { display:flex; align-items:center; margin-bottom:5px; margin-left:5px; font-size:.85rem; color:#6c757d; }
        .swm-error-icon { display:none; color:#dc3545; margin-right:6px; font-size:14px; animation: swmBounceIn .3s; }
        .swm-error-icon.show { display:inline-block; }
        @keyframes swmBounceIn { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .swm-custom-input { width:100%; border:1px solid #ddd; padding:12px; border-radius:10px; text-align:center; font-weight:600; font-size:18px; transition:.2s; }
        .swm-custom-input:focus { outline:none; border-color:#000; }
        .swm-custom-input.input-error { border-color:#dc3545 !important; background:#fff8f8; color:#dc3545; }

        .swm-age-section { margin-top:20px; text-align:center; }
        .swm-age-label { color:#6c757d; font-size:.85rem; margin-bottom:5px; display:block; }
        .swm-age-control { display:flex; justify-content:center; align-items:center; gap:15px; }
        .swm-age-btn { width:45px; height:45px; border-radius:50%; border:1px solid #ddd; background:#fff; font-size:20px; font-weight:bold; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.2s; user-select:none; }
        .swm-age-btn:hover { background:#f0f0f0; }
        .swm-age-value { font-size:24px; font-weight:700; width:50px; text-align:center; }

        .swm-options-row { display:flex; gap:10px; }
        .swm-option-col { flex:1; }
        .swm-option-card { border:2px solid transparent; border-radius:12px; padding:15px; text-align:center; cursor:pointer; transition: all .2s; background:#fff; height:100%; }
        .swm-option-card:hover { background:#f0f0f0; }
        .swm-option-card.selected { border-color:#000; background:#fff; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .swm-body-type-img { width:100%; height:180px; object-fit:cover; margin: 0 auto 15px; display:block; border-radius:40px; background:#f5f5f5; }
        .swm-option-label { font-weight:700; font-size:13px; color:#333; }

        .swm-slider-section { padding: 20px 40px 50px; }
        .swm-custom-range { -webkit-appearance:none; width:100%; background:transparent; }
        .swm-custom-range::-webkit-slider-runnable-track { width:100%; height:2px; background:#000; border-radius:2px; cursor:pointer; }
        .swm-custom-range::-webkit-slider-thumb { height:20px; width:20px; border-radius:50%; background:#000; cursor:pointer; -webkit-appearance:none; margin-top:-9px; box-shadow: 0 0 0 2px #fff; }
        .swm-custom-range::-moz-range-track { width:100%; height:2px; background:#000; border-radius:2px; cursor:pointer; }
        .swm-custom-range::-moz-range-thumb { height:20px; width:20px; border-radius:50%; background:#000; cursor:pointer; border:none; }
        .swm-slider-labels { display:flex; justify-content:space-between; margin-top:15px; font-size:14px; color:#6c757d; }
        .swm-slider-labels span.active { font-weight:700; color:#000; }

        .swm-modal-footer { padding: 20px 40px 30px; flex-shrink:0; }
        .swm-btn-next { width:100%; background:#000; color:#fff; padding:14px; border-radius:10px; font-weight:600; border:none; display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:16px; transition:.2s; }
        .swm-btn-next:hover { background:#333; }

        .swm-result-box { text-align:center; }
        .swm-result-size { font-size:64px; font-weight:900; color:#000; line-height:1; margin: 12px 0 12px; }
        .swm-result-badge { display:inline-flex; align-items:center; gap:6px; background: rgba(25,135,84,.1); color:#198754; padding:8px 16px; border-radius:20px; font-weight:600; font-size:14px; margin-bottom:14px; }
        .swm-result-meta { font-size:13px; color:#666; margin-bottom:18px; }
        .swm-result-meta b { color:#111; }
        .swm-loading-state { text-align:center; padding:50px 20px; }
        .swm-spinner { width:40px; height:40px; border:3px solid #f0f0f0; border-top-color:#000; border-radius:50%; animation: swmSpin .8s linear infinite; margin: 0 auto 15px; }
        @keyframes swmSpin { to { transform: rotate(360deg); } }

        .swm-btn-dark { width:100%; background:#000; color:#fff; border:none; padding:16px; border-radius:10px; font-weight:600; font-size:15px; cursor:pointer; margin-bottom:10px; transition:.2s; }
        .swm-btn-dark:hover { background:#333; }
        .swm-btn-link { background:none; border:none; color:#6c757d; cursor:pointer; font-size:14px; display:inline-flex; align-items:center; gap:5px; }
        .swm-btn-link:hover { color:#000; }

        @media (max-width:576px) {
            .swm-modal-overlay { padding: 40px 12px 110px; align-items: flex-start; }
            .swm-modal-content { width:100%; max-width:100%; max-height: calc(100vh - 160px); border-radius: 18px; }
            .swm-modal-header { padding: 14px 18px; }
            .swm-modal-title { font-size: 17px; }
            .swm-modal-body { padding: 8px 18px; }
            .swm-modal-footer { padding: 12px 18px 16px; }
            .swm-step-title { margin-bottom: 16px; font-size: 16px; }
            .swm-gender-info { padding: 8px 10px; font-size: 12px; margin-bottom: 12px; }
            .swm-input-row { gap: 10px; margin-bottom: 10px; }
            .swm-custom-input { padding: 10px; font-size: 16px; }
            .swm-age-section { margin-top: 12px; }
            .swm-age-btn { width: 40px; height: 40px; font-size: 18px; }
            .swm-age-value { font-size: 22px; }
            .swm-body-type-img { height:130px; border-radius:24px; }
            .swm-btn-group { width:100%; }
            .swm-slider-section { padding: 14px 18px 30px; }
            .swm-btn-next { padding: 12px; font-size: 15px; }
            .swm-result-size { font-size: 52px; margin: 10px 0 8px; }
            .swm-loading-state { padding: 30px 20px; }
        }
        @media (min-width:992px) { .swm-body-type-img { height:200px; border-radius:50px; } }

        /* Site içi stacking düzeltmesi */
        .v5-tommylife .swiper-button-next.inside { z-index: 8 !important; }
    `;

    // --- HTML şablonu ---
    var SWM_TRIGGER_HTML = `
        <div class="swm-action-area" id="swmWidget">
            <button type="button" class="swm-trigger-btn" id="swmTriggerBtn" aria-label="Bedenimi Bul">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.3 8.7 15.3 2.7a1 1 0 0 0-1.4 0L2.7 13.9a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.4 0L21.3 10.1a1 1 0 0 0 0-1.4Z"/>
                    <path d="M7.5 16.5 9 15"/>
                    <path d="M11 13l1.5-1.5"/>
                    <path d="M14.5 9.5 16 8"/>
                    <path d="M5 14l2 2"/>
                </svg>
                <span data-swm-key="main_btn">Bedenimi Bul</span>
            </button>
        </div>
    `;

    var SWM_MODAL_HTML = `
        <div class="swm-modal-overlay" id="swmModal">
            <div class="swm-modal-content">
                <div class="swm-modal-header">
                    <div class="swm-header-left">
                        <button type="button" class="swm-nav-btn" id="swmLangBtn" title="Change Language">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                            <span class="swm-lang-text" id="swmLangText">TR</span>
                        </button>
                        <button type="button" class="swm-nav-btn hidden" id="swmBackBtn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                        </button>
                    </div>
                    <div class="swm-modal-title">SizeWithMe</div>
                    <button type="button" class="swm-close-btn" id="swmCloseBtn">&times;</button>
                </div>

                <div class="swm-modal-body">
                    <!-- Step 1: Ölçüler + Yaş -->
                    <div class="swm-step-content active" id="swmStep1">
                        <h4 class="swm-step-title" data-swm-key="title_step1">Vücut Ölçüleriniz</h4>
                        <div class="swm-gender-info" id="swmGenderInfo">
                            <span data-swm-key="lbl_product_gender">Ürün cinsiyeti</span>: <b id="swmGenderLabel">-</b>
                        </div>
                        <div class="swm-gender-group" id="swmGenderGroup" style="display:none;">
                            <div class="swm-btn-group">
                                <input type="radio" class="swm-btn-check" name="swmGender" id="swmGenderKadin" value="kadin">
                                <label class="swm-btn-outline" for="swmGenderKadin" data-swm-key="gender_female">Kadın</label>
                                <input type="radio" class="swm-btn-check" name="swmGender" id="swmGenderErkek" value="erkek">
                                <label class="swm-btn-outline" for="swmGenderErkek" data-swm-key="gender_male">Erkek</label>
                                <input type="radio" class="swm-btn-check" name="swmGender" id="swmGenderUnisex" value="unisex" checked>
                                <label class="swm-btn-outline" for="swmGenderUnisex" data-swm-key="gender_unisex">Unisex</label>
                            </div>
                        </div>
                        <div class="swm-input-row">
                            <div class="swm-input-col">
                                <label class="swm-input-label">
                                    <span class="swm-error-icon">⚠</span>
                                    <span data-swm-key="lbl_height">Boy (cm)</span>
                                </label>
                                <input type="number" id="swmInputHeight" class="swm-custom-input" placeholder="170">
                            </div>
                            <div class="swm-input-col">
                                <label class="swm-input-label">
                                    <span class="swm-error-icon">⚠</span>
                                    <span data-swm-key="lbl_weight">Kilo (kg)</span>
                                </label>
                                <input type="number" id="swmInputWeight" class="swm-custom-input" placeholder="65">
                            </div>
                        </div>
                        <div class="swm-age-section">
                            <span class="swm-age-label" data-swm-key="lbl_age">Yaş</span>
                            <div class="swm-age-control">
                                <button type="button" class="swm-age-btn" id="swmAgeMinus">−</button>
                                <span class="swm-age-value" id="swmAgeValue">28</span>
                                <button type="button" class="swm-age-btn" id="swmAgePlus">+</button>
                            </div>
                        </div>
                    </div>

                    <!-- Step 2: Göğüs -->
                    <div class="swm-step-content" id="swmStep2">
                        <h4 class="swm-step-title">
                            <span class="swm-error-icon">⚠</span>
                            <span data-swm-key="title_step2">Göğüs Yapınız Nasıl?</span>
                        </h4>
                        <div class="swm-options-row" id="swmOptionsStep2">
                            <div class="swm-option-col"><div class="swm-option-card" data-value="1">
                                <img class="swm-body-type-img" data-type="gogus" data-index="1">
                                <div class="swm-option-label" data-swm-key="opt_narrow">Dar</div>
                            </div></div>
                            <div class="swm-option-col"><div class="swm-option-card" data-value="2">
                                <img class="swm-body-type-img" data-type="gogus" data-index="2">
                                <div class="swm-option-label" data-swm-key="opt_medium">Orta</div>
                            </div></div>
                            <div class="swm-option-col"><div class="swm-option-card" data-value="3">
                                <img class="swm-body-type-img" data-type="gogus" data-index="3">
                                <div class="swm-option-label" data-swm-key="opt_wide">Geniş</div>
                            </div></div>
                        </div>
                    </div>

                    <!-- Step 3: Karın -->
                    <div class="swm-step-content" id="swmStep3">
                        <h4 class="swm-step-title">
                            <span class="swm-error-icon">⚠</span>
                            <span data-swm-key="title_step3">Karın Yapınız Nasıl?</span>
                        </h4>
                        <div class="swm-options-row" id="swmOptionsStep3">
                            <div class="swm-option-col"><div class="swm-option-card" data-value="1">
                                <img class="swm-body-type-img" data-type="karin" data-index="1">
                                <div class="swm-option-label" data-swm-key="opt_thin">İnce</div>
                            </div></div>
                            <div class="swm-option-col"><div class="swm-option-card" data-value="2">
                                <img class="swm-body-type-img" data-type="karin" data-index="2">
                                <div class="swm-option-label" data-swm-key="opt_medium">Orta</div>
                            </div></div>
                            <div class="swm-option-col"><div class="swm-option-card" data-value="3">
                                <img class="swm-body-type-img" data-type="karin" data-index="3">
                                <div class="swm-option-label" data-swm-key="opt_wide">Geniş</div>
                            </div></div>
                        </div>
                    </div>

                    <!-- Step 4: Basen -->
                    <div class="swm-step-content" id="swmStep4">
                        <h4 class="swm-step-title">
                            <span class="swm-error-icon">⚠</span>
                            <span data-swm-key="title_step4">Basen Yapınız Nasıl?</span>
                        </h4>
                        <div class="swm-options-row" id="swmOptionsStep4">
                            <div class="swm-option-col"><div class="swm-option-card" data-value="1">
                                <img class="swm-body-type-img" data-type="basen" data-index="1">
                                <div class="swm-option-label" data-swm-key="opt_narrow">Dar</div>
                            </div></div>
                            <div class="swm-option-col"><div class="swm-option-card" data-value="2">
                                <img class="swm-body-type-img" data-type="basen" data-index="2">
                                <div class="swm-option-label" data-swm-key="opt_medium">Orta</div>
                            </div></div>
                            <div class="swm-option-col"><div class="swm-option-card" data-value="3">
                                <img class="swm-body-type-img" data-type="basen" data-index="3">
                                <div class="swm-option-label" data-swm-key="opt_wide">Geniş</div>
                            </div></div>
                        </div>
                    </div>

                    <!-- Step 5: Fit -->
                    <div class="swm-step-content" id="swmStep5">
                        <h4 class="swm-step-title" data-swm-key="title_step5">Üzerinizde Nasıl Dursun?</h4>
                        <div class="swm-slider-section">
                            <input type="range" class="swm-custom-range" min="1" max="3" step="1" id="swmFitRange" value="2">
                            <div class="swm-slider-labels">
                                <span data-swm-key="fit_tight">Dar</span>
                                <span class="active" data-swm-key="fit_normal">Normal</span>
                                <span data-swm-key="fit_loose">Bol</span>
                            </div>
                        </div>
                    </div>

                    <!-- Step 6: Sonuç -->
                    <div class="swm-step-content" id="swmStep6">
                        <div class="swm-loading-state" id="swmLoadingState">
                            <div class="swm-spinner"></div>
                            <p data-swm-key="msg_calculating">En uygun beden hesaplanıyor...</p>
                        </div>
                        <div class="swm-result-box" id="swmResultState" style="display:none;">
                            <p style="color:#6c757d; margin: 0 0 4px;" data-swm-key="msg_result">Sizin için önerilen beden:</p>
                            <div class="swm-result-size" id="swmResultSize">L</div>
                            <div class="swm-result-badge">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                <span id="swmResultMatch">%96 Eşleşme</span>
                            </div>
                            <div class="swm-result-meta" id="swmResultMeta">
                                <span data-swm-key="lbl_product_gender">Ürün cinsiyeti</span>: <b id="swmResultGender">-</b>
                            </div>
                            <button type="button" class="swm-btn-dark" id="swmBtnShop" data-swm-key="btn_shop">Bedenimi Seç</button>
                            <button type="button" class="swm-btn-link" style="width:100%; justify-content:center;" id="swmBtnRestart">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                                <span data-swm-key="btn_restart">Tekrar Başla</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="swm-modal-footer" id="swmActionFooter">
                    <button type="button" class="swm-btn-next" id="swmBtnNext">
                        <span id="swmBtnNextText" data-swm-key="btn_continue">Devam et</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    // --- Dil metinleri ---
    var SWM_LANG = {
        main_btn: { tr: 'Bedenimi Bul', en: 'Find My Size' },
        title_step1: { tr: 'Vücut Ölçüleriniz', en: 'Your Body Measurements' },
        lbl_product_gender: { tr: 'Ürün cinsiyeti', en: 'Product gender' },
        lbl_product_gender_select: { tr: 'Lütfen ürün cinsiyetini seçin', en: 'Please select product gender' },
        gender_male: { tr: 'Erkek', en: 'Male' },
        gender_female: { tr: 'Kadın', en: 'Female' },
        gender_unisex: { tr: 'Unisex', en: 'Unisex' },
        lbl_height: { tr: 'Boy (cm)', en: 'Height (cm)' },
        lbl_weight: { tr: 'Kilo (kg)', en: 'Weight (kg)' },
        lbl_age: { tr: 'Yaş', en: 'Age' },
        title_step2: { tr: 'Göğüs Yapınız Nasıl?', en: 'How is your Chest Shape?' },
        title_step3: { tr: 'Karın Yapınız Nasıl?', en: 'How is your Belly Shape?' },
        title_step4: { tr: 'Basen Yapınız Nasıl?', en: 'How is your Hip Shape?' },
        opt_narrow: { tr: 'Dar', en: 'Narrow' },
        opt_medium: { tr: 'Orta', en: 'Medium' },
        opt_wide: { tr: 'Geniş', en: 'Wide' },
        opt_thin: { tr: 'İnce', en: 'Thin' },
        title_step5: { tr: 'Üzerinizde Nasıl Dursun?', en: 'How should it fit?' },
        fit_tight: { tr: 'Dar', en: 'Tight' },
        fit_normal: { tr: 'Normal', en: 'Regular' },
        fit_loose: { tr: 'Bol', en: 'Loose' },
        msg_calculating: { tr: 'En uygun beden hesaplanıyor...', en: 'Calculating best fit...' },
        msg_result: { tr: 'Sizin için önerilen beden:', en: 'Recommended size for you:' },
        match_text: { tr: 'Eşleşme', en: 'Match' },
        btn_shop: { tr: 'Bedenimi Seç', en: 'Select My Size' },
        btn_restart: { tr: 'Tekrar Başla', en: 'Start Over' },
        btn_continue: { tr: 'Devam et', en: 'Continue' },
        btn_find: { tr: 'Bedenimi Bul', en: 'Find My Size' }
    };

    // --- Durum ---
    var currentStep = 1;
    var totalSteps = 6;
    var currentLang = SWM_CONFIG.defaultLang;
    var age = 28;
    var detectedGender = null;
    var manualGenderRequired = false;
    var isChildProduct = false;

    // Çocuk ürünleri için ayrı validation
    function getValidation() {
        if (isChildProduct) {
            return { heightMin: 90, heightMax: 180, weightMin: 15, weightMax: 75, ageMin: 2, ageMax: 16 };
        }
        return SWM_CONFIG.validation;
    }
    var availableSizes = [];
    var detectedCategory = null;

    function detectCategory() {
        var sel = SWM_CONFIG.selectors.categoryRow;
        var el = sel ? document.querySelector(sel) : null;
        return el ? (el.textContent || '').trim() : null;
    }

    // Helpers
    function $(id) { return document.getElementById(id); }
    function $$(sel) { return document.querySelectorAll(sel); }

    // --- İstatistik takibi (panel istatistikleri için) ---
    var SWM_PRODUCT_NAME = '';

    function getSessionId() {
        try {
            var k = 'swm_sid_' + SWM_CONFIG.widgetId;
            var sid = sessionStorage.getItem(k);
            if (!sid) {
                sid = 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 8);
                sessionStorage.setItem(k, sid);
            }
            return sid;
        } catch (e) { return null; }
    }

    function getProductImageUrl() {
        var og = document.querySelector('meta[property="og:image"]');
        if (og && og.getAttribute('content')) return og.getAttribute('content');
        var img = document.querySelector('.product-images-item img, .product-image img, .main-image img, .product-detail img');
        return img ? img.src : '';
    }

    function track(type, extra) {
        try {
            var payload = {
                uuid: SWM_CONFIG.customerUuid,
                type: type,
                sessionId: getSessionId(),
                pageUrl: location.href,
                productName: SWM_PRODUCT_NAME || '',
                productImageUrl: getProductImageUrl()
            };
            if (extra) for (var k in extra) if (extra.hasOwnProperty(k)) payload[k] = extra[k];
            var body = JSON.stringify(payload);
            // sendBeacon ile application/json preflight gerektiriyor ve bazı tarayıcılarda düşüyor.
            // text/plain CORS-safelisted, backend zaten raw body JSON parse ediyor.
            var ok = false;
            if (navigator.sendBeacon) {
                try {
                    ok = navigator.sendBeacon(SWM_CONFIG.trackUrl, new Blob([body], { type: 'text/plain' }));
                } catch (_) { ok = false; }
            }
            if (!ok) {
                fetch(SWM_CONFIG.trackUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
                    body: body,
                    keepalive: true,
                    credentials: 'omit'
                }).catch(function () { });
            }
        } catch (e) { /* sessizce yut */ }
    }

    function normalize(text) {
        return (text || '').toLocaleLowerCase('tr').replace(/i̇/g, 'i');
    }

    function genderLabel(g) {
        if (isChildProduct) {
            if (g === 'kadin') return 'Kız Çocuk';
            if (g === 'erkek') return 'Erkek Çocuk';
            if (g === 'unisex') return 'Çocuk';
            return '-';
        }
        if (g === 'kadin') return SWM_LANG.gender_female[currentLang];
        if (g === 'erkek') return SWM_LANG.gender_male[currentLang];
        if (g === 'unisex') return SWM_LANG.gender_unisex[currentLang];
        return '-';
    }

    // --- Ürün bilgileri ---
    function getProductName() {
        var s = SWM_CONFIG.selectors;
        var sources = [
            function () { var el = document.querySelector(s.productTitle); return el ? el.textContent : ''; },
            function () { var el = document.querySelector(s.productNameInput); return el ? (el.value || '') : ''; },
            function () { var el = document.querySelector(s.ogTitle); return el ? (el.getAttribute('content') || '') : ''; },
            function () { return document.title || ''; }
        ];
        for (var i = 0; i < sources.length; i++) {
            var name = (sources[i]() || '').trim();
            if (name) return name;
        }
        return '';
    }

    function isExcludedProduct(name) {
        var n = normalize(name);
        for (var i = 0; i < SWM_CONFIG.excludedKeywords.length; i++) {
            if (n.indexOf(normalize(SWM_CONFIG.excludedKeywords[i])) !== -1) return true;
        }
        return false;
    }

    function detectGender(name) {
        var n = normalize(name);
        var gk = SWM_CONFIG.genderKeywords;
        for (var i = 0; i < gk.unisex.length; i++) if (n.indexOf(normalize(gk.unisex[i])) !== -1) return 'unisex';
        for (var j = 0; j < gk.kadin.length; j++) if (n.indexOf(normalize(gk.kadin[j])) !== -1) return 'kadin';
        for (var k = 0; k < gk.erkek.length; k++) if (n.indexOf(normalize(gk.erkek[k])) !== -1) return 'erkek';
        return null;
    }

    /*
     * Ticimax: #divUrunEkSecenek > .eksecenekLine[] satırlarından
     * .left_line metni "Beden"/"Size" geçeni bulup içindeki .size_box'ları döndür.
     */
    function findSizeRow() {
        var s = SWM_CONFIG.selectors;
        var wrap = document.querySelector(s.sizeRowContainer);
        if (!wrap) return null;
        var rows = wrap.querySelectorAll(s.sizeRow);
        for (var i = 0; i < rows.length; i++) {
            var label = rows[i].querySelector(s.sizeRowLabel);
            if (!label) continue;
            var text = normalize(label.textContent);
            for (var j = 0; j < s.sizeRowLabelKeywords.length; j++) {
                if (text.indexOf(normalize(s.sizeRowLabelKeywords[j])) !== -1) {
                    return rows[i];
                }
            }
        }
        return null;
    }

    function collectAvailableSizes() {
        var s = SWM_CONFIG.selectors;
        var row = findSizeRow();
        if (!row) return { sizes: [], hasExcluded: false };
        var nodes = row.querySelectorAll(s.sizeButton);
        var sizes = [];
        var hasExcluded = false;
        nodes.forEach(function (n) {
            var raw = n.getAttribute(s.sizeValueAttr) || n.textContent || '';
            var v = (raw + '').trim().toUpperCase();
            if (!v) return;
            if (SWM_CONFIG.excludedSizes.indexOf(v) !== -1) { hasExcluded = true; return; }
            // stok kontrolü: data-stock="0" ise atla (görüntülenir ama tıklanmaz)
            var stock = parseInt(n.getAttribute('data-stock') || '1', 10);
            if (stock <= 0) return;
            if (sizes.indexOf(v) === -1) sizes.push(v);
        });
        return { sizes: sizes, hasExcluded: hasExcluded };
    }

    function selectSizeOnPage(size) {
        var s = SWM_CONFIG.selectors;
        var target = (size + '').toUpperCase();
        var row = findSizeRow();
        if (!row) return false;
        var btns = row.querySelectorAll(s.sizeButton);
        for (var i = 0; i < btns.length; i++) {
            var raw = btns[i].getAttribute(s.sizeValueAttr) || btns[i].textContent || '';
            var v = raw.trim().toUpperCase();
            if (v === target) {
                // click() zaten tıklama olayı üretir; ikinci olay varyant seçimini iki kez tetikliyordu.
                btns[i].click();
                btns[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
                return true;
            }
        }
        return false;
    }

    // --- Beden hesaplama ---
    function getSelectedValue(containerId) {
        var sel = document.querySelector('#' + containerId + ' .swm-option-card.selected');
        return sel ? parseInt(sel.getAttribute('data-value'), 10) : 2;
    }

    function getActiveGender() {
        if (manualGenderRequired) {
            var checked = document.querySelector('input[name="swmGender"]:checked');
            return checked ? checked.value : SWM_CONFIG.defaultGender;
        }
        return detectedGender || SWM_CONFIG.defaultGender;
    }

    function isNumeric(s) { return /^\d+$/.test((s + '').trim()); }

    // --- API: ürün ID'sini sayfadan oku ---
    function getProductIdFromPage() {
        var el = document.querySelector(SWM_CONFIG.productIdSelector);
        if (!el) return null;
        var txt = (el.textContent || el.innerText || '').trim();
        // Sadece rakam içeren ID kabul et
        var m = txt.match(/\d+/);
        return m ? m[0] : null;
    }

    // --- API: beden tablosunu çek ---
    function fetchSizeTable(productId, callback) {
        var url = SWM_CONFIG.sizeTableApi + '?id=' + encodeURIComponent(productId) +
            '&api_key=' + encodeURIComponent(SWM_CONFIG.sizeTableApiKey);
        try {
            fetch(url, { method: 'GET', credentials: 'omit', cache: 'default' })
                .then(function (r) { return r.json(); })
                .then(function (json) {
                    if (!json || json.success !== true || !Array.isArray(json.sizes) || json.sizes.length === 0) {
                        console.warn('[SizeWithMe OTS] API geçersiz yanıt:', json);
                        callback(null);
                        return;
                    }
                    callback(json);
                })
                .catch(function (err) {
                    console.warn('[SizeWithMe OTS] API hata:', err);
                    callback(null);
                });
        } catch (e) {
            console.warn('[SizeWithMe OTS] fetch desteklenmiyor:', e);
            callback(null);
        }
    }

    // --- API cinsiyet değerini iç değere çevirme ---
    function normalizeApiGender(g) {
        g = (g || '').toLowerCase();
        if (g.indexOf('female') !== -1 || g.indexOf('woman') !== -1 || g.indexOf('kad') !== -1 || g.indexOf('bayan') !== -1) return 'kadin';
        if (g.indexOf('male') !== -1 || g.indexOf('man') !== -1 || g.indexOf('erkek') !== -1 || g.indexOf('bay') !== -1) return 'erkek';
        if (g.indexOf('unisex') !== -1) return 'unisex';
        return null;
    }

    // --- API'den gelen bedenlerle boy ve kilo eşleştirmesi ---
    // Her bedene bir skor verir:
    //  - height aralığında ise +50, dışında ise aralığa uzaklığa göre azalan puan
    //  - weight aralığında ise +50, dışında ise aralığa uzaklığa göre azalan puan
    // Birden fazla 100'lük bedende, aralık ortasına en yakını seçilir.
    function scoreSizeAgainstUser(size, height, weight) {
        function rangeScore(val, range) {
            if (!range || (range.min == null && range.max == null)) return null;
            var lo = range.min, hi = range.max;
            if (val >= lo && val <= hi) {
                // tam içeride — ortaya yakınlık bonus
                var mid = (lo + hi) / 2;
                var span = Math.max(1, (hi - lo) / 2);
                var center = 1 - Math.min(1, Math.abs(val - mid) / span);
                return 50 + center * 10; // 50-60
            }
            var dist = val < lo ? (lo - val) : (val - hi);
            // 10 birim uzakta 0, daha uzakta negatif
            return Math.max(-30, 50 - dist * 6);
        }

        var hScore = rangeScore(height, size.height);
        var wScore = rangeScore(weight, size.weight);

        // Boy bilgisi yoksa kilo ağır basar; tersi de geçerli
        if (hScore == null && wScore == null) return 0;
        if (hScore == null) return wScore * 2;
        if (wScore == null) return hScore * 2;
        // Kilo daha belirleyici (1.3x), boy yardımcı (1.0x)
        return wScore * 1.3 + hScore * 1.0;
    }

    // "1-2 Yaş" → {type:'range', min:1, max:2}; "8 Yaş" → {type:'single', value:8}
    function parseAgeFromLabel(s) {
        if (!s) return null;
        var u = (s + '').toUpperCase();
        if (u.indexOf('YAŞ') === -1 && u.indexOf('YAS') === -1) return null;
        var r = u.match(/(\d+)\s*[-–]\s*(\d+)/);
        if (r) return { type: 'range', min: parseInt(r[1], 10), max: parseInt(r[2], 10) };
        var s1 = u.match(/(\d+)/);
        if (s1) return { type: 'single', value: parseInt(s1[1], 10) };
        return null;
    }

    // Çocuk ürünü + yaş aralıklı bedenler için kullanıcı yaşına göre direkt eşleştirme
    function pickChildAgeBasedSize(userAge) {
        if (!isChildProduct || !availableSizes.length || !userAge) return null;
        var parsed = [];
        for (var i = 0; i < availableSizes.length; i++) {
            var p = parseAgeFromLabel(availableSizes[i]);
            if (!p) return null; // tüm bedenler yaş bazlı değil, vazgeç
            parsed.push({ original: availableSizes[i], p: p });
        }
        // İçeren aralığı bul
        for (var j = 0; j < parsed.length; j++) {
            var ageInfo = parsed[j].p;
            if (ageInfo.type === 'range' && userAge >= ageInfo.min && userAge <= ageInfo.max) return parsed[j].original;
            if (ageInfo.type === 'single' && userAge === ageInfo.value) return parsed[j].original;
        }
        // Tam içeren yoksa en yakın aralığın ortasını seç
        var best = null, bestDiff = Infinity;
        for (var k = 0; k < parsed.length; k++) {
            var pp = parsed[k].p;
            var mid = pp.type === 'range' ? (pp.min + pp.max) / 2 : pp.value;
            var d = Math.abs(userAge - mid);
            if (d < bestDiff) { bestDiff = d; best = parsed[k].original; }
        }
        return best;
    }

    function pickBestApiSize(height, weight) {
        if (!API_SIZES || API_SIZES.length === 0) return null;
        var best = null;
        var bestScore = -Infinity;
        for (var i = 0; i < API_SIZES.length; i++) {
            var s = API_SIZES[i];
            var sc = scoreSizeAgainstUser(s, height, weight);
            if (sc > bestScore) { bestScore = sc; best = s; }
        }
        return { size: best, score: bestScore };
    }

    function calculateSize() {
        var height = parseInt($('swmInputHeight').value, 10);
        var weight = parseInt($('swmInputWeight').value, 10);
        var gender = getActiveGender();
        var fit = parseInt($('swmFitRange').value, 10);

        // Çocuk ürünü + yaş aralıklı bedenler: kullanıcı yaşına göre direkt eşleştir (early return)
        var childPick = pickChildAgeBasedSize(age);
        if (childPick) {
            debug('[SizeWithMe OTS] CHILD AGE MATCH', { age: age, finalSize: childPick, availableSizes: availableSizes });
            return { size: childPick, match: 95 };
        }

        // API'den beden seç
        var picked = pickBestApiSize(height, weight);
        if (!picked || !picked.size) {
            console.warn('[SizeWithMe OTS] API tablosundan beden seçilemedi.');
            return { size: '?', match: 0 };
        }

        var recommendedSize = picked.size.label;
        var preRemap = recommendedSize;

        // Fit modifikasyonu: dar (-1 idx) / normal (0) / bol (+1)
        if (fit !== 2 && API_SIZES.length > 1) {
            var currentIdx = -1;
            for (var i = 0; i < API_SIZES.length; i++) {
                if (API_SIZES[i].label === recommendedSize) { currentIdx = i; break; }
            }
            if (currentIdx !== -1) {
                var shift = (fit === 1) ? -1 : (fit === 3 ? 1 : 0);
                var newIdx = Math.max(0, Math.min(API_SIZES.length - 1, currentIdx + shift));
                recommendedSize = API_SIZES[newIdx].label;
            }
        }

        // Sayfada o beden yoksa en yakın mevcut bedeni bul
        function normSize(s) {
            s = (s + '').toUpperCase();
            return s === 'XXL' ? '2XL' : (s === 'XXXL' ? '3XL' : s);
        }
        function isNumericSize(s) { return /^\d+$/.test((s + '').trim()); }
        var availNorm = availableSizes.map(normSize);
        var recNorm = normSize(recommendedSize);

        if (availableSizes.length > 0 && availNorm.indexOf(recNorm) === -1) {
            var recIsNum = isNumericSize(recNorm);
            var order = SWM_CONFIG.sizesOrder.map(normSize);
            var targetIdx = !recIsNum ? order.indexOf(recNorm) : -1;
            if (!recIsNum && targetIdx === -1) targetIdx = 4;
            var bestI = -1, bestDiff = Infinity;
            for (var j = 0; j < availNorm.length; j++) {
                var candIsNum = isNumericSize(availNorm[j]);
                var d;
                if (recIsNum && candIsNum) {
                    d = Math.abs(parseInt(recNorm, 10) - parseInt(availNorm[j], 10));
                } else if (!recIsNum && !candIsNum) {
                    var oi = order.indexOf(availNorm[j]);
                    d = (oi === -1) ? Infinity : Math.abs(oi - targetIdx);
                } else {
                    d = Infinity;
                }
                if (d < bestDiff) { bestI = j; bestDiff = d; }
            }
            if (bestI === -1 || bestDiff === Infinity) {
                console.warn('[SizeWithMe OTS] Önerilen beden sayfa bedenleriyle uyumsuz, remap atlandı.',
                    { recommended: recommendedSize, availableSizes: availableSizes });
            } else {
                recommendedSize = availableSizes[bestI];
            }
        } else if (availableSizes.length > 0) {
            var k = availNorm.indexOf(recNorm);
            recommendedSize = availableSizes[k];
        }

        // Match score: API score'undan türet
        var match = Math.max(75, Math.min(99, Math.round(70 + picked.score / 4)));

        debug('[SizeWithMe OTS] CALC',
            {
                gender: gender, weight: weight, height: height, fit: fit,
                apiSizeCount: API_SIZES.length, apiScore: picked.score,
                recommendedFromApi: preRemap, availableSizes: availableSizes, finalSize: recommendedSize
            });

        return { size: recommendedSize, match: match };
    }

    // --- Vücut görselleri (cinsiyete göre) ---
    function updateBodyImages() {
        var g = getActiveGender();
        var folder = (g === 'erkek') ? 'man' : 'woman';
        var suffix = (g === 'erkek') ? 'erkek' : 'kadin';
        $$('.swm-body-type-img').forEach(function (img) {
            var type = img.getAttribute('data-type');
            var index = img.getAttribute('data-index');
            var filename;
            if (suffix === 'kadin' && type === 'gogus' && index === '2') {
                filename = 'swm-goguz-kadin-2.png';
            } else {
                filename = 'swm-' + type + '-' + suffix + '-' + index + '.png';
            }
            img.src = SWM_CONFIG.imagePath + folder + '/' + filename;
            img.onerror = function () { this.style.background = '#f0f0f0'; this.removeAttribute('src'); };
        });
    }

    // --- Sihirbaz adımları ---
    function openModal() { $('swmModal').classList.add('show'); document.body.style.overflow = 'hidden'; }
    function closeModal() { $('swmModal').classList.remove('show'); document.body.style.overflow = ''; }

    function toggleLang() {
        currentLang = currentLang === 'tr' ? 'en' : 'tr';
        $('swmLangText').textContent = currentLang === 'tr' ? 'TR' : 'ENG';
        updateLanguageUI();
        if (manualGenderRequired) {
            $('swmGenderInfo').textContent = SWM_LANG.lbl_product_gender_select[currentLang];
        } else {
            $('swmGenderLabel').textContent = genderLabel(detectedGender);
        }
    }

    function updateLanguageUI() {
        $$('[data-swm-key]').forEach(function (el) {
            var key = el.getAttribute('data-swm-key');
            if (SWM_LANG[key] && SWM_LANG[key][currentLang]) el.textContent = SWM_LANG[key][currentLang];
        });
        updateNextButtonText();
    }

    function updateNextButtonText() {
        var key = (currentStep === totalSteps - 1) ? 'btn_find' : 'btn_continue';
        $('swmBtnNextText').textContent = SWM_LANG[key][currentLang];
    }

    function validateStep() {
        var v = getValidation();
        if (currentStep === 1) {
            var h = parseInt($('swmInputHeight').value, 10);
            var w = parseInt($('swmInputWeight').value, 10);
            var ok = true;
            var hCol = $('swmInputHeight').closest('.swm-input-col');
            var wCol = $('swmInputWeight').closest('.swm-input-col');
            if (isNaN(h) || h < v.heightMin || h > v.heightMax) {
                $('swmInputHeight').classList.add('input-error');
                hCol.querySelector('.swm-error-icon').classList.add('show');
                ok = false;
            } else {
                $('swmInputHeight').classList.remove('input-error');
                hCol.querySelector('.swm-error-icon').classList.remove('show');
            }
            if (isNaN(w) || w < v.weightMin || w > v.weightMax) {
                $('swmInputWeight').classList.add('input-error');
                wCol.querySelector('.swm-error-icon').classList.add('show');
                ok = false;
            } else {
                $('swmInputWeight').classList.remove('input-error');
                wCol.querySelector('.swm-error-icon').classList.remove('show');
            }
            return ok;
        }
        if ([2, 3, 4].indexOf(currentStep) !== -1) {
            var step = $('swmStep' + currentStep);
            if (!step.querySelector('.swm-option-card.selected')) {
                step.querySelector('.swm-error-icon').classList.add('show');
                return false;
            }
        }
        return true;
    }

    function nextStep() {
        if (!validateStep()) return;
        if (currentStep < totalSteps) { currentStep++; updateWizard(); }
    }
    function prevStep() {
        if (currentStep > 1) { currentStep--; updateWizard(); }
    }

    function updateWizard() {
        $$('.swm-step-content').forEach(function (s) { s.classList.remove('active'); });
        $('swmStep' + currentStep).classList.add('active');

        if (currentStep === 1 || currentStep === totalSteps) $('swmBackBtn').classList.add('hidden');
        else $('swmBackBtn').classList.remove('hidden');

        if (currentStep === totalSteps) {
            $('swmActionFooter').style.display = 'none';
            $('swmLoadingState').style.display = 'block';
            $('swmResultState').style.display = 'none';
            setTimeout(function () {
                var r = calculateSize();
                $('swmResultSize').textContent = r.size;
                $('swmResultMatch').textContent = '%' + r.match + ' ' + SWM_LANG.match_text[currentLang];
                $('swmResultGender').textContent = genderLabel(getActiveGender());
                $('swmLoadingState').style.display = 'none';
                $('swmResultState').style.display = 'block';

                // İstatistik: beden hesaplandı
                track('size_calculation', {
                    height: parseInt($('swmInputHeight').value, 10) || null,
                    weight: parseInt($('swmInputWeight').value, 10) || null,
                    age: age,
                    measurements: {
                        gender: getActiveGender(),
                        chest: getSelectedValue('swmOptionsStep2'),
                        belly: getSelectedValue('swmOptionsStep3'),
                        hip: getSelectedValue('swmOptionsStep4'),
                        fit: parseInt($('swmFitRange').value, 10) || 2
                    },
                    recommendedSize: r.size,
                    matchPercentage: r.match
                });
            }, 1200);
        } else {
            $('swmActionFooter').style.display = 'block';
            updateNextButtonText();
        }
    }

    function restartWizard() {
        // Çocuk ürünlerinde yaş, açılıştaki gibi 8'den başlar.
        currentStep = 1; age = isChildProduct ? 8 : 28;
        $('swmInputHeight').value = '';
        $('swmInputWeight').value = '';
        $('swmAgeValue').textContent = String(age);
        $('swmInputHeight').classList.remove('input-error');
        $('swmInputWeight').classList.remove('input-error');
        $$('.swm-error-icon').forEach(function (i) { i.classList.remove('show'); });
        $$('.swm-option-card').forEach(function (c) { c.classList.remove('selected'); });
        $('swmFitRange').value = 2;
        $$('.swm-slider-labels span').forEach(function (l, i) { l.classList.toggle('active', i === 1); });
        $('swmActionFooter').style.display = 'block';
        updateWizard();
    }

    function bindEvents() {
        $('swmTriggerBtn').onclick = function (e) {
            // Anchor (Beden Tablosu fancybox) içine yerleştirildiği için bubble'ı durdur
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();
            openModal();
            return false;
        };
        $('swmCloseBtn').onclick = function (e) { e.preventDefault(); closeModal(); };
        $('swmModal').onclick = function (e) { if (e.target.id === 'swmModal') closeModal(); };

        $('swmLangBtn').onclick = function (e) { e.preventDefault(); toggleLang(); };
        $('swmBackBtn').onclick = function (e) { e.preventDefault(); prevStep(); };
        $('swmBtnNext').onclick = function (e) { e.preventDefault(); nextStep(); };

        $('swmAgePlus').onclick = function (e) { e.preventDefault(); var v = getValidation(); if (age < v.ageMax) { age++; $('swmAgeValue').textContent = age; } };
        $('swmAgeMinus').onclick = function (e) { e.preventDefault(); var v = getValidation(); if (age > v.ageMin) { age--; $('swmAgeValue').textContent = age; } };

        $$('input[name="swmGender"]').forEach(function (input) {
            input.onchange = function () { updateBodyImages(); };
        });

        $$('.swm-option-card').forEach(function (card) {
            card.onclick = function () {
                var parent = card.closest('.swm-options-row');
                parent.querySelectorAll('.swm-option-card').forEach(function (c) { c.classList.remove('selected'); });
                card.classList.add('selected');
                var step = card.closest('.swm-step-content');
                var err = step.querySelector('.swm-error-icon');
                if (err) err.classList.remove('show');
            };
        });

        $('swmFitRange').oninput = function (e) {
            var labels = $$('.swm-slider-labels span');
            labels.forEach(function (l) { l.classList.remove('active'); });
            var i = Math.max(1, Math.min(3, parseInt(e.target.value, 10))) - 1;
            if (labels[i]) labels[i].classList.add('active');
        };

        $('swmBtnShop').onclick = function (e) {
            e.preventDefault();
            var picked = $('swmResultSize').textContent;
            selectSizeOnPage(picked);
            // İstatistik: beden seçildi
            track('size_selected', {
                selectedSize: picked,
                recommendedSize: picked,
                weight: parseInt($('swmInputWeight').value, 10) || null,
                height: parseInt($('swmInputHeight').value, 10) || null
            });
            closeModal();
        };
        $('swmBtnRestart').onclick = function (e) { e.preventDefault(); restartWizard(); };
    }

    // --- Başlatma ---
    function waitForElement(selector, callback, timeout) {
        var el = document.querySelector(selector);
        if (el) { callback(el); return; }
        var observer = new MutationObserver(function () {
            var found = document.querySelector(selector);
            if (found) { observer.disconnect(); callback(found); }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(function () { observer.disconnect(); }, timeout || 5000);
    }

    function init() {
        var productName = getProductName();
        SWM_PRODUCT_NAME = productName;
        debug('[SizeWithMe OTS] Ürün:', productName);

        // Çocuk ürünü tespiti (ürün adında çocuk geçiyor mu) — formu ona göre ayarlayacağız
        if (productName) {
            var pn = normalize(productName);
            if (pn.indexOf('çocuk') !== -1 || pn.indexOf('cocuk') !== -1) {
                isChildProduct = true;
                debug('[SizeWithMe OTS] Çocuk ürünü tespit edildi — çocuk formu kullanılacak.');
            }
        }

        // 1) Ürün ID — #divOzelAlan2 içinden oku (en güvenilir filtre)
        // ID varsa: site bu ürünü kapsama dahil etmiş demektir → çocuk filtresi atlanır
        // ID yoksa: widget kesinlikle gösterilmez
        var productId = getProductIdFromPage();
        if (!productId) {
            debug('[SizeWithMe OTS] #divOzelAlan2 boş veya yok, widget gizlendi.');
            return;
        }
        debug('[SizeWithMe OTS] Product ID:', productId);

        // 3) Sayfada beden var mı
        var sizeInfo = collectAvailableSizes();
        if (sizeInfo.sizes.length === 0) {
            debug('[SizeWithMe OTS] Beden bulunamadı (tek beden / STD).'); return;
        }
        availableSizes = sizeInfo.sizes;
        debug('[SizeWithMe OTS] Mevcut bedenler:', availableSizes);

        // 4) API'den beden tablosunu çek, geldiyse widget'ı kur
        fetchSizeTable(productId, function (json) {
            if (!json) {
                debug('[SizeWithMe OTS] API tablo dönmedi, widget gizlendi.');
                return;
            }
            API_TABLE = json;
            API_SIZES = json.sizes || [];
            ACTIVE_COLUMNS = (json.settings && json.settings.active_columns) || [];

            // Cinsiyet: API > ürün adından > unisex
            var apiGender = json.product && normalizeApiGender(json.product.gender);
            if (apiGender) {
                detectedGender = apiGender;
                debug('[SizeWithMe OTS] API cinsiyet:', detectedGender);
            } else {
                detectedGender = productName ? detectGender(productName) : null;
                if (!detectedGender) manualGenderRequired = true;
            }

            detectedCategory = detectCategory();
            mountWidget();
        });
    }

    function mountWidget() {
        var s = SWM_CONFIG.selectors;

        // Element görünür mü? offsetParent null = display:none zincirinde
        function isVisible(el) {
            if (!el) return false;
            if (el.offsetParent === null) {
                var st = window.getComputedStyle ? window.getComputedStyle(el) : null;
                if (!st || st.position !== 'fixed') return false;
            }
            return true;
        }

        // "Beden Tablosu" linkini bul: SADECE attribute selector (text arama tab menülerini yanlış matchliyor)
        function findBedenTabloLink() {
            var attrSel = 'a.fancybox.bedenTablosu, a.bedenTablosu, a[href="#BedenTabloHtml"], a[href*="BedenTabloHtml"], a[data-fancybox-href*="BedenTabloHtml"]';
            var el = document.querySelector(attrSel);
            if (el && isVisible(el)) return el;
            return null;
        }

        // 1) #divUrunEkSecenek afterend — varyant alanının TAMAMINDAN sonra (Ticimax re-render'da kaybolmaz)
        // 2) .right_line afterend — span dışında, ama Ticimax burayı re-render edebilir
        // 3) Attribute-bazlı "Beden Tablosu" linki → beforebegin
        // 4) Fallback'ler
        function findTarget() {
            // 1) En kararlı: variant container'ının dışı
            var varContainer = document.querySelector('#divUrunEkSecenek');
            if (varContainer && isVisible(varContainer) && varContainer.querySelector('.size_box')) {
                debug('[SizeWithMe OTS] Yerleşim: #divUrunEkSecenek afterend (varyant alanından sonra, kararlı)');
                return { el: varContainer, position: 'afterend' };
            }

            var sizeRow = (typeof findSizeRow === 'function') ? findSizeRow() : null;
            if (sizeRow) {
                var rightLine = sizeRow.querySelector('.right_line');
                if (rightLine && isVisible(rightLine)) {
                    debug('[SizeWithMe OTS] Yerleşim: .right_line afterend');
                    return { el: rightLine, position: 'afterend' };
                }
                if (isVisible(sizeRow)) {
                    return { el: sizeRow, position: 'beforeend' };
                }
            }

            var bedenLink = findBedenTabloLink();
            if (bedenLink) {
                debug('[SizeWithMe OTS] Yerleşim: "Beden Tablosu" linkinin solu (beforebegin)');
                return { el: bedenLink, position: 'beforebegin' };
            }

            var t = document.querySelector(s.addToCartArea);
            if (t && isVisible(t)) {
                return { el: t, position: s.insertPosition };
            }

            var fallbacks = s.addToCartFallbacks || [];
            for (var i = 0; i < fallbacks.length; i++) {
                var alt = document.querySelector(fallbacks[i]);
                if (alt && isVisible(alt)) {
                    debug('[SizeWithMe OTS] Yerleşim fallback:', fallbacks[i]);
                    return { el: alt, position: 'beforebegin' };
                }
            }
            return null;
        }

        // findTarget retry: "Beden Tablosu" gibi 3rd-party widget'lar async yüklenebilir.
        // MutationObserver ile DOM değişimlerinde tekrar dene, 15s timeout.
        function waitForTarget(callback, timeoutMs) {
            var initial = findTarget();
            if (initial) { callback(initial); return; }

            var done = false;
            var observer = null;
            var timeoutTimer = setTimeout(function () {
                if (done) return;
                done = true;
                if (observer) observer.disconnect();
                console.warn('[SizeWithMe OTS] Target element bulunamadı (' + (timeoutMs || 15000) + 'ms timeout).');
            }, timeoutMs || 15000);

            function tryFind() {
                if (done) return;
                var t = findTarget();
                if (t) {
                    done = true;
                    if (observer) observer.disconnect();
                    clearTimeout(timeoutTimer);
                    callback(t);
                }
            }

            // DOM eklenmelerini gözle; sınırlı zaman kontrolleri yalnızca
            // stil/gecikmeli üçüncü taraf yüklemeleri için güvenlik ağıdır.
            if (window.MutationObserver && document.body) {
                observer = new MutationObserver(tryFind);
                observer.observe(document.body, { childList: true, subtree: true });
            }
            [500, 1500, 3000, 6000, 10000].forEach(function (delay) {
                setTimeout(tryFind, delay);
            });
        }

        waitForTarget(function (found) {
            mountWidget(found.el, found.position);
        }, 15000);

        function mountWidget(target, position) {
            // CSS sadece bir kez
            if (!document.getElementById('swm-styles')) {
                var style = document.createElement('style');
                style.id = 'swm-styles';
                style.textContent = SWM_CSS;
                document.head.appendChild(style);
            }
            // Eğer widget zaten DOM'da varsa skip (idempotent)
            if (document.getElementById('swmWidget')) return;
            var modalExists = !!document.getElementById('swmModal');

            // Trigger butonunu yerleştir
            // Eğer "Beden Tablosu" anchor'ının yanına (before/after) koyacaksak,
            // önce anchor'ı bir inline-flex span ile sar — yan yana garantili olsun.
            // beforebegin = widget anchor'dan ÖNCE; afterend = widget anchor'dan SONRA
            if ((position === 'beforebegin' || position === 'afterend') && target.tagName === 'A') {
                var wrap = document.createElement('span');
                wrap.className = 'swm-bedentablo-wrap';
                wrap.style.cssText = 'display: inline-flex; align-items: center; gap: 10px;';
                if (target.parentNode) {
                    target.parentNode.insertBefore(wrap, target);
                    if (position === 'beforebegin') {
                        // Widget önce gelsin, sonra anchor
                        wrap.insertAdjacentHTML('beforeend', SWM_TRIGGER_HTML);
                        wrap.appendChild(target);
                    } else {
                        // Anchor önce, sonra widget
                        wrap.appendChild(target);
                        wrap.insertAdjacentHTML('beforeend', SWM_TRIGGER_HTML);
                    }
                } else {
                    target.insertAdjacentHTML(position, SWM_TRIGGER_HTML);
                }
            } else {
                target.insertAdjacentHTML(position, SWM_TRIGGER_HTML);
            }

            // Widget div'inin block davranışını override et (Sabri Özel teması override ediyor olabilir)
            var injectedWidget = document.getElementById('swmWidget');
            if (injectedWidget) {
                injectedWidget.style.setProperty('display', 'inline-block', 'important');
                injectedWidget.style.setProperty('vertical-align', 'middle', 'important');
                injectedWidget.style.setProperty('margin', '0 0 0 0', 'important');
            }

            // Modal sadece ilk mount'ta (re-mount'ta duplikat olmasın)
            if (!modalExists) {
                var modalWrap = document.createElement('div');
                modalWrap.innerHTML = SWM_MODAL_HTML;
                document.body.appendChild(modalWrap.firstElementChild);

                // Rakip "sizeandme" butonunu gizle
                var rival = document.getElementById('sizeandmeButton');
                if (rival) rival.style.display = 'none';

                // Cinsiyet UI
                if (manualGenderRequired) {
                    $('swmGenderInfo').textContent = SWM_LANG.lbl_product_gender_select[currentLang];
                    $('swmGenderGroup').style.display = 'flex';
                } else {
                    $('swmGenderLabel').textContent = genderLabel(detectedGender);
                }

                // Çocuk ürünü: default değerleri ve placeholder'ları çocuk profili olarak ayarla
                if (isChildProduct) {
                    var hI = $('swmInputHeight'); if (hI) { hI.placeholder = '120'; hI.value = '120'; hI.min = '90'; hI.max = '180'; }
                    var wI = $('swmInputWeight'); if (wI) { wI.placeholder = '35'; wI.value = '35'; wI.min = '15'; wI.max = '75'; }
                    age = 8;
                    var av = $('swmAgeValue'); if (av) av.textContent = age;

                    var lKadin = document.querySelector('label[for="swmGenderKadin"]');
                    var lErkek = document.querySelector('label[for="swmGenderErkek"]');
                    var lUnisex = document.querySelector('label[for="swmGenderUnisex"]');
                    if (lKadin) { lKadin.textContent = 'Kız Çocuk'; lKadin.removeAttribute('data-swm-key'); }
                    if (lErkek) { lErkek.textContent = 'Erkek Çocuk'; lErkek.removeAttribute('data-swm-key'); }
                    if (lUnisex) { lUnisex.textContent = 'Çocuk'; lUnisex.removeAttribute('data-swm-key'); }
                }

                updateBodyImages();
                bindEvents();

                // İstatistik: sadece ilk mount'ta
                track('widget_load');
            } else {
                // Re-mount: sadece trigger butonunun click handler'ını yeniden bağla
                var trigBtn = $('swmTriggerBtn');
                if (trigBtn) trigBtn.onclick = function (e) { e.preventDefault(); e.stopPropagation(); openModal(); return false; };
            }

            // Watchdog: Ticimax varyant değişiminde widget'ı silerse otomatik geri koy
            startWatchdog();
        }

        // Ticimax varyant alanını yeniden oluşturursa widget da silinebilir.
        // Sürekli zamanlayıcı yerine yalnızca ilgili DOM kaldırılmasını gözlemle.
        function startWatchdog() {
            if (window.__swmWatchdogRunning) return;
            window.__swmWatchdogRunning = true;

            if (!window.MutationObserver || !document.body) return;

            var needsRemount = false;
            var watchdog = new MutationObserver(function (mutations) {
                if (!needsRemount) {
                    needsRemount = mutations.some(function (mutation) {
                        return Array.prototype.some.call(mutation.removedNodes, function (node) {
                            return node.nodeType === 1 && (
                                node.id === 'swmWidget' ||
                                (node.querySelector && node.querySelector('#swmWidget'))
                            );
                        });
                    });
                }

                if (!needsRemount || document.getElementById('swmWidget')) {
                    if (document.getElementById('swmWidget')) needsRemount = false;
                    return;
                }

                var target = findTarget();
                if (target) {
                    debug('[SizeWithMe OTS] Widget DOM\'dan silindi; yeniden yerleştiriliyor.');
                    mountWidget(target.el, target.position);
                    needsRemount = false;
                }
            });

            watchdog.observe(document.body, { childList: true, subtree: true });
            window.__swmWatchdogObserver = watchdog;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

/* ========================================================================
 * BÖLÜM 2: VARYANT BAZLI ÜRÜN GÖRSELLERİ
 *
 * Seçilen renk ve varyanta göre ürün detay görsellerini eşleştirir.
 * Galeri görünümünü günceller ve yardımcı ürün alanlarını düzenler.
 * ====================================================================== */
(function () {
    "use strict";

    function temizle(s) {
        return (s || "")
            .toString()
            .trim()
            .toLocaleLowerCase("tr-TR")
            .replace(/\s+/g, " ");
    }

    function kucultGorsel(url) {
        if (!url) return url;
        if (url.indexOf("/cdn-cgi/image/") !== -1) return url;
        return url.replace(
            /^(https?:\/\/[^/]+)\/(\d+\/uploads\/)/,
            "$1/cdn-cgi/image/width=150,quality=80,format=auto/$2"
        );
    }

    function init() {
        if (typeof productDetailModel === "undefined") return false;

        var data = productDetailModel;
        var variants = data.productVariantData || [];
        var products = data.products || [];

        var productImageMap = {};
        products.forEach(function (p) {
            if (p.id && p.spotResimThumbYolu) {
                productImageMap[p.id] = kucultGorsel(p.spotResimThumbYolu);
            }
        });

        var renkById = {};
        var renkByName = {};
        var renkNameById = {};

        variants.forEach(function (v) {
            if (v.ekSecenekTipVaryasyonTuruTanim === "Renk") {
                var imgUrl = productImageMap[v.urunID] || "";
                var temizIsim = temizle(v.tanim);

                // Görseli olan ilk geçerli kaydı haritala
                if (imgUrl && !renkByName[temizIsim]) {
                    renkByName[temizIsim] = imgUrl;
                }
                if (imgUrl) {
                    renkById[v.id] = imgUrl;
                }
                renkNameById[v.id] = v.tanim;
            }
        });

        // CSS'in birden fazla eklenmesini önle
        if (!document.getElementById("custom-varyant-css")) {
            var style = document.createElement("style");
            style.id = "custom-varyant-css";
            style.textContent =
                "#divUrunEkSecenek .eksecenekLine .size_box.has-varyant-gorsel {" +
                "  display: inline-flex !important;" +
                "  flex-direction: column !important;" +
                "  align-items: center !important;" +
                "  height: 125px !important;" +
                "  width: auto !important;" +
                "  min-width: 80px !important;" +
                "  padding: 3px 7px !important;" +
                "  vertical-align: top !important;" +
                "  box-sizing: border-box !important;" +
                "}" +
                "#divUrunEkSecenek .eksecenekLine .size_box.has-varyant-gorsel.selected {" +
                "  border-radius: 10px;" +
                "  color: #fff !important;" +
                "}" +
                "#divUrunEkSecenek .eksecenekLine .size_box.has-varyant-gorsel:hover {" +
                "  cursor: pointer !important;" +
                "}" +
                "#divUrunEkSecenek .eksecenekLine .size_box.has-varyant-gorsel.nostok .varyant-gorsel {" +
                "  opacity: .5 !important;" +
                "}" +
                "#divUrunEkSecenek .eksecenekLine .size_box.has-varyant-gorsel .varyant-gorsel {" +
                "  width: 75px !important;" +
                "  height: 90px !important;" +
                "  object-fit: contain !important;" +
                "  display: block !important;" +
                "  border-radius: 8px !important;" +
                "  pointer-events: none !important;" +
                "}" +
                "#divUrunEkSecenek .eksecenekLine .size_box.has-varyant-gorsel .varyant-gorsel-text {" +
                "  display: block !important;" +
                "  text-align: center !important;" +
                "  pointer-events: none !important;" +
                "  font-size: 12px !important;" +
                "  color: black;" +
                "  margin-top: -10px;" +
                "  margin-bottom: -10px;" +
                "}";
            document.head.appendChild(style);
        }

        var lines = document.querySelectorAll("#divUrunEkSecenek .eksecenekLine");
        var processed = false;

        lines.forEach(function (line) {
            var label = line.querySelector(".left_line");
            if (!label || label.textContent.trim() !== "Renk") return;

            var sizeBoxes = line.querySelectorAll(".size_box");
            sizeBoxes.forEach(function (box) {
                if (box.querySelector(".varyant-gorsel")) return;

                var rel = box.getAttribute("rel");
                var relInt = parseInt(rel, 10);

                var rawName = (box.getAttribute("title") || "").trim();
                if (!rawName) rawName = renkNameById[relInt] || "";
                if (!rawName) rawName = box.textContent.trim();

                if (/gelince haberin/i.test(rawName)) {
                    rawName = renkNameById[relInt] || "";
                }

                var variantName = temizle(rawName);
                var imgUrl = renkByName[variantName] || renkById[relInt] || null;
                if (!imgUrl || !rawName) return;

                box.classList.add("has-varyant-gorsel");

                var imgEl = document.createElement("img");
                imgEl.src = imgUrl;
                imgEl.alt = rawName;
                imgEl.loading = "lazy";
                imgEl.decoding = "async";
                imgEl.className = "varyant-gorsel";

                var textSpan = document.createElement("span");
                textSpan.textContent = rawName;
                textSpan.className = "varyant-gorsel-text";

                box.innerHTML = "";
                box.appendChild(imgEl);
                box.appendChild(textSpan);
                processed = true;
            });
        });

        return processed;
    }

    // Varyant alanı platform tarafından geç oluşturulabildiği için sınırlı bir bekleme
    // kullanılır. Sayfa hazır olmadan sorgu çalıştırılmaz.
    function startVariantWatcher() {
        var waitingObserver = null;

        function bindVariantObserver(el) {
            if (!window.MutationObserver || el.getAttribute('data-ots-variant-images-observed') === 'true') return;

            el.setAttribute('data-ots-variant-images-observed', 'true');
            new MutationObserver(function () {
                init();
            }).observe(el, { childList: true, subtree: true });
        }

        function findAndInit() {
            var el = document.getElementById("divUrunEkSecenek");
            var hasBoxes = el && el.querySelectorAll(".size_box").length > 0;

            if (hasBoxes) {
                if (waitingObserver) {
                    waitingObserver.disconnect();
                    waitingObserver = null;
                }
                init();
                bindVariantObserver(el);
                return true;
            }

            return false;
        }

        if (findAndInit()) return;

        if (window.MutationObserver && document.body) {
            waitingObserver = new MutationObserver(function () {
                findAndInit();
            });
            waitingObserver.observe(document.body, { childList: true, subtree: true });
            window.setTimeout(function () {
                if (waitingObserver) {
                    waitingObserver.disconnect();
                    waitingObserver = null;
                }
            }, 6000);
            return;
        }

        // MutationObserver olmayan eski tarayıcılar için sınırlı geri dönüş.
        [200, 600, 1200, 2400, 4000, 6000].forEach(function (delay) {
            window.setTimeout(findAndInit, delay);
        });
    }

    // Özel Alanları Gizle (Güvenli Tetikleme)
    function gizleOzelAlan() {
        var ozelAlan2 = document.getElementById("divOzelAlan2");
        var ozelAlan3 = document.getElementById("divOzelAlan3");
        if (ozelAlan2) ozelAlan2.style.display = "none";
        if (ozelAlan3) ozelAlan3.style.display = "none";
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", gizleOzelAlan);
        document.addEventListener("DOMContentLoaded", startVariantWatcher);
    } else {
        gizleOzelAlan();
        startVariantWatcher();
    }
})();

/* ========================================================================
 * BÖLÜM 3: KARGO BİLGİSİ VE GERİ SAYIM
 *
 * Ücretsiz kargo durumu, kargo avantajı ve gönderim geri sayımını tek panelde gösterir.
 * Tutar ve zaman değişikliklerinde kargo panelini günceller.
 * ====================================================================== */
(function (window, document) {
    'use strict';

    if (window.otsShippingPanelStarted) {
        if (typeof window.otsShippingPanelRefresh === 'function') window.otsShippingPanelRefresh();
        return;
    }

    window.otsShippingPanelStarted = true;

    var FREE_SHIPPING_LIMIT = 2000;
    var SHIPPING_HOUR = 14;
    var SHIPPING_MINUTE = 0;
    var PANEL_ID = 'otsShippingPanel';
    var STYLE_ID = 'otsShippingPanelStyles';
    var renderTimer = null;
    var clockTimer = null;
    var observer = null;

    var css = `
html body #kargoSayacBox,
html body #otsCargoWidget.ots-cargo-widget,
body #divKargoBedava { display:none!important; }

#${PANEL_ID} {
    box-sizing:border-box;
    display:block;
    width:100%;
    clear:both;
    margin:14px 0 18px;
    padding:0 16px;
    border:1px solid #d5e3ef;
    border-radius:12px;
    background:#f3f8fc;
    color:#26334b;
    font-family:inherit;
    box-shadow:0 5px 18px rgba(12,21,48,.05);
}
#${PANEL_ID},#${PANEL_ID} * { box-sizing:border-box; float:none; }
#${PANEL_ID} .ots-shipping-row { display:grid; grid-template-columns:140px minmax(0,1fr) auto; align-items:center; gap:14px; min-height:70px; padding:14px 0; }
#${PANEL_ID} .ots-shipping-row + .ots-shipping-row { border-top:1px solid #dbe7f1; }
#${PANEL_ID} .ots-shipping-label { display:flex; align-items:center; gap:9px; min-width:0; color:#0c154c; font-size:12px; font-weight:700; line-height:1.35; }
#${PANEL_ID} .ots-shipping-dot { display:block; flex:0 0 auto; width:7px; height:7px; border-radius:50%; background:#23865f; }
#${PANEL_ID}.is-after-cutoff .ots-shipping-dispatch .ots-shipping-dot { background:#68819d; }
#${PANEL_ID}.is-weekend .ots-shipping-dispatch .ots-shipping-dot { background:#b08738; }
#${PANEL_ID} .ots-shipping-content { min-width:0; }
#${PANEL_ID} .ots-shipping-title { margin:0; color:#26334b; font-size:13px; font-weight:600; line-height:1.45; }
#${PANEL_ID} .ots-shipping-note { margin:3px 0 0; color:#778297; font-size:11px; font-weight:400; line-height:1.4; }
#${PANEL_ID} .ots-shipping-countdown { min-width:120px; color:#0c154c; font-size:20px; font-weight:700; line-height:1; text-align:right; font-variant-numeric:tabular-nums; letter-spacing:.025em; }
#${PANEL_ID} .ots-shipping-countdown[hidden] { display:none!important; }
#${PANEL_ID} .ots-shipping-amount { color:#0c154c; font-size:12px; font-weight:700; line-height:1.35; text-align:right; white-space:nowrap; }
#${PANEL_ID} .ots-shipping-progress { position:relative; width:100%; height:5px; margin-top:9px; overflow:hidden; border-radius:5px; background:#edf0f4; }
#${PANEL_ID} .ots-shipping-progress-fill { display:block; width:0; height:100%; border-radius:inherit; background:#0c154c; transition:width .25s ease; }
#${PANEL_ID}.has-free-shipping .ots-shipping-free .ots-shipping-dot,
#${PANEL_ID}.has-free-shipping .ots-shipping-progress-fill { background:#23865f; }

@media(max-width:640px) {
    #${PANEL_ID} { margin:12px 0 15px; padding:0 13px; }
    #${PANEL_ID} .ots-shipping-row { grid-template-columns:minmax(0,1fr) auto; gap:7px 12px; min-height:0; padding:13px 0; }
    #${PANEL_ID} .ots-shipping-label { grid-column:1; }
    #${PANEL_ID} .ots-shipping-content { grid-column:1 / -1; grid-row:2; }
    #${PANEL_ID} .ots-shipping-countdown,#${PANEL_ID} .ots-shipping-amount { grid-column:2; grid-row:1; min-width:0; font-size:12px; }
    #${PANEL_ID} .ots-shipping-countdown { font-size:18px; }
}
@media(prefers-reduced-motion:reduce) { #${PANEL_ID} .ots-shipping-progress-fill { transition:none; } }
`;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
    }

    function parseTL(value) {
        var text = String(value || '').replace(/\s/g, '').replace(/[^\d,.-]/g, '');
        var comma = text.lastIndexOf(',');
        var dot = text.lastIndexOf('.');

        if (comma > -1 && dot > -1) {
            text = comma > dot ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '');
        } else if (comma > -1) {
            text = text.replace(/\./g, '').replace(',', '.');
        } else if (dot > -1 && text.length - dot - 1 > 2) {
            text = text.replace(/\./g, '');
        }

        var amount = Number(text);
        return Number.isFinite(amount) ? amount : 0;
    }

    function formatTL(value) {
        return Number(value || 0).toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + ' TL';
    }

    function getCartTotal() {
        var selectors = [
            '#spnTopSepetToplamTutar',
            '.sepetTopTutar',
            '#spnToplamTutar',
            '#spnSepetToplamTutar'
        ];
        var i;
        var element;

        for (i = 0; i < selectors.length; i += 1) {
            element = document.querySelector(selectors[i]);
            if (element && element.textContent.trim()) return parseTL(element.textContent);
        }

        return 0;
    }

    function findPlacementAnchor() {
        var detail = document.querySelector('#ProductDetailMain .RightDetail, #contentProductDetail .RightDetail, .RightDetail');
        var anchor;

        if (!detail) return null;
        // İşlem butonları sepetin hemen ardından gelir; kargo onların arkasında kalır.
        // İki observer'ın aynı yeri sahiplenip düğümleri sürekli taşımasını engeller.
        anchor = detail.querySelector('.ots-detail-actions') || detail.querySelector('#divSatinAl') || detail.querySelector('.BasketBtn');

        if (anchor && anchor.nextElementSibling && anchor.nextElementSibling.classList.contains('clear')) {
            anchor = anchor.nextElementSibling;
        }

        return anchor || detail.querySelector('.ProductIcon2') || detail.querySelector('.ProductIcon');
    }

    function removeLegacyWidgets() {
        document.querySelectorAll('#kargoSayacBox, #otsCargoWidget').forEach(function (element) {
            element.remove();
        });
    }

    function createPanel() {
        var panel = document.createElement('section');
        panel.id = PANEL_ID;
        panel.setAttribute('aria-label', 'Gönderim ve kargo bilgileri');
        panel.innerHTML = `
            <div class="ots-shipping-row ots-shipping-dispatch">
                <div class="ots-shipping-label"><span class="ots-shipping-dot" aria-hidden="true"></span><span>Gönderim zamanı</span></div>
                <div class="ots-shipping-content">
                    <p class="ots-shipping-title" data-shipping-message></p>
                    <p class="ots-shipping-note" data-shipping-note></p>
                </div>
                <time class="ots-shipping-countdown" data-shipping-countdown aria-live="off"></time>
            </div>
            <div class="ots-shipping-row ots-shipping-free">
                <div class="ots-shipping-label"><span class="ots-shipping-dot" aria-hidden="true"></span><span>Ücretsiz kargo</span></div>
                <div class="ots-shipping-content">
                    <p class="ots-shipping-title" data-cargo-message></p>
                    <div class="ots-shipping-progress" role="progressbar" aria-label="Ücretsiz kargo limiti" aria-valuemin="0" aria-valuemax="100">
                        <span class="ots-shipping-progress-fill" data-cargo-progress></span>
                    </div>
                </div>
                <div class="ots-shipping-amount" data-cargo-amount></div>
            </div>
        `;
        return panel;
    }

    function twoDigits(value) {
        return value < 10 ? '0' + value : String(value);
    }

    /* Saniyelik güncellemede yalnızca değişen değerleri yazar; aynı metni
       yeniden yazmak sayfadaki diğer gözlemcileri her saniye tetikler. */
    function setText(element, value) {
        if (element.textContent === value) return;
        // Mevcut metin düğümü güncellenir; böylece yalnızca characterData değişimi
        // oluşur ve childList izleyen sayfa gözlemcileri her saniye uyanmaz.
        var node = element.firstChild;
        if (node && node.nodeType === 3 && !node.nextSibling && value) node.nodeValue = value;
        else element.textContent = value;
    }

    function setHidden(element, hidden) {
        if (element.hidden !== hidden) element.hidden = hidden;
    }

    function updateDispatch(panel) {
        // Gönderim saati İstanbul saatine göredir (Türkiye sürekli UTC+3);
        // ziyaretçinin cihaz saat diliminden bağımsız hesaplanır.
        var now = new Date(Date.now() + 3 * 3600 * 1000);
        var day = now.getUTCDay();
        var secondsOfDay = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
        var deadlineSeconds = SHIPPING_HOUR * 3600 + SHIPPING_MINUTE * 60;
        var isWeekend = day === 0 || day === 6;
        var afterCutoff = !isWeekend && secondsOfDay >= deadlineSeconds;
        var message = panel.querySelector('[data-shipping-message]');
        var note = panel.querySelector('[data-shipping-note]');
        var countdown = panel.querySelector('[data-shipping-countdown]');
        var remaining;
        var hours;
        var minutes;
        var seconds;

        if (panel.classList.contains('is-weekend') !== isWeekend) panel.classList.toggle('is-weekend', isWeekend);
        if (panel.classList.contains('is-after-cutoff') !== afterCutoff) panel.classList.toggle('is-after-cutoff', afterCutoff);

        if (isWeekend || (day === 5 && afterCutoff)) {
            setText(message, isWeekend
                ? 'Hafta sonu siparişleri pazartesi günü kargoya teslim edilir.'
                : 'Cuma 14.00 sonrası siparişler pazartesi günü kargoya teslim edilir.');
            setText(note, 'Siparişinizi şimdi oluşturabilirsiniz.');
            setHidden(countdown, true);
            setText(countdown, '');
            return;
        }

        if (afterCutoff) {
            setText(message, 'Siparişiniz en geç 24 saat içinde kargoya teslim edilir.');
            setText(note, 'Gönderimler iş günlerinde hazırlanır.');
            setHidden(countdown, true);
            setText(countdown, '');
            return;
        }

        remaining = Math.max(0, deadlineSeconds - secondsOfDay);
        hours = Math.floor(remaining / 3600);
        minutes = Math.floor((remaining % 3600) / 60);
        seconds = remaining % 60;

        setText(message, 'Bu süre içinde verilen siparişler bugün kargoda.');
        setText(note, 'Saat 14.00 gönderimi için kalan süre');
        setHidden(countdown, false);
        setText(countdown, twoDigits(hours) + ':' + twoDigits(minutes) + ':' + twoDigits(seconds));
        countdown.setAttribute('datetime', 'PT' + hours + 'H' + minutes + 'M' + seconds + 'S');
    }

    function updateFreeShipping(panel) {
        var total = getCartTotal();
        var remaining = Math.max(FREE_SHIPPING_LIMIT - total, 0);
        var percent = Math.min(Math.max((total / FREE_SHIPPING_LIMIT) * 100, 0), 100);
        var completed = remaining <= 0;
        var message = panel.querySelector('[data-cargo-message]');
        var amount = panel.querySelector('[data-cargo-amount]');
        var progress = panel.querySelector('[data-cargo-progress]');
        var progressBox = progress.parentElement;

        panel.classList.toggle('has-free-shipping', completed);
        message.textContent = completed ? 'Sepetiniz ücretsiz kargo avantajına uygun.' : formatTL(remaining) + ' daha ekleyin.';
        amount.textContent = completed ? 'Limit tamamlandı' : formatTL(total) + ' / ' + formatTL(FREE_SHIPPING_LIMIT);
        progress.style.width = percent + '%';
        progressBox.setAttribute('aria-valuenow', String(Math.round(percent)));
    }

    function render() {
        var anchor;
        var panel;

        injectStyles();
        removeLegacyWidgets();
        anchor = findPlacementAnchor();
        if (!anchor || !anchor.parentNode) return false;

        panel = document.getElementById(PANEL_ID);
        if (!panel) panel = createPanel();

        if (panel.parentElement !== anchor.parentElement || panel.previousElementSibling !== anchor) {
            anchor.insertAdjacentElement('afterend', panel);
        }

        updateDispatch(panel);
        updateFreeShipping(panel);
        return true;
    }

    function scheduleRender() {
        window.clearTimeout(renderTimer);
        renderTimer = window.setTimeout(render, 60);
    }

    function mutationNeedsRefresh(mutation) {
        var target = mutation.target.nodeType === 1 ? mutation.target : mutation.target.parentElement;
        var selector = '#divSatinAl, .RightDetail, #spnTopSepetToplamTutar, .sepetTopTutar, #spnToplamTutar, #spnSepetToplamTutar, #kargoSayacBox, #otsCargoWidget';

        if (target && target.closest('#' + PANEL_ID)) return false;
        if (target && (target.matches(selector) || target.closest(selector))) return true;

        return Array.prototype.some.call(mutation.addedNodes || [], function (node) {
            return node.nodeType === 1 && (node.matches(selector) || node.querySelector(selector));
        });
    }

    function start() {
        render();

        if (!clockTimer) {
            clockTimer = window.setInterval(function () {
                var panel = document.getElementById(PANEL_ID);
                if (panel) updateDispatch(panel);
            }, 1000);
        }

        if (window.MutationObserver && !observer) {
            observer = new MutationObserver(function (mutations) {
                if (mutations.some(mutationNeedsRefresh)) scheduleRender();
            });
            observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
        }

        [100, 350, 800, 1500, 3000, 6000].forEach(function (delay) {
            window.setTimeout(scheduleRender, delay);
        });
    }

    window.otsShippingPanelRefresh = scheduleRender;

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
}(window, document));

/* ========================================================================
 * BÖLÜM 4: ÜRÜN GERİ BİLDİRİM FORMU
 *
 * Ürün bilgisiyle ilgili hata ve öneri formunu anlaşılır bir düzende sunar.
 * İletişim bilgileri ile WhatsApp destek yönlendirmesini forma ekler.
 * ====================================================================== */
(function (window, document) {
    'use strict';

    if (window.otsProductFeedbackStarted) {
        if (typeof window.otsProductFeedbackRefresh === 'function') window.otsProductFeedbackRefresh();
        return;
    }

    window.otsProductFeedbackStarted = true;

    var STYLE_ID = 'otsProductFeedbackStyles';
    var CONTACT_CLASS = 'ots-feedback-contact';
    var pending = false;
    var observer = null;

    var css = `
#divTabUrunOnerileri.ots-product-feedback { box-sizing:border-box; width:100%; color:#28354d; font-family:inherit; }
#divTabUrunOnerileri.ots-product-feedback * { box-sizing:border-box; }
#divTabUrunOnerileri.ots-product-feedback .tabUrunOneriler { display:grid!important; grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr); align-items:start; gap:18px; width:100%; padding:0!important; background:transparent!important; }
#divTabUrunOnerileri.ots-product-feedback .tabUrunOneriler > script { display:none!important; }
#divTabUrunOnerileri.ots-product-feedback .frmUrunOneriler { display:block!important; width:100%!important; margin:0!important; padding:24px!important; border:1px solid #e0e6ee; border-radius:14px; background:#fff; list-style:none; box-shadow:0 7px 24px rgba(12,21,48,.045); }
#divTabUrunOnerileri.ots-product-feedback .frmUrunOneriler > li { box-sizing:border-box; display:block; width:100%; margin:0; padding:0; float:none; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-intro { margin-bottom:20px!important; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-title { margin:0 0 8px; color:#0c154c; font-size:21px; font-weight:700; line-height:1.3; letter-spacing:-.25px; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-description { max-width:680px; margin:0; color:#69758a; font-size:13px; font-weight:400; line-height:1.65; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-options-heading { margin:0 0 9px!important; color:#0c154c; font-size:12px; font-weight:700; line-height:1.4; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-option { margin-top:8px!important; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-option .checkbox { position:relative; display:block!important; width:100%; margin:0!important; padding:0!important; float:none!important; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-option input[type='checkbox'] { position:absolute; left:13px; top:50%; z-index:2; width:19px; height:19px; margin:0; border:1px solid #bcc8d6; border-radius:5px; background:#fff; appearance:none; -webkit-appearance:none; transform:translateY(-50%); cursor:pointer; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-option input[type='checkbox']:checked { border-color:#0c154c; background:#0c154c; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-option input[type='checkbox']:checked::after { content:'✓'; position:absolute; inset:0; color:#fff; font-size:13px; font-weight:700; line-height:17px; text-align:center; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-option label { display:flex!important; align-items:center; min-height:46px; width:100%; margin:0!important; padding:10px 13px 10px 43px!important; border:1px solid #e2e7ee; border-radius:9px; background:#fafbfd; color:#37445b; font-size:13px; font-weight:500; line-height:1.45; cursor:pointer; transition:border-color .18s,background .18s; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-option label:hover { border-color:#bac8d8; background:#f5f8fb; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-option input[type='checkbox']:checked + label { border-color:#aab9ce; background:#f1f6fa; color:#0c154c; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-option input[type='checkbox']:focus-visible,#divTabUrunOnerileri.ots-product-feedback textarea:focus-visible,#divTabUrunOnerileri.ots-product-feedback button:focus-visible,#divTabUrunOnerileri.ots-product-feedback a:focus-visible { outline:3px solid #79bdd5; outline-offset:2px; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-notes { margin-top:20px!important; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-notes-label { display:block; margin:0 0 7px; color:#0c154c; font-size:12px; font-weight:700; line-height:1.4; }
#divTabUrunOnerileri.ots-product-feedback #txtOneriNot { display:block; width:100%!important; min-height:112px; margin:0!important; padding:12px 13px!important; border:1px solid #d8e0e9!important; border-radius:9px!important; background:#fff!important; color:#28354d!important; font:inherit!important; font-size:13px!important; line-height:1.55!important; resize:vertical; box-shadow:none!important; }
#divTabUrunOnerileri.ots-product-feedback #txtOneriNot::placeholder { color:#929cad; opacity:1; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-submit { margin-top:14px!important; }
#divTabUrunOnerileri.ots-product-feedback #btnOneriGonder { display:inline-flex!important; align-items:center; justify-content:center; min-width:190px; min-height:44px; margin:0!important; padding:11px 20px!important; border:1px solid #0c154c!important; border-radius:9px!important; background:#0c154c!important; color:#fff!important; font-family:inherit!important; font-size:13px!important; font-weight:650!important; line-height:1.4!important; cursor:pointer; box-shadow:none!important; transition:background .18s,border-color .18s; }
#divTabUrunOnerileri.ots-product-feedback #btnOneriGonder:hover { border-color:#202d66!important; background:#202d66!important; }
#divTabUrunOnerileri.ots-product-feedback .${CONTACT_CLASS} { width:100%; padding:22px; border:1px solid #d8e5ef; border-radius:14px; background:#f3f8fc; color:#344158; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-contact-title { margin:0 0 7px; color:#0c154c; font-size:18px; font-weight:700; line-height:1.35; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-contact-description { margin:0 0 18px; color:#6b778c; font-size:12px; line-height:1.6; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-details { display:grid; grid-template-columns:86px minmax(0,1fr); gap:11px 10px; margin:0; padding:0; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-details dt { margin:0; color:#788499; font-size:11px; font-weight:600; line-height:1.5; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-details dd { min-width:0; margin:0; color:#26334b; font-size:12px; font-weight:600; line-height:1.5; overflow-wrap:anywhere; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-details a { color:#0c154c; text-decoration:none; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-details a:hover { text-decoration:underline; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-whatsapp { display:flex!important; align-items:center; justify-content:center; width:100%; min-height:44px; margin:20px 0 0!important; padding:11px 15px!important; border:1px solid #247a5a; border-radius:9px; background:#fff; color:#176344!important; font-size:13px; font-weight:650; line-height:1.4; text-align:center; text-decoration:none!important; transition:background .18s,color .18s; }
#divTabUrunOnerileri.ots-product-feedback .ots-feedback-whatsapp:hover { background:#247a5a; color:#fff!important; }

@media(max-width:850px) {
    #divTabUrunOnerileri.ots-product-feedback .tabUrunOneriler { grid-template-columns:1fr; }
}
@media(max-width:520px) {
    #divTabUrunOnerileri.ots-product-feedback .frmUrunOneriler,#divTabUrunOnerileri.ots-product-feedback .${CONTACT_CLASS} { padding:17px!important; border-radius:11px; }
    #divTabUrunOnerileri.ots-product-feedback .ots-feedback-title { font-size:19px; }
    #divTabUrunOnerileri.ots-product-feedback #btnOneriGonder { width:100%; }
    #divTabUrunOnerileri.ots-product-feedback .ots-feedback-details { grid-template-columns:76px minmax(0,1fr); }
}
@media(prefers-reduced-motion:reduce) {
    #divTabUrunOnerileri.ots-product-feedback .ots-feedback-option label,#divTabUrunOnerileri.ots-product-feedback #btnOneriGonder,#divTabUrunOnerileri.ots-product-feedback .ots-feedback-whatsapp { transition:none; }
}
`;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
    }

    function getProductName() {
        var heading = document.querySelector('.ProductName h1, .ProductName span, #ProductDetailMain h1');
        if (heading && heading.textContent.trim()) return heading.textContent.trim();
        if (window.productDetailModel && window.productDetailModel.productName) return window.productDetailModel.productName;
        return 'ürün';
    }

    function getWhatsAppUrl() {
        var message = 'Merhaba, ' + getProductName() + ' hakkında destek almak istiyorum.\n' + window.location.href;
        return 'https://wa.me/902163135687?text=' + encodeURIComponent(message);
    }

    function createContact() {
        var contact = document.createElement('aside');
        contact.className = CONTACT_CLASS;
        contact.setAttribute('aria-labelledby', 'otsFeedbackContactTitle');
        contact.innerHTML = `
            <h3 class="ots-feedback-contact-title" id="otsFeedbackContactTitle">Bize doğrudan ulaşın</h3>
            <p class="ots-feedback-contact-description">Form dışında destek almak isterseniz aşağıdaki iletişim kanallarını kullanabilirsiniz.</p>
            <dl class="ots-feedback-details">
                <dt>Firma Adı</dt><dd>Öts İç Giyim</dd>
                <dt>Telefon</dt><dd><a href="tel:+902163135687">0 (216) 313 56 87</a></dd>
                <dt>Adres</dt><dd>Yukarı Dudullu Mah. Kuriş Sk. No: 1/2 Ümraniye / İstanbul</dd>
                <dt>E-posta</dt><dd><a href="mailto:destek@otsicgiyim.com">destek@otsicgiyim.com</a></dd>
            </dl>
            <a class="ots-feedback-whatsapp" href="${getWhatsAppUrl()}" target="_blank" rel="noopener noreferrer">WhatsApp üzerinden bize ulaşın</a>
        `;
        return contact;
    }

    function enhanceForm(panel) {
        var content = panel.querySelector('.tabUrunOneriler');
        var form = panel.querySelector('.frmUrunOneriler');
        var intro;
        var firstOption;
        var optionsHeading;
        var textarea;
        var notesRow;
        var oldNotesLabel;
        var notesLabel;
        var button;
        var contact;

        if (!content || !form) return false;

        panel.classList.add('ots-product-feedback');

        intro = form.querySelector('li:first-child');
        if (intro && !intro.classList.contains('ots-feedback-intro')) {
            intro.className = 'ots-feedback-intro';
            intro.innerHTML = '<h2 class="ots-feedback-title">Ürünle ilgili geri bildirim gönderin</h2><p class="ots-feedback-description">Ürün açıklaması, görseli, fiyatı veya sayfanın çalışmasıyla ilgili fark ettiğiniz durumu seçin. Eklemek istediğiniz ayrıntıları not alanına yazabilirsiniz.</p>';
        }

        form.querySelectorAll('input[type="checkbox"]').forEach(function (checkbox) {
            var row = checkbox.closest('li');
            if (row) row.classList.add('ots-feedback-option');
        });

        firstOption = form.querySelector('.ots-feedback-option');
        optionsHeading = form.querySelector('.ots-feedback-options-heading');
        if (firstOption && !optionsHeading) {
            optionsHeading = document.createElement('li');
            optionsHeading.className = 'ots-feedback-options-heading';
            optionsHeading.textContent = 'Bildirim konusunu seçin';
            firstOption.parentNode.insertBefore(optionsHeading, firstOption);
        }

        textarea = form.querySelector('#txtOneriNot');
        notesRow = textarea && textarea.closest('li');
        if (notesRow) {
            notesRow.classList.add('ots-feedback-notes');
            textarea.placeholder = 'Durumu daha iyi anlayabilmemiz için ayrıntıları yazın...';
            oldNotesLabel = notesRow.querySelector('strong');
            notesLabel = notesRow.querySelector('.ots-feedback-notes-label');
            if (!notesLabel) {
                notesLabel = document.createElement('label');
                notesLabel.className = 'ots-feedback-notes-label';
                notesLabel.setAttribute('for', 'txtOneriNot');
                notesLabel.textContent = 'Açıklamanız';
                notesRow.insertBefore(notesLabel, textarea);
            }
            if (oldNotesLabel) oldNotesLabel.remove();
        }

        button = form.querySelector('#btnOneriGonder');
        if (button) {
            // Aynı metni yeniden yazmak gözlemciyi tetikleyip sonsuz yenilemeye yol açar.
            if (button.textContent !== 'Geri Bildirimi Gönder') button.textContent = 'Geri Bildirimi Gönder';
            if (button.closest('li')) button.closest('li').classList.add('ots-feedback-submit');
        }

        contact = content.querySelector('.' + CONTACT_CLASS);
        if (!contact) {
            contact = createContact();
            content.appendChild(contact);
        } else {
            contact.querySelector('.ots-feedback-whatsapp').href = getWhatsAppUrl();
        }

        return true;
    }

    function refresh() {
        var panel = document.getElementById('divTabUrunOnerileri');
        pending = false;
        injectStyles();
        if (panel) enhanceForm(panel);
    }

    function schedule() {
        if (pending) return;
        pending = true;
        (window.requestAnimationFrame || window.setTimeout)(refresh);
    }

    function start() {
        refresh();
        if (window.MutationObserver && !observer) {
            observer = new MutationObserver(schedule);
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    window.otsProductFeedbackRefresh = schedule;

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
}(window, document));

/* ========================================================================
 * BÖLÜM 5: BEDEN TABLOSU OLUŞTURMA VE DÜZENLEME
 *
 * Ürün açıklamasındaki beden verilerini okunabilir tablo görünümüne dönüştürür.
 * Beden tablosu içeriğinin oluşturulması ve sayfaya uygulanmasını yönetir.
 * ====================================================================== */
(function () {
    // --- Ayarlar ---
    var OUTPUT_MODE = "HTML"; // "IMAGE" veya "HTML"
    var API_KEY = "2dd3572e8777315e9a2d86616b53f53193611ad0cb0ecb154763da2774a70a2b";
    var IMAGE_ENDPOINT = "https://panel.sizeportal.com/api/trendyol-image.php";
    var HTML_ENDPOINT = "https://panel.sizeportal.com/api/table-download-html.php";

    var STYLE_ID = "beden-tablosu-style";
    var BTN_ID = "btnBedenTablosu";
    var MODAL_ID = "bedenTablosuModal";
    var htmlCache = {};
    var verifiedHtmlIds = {};
    var buttonCheckInProgress = false;
    var buttonHiddenByEmptyHtml = false;

    function buildApiUrl(mode, id) {
        var base = mode === "HTML" ? HTML_ENDPOINT : IMAGE_ENDPOINT;
        return base + "?id=" + encodeURIComponent(id) + "&api_key=" + encodeURIComponent(API_KEY);
    }

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent =
            "#" + BTN_ID + "{" +
            "  display:inline-flex;align-items:center;gap:6px;" +
            "  margin-top:10px;padding:8px 16px;cursor:pointer;" +
            "  background:#222;color:#fff;border:none;border-radius:4px;" +
            "  font-size:13px;font-weight:600;letter-spacing:.3px;" +
            "  transition:background .2s;" +
            "}" +
            "#" + BTN_ID + ":hover{background:#444;}" +
            "#" + BTN_ID + " svg{width:16px;height:16px;fill:currentColor;}" +
            "#" + MODAL_ID + "{" +
            "  position:fixed;inset:0;z-index:99999;display:none;" +
            "  align-items:center;justify-content:center;" +
            "  background:rgba(0,0,0,.7);padding:20px;box-sizing:border-box;" +
            "}" +
            "#" + MODAL_ID + ".open{display:flex;}" +
            "#" + MODAL_ID + " .bt-content{" +
            "  position:relative;background:#fff;border-radius:8px;" +
            "  max-width:900px;max-height:90vh;width:100%;" +
            "  overflow:auto;padding:20px;box-shadow:0 10px 40px rgba(0,0,0,.3);" +
            "}" +
            "#" + MODAL_ID + " .bt-close{" +
            "  position:absolute;top:10px;right:14px;background:transparent;" +
            "  border:none;font-size:28px;line-height:1;cursor:pointer;color:#333;z-index:2;" +
            "}" +
            "#" + MODAL_ID + " .bt-title{margin:0 0 12px;font-size:16px;font-weight:700;color:#222;}" +
            "#" + MODAL_ID + " .bt-body{min-height:120px;background:#fff;}" +
            "#" + MODAL_ID + " .bt-html-wrap{background:#fff;}" +
            "#" + MODAL_ID + " .bt-body img{display:block;max-width:100%;height:auto;margin:0 auto;}" +
            "#" + MODAL_ID + " .bt-body table{max-width:100%;}" +
            "#" + MODAL_ID + " .bt-loading,#" + MODAL_ID + " .bt-empty{padding:30px;text-align:center;color:#666;}" +
            "#" + MODAL_ID + " .bt-spinner{" +
            "  display:inline-block;width:28px;height:28px;border:3px solid #ddd;" +
            "  border-top-color:#222;border-radius:50%;animation:btSpin .8s linear infinite;" +
            "}" +
            "@keyframes btSpin{to{transform:rotate(360deg);}}";
        document.head.appendChild(style);
    }

    function getOzelAlan2Value() {
        var el = document.getElementById("divOzelAlan2");
        if (!el) return null;
        var val = (el.textContent || "").trim();
        if (!val || !/^\d+$/.test(val)) return null;
        return val;
    }

    function normalizeHtmlResponse(html) {
        if (!html) return "";

        var doc = new DOMParser().parseFromString(html, "text/html");
        var body = doc.body;
        if (!body) return "";

        body.style.background = "#fff";
        var styles = "";
        Array.prototype.forEach.call(
            doc.head ? doc.head.querySelectorAll('style,link[rel~="stylesheet"]') : [],
            function (node) { styles += node.outerHTML; }
        );

        return styles + '<div class="bt-html-wrap" style="background:#fff;">' + body.innerHTML + '</div>';
    }

    function hasVisibleHtmlContent(html) {
        var doc = new DOMParser().parseFromString(html || "", "text/html");
        var body = doc.body;
        if (!body) return false;

        Array.prototype.forEach.call(
            body.querySelectorAll("script,style,noscript,template"),
            function (node) { node.parentNode.removeChild(node); }
        );

        var text = (body.textContent || "").replace(/\u00a0/g, " ").trim();
        return !!(text || body.querySelector("img,svg,table,thead,tbody,tr,td,th"));
    }

    function fetchHtml(id) {
        if (htmlCache[id]) return htmlCache[id];

        htmlCache[id] = fetch(buildApiUrl("HTML", id), { method: "GET", credentials: "omit" })
            .then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.text();
            });

        return htmlCache[id];
    }

    function forcePageBackgroundWhite() {
        if (document.documentElement) document.documentElement.style.background = "#fff";
        if (document.body) document.body.style.background = "#fff";
    }

    function ensureModal() {
        var modal = document.getElementById(MODAL_ID);
        if (modal) return modal;

        modal = document.createElement("div");
        modal.id = MODAL_ID;
        modal.innerHTML =
            '<div class="bt-content" role="dialog" aria-modal="true">' +
            '<button type="button" class="bt-close" aria-label="Kapat">&times;</button>' +
            '<h3 class="bt-title">Beden Tablosu</h3>' +
            '<div class="bt-body"></div>' +
            '</div>';

        modal.addEventListener("click", function (e) {
            if (e.target === modal) closeModal();
        });
        modal.querySelector(".bt-close").addEventListener("click", closeModal);
        document.body.appendChild(modal);
        return modal;
    }

    function setBody(modal, html) {
        modal.querySelector(".bt-body").innerHTML = html;
        forcePageBackgroundWhite();
    }

    function renderImage(modal, id) {
        var url = buildApiUrl("IMAGE", id);
        setBody(modal,
            '<div class="bt-loading"><span class="bt-spinner"></span></div>'
        );
        var img = new Image();
        img.onload = function () {
            setBody(modal, '<img src="' + url + '" alt="Beden Tablosu ' + id + '" />');
        };
        img.onerror = function () {
            setBody(modal,
                '<div class="bt-empty">Beden tablosu görseli yüklenemedi (ID: ' + id + ')</div>'
            );
        };
        img.src = url;
    }

    function renderHtml(modal, id) {
        setBody(modal,
            '<div class="bt-loading"><span class="bt-spinner"></span></div>'
        );
        fetchHtml(id)
            .then(function (html) {
                setBody(modal,
                    hasVisibleHtmlContent(html)
                        ? normalizeHtmlResponse(html)
                        : '<div class="bt-empty">Boş içerik (ID: ' + id + ')</div>'
                );
            })
            .catch(function () {
                setBody(modal,
                    '<div class="bt-empty">Beden tablosu yüklenemedi (ID: ' + id + ')</div>'
                );
            });
    }

    function openModal() {
        var id = getOzelAlan2Value();
        if (!id) return;
        var modal = ensureModal();
        requestAnimationFrame(function () { modal.classList.add("open"); });
        document.addEventListener("keydown", escListener);

        if (OUTPUT_MODE === "HTML") {
            renderHtml(modal, id);
        } else {
            renderImage(modal, id);
        }
    }

    function closeModal() {
        var modal = document.getElementById(MODAL_ID);
        if (modal) modal.classList.remove("open");
        document.removeEventListener("keydown", escListener);
    }

    function escListener(e) {
        if (e.key === "Escape") closeModal();
    }

    function findVariantContainer() {
        return (
            document.getElementById("divUrunEkSecenekV2") ||
            document.getElementById("divUrunEkSecenek")
        );
    }

    function addButton() {
        if (document.getElementById(BTN_ID)) return true;
        if (buttonHiddenByEmptyHtml || buttonCheckInProgress) return false;

        var id = getOzelAlan2Value();
        if (!id) return false;

        var container = findVariantContainer();
        if (!container) return false;

        if (OUTPUT_MODE === "HTML" && !verifiedHtmlIds[id]) {
            buttonCheckInProgress = true;
            fetchHtml(id)
                .then(function (html) {
                    buttonCheckInProgress = false;
                    if (!hasVisibleHtmlContent(html)) {
                        buttonHiddenByEmptyHtml = true;
                        return;
                    }
                    verifiedHtmlIds[id] = true;
                    addButton();
                })
                .catch(function () {
                    buttonCheckInProgress = false;
                    buttonHiddenByEmptyHtml = true;
                });
            return false;
        }

        var btn = document.createElement("button");
        btn.type = "button";
        btn.id = BTN_ID;
        btn.innerHTML =
            '<svg viewBox="0 0 24 24"><path d="M3 5h18v14H3V5zm2 2v10h14V7H5zm2 2h2v2H7V9zm4 0h2v2h-2V9zm4 0h2v2h-2V9zM7 13h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/></svg>' +
            '<span>Beden Tablosu</span>';
        btn.addEventListener("click", openModal);

        container.parentNode.insertBefore(btn, container.nextSibling);
        return true;
    }

    function init() {
        injectStyles();
        forcePageBackgroundWhite();

        if (addButton()) return;

        if (window.MutationObserver && document.body) {
            var observer = new MutationObserver(function (records) {
                if (document.getElementById(BTN_ID)) return;

                var relevant = records.some(function (record) {
                    var target = record.target;
                    if (target && target.closest && target.closest('#divUrunEkSecenek, #divUrunEkSecenekV2')) return true;

                    return Array.prototype.some.call(record.addedNodes, function (node) {
                        return node && node.nodeType === 1 && (
                            node.id === 'divOzelAlan2' ||
                            node.id === 'divUrunEkSecenek' ||
                            node.id === 'divUrunEkSecenekV2' ||
                            node.id === BTN_ID ||
                            (node.querySelector && node.querySelector('#divOzelAlan2, #divUrunEkSecenek, #divUrunEkSecenekV2, #' + BTN_ID))
                        );
                    });
                });

                if (relevant) addButton();
            });
            observer.observe(document.body, { childList: true, subtree: true });
            return;
        }

        // MutationObserver olmayan eski tarayıcılar için sınırlı geri dönüş.
        [500, 1500, 3000, 6000, 10000].forEach(function (delay) {
            setTimeout(addButton, delay);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

/* ========================================================================
 * BÖLÜM 6: HAVALE İNDİRİM BİLGİSİ
 *
 * Ürün fiyatına göre havale indirimini hesaplar ve avantajlı tutarı gösterir.
 * Varyant veya fiyat değiştiğinde hesaplamayı yeniler.
 * ====================================================================== */
(function () {
    'use strict';

    var DISCOUNT_RATE = 0.05;
    var BRAND_BLUE = '#0c154c';
    var STYLE_ID = 'otsBankTransferDiscountStyles';
    var WIDGET_ID = 'otsBankTransferDiscount';
    var RETRY_DELAYS = [0, 300, 900, 1800];
    var lastPrice = null;
    var lastVariantProductId = null;
    var renderTimer = null;

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '#divFiyatAlanlari {',
            '  width: 100% !important;',
            '  max-width: none !important;',
            '}',
            '#otsBankTransferDiscount, #otsBankTransferDiscount * { box-sizing: border-box; }',
            '#otsBankTransferDiscount {',
            '  --ots-bank-blue: ' + BRAND_BLUE + ';',
            '  --ots-bank-green: #1cb967;',
            '  --ots-bank-line: rgba(12, 21, 76, .13);',
            '  --ots-bank-muted: #71788e;',
            '  width: 100%;',
            '  max-width: none;',
            '  display: grid;',
            '  gap: 7px;',
            '  margin: 12px 0 15px;',
            '  padding: 0;',
            '  color: var(--ots-bank-blue);',
            '  font-family: "Manrope", "DM Sans", Arial, sans-serif;',
            '  clear: both;',
            '}',
            '#otsBankTransferDiscount .ots-product-campaign-row {',
            '  min-height: 46px;',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: space-between;',
            '  gap: 10px;',
            '  padding: 8px 12px;',
            '  border: 1px solid var(--ots-bank-line);',
            '  border-radius: 14px;',
            '  background: rgba(255,255,255,.96);',
            '  box-shadow: 0 12px 32px rgba(12,21,76,.055);',
            '  backdrop-filter: saturate(150%) blur(12px);',
            '}',
            '#otsBankTransferDiscount .ots-product-campaign-row.is-hidden { display: none !important; }',
            '#otsBankTransferDiscount .ots-product-campaign-text {',
            '  min-width: 0;',
            '  display: inline-flex;',
            '  align-items: center;',
            '  gap: 5px;',
            '  color: var(--ots-bank-blue);',
            '  font-size: clamp(10px, .94vw, 12px);',
            '  font-weight: 800;',
            '  line-height: 1.15;',
            '  white-space: nowrap;',
            '  overflow: hidden;',
            '  text-overflow: ellipsis;',
            '}',
            '#otsBankTransferDiscount .ots-product-campaign-prefix {',
            '  flex: 0 0 auto;',
            '  color: var(--ots-bank-muted);',
            '  font-weight: 700;',
            '}',
            '#otsBankTransferDiscount .ots-product-campaign-link {',
            '  flex: 0 0 auto;',
            '  color: var(--ots-bank-blue) !important;',
            '  font-size: 10px;',
            '  font-weight: 900;',
            '  line-height: 1;',
            '  text-decoration: none !important;',
            '  border-bottom: 1px solid rgba(12,21,76,.35);',
            '}',
            '#otsBankTransferDiscount .ots-bank-transfer-row {',
            '  min-height: 46px;',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 10px;',
            '  padding: 8px 12px;',
            '  color: var(--ots-bank-blue);',
            '  border: 1px solid var(--ots-bank-line);',
            '  border-radius: 14px;',
            '  background: rgba(255,255,255,.96);',
            '  box-shadow: 0 12px 32px rgba(12,21,76,.07);',
            '  backdrop-filter: saturate(150%) blur(12px);',
            '}',
            '#otsBankTransferDiscount .ots-bank-transfer-copy {',
            '  min-width: 0;',
            '  flex: 1;',
            '  display: inline-flex;',
            '  align-items: center;',
            '  flex-wrap: wrap;',
            '  gap: 5px;',
            '  color: var(--ots-bank-blue);',
            '  font-size: clamp(10px, .94vw, 12px);',
            '  font-weight: 800;',
            '  line-height: 1.15;',
            '}',
            '#otsBankTransferDiscount .ots-bank-transfer-prefix {',
            '  flex: 0 0 auto;',
            '  color: var(--ots-bank-muted);',
            '  font-weight: 700;',
            '}',
            '#otsBankTransferDiscount .ots-bank-transfer-label {',
            '  color: var(--ots-bank-blue);',
            '  font-weight: 800;',
            '  white-space: nowrap;',
            '}',
            '#otsBankTransferDiscount .ots-bank-transfer-amount {',
            '  display: inline-flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  padding: 3px 8px;',
            '  color: #fff;',
            '  font-size: clamp(10px, .94vw, 12px);',
            '  font-weight: 900;',
            '  line-height: 1.3;',
            '  letter-spacing: -.01em;',
            '  white-space: nowrap;',
            '  border-radius: 6px;',
            '  background: var(--ots-bank-blue);',
            '}',
            '#otsBankTransferDiscount .ots-bank-transfer-text { color: var(--ots-bank-blue); white-space: nowrap; font-weight: 800; }',
            '@media (max-width: 540px) {',
            '  #otsBankTransferDiscount { max-width: none; gap: 6px; margin: 10px 0 13px; }',
            '  #otsBankTransferDiscount .ots-product-campaign-row { min-height: 44px; padding: 8px 9px; border-radius: 12px; }',
            '  #otsBankTransferDiscount .ots-product-campaign-text { font-size: 10px; flex-wrap: wrap; row-gap: 2px; }',
            '  #otsBankTransferDiscount .ots-bank-transfer-row { min-height: 44px; gap: 8px; padding: 8px 9px; border-radius: 12px; }',
            '  #otsBankTransferDiscount .ots-bank-transfer-copy { gap: 4px; font-size: 10px; }',
            '  #otsBankTransferDiscount .ots-bank-transfer-amount { padding: 3px 7px; }',
            '  #otsBankTransferDiscount .ots-bank-transfer-text,',
            '  #otsBankTransferDiscount .ots-bank-transfer-label { white-space: normal; }',
            '}'
        ].join('\n');

        document.head.appendChild(style);
    }

    function isVisible(element) {
        if (!element) return false;
        var style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
    }

    function parsePrice(value) {
        if (!value) return 0;

        var text = String(value)
            .replace(/\{\{[^}]+\}\}/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/[^\d.,]/g, '')
            .trim();

        if (!text) return 0;

        if (text.indexOf(',') > -1) {
            text = text.replace(/\./g, '').replace(',', '.');
        } else {
            var parts = text.split('.');
            // "1.250" gibi tek noktadan sonra üç hane binlik ayırıcıdır, ondalık değil.
            if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
                text = parts.join('');
            }
        }

        var price = parseFloat(text);
        return Number.isFinite(price) ? price : 0;
    }

    function formatTL(value) {
        var safeValue = Number.isFinite(value) ? value : 0;
        var truncatedValue = Math.floor(safeValue * 100) / 100;

        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(truncatedValue) + ' TL';
    }

    function normalizeUrl(url) {
        if (!url) return '#';
        if (/^https?:\/\//i.test(url)) return url;
        return url.charAt(0) === '/' ? url : '/' + url;
    }

    function getProductCampaign() {
        var model = window.productDetailModel;
        var tags = model && Array.isArray(model.tags) ? model.tags : [];
        var tag = tags.find(function (item) {
            return item && item.tanim && item.url;
        }) || tags.find(function (item) {
            return item && item.tanim;
        });

        if (!tag) return null;

        return {
            title: String(tag.tanim || '').trim(),
            url: normalizeUrl(tag.url || '/kampanyalar')
        };
    }

    function getTextPrice(element) {
        if (!element) return 0;
        return parsePrice(element.getAttribute('data-price') || element.getAttribute('content') || element.textContent);
    }

    function findHiddenCartPrice() {
        var cartPrice = document.querySelector('#spnSepetFiyati .spanFiyat') ||
            document.querySelector('#spnSepetFiyati');
        var price = getTextPrice(cartPrice);

        if (price > 0) {
            return { element: cartPrice, price: price };
        }

        return null;
    }

    function normalizeId(value) {
        var id = parseInt(value, 10);
        return Number.isFinite(id) && id > 0 ? id : null;
    }

    function findSelectedVariantProductId() {
        var selectors = [
            '#divUrunEkSecenekV2 .ekSecenekValues.selected',
            '#divUrunEkSecenekV2 .ekSecenekValues.active',
            '#divUrunEkSecenekV2 .ekSecenekValues.secili',
            '#divUrunEkSecenekV2 .ekSecenekValues.Selected',
            '#divUrunEkSecenekV2 .ekSecenekValues[data-selected="true"]',
            '#divUrunEkSecenek .ekSecenekValues.selected',
            '#divUrunEkSecenek .ekSecenekValues.active',
            '#divUrunEkSecenek .ekSecenekValues.secili',
            '#divUrunEkSecenek .ekSecenekValues[data-selected="true"]',
            '.Addtobasket[data-mainVariantId]',
            '.Addtobasket[data-mainvariantid]',
            '.Addtobasket[data-variantId]',
            '.Addtobasket[data-variantid]',
            '.productDetail[data-variant-id]'
        ];

        for (var i = 0; i < selectors.length; i += 1) {
            var element = document.querySelector(selectors[i]);
            var id = normalizeId(element && (
                element.getAttribute('data-productId') ||
                element.getAttribute('data-productid') ||
                element.getAttribute('data-mainVariantId') ||
                element.getAttribute('data-mainvariantid') ||
                element.getAttribute('data-variantId') ||
                element.getAttribute('data-variantid') ||
                element.getAttribute('data-variant-id')
            ));

            if (id) return id;
        }

        return lastVariantProductId;
    }

    function getModelProducts() {
        return window.productDetailModel && Array.isArray(window.productDetailModel.products)
            ? window.productDetailModel.products
            : [];
    }

    function findFromProductDetailModel() {
        var selectedId = findSelectedVariantProductId();
        var products = getModelProducts();
        var product = null;

        if (selectedId) {
            product = products.find(function (item) {
                return normalizeId(item && (item.id || item.urunID || item.variantId)) === selectedId;
            });
        }

        if (!product && products.length === 1) {
            product = products[0];
        }

        if (!product) return null;

        var price = parsePrice(product.urunSepetFiyatiStr || product.satisFiyatiStr || product.urunFiyatiOrjinalStr);

        if (!price && Number.isFinite(product.urunSepetFiyati) && product.urunSepetFiyati > 0) {
            var vatRate = Number.isFinite(product.kdvOrani) ? product.kdvOrani : 0;
            price = product.kdvDahil ? product.urunSepetFiyati : product.urunSepetFiyati * (1 + (vatRate / 100));
        }

        if (price > 0) {
            return {
                element: document.querySelector('#divFiyatAlanlari') ||
                    document.querySelector('.urunDetayFiyatContainer') ||
                    document.querySelector('.PriceList') ||
                    document.body,
                price: price
            };
        }

        return null;
    }

    function findBySelectors() {
        var selectors = [
            '#divUrunKampanyaliFiyat .urunKampanyaFiyat',
            '#spnSepetFiyati .spanFiyat',
            '#indirimliFiyat .spanFiyat',
            '#indirimliFiyat',
            '.IndirimliFiyatContent .spanFiyat',
            '.IndirimliFiyatContent .indirimliFiyat',
            '#fiyat2 .spanFiyat',
            '#fiyat2',
            '.urunDetayFiyatContainer .right_line.indirimliFiyat .spanFiyat',
            '.urunDetayFiyatContainer .spanFiyat',
            '.discountPrice .discountPriceSpan',
            '.discountPrice',
            '.ProductDetailPrice',
            '.product-price',
            '[itemprop="price"]'
        ];

        for (var i = 0; i < selectors.length; i += 1) {
            var nodes = document.querySelectorAll(selectors[i]);
            for (var j = 0; j < nodes.length; j += 1) {
                var node = nodes[j];
                var price = getTextPrice(node);
                if (price > 0 && isVisible(node)) {
                    return { element: node, price: price };
                }
            }
        }

        return null;
    }

    function findFromJsonLd() {
        var scripts = document.querySelectorAll('script[type="application/ld+json"]');

        for (var i = 0; i < scripts.length; i += 1) {
            try {
                var data = JSON.parse(scripts[i].textContent);
                var items = Array.isArray(data) ? data : [data];

                for (var j = 0; j < items.length; j += 1) {
                    var offer = items[j] && items[j].offers;
                    var price = offer && parseFloat(String(offer.price).replace(',', '.'));

                    if (Number.isFinite(price) && price > 0) {
                        return { element: document.querySelector('.urunDetayFiyatContainer') || document.querySelector('.PriceList') || document.body, price: price };
                    }
                }
            } catch (ignore) {
                /* invalid JSON-LD can exist in page source */
            }
        }

        return null;
    }

    function findPrice() {
        return findFromProductDetailModel() || findHiddenCartPrice() || findBySelectors() || findFromJsonLd();
    }

    function findInsertTarget(priceElement) {
        if (!priceElement || priceElement === document.body) {
            return document.querySelector('.PriceList') || document.querySelector('.RightDetail') || document.querySelector('.ProductDetail') || document.body;
        }

        return priceElement.closest('.urunDetayFiyatContainer, .PriceList, #pnlFiyatlar, #divFiyatAlanlari, .ProductDetailPrice, .productPrice') || priceElement.parentNode;
    }

    function createWidget() {
        var widget = document.createElement('div');
        widget.id = WIDGET_ID;
        widget.setAttribute('role', 'note');
        widget.setAttribute('aria-label', 'Ürün kampanyası ve havale indirimi');
        widget.innerHTML = [
            '<div class="ots-product-campaign-row is-hidden">',
            '  <span class="ots-product-campaign-text"><span class="ots-product-campaign-prefix">Aktif Kampanya:</span><span class="ots-product-campaign-title"></span></span>',
            '  <a class="ots-product-campaign-link" href="/kampanyalar">Tümünü gör</a>',
            '</div>',
            '<div class="ots-bank-transfer-row">',
            '  <span class="ots-bank-transfer-copy">',
            '    <span class="ots-bank-transfer-prefix">Ödeme Avantajı:</span>',
            '    <span aria-hidden="true">\uD83D\uDCB8</span>',
            '    <span class="ots-bank-transfer-label">Havale/EFT ile</span>',
            '    <strong class="ots-bank-transfer-amount"></strong>',
            '    <span class="ots-bank-transfer-text">daha az ödeyin!</span>',
            '  </span>',
            '</div>'
        ].join('');
        return widget;
    }

    function updateWidget(widget, price) {
        var saving = price * DISCOUNT_RATE;
        var amount = widget.querySelector('.ots-bank-transfer-amount');
        var campaign = getProductCampaign();
        var campaignRow = widget.querySelector('.ots-product-campaign-row');
        var campaignTitle = widget.querySelector('.ots-product-campaign-title');
        var campaignLink = widget.querySelector('.ots-product-campaign-link');

        // Değer aynıysa yazılmaz; aksi halde Bölüm 13 gözlemcisiyle karşılıklı döngü oluşur.
        var savingText = formatTL(saving);
        if (amount.textContent !== savingText) amount.textContent = savingText;

        if (campaign && campaign.title && campaignRow && campaignTitle && campaignLink) {
            campaignTitle.textContent = campaign.title;
            campaignLink.href = campaign.url;
            campaignRow.classList.remove('is-hidden');
        } else if (campaignRow) {
            campaignRow.classList.add('is-hidden');
        }
    }

    function render() {
        addStyles();

        var found = findPrice();
        if (!found || found.price <= 0) return false;

        var currentPrice = found.price;
        var widget = document.getElementById(WIDGET_ID);
        var target = findInsertTarget(found.element);

        if (!widget) {
            widget = createWidget();
        }

        updateWidget(widget, currentPrice);
        lastPrice = currentPrice;

        if (target && widget.previousElementSibling !== target) {
            target.insertAdjacentElement('afterend', widget);
        }

        return true;
    }

    function scheduleRender() {
        clearTimeout(renderTimer);
        renderTimer = setTimeout(render, 120);
    }

    function scheduleVariantRender() {
        [0, 80, 180, 350, 700, 1200].forEach(function (delay) {
            setTimeout(render, delay);
        });
    }

    function observeChanges() {
        if (!window.MutationObserver) return;

        var observeTarget = document.querySelector('#divFiyatAlanlari') ||
            document.querySelector('.urunDetayFiyatContainer') ||
            document.querySelector('.PriceList') ||
            document.body;

        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i += 1) {
                var target = mutations[i].target;
                if (target && target.closest && target.closest('#' + WIDGET_ID)) continue;
                scheduleRender();
                break;
            }
        });

        observer.observe(observeTarget, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['class', 'style', 'data-variantid', 'data-variantId', 'data-mainvariantid', 'data-mainVariantId']
        });
    }

    function bindVariantEvents() {
        document.addEventListener('click', function (event) {
            var variant = event.target && event.target.closest && event.target.closest(
                '#divUrunEkSecenekV2 .ekSecenekValues, #divUrunEkSecenek .ekSecenekValues, [element-variantSelection] .ekSecenekValues'
            );

            if (!variant) return;

            lastVariantProductId = normalizeId(
                variant.getAttribute('data-productId') ||
                variant.getAttribute('data-productid') ||
                variant.getAttribute('data-variantId') ||
                variant.getAttribute('data-variantid')
            ) || lastVariantProductId;

            scheduleVariantRender();
        }, true);

        document.addEventListener('change', function (event) {
            if (event.target && event.target.closest && event.target.closest('#divUrunEkSecenekV2, #divUrunEkSecenek, [element-variantSelection]')) {
                scheduleVariantRender();
            }
        }, true);
    }

    function init() {
        RETRY_DELAYS.forEach(function (delay) {
            setTimeout(render, delay);
        });
        observeChanges();
        bindVariantEvents();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());

/* ========================================================================
 * BÖLÜM 7: ÖDEME VE TAKSİT SEÇENEKLERİ
 *
 * Ürün detayındaki ödeme seçenekleri ve banka taksit tablolarını düzenler.
 * Ödeme sekmesi açıldığında sonradan gelen içeriği yeniden işler.
 * ====================================================================== */
(function () {
    'use strict';

    var STYLE_ID = 'otsPaymentOptionsStyles';
    var SHELL_ID = 'otsPaymentOptions';
    var RENDER_DELAY = null;
    var lastSignature = '';
    var paymentTabRequested = false;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '#otsPaymentOptions, #otsPaymentOptions * { box-sizing: border-box; }',
            '#otsPaymentOptions {',
            '  --ots-pay-blue: #0c154c;',
            '  --ots-pay-blue-soft: #eef3ff;',
            '  --ots-pay-green: #149447;',
            '  --ots-pay-green-soft: #ecfbf2;',
            '  --ots-pay-muted: #6f7381;',
            '  width: 100%;',
            '  margin: 0;',
            '  font-family: Arial, Helvetica, sans-serif;',
            '}',
            '#divTabOdemeSecenekleri .ots-payment-native-hidden { display: none !important; }',
            '#divTabOdemeSecenekleri .urunTabAlt { display: block !important; }',
            '.ots-payment-options-head {',
            '  display: flex;',
            '  align-items: flex-end;',
            '  justify-content: space-between;',
            '  gap: 16px;',
            '  margin: 0 0 14px;',
            '}',
            '.ots-payment-options-head h3 {',
            '  margin: 0;',
            '  color: var(--ots-pay-blue);',
            '  font-size: clamp(20px, 2vw, 26px);',
            '  font-weight: 900;',
            '  line-height: 1.15;',
            '}',
            '.ots-payment-options-head span {',
            '  color: var(--ots-pay-muted);',
            '  font-size: 13px;',
            '  font-weight: 700;',
            '}',
            '.ots-payment-options-grid {',
            '  display: grid;',
            '  grid-template-columns: repeat(2, minmax(0, 1fr));',
            '  gap: 14px;',
            '}',
            '.ots-payment-card {',
            '  position: relative;',
            '  min-height: 92px;',
            '  display: grid;',
            '  grid-template-columns: 54px minmax(0, 1fr);',
            '  gap: 12px;',
            '  align-items: center;',
            '  padding: 12px 14px;',
            '  overflow: hidden;',
            '  border: 2px solid rgba(12,21,76,.72);',
            '  border-radius: 14px;',
            '  background: linear-gradient(135deg, #fff 0%, #f9fbff 100%);',
            '  box-shadow: 0 18px 42px rgba(12,21,76,.08);',
            '}',
            '.ots-payment-card::after {',
            '  content: "";',
            '  position: absolute;',
            '  width: 130px;',
            '  height: 130px;',
            '  right: -66px;',
            '  bottom: -86px;',
            '  border-radius: 50%;',
            '  background: rgba(12,21,76,.035);',
            '}',
            '.ots-payment-card.is-card {',
            '  border-color: rgba(20,148,71,.72);',
            '  background: linear-gradient(135deg, #fff 0%, #f4fff8 100%);',
            '  box-shadow: 0 18px 42px rgba(20,148,71,.08);',
            '}',
            '.ots-payment-card.is-card::after { background: rgba(20,148,71,.045); }',
            '.ots-payment-icon {',
            '  position: relative;',
            '  z-index: 1;',
            '  width: 52px;',
            '  height: 52px;',
            '  display: inline-flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  color: var(--ots-pay-blue);',
            '  border-radius: 50%;',
            '  background: var(--ots-pay-blue-soft);',
            '}',
            '.ots-payment-card.is-card .ots-payment-icon {',
            '  color: var(--ots-pay-green);',
            '  background: var(--ots-pay-green-soft);',
            '}',
            '.ots-payment-icon svg { width: 31px; height: 31px; display: block; }',
            '.ots-payment-copy { position: relative; z-index: 1; min-width: 0; }',
            '.ots-payment-title {',
            '  display: block;',
            '  margin: 0 0 4px;',
            '  color: var(--ots-pay-blue);',
            '  font-size: clamp(14px, 1.25vw, 17px);',
            '  font-weight: 900;',
            '  line-height: 1.12;',
            '}',
            '.ots-payment-card.is-card .ots-payment-title { color: var(--ots-pay-green); }',
            '.ots-payment-price {',
            '  display: block;',
            '  margin: 0 0 5px;',
            '  color: var(--ots-pay-blue);',
            '  font-size: clamp(22px, 2.25vw, 30px);',
            '  font-weight: 900;',
            '  line-height: .95;',
            '  letter-spacing: -.04em;',
            '}',
            '.ots-payment-card.is-card .ots-payment-price { color: var(--ots-pay-green); }',
            '.ots-payment-saving {',
            '  width: max-content;',
            '  max-width: 100%;',
            '  display: inline-flex;',
            '  align-items: center;',
            '  gap: 8px;',
            '  margin: 0 0 6px;',
            '  padding: 5px 8px;',
            '  color: var(--ots-pay-blue);',
            '  font-size: 11px;',
            '  font-weight: 900;',
            '  line-height: 1;',
            '  border-radius: 8px;',
            '  background: #eaf0ff;',
            '}',
            '.ots-payment-saving svg { width: 14px; height: 14px; stroke: currentColor; }',
            '.ots-payment-desc {',
            '  display: block;',
            '  color: var(--ots-pay-muted);',
            '  font-size: clamp(11px, 1vw, 13px);',
            '  font-weight: 700;',
            '  line-height: 1.45;',
            '}',
            '@media (max-width: 980px) {',
            '  .ots-payment-options-grid { grid-template-columns: 1fr; gap: 16px; }',
            '  .ots-payment-card { min-height: 88px; grid-template-columns: 52px minmax(0, 1fr); gap: 12px; padding: 12px; }',
            '  .ots-payment-icon { width: 50px; height: 50px; }',
            '  .ots-payment-icon svg { width: 30px; height: 30px; }',
            '}',
            '@media (max-width: 560px) {',
            '  #otsPaymentOptions { margin: 0; }',
            '  .ots-payment-options-head { display: block; }',
            '  .ots-payment-options-head span { display: block; margin-top: 6px; }',
            '  .ots-payment-card { grid-template-columns: 46px minmax(0, 1fr); gap: 10px; padding: 12px; }',
            '  .ots-payment-icon { width: 46px; height: 46px; }',
            '  .ots-payment-icon svg { width: 27px; height: 27px; }',
            '  .ots-payment-price { font-size: 22px; }',
            '  .ots-payment-saving { font-size: 10px; }',
            '}'
        ].join('\n');

        document.head.appendChild(style);
    }

    function parsePrice(value) {
        var text = String(value || '')
            .replace(/\{\{[^}]+\}\}/g, '')
            .replace(/[^\d.,]/g, '')
            .trim();

        if (!text) return 0;

        if (text.indexOf(',') > -1) {
            text = text.replace(/\./g, '').replace(',', '.');
        } else {
            var parts = text.split('.');
            // "1.250" gibi tek noktadan sonra üç hane binlik ayırıcıdır, ondalık değil.
            if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
                text = parts.join('');
            }
        }

        var parsed = parseFloat(text);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function formatPrice(value) {
        var safeValue = Number.isFinite(value) ? value : 0;
        var truncatedValue = Math.floor(safeValue * 100) / 100;

        return '₺' + new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(truncatedValue);
    }

    function text(selector) {
        var node = document.querySelector(selector);
        return node ? node.textContent.trim() : '';
    }

    function bankIcon() {
        return [
            '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
            '  <path d="M10 27 32 13l22 14" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
            '  <path d="M16 29h32M19 29v17M29 29v17M39 29v17M14 50h36" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
            '  <circle cx="48" cy="47" r="10" fill="currentColor"/>',
            '  <path d="m43.8 46.9 2.9 2.9 5.7-6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
            '</svg>'
        ].join('');
    }

    function cardIcon() {
        return [
            '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
            '  <rect x="12" y="17" width="40" height="30" rx="5" stroke="currentColor" stroke-width="5"/>',
            '  <path d="M12 27h40M19 39h14M38 39h7" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>',
            '</svg>'
        ].join('');
    }

    function tagIcon() {
        return [
            '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">',
            '  <path d="M4 5.5V11l8.4 8.4a2 2 0 0 0 2.8 0l4.2-4.2a2 2 0 0 0 0-2.8L11 4H5.5A1.5 1.5 0 0 0 4 5.5Z" stroke-width="2" stroke-linejoin="round"/>',
            '  <path d="M8 8h.01" stroke-width="3" stroke-linecap="round"/>',
            '</svg>'
        ].join('');
    }

    function buildCard(options) {
        var saving = options.saving > 0 ? [
            '<span class="ots-payment-saving">',
            tagIcon(),
            formatPrice(options.saving) + ' tasarruf edin',
            '</span>'
        ].join('') : '';

        return [
            '<article class="ots-payment-card ' + options.className + '">',
            '  <span class="ots-payment-icon">' + options.icon + '</span>',
            '  <span class="ots-payment-copy">',
            '    <strong class="ots-payment-title">' + options.title + '</strong>',
            '    <b class="ots-payment-price">' + options.price + '</b>',
            saving,
            '    <span class="ots-payment-desc">' + options.description + '</span>',
            '  </span>',
            '</article>'
        ].join('');
    }

    function readPaymentData() {
        var transferText = text('#ltrHavaleFiyati');
        var cardText = text('#ltrTekCekim');
        var transferPrice = parsePrice(transferText);
        var cardPrice = parsePrice(cardText);
        var saving = cardPrice > transferPrice ? cardPrice - transferPrice : 0;

        return {
            transferText: transferPrice ? formatPrice(transferPrice) : transferText,
            cardText: cardPrice ? formatPrice(cardPrice) : cardText,
            transferPrice: transferPrice,
            cardPrice: cardPrice,
            saving: saving
        };
    }

    function buildShell(data) {
        return [
            '<div class="ots-payment-options-grid">',
            buildCard({
                className: 'is-transfer',
                icon: bankIcon(),
                title: 'Havale ile Ödeme',
                price: data.transferText || '-',
                saving: data.saving,
                description: 'Siparişinizi havale ile ödeyerek avantajlı fiyatla satın alın.'
            }),
            buildCard({
                className: 'is-card',
                icon: cardIcon(),
                title: 'Kredi Kartı Tek Çekim',
                price: data.cardText || '-',
                saving: 0,
                description: 'Ekstra ödeme veya taksit farkı yoktur.'
            }),
            '</div>'
        ].join('');
    }

    function getContentTarget(source) {
        return source.querySelector('.urunTabAlt') || source;
    }

    function isPaymentTabActive() {
        var tab = document.getElementById('liTabOdemeSecenekleri') ||
            document.querySelector('.TabOdemeSecenekleri');

        return !!(tab && tab.classList.contains('active'));
    }

    function hideNativeContent(target, shell) {
        Array.prototype.slice.call(target.children).forEach(function (child) {
            if (child === shell) return;
            // Sınıf zaten doğruysa dokunulmaz; gereksiz sınıf yazımı gözlemciyi sürekli tetikler.
            if (!child.classList.contains('ots-payment-native-hidden')) child.classList.add('ots-payment-native-hidden');
        });
    }

    function showNativeContent(target, shell) {
        Array.prototype.slice.call(target.children).forEach(function (child) {
            if (child === shell) return;
            if (child.classList.contains('ots-payment-native-hidden')) child.classList.remove('ots-payment-native-hidden');
        });
    }

    function render() {
        var source = document.getElementById('divTabOdemeSecenekleri');
        if (!source) return false;

        injectStyles();

        var data = readPaymentData();
        if (!data.transferText && !data.cardText) return false;

        var signature = [
            data.transferText,
            data.cardText,
            Math.floor(data.saving * 100)
        ].join('|');

        var target = getContentTarget(source);
        var shell = target.querySelector('#' + SHELL_ID);
        var externalShell = document.body.querySelector('body > #' + SHELL_ID);

        if (externalShell && externalShell.parentNode) {
            externalShell.parentNode.removeChild(externalShell);
        }

        if (!shell) {
            shell = document.createElement('section');
            shell.id = SHELL_ID;
            shell.setAttribute('aria-label', 'Ödeme seçenekleri');
            target.insertBefore(shell, target.firstChild);
        }

        if (signature !== lastSignature) {
            shell.innerHTML = buildShell(data);
            lastSignature = signature;
        }

        if (!paymentTabRequested || !isPaymentTabActive()) {
            shell.style.setProperty('display', 'none', 'important');
            source.style.setProperty('display', 'none', 'important');
            showNativeContent(target, shell);
            return true;
        }

        source.style.removeProperty('display');
        source.style.setProperty('clear', 'both');
        shell.style.removeProperty('display');
        hideNativeContent(target, shell);

        return true;
    }

    function scheduleRender() {
        clearTimeout(RENDER_DELAY);
        RENDER_DELAY = setTimeout(render, 120);
    }

    function observePaymentChanges() {
        if (!window.MutationObserver || !document.body) return;

        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i += 1) {
                var target = mutations[i].target;
                if (target && target.nodeType === 3) target = target.parentElement;
                // Kendi alanı ve saniyelik kargo geri sayımı yeniden çizim gerektirmez.
                if (target && target.closest && target.closest('#' + SHELL_ID + ', #otsShippingPanel')) continue;
                scheduleRender();
                break;
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }

    function bindTabClick() {
        document.addEventListener('click', function (event) {
            var clickedTab = event.target.closest('.urunTab li, .urunTab a, #liTabOdemeSecenekleri, .TabOdemeSecenekleri');
            if (!clickedTab) return;

            paymentTabRequested = !!event.target.closest('#liTabOdemeSecenekleri, .TabOdemeSecenekleri');

            [0, 80, 250, 700].forEach(function (delay) {
                setTimeout(render, delay);
            });
        }, true);
    }

    function init() {
        [0, 300, 900, 1800].forEach(function (delay) {
            setTimeout(render, delay);
        });
        observePaymentChanges();
        bindTabClick();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());

/* ========================================================================
 * BÖLÜM 8: BEDENİMİ BUL BUTONU
 *
 * Ürün seçeneklerinin yanına belirgin bir Bedenimi Bul çağrısı ekler.
 * Butonu SizeWithMe beden bulucu widget işlevine bağlar.
 * ====================================================================== */
(function () {
    'use strict';

    var STYLE_ID = 'otsFindSizeButtonStyles';
    var BUTTON_ID = 'otsFindSizeButton';
    var RETRY_DELAYS = [0, 300, 900, 1800, 3000];
    var renderTimer = null;

    function injectStyles() {
        var style = document.getElementById(STYLE_ID);
        if (!style) {
            style = document.createElement('style');
            style.id = STYLE_ID;
            document.head.appendChild(style);
        }

        style.id = STYLE_ID;
        style.textContent = [
            '#otsFindSizeButton, #otsFindSizeButton * { box-sizing: border-box; }',
            '#otsFindSizeButton {',
            '  position: fixed !important;',
            '  right: auto !important;',
            '  top: auto !important;',
            '  left: 11px !important;',
            '  bottom: 206px !important;',
            '  z-index: 2147482500;',
            '  width: 62px;',
            '  height: 62px;',
            '  min-height: 0;',
            '  display: inline-flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  gap: 0;',
            '  padding: 0;',
            '  color: #fff;',
            '  text-align: center;',
            '  border: 2px solid rgba(255,255,255,.72);',
            '  border-radius: 999px;',
            '  background: linear-gradient(135deg, #0c154c 0%, #0d2d64 100%);',
            '  box-shadow: 0 14px 34px rgba(5, 11, 42, .24);',
            '  cursor: pointer;',
            '  overflow: visible;',
            '  transform: translateZ(0);',
            '  transition: transform .2s ease, box-shadow .2s ease, background .2s ease;',
            '  font-family: Arial, Helvetica, sans-serif;',
            '}',
            '#otsFindSizeButton::before {',
            '  content: "";',
            '  position: absolute;',
            '  inset: 6px;',
            '  opacity: .18;',
            '  border-radius: inherit;',
            '  background: #fff;',
            '  pointer-events: none;',
            '}',
            '#otsFindSizeButton::after {',
            '  content: "Bedenini Bul";',
            '  position: absolute;',
            '  left: calc(100% + 10px);',
            '  top: 50%;',
            '  width: max-content;',
            '  max-width: 190px;',
            '  padding: 10px 13px;',
            '  color: #fff;',
            '  font-size: 13px;',
            '  font-weight: 800;',
            '  line-height: 1;',
            '  white-space: nowrap;',
            '  border-radius: 999px;',
            '  background: #0c154c;',
            '  box-shadow: 0 10px 26px rgba(5, 11, 42, .22);',
            '  opacity: 0;',
            '  pointer-events: none;',
            '  transform: translate(-8px, -50%);',
            '  transition: opacity .18s ease, transform .18s ease;',
            '}',
            '#otsFindSizeButton:hover {',
            '  transform: translateY(-2px) scale(1.03);',
            '  box-shadow: 0 18px 42px rgba(5, 11, 42, .3);',
            '  background: linear-gradient(135deg, #0b1347 0%, #123778 100%);',
            '}',
            '#otsFindSizeButton:hover::after { opacity: 1; transform: translate(0, -50%); }',
            '#otsFindSizeButton .ots-find-size-icon,',
            '#otsFindSizeButton .ots-find-size-copy,',
            '#otsFindSizeButton .ots-find-size-arrow { position: relative; z-index: 1; }',
            '#otsFindSizeButton .ots-find-size-icon {',
            '  width: 34px;',
            '  height: 34px;',
            '  display: inline-flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  color: #fff;',
            '}',
            '#otsFindSizeButton .ots-find-size-icon svg { width: 34px; height: 34px; display: block; }',
            '#otsFindSizeButton .ots-find-size-copy,',
            '#otsFindSizeButton .ots-find-size-arrow { display: none !important; }',
            '@media (max-width: 768px) {',
            '  #otsFindSizeButton {',
            '    right: auto !important;',
            '    top: auto !important;',
            '    bottom: 206px !important;',
            '    left: 11px !important;',
            '    width: 56px;',
            '    height: 56px;',
            '  }',
            '  #otsFindSizeButton .ots-find-size-icon,',
            '  #otsFindSizeButton .ots-find-size-icon svg { width: 30px; height: 30px; }',
            '  #otsFindSizeButton::after { display: none; }',
            '}'
        ].join('\n');

    }

    function findOriginalTrigger() {
        var overlay = document.getElementById(BUTTON_ID);
        var triggers = Array.prototype.slice.call(document.querySelectorAll('#swmTriggerBtn, .swm-trigger-btn'));

        return triggers.find(function (button) {
            return button && button !== overlay && !button.closest('#' + BUTTON_ID);
        }) || null;
    }

    function createButton() {
        var button = document.createElement('button');
        button.id = BUTTON_ID;
        button.type = 'button';
        button.setAttribute('aria-label', 'Bedenimi Bul');
        button.innerHTML = [
            '<span class="ots-find-size-icon" aria-hidden="true">',
            '  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">',
            '    <path d="M12 40 37 15l15 15-25 25L12 40Z" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>',
            '    <path d="M22 38 18 34M29 31l-4-4M36 24l-4-4M43 31l-4-4" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
            '  </svg>',
            '</span>',
            '<span class="ots-find-size-copy">',
            '  <span class="ots-find-size-title">Bedenini Bul</span>',
            '  <span class="ots-find-size-desc">En doğru bedeni saniyeler içinde bul!</span>',
            '</span>',
            '<span class="ots-find-size-arrow" aria-hidden="true">',
            '  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">',
            '    <path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>',
            '  </svg>',
            '</span>'
        ].join('');

        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();

            var originalTrigger = findOriginalTrigger();
            if (originalTrigger) {
                originalTrigger.click();
            }
        });

        return button;
    }

    function hasFindSizeValue() {
        var field = document.getElementById('divOzelAlan2');
        if (!field) return false;

        return field.textContent.replace(/\s+/g, '').length > 0;
    }

    function removeButton() {
        var button = document.getElementById(BUTTON_ID);
        if (button && button.parentNode) {
            button.parentNode.removeChild(button);
        }
    }

    function render() {
        // SizeWithMe widget'ı yüklenmediyse buton işlevsiz kalacağından gösterilmez;
        // widget sonradan yüklenirse sayfa gözlemcisi butonu yeniden ekler.
        if (!hasFindSizeValue() || !findOriginalTrigger()) {
            removeButton();
            return false;
        }

        injectStyles();

        var button = document.getElementById(BUTTON_ID);
        if (!button) {
            button = createButton();
        }

        if (button.parentNode !== document.body) {
            document.body.appendChild(button);
        }

        button.style.removeProperty('left');
        button.style.removeProperty('right');
        button.style.removeProperty('bottom');
        button.style.removeProperty('top');

        return true;
    }

    function scheduleRender() {
        clearTimeout(renderTimer);
        renderTimer = setTimeout(render, 120);
    }

    function observePage() {
        if (!window.MutationObserver || !document.body) return;

        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i += 1) {
                var target = mutations[i].target;
                if (target && target.closest && target.closest('#' + BUTTON_ID)) continue;
                scheduleRender();
                break;
            }
        });

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
 * BÖLÜM 9: SABİT SEPETE EKLE BARI
 *
 * Sayfa kaydırıldığında ürün, fiyat, adet ve sepete ekle işlemlerini sabit bir barda gösterir.
 * Ana ürün formundaki adet ve sepete ekleme davranışıyla eş zamanlı çalışır.
 * ====================================================================== */
(function () {
    var STYLE_ID = "ots-sticky-cart-style";
    var BAR_ID = "otsStickyCart";
    var SHOW_AFTER_SCROLL = 80;
    var state = {
        bar: null,
        qtyInput: null,
        qtyValue: null,
        priceText: null,
        titleText: null,
        imageSrc: null,
        localQty: 1
    };
    var sourceClickBound = false;
    var visibilityScheduled = false;
    var lastAddClickAt = 0;
    var ignoreSyntheticClickUntil = 0;

    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function isVisible(el) {
        if (!el) return false;
        var style = window.getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden" && el.offsetParent !== null;
    }

    function textFrom(el) {
        return el ? (el.textContent || "").replace(/\s+/g, " ").trim() : "";
    }

    function firstVisible(selectors) {
        for (var i = 0; i < selectors.length; i++) {
            var nodes = document.querySelectorAll(selectors[i]);
            for (var j = 0; j < nodes.length; j++) {
                if (isVisible(nodes[j]) && textFrom(nodes[j])) return nodes[j];
            }
        }
        return null;
    }

    function firstExistingElement(selectors) {
        for (var i = 0; i < selectors.length; i++) {
            var node = qs(selectors[i]);
            if (node) return node;
        }
        return null;
    }

    function isUsableButton(el) {
        if (!el || el.closest("#" + BAR_ID)) return false;
        if (el.disabled || el.getAttribute("aria-disabled") === "true") return false;
        if (el.classList && el.classList.contains("btnAddBasketOnQuickView")) return false;
        if (el.id === "kendinTasarlaClickButtonId") return false;
        return true;
    }

    function firstUsableElement(selectors) {
        var fallback = null;

        for (var i = 0; i < selectors.length; i++) {
            var nodes = document.querySelectorAll(selectors[i]);

            for (var j = 0; j < nodes.length; j++) {
                var node = nodes[j];
                if (!isUsableButton(node)) continue;
                if (!fallback) fallback = node;
                if (isVisible(node)) return node;
            }
        }

        return fallback;
    }

    function getRealAddButton() {
        return firstUsableElement([
            "#divSatinAl .BasketBtn input.Addtobasket.btnAddBasketOnDetail",
            "#divSatinAl .BasketBtn .Addtobasket.btnAddBasketOnDetail",
            "#divSatinAl .Addtobasket.btnAddBasketOnDetail",
            "#divSatinAl .Addtobasket",
            ".buybutton .BasketBtn input.Addtobasket.btnAddBasketOnDetail",
            ".buybutton .BasketBtn .Addtobasket.btnAddBasketOnDetail",
            ".buybutton .Addtobasket.btnAddBasketOnDetail",
            ".buybutton .Addtobasket",
            ".basketBtn .Addtobasket.btnAddBasketOnDetail",
            ".basketBtn .Addtobasket",
            ".BasketBtn .Addtobasket.btnAddBasketOnDetail",
            ".BasketBtn .Addtobasket",
            ".btnAddBasketOnDetail",
            "[element-addToCart='1']"
        ]);
    }

    function getRealQtyField() {
        return qs("#txtbxurunSiparisAdedi") || qs("[name='txtbxurunSiparisAdedi']") || qs("#ddlUrunSiparisAdedi");
    }

    function getProductModel() {
        return typeof window.productDetailModel === "object" && window.productDetailModel ? window.productDetailModel : null;
    }

    function getProductCardId() {
        var model = getProductModel();
        if (!model) return 0;
        return parseInt(model.productId || (model.product && model.product.urunKartiId) || 0, 10) || 0;
    }

    function toPositiveInt(value) {
        var parsed = parseInt(value, 10);
        return parsed > 0 ? parsed : 0;
    }

    function getVariantIdFromSelectedDom() {
        var selected = firstExistingElement([
            "#divUrunEkSecenek [data-variantid].selected",
            "#divUrunEkSecenek [data-variant-id].selected",
            "#divUrunEkSecenek [data-urunid].selected",
            "#divUrunEkSecenekV2 [data-variantid].selected",
            "#divUrunEkSecenekV2 [data-variant-id].selected",
            "#divUrunEkSecenekV2 [data-urunid].selected"
        ]);

        if (!selected) return 0;

        return toPositiveInt(selected.getAttribute("data-variantid")) ||
            toPositiveInt(selected.getAttribute("data-variant-id")) ||
            toPositiveInt(selected.getAttribute("data-urunid"));
    }

    function getVariantIdFromModelSelections() {
        var model = getProductModel();
        var data = model && model.productVariantData;
        if (!data || !data.length) return 0;

        var selectedMap = {};
        qsa("#divUrunEkSecenek .selected[tipid][rel], #divUrunEkSecenekV2 .selected[tipid][rel]").forEach(function (item) {
            var tipId = toPositiveInt(item.getAttribute("tipid"));
            var optionId = toPositiveInt(item.getAttribute("rel"));
            if (tipId && optionId) selectedMap[tipId] = optionId;
        });

        var selectedTipIds = Object.keys(selectedMap);
        if (!selectedTipIds.length) return 0;

        var requiredMap = {};
        data.forEach(function (item) {
            var tipId = toPositiveInt(item.tipID);
            if (tipId) requiredMap[tipId] = true;
        });

        var requiredTipIds = Object.keys(requiredMap);
        if (requiredTipIds.length && selectedTipIds.length < requiredTipIds.length) return 0;

        var variants = {};
        data.forEach(function (item) {
            var variantId = toPositiveInt(item.urunID);
            var tipId = toPositiveInt(item.tipID);
            var optionId = toPositiveInt(item.id);
            if (!variantId || !tipId || !optionId) return;
            if (!variants[variantId]) variants[variantId] = {};
            variants[variantId][tipId] = optionId;
        });

        for (var variantKey in variants) {
            if (!Object.prototype.hasOwnProperty.call(variants, variantKey)) continue;

            var variant = variants[variantKey];
            var matched = selectedTipIds.every(function (tipId) {
                return variant[tipId] === selectedMap[tipId];
            });

            if (matched) return toPositiveInt(variantKey);
        }

        return 0;
    }

    function getSelectedVariantId() {
        var hidden = qs("#hddnUrunID");
        var hiddenValue = hidden ? toPositiveInt(hidden.value) : 0;
        var model = getProductModel();
        var modelProduct = model && model.product ? model.product : null;

        return hiddenValue ||
            getVariantIdFromSelectedDom() ||
            getVariantIdFromModelSelections() ||
            toPositiveInt(modelProduct && modelProduct.id) ||
            toPositiveInt(model && model.mainVariantId) ||
            0;
    }

    function getScrollTop() {
        return window.pageYOffset ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0;
    }

    function getPriceText() {
        // İndirimli üründe ilk .spanFiyat üstü çizili eski fiyat olabilir; önce satış fiyatı aranır.
        var priceEl = firstVisible([
            "#divFiyatAlanlari #indirimliFiyat .spanFiyat",
            "#divFiyatAlanlari #fiyat2 .spanFiyat",
            "#divFiyatAlanlari .spanFiyat",
            "#divFiyatAlanlari .urunDetayFiyat",
            "#divFiyatAlanlari .IndirimliFiyatContent",
            "#divFiyatAlanlari .discountPrice",
            "#divFiyatAlanlari .regularPrice",
            "#divFiyatAlanlari [class*='Fiyat']",
            "#pnlFiyatlar [class*='Fiyat']",
            "#divFiyatAlanlari"
        ]);
        var price = textFrom(priceEl);
        return price || "Fiyat";
    }

    function getTitleText() {
        var title = textFrom(qs(".ProductName h1 span")) || textFrom(qs(".ProductName h1")) || textFrom(qs(".ProductName"));
        return title.replace(/\([^)]+\)\s*$/, "").trim() || "Ürün";
    }

    function getImageSrc() {
        var img = qs("#imgUrunResim") || qs(".leftImage img") || qs(".Images img") || qs(".ProductDetailMain img") || qs(".productDetail img");
        return img ? (img.currentSrc || img.src || "") : "";
    }

    function getQtyValue() {
        var field = getRealQtyField();
        // Sayfada adet alanı yoksa barda seçilen adet kaynak kabul edilir.
        var value = field ? parseFloat((field.value || "1").replace(",", ".")) : state.localQty;
        return value > 0 ? value : 1;
    }

    /* Adet alanı açılır liste ise yalnızca listede bulunan değerler seçilebilir;
       listede olmayan değer atanırsa alan boşalır ve sepete 1 adet gider. */
    function clampToSelectOptions(field, value) {
        var options = Array.prototype.map.call(field.options || [], function (option) {
            return parseFloat(String(option.value).replace(",", "."));
        }).filter(function (optionValue) { return optionValue > 0; });

        if (!options.length) return value;

        var best = options[0];
        options.forEach(function (optionValue) {
            if (Math.abs(optionValue - value) < Math.abs(best - value)) best = optionValue;
        });
        return best;
    }

    function setQtyValue(value) {
        var field = getRealQtyField();
        var next = Math.max(1, value);
        if (field && field.tagName === "SELECT") next = clampToSelectOptions(field, next);
        state.localQty = next;
        if (state.qtyValue) state.qtyValue.textContent = String(next);

        if (!field) return;
        field.value = String(next);
        try {
            field.dispatchEvent(new Event("input", { bubbles: true }));
            field.dispatchEvent(new Event("change", { bubbles: true }));
        } catch (e) { }
    }

    function fireClick(el) {
        if (!el) return false;

        try {
            el.click();
            return true;
        } catch (e) { }

        try {
            el.dispatchEvent(new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window
            }));
            return true;
        } catch (e) { }

        var jq = window.jQuery || window.$;
        if (jq && typeof jq === "function") {
            try {
                var $el = jq(el);
                if ($el && $el.length) {
                    $el.trigger("click");
                    return true;
                }
            } catch (e) { }
        }

        return false;
    }

    function syncRealQtyToBar() {
        var field = getRealQtyField();
        if (!field) return;
        var desired = String(getQtyValue());
        if (field.value === desired) return;
        field.value = desired;
        try {
            field.dispatchEvent(new Event("input", { bubbles: true }));
            field.dispatchEvent(new Event("change", { bubbles: true }));
        } catch (e) { }
    }

    function addWithTicimaxCart() {
        var model = getProductModel();
        var variantId = getSelectedVariantId();
        var productId = getProductCardId();
        var qty = getQtyValue();

        if (!model || !variantId || !qty) return false;

        if (window.cart && window.cart.add && typeof window.cart.add.createModel === "function" && typeof window.cart.add.execute === "function") {
            try {
                window.cart.add.model = window.cart.add.createModel();
                window.cart.add.model.productId = productId;
                window.cart.add.model.variantId = variantId;
                window.cart.add.model.piece = qty;
                window.cart.add.model.assortmentProductId = model.productIsAsorti ? parseInt(model.assortmentGroupId, 10) || 0 : 0;
                window.cart.add.model.productUrl = window.location.pathname || "";
                window.cart.add.execute();
                return true;
            } catch (e) { }
        }

        if (typeof window.sepeteEkle === "function") {
            try {
                window.sepeteEkle(variantId, qty, 0, 0, 0, "", true, undefined, undefined, undefined, undefined, productId);
                return true;
            } catch (e) { }
        }

        return false;
    }

    function handleAdd(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        }

        var now = Date.now();
        if (now - lastAddClickAt < 450) return;
        lastAddClickAt = now;

        syncRealQtyToBar();

        // Varyantlı üründe beden/renk seçilmediyse doğrudan ekleme yapılmaz;
        // gerçek buton tıklanarak Ticimax'ın "seçim yapın" doğrulaması çalıştırılır.
        var model = getProductModel();
        var hasVariants = !!(model && model.productVariantData && model.productVariantData.length);
        var variantChosen = !hasVariants || getVariantIdFromSelectedDom() || getVariantIdFromModelSelections();

        if (variantChosen && getSelectedVariantId() && addWithTicimaxCart()) return;

        var realButton = getRealAddButton();
        if (realButton) {
            fireClick(realButton);
            return;
        }

        addWithTicimaxCart();
    }

    function syncContent() {
        if (!state.bar) return;
        state.titleText.textContent = getTitleText();
        state.priceText.textContent = getPriceText();
        state.qtyValue.textContent = String(getQtyValue());

        var img = getImageSrc();
        if (img) {
            state.imageSrc.src = img;
            state.imageSrc.style.display = "";
        } else {
            state.imageSrc.style.display = "none";
        }
    }

    function injectStyles() {
        if (qs("#" + STYLE_ID)) return;

        var style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = [
            "body.ots-sticky-cart-ready{padding-bottom:112px!important;}",
            "#" + BAR_ID + ",#" + BAR_ID + " *{box-sizing:border-box;}",
            "#" + BAR_ID + "{position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483000;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;width:auto;max-width:1120px;margin:0 auto;padding:11px;color:#0c154c;border:1px solid rgba(12,21,76,.12);border-radius:18px;background:rgba(255,255,255,.96);box-shadow:0 18px 48px rgba(12,21,76,.16);backdrop-filter:saturate(150%) blur(14px);transform:translateY(140%);opacity:0;pointer-events:none;transition:transform .22s ease,opacity .22s ease;}",
            "#" + BAR_ID + "::before{content:'';position:absolute;inset:0;z-index:-1;border-radius:inherit;background:linear-gradient(135deg,rgba(12,21,76,.055),rgba(28,185,103,.035),rgba(255,255,255,.5));}",
            "#" + BAR_ID + ".ots-sc-visible{transform:translateY(0);opacity:1;pointer-events:auto;}",
            "#" + BAR_ID + " .ots-sc-info{min-width:0;display:grid;grid-template-columns:48px minmax(0,1fr);gap:10px;align-items:center;}",
            "#" + BAR_ID + " .ots-sc-img{width:48px;height:58px;display:block;object-fit:cover;background:#f4f6fb;border:1px solid rgba(12,21,76,.1);border-radius:12px;}",
            "#" + BAR_ID + " .ots-sc-copy{min-width:0;}",
            "#" + BAR_ID + " .ots-sc-title{margin:0 0 5px;color:#0c154c;font:700 12px Arial,sans-serif;line-height:1.24;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:0;}",
            "#" + BAR_ID + " .ots-sc-price{color:#111;font:800 16px Arial,sans-serif;line-height:1.05;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:0;}",
            "#" + BAR_ID + " .ots-sc-actions{display:grid;grid-template-columns:94px minmax(148px,34vw);gap:9px;align-items:center;}",
            "#" + BAR_ID + " .ots-sc-qty{height:44px;display:grid;grid-template-columns:30px 1fr 30px;align-items:center;overflow:hidden;border:1px solid rgba(12,21,76,.14);border-radius:12px;background:#fff;}",
            "#" + BAR_ID + " .ots-sc-qty button{width:30px;height:42px;margin:0;padding:0;border:0;background:#fff!important;color:#0c154c;font-size:20px;font-weight:800;line-height:1;cursor:pointer;pointer-events:auto;touch-action:manipulation;}",
            "#" + BAR_ID + " .ots-sc-qty span{display:block;text-align:center;color:#0c154c;font-size:14px;font-weight:800;line-height:1;}",
            "#" + BAR_ID + " .ots-sc-add{position:relative!important;width:100%!important;height:44px!important;min-height:44px!important;margin:0!important;padding:0 16px 0 42px!important;border:0!important;border-radius:8px!important;background-color:#1cb967!important;background-image:none!important;box-shadow:0 14px 30px rgba(28,185,103,.26);color:#fff!important;font:800 12px Arial,sans-serif!important;line-height:44px!important;text-align:center;text-transform:uppercase;white-space:nowrap;letter-spacing:.035em;cursor:pointer!important;pointer-events:auto!important;touch-action:manipulation;-webkit-tap-highlight-color:transparent;transition:transform .18s ease,filter .18s ease;}",
            "#" + BAR_ID + " .ots-sc-add::before{content:'';position:absolute;left:17px;top:50%;width:18px;height:18px;transform:translateY(-50%);background:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='9' cy='21' r='1'/><circle cx='20' cy='21' r='1'/><path d='M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6'/></svg>\") center/contain no-repeat;}",
            "#" + BAR_ID + " .ots-sc-add:hover{filter:brightness(1.04);transform:translateY(-1px);}",
            "#" + BAR_ID + " .ots-sc-add:active{transform:translateY(1px);}",
            "@media (max-width:768px){body.ots-sticky-cart-ready{padding-bottom:142px!important;}#" + BAR_ID + "{left:10px;right:10px;bottom:calc(58px + env(safe-area-inset-bottom));grid-template-columns:1fr;gap:9px;padding:10px;border-radius:16px;}#" + BAR_ID + " .ots-sc-info{grid-template-columns:44px minmax(0,1fr);}#" + BAR_ID + " .ots-sc-img{width:44px;height:52px;border-radius:11px;}#" + BAR_ID + " .ots-sc-title{font-size:11px;}#" + BAR_ID + " .ots-sc-price{font-size:15px;}#" + BAR_ID + " .ots-sc-actions{grid-template-columns:88px minmax(0,1fr);}}",
            "@media (prefers-reduced-motion:reduce){#" + BAR_ID + ",#" + BAR_ID + " *{transition-duration:.01ms!important;}}"
        ].join("");

        document.head.appendChild(style);
    }

    function createBar() {
        if (qs("#" + BAR_ID)) {
            state.bar = qs("#" + BAR_ID);
            return;
        }

        var bar = document.createElement("div");
        bar.id = BAR_ID;
        bar.setAttribute("role", "region");
        bar.setAttribute("aria-label", "Mobil sepete ekleme alanı");
        bar.innerHTML =
            '<div class="ots-sc-info">' +
            '<img class="ots-sc-img" alt="" />' +
            '<div class="ots-sc-copy">' +
            '<p class="ots-sc-title"></p>' +
            '<div class="ots-sc-price"></div>' +
            '</div>' +
            '</div>' +
            '<div class="ots-sc-actions">' +
            '<div class="ots-sc-qty" aria-label="Adet">' +
            '<button type="button" class="ots-sc-minus" aria-label="Azalt">-</button>' +
            '<span class="ots-sc-value">1</span>' +
            '<button type="button" class="ots-sc-plus" aria-label="Artir">+</button>' +
            '</div>' +
            '<button type="button" class="ots-sc-add">Sepete Ekle</button>' +
            '</div>';

        document.body.appendChild(bar);
        state.bar = bar;
        state.qtyValue = qs(".ots-sc-value", bar);
        state.priceText = qs(".ots-sc-price", bar);
        state.titleText = qs(".ots-sc-title", bar);
        state.imageSrc = qs(".ots-sc-img", bar);

        qs(".ots-sc-minus", bar).addEventListener("click", function () {
            setQtyValue(getQtyValue() - 1);
        });
        qs(".ots-sc-plus", bar).addEventListener("click", function () {
            setQtyValue(getQtyValue() + 1);
        });
        qs(".ots-sc-add", bar).addEventListener("click", handleAdd);
    }

    function updateVisibility() {
        visibilityScheduled = false;
        var stockEmpty = qs("#divStokYok");
        var hasProductDetail = !!(qs(".ProductName") || qs("#pnlFiyatlar") || qs("#divSatinAl"));
        var hasScrolled = getScrollTop() > SHOW_AFTER_SCROLL;
        var shouldShow = hasProductDetail && hasScrolled && !(stockEmpty && isVisible(stockEmpty));

        if (!state.bar) return;
        state.bar.classList.toggle("ots-sc-visible", !!shouldShow);
        if (document.body.classList.contains("ots-sticky-cart-ready") !== !!shouldShow) {
            document.body.classList.toggle("ots-sticky-cart-ready", !!shouldShow);
        }
        if (shouldShow) syncContent();
    }

    function scheduleVisibilityUpdate() {
        if (visibilityScheduled) return;
        visibilityScheduled = true;
        requestAnimationFrame(updateVisibility);
    }

    function bindSourceChanges() {
        var qty = getRealQtyField();
        if (qty && !qty.getAttribute("data-ots-sticky-bound")) {
            qty.setAttribute("data-ots-sticky-bound", "1");
            qty.addEventListener("input", syncContent);
            qty.addEventListener("change", syncContent);
        }

        if (sourceClickBound) return;
        sourceClickBound = true;

        document.addEventListener("click", function (e) {
            if (!e.target || !e.target.closest) return;
            if (
                e.target.closest(".qtyPlus") ||
                e.target.closest(".qtyMinus") ||
                e.target.closest("#divUrunEkSecenekV2") ||
                e.target.closest("#divUrunEkSecenek")
            ) {
                setTimeout(function () {
                    bindSourceChanges();
                    scheduleVisibilityUpdate();
                }, 120);
            }
        });
    }

    function init() {
        if (!document.body) return;
        injectStyles();
        createBar();
        bindSourceChanges();
        updateVisibility();
        setTimeout(updateVisibility, 300);
        setTimeout(updateVisibility, 900);

        window.addEventListener("resize", scheduleVisibilityUpdate);
        window.addEventListener("scroll", scheduleVisibilityUpdate, { passive: true });
        document.addEventListener("scroll", scheduleVisibilityUpdate, { passive: true, capture: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

/* ========================================================================
 * BÖLÜM 10: YORUM YAZ BUTONU VE UYARI PENCERELERİ
 *
 * Yorum Yaz düğmesini puan alanına taşır ve kurumsal biçimde düzenler.
 * Üye girişi ve satın alma gereksinimi pencerelerini modernleştirir.
 * ====================================================================== */
(function () {
    'use strict';
    if (window.otsReviewButtonInit) { window.otsReviewButtonInit(); return; }

    var scheduled = false;
    var icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z"/><path d="M7 9h8M7 13h5"/></svg>';

    function styles() {
        if (document.getElementById('otsReviewButtonStyles')) return;
        var el = document.createElement('style');
        el.id = 'otsReviewButtonStyles';
        el.textContent = `
.Formline.puanVer.ots-review-rating { display:flex!important; align-items:center; flex-wrap:wrap; gap:10px; }
.ots-review-rating > #PuanVer,.ots-review-rating > .PuanVerSag { float:none!important; margin:0!important; }
.ots-review-rating > .YorumYazbtnContent { float:none!important; width:auto!important; margin:0!important; padding:0!important; }
.ots-review-rating .ots-review-write { display:inline-flex!important; align-items:center; justify-content:center; gap:7px; min-height:36px; padding:7px 12px!important; border:1px solid #d7deeb!important; border-radius:8px!important; background:#fff!important; color:#0c154c!important; font-family:inherit; font-size:12px!important; font-weight:600; line-height:1.3!important; text-decoration:none!important; cursor:pointer; box-shadow:none!important; transition:background .18s,border-color .18s; }
.ots-review-write svg { width:17px; height:17px; flex:none; }
.ots-review-rating .ots-review-write span { color:inherit!important; font:inherit!important; }
.ots-review-rating .ots-review-write::before,.ots-review-rating .ots-review-write::after { display:none!important; }
.ots-review-rating .ots-review-write:hover { background:#f0f7fb!important; border-color:#9bafc9!important; }
.ots-review-empty-icons { display:none!important; }
#yorumYaz.ots-review-login,.ticimaxDialogContent.ots-review-purchase { background:rgba(12,21,48,.48)!important; backdrop-filter:blur(5px); -webkit-backdrop-filter:blur(5px); }
#yorumYaz.ots-review-login .modal-content,.ots-review-purchase .ticimaxDialogTxt { box-sizing:border-box; width:calc(100% - 32px)!important; max-width:440px!important; padding:38px 30px 28px!important; border:1px solid #e0e7ef!important; border-radius:20px!important; background:#fff!important; color:#0c154c!important; box-shadow:0 24px 80px rgba(12,21,48,.2)!important; font-family:inherit; text-align:center; position:relative; }
#yorumYaz.ots-review-login .modal-content { max-height:calc(100dvh - 40px); overflow:auto; }
.ots-review-purchase .ticimaxDialogContainer { width:100%!important; max-width:none!important; }
.ots-review-purchase .ticimaxDialogTxt { margin:20px auto!important; }
.ots-review-purchase .ticimaxDialogTxt::before,.ots-review-purchase .ticimaxDialogTxt::after { display:none!important; }
#yorumYaz.ots-review-login .modal-content-html,#yorumYaz.ots-review-login .divYorumYazGiris { padding:0!important; margin:0!important; width:100%!important; }
#yorumYaz.ots-review-login .alert { display:block!important; padding:0!important; margin:0!important; border:0!important; background:transparent!important; color:#66708b!important; font-size:14px!important; line-height:1.7!important; }
.ots-review-modal-icon { display:flex; align-items:center; justify-content:center; width:56px; height:56px; margin:0 auto 20px; border:1px solid #dcebf3; border-radius:17px; color:#0c154c; background:#eff7fb; }
.ots-review-modal-icon svg { width:27px; height:27px; }
#yorumYaz .ots-review-modal-title,.ots-review-purchase .ots-review-modal-title { margin:0 0 12px!important; padding:0!important; color:#0c154c!important; font-family:inherit; font-size:23px!important; font-weight:700!important; line-height:1.25!important; letter-spacing:-.5px; }
.ots-review-purchase .ticimaxDialogTxt > p { color:#66708b!important; font-size:14px!important; line-height:1.7!important; margin:0!important; padding:0!important; }
#yorumYaz.ots-review-login .alert > a.button,.ots-review-modal-action { box-sizing:border-box; display:flex!important; align-items:center; justify-content:center; width:100%!important; min-height:46px; padding:12px 18px!important; margin:24px 0 0!important; background:#0c154c!important; color:white!important; border:1px solid #0c154c!important; border-radius:10px!important; font-family:inherit; font-size:14px!important; font-weight:600; line-height:1.4!important; text-decoration:none!important; cursor:pointer; }
#yorumYaz.ots-review-login .alert > a.button:hover,.ots-review-modal-action:hover { background:#202d66!important; }
#yorumYaz.ots-review-login .modal-close,.ots-review-purchase .tici-noty-notification-close-btn { position:absolute!important; top:10px!important; right:10px!important; display:flex!important; align-items:center; justify-content:center; width:32px!important; height:32px!important; padding:0!important; margin:0!important; color:#66708b!important; background:#f4f6f9!important; border:0!important; border-radius:50%!important; font-size:22px!important; line-height:1!important; text-decoration:none!important; cursor:pointer; }
.ots-review-write:focus-visible,.ots-review-login a:focus-visible,.ots-review-login .modal-close:focus-visible,.ots-review-purchase a:focus-visible,.ots-review-modal-action:focus-visible { outline:3px solid #75bcd5!important; outline-offset:3px; }
#yorumYaz.ots-review-login .modal-close::before,#yorumYaz.ots-review-login .modal-close::after,.ots-review-purchase .tici-noty-notification-close-btn::before,.ots-review-purchase .tici-noty-notification-close-btn::after { content:none!important; display:none!important; }
#yorumYaz.ots-review-login .ots-review-modal-icon,.ots-review-purchase .ots-review-modal-icon { display:flex!important; align-items:center!important; justify-content:center!important; float:none!important; position:static!important; box-sizing:border-box; padding:0!important; margin:0 auto 20px!important; }
#yorumYaz.ots-review-login .ots-review-modal-icon svg,.ots-review-purchase .ots-review-modal-icon svg { display:block!important; flex:none; margin:0!important; padding:0!important; position:static!important; transform:none!important; }
#yorumYaz.ots-review-login .ots-review-modal-title,.ots-review-purchase .ots-review-modal-title { display:block!important; float:none!important; width:100%!important; text-align:center!important; }
#yorumYaz.ots-review-login .ots-review-history-link,.ots-review-purchase .ots-review-history-link { display:flex!important; align-items:center; justify-content:center; box-sizing:border-box; width:100%; min-height:44px; margin:10px 0 0!important; padding:10px 14px!important; border:1px solid #dce4ef!important; border-radius:10px; background:#fff!important; color:#0c154c!important; font-family:inherit; font-size:13px!important; font-weight:600; line-height:1.5!important; text-align:center; text-decoration:none!important; }
#yorumYaz.ots-review-login .ots-review-history-link:hover,.ots-review-purchase .ots-review-history-link:hover { background:#f0f7fb!important; border-color:#9bafc9!important; }
@media(max-width:480px) { .Formline.puanVer.ots-review-rating { gap:8px; } #yorumYaz.ots-review-login .modal-content,.ots-review-purchase .ticimaxDialogTxt { padding:34px 22px 24px!important; } }
@media(prefers-reduced-motion:reduce) { .ots-review-rating .ots-review-write { transition:none; } }
`;
        document.head.appendChild(el);
    }

    function keyboardButton(el) {
        if (!el || el.getAttribute('data-ots-keyboard')) return;
        el.setAttribute('data-ots-keyboard', 'true');
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.addEventListener('keydown', function (event) {
            if (event.key === ' ' || (event.key === 'Enter' && !el.hasAttribute('href'))) {
                event.preventDefault();
                el.click();
            }
        });
    }

    function moveButtons() {
        document.querySelectorAll('.RightDetail').forEach(function (detail) {
            var row = detail.querySelector('.Formline.puanVer');
            var holder = detail.querySelector('.YorumYazbtnContent');
            var link = holder && holder.querySelector('a');
            if (!row || !link) return;
            if (holder.parentNode !== row) {
                var previous = holder.closest('.ProductIcon2');
                var score = row.querySelector('.PuanVerSag');
                row.insertBefore(holder, score ? score.nextSibling : null);
                if (previous && !previous.querySelector('a,button,input,select,textarea') && !previous.textContent.trim()) {
                    previous.classList.add('ots-review-empty-icons');
                }
            }
            row.classList.add('ots-review-rating');
            if (!link.classList.contains('ots-review-write')) {
                link.classList.remove('hidden-phone');
                link.classList.add('ots-review-write');
                link.insertAdjacentHTML('afterbegin', icon);
                keyboardButton(link);
            }
        });
    }

    function decorate(panel, title, label) {
        if (panel.querySelector('.ots-review-modal-title')) return;
        var badge = document.createElement('div');
        badge.className = 'ots-review-modal-icon';
        badge.innerHTML = icon;
        var heading = document.createElement('h2');
        heading.className = 'ots-review-modal-title';
        heading.textContent = title;
        panel.insertBefore(heading, panel.firstChild);
        panel.insertBefore(badge, heading);
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-label', label);
    }

    function addReviewsLink(panel) {
        if (panel.querySelector('.ots-review-history-link')) return;
        var link = document.createElement('a');
        link.className = 'ots-review-history-link';
        link.target = '_blank';
        link.href = 'https://www.otsicgiyim.com/musteri-yorumlari';
        link.textContent = 'Müşteri yorumlarını incele';
        panel.appendChild(link);
    }

    function prepareClose(close) {
        if (!close) return;
        close.setAttribute('aria-label', 'Kapat');
        if (close.textContent !== '×' || close.children.length) close.textContent = '×';
        keyboardButton(close);
    }

    function updateModals() {
        var modal = document.getElementById('yorumYaz');
        if (modal) {
            var login = modal.querySelector('#divYorumYazGiris');
            modal.classList.toggle('ots-review-login', !!login);
            var panel = modal.querySelector('.modal-content');
            if (login && panel) {
                decorate(login, 'Deneyiminiz bizim için değerli', 'Yorum yazmak için üye girişi');
                var close = panel.querySelector('.modal-close');
                prepareClose(close);
                addReviewsLink(login);
            }
        }
        document.querySelectorAll('.ticimaxDialogContent .ticimaxDialog-warning').forEach(function (panel) {
            var message = panel.querySelector('p');
            if (!message || message.textContent.replace(/\s+/g, ' ').trim().toLocaleLowerCase('tr-TR') !== 'yorum yapabilmeniz için ürünü satın alınız.') return;
            panel.closest('.ticimaxDialogContent').classList.add('ots-review-purchase');
            decorate(panel, 'Yorumlar alışverişle başlar', 'Yorum için satın alma gerekli');
            var close = panel.querySelector('.tici-noty-notification-close-btn');
            prepareClose(close);
            if (!panel.querySelector('.ots-review-modal-action') && close) {
                var button = document.createElement('button');
                button.type = 'button';
                button.className = 'ots-review-modal-action';
                button.textContent = 'Ürüne dön';
                button.addEventListener('click', function () { close.click(); });
                panel.appendChild(button);
            }
            addReviewsLink(panel);
        });
    }

    function refresh() { styles(); moveButtons(); updateModals(); }
    function schedule() {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(function () { scheduled = false; refresh(); });
    }
    function init() {
        refresh();
        if (window.MutationObserver && !observer) {
            observer = new MutationObserver(function (mutations) {
                if (mutations.some(isRelevantMutation)) schedule();
            });
            observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        }
    }
    // Saniyelik kargo geri sayımı bu bölümü ilgilendirmez; her saniye yenilemeyi önler.
    function isRelevantMutation(mutation) {
        var target = mutation.target.nodeType === 3 ? mutation.target.parentElement : mutation.target;
        return !(target && target.closest && target.closest('#otsShippingPanel'));
    }
    var observer = null;
    window.otsReviewButtonInit = schedule;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}());

/* ========================================================================
 * BÖLÜM 11: ADET FİYATI, PAYLAŞIM VE DETAY DÜZENLEMELERİ
 *
 * Çoklu paket ürünlerinde adet fiyatını hesaplayıp ürün fiyatının yanında gösterir.
 * Paylaşım, geri dönüş, breadcrumb ve açıklama tablolarını düzenler.
 * ====================================================================== */
(function () {
    'use strict';

    var STYLE_ID = 'otsDetailEnhancementsStyles';
    var TOAST_ID = 'otsDetailShareToast';
    var pending = false;
    var observer = null;

    if (window.otsDetailEnhancementsInit) {
        window.otsDetailEnhancementsInit();
        return;
    }

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
body.ots-detail-enhanced .urunDetayFiyatContainer .spanKdv.ots-detail-unit-price { display:inline-block!important; margin-left:4px!important; color:#69758c!important; font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; font-size:13px!important; font-weight:550!important; line-height:1.45!important; white-space:nowrap; vertical-align:text-bottom!important; }
body.ots-detail-enhanced .urunDetayFiyatContainer .ots-detail-price-with-shipping { display:flex!important; align-items:center; flex-wrap:wrap; gap:6px 9px; max-width:100%; }
body.ots-detail-enhanced .urunDetayFiyatContainer .ots-detail-price-with-shipping > .spanFiyat,
body.ots-detail-enhanced .urunDetayFiyatContainer .ots-detail-price-with-shipping > .spanKdv { float:none!important; margin:0!important; }
body.ots-detail-enhanced .urunDetayFiyatContainer .ots-detail-price-with-shipping > .spanKdv.ots-detail-unit-price { align-self:flex-end!important; margin:0 0 0 -4px!important; }
body.ots-detail-enhanced .urunDetayFiyatContainer .ots-detail-free-shipping { box-sizing:border-box; display:inline-flex!important; align-items:center; flex:0 0 auto; float:none!important; width:auto!important; margin:0!important; padding:5px 8px!important; border:1px solid #b7dec3; border-radius:7px; background:#effaf2; color:#237341!important; font-family:inherit!important; font-size:11px!important; font-weight:600!important; line-height:1.3!important; white-space:nowrap; }
body.ots-detail-enhanced .Formline.puanVer.ots-review-rating { align-items:center!important; }
body.ots-detail-enhanced .ots-detail-share-holder { display:inline-flex!important; align-items:center; float:none!important; width:auto!important; margin:-8px 0 0!important; padding:0!important; }
body.ots-detail-enhanced .ots-detail-share-button { box-sizing:border-box; display:inline-flex; align-items:center; justify-content:center; gap:7px; min-height:36px; padding:7px 12px; border:1px solid #d7deeb; border-radius:8px; background:#fff; color:#0c154c; font-family:inherit; font-size:12px; font-weight:600; line-height:1.3; cursor:pointer; transition:background .18s,border-color .18s; }
body.ots-detail-enhanced .ots-detail-share-button svg { width:17px; height:17px; flex:none; }
body.ots-detail-enhanced .ots-detail-share-button:hover { border-color:#9bafc9; background:#f0f7fb; }
body.ots-detail-enhanced .ots-detail-share-button:focus-visible { outline:3px solid #75bcd5; outline-offset:3px; }
body.ots-detail-enhanced .categoryTitle { box-sizing:border-box; display:flex!important; align-items:center; justify-content:space-between; gap:16px; width:100%; margin:0 0 22px!important; padding:11px 14px!important; border:1px solid #e3e8ef; border-radius:11px; background:#fff; box-shadow:0 5px 20px rgba(12,21,48,.045); }
body.ots-detail-enhanced .categoryTitle .proCategoryTitle { min-width:0; flex:1; margin:0!important; padding:0!important; }
body.ots-detail-enhanced .categoryTitle ul.breadcrumb { box-sizing:border-box; display:flex!important; align-items:center; flex-wrap:nowrap; gap:7px; width:100%!important; max-width:none!important; margin:0!important; padding:0!important; overflow:hidden; background:transparent!important; border:0!important; list-style:none; white-space:nowrap; }
body.ots-detail-enhanced .categoryTitle ul.breadcrumb::before,body.ots-detail-enhanced .categoryTitle ul.breadcrumb::after { display:none!important; content:none!important; }
body.ots-detail-enhanced .categoryTitle ul.breadcrumb li { box-sizing:border-box; display:inline-flex!important; align-items:center; flex:none; max-width:190px; margin:0!important; padding:0!important; color:transparent!important; font-size:0!important; line-height:1!important; }
body.ots-detail-enhanced .categoryTitle ul.breadcrumb li:last-child { min-width:0; max-width:360px; flex:1; }
body.ots-detail-enhanced .categoryTitle ul.breadcrumb li:not(:last-child)::after { content:'›'!important; display:inline-block!important; margin-left:7px; color:#9aa4b5; font-family:inherit; font-size:15px!important; line-height:1!important; margin-top:-18px !important;}
body.ots-detail-enhanced .categoryTitle ul.breadcrumb li a { display:block!important; min-width:0; max-width:100%; margin:0!important; padding:0!important; color:#68748a!important; font-family:inherit; font-size:11px!important; font-weight:500!important; line-height:1.5!important; text-decoration:none!important; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
body.ots-detail-enhanced .categoryTitle ul.breadcrumb li:last-child a { color:#0c154c!important; font-weight:600!important; }
body.ots-detail-enhanced .categoryTitle ul.breadcrumb li a span { display:block!important; max-width:100%!important; margin:0!important; color:inherit!important; font:inherit!important; line-height:inherit!important; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
body.ots-detail-enhanced .categoryTitle ul.breadcrumb li a span::after { display:none!important; content:none!important; }
body.ots-detail-enhanced a#linkOncekiSayfa { box-sizing:border-box; display:inline-flex!important; align-items:center; justify-content:center; flex:none; gap:7px; min-height:36px; margin:0!important; padding:8px 11px!important; border:1px solid #dce3ec; border-radius:8px; background:#f7f9fb; color:#0c154c!important; font-family:inherit!important; font-size:11px!important; font-weight:600!important; line-height:1.4!important; text-decoration:none!important; cursor:pointer; white-space:nowrap; }
body.ots-detail-enhanced a#linkOncekiSayfa::before { content:'←'!important; display:inline-block!important; position:static!important; color:inherit; font-family:inherit!important; font-size:15px!important; line-height:1!important; }
body.ots-detail-enhanced a#linkOncekiSayfa:hover { border-color:#aebdcc; background:#eff5fa; }
body.ots-detail-enhanced .ots-size-table-wrap { width:100%; margin:14px 0 22px; overflow-x:auto; border:1px solid #dde5ed; border-radius:12px; background:#fff; box-shadow:0 8px 26px rgba(12,21,48,.055); -webkit-overflow-scrolling:touch; }
body.ots-detail-enhanced #divTabOzellikler table.ots-size-table { width:100%!important; min-width:540px; margin:0!important; border:0!important; border-collapse:separate!important; border-spacing:0!important; background:#fff; color:#364158; font-family:inherit; font-size:13px; line-height:1.5; }
body.ots-detail-enhanced #divTabOzellikler table.ots-size-table tr { background:#fff; }
body.ots-detail-enhanced #divTabOzellikler table.ots-size-table tr:nth-child(even) { background:#f8fafc; }
body.ots-detail-enhanced #divTabOzellikler table.ots-size-table tr:first-child { background:#0c154c; }
body.ots-detail-enhanced #divTabOzellikler table.ots-size-table td { height:auto!important; padding:12px 14px!important; border:0!important; border-right:1px solid #e6ebf1!important; border-bottom:1px solid #e6ebf1!important; color:inherit!important; text-align:left; vertical-align:middle; white-space:nowrap; }
body.ots-detail-enhanced #divTabOzellikler table.ots-size-table td:last-child { border-right:0!important; }
body.ots-detail-enhanced #divTabOzellikler table.ots-size-table tr:last-child td { border-bottom:0!important; }
body.ots-detail-enhanced #divTabOzellikler table.ots-size-table tr:first-child td,body.ots-detail-enhanced #divTabOzellikler table.ots-size-table tr:first-child td b { color:#fff!important; font-size:12px; font-weight:650; letter-spacing:.02em; }
body.ots-detail-enhanced #divTabOzellikler table.ots-size-table td:first-child,body.ots-detail-enhanced #divTabOzellikler table.ots-size-table td:first-child b { color:#0c154c!important; font-weight:650; }
body.ots-detail-enhanced #divTabOzellikler table.ots-size-table tr:first-child td:first-child,body.ots-detail-enhanced #divTabOzellikler table.ots-size-table tr:first-child td:first-child b { color:#fff!important; }
body.ots-detail-enhanced .ots-detail-toast { box-sizing:border-box; position:fixed; left:50%; bottom:24px; z-index:100002; display:flex; align-items:center; gap:9px; max-width:calc(100vw - 32px); padding:11px 15px; border:1px solid rgba(255,255,255,.14); border-radius:10px; background:#0c154c; color:#fff; font-family:inherit; font-size:12px; font-weight:600; line-height:1.4; box-shadow:0 12px 36px rgba(12,21,48,.23); opacity:0; pointer-events:none; transform:translate(-50%,12px); transition:opacity .2s,transform .2s; }
body.ots-detail-enhanced .ots-detail-toast.is-visible { opacity:1; transform:translate(-50%,0); }
@media(max-width:767px) {
 body.ots-detail-enhanced .categoryTitle { align-items:flex-start; flex-direction:column; gap:10px; margin-bottom:14px!important; padding:10px!important; }
 body.ots-detail-enhanced .categoryTitle .proCategoryTitle { order:2; width:100%; }
 body.ots-detail-enhanced a#linkOncekiSayfa { order:1; min-height:34px; padding:7px 10px!important; }
 body.ots-detail-enhanced .categoryTitle ul.breadcrumb { overflow-x:auto; padding-bottom:2px!important; scrollbar-width:none; }
 body.ots-detail-enhanced .categoryTitle ul.breadcrumb::-webkit-scrollbar { display:none; }
 body.ots-detail-enhanced .categoryTitle ul.breadcrumb li,body.ots-detail-enhanced .categoryTitle ul.breadcrumb li:last-child { max-width:170px; flex:none; }
 body.ots-detail-enhanced .ots-detail-share-button { min-height:36px; }
 body.ots-detail-enhanced .ots-size-table-wrap { margin-top:10px; }
 body.ots-detail-enhanced #divTabOzellikler table.ots-size-table td { padding:11px 12px!important; }
}
@media(prefers-reduced-motion:reduce) { body.ots-detail-enhanced .ots-detail-share-button,body.ots-detail-enhanced .ots-detail-toast { transition:none; } }
`;
        document.head.appendChild(style);
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
            value = comma > dot ? value.replace(/\./g, '').replace(',', '.') : value.replace(/,/g, '');
        } else if (comma > -1) {
            value = value.length - comma - 1 <= 2 ? value.replace(/\./g, '').replace(',', '.') : value.replace(/,/g, '');
        } else if (dot > -1 && value.length - dot - 1 > 2) {
            value = value.replace(/\./g, '');
        }

        value = Number(value);
        return Number.isFinite(value) ? value : 0;
    }

    function productName() {
        var title = document.querySelector('.RightDetail .ProductName h1 > span:not(.productcode), .RightDetail .ProductName h1');
        return title ? title.textContent.replace(/\s+/g, ' ').trim() : document.title;
    }

    function updateUnitPrice() {
        var quantity = getPackageQuantity(productName());

        document.querySelectorAll('.urunDetayFiyatContainer .right_line').forEach(function (row) {
            var price = row.querySelector('.spanFiyat');
            var kdv = row.querySelector('.spanKdv');
            if (!price || !kdv) return;

            if (!kdv.hasAttribute('data-ots-original-text')) {
                kdv.setAttribute('data-ots-original-text', kdv.textContent.trim());
            }

            var total = parseTurkishPrice(price.textContent);
            if (!quantity || !total) {
                var original = kdv.getAttribute('data-ots-original-text');
                if (kdv.textContent !== original) kdv.textContent = original;
                kdv.classList.remove('ots-detail-unit-price');
                return;
            }

            var unit = (total / quantity).toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            var label = '(₺' + unit + ' / adet)';
            if (kdv.textContent !== label) kdv.textContent = label;
            kdv.classList.add('ots-detail-unit-price');
            kdv.setAttribute('aria-label', 'Adet fiyatı ' + unit + ' Türk lirası');
        });
    }

    // Ürünün ücretsiz kargo işareti; sepet toplamından bağımsızdır.
    function updateFreeShippingBadge() {
        var product = window.productDetailModel && window.productDetailModel.product;
        document.querySelectorAll('.RightDetail').forEach(function (detail) {
            var freeShipping = product && typeof product.freeShipping === 'boolean'
                ? product.freeShipping
                : Boolean(detail.querySelector('#divKargoBedava, .UrunKargoBedava'));
            var row = detail.querySelector('.urunDetayFiyatContainer .right_line.indirimliFiyat');
            var badge = detail.querySelector('.ots-detail-free-shipping');

            if (!freeShipping || !row || !row.querySelector('.spanFiyat')) {
                if (badge) badge.remove();
                if (row) row.classList.remove('ots-detail-price-with-shipping');
                return;
            }

            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'ots-detail-free-shipping';
                badge.textContent = 'Ücretsiz Kargo';
            }
            row.classList.add('ots-detail-price-with-shipping');
            if (badge.parentElement !== row) row.appendChild(badge);
        });
    }

    function shareData() {
        var canonical = document.querySelector('link[rel="canonical"]');
        return {
            title: productName(),
            text: productName(),
            url: canonical && canonical.href ? canonical.href : window.location.href
        };
    }

    function showToast(message) {
        var toast = document.getElementById(TOAST_ID);
        if (!toast) {
            toast = document.createElement('div');
            toast.id = TOAST_ID;
            toast.className = 'ots-detail-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('is-visible');
        window.clearTimeout(toast.otsTimer);
        toast.otsTimer = window.setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
    }

    function copyShareUrl(url) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(url);
        }

        return new Promise(function (resolve, reject) {
            var input = document.createElement('textarea');
            input.value = url;
            input.setAttribute('readonly', '');
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            input.select();
            try {
                if (!document.execCommand('copy')) throw new Error('copy_failed');
                resolve();
            } catch (error) {
                reject(error);
            } finally {
                input.remove();
            }
        });
    }

    function onShare() {
        var data = shareData();
        if (navigator.share) {
            navigator.share(data).catch(function (error) {
                if (!error || error.name !== 'AbortError') showToast('Paylaşım açılamadı.');
            });
            return;
        }

        copyShareUrl(data.url).then(function () {
            showToast('Ürün bağlantısı kopyalandı.');
        }).catch(function () {
            showToast('Bağlantı kopyalanamadı.');
        });
    }

    function addShareButton() {
        document.querySelectorAll('.RightDetail').forEach(function (detail) {
            var review = detail.querySelector('.Formline.puanVer .YorumYazbtnContent');
            if (!review) return;

            var holder = detail.querySelector('.ots-detail-share-holder');
            if (!holder) {
                holder = document.createElement('div');
                holder.className = 'ots-detail-share-holder';
                holder.innerHTML = '<button type="button" class="ots-detail-share-button" aria-label="Ürünü paylaş"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></svg><span>Paylaş</span></button>';
                holder.querySelector('button').addEventListener('click', onShare);
            }
            if (holder.parentElement !== review.parentElement || holder.previousElementSibling !== review) {
                review.insertAdjacentElement('afterend', holder);
            }
        });
    }

    function cleanNavigation() {
        var back = document.getElementById('linkOncekiSayfa');
        if (back) {
            if (back.textContent.trim() !== 'Önceki Sayfaya Dön') back.textContent = 'Önceki Sayfaya Dön';
            back.setAttribute('aria-label', 'Önceki sayfaya dön');
        }
    }

    function styleSizeTables() {
        document.querySelectorAll('#divTabOzellikler table').forEach(function (table) {
            if (table.classList.contains('ots-size-table')) return;
            var firstRow = table.querySelector('tr');
            var heading = firstRow ? firstRow.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim().toLocaleLowerCase('tr-TR') : '';
            var headingCells = firstRow ? firstRow.querySelectorAll('th, td').length : 0;
            var rowCount = table.querySelectorAll('tr').length;

            // Ürünlere göre ölçü sütunları Boy/Kilo, Göğüs/Bel veya
            // Alt/Üst Genişlik gibi değişebiliyor. İlk sütunu Beden olan
            // ve veri satırı bulunan tüm ölçü tablolarını aynı stile al.
            if (heading.indexOf('beden') === -1 || headingCells < 2 || rowCount < 2) return;

            table.classList.add('ots-size-table');
            var wrapper = document.createElement('div');
            wrapper.className = 'ots-size-table-wrap';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
    }

    function refresh() {
        if (!document.querySelector('#ProductDetailMain, .contentProductDetail')) return;
        document.body.classList.add('ots-detail-enhanced');
        injectStyles();
        updateUnitPrice();
        updateFreeShippingBadge();
        addShareButton();
        cleanNavigation();
        styleSizeTables();
    }

    function schedule() {
        if (pending) return;
        pending = true;
        window.requestAnimationFrame(function () {
            pending = false;
            refresh();
        });
    }

    function init() {
        refresh();
        if (!window.MutationObserver || observer) return;
        observer = new MutationObserver(function (mutations) {
            // Saniyelik kargo geri sayımı bu bölümü ilgilendirmez; her saniye yenilemeyi önler.
            var relevant = mutations.some(function (mutation) {
                var target = mutation.target.nodeType === 3 ? mutation.target.parentElement : mutation.target;
                return !(target && target.closest && target.closest('#otsShippingPanel'));
            });
            if (relevant) schedule();
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }

    window.otsDetailEnhancementsInit = schedule;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}());

/* ========================================================================
 * BÖLÜM 12: ÜRÜN DETAY İŞLEM İKONLARI
 *
 * Favori, stok bildirimi ve ürün detayındaki yardımcı işlem düğmelerini düzenler.
 * Ürünü inceleyen ve sepetinde bulunduran kişi bilgilerini kurumsal kartlarda sunar.
 * ====================================================================== */
(function (window, document) {
    'use strict';

    if (window.otsDetailActionsStarted) {
        if (typeof window.otsDetailActionsRefresh === 'function') window.otsDetailActionsRefresh();
        return;
    }

    window.otsDetailActionsStarted = true;

    var STYLE_ID = 'otsDetailActionsStyles';
    var ACTIONS_CLASS = 'ots-detail-actions';
    var ACTIVITY_CLASS = 'ots-detail-activity';
    var pending = false;
    var observer = null;
    var viewerTimer = null;

    var actionDefinitions = [
        {
            selector: '.UFavorilerimeEkle',
            modifier: 'favorite',
            label: 'Favorilere Ekle',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.4 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>'
        },
        {
            selector: '.FiyatHaberVer',
            modifier: 'price',
            label: 'Fiyat Düşünce Haber Ver',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>'
        },
        {
            selector: '.UGelinceHaberVer',
            modifier: 'stock',
            label: 'Stoğa Gelince Haber Ver',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>'
        }
    ];

    var css = `
.${ACTIONS_CLASS} { position:relative!important; z-index:20!important; box-sizing:border-box; display:grid!important; grid-template-columns:repeat(auto-fit,minmax(155px,1fr)); gap:8px; width:100%; margin:10px 0 14px; padding:0; clear:both; pointer-events:auto!important; }
.${ACTIONS_CLASS},.${ACTIONS_CLASS} * { box-sizing:border-box; }
/* Sepet satırı float kullandığı için bu satır da akışa katılır; üst boşluk korunur. */
.RightDetail .${ACTIONS_CLASS} { float:left!important; clear:both!important; margin:14px 0!important; }
.${ACTIONS_CLASS}__item { position:relative!important; z-index:1!important; width:100%; margin:0!important; padding:0!important; float:none!important; pointer-events:auto!important; }
.${ACTIONS_CLASS}__item > a { position:relative!important; z-index:2!important; display:flex!important; align-items:center; justify-content:center; gap:8px; width:100%!important; min-height:42px; margin:0!important; padding:9px 11px!important; border:1px solid #dce3eb!important; border-radius:9px!important; background:#fff!important; color:#344158!important; font-family:inherit!important; font-size:11px!important; font-weight:600!important; line-height:1.35!important; text-align:center; text-decoration:none!important; cursor:pointer!important; caret-color:transparent; user-select:none; pointer-events:auto!important; touch-action:manipulation; box-shadow:none!important; transition:border-color .18s,background .18s,color .18s; }
.${ACTIONS_CLASS}__item > a * { cursor:pointer!important; user-select:none; pointer-events:none!important; }
.${ACTIONS_CLASS}__item > a:hover { border-color:#aebdcd!important; background:#f3f8fc!important; color:#0c154c!important; }
.${ACTIONS_CLASS}__item > a:focus-visible { outline:3px solid #79bdd5; outline-offset:2px; }
.${ACTIONS_CLASS}__item .box1 { display:inline-flex!important; align-items:center; justify-content:center; gap:8px; width:auto!important; margin:0!important; padding:0!important; color:inherit!important; font:inherit!important; line-height:inherit!important; background:none!important; border:0!important; }
.${ACTIONS_CLASS}__item .box1::before,.${ACTIONS_CLASS}__item .box1::after { content:none!important; display:none!important; }
.${ACTIONS_CLASS}__item i { display:none!important; }
.${ACTIONS_CLASS}__icon { display:inline-flex; align-items:center; justify-content:center; flex:0 0 18px; width:18px; height:18px; color:#0c154c; }
.${ACTIONS_CLASS}__icon svg { display:block; width:18px; height:18px; }
.${ACTIONS_CLASS}__label { color:inherit; font:inherit; line-height:inherit; }
.${ACTIONS_CLASS}__item--favorite a[data-action='0'] { border-color:#e7cfd4!important; background:#fff8f9!important; color:#8f3344!important; }
.ProductIcon.ots-detail-actions-source { min-height:0!important; margin:0!important; padding:0!important; border:0!important; background:transparent!important; }
.yorum-sosyal-kanit { display:none!important; }
.${ACTIVITY_CLASS} { box-sizing:border-box; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); width:100%; margin:12px 0; padding:13px 0; border-top:1px solid #e7ebf0; border-bottom:1px solid #e7ebf0; background:#fff; color:#344158; clear:both; }
.${ACTIVITY_CLASS},.${ACTIVITY_CLASS} * { box-sizing:border-box; float:none; }
.${ACTIVITY_CLASS}__item { position:relative; display:flex; align-items:center; justify-content:center; gap:8px; min-width:0; padding:0 10px; }
.${ACTIVITY_CLASS}__item + .${ACTIVITY_CLASS}__item { border-left:1px solid #e7ebf0; }
.${ACTIVITY_CLASS}__icon { display:inline-flex; align-items:center; justify-content:center; flex:0 0 17px; width:17px; height:17px; color:#53657d; }
.${ACTIVITY_CLASS}__icon svg { display:block; width:17px; height:17px; }
.${ACTIVITY_CLASS}__text { display:block; min-width:0; }
.${ACTIVITY_CLASS}__main { display:block; margin:0; color:#26334b; font-size:11px; font-weight:650; line-height:1.35; white-space:normal; }
.${ACTIVITY_CLASS}__sub { display:block; margin-top:2px; color:#8993a3; font-size:10px; font-weight:400; line-height:1.3; }
.${ACTIVITY_CLASS}__count { display:inline-block; min-width:12px; color:#0c154c; font-weight:750; text-align:center; font-variant-numeric:tabular-nums; transition:opacity .18s,transform .18s; }
.${ACTIVITY_CLASS}__count.is-changing { opacity:.35; transform:translateY(-2px); }

@media(max-width:768px) {
    .RightDetail .${ACTIONS_CLASS} { grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px!important; margin:18px 0 14px!important; }
    .${ACTIONS_CLASS}__item > a { min-height:44px; padding:8px!important; font-size:10px!important; }
    .${ACTIONS_CLASS}__item:nth-child(3):last-child { grid-column:1 / -1; }
    .${ACTIVITY_CLASS} { grid-template-columns:repeat(3,minmax(0,1fr)); padding:9px 0; }
    .${ACTIVITY_CLASS}__item { flex-direction:column; justify-content:flex-start; gap:5px; min-height:72px; padding:4px 5px; text-align:center; }
    .${ACTIVITY_CLASS}__item + .${ACTIVITY_CLASS}__item { border-top:0; border-left:1px solid #edf0f4; }
    .${ACTIVITY_CLASS}__icon { flex-basis:15px; width:15px; height:15px; }
    .${ACTIVITY_CLASS}__icon svg { width:15px; height:15px; }
    .${ACTIVITY_CLASS}__main { font-size:9.5px; line-height:1.28; }
    .${ACTIVITY_CLASS}__sub { margin-top:3px; font-size:8.5px; line-height:1.25; }
}
@media(max-width:360px) { .${ACTIONS_CLASS} { grid-template-columns:1fr; } .${ACTIONS_CLASS}__item:nth-child(3):last-child { grid-column:auto; } }
@media(prefers-reduced-motion:reduce) { .${ACTIONS_CLASS}__item > a,.${ACTIVITY_CLASS}__count { transition:none; } }
`;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
    }

    function createActions(detail, buyButton) {
        var actions = detail.querySelector('.' + ACTIONS_CLASS);

        if (!actions) {
            actions = document.createElement('div');
            actions.className = ACTIONS_CLASS;
            actions.setAttribute('aria-label', 'Ürün bildirim ve favori işlemleri');
        }

        if (buyButton && (actions.parentElement !== buyButton.parentElement || actions.previousElementSibling !== buyButton)) {
            buyButton.insertAdjacentElement('afterend', actions);
        }

        return actions;
    }

    function hashText(value) {
        var hash = 0;
        var text = String(value || '');
        var i;

        for (i = 0; i < text.length; i += 1) {
            hash = ((hash << 5) - hash) + text.charCodeAt(i);
            hash |= 0;
        }

        return Math.abs(hash);
    }

    function getProductKey() {
        var productElement = document.querySelector('#divSatinAl [data-productid], #ProductDetailMain [data-productid], #ProductDetailMain [data-product-id]');
        var productId = window.productDetailModel && window.productDetailModel.productId;

        return String(productId || (productElement && (productElement.getAttribute('data-productid') || productElement.getAttribute('data-product-id'))) || window.location.pathname);
    }

    function getActivityCount(type, minimum, maximum) {
        var configured = window.otsDetailActivityCounts;
        var configuredValue = configured && Number(configured[type]);
        var range = maximum - minimum + 1;

        if (Number.isFinite(configuredValue) && configuredValue >= 0) return Math.round(configuredValue);
        return minimum + (hashText(getProductKey() + ':' + type) % range);
    }

    function createActivity(detail, buyButton) {
        var activity = detail.querySelector('.' + ACTIVITY_CLASS);
        var cartCount;
        var favoriteCount;
        var viewerCount;
        var bagIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
        var heartIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.4 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>';
        var eyeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';

        document.querySelectorAll('.yorum-sosyal-kanit').forEach(function (legacy) {
            legacy.remove();
        });

        if (!activity) {
            cartCount = getActivityCount('cart', 3, 9);
            favoriteCount = getActivityCount('favorite', 8, 28);
            viewerCount = getActivityCount('viewer', 6, 15);

            activity = document.createElement('div');
            activity.className = ACTIVITY_CLASS;
            activity.setAttribute('aria-label', 'Ürün ilgi bilgileri');
            activity.innerHTML = `
                <div class="${ACTIVITY_CLASS}__item"><span class="${ACTIVITY_CLASS}__icon">${bagIcon}</span><span class="${ACTIVITY_CLASS}__text"><span class="${ACTIVITY_CLASS}__main">${cartCount} kişinin sepetinde</span><span class="${ACTIVITY_CLASS}__sub">Son 24 saatte</span></span></div>
                <div class="${ACTIVITY_CLASS}__item"><span class="${ACTIVITY_CLASS}__icon">${heartIcon}</span><span class="${ACTIVITY_CLASS}__text"><span class="${ACTIVITY_CLASS}__main">${favoriteCount} kişi favorilerine ekledi</span><span class="${ACTIVITY_CLASS}__sub">Bu ürünü beğendi</span></span></div>
                <div class="${ACTIVITY_CLASS}__item"><span class="${ACTIVITY_CLASS}__icon">${eyeIcon}</span><span class="${ACTIVITY_CLASS}__text"><span class="${ACTIVITY_CLASS}__main">Şu an <span class="${ACTIVITY_CLASS}__count">${viewerCount}</span> kişi inceliyor</span><span class="${ACTIVITY_CLASS}__sub">Canlı ilgi</span></span></div>
            `;
        }

        if (buyButton && (activity.parentElement !== buyButton.parentElement || activity.nextElementSibling !== buyButton)) {
            buyButton.parentNode.insertBefore(activity, buyButton);
        }

        startViewerCounter(activity);
        return activity;
    }

    function startViewerCounter(activity) {
        var count = activity && activity.querySelector('.' + ACTIVITY_CLASS + '__count');
        var delays = [5000, 7000, 10000, 15000, 20000, 30000];

        if (!count || viewerTimer) return;

        function scheduleNext() {
            var delay = delays[Math.floor(Math.random() * delays.length)];
            viewerTimer = window.setTimeout(function () {
                var current = parseInt(count.textContent, 10) || 8;
                var steps = [-2, -1, 1, 1, 2];
                var next = Math.max(3, Math.min(24, current + steps[Math.floor(Math.random() * steps.length)]));

                if (!document.documentElement.contains(count)) {
                    viewerTimer = null;
                    return;
                }

                count.classList.add('is-changing');
                window.setTimeout(function () {
                    count.textContent = String(next === current ? Math.min(current + 1, 24) : next);
                    count.classList.remove('is-changing');
                    scheduleNext();
                }, 180);
            }, delay);
        }

        scheduleNext();
    }

    function bindTicimaxAction(link, definition) {
        if (!link || (definition.modifier !== 'favorite' && definition.modifier !== 'price')) return;
        link.setAttribute('data-ots-ticimax-action', definition.modifier);
        link.removeAttribute('onclick');
        link.setAttribute('href', '#');
    }

    // Varyant/tema güncellemesi düğümü kopyalasa da tıklama bağlantısı kaybolmaz.
    // HTML'deki data-* işareti bir event listener'ın hâlâ var olduğunu kanıtlamaz.
    function handleTicimaxAction(event) {
        var target = event.target;
        var link = target && target.closest && target.closest('.' + ACTIONS_CLASS + ' a[data-ots-ticimax-action]');
        if (!link) return;

        var type = link.getAttribute('data-ots-ticimax-action');
        var functionName = type === 'favorite' ? 'FavoriUrunDetay' : type === 'price' ? 'FiyatAlarmListeUrunDetay' : null;
        if (!functionName) return;

        event.preventDefault();
        var action = window[functionName];
        if (typeof action !== 'function') {
            var message = 'Ürün işlemleri henüz yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.';
            if (window.TiciNoty && typeof window.TiciNoty.Show === 'function') {
                window.TiciNoty.Show({ message: message, type: 'warning' });
            } else {
                window.alert(message);
            }
            return;
        }

        action.call(window);
        window.setTimeout(schedule, 80);
        window.setTimeout(schedule, 400);
    }

    function prepareAction(item, definition) {
        var link = item.querySelector('a');
        var content;
        var icon;
        var text;
        var label = definition.label;

        if (!link) return false;

        item.classList.add(ACTIONS_CLASS + '__item', ACTIONS_CLASS + '__item--' + definition.modifier);
        content = link.querySelector('.box1') || link.querySelector('span');

        if (!content) {
            content = document.createElement('span');
            content.className = 'box1';
            link.appendChild(content);
        }

        if (link.getAttribute('data-action') === '0') {
            if (definition.modifier === 'favorite') label = 'Favorilerden Çıkar';
            if (definition.modifier === 'price') label = 'Fiyat Alarmını Kaldır';
        }

        icon = content.querySelector('.' + ACTIONS_CLASS + '__icon');
        if (!icon) {
            content.textContent = '';
            icon = document.createElement('span');
            icon.className = ACTIONS_CLASS + '__icon';
            icon.innerHTML = definition.icon;
            content.appendChild(icon);
        }

        text = content.querySelector('.' + ACTIONS_CLASS + '__label');
        if (!text) {
            text = document.createElement('span');
            text.className = ACTIONS_CLASS + '__label';
            content.appendChild(text);
        }
        if (text.textContent !== label) text.textContent = label;

        link.setAttribute('aria-label', label);
        link.setAttribute('title', label);
        bindTicimaxAction(link, definition);
        return true;
    }

    function modernizeActions() {
        var detail = document.querySelector('#ProductDetailMain .RightDetail, #contentProductDetail .RightDetail, .RightDetail');
        var buyButton;
        var actions;
        var source;

        pending = false;
        injectStyles();
        if (!detail) return false;

        buyButton = detail.querySelector('#divSatinAl');
        if (!buyButton) return false;

        source = detail.querySelector('.ProductIcon');
        createActivity(detail, buyButton);

        // Kutu yalnızca taşınacak işlem varsa eklenir; boş kutunun her karede
        // eklenip kaldırılması gözlemciyi sonsuz döngüye sokuyordu.
        var items = [];
        actionDefinitions.forEach(function (definition) {
            var item = detail.querySelector(definition.selector);
            if (item && prepareAction(item, definition)) items.push(item);
        });

        if (source && !source.classList.contains('ots-detail-actions-source')) source.classList.add('ots-detail-actions-source');

        if (!items.length) {
            actions = detail.querySelector('.' + ACTIONS_CLASS);
            if (actions && !actions.children.length) actions.remove();
            return false;
        }

        actions = createActions(detail, buyButton);
        items.forEach(function (item) {
            if (item.parentElement !== actions) actions.appendChild(item);
        });
        return true;
    }

    function schedule() {
        if (pending) return;
        pending = true;
        (window.requestAnimationFrame || window.setTimeout)(modernizeActions);
    }

    function start() {
        document.addEventListener('click', handleTicimaxAction);
        modernizeActions();

        if (window.MutationObserver && !observer) {
            observer = new MutationObserver(function (mutations) {
                var shouldRefresh = mutations.some(function (mutation) {
                    var target = mutation.target.nodeType === 1 ? mutation.target : mutation.target.parentElement;
                    if (target && target.closest('.' + ACTIVITY_CLASS)) return false;
                    return target && target.closest('.RightDetail');
                });
                if (shouldRefresh) schedule();
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }

        [100, 350, 800, 1500, 3000].forEach(function (delay) {
            window.setTimeout(schedule, delay);
        });
    }

    window.otsDetailActionsRefresh = schedule;

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
}(window, document));


/* ========================================================================
 * BÖLÜM 13: ÜRÜN DETAYINDA ÜSTÜ ÇİZİLİ İNDİRİMLİ FİYAT
 *
 * Ürün detayındaki Özel Alan 4 indirim oranını uygular; liste sayfası
 * fiyat modülünden bağımsız olarak yalnızca ana ürün fiyatını yönetir.
 * ====================================================================== */
(function () {
    'use strict';

    if (window.__otsDetailCalculatedOldPriceLoaded) return;
    window.__otsDetailCalculatedOldPriceLoaded = true;

    var STYLE_ID = 'otsCalculatedOldPriceStyles';
    var OLD_PRICE_CLASS = 'ots-calculated-old-price';

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .RightDetail #divOzelAlan4 {
                display: none !important;
            }

            .RightDetail #pnlFiyatlar #fiyat2 .${OLD_PRICE_CLASS} {
                display: inline-block !important;
                width: max-content;
                max-width: 100%;
                margin: 0 !important;
                padding: 0 !important;
                color: #8a91a3 !important;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                font-size: 14px !important;
                font-weight: 600 !important;
                line-height: 1.25 !important;
                letter-spacing: 0 !important;
                text-decoration: line-through !important;
                text-decoration-thickness: 1.5px !important;
                text-decoration-color: #a7a3a3 !important;
                white-space: nowrap;
            }

            .RightDetail #pnlFiyatlar #fiyat2 .spanFiyat,
            .RightDetail #pnlFiyatlar #fiyat2 .spanKdv {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
            }

            .RightDetail #pnlFiyatlar #fiyat2 .spanFiyat.ots-discounted-price {
                display: inline-block !important;
                clear: none !important;
                margin: 0 0 0 10px !important;
                vertical-align: baseline !important;
                color: #d72638 !important;
                font-size: 1.66em !important;
                font-weight: 800 !important;
            }

            @media (max-width: 767px) {
                .RightDetail #pnlFiyatlar #fiyat2 .${OLD_PRICE_CLASS} {
                    margin: 0 !important;
                    font-size: 13px !important;
                }

                .RightDetail #pnlFiyatlar #fiyat2 .spanFiyat.ots-discounted-price {
                    margin-left: 7px !important;
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
        } else {
            priceElement.insertBefore(document.createTextNode(formattedPrice), priceElement.firstChild);
        }
    }

    function getBasePrice(priceElement) {
        var visiblePrice = parseTurkishNumber(priceElement.textContent);
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

    function findElements() {
        // İndirim, yalnızca ürün detayının kendi Özel Alan 4 değeri varsa uygulanır.
        // Sayfanın geri kalanındaki fiyat veya benzer alanlar kesinlikle taranmaz.
        var detailArea = document.querySelector('.RightDetail');
        if (!detailArea) return null;

        var source = detailArea.querySelector('#divOzelAlan4');
        if (!source) return null;

        var price = detailArea.querySelector(
            '#pnlFiyatlar #fiyat2 > .spanFiyat, ' +
            '#pnlFiyatlar #fiyat2 .spanFiyat'
        );

        if (!price) return null;

        return {
            price: price,
            priceContainer: price.closest('#fiyat2') || price.parentElement,
            source: source
        };
    }

    function removeOldPrice(container) {
        if (!container) return;
        var oldPrice = container.querySelector('.' + OLD_PRICE_CLASS);
        if (oldPrice) oldPrice.remove();
    }

    function restoreBasePrice(elements) {
        var storedBase = Number.parseFloat(elements.price.dataset.otsBasePrice || '');

        if (Number.isFinite(storedBase) && storedBase > 0) {
            setPrimaryPriceText(elements.price, formatPrice(storedBase));
        }

        delete elements.price.dataset.otsBasePrice;
        delete elements.price.dataset.otsDiscountedPrice;
        if (elements.price.hasAttribute('aria-label')) elements.price.removeAttribute('aria-label');
        // Sınıf yalnızca gerçekten değişiyorsa güncellenir; Bölüm 6 sınıf değişimlerini izler.
        if (elements.price.classList.contains('ots-discounted-price')) elements.price.classList.remove('ots-discounted-price');
        removeOldPrice(elements.priceContainer);
    }

    function updateOldPrice() {
        var elements = findElements();
        if (!elements || !elements.priceContainer) return false;

        var percentage = readPercentage(elements.source);
        var basePrice = getBasePrice(elements.price);

        if (!Number.isFinite(percentage) || !Number.isFinite(basePrice) || basePrice <= 0) {
            restoreBasePrice(elements);
            return false;
        }

        // Ekranda gösterilen kuruşa yuvarlanır; yuvarlanmamış değer saklanırsa
        // gözlemci gösterilen fiyatı yeni taban sanıp indirimi ikinci kez uygular.
        var discountedPrice = Math.round(basePrice * (100 - percentage)) / 100;
        var formattedBasePrice = formatPrice(basePrice);
        var formattedDiscountedPrice = formatPrice(discountedPrice);
        var oldPrice = elements.priceContainer.querySelector('.' + OLD_PRICE_CLASS);

        if (!oldPrice) {
            oldPrice = document.createElement('span');
            oldPrice.className = OLD_PRICE_CLASS;
            elements.price.parentNode.insertBefore(oldPrice, elements.price);
        }

        if (oldPrice.textContent !== formattedBasePrice) {
            oldPrice.textContent = formattedBasePrice;
            oldPrice.setAttribute(
                'aria-label',
                'İndirim öncesi fiyat ' + formattedBasePrice
            );
            oldPrice.dataset.percentage = String(percentage);
            oldPrice.dataset.basePrice = String(basePrice);
        }

        setPrimaryPriceText(elements.price, formattedDiscountedPrice);
        if (!elements.price.classList.contains('ots-discounted-price')) elements.price.classList.add('ots-discounted-price');
        elements.price.dataset.otsBasePrice = String(basePrice);
        elements.price.dataset.otsDiscountedPrice = String(discountedPrice);
        elements.price.setAttribute(
            'aria-label',
            'Yüzde ' + percentage + ' indirimli satış fiyatı ' + formattedDiscountedPrice
        );

        if (elements.source) {
            elements.source.setAttribute('aria-hidden', 'true');
            elements.source.dataset.otsPricePercentageSource = 'true';
        }

        return true;
    }

    function observeDetail() {
        if (!window.MutationObserver) return;

        var detailArea = document.querySelector('.RightDetail');
        if (!detailArea) return;

        var observer = new MutationObserver(function (mutations) {
            var relevant = mutations.some(function (mutation) {
                var target = mutation.target.nodeType === 3 ? mutation.target.parentElement : mutation.target;
                // Eski fiyat etiketi ve saniyelik kargo geri sayımı fiyatı etkilemez.
                return target && !target.closest('.' + OLD_PRICE_CLASS + ', #otsShippingPanel');
            });

            // Gözlemci geri çağrısı çizimden önce çalışır; gecikme fiyat titreşimine yol açar.
            if (relevant && detailArea.querySelector('#divOzelAlan4')) updateOldPrice();
        });

        observer.observe(detailArea, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    function init() {
        addStyles();
        updateOldPrice();
        observeDetail();

        window.addEventListener('pageshow', updateOldPrice);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
}());
/* ========================================================================
 * BÖLÜM 14: ÜRÜN YORUMLARI GÖRÜNÜMÜ
 *
 * Ürün detayındaki Ticimax yorum alanını (.commentTicimax) kurumsal kart
 * düzenine taşır: başlık alanı, genel puan kutusu, filtreler, iki sütunlu yorum
 * kartları ve yorum sahibinin baş harfleri. Ticimax yorumları sekme açılınca
 * yüklediği için mevcut DOM ve işlevleri korunur; yalnızca stil ve küçük
 * eklemeler yapılır. "Yorum Yaz" butonu ve uyarı pencereleri Bölüm 10'dadır.
 * ====================================================================== */
(function () {
    'use strict';

    var STYLE_ID = 'ots-site-yorum-style';
    var FONT_ID = 'ots-site-yorum-font';
    var ROOT_CLASS = 'ots-site-yorum';
    var observer = null;
    var scheduled = false;

    var css = `
.ots-site-yorum {
  --ots-yorum-navy: #0c154c;
  --ots-yorum-cyan: #2092b2;
  --ots-yorum-light: #e8f7fb;
  --ots-yorum-line: #d8e8ef;
  --ots-yorum-muted: #63758a;
  box-sizing: border-box;
  position: relative;
  width: 100%;
  margin: 0 auto 36px;
  padding: clamp(22px, 3.5vw, 44px);
  color: var(--ots-yorum-navy);
  background: radial-gradient(circle at 96% 4%, rgba(32,146,178,.12), transparent 35%), linear-gradient(145deg, #f8fcfe 0%, #edf8fc 100%);
  border: 1px solid #e1eef3;
  border-radius: 26px;
  box-shadow: 0 20px 48px rgba(12,21,76,.055);
  font-family: 'Manrope', 'Avenir Next', Helvetica, sans-serif;
}
.ots-site-yorum, .ots-site-yorum * { box-sizing: border-box; }
.ots-site-yorum .commentTiciContainer,
.ots-site-yorum .commentTiciContent,
.ots-site-yorum .commentTiciMiddle { width: 100%; height: auto; min-height: 0; float: none; }
.ots-site-yorum .commentTiciContainer,
.ots-site-yorum .commentTiciContent,
.ots-site-yorum .commentTiciMiddle { display: block; }
.ots-site-yorum .ots-review-intro {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 22px;
  margin: 0 0 25px;
}
.ots-site-yorum .ots-review-eyebrow {
  display: inline-block;
  margin-bottom: 10px;
  color: var(--ots-yorum-cyan);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .17em;
  text-transform: uppercase;
}
.ots-site-yorum .ots-review-intro h2 {
  margin: 0;
  color: var(--ots-yorum-navy);
  font-family: 'Barlow Condensed', 'Arial Narrow', Helvetica, sans-serif;
  font-size: clamp(36px, 4.5vw, 62px);
  font-weight: 800;
  letter-spacing: -.025em;
  line-height: .95;
  text-transform: uppercase;
}
.ots-site-yorum .ots-review-intro h2 em { color: var(--ots-yorum-cyan); font-style: normal; }
.ots-site-yorum .ots-review-intro p {
  max-width: 255px;
  margin: 0 0 3px;
  color: var(--ots-yorum-muted);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.55;
}
.ots-site-yorum .commentTiciTop,
.ots-site-yorum .commentTiciTopDiv { width: 100%; height: auto; display: block; }
.ots-site-yorum .commentTiciGeneralRating {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px 26px;
  width: 100%;
  min-height: 110px;
  margin: 0;
  padding: 19px 26px;
  color: var(--ots-yorum-navy);
  background: radial-gradient(circle at 92% 4%, rgba(117,217,239,.28), transparent 38%), linear-gradient(115deg, #fff 0%, #edf9fc 48%, #dceff7 100%);
  border: 1px solid #cfe7ef;
  border-radius: 17px;
  box-shadow: 0 8px 22px rgba(12,21,76,.055);
}
.ots-site-yorum .commentTiciRating {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px 28px;
  margin: 0;
  padding-right: 32px;
}
.ots-site-yorum .commentTiciRatingStr {
  color: var(--ots-yorum-navy);
  font-family: 'Barlow Condensed', 'Arial Narrow', Helvetica, sans-serif;
  font-size: clamp(54px, 5.5vw, 68px);
  font-weight: 800;
  line-height: .85;
  letter-spacing: -.04em;
}
.ots-site-yorum .commentTiciNumber {
  margin-left: auto;
  padding: 9px 13px;
  color: #38506b;
  background: rgba(255,255,255,.72);
  border: 1px solid rgba(185,220,232,.75);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
}
.ots-site-yorum .commentTiciRatingStars,
.ots-site-yorum .commentTiciItemRating { line-height: 1; }
.ots-site-yorum .commentStars { display: flex; align-items: center; gap: 3px; margin: 0; padding: 0; list-style: none; }
.ots-site-yorum .commentStars li { float: none; margin: 0; padding: 0; }
.ots-site-yorum .commentStars svg { display: block; width: 20px; height: 20px; }
.ots-site-yorum .commentTiciRatingStars .commentStars svg { width: 23px; height: 23px; }
.ots-site-yorum .commentStars svg .full path { fill: #efb931 !important; }
.ots-site-yorum .commentStars svg .empty path { fill: #e1e5e7 !important; }
.ots-site-yorum .commentTiciGeneralRating .commentStars svg .empty path { fill: #d6e1e5 !important; }
.ots-site-yorum .commentTiciFilter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 20px;
  width: 100%;
  height: auto;
  min-height: 0;
  margin: 20px 0 0;
  padding: 0;
  border: 0;
}
.ots-site-yorum .commentTiciFilterButtons,
.ots-site-yorum .commentTiciFilterButtonsRight { display: block; width: auto; height: auto; margin: 0; padding: 0; }
.ots-site-yorum .commentTiciFilterButtonsOrder { position: relative; width: auto; margin: 0; }
.ots-site-yorum .orderFilter {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: auto;
  min-width: 154px;
  min-height: 42px;
  padding: 10px 14px;
  color: var(--ots-yorum-navy);
  background: #fff;
  border: 1px solid var(--ots-yorum-line);
  border-radius: 11px;
  box-shadow: 0 3px 8px rgba(12,21,76,.035);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
  text-decoration: none;
  transition: border-color .2s, box-shadow .2s;
}
.ots-site-yorum .orderFilter:hover,
.ots-site-yorum .orderFilter:focus-visible { border-color: var(--ots-yorum-cyan); box-shadow: 0 0 0 3px rgba(32,146,178,.1); }
.ots-site-yorum .orderFilter svg { width: 13px; height: 13px; flex: none; }
.ots-site-yorum .orderFilter svg path { stroke: currentColor !important; }
.ots-site-yorum .commentTiciFilterOrder {
  position: absolute;
  z-index: 30;
  top: calc(100% + 6px);
  left: 0;
  min-width: 190px;
  margin: 0;
  padding: 6px;
  background: #fff;
  border: 1px solid var(--ots-yorum-line);
  border-radius: 12px;
  box-shadow: 0 14px 28px rgba(12,21,76,.13);
  list-style: none;
}
.ots-site-yorum .commentTiciFilterOrderHide { display: none; }
.ots-site-yorum .commentTiciFilterOrderHide.active { display: block; }
.ots-site-yorum .commentTiciFilterOrder li { margin: 0; padding: 0; }
.ots-site-yorum .commentTiciFilterOrder li a {
  display: block;
  padding: 10px 12px;
  color: var(--ots-yorum-navy);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}
.ots-site-yorum .commentTiciFilterOrder li.active a,
.ots-site-yorum .commentTiciFilterOrder li a:hover { color: var(--ots-yorum-cyan); background: var(--ots-yorum-light); }
.ots-site-yorum .commentTiciFilterStars { flex: 1 1 auto; min-width: 0; width: auto; margin: 0; }
.ots-site-yorum .commentTiciFilterStarsUl {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  width: 100%;
  height: auto;
  margin: 0;
  padding: 0;
  list-style: none;
}
.ots-site-yorum .commentTiciFilterStarsUl > li { float: none; width: auto; margin: 0; padding: 0; }
.ots-site-yorum .commentTiciFilterStarsUl > li > a {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 42px;
  padding: 7px 9px;
  color: var(--ots-yorum-muted);
  background: #fff;
  border: 1px solid var(--ots-yorum-line);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 800;
  text-decoration: none;
  transition: transform .2s, border-color .2s, box-shadow .2s;
}
.ots-site-yorum .commentTiciFilterStarsUl > li > a:hover,
.ots-site-yorum .commentTiciFilterStarsUl > li > a:focus-visible,
.ots-site-yorum .commentTiciFilterStarsUl > li.active > a { transform: translateY(-2px); border-color: var(--ots-yorum-cyan); box-shadow: 0 5px 14px rgba(32,146,178,.12); }
.ots-site-yorum .commentTiciFilterStarsUl .commentStars { gap: 0; }
.ots-site-yorum .commentTiciFilterStarsUl .commentStars svg { width: 13px; height: 13px; }
.ots-site-yorum .commentTiciList {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 16px;
  width: 100%;
  height: auto;
  margin: 22px 0 0;
  padding: 0;
  border: 0;
}
.ots-site-yorum .commentTiciItem {
  display: flex;
  flex-direction: column;
  width: auto !important;
  min-width: 0;
  height: auto;
  min-height: 236px;
  float: none;
  margin: 0;
  padding: 24px 34px 25px 24px !important;
  background: #fff;
  border: 1px solid #dceaf0;
  border-radius: 18px;
  box-shadow: 0 7px 24px rgba(12,21,76,.045);
  transition: transform .22s, box-shadow .22s, border-color .22s;
}
.ots-site-yorum .commentTiciItem:hover { transform: translateY(-3px); border-color: #b9dce8; box-shadow: 0 14px 30px rgba(12,21,76,.085); }
.ots-site-yorum .commentTiciItem > * { max-width: 100%; min-width: 0; }
.ots-site-yorum .commentTiciItemRating { margin: 0 0 12px; }
.ots-site-yorum .commentTiciItemTitle {
  width: 100%;
  margin: 0 0 7px;
  color: var(--ots-yorum-navy);
  font-size: 19px;
  font-weight: 800;
  line-height: 1.35;
}
.ots-site-yorum .commentTiciItemText {
  width: 100%;
  margin: 0 0 20px;
  color: #34425d;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.7;
  overflow-wrap: anywhere;
}
.ots-site-yorum .commentTiciItemExtra { display: block; width: 100%; height: auto; margin-top: auto; }
.ots-site-yorum .commentTiciItemInfo {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px 9px;
  width: 100%;
  height: auto;
  padding: 13px 0;
  border-top: 1px solid #edf2f5;
}
.ots-site-yorum .commentTiciItemInfo[data-ots-initials]::before {
  content: attr(data-ots-initials);
  display: grid;
  place-items: center;
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  margin-right: 2px;
  color: var(--ots-yorum-navy);
  background: var(--ots-yorum-light);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 800;
}
.ots-site-yorum .commentTiciItemInfo .commentInfo {
  float: none;
  width: auto;
  margin: 0;
  padding: 0;
  color: var(--ots-yorum-muted);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.45;
}
.ots-site-yorum .commentTiciItemInfo .commentInfoName { color: var(--ots-yorum-navy); font-weight: 800; }
.ots-site-yorum .commentTiciItemInfo .commentInfoDate { margin-left: auto; }
.ots-site-yorum .commentTiciItemBottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  height: auto;
  margin: 0;
  padding: 0 3px 0 0;
}
.ots-site-yorum .commentTiciItemRecomAndPurc { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; width: auto; height: auto; margin: 0; }
.ots-site-yorum .RecomAndPurc {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: auto;
  min-height: 30px;
  margin: 0;
  padding: 6px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.2;
}
.ots-site-yorum .RecomAndPurc svg { display: none; }
.ots-site-yorum .recommendedBtn {
  color: #0c5871 !important;
  background: linear-gradient(115deg, #d6f5fb, #bcecf7) !important;
  border: 1px solid #8bd2e5 !important;
  box-shadow: 0 2px 7px rgba(32,146,178,.09);
}
.ots-site-yorum .recommendedBtn span { color: inherit !important; }
.ots-site-yorum .recommendedBtn::before { content: '★'; color: #2092b2; font-size: 12px; line-height: 1; }
.ots-site-yorum .purchasedBtn {
  color: #fff !important;
  background: linear-gradient(115deg, #178dab, #0c6689) !important;
  border: 1px solid #0c6689 !important;
  box-shadow: 0 2px 8px rgba(12,102,137,.16);
}
.ots-site-yorum .purchasedBtn span { color: inherit !important; }
.ots-site-yorum .purchasedBtn::before {
  content: '✓';
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  color: #0c6689;
  background: #fff;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
}
.ots-site-yorum .commentTiciItemUseful { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; width: auto; height: auto; margin: 0; }
.ots-site-yorum .commentTiciItemUsefulTitle { width: auto; margin: 0; color: var(--ots-yorum-muted); font-size: 10px; font-weight: 700; }
.ots-site-yorum .commentTiciItemUsefulButtons { display: flex; align-items: center; gap: 5px; width: auto; margin: 0; }
.ots-site-yorum .UsefulButtons {
  display: inline-flex;
  align-items: center;
  min-height: 27px;
  margin: 0;
  padding: 5px 8px;
  color: var(--ots-yorum-navy);
  background: #f7fafb;
  border: 1px solid var(--ots-yorum-line);
  border-radius: 7px;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.2;
  text-decoration: none;
  transition: background .2s, color .2s, border-color .2s;
}
.ots-site-yorum .UsefulButtons:hover,
.ots-site-yorum .UsefulButtons:focus-visible { color: #fff; background: var(--ots-yorum-cyan); border-color: var(--ots-yorum-cyan); }
.ots-site-yorum .commentTiciBottom { width: 100%; height: auto; margin: 20px 0 0; }
.ots-site-yorum a:focus-visible { outline: 2px solid var(--ots-yorum-cyan); outline-offset: 3px; }
@media (max-width: 900px) {
  .ots-site-yorum .commentTiciList { grid-template-columns: 1fr; }
  .ots-site-yorum .commentTiciItem { min-height: 0; }
}
@media (max-width: 620px) {
  .ots-site-yorum { margin-bottom: 24px; padding: 20px 15px; border-radius: 18px; }
  .ots-site-yorum .ots-review-intro { display: block; margin-bottom: 20px; }
  .ots-site-yorum .ots-review-intro p { max-width: none; margin-top: 10px; }
  .ots-site-yorum .commentTiciGeneralRating { gap: 12px; min-height: 0; padding: 19px; border-radius: 14px; }
  .ots-site-yorum .commentTiciRating { gap: 9px 18px; padding-right: 12px; }
  .ots-site-yorum .commentTiciRatingStr { font-size: 58px; }
  .ots-site-yorum .commentTiciNumber { width: auto; max-width: 100%; margin-left: 0; padding: 7px 10px; border-radius: 10px; }
  .ots-site-yorum .commentTiciFilter { display: block; margin-top: 16px; }
  .ots-site-yorum .commentTiciFilterStars { margin-top: 10px; }
  .ots-site-yorum .commentTiciFilterStarsUl { flex-wrap: nowrap; overflow-x: auto; padding: 2px 1px 9px; scrollbar-width: thin; }
  .ots-site-yorum .commentTiciFilterStarsUl > li { flex: none; }
  .ots-site-yorum .commentTiciList { margin-top: 14px; gap: 12px; }
  .ots-site-yorum .commentTiciItem { padding: 18px 22px 20px 18px !important; border-radius: 14px; }
  .ots-site-yorum .commentTiciItemInfo .commentInfoDate { margin-left: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .ots-site-yorum .commentTiciItem,
  .ots-site-yorum .orderFilter,
  .ots-site-yorum .UsefulButtons,
  .ots-site-yorum .commentTiciFilterStarsUl > li > a { transition: none; }
  .ots-site-yorum .commentTiciItem:hover,
  .ots-site-yorum .commentTiciFilterStarsUl > li > a:hover { transform: none; }
}`;

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = css;
        document.head.appendChild(style);
    }

    // Başlık ve puan için kullanılan Barlow Condensed sitede yüklü olmadığından
    // yalnızca yorum alanı bulunan sayfalarda, tek kalınlıkla yüklenir.
    function loadFont() {
        if (document.getElementById(FONT_ID)) return;
        var link = document.createElement('link');
        link.id = FONT_ID;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&display=swap';
        document.head.appendChild(link);
    }

    function addIntro(content) {
        if (content.querySelector('.ots-review-intro')) return;
        var intro = document.createElement('div');
        intro.className = 'ots-review-intro';
        intro.innerHTML = '<div><span class="ots-review-eyebrow">ÖTS müşteri deneyimi</span><h2>Gerçek yorumlar,<br><em>gerçek konfor.</em></h2></div><p>Bu ürünü deneyimleyenlerin görüşlerine göz atın.</p>';
        content.insertBefore(intro, content.firstChild);
    }

    function decorate(root) {
        if (!root.classList.contains(ROOT_CLASS)) root.classList.add(ROOT_CLASS);
        var content = root.querySelector('.commentTiciContent');
        if (content) addIntro(content);

        // Yorum sahibinin baş harfleri CSS ile avatar olarak gösterilir.
        root.querySelectorAll('.commentTiciItemInfo').forEach(function (info) {
            var name = info.querySelector('.commentInfoName');
            if (!name) return;
            var words = name.textContent.trim().split(/\s+/).filter(Boolean);
            var initials = words.slice(0, 2).map(function (word) { return word.charAt(0); }).join('').toLocaleUpperCase('tr-TR');
            if (initials && info.getAttribute('data-ots-initials') !== initials) info.setAttribute('data-ots-initials', initials);
        });

        root.querySelectorAll('.commentTiciFilterStarsUl > li').forEach(function (item) {
            var match = item.className.match(/filterStars([1-5])/);
            var link = item.querySelector('a');
            var label = match && match[1] + ' yıldızlı yorumları göster';
            if (link && label && link.getAttribute('aria-label') !== label) link.setAttribute('aria-label', label);
        });
    }

    function run() {
        scheduled = false;
        document.querySelectorAll('.commentTicimax').forEach(decorate);
    }

    function schedule() {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(run);
    }

    function init() {
        var host = document.getElementById('divTabYorumlar') || document.querySelector('.commentTicimax');
        if (!host || window.__otsSiteYorumReady) return;
        window.__otsSiteYorumReady = true;

        injectStyle();
        loadFont();
        schedule();

        // Yorumlar sekme açılınca ve sayfalama/filtrede yeniden yüklendiğinde tekrar düzenlenir.
        observer = new MutationObserver(schedule);
        observer.observe(host, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
    // Yorum alanı geç oluşturulursa sayfa yüklendiğinde bir kez daha denenir.
    window.addEventListener('load', init, { once: true });
}());
