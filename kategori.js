/*
 * ÖTS İÇ GİYİM - KATEGORİ SAYFASI MODÜLLERİ
 *
 * Yükleme adresi : https://ornekler.com.tr/js/ots/kategori.js
 * Çalıştığı yer  : Kategori ve ürün listeleme sayfaları
 *
 * Kategori sayfasındaki sıralama, listeleme/filtre arayüzü, vitrin satırları ve
 * kart varyant görsellerini tek dosyada toplar. Her bölüm kendi kapsamında (IIFE)
 * bağımsız çalışır.
 *
 * Bölümler:
 *  1. Çok satanlar sıralaması
 *  2. Ürün listeleme ve filtre arayüzü
 *  3. Showtime vitrin satırları
 *  4. Ürün kartlarında varyant görselleri
 */

/* ========================================================================
 * BÖLÜM 1: ÇOK SATANLAR SIRALAMASI
 *
 * Kategori verisini satış adedine göre arka planda sıralar.
 * Sayfanın adresini değiştirmeden ürün listesini ve sayfalamayı günceller.
 * ====================================================================== */
(function () {
    'use strict';

    if (window.__otsBestSellerSortLoaded) return;
    window.__otsBestSellerSortLoaded = true;

    function loadBestSellers() {
        // Bu dosya kategori dışında yüklense bile ağ isteği yapma.
        if (!document.querySelector('#ProductPageProductList')) return;

        var requestUrl = new URL(window.location.href);
        if (requestUrl.searchParams.get('sira') === 'satis-adedi|azalan') return;
        requestUrl.searchParams.set('sira', 'satis-adedi|azalan');

        // Mevcut filtre, sayfa ve kategori parametreleri korunur; adres çubuğu değişmez.
        fetch(requestUrl.pathname + requestUrl.search, {
            credentials: 'same-origin',
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(function (response) {
                if (!response.ok) throw new Error('HTTP Hatası: ' + response.status);
                return response.text();
            })
            .then(function (html) {
                var doc = new DOMParser().parseFromString(html, 'text/html');
                var newProductList = doc.querySelector('#ProductPageProductList');
                var currentProductList = document.querySelector('#ProductPageProductList');

                if (!newProductList || !currentProductList) return;

                currentProductList.innerHTML = newProductList.innerHTML;

                var newPagination = doc.querySelector('#divSayfalamaAlt');
                var currentPagination = document.querySelector('#divSayfalamaAlt');
                if (newPagination && currentPagination) currentPagination.innerHTML = newPagination.innerHTML;

                // Liste kartları değiştiği anda erişilebilirlik ve sepete ekle bağları yenilenir.
                if (typeof window.otsProductListingInit === 'function') window.otsProductListingInit();
            })
            .catch(function (error) {
                // Ağ hatası, mevcut kategori listesini değiştirmez.
                if (window.console && typeof window.console.warn === 'function') {
                    window.console.warn('Çok satanlar sıralaması yüklenemedi:', error);
                }
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadBestSellers, { once: true });
    } else {
        loadBestSellers();
    }

})();

/* ========================================================================
 * BÖLÜM 2: ÜRÜN LİSTELEME VE FİLTRE ARAYÜZÜ
 *
 * Kategori filtrelerini, ürün kartlarını, fiyat/adet bilgisini ve sayfalamayı düzenler.
 * Renk ve beden seçimli sepete ekleme akışını masaüstü ve mobil görünümde yönetir.
 * ====================================================================== */
(function () {
    'use strict';
    // Filtreleme, sıralama ve mobil filtre paneli Ticimax tarafından yönetilir.
    if (window.otsProductListingInit) { window.otsProductListingInit(); return; }
    var STYLE_ID = 'otsProductListingStyles';
    var pending = false;
    var variantRequest = null;
    var activeVariantDialog = null;
    var listingProducts = Object.create(null);
    var successTimer = null;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
body.ots-listing-ui .filterBlock { font-family:inherit; color:#0c154c; }
body.ots-listing-ui .productItem .ots-variant-dialog .ots-variant-boxes { display:flex!important; flex-wrap:wrap; gap:8px; margin:0 0 18px!important; }
body.ots-listing-ui .ots-variant-step-title { flex:0 0 100%; margin:0 0 3px; color:#0c154c; font-family:inherit; font-size:13px; font-weight:650; line-height:1.5; }
body.ots-listing-ui .productItem .ots-variant-dialog .ots-variant-box { box-sizing:border-box; display:inline-flex!important; align-items:center; justify-content:center; width:auto!important; min-width:52px!important; min-height:44px!important; height:auto!important; padding:10px 14px!important; margin:0!important; border:1px solid #d3ddea!important; border-radius:8px!important; background:#fff!important; color:#0c154c!important; font-family:inherit; font-size:13px!important; line-height:1.4!important; cursor:pointer; }
body.ots-listing-ui .productItem .ots-variant-dialog .ots-variant-box.selected { background:#0c154c!important; color:#fff!important; border-color:#0c154c!important; outline:none!important; }
body.ots-listing-ui .productItem .ots-variant-dialog .ots-variant-box:disabled { opacity:.45; text-decoration:line-through; cursor:not-allowed; }

body.ots-listing-ui .productItem .examineIcon { display:none!important; }
body.ots-listing-ui .productItem .favori,body.ots-listing-ui .productItem .ots-card-favorite { display:none!important; }
body.ots-listing-ui .productItem .productStokKodu { color:#7b8598; font-size:11px; line-height:1.5; }
body.ots-listing-ui dialog.ots-cart-success { box-sizing:border-box; position:fixed; inset:0; width:calc(100% - 40px); max-width:360px; height:fit-content; margin:auto; padding:30px 24px; border:1px solid #e0e8ee; border-radius:20px; background:white; color:#0c154c; text-align:center; font-family:inherit; box-shadow:0 24px 80px rgba(12,21,48,.18); z-index:100000; }
body.ots-listing-ui dialog.ots-cart-success:not([open]) { display:none; }
body.ots-listing-ui .ots-cart-success::backdrop { background:rgba(12,21,48,.38); backdrop-filter:blur(3px); }
body.ots-listing-ui .ots-cart-success .ots-success-icon { display:flex; align-items:center; justify-content:center; width:64px; height:64px; margin:0 auto 18px; border-radius:50%; background:#eaf6f0; color:#287753; }
body.ots-listing-ui .ots-cart-success svg { width:30px; height:30px; }
body.ots-listing-ui .ots-cart-success h2 { margin:0 0 10px; font-size:21px; line-height:1.3; color:#0c154c; }
body.ots-listing-ui .ots-cart-success p { margin:0; color:#727d91; font-size:13px; line-height:1.6; }
body.ots-listing-ui .ots-cart-success .ots-success-actions { display:grid; gap:8px; margin:20px 0 0; }
body.ots-listing-ui .ots-cart-success .ots-success-cart { box-sizing:border-box; display:flex; align-items:center; justify-content:center; gap:8px; width:100%; min-height:46px; margin:0; padding:12px 16px; border:1px solid #0c154c; border-radius:9px; background:#0c154c; color:#fff; font-family:inherit; font-size:13px; font-weight:750; line-height:1.3; text-decoration:none; cursor:pointer; transition:background .18s ease; }
body.ots-listing-ui .ots-cart-success .ots-success-cart:hover { background:#1a2357; color:#fff; }
body.ots-listing-ui .ots-cart-success .ots-success-cart svg { width:18px; height:18px; }
body.ots-listing-ui .ots-cart-success .ots-success-continue { margin:0; padding:8px; border:0; background:transparent; color:#727d91; font-family:inherit; font-size:12px; font-weight:700; cursor:pointer; }
body.ots-listing-ui .ots-cart-success .ots-success-continue:hover { color:#0c154c; }
body.ots-listing-ui .ots-cart-success a:focus-visible, body.ots-listing-ui .ots-cart-success button:focus-visible { outline:3px solid rgba(76,135,196,.35); outline-offset:2px; }
body.ots-listing-ui dialog.ots-variant-dialog { box-sizing:border-box; position:fixed!important; inset:0!important; width:calc(100% - 32px)!important; max-width:440px!important; max-height:calc(100vh - 40px); max-height:calc(100dvh - 40px); height:fit-content!important; margin:auto!important; padding:26px!important; border:1px solid #dfe7ef!important; border-radius:18px!important; background:#fff!important; color:#0c154c; box-shadow:0 24px 90px rgba(12,21,48,.2); overflow:auto; text-align:left; font-family:inherit; }
body.ots-listing-ui dialog.ots-variant-dialog:not([open]) { display:none!important; }
body.ots-listing-ui dialog.ots-variant-dialog::backdrop { background:rgba(12,21,48,.5); backdrop-filter:blur(4px); }
body.ots-listing-ui .ots-variant-dialog h2 { margin:0 38px 10px 0; font-size:21px; font-weight:700; line-height:1.3; color:#0c154c; }
body.ots-listing-ui .ots-variant-dialog .ots-variant-product { margin:0 0 8px; color:#58627a; font-size:13px; line-height:1.5; }
body.ots-listing-ui .ots-variant-dialog .ots-variant-help { margin:0 0 18px; color:#7c8799; font-size:12px; line-height:1.5; }
body.ots-listing-ui .ots-variant-dialog .ots-variant-close { position:absolute; right:12px; top:12px; display:flex; align-items:center; justify-content:center; width:36px; height:36px; padding:0; border:0; border-radius:50%; background:#f2f5f9; color:#536078; font-size:23px; cursor:pointer; }
body.ots-listing-ui .productItem .ots-variant-dialog .productItemVariantDetail { width:100%!important; margin:0!important; padding:14px!important; }
body.ots-listing-ui .ots-variant-dialog .ots-variant-loading { margin:14px 0; color:#58627a; font-size:13px; }
body.ots-listing-ui .ots-variant-dialog a:focus-visible,body.ots-listing-ui .ots-variant-dialog button:focus-visible,body.ots-listing-ui .ots-variant-dialog select:focus-visible { outline:2px solid #4b9bb7!important; outline-offset:2px; }
html.ots-variant-modal-open { overflow:hidden!important; }
@media(max-width:480px) { body.ots-listing-ui dialog.ots-variant-dialog { padding:22px 18px!important; } }

body.ots-listing-ui .productItem .productName { height:auto!important; min-height:2.9em; max-height:none!important; white-space:normal!important; overflow:hidden; }
body.ots-listing-ui .productItem .productName > a { display:-webkit-box!important; -webkit-box-orient:vertical; -webkit-line-clamp:2; line-clamp:2; height:auto!important; min-height:2.9em; max-height:2.9em; line-height:1.45!important; white-space:normal!important; overflow:hidden!important; text-overflow:ellipsis; overflow-wrap:anywhere; }
body.ots-listing-ui .productItem .discountPriceSpan { white-space:nowrap; }
body.ots-listing-ui .productItem > .ots-listing-cart { display:block!important; position:static!important; float:none!important; clear:both; width:100%!important; height:auto!important; padding:8px 10px 12px!important; margin:0!important; opacity:1!important; visibility:visible!important; transform:none!important; }
body.ots-listing-ui .productItem > .ots-listing-cart > a { display:flex!important; align-items:center; justify-content:center; position:static!important; float:none!important; width:100%!important; min-height:44px; height:auto!important; margin:0!important; padding:11px 8px!important; border:1px solid #0c154c!important; border-radius:8px!important; background:#0c154c!important; color:#fff!important; font-family:inherit; font-size:13px!important; font-weight:600; line-height:1.4!important; cursor:pointer; text-decoration:none; }
body.ots-listing-ui .productItem > .ots-listing-cart > a::after,body.ots-listing-ui .productItem > .ots-listing-cart > a::before { content:none!important; display:none!important; }
body.ots-listing-ui .productItem > .ots-listing-cart > a > span { display:inline!important; color:inherit!important; font:inherit!important; }
body.ots-listing-ui .productItem > .ots-listing-cart > a:hover { background:#202d66!important; }
body.ots-listing-ui .productItem > .ots-listing-cart > a:focus-visible { outline:2px solid #4b9bb7; outline-offset:2px; }
body.ots-listing-ui .productItem.StokYok > .ots-listing-cart { display:none!important; }
body.ots-listing-ui .productItem .productItemVariantDetail { position:relative!important; inset:auto!important; float:none!important; clear:both; width:calc(100% - 20px)!important; height:auto!important; max-height:none!important; margin:0 10px 12px!important; padding:12px!important; border:1px solid #dce5ef; border-radius:10px; background:#f5f8fc!important; box-shadow:none!important; }
body.ots-listing-ui .productItem .productItemVariantDetail:not(.active) { display:none!important; }
body.ots-listing-ui .productItem .productItemVariantDetail .ekSecenek { width:100%!important; float:none!important; margin:0 0 10px!important; }
body.ots-listing-ui .productItem .productItemVariantDetail .ekSecenekValues { box-sizing:border-box; min-width:36px; min-height:40px; margin:3px!important; border-radius:6px!important; font-family:inherit; font-size:12px!important; }
body.ots-listing-ui .productItem .productItemVariantDetail .ekSecenekValues.selected { outline:2px solid #0c154c; outline-offset:1px; }
body.ots-listing-ui .productItem .productItemVariantDetail .noStock { opacity:.4; cursor:not-allowed; }
body.ots-listing-ui .productItem .productItemVariantDetail select { width:100%!important; min-height:44px; border:1px solid #dce3ed; border-radius:7px; font-size:16px!important; }
body.ots-listing-ui .productItem .productItemVariantDetail .btnVaryasyonSepeteEkle { min-height:44px; border-radius:7px; background:#0c154c!important; color:#fff!important; }

body.ots-listing-ui .filterBlock *,body.ots-listing-ui .sortingContent * { box-sizing:border-box; }
body.ots-listing-ui #divLeftBlock .filterBlock { background:#fff; border:1px solid #e0e6ee; border-radius:14px; padding:18px; }
body.ots-listing-ui #divLeftBlock .filterBlock .Block_Title { display:block!important; padding:0 0 17px!important; margin:0 0 4px!important; border-bottom:1px solid #edf0f5; color:#0c154c!important; font-size:17px!important; font-weight:700; line-height:1.4; text-align:left; }
body.ots-listing-ui #divLeftBlock .filterBlock .Block_Title span { color:inherit!important; font:inherit!important; }
body.ots-listing-ui #divLeftBlock .category-vertical-filters { margin:0!important; background:transparent!important; text-align:left; }
body.ots-listing-ui #divLeftBlock .category-vertical-filters > .panel { margin:0!important; padding:10px 0!important; border:0!important; border-bottom:1px solid #edf0f5!important; border-radius:0!important; box-shadow:none!important; }
body.ots-listing-ui #divLeftBlock .category-vertical-filters > .panel:last-child { border-bottom:0!important; padding-bottom:0!important; }
body.ots-listing-ui .category-vertical-filters .panel-heading { background:transparent!important; border:0!important; box-shadow:none!important; }
body.ots-listing-ui .category-vertical-filters .panel-heading .panel-title { font-family:inherit; color:#0c154c!important; font-size:13px!important; font-weight:650!important; text-transform:none!important; letter-spacing:0!important; text-decoration:none!important; }
body.ots-listing-ui #divLeftBlock .panel-heading { min-height:0!important; margin:0!important; padding:0 0 3px!important; }
body.ots-listing-ui #divLeftBlock .panel-heading .panel-title { display:block; min-height:6px; line-height:6px!important; margin-top:4px; }
body.ots-listing-ui #divLeftBlock .category-vertical-filters .list-group { margin:0!important; padding:0!important; }
body.ots-listing-ui .category-vertical-filters .liFiltreElement { box-sizing:border-box; position:relative; float:none!important; width:100%!important; min-height:40px; height:auto!important; padding:0!important; margin:2px 0!important; border:0!important; border-radius:7px!important; background-color:transparent!important; }
body.ots-listing-ui .category-vertical-filters .liFiltreElement > a { display:flex!important; align-items:center; gap:6px; float:none!important; width:100%!important; max-width:none!important; min-height:40px; padding:9px 8px 9px 30px!important; margin:0!important; color:#536078!important; font-family:inherit; font-size:12px!important; font-weight:500; line-height:1.5!important; white-space:normal!important; overflow-wrap:anywhere; text-decoration:none!important; }
body.ots-listing-ui .category-vertical-filters .liFiltreElement:not(.list-group-item-image)::before { content:''!important; box-sizing:border-box; position:absolute!important; left:7px!important; top:12px!important; width:15px!important; height:15px!important; margin:0!important; border:1px solid #c4cedb!important; border-radius:4px!important; background:#fff!important; pointer-events:none; }
body.ots-listing-ui .category-vertical-filters .liFiltreElement:not(.list-group-item-image).selected::before { content:'✓'!important; color:#fff!important; border-color:#0c154c!important; background:#0c154c!important; font-family:inherit!important; font-size:11px!important; font-weight:700!important; line-height:13px!important; text-align:center; }
body.ots-listing-ui .category-vertical-filters .liFiltreElement.selected { background-color:#eef5fa!important; }
body.ots-listing-ui .category-vertical-filters .liFiltreElement.selected > a { color:#0c154c!important; font-weight:600; }
body.ots-listing-ui .category-vertical-filters .filterProductCount { margin-left:auto; color:#8b95a5; font-size:11px; white-space:nowrap; }
body.ots-listing-ui .category-vertical-filters .list-group-item-image { background-position:7px 12px!important; background-size:15px 15px!important; background-repeat:no-repeat!important; }
body.ots-listing-ui .category-vertical-filters .list-group-item-image.selected a { outline:1px solid #9aaac0; outline-offset:-1px; border-radius:7px; }
body.ots-listing-ui .category-vertical-filters .FiyatTextBox { box-sizing:border-box; width:100%; margin:0!important; padding:0!important; gap:8px; }
body.ots-listing-ui .category-vertical-filters .FiyatTextBox input { box-sizing:border-box; float:none!important; display:inline-block; width:calc(50% - 6px)!important; max-width:100%; height:42px!important; min-width:0; padding:10px!important; margin:0 0 8px!important; border:1px solid #dce3ed!important; border-radius:8px!important; background:#f8fafc!important; color:#0c154c!important; font-family:inherit; font-size:13px!important; line-height:1.4!important; box-shadow:none!important; }
body.ots-listing-ui .category-vertical-filters .FiyatTextBox input:first-child { margin-right:6px!important; }
body.ots-listing-ui .category-vertical-filters .FiyatTextBox button { float:none!important; width:100%!important; min-height:40px; padding:10px!important; margin:0!important; border:1px solid #0c154c!important; border-radius:8px!important; background:#0c154c!important; color:#fff!important; font-family:inherit; font-size:12px!important; font-weight:600; line-height:1.4!important; cursor:pointer; }
body.ots-listing-ui .category-vertical-filters .panel-search { padding:8px 0!important; }
body.ots-listing-ui .category-vertical-filters .panel-search input { box-sizing:border-box; width:100%!important; min-height:42px; padding:10px 12px!important; border:1px solid #dce3ed!important; border-radius:8px!important; color:#0c154c; background:#f8fafc!important; font-family:inherit; font-size:13px; }
body.ots-listing-ui .category-vertical-filters .slider-range { border:0!important; background:#e0e6ee!important; border-radius:4px; }
body.ots-listing-ui .category-vertical-filters .ui-slider-range { background:#0c154c!important; }
body.ots-listing-ui .category-vertical-filters .ui-slider-handle { border:2px solid #fff!important; border-radius:50%!important; background:#0c154c!important; box-shadow:0 1px 6px #a7b4c6; }
body.ots-listing-ui .category-vertical-filters .amount { color:#0c154c!important; font-size:13px!important; }
body.ots-listing-ui .sortingContent { border-color:#e0e6ee!important; background:#fff!important; border-radius:10px; }
body.ots-listing-ui .sortingContent .sortingButton a,body.ots-listing-ui #filterOrderSelect { box-sizing:border-box; min-height:40px; padding:10px 12px!important; border:1px solid #e0e6ee!important; border-radius:8px!important; background:#fff!important; color:#536078!important; font-family:inherit; font-size:12px!important; line-height:1.5!important; }
body.ots-listing-ui .sortingContent .sortingButton a.selected { background:#0c154c!important; border-color:#0c154c!important; color:#fff!important; }
body.ots-listing-ui .appliedFilter a { border-color:#dce5ee!important; border-radius:7px!important; background:#eff5fa!important; color:#0c154c!important; font-size:12px!important; }
body.ots-listing-ui .filterBlock a:focus-visible,body.ots-listing-ui .filterBlock button:focus-visible,body.ots-listing-ui .filterBlock input:focus-visible,body.ots-listing-ui .sortingContent a:focus-visible,body.ots-listing-ui #filterOrderSelect:focus-visible { outline:2px solid #4b9bb7!important; outline-offset:2px; }

body.ots-listing-ui .productItem .productImage { position:relative!important; z-index:1; }
body.ots-listing-ui .productItem .productImage > a { display:block!important; position:relative!important; z-index:2; pointer-events:auto!important; cursor:pointer; }
body.ots-listing-ui .pageNumber.pageNumberBottom { display:flex!important; justify-content:center; clear:both; width:100%!important; margin:34px 0 18px!important; padding:0 12px!important; }
body.ots-listing-ui .pageNumber.pageNumberBottom .pageBorder { display:flex!important; align-items:center; justify-content:center; flex-wrap:wrap; gap:7px; width:auto!important; margin:0 auto!important; padding:7px!important; border:1px solid #e0e6ee!important; border-radius:12px!important; background:#fff!important; box-shadow:0 8px 26px rgba(12,21,48,.06); }
body.ots-listing-ui .pageNumber.pageNumberBottom .pageBorder > a { box-sizing:border-box; display:inline-flex!important; align-items:center; justify-content:center; float:none!important; min-width:40px!important; width:40px!important; height:40px!important; margin:0!important; padding:0!important; border:1px solid transparent!important; border-radius:8px!important; background:transparent!important; color:#536078!important; font-family:inherit; font-size:13px!important; font-weight:600; line-height:1!important; text-decoration:none!important; transition:background .16s,color .16s,border-color .16s; }
body.ots-listing-ui .pageNumber.pageNumberBottom .pageBorder > a:hover { border-color:#dce5ee!important; background:#eff5fa!important; color:#0c154c!important; }
body.ots-listing-ui .pageNumber.pageNumberBottom .pageBorder > a.SelectedSayfa { border-color:#0c154c!important; background:#0c154c!important; color:#fff!important; cursor:default; }
body.ots-listing-ui .pageNumber.pageNumberBottom .pageBorder > a.butonDisabled:not(.SelectedSayfa) { opacity:.48; pointer-events:none; }
body.ots-listing-ui .pageNumber.pageNumberBottom .pageBorder > a:focus-visible { outline:2px solid #4b9bb7!important; outline-offset:2px; }
@media(hover:hover) {
 body.ots-listing-ui .category-vertical-filters .liFiltreElement:hover { background-color:#f3f7fb!important; }
 body.ots-listing-ui .category-vertical-filters .liFiltreElement:hover > a { color:#0c154c!important; }
}
@media(min-width:992px) {
 body.ots-listing-ui #ProductPageProductList:not(.pr_hrz) > .ItemOrj:not(.NextProduct) { float:left!important; width:33.333333%!important; }
}
@media(min-width:1042px) {
 body.ots-listing-ui #divSayfalamaUst .top-filters .panel { margin-right:9px!important; }
 body.ots-listing-ui #divSayfalamaUst .top-filters .panel-heading { border:1px solid #dce3ed!important; border-radius:8px!important; background:#fff!important; }
 body.ots-listing-ui #divSayfalamaUst .top-filters .panel-heading a { min-height:42px; line-height:42px!important; padding:0 14px!important; }
 body.ots-listing-ui #divSayfalamaUst .top-filters .list-group.dropdown,body.ots-listing-ui #divSayfalamaUst .top-filters .FiyatTextBox.dropdown { box-sizing:border-box; min-width:240px; max-height:360px; overflow-y:auto; padding:10px!important; margin-top:7px; border:1px solid #e0e6ee!important; border-radius:10px!important; background:#fff!important; box-shadow:0 14px 36px rgba(12,21,48,.12)!important; }
}
@media(max-width:1041px) {
 body.ots-listing-ui .mobilFilterOpenBtn { gap:10px; padding:4px 0 12px!important; }
 body.ots-listing-ui .mobilFilterOpenBtn .button { box-sizing:border-box; width:calc(50% - 5px)!important; min-height:46px; line-height:46px!important; border:1px solid #dce3ed!important; border-radius:9px!important; background:#fff!important; color:#0c154c!important; font-family:inherit; font-size:13px!important; font-weight:600!important; }
 body.ots-listing-ui .mobilFilterOpenBtn .mobilFilterBtn { background:#0c154c!important; border-color:#0c154c!important; color:#fff!important; }
 body.ots-listing-ui #divSayfalamaUst .category-vertical-filters.top-filters { box-sizing:border-box!important; width:min(390px,92vw)!important; max-width:100vw; height:100vh!important; height:100dvh!important; max-height:none!important; bottom:0!important; padding:0 0 calc(20px + env(safe-area-inset-bottom,0px))!important; background:#f7f9fc!important; border:0!important; border-radius:16px 0 0 16px!important; overscroll-behavior:contain; -webkit-overflow-scrolling:touch; scrollbar-width:thin; }
 body.ots-listing-ui #divSayfalamaUst .filterBlock.active .top-filters { box-shadow:-12px 0 48px rgba(12,21,48,.18)!important; }
 body.ots-listing-ui #divSayfalamaUst .top-filters .FiltreUst { box-sizing:border-box; position:sticky!important; top:var(--ots-header-height, 0px)!important; z-index:3; float:none!important; width:100%!important; min-height:64px; margin:0 0 14px!important; padding:8px 14px!important; border-bottom:1px solid #e3e9f1; background:#fff!important; color:#0c154c!important; font-size:16px!important; font-weight:650; line-height:48px!important; }
 body.ots-listing-ui #divSayfalamaUst .top-filters .FiltreUst > span { color:inherit!important; line-height:64px!important; pointer-events:none; }
 body.ots-listing-ui #divSayfalamaUst .top-filters .FiltreUst .closeFilt { box-sizing:border-box; display:inline-flex; align-items:center; justify-content:center; min-width:44px; min-height:44px; color:#0c154c!important; border-radius:8px; background:#f2f5f9; line-height:44px!important; }
 body.ots-listing-ui #divSayfalamaUst .top-filters .FiltreUst a,body.ots-listing-ui #divSayfalamaUst .top-filters .FiltreUst a i { color:#0c154c!important; }
 body.ots-listing-ui #divSayfalamaUst .top-filters .panel { box-sizing:border-box; margin:0 12px 7px!important; padding:0 12px!important; width:calc(100% - 24px)!important; border:1px solid #e2e8f0!important; border-radius:10px!important; background:#fff!important; box-shadow:none!important; }
 body.ots-listing-ui #divSayfalamaUst .top-filters .panel-heading { border:0!important; border-radius:9px; }
 body.ots-listing-ui #divSayfalamaUst .top-filters .panel-heading a { padding:0!important; min-height:44px; line-height:44px!important; }
 body.ots-listing-ui #divSayfalamaUst .top-filters .list-group.dropdown { box-sizing:border-box; width:100%!important; max-width:100%; padding:0 0 5px!important; margin:0!important; border:0!important; background:transparent!important; box-shadow:none!important; }
 body.ots-listing-ui .category-vertical-filters .liFiltreElement,body.ots-listing-ui .category-vertical-filters .liFiltreElement > a { min-height:44px; }
 body.ots-listing-ui .category-vertical-filters .liFiltreElement:not(.list-group-item-image)::before { top:14px!important; }
 body.ots-listing-ui .category-vertical-filters .FiyatTextBox input,body.ots-listing-ui .category-vertical-filters .panel-search input { font-size:16px!important; min-height:44px; }
 body.ots-listing-ui #divSayfalamaUst .top-filters .FiyatTextBox { padding-bottom:10px!important; }
 body.ots-listing-ui #divSayfalamaUst .top-filters .tukgo .filterOrderInStock { box-sizing:border-box; border:1px solid #e2e8f0; border-radius:10px; background:#fff!important; color:#0c154c!important; }
 body.ots-listing-ui #divSayfalamaUst .top-filters .tukgo .filterOrderInStock.selected::after { background:#0c154c!important; }
 body.ots-listing-ui #filterOrderSelect { max-width:100%; min-height:44px; font-size:16px!important; }
}
@media(prefers-reduced-motion:reduce) { body.ots-listing-ui .category-vertical-filters.top-filters { transition:none!important; } }
`;
        document.head.appendChild(style);
    }

    function prepareProductCodes() {
        document.querySelectorAll('.categoryContainer .productItem .productStokKodu').forEach(function (holder) {
            var target = holder.querySelector('span') || holder;
            var code = target.textContent.replace(/^\s*Ürün Kodu\s*:\s*/i, '').trim().split('-')[0].trim();
            var text = code ? 'Ürün Kodu : ' + code : '';
            if (target.textContent !== text) target.textContent = text;
        });
    }


    function showCartSuccess(productName) {
        if (activeVariantDialog && activeVariantDialog.dialog.open) activeVariantDialog.dialog.close();
        var modal = document.getElementById('otsListingCartSuccess');
        if (!modal) {
            modal = document.createElement('dialog');
            modal.id = 'otsListingCartSuccess';
            modal.className = 'ots-cart-success';
            modal.setAttribute('aria-labelledby', 'otsListingCartSuccessTitle');
            modal.innerHTML = '<div class="ots-success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg></div><h2 id="otsListingCartSuccessTitle">Ürün sepetinize eklendi</h2><p></p>' +
                '<div class="ots-success-actions">' +
                '<a class="ots-success-cart" href="/checkout"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L20.5 8H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/></svg><span>Sepete Git</span></a>' +
                '<button class="ots-success-continue" type="button">Alışverişe Devam Et</button>' +
                '</div>';
            document.body.appendChild(modal);

            modal.querySelector('.ots-success-continue').addEventListener('click', function () {
                closeCartSuccess(modal);
            });
            // Arka plana tıklayınca kapanır.
            modal.addEventListener('click', function (event) {
                if (event.target === modal) closeCartSuccess(modal);
            });
            // Fare modal üzerindeyken otomatik kapanma bekletilir.
            modal.addEventListener('mouseenter', function () { window.clearTimeout(successTimer); });
            modal.addEventListener('mouseleave', function () { scheduleCartSuccessClose(modal); });
        }
        modal.querySelector('p').textContent = productName || 'Alışverişinize devam edebilirsiniz.';
        window.clearTimeout(successTimer);
        if (!modal.open) {
            if (typeof modal.showModal === 'function') modal.showModal();
            else modal.setAttribute('open', '');
        }
        scheduleCartSuccessClose(modal);
    }

    // "Sepete Git" butonuna ulaşmaya yetecek süre; fare üzerindeyken sayılmaz.
    var CART_SUCCESS_VISIBLE_MS = 6000;

    function closeCartSuccess(modal) {
        window.clearTimeout(successTimer);
        if (typeof modal.close === 'function') modal.close();
        else modal.removeAttribute('open');
    }

    function scheduleCartSuccessClose(modal) {
        window.clearTimeout(successTimer);
        successTimer = window.setTimeout(function () {
            if (modal.open) closeCartSuccess(modal);
        }, CART_SUCCESS_VISIBLE_MS);
    }

    function installSuccessNotice() {
        var add = window.cart && window.cart.add;
        if (!add || typeof add.diagram !== 'function' || add.diagram.otsListingNotice) return;
        var original = add.diagram;
        // Ticimax bu fonksiyonu sepete ekleme başarılı olduğunda çağırır.
        // Kategori kartlarından gelen başarılı yanıtta yalnızca bildirim değiştirilir.
        var wrapped = function (response) {
            var unique = add.model && add.model.productUnique;
            if (response && response.isError === false && Object.prototype.hasOwnProperty.call(listingProducts, unique)) {
                showCartSuccess(listingProducts[unique]);
                return;
            }
            return original.apply(this, arguments);
        };
        wrapped.otsListingNotice = true;
        add.diagram = wrapped;
    }

    function removeFollowingVariantSteps(group) {
        var next = group.nextElementSibling;
        while (next) {
            var following = next.nextElementSibling;
            next.remove();
            next = following;
        }
    }

    function renderVariantBoxes(values) {
        if (!activeVariantDialog || !Array.isArray(values) || !values.length) return;
        var panel = activeVariantDialog.panel;
        var lastStep = values.every(function (value) { return !value.subVariantValues || !value.subVariantValues.length; });
        var step = panel.querySelectorAll('.ekSecenek').length + 1;
        var group = document.createElement('div');
        group.className = 'ekSecenek ots-variant-boxes' + (lastStep ? ' sonSecenek' : '');
        var title = document.createElement('p');
        title.className = 'ots-variant-step-title';
        title.textContent = step + '. ' + (lastStep ? 'Beden seçin' : 'Renk seçin');
        group.setAttribute('role', 'group');
        group.setAttribute('aria-label', title.textContent);
        group.appendChild(title);
        values.forEach(function (value) {
            var button = document.createElement('button');
            button.type = 'button';
            var unavailable = Number(value.stockAmount) === 0;
            button.className = 'ekSecenekValues ots-variant-box' + (unavailable ? ' noStock' : '');
            button.disabled = unavailable;
            button.textContent = value.name;
            button.setAttribute('data-varintid', String(value.variantId || 0));
            button.setAttribute('data-stockAmount', String(value.stockAmount));
            button.setAttribute('aria-pressed', 'false');
            if (unavailable) button.title = 'Stokta yok';
            button.addEventListener('click', function () {
                if (button.disabled) return;
                removeFollowingVariantSteps(group);
                group.querySelectorAll('.ots-variant-box').forEach(function (item) {
                    item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
                });
                // Renk değiştiğinde Ticimax, sonraki beden seçeneklerini yeniden oluşturur.
                activeVariantDialog.module.setVariant(button, value.rootVariantTypeValueId, value.variantTypeValueId);
            });
            group.appendChild(button);
        });
        panel.appendChild(group);
        panel.style.display = 'block';
    }

    function startVariantSelection(module, panel, link) {
        if (!module.render.otsVariantBoxes) {
            var original = module.render;
            var wrapped = function (values) {
                if (activeVariantDialog && activeVariantDialog.panel.id === 'productListVariantDetail' + module.params.unique) {
                    renderVariantBoxes(values);
                    return;
                }
                return original.apply(this, arguments);
            };
            wrapped.otsVariantBoxes = true;
            module.render = wrapped;
        }
        // İlk seçenek kullanıcı tarafından seçilene kadar otomatik seçim yapılmaz.
        panel.replaceChildren();
        panel.classList.add('active');
        module.get(function () {
            if (!activeVariantDialog || activeVariantDialog.panel !== panel) {
                link.removeAttribute('aria-busy');
                variantRequest = null;
                return;
            }
            if (!Array.isArray(module.data) || !module.data.length) {
                activeVariantDialog.dialog.querySelector('.ots-variant-loading').textContent = 'Seçenekler yüklenemedi. Lütfen kapatıp tekrar deneyin.';
                link.removeAttribute('aria-busy');
                variantRequest = null;
                return;
            }
            window.VariantValue0 = module.data;
            module.render(module.data);
        });
    }

    function openVariantDialog(card, panel, trigger) {
        var dialog = card.querySelector('.ots-variant-dialog');
        if (!dialog) {
            dialog = document.createElement('dialog');
            dialog.className = 'ots-variant-dialog';
            dialog.setAttribute('aria-label', 'Renk ve beden seçimi');
            dialog.innerHTML = '<button type="button" class="ots-variant-close" aria-label="Kapat">×</button><h2>Seçeneklerinizi belirleyin</h2><p class="ots-variant-product"></p><p class="ots-variant-help">Önce renginizi, ardından bedeninizi seçin. Son seçimde ürün sepetinize eklenir.</p><p class="ots-variant-loading" role="status">Seçenekler yükleniyor…</p>';
            var name = card.querySelector('.productName');
            dialog.querySelector('.ots-variant-product').textContent = name ? name.textContent.trim() : '';
            card.appendChild(dialog);
            dialog.appendChild(panel);
            dialog.querySelector('.ots-variant-close').addEventListener('click', function () { dialog.close(); });
            dialog.addEventListener('click', function (event) {
                var rect = dialog.getBoundingClientRect();
                if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
            });
            dialog.addEventListener('close', function () {
                if (activeVariantDialog && activeVariantDialog.dialog === dialog) {
                    activeVariantDialog = null;
                    document.documentElement.classList.remove('ots-variant-modal-open');
                    if (trigger.isConnected) trigger.focus();
                }
                if (variantRequest && variantRequest.panel === panel) {
                    variantRequest.link.removeAttribute('aria-busy');
                    variantRequest = null;
                }
            });
        }
        dialog.querySelector('.ots-variant-loading').textContent = 'Seçenekler yükleniyor…';
        dialog.querySelector('.ots-variant-loading').hidden = false;
        activeVariantDialog = { dialog: dialog, panel: panel, loaded: false };
        dialog.showModal();
        document.documentElement.classList.add('ots-variant-modal-open');
    }

    function prepareCartButtons() {
        document.querySelectorAll('.categoryContainer .productItem .btnAddToCart').forEach(function (link) {
            if (link.getAttribute('data-ots-variant-button')) return;
            var handler = link.getAttribute('onclick') || '';
            // Yalnızca mağaza ürün kartı şablonundaki doğrulanmış V2 çağrısı dönüştürülür.
            var args = handler.match(/productListAddToCartV2\('([^']+)',\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+),\s*'([^']*)',\s*\d+,\s*this\)/);
            if (!args) return;
            var card = link.closest('.productItem');
            var holder = link.closest('.mycartIcon');
            var panel = document.getElementById('productListVariantDetail' + args[1]);
            if (!holder || !panel || !card.contains(panel)) return;
            var title = card.querySelector('.productName');
            listingProducts[args[1]] = title ? title.textContent.trim() : '';
            holder.classList.add('ots-listing-cart');
            // card.contains iç içe paneli de kabul eder; ekleme panelin kendi ebeveynine yapılır.
            panel.parentNode.insertBefore(holder, panel);
            link.setAttribute('data-ots-variant-button', 'true');
            link.setAttribute('href', args[6]);
            link.setAttribute('role', 'button');
            link.setAttribute('aria-controls', panel.id);
            link.removeAttribute('onclick');
            link.addEventListener('click', function (event) {
                installSuccessNotice();
                var module = window.listVariantModule;
                // Varyasyon modülü yoksa ürün detay bağlantısı normal biçimde çalışmaya devam eder.
                if (!module || typeof module.get !== 'function' || typeof module.render !== 'function' || typeof module.setVariant !== 'function' || !window.HTMLDialogElement || !window.HTMLDialogElement.prototype.showModal) return;
                if (variantRequest) {
                    if (Date.now() - variantRequest.started > 20000) return;
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                if (card.classList.contains('StokYok')) return;
                var quantity = card.querySelector('.urunListeAdetTextBox');
                var piece = quantity ? Number(quantity.value.replace(',', '.')) : Number(args[5]);
                if (!Number.isFinite(piece) || piece <= 0) { if (quantity) quantity.focus(); return; }
                module.params.unique = args[1];
                module.params.productId = Number(args[2]);
                module.params.variantId = 0;
                module.params.assortmentProductId = Number(args[4]);
                module.params.piece = piece;
                module.params.url = args[6];
                module.params.redirectToDetail = 0;
                module.params.approveCallback = '';
                module.params.processType = 0;
                // Stok, bağımlı seçenekler ve sepete ekleme işlemi Ticimax'te kalır.
                variantRequest = { panel: panel, link: link, started: Date.now(), releasing: false };
                link.setAttribute('aria-busy', 'true');
                try {
                    openVariantDialog(card, panel, link);
                    activeVariantDialog.module = module;
                    startVariantSelection(module, panel, link);
                }
                catch (error) {
                    link.removeAttribute('aria-busy');
                    variantRequest = null;
                    window.location.assign(args[6]);
                }
            });
        });
    }

    function label(el, text) {
        if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', text);
    }

    function prepareFilterTitles() {
        document.querySelectorAll('.filterBlock .vertical-filter-panel').forEach(function (panel) {
            if (!panel.querySelector('.list-group.etiket')) return;
            var title = panel.querySelector('.panel-heading .panel-title');
            if (!title) return;
            var current = title.textContent.replace(/\s+/g, ' ').trim();
            if (current.toLocaleLowerCase('tr-TR') === 'etiket') {
                title.textContent = 'Aktif Kampanyalar';
            }
        });
    }

    function prepareProductGrid() {
        document.querySelectorAll('#ProductPageProductList > .ItemOrj:not(.NextProduct)').forEach(function (item) {
            Array.prototype.slice.call(item.classList).forEach(function (className) {
                if (/^col-(lg|md)-\d+$/.test(className)) item.classList.remove(className);
            });
            item.classList.add('col-lg-4', 'col-md-4');
        });

        document.querySelectorAll('.productItem .productImage > a.detailUrl').forEach(function (link) {
            if (!link.getAttribute('aria-label')) {
                var image = link.querySelector('img');
                link.setAttribute('aria-label', image && image.alt ? image.alt + ' ürününü incele' : 'Ürünü incele');
            }
        });

        document.querySelectorAll('.pageNumber.pageNumberBottom .pageBorder > a').forEach(function (link) {
            if (link.classList.contains('SelectedSayfa')) link.setAttribute('aria-current', 'page');
        });
    }

    function refresh() {
        if (activeVariantDialog) {
            var current = activeVariantDialog;
            if (!current.dialog.isConnected) {
                activeVariantDialog = null;
                document.documentElement.classList.remove('ots-variant-modal-open');
            } else {
                if (current.panel.children.length) {
                    current.loaded = true;
                    current.dialog.querySelector('.ots-variant-loading').hidden = true;
                }
                if (current.loaded && !current.panel.classList.contains('active')) current.dialog.close();
            }
        }
        if (variantRequest && !variantRequest.releasing && variantRequest.panel.children.length) {
            variantRequest.releasing = true;
            // Seçenek kutuları eklendikten sonra yeni istekler için kilit kaldırılır.
            window.setTimeout(function () {
                if (variantRequest) variantRequest.link.removeAttribute('aria-busy');
                variantRequest = null;
            }, 350);
        }
        if (!document.querySelector('.categoryContainer .filterBlock, #divSayfalamaUst .filterBlock')) return;
        document.body.classList.add('ots-listing-ui');
        injectStyles();
        prepareFilterTitles();
        prepareProductGrid();
        prepareCartButtons();
        prepareProductCodes();
        installSuccessNotice();
        document.querySelectorAll('.filterBlock .filterPrice1, .filterBlock .filterPrice2').forEach(function (input) {
            var text = input.classList.contains('filterPrice1') ? 'En düşük fiyat' : 'En yüksek fiyat';
            label(input, text);
            if (!input.getAttribute('placeholder')) input.setAttribute('placeholder', text);
            input.setAttribute('inputmode', 'decimal');
        });
        document.querySelectorAll('.filterBlock .panel-search input').forEach(function (input) {
            label(input, 'Filtre seçeneklerinde ara');
            if (!input.getAttribute('placeholder')) input.setAttribute('placeholder', 'Seçeneklerde ara');
        });
        document.querySelectorAll('.filterBlock .liFiltreElement > a').forEach(function (link) {
            link.setAttribute('role', 'button');
            link.setAttribute('aria-pressed', link.parentElement.classList.contains('selected') ? 'true' : 'false');
        });
        document.querySelectorAll('.filterBlock .closeFilt').forEach(function (close) { label(close, 'Filtreleri kapat'); });
        var order = document.getElementById('filterOrderSelect');
        if (order) label(order, 'Ürünleri sırala');
    }
    function schedule() {
        if (pending) return;
        pending = true;
        (window.requestAnimationFrame || function (callback) {
            return window.setTimeout(callback, 16);
        })(function () {
            pending = false;
            refresh();
        });
    }

    function isRelevantListingElement(element) {
        if (!element || element.nodeType !== 1) return false;

        var selector =
            '#ProductPageProductList, .categoryContainer, .filterBlock, ' +
            '#divSayfalamaUst, #divSayfalamaAlt, .productItemVariantDetail, .favoriteslist';

        return (element.matches && element.matches(selector)) ||
            (element.querySelector && element.querySelector(selector));
    }

    function isRelevantListingMutation(record) {
        if (record.type === 'attributes') {
            return record.target.matches && record.target.matches(
                '.liFiltreElement, .productItemVariantDetail, .favoriteslist'
            );
        }

        if (isRelevantListingElement(record.target)) return true;

        return Array.prototype.some.call(record.addedNodes, isRelevantListingElement) ||
            Array.prototype.some.call(record.removedNodes, isRelevantListingElement);
    }

    function init() {
        refresh();
        // Tüm body yerine kategori kapsayıcısını izlemek, header ve açılır sepet
        // değişimlerinin liste modülünü gereksiz yere çalıştırmasını engeller.
        var observeRoot = document.querySelector('.categoryContainer') ||
            document.getElementById('ProductPageProductList') || document.body;
        if (window.MutationObserver && observeRoot) new MutationObserver(function (records) {
            if (records.some(isRelevantListingMutation)) schedule();
        }).observe(observeRoot, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' && event.target.matches('.ots-card-favorite > a:not([href])')) { event.preventDefault(); event.target.click(); return; }
            if (event.key !== ' ' || !event.target.matches('.filterBlock .liFiltreElement > a, [data-ots-variant-button], .ots-card-favorite > a')) return;
            event.preventDefault();
            event.target.click();
        });
    }
    window.otsProductListingInit = schedule;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}());

/* ========================================================================
 * BÖLÜM 3: SHOWTIME VİTRİN SATIRLARI
 *
 * Ürün listesinde seyrek ve rastgele yerleşen, galerili vitrin satırları oluşturur.
 * Masaüstünde 3, mobilde 2 sütunlu normal düzende vitrin, tamamlanmış satırlardan
 * sonra gelir; mobil vitrinler tek ürünlüdür. Tükendi etiketli ürünler ve 12 üründen
 * küçük listeler vitrine alınmaz.
 *
 * Toplam ürün sayısı sırasıyla data-showtime-total, sayfalama .totalItems,
 * window.netTotalItems veya yüklü ürün sayısından okunur. Sonsuz kaydırmada mevcut
 * plan korunur; filtre/sıralama değişiminde yeni plan oluşturulur. Galeri görselleri
 * ürün detayından okunur ve 7 saniyede bir değişir; duraklat düğmesi, gizli sekme
 * ve azaltılmış hareket tercihi otomatik geçişi durdurur. Ürün kartına isteğe bağlı
 * data-showtime-images (JSON URL dizisi) verilebilir.
 *
 * Konsol: window.otsShowtime.refresh(), .inspect(), .destroy()
 * ====================================================================== */
(function (window, document) {
    'use strict';
    var VERSION = '2026-10-17-pricing-mobile-3';
    if (window.otsShowtime) {
        if (window.otsShowtime.version === VERSION) { window.otsShowtime.refresh(); return; }
        if (typeof window.otsShowtime.destroy === 'function') window.otsShowtime.destroy();
        else return;
    }
    var ID = 'ProductPageProductList';
    var PREFIX = 'ots-showtime';
    var list = null, state = null, observer = null, imageObserver = null, timer = null;
    var stopped = false, style = null;
    var motionObserver = null, motionCards = new Map(), galleryCache = new Map(), effectDeck = [];
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var mobileBanners = window.matchMedia('(max-width:991px)');
    var CYCLE = 7000;
    var observedImages = new WeakSet();
    var owned = new Set();
    var css = `
#ProductPageProductList.ots-showtime:not(.pr_hrz) { display:grid!important; grid-template-columns:repeat(6,minmax(0,1fr)); gap:28px 18px; width:100%; float:none!important; align-items:stretch; }
#ProductPageProductList.ots-showtime:not(.pr_hrz)::before,#ProductPageProductList.ots-showtime:not(.pr_hrz)::after { display:none!important; }
#ProductPageProductList.ots-showtime:not(.pr_hrz) > * { grid-column:1 / -1; min-width:0; }
html body #ProductPageProductList.ots-showtime:not(.pr_hrz) > .ItemOrj.ots-showtime-item { grid-column:span 2; float:none!important; clear:none!important; width:auto!important; max-width:none!important; min-width:0; margin:0!important; padding:0!important; }
html body #ProductPageProductList.ots-showtime:not(.pr_hrz) > .ItemOrj.ots-showtime-single { grid-column:1 / -1; }
html body #ProductPageProductList.ots-showtime:not(.pr_hrz) > .ItemOrj.ots-showtime-pair { grid-column:span 3; }
html body #ProductPageProductList.ots-showtime:not(.pr_hrz) > .ItemOrj.ots-showtime-pair-start { grid-column:1 / span 3; }
#ProductPageProductList.ots-showtime .ots-showtime-feature { --st-surface:#eef2fa; --st-ink:#0c154c; --st-muted:#5d6b87; --st-line:#d8e1f0; --st-button:#0c154c; --st-button-text:#fff; }
#ProductPageProductList.ots-showtime .ots-showtime-single,#ProductPageProductList.ots-showtime .ots-showtime-pair-start { --st-surface:#0c154c; --st-ink:#fff; --st-muted:#c5cee5; --st-line:#ffffff30; --st-button:#fff; --st-button-text:#0c154c; }
#ProductPageProductList.ots-showtime .ots-showtime-feature > .productItem { position:relative!important; isolation:isolate; height:auto!important; min-height:100%; padding:0!important; margin:0!important; border:1px solid var(--st-line)!important; border-radius:30px!important; background:var(--st-surface)!important; box-shadow:0 14px 36px #0c154c0b!important; overflow:hidden; color:var(--st-ink); }
#ProductPageProductList.ots-showtime .ots-showtime-feature > .productItem::before { content:''; position:absolute; z-index:-1; pointer-events:none; width:340px; height:340px; right:-180px; top:20px; border:1px solid var(--st-line); border-radius:50%; box-shadow:0 0 0 32px var(--st-surface),0 0 0 33px var(--st-line); }
#ProductPageProductList.ots-showtime .ots-showtime-feature .productImage { position:relative; float:none!important; width:calc(100% - 32px)!important; height:320px!important; padding:0!important; margin:16px 16px 0!important; border-radius:30px!important; overflow:hidden!important; background:#fff; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .productImage > a { display:block!important; position:relative!important; width:100%!important; height:100%!important; padding:0!important; box-sizing:border-box!important; border-radius:inherit; overflow:hidden; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .productImage img { display:block!important; position:absolute!important; inset:0!important; width:100%!important; height:100%!important; max-height:none!important; max-width:100%!important; object-fit:contain!important; margin:0!important; transform:none!important; transition:transform .5s ease!important; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .productDetail { position:relative; float:none!important; width:100%!important; height:auto!important; min-height:0!important; padding:26px 28px!important; margin:0!important; text-align:left!important; background:transparent!important; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .productName { height:auto!important; min-height:0!important; margin:0 0 12px!important; padding:0!important; overflow:visible!important; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .productName a { display:block!important; height:auto!important; min-height:0!important; max-height:none!important; color:var(--st-ink)!important; font-size:15px!important; font-weight:500!important; line-height:1.55!important; white-space:normal!important; overflow:visible!important; -webkit-line-clamp:unset!important; text-decoration:none; letter-spacing:0!important; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .productOnYazi { display:block; margin:0 0 10px; color:var(--st-muted)!important; font-size:12px; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .productStokKodu { color:var(--st-muted)!important; font-size:10px!important; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .productPrice { display:flex!important; align-items:baseline; flex-wrap:wrap; gap:0 12px; float:none!important; width:100%!important; height:auto!important; margin:18px 0 0!important; text-align:left!important; color:var(--st-ink)!important; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .discountPrice { display:block!important; min-width:0; width:auto!important; max-width:100%; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .discountPriceSpan { display:flex!important; align-items:baseline; flex-wrap:wrap; column-gap:12px; row-gap:2px; width:100%; color:var(--st-ink)!important; font-size:26px!important; font-weight:700!important; line-height:1.4!important; white-space:normal!important; letter-spacing:-.5px; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .regularPrice,#ProductPageProductList.ots-showtime .ots-showtime-feature .ots-category-calculated-old-price { flex:0 0 auto; color:var(--st-muted)!important; font-size:14px!important; font-weight:400!important; text-decoration:line-through!important; white-space:nowrap!important; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .discountPriceSpan > .ots-unit-price,#ProductPageProductList.ots-showtime .ots-showtime-feature .discountPriceSpan > .ots-home-unit-price { display:block!important; flex:0 0 100%; width:100%; margin:0!important; color:var(--st-muted)!important; font-size:13px!important; font-weight:500!important; line-height:1.35!important; white-space:nowrap!important; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .ozelAlan4 { display:none!important; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .discountPrice,#ProductPageProductList.ots-showtime .ots-showtime-feature .regularPrice { float:none!important; text-align:left!important; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .discountKdv { display:none!important; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .cargoIcon { display:none!important; }
#ProductPageProductList.ots-showtime .ots-showtime-shipping { display:inline-flex; align-items:center; gap:7px; width:max-content; max-width:100%; margin:12px 0 0; padding:7px 11px; border:1px solid #9cc9ae; border-radius:30px; background:#e8f6ed; color:#21633c; font-size:11px; font-weight:700; line-height:1.2; white-space:nowrap; }
#ProductPageProductList.ots-showtime .ots-showtime-shipping::before { content:''; width:7px; height:7px; border-radius:50%; background:#3da268; box-shadow:0 0 0 3px #3da26822; }
#ProductPageProductList.ots-showtime .ots-showtime-heading { display:block; margin:0 0 14px; color:var(--st-ink); font-family:inherit; font-size:30px; font-weight:650; line-height:1.13; letter-spacing:-1.2px; }
#ProductPageProductList.ots-showtime .ots-showtime-single > .productItem { display:block!important; box-sizing:border-box!important; min-height:460px!important; padding-left:52%!important; }
#ProductPageProductList.ots-showtime .ots-showtime-single > .productItem > .productImage { position:absolute!important; inset:24px auto 24px 24px!important; width:calc(52% - 24px)!important; height:calc(100% - 48px)!important; min-height:0; margin:0!important; border-radius:30px!important; }
#ProductPageProductList.ots-showtime .ots-showtime-single > .productItem > :not(.productImage) { min-width:0; }
#ProductPageProductList.ots-showtime .ots-showtime-single .productDetail { padding:40px!important; }
#ProductPageProductList.ots-showtime .ots-showtime-single .ots-showtime-heading { font-size:clamp(32px,3.2vw,46px); letter-spacing:-1.8px; }
#ProductPageProductList.ots-showtime .ots-showtime-single .productName a { font-size:16px!important; }
#ProductPageProductList.ots-showtime .ots-showtime-single .productIcon { position:relative!important; inset:auto!important; width:auto!important; height:auto!important; margin:0 24px 18px!important; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .ots-listing-cart { align-self:end; }
html body #ProductPageProductList.ots-showtime .ots-showtime-feature > .productItem > .ots-listing-cart > a,
html body #ProductPageProductList.ots-showtime .ots-showtime-feature .mycartIcon .btnAddToCart { border-color:var(--st-button)!important; background:var(--st-button)!important; color:var(--st-button-text)!important; }
html body #ProductPageProductList.ots-showtime .ots-showtime-feature .mycartIcon .btnAddToCart > span { color:inherit!important; }
@media(hover:hover) {
 #ProductPageProductList.ots-showtime .ots-showtime-feature .productImage:hover img { transform:scale(1.035)!important; }
}
@media(max-width:991px) {
 #ProductPageProductList.ots-showtime:not(.pr_hrz) { gap:24px 12px; }
 html body #ProductPageProductList.ots-showtime:not(.pr_hrz) > .ItemOrj.ots-showtime-item { grid-column:span 3; }
 html body #ProductPageProductList.ots-showtime:not(.pr_hrz) > .ItemOrj.ots-showtime-single { grid-column:1 / -1; }
 html body #ProductPageProductList.ots-showtime:not(.pr_hrz) > .ItemOrj.ots-showtime-pair { grid-column:1 / -1; }
 #ProductPageProductList.ots-showtime .ots-showtime-single .productDetail { padding:28px!important; }
}
@media(max-width:600px) {
 #ProductPageProductList.ots-showtime .ots-showtime-feature > .productItem { border-radius:22px!important; }
 #ProductPageProductList.ots-showtime .ots-showtime-feature .productImage { height:210px!important; width:calc(100% - 20px)!important; margin:10px 10px 0!important; border-radius:30px!important; }
 #ProductPageProductList.ots-showtime .ots-showtime-feature .productDetail { padding:16px 14px!important; }
 #ProductPageProductList.ots-showtime .ots-showtime-feature .productName { margin-bottom:5px!important; }
 #ProductPageProductList.ots-showtime .ots-showtime-feature .productName a { font-size:12px!important; line-height:1.35!important; }
 #ProductPageProductList.ots-showtime .ots-showtime-feature .productOnYazi { margin-bottom:4px!important; line-height:1.35; }
 #ProductPageProductList.ots-showtime .ots-showtime-feature .productStokKodu { line-height:1.3!important; }
 #ProductPageProductList.ots-showtime .ots-showtime-feature .productPrice { align-items:center; flex-wrap:nowrap; gap:4px; margin:9px 0 0!important; white-space:nowrap; }
 #ProductPageProductList.ots-showtime .ots-showtime-feature .discountPrice { flex:0 1 auto!important; max-width:none!important; }
 html body #ProductPageProductList.ots-showtime .ots-showtime-feature .discountPriceSpan { width:auto!important; align-items:baseline; flex-wrap:nowrap!important; column-gap:4px; row-gap:0; font-size:clamp(17px,5.3vw,23px)!important; line-height:1.2!important; white-space:nowrap!important; }
 #ProductPageProductList.ots-showtime .ots-showtime-feature .regularPrice,#ProductPageProductList.ots-showtime .ots-showtime-feature .ots-category-calculated-old-price { font-size:clamp(8px,2.35vw,10px)!important; }
 html body #ProductPageProductList.ots-showtime .ots-showtime-feature .discountPriceSpan > .ots-unit-price,html body #ProductPageProductList.ots-showtime .ots-showtime-feature .discountPriceSpan > .ots-home-unit-price { display:inline-flex!important; flex:0 0 auto!important; width:auto!important; font-size:clamp(7px,2vw,9px)!important; line-height:1.2!important; letter-spacing:-.2px; }
 #ProductPageProductList.ots-showtime .ots-showtime-shipping { flex:0 0 auto; gap:3px; max-width:none; margin:0; padding:4px 6px; font-size:clamp(7px,2vw,9px); }
 #ProductPageProductList.ots-showtime .ots-showtime-shipping::before { width:5px; height:5px; box-shadow:0 0 0 2px #3da26822; }
 #ProductPageProductList.ots-showtime .ots-showtime-heading { margin-bottom:9px; font-size:23px; letter-spacing:-.8px; }
 #ProductPageProductList.ots-showtime .ots-showtime-single > .productItem { padding:0!important; min-height:0!important; }
 #ProductPageProductList.ots-showtime .ots-showtime-single > .productItem > .productImage { position:relative!important; inset:auto!important; width:calc(100% - 28px)!important; height:280px!important; margin:14px 14px 0!important; border-radius:30px!important; }
 #ProductPageProductList.ots-showtime .ots-showtime-single .productDetail { padding:18px!important; }
 #ProductPageProductList.ots-showtime .ots-showtime-single .ots-showtime-heading { font-size:32px; }
 #ProductPageProductList.ots-showtime .ots-showtime-single .productName a { font-size:14px!important; }
 #ProductPageProductList.ots-showtime .ots-showtime-single .productIcon { margin:0 16px 16px!important; }
 #ProductPageProductList.ots-showtime .ots-showtime-pair .productImage { height:280px!important; width:calc(100% - 28px)!important; margin:14px 14px 0!important; }
 #ProductPageProductList.ots-showtime .ots-showtime-pair .productDetail { padding:18px!important; }
 #ProductPageProductList.ots-showtime .ots-showtime-pair .ots-showtime-heading { font-size:32px; }
 #ProductPageProductList.ots-showtime .ots-showtime-pair .productName a { font-size:14px!important; }
}

#ProductPageProductList.ots-showtime .ots-showtime-feature .productImage img { border-radius:30px!important; }
#ProductPageProductList.ots-showtime .ots-showtime-stage { position:absolute; inset:0; z-index:5; background:#fff; pointer-events:none; overflow:hidden; border-radius:30px; }
#ProductPageProductList.ots-showtime .ots-showtime-stage > .ots-showtime-slide { display:block!important; position:absolute!important; inset:0!important; width:100%!important; height:100%!important; min-height:100%!important; margin:0!important; padding:0!important; background:#fff; }
#ProductPageProductList.ots-showtime .ots-showtime-stage .ots-showtime-slide > img { display:block!important; position:absolute!important; inset:0!important; width:100%!important; height:100%!important; min-height:100%!important; object-fit:contain!important; opacity:1!important; visibility:visible!important; }
#ProductPageProductList.ots-showtime .ots-showtime-controls { position:absolute; z-index:6; bottom:12px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:4px; padding:4px; border:1px solid #0c154c15; border-radius:30px; background:#ffffffed; color:#0c154c; box-shadow:0 4px 16px #0c154c15; white-space:nowrap; }
#ProductPageProductList.ots-showtime .ots-showtime-controls button { appearance:none; display:grid; place-items:center; width:34px; height:34px; min-width:34px; margin:0; padding:0; border:0; border-radius:50%; background:transparent; color:#0c154c; cursor:pointer; font:18px/1 sans-serif; }
#ProductPageProductList.ots-showtime .ots-showtime-controls button:hover { background:#eef2fa; }
#ProductPageProductList.ots-showtime .ots-showtime-controls button:focus-visible { outline:2px solid #0c154c; outline-offset:1px; }
#ProductPageProductList.ots-showtime .ots-showtime-count { font:11px/1.2 sans-serif; min-width:30px; text-align:center; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .variant-strip { position:relative; z-index:2; display:flex!important; flex-wrap:wrap; gap:11px!important; margin:0 0 16px!important; width:100%!important; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .variant-thumb,#ProductPageProductList.ots-showtime .ots-showtime-feature .variant-more { align-items:center; gap:6px; min-width:62px; text-decoration:none!important; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .variant-thumb img { box-sizing:border-box; display:block!important; width:62px!important; height:62px!important; max-width:none!important; max-height:none!important; margin:0!important; padding:3px!important; object-fit:cover!important; border:2px solid var(--st-line)!important; border-radius:50%!important; background:#fff!important; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .variant-thumb span { max-width:78px!important; overflow:visible!important; white-space:normal!important; color:var(--st-ink)!important; font-size:11px!important; font-weight:600!important; line-height:1.25!important; text-align:center; }
#ProductPageProductList.ots-showtime .ots-showtime-feature .variant-more__circle { box-sizing:border-box; width:62px!important; height:62px!important; border:1px solid var(--st-line)!important; border-radius:50%; background:var(--st-button)!important; color:var(--st-button-text)!important; }
#ProductPageProductList.ots-showtime .ots-showtime-backdrop { position:absolute; inset:0; z-index:0; overflow:hidden; border-radius:inherit; pointer-events:none; }
#ProductPageProductList.ots-showtime .ots-showtime-feature > .productItem > .productImage,#ProductPageProductList.ots-showtime .ots-showtime-feature > .productItem > .productDetail { z-index:1; }
#ProductPageProductList.ots-showtime .ots-showtime-backdrop span { position:absolute; display:block; animation-play-state:paused!important; will-change:transform; }
#ProductPageProductList.ots-showtime .ots-showtime-inview .ots-showtime-backdrop span { animation-play-state:running!important; }
#ProductPageProductList.ots-showtime .ots-showtime-backdrop-glow span { width:min(66%,490px); aspect-ratio:1; border-radius:30% 70% 68% 32% / 32% 34% 66% 68%; filter:blur(42px); background:linear-gradient(135deg,#7bb9dd70,#4a85c781,#254b9c70,#83abd44f); animation:ots-showtime-drift 16s cubic-bezier(.8,.2,.2,.8) alternate infinite; }
#ProductPageProductList.ots-showtime .ots-showtime-backdrop-glow span:nth-child(1) { right:-9%; top:-38%; }
#ProductPageProductList.ots-showtime .ots-showtime-backdrop-glow span:nth-child(2) { right:35%; bottom:-65%; animation-delay:-8s; animation-duration:20s; opacity:.6; }
#ProductPageProductList.ots-showtime .ots-showtime-backdrop-glow span:nth-child(3) { right:-32%; bottom:-65%; animation-delay:-13s; animation-duration:22s; opacity:.4; }
#ProductPageProductList.ots-showtime .ots-showtime-backdrop-ripple span { width:42%; aspect-ratio:1; right:-15%; bottom:-55%; border:1px solid #b8d2ff55; border-radius:50%; box-shadow:0 0 0 34px #7da8f20b,0 0 0 35px #b8d2ff2b; animation:ots-showtime-ripple 14s ease-in-out infinite; }
#ProductPageProductList.ots-showtime .ots-showtime-backdrop-ripple span:nth-child(2) { width:65%; right:-26%; bottom:-82%; animation-delay:-5s; opacity:.75; }
#ProductPageProductList.ots-showtime .ots-showtime-backdrop-ripple span:nth-child(3) { width:88%; right:-40%; bottom:-110%; animation-delay:-10s; opacity:.5; }
@keyframes ots-showtime-drift { from { transform:rotate(0deg) scale(.86); } to { transform:rotate(360deg) scale(1.18); } }
@keyframes ots-showtime-ripple { 0%,100% { transform:scale(.86); opacity:.45; } 50% { transform:scale(1.15); opacity:1; } }
@media(max-width:600px) {
 #ProductPageProductList.ots-showtime .ots-showtime-feature .variant-strip { gap:8px!important; margin-bottom:9px!important; }
 #ProductPageProductList.ots-showtime .ots-showtime-feature .variant-thumb,#ProductPageProductList.ots-showtime .ots-showtime-feature .variant-more { min-width:52px; }
 #ProductPageProductList.ots-showtime .ots-showtime-feature .variant-thumb img,#ProductPageProductList.ots-showtime .ots-showtime-feature .variant-more__circle { width:52px!important; height:52px!important; }
 #ProductPageProductList.ots-showtime .ots-showtime-feature .variant-thumb span { max-width:60px!important; font-size:10px!important; }
}

@media(prefers-reduced-motion:reduce) {
 #ProductPageProductList.ots-showtime .ots-showtime-feature .productImage img { transition:none!important; }
 #ProductPageProductList.ots-showtime .ots-showtime-backdrop span { animation:none!important; will-change:auto!important; }
}

`;
    function random(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
    function number(value) {
        var normalized = String(value == null ? '' : value).trim().replace(/[.\s,]/g, '');
        var valueAsNumber = /^\d+$/.test(normalized) ? Number(normalized) : 0;
        return Number.isSafeInteger(valueAsNumber) ? valueAsNumber : 0;
    }
    function totalCount(node, loaded) {
        var total = number(node.getAttribute('data-showtime-total'));
        var counter = document.querySelector('#divSayfalamaAlt .totalItems, #divSayfalamaUst .totalItems, .productCountInfo .totalItems');
        if (!total && counter) total = number(counter.textContent);
        if (!total) total = number(window.netTotalItems);
        return Math.max(loaded, total);
    }
    function cards(node) {
        return Array.from(node.children).filter(function (item) {
            return item.matches('.ItemOrj:not(.NextProduct)') && item.querySelector('.productItem:not(.isBanner) .productName a') && item.style.display !== 'none' && !item.hidden;
        });
    }
    function isSoldOut(item) {
        return !!item.querySelector('.TukendiIco');
    }
    function key(item) {
        var name = item.querySelector('.productName a');
        return (name.getAttribute('href') || '') + '|' + (name.parentElement.getAttribute('data-id') || '') + '|' + (isSoldOut(item) ? 'soldout' : 'available');
    }
    function newState(total) {
        return { keys:[], nodes:[], total:total, events:[], nextNormal:random(1, 2) * 6, featured:0, pendingSize:0, density:random(18, 24), mobile:mobileBanners.matches };
    }
    function extendPlan(total, items) {
        state.total = Math.max(state.total, total);
        if (state.total < 12) return;
        var budget = Math.max(1, Math.floor(state.total / state.density));
        // Altılı normal ürün grubu, masaüstünde iki üçlü ve mobilde üç ikili sıradır.
        // Önceden normal gösterilmiş kartlar, lazy append sonrası geriye dönük bannera dönüşmez.
        if (!state.pendingSize && state.nextNormal + state.featured < state.keys.length) {
            state.nextNormal = Math.ceil((state.keys.length - state.featured) / 6) * 6;
        }
        while (state.events.length < budget) {
            var start = state.nextNormal + state.featured;
            if (start >= items.length) break;
            if (!state.pendingSize) state.pendingSize = state.mobile ? 1 : (random(0, 1) ? 2 : 1);
            var size = state.pendingSize;
            if (start + size + 3 > state.total || start + size > items.length) break;
            var eligible = items.slice(start, start + size).every(function (item) { return !isSoldOut(item); });
            if (eligible) {
                state.events.push({ start:start, size:size });
                state.featured += size;
            }
            // Tükenen adaylar normal kart olarak kalır; sonraki seçimi tam satıra taşı.
            state.pendingSize = 0;
            var gap = state.total < 30 ? random(1, 2) : (state.total < 80 ? random(2, 3) : random(3, 4));
            state.nextNormal += gap * 6;
        }
    }
    function clearItem(item) {
        clearMotion(item);
        item.classList.remove('ots-showtime-item', 'ots-showtime-feature', 'ots-showtime-single', 'ots-showtime-pair', 'ots-showtime-pair-start', 'ots-showtime-inview');
        item.querySelectorAll('[data-ots-showtime-owned]').forEach(function (node) { node.remove(); });
        owned.delete(item);
    }
    function clearList(node) {
        if (!node) return;
        node.classList.remove(PREFIX);
        Array.from(owned).forEach(clearItem);
    }
    function imageURL(value) {
        if (!value) return '';
        try { var parsed = new URL(value, document.baseURI); return /^https?:$/.test(parsed.protocol) ? parsed.href : ''; } catch (_) { return ''; }
    }
    function watchImage(item) {
        if (!imageObserver) return;
        item.querySelectorAll('.productImage img').forEach(function (img) {
            if (observedImages.has(img)) return;
            observedImages.add(img);
            imageObserver.observe(img);
        });
    }
    function galleryURL(value) {
        var url = imageURL(value);
        if (!url || /(?:load|loading|placeholder|spacer)\.(gif|png|svg)|resim-hazirlaniyor/i.test(url)) return '';
        return url.replace(/\/UrunResimleri\/thumb\//i, '/UrunResimleri/buyuk/');
    }
    function uniqueImages(values) {
        var seen = new Set();
        return values.map(galleryURL).filter(function (url) {
            if (!url) return false;
            // CDN boyutları farklı olsa da aynı fotoğrafı bir kez göster.
            var identity = new URL(url).pathname.split('/').pop().toLowerCase();
            if (seen.has(identity)) return false;
            seen.add(identity); return true;
        }).slice(0, 6);
    }
    function galleryFromPage(html, variantId) {
        // Ticimax görselleri çoğu üründe HTML yerine productDetailModel JSON'undan oluşturuyor.
        // Script çalıştırmadan yalnızca bu JSON'u okuyup listede seçili varyantı kullan.
        var match = /\bproductDetailModel\s*=\s*\{/.exec(html);
        if (match) {
            var start = match.index + match[0].length - 1;
            var depth = 0, quoted = false, escaped = false, end = -1;
            for (var i = start; i < html.length; i += 1) {
                var char = html[i];
                if (escaped) { escaped = false; continue; }
                if (quoted && char === '\\') { escaped = true; continue; }
                if (char === '"') { quoted = !quoted; continue; }
                if (!quoted && char === '{') depth += 1;
                if (!quoted && char === '}' && --depth === 0) { end = i + 1; break; }
            }
            if (end > start) {
                try {
                    var model = JSON.parse(html.slice(start, end));
                    var selected = Number(variantId) || Number(model.mainVariantId);
                    var images = (model.productImages || []).filter(function (image) {
                        return image && image.active !== false && !image.video && image.imageType !== 3 &&
                            (!selected || Number(image.variantId) === selected);
                    });
                    if (images.length) return images.sort(function (a, b) { return Number(a.imageOrder) - Number(b.imageOrder); })
                        .map(function (image) { return image.imagePath || image.bigImagePath || image.thumbImagePath; });
                } catch (_) { /* Eski Ticimax şablonlarında HTML galerisini dene. */ }
            }
        }
        var page = new DOMParser().parseFromString(html, 'text/html');
        return Array.from(page.querySelectorAll('#divThumbList img, #ProductDetailMain .leftImage .cloudzoom-gallery')).map(function (img) {
            var zoom = {};
            try { zoom = JSON.parse(img.getAttribute('data-cloudzoom') || '{}'); } catch (_) {}
            return zoom.zoomImage || zoom.image || img.getAttribute('data-original') || img.getAttribute('src');
        });
    }
    function alive(motion) { return !stopped && motionCards.get(motion.item) === motion && motion.item.isConnected; }
    function canPlay(motion) {
        return alive(motion) && motion.visible && !document.hidden && !reducedMotion.matches && !motion.paused;
    }
    function stopMotion(motion) {
        window.clearTimeout(motion.clock); motion.clock = null;
        motion.animations.forEach(function (animation) { animation.cancel(); });
        motion.animations = [];
    }
    function animate(motion, node, frames, options) {
        if (!node || !node.animate || reducedMotion.matches) return;
        var animation = node.animate(frames, options);
        motion.animations.push(animation);
        animation.finished.catch(function () {}).then(function () {
            var index = motion.animations.indexOf(animation);
            if (index >= 0) motion.animations.splice(index, 1);
        });
    }
    function animateCopy(motion) {
        if (!canPlay(motion)) return;
        ['.ots-showtime-heading', '.productName', '.productPrice'].forEach(function (selector, index) {
            animate(motion, motion.item.querySelector(selector), [
                { opacity:1, transform:'translateY(0)', offset:0 },
                { opacity:0, transform:'translateY(-9px)', offset:.22 },
                { opacity:0, transform:'translateY(13px)', offset:.23 },
                { opacity:1, transform:'translateY(0)', offset:1 }
            ], { duration:900, delay:index * 110, easing:'cubic-bezier(.22,.61,.36,1)' });
        });
    }
    function armMotion(motion) {
        window.clearTimeout(motion.clock);
        if (!canPlay(motion)) return;
        motion.clock = window.setTimeout(function () {
            if (!canPlay(motion)) return;
            animateCopy(motion);
            if (motion.urls.length > 1) changeSlide(motion, 1, false);
            armMotion(motion);
        }, CYCLE);
    }
    function syncMotion() {
        motionCards.forEach(function (motion) {
            stopMotion(motion);
            if (motion.pauseButton) updatePause(motion);
            armMotion(motion);
        });
    }
    function updatePause(motion) {
        var paused = motion.paused || reducedMotion.matches;
        motion.pauseButton.textContent = paused ? '▶' : 'Ⅱ';
        motion.pauseButton.setAttribute('aria-label', paused ? 'Otomatik animasyonu başlat' : 'Otomatik animasyonu duraklat');
        motion.pauseButton.setAttribute('aria-pressed', String(paused));
        motion.pauseButton.disabled = reducedMotion.matches;
    }
    function controls(motion) {
        if (motion.controls) motion.controls.remove();
        var box = document.createElement('div');
        box.className = 'ots-showtime-controls'; box.dataset.otsShowtimeOwned = 'true';
        box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Ürün görselleri ve animasyon');
        function button(label, text, action) {
            var node = document.createElement('button'); node.type = 'button'; node.textContent = text; node.setAttribute('aria-label', label);
            node.addEventListener('click', function (event) { event.preventDefault(); event.stopPropagation(); action(); });
            box.appendChild(node); return node;
        }
        if (motion.urls.length > 1) {
            button('Önceki ürün görseli', '‹', function () { changeSlide(motion, -1, true); });
            motion.counter = document.createElement('span'); motion.counter.className = 'ots-showtime-count';
            motion.counter.textContent = (motion.index + 1) + ' / ' + motion.urls.length;
            box.appendChild(motion.counter);
            button('Sonraki ürün görseli', '›', function () { changeSlide(motion, 1, true); });
        }
        motion.pauseButton = button('Otomatik animasyonu duraklat', 'Ⅱ', function () { motion.paused = !motion.paused; stopMotion(motion); updatePause(motion); armMotion(motion); });
        updatePause(motion);
        motion.area.appendChild(box); motion.controls = box;
    }
    function imageReady(url, motion) {
        return new Promise(function (resolve) {
            var img = new Image(), done = false;
            var pending = { cancel:function () { finish(null); } };
            var timeout = window.setTimeout(function () { finish(null); }, 10000);
            function finish(value) {
                if (done) return; done = true; window.clearTimeout(timeout);
                img.onload = img.onerror = null; motion.pending.delete(pending); resolve(value);
            }
            motion.pending.add(pending);
            img.onload = function () { finish(img); }; img.onerror = function () { finish(null); };
            img.alt = motion.name; img.decoding = 'async'; img.src = url;
        });
    }
    async function changeSlide(motion, direction, manual) {
        if (!alive(motion) || motion.busy || motion.urls.length < 2) return;
        motion.busy = true;
        var next = (motion.index + direction + motion.urls.length) % motion.urls.length;
        var url = motion.urls[next];
        var img = await imageReady(url, motion);
        motion.busy = false;
        if (!alive(motion)) return;
        if (!img) {
            motion.urls.splice(next, 1);
            if (next < motion.index) motion.index -= 1;
            controls(motion); return;
        }
        if (!manual && !canPlay(motion)) return;
        if (!motion.stage) {
            motion.stage = document.createElement('span'); motion.stage.className = 'ots-showtime-stage';
            motion.stage.dataset.otsShowtimeOwned = 'true'; motion.stage.setAttribute('aria-hidden', 'true');
            motion.area.appendChild(motion.stage);
            var original = motion.anchor.querySelector('img');
            if (original && original.complete && original.naturalWidth) {
                motion.slide = document.createElement('span'); motion.slide.className = 'ots-showtime-slide';
                var initial = new Image(); initial.src = original.currentSrc || original.src; initial.alt = '';
                motion.slide.appendChild(initial); motion.stage.appendChild(motion.slide);
            }
        }
        Array.from(motion.stage.children).forEach(function (node) { if (node !== motion.slide) node.remove(); });
        var old = motion.slide;
        var slide = document.createElement('span'); slide.className = 'ots-showtime-slide'; slide.appendChild(img);
        motion.stage.appendChild(slide); motion.slide = slide; motion.index = next;
        if (old) {
            animate(motion, old, [{ transform:'translateX(0)', opacity:1 }, { transform:'translateX(' + (-direction * 30) + '%)', opacity:0 }], { duration:650, easing:'ease-in-out' });
            window.clearTimeout(motion.slideCleanup);
            motion.slideCleanup = window.setTimeout(function () { old.remove(); }, 680);
        }
        animate(motion, slide, [{ transform:'translateX(' + (direction * 100) + '%)', opacity:.6 }, { transform:'translateX(0)', opacity:1 }], { duration:700, easing:'cubic-bezier(.22,.61,.36,1)' });
        if (motion.counter) motion.counter.textContent = (next + 1) + ' / ' + motion.urls.length;
        if (manual) armMotion(motion);
    }
    async function loadGallery(motion) {
        if (motion.requested || !alive(motion)) return;
        motion.requested = true;
        var values = [];
        try { values = JSON.parse(motion.item.getAttribute('data-showtime-images') || '[]'); } catch (_) {}
        if (!Array.isArray(values)) values = [];
        var localImages = Array.from(motion.area.querySelectorAll('img:not([data-ots-showtime-owned])')).map(function (img) { return img.getAttribute('data-original') || img.getAttribute('data-src') || img.getAttribute('src'); });
        values = uniqueImages(localImages.concat(values));
        try {
            // Canlı sitede aynı origin; bağımsız dosya önizlemesinde CORS başarısızsa tek fotoğraf korunur.
            var href = imageURL(motion.item.querySelector('.productName a').getAttribute('href'));
            var variantId = motion.item.querySelector('.productDetail')?.getAttribute('data-variant-id') || '';
            var cacheKey = href + '#' + variantId;
            if (values.length < 2 && href && new URL(href).origin === new URL(document.baseURI).origin) {
                if (galleryCache.has(cacheKey)) values = uniqueImages(values.concat(galleryCache.get(cacheKey)));
                else {
                    motion.abort = new AbortController();
                    motion.fetchTimeout = window.setTimeout(function () { motion.abort.abort(); }, 10000);
                    var response = await fetch(href, { signal:motion.abort.signal, credentials:'same-origin' });
                    if (response.ok) {
                        var gallery = galleryFromPage(await response.text(), variantId);
                        if (alive(motion)) {
                            if (galleryCache.size >= 32) galleryCache.delete(galleryCache.keys().next().value);
                            galleryCache.set(cacheKey, gallery); values = uniqueImages(values.concat(gallery));
                        }
                    }
                }
            }
        } catch (_) { /* Ana fotoğraf ve ürün bağlantısı her durumda kullanılabilir. */ }
        finally { window.clearTimeout(motion.fetchTimeout); }
        if (!alive(motion)) return;
        motion.urls = values;
        controls(motion);
    }
    function setupMotion(item) {
        if (motionCards.has(item)) return;
        var area = item.querySelector('.productImage'), anchor = area && area.querySelector('a');
        if (!anchor) return;
        var motion = { item:item, area:area, anchor:anchor, name:item.querySelector('.productName a').textContent.trim(), urls:[], index:0, visible:false, paused:false, animations:[], pending:new Set() };
        motionCards.set(item, motion); controls(motion);
        if (motionObserver) motionObserver.observe(item);
        else { motion.visible = true; item.classList.add('ots-showtime-inview'); loadGallery(motion); armMotion(motion); }
    }
    function clearMotion(item) {
        var motion = motionCards.get(item); if (!motion) return;
        stopMotion(motion); window.clearTimeout(motion.slideCleanup); window.clearTimeout(motion.fetchTimeout);
        motion.pending.forEach(function (pending) { pending.cancel(); });
        if (motion.abort) motion.abort.abort(); if (motionObserver) motionObserver.unobserve(item);
        motionCards.delete(item);
    }
    function decorateBackdrop(item) {
        var product = item.querySelector('.productItem');
        if (!product || product.querySelector('.ots-showtime-backdrop')) return;
        if (!effectDeck.length) effectDeck = Math.random() < .5 ? ['glow', 'ripple'] : ['ripple', 'glow'];
        var backdrop = document.createElement('div');
        backdrop.className = 'ots-showtime-backdrop ots-showtime-backdrop-' + effectDeck.pop();
        backdrop.dataset.otsShowtimeOwned = 'true';
        backdrop.setAttribute('aria-hidden', 'true');
        for (var i = 0; i < 3; i += 1) backdrop.appendChild(document.createElement('span'));
        product.insertBefore(backdrop, product.firstChild);
    }
    function decorateShipping(item) {
        var detail = item.querySelector('.productDetail');
        var price = detail && detail.querySelector('.productPrice');
        var cargo = item.querySelector('.cargoIcon');
        var badge = detail && detail.querySelector('.ots-showtime-shipping');
        if (!price || !cargo) { if (badge) badge.remove(); return; }
        var label = cargo.textContent.replace(/\s+/g, ' ').trim() || 'Ücretsiz Kargo';
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'ots-showtime-shipping';
            badge.dataset.otsShowtimeOwned = 'true';
        }
        if (badge.parentElement !== price) price.appendChild(badge);
        if (badge.textContent !== label) badge.textContent = label;
    }
    function decorateUnitPrice(item) {
        var name = item.querySelector('.productName a');
        var price = item.querySelector('.productPrice .discountPriceSpan');
        if (!name || !price) return;
        var quantity = name.textContent.match(/(?:^|[\s(])([2356])\s*['’ʼ]?\s*[lL][ıiİIuUüÜ](?=$|[\s),])/);
        var current = price.querySelector('.ots-unit-price, .ots-home-unit-price');
        if (!quantity) { if (current && current.hasAttribute('data-ots-showtime-owned')) current.remove(); return; }
        if (current && !current.hasAttribute('data-ots-showtime-owned')) return;
        var saleText = Array.from(price.childNodes).filter(function (node) { return node.nodeType === 3; })
            .map(function (node) { return node.textContent; }).join('').replace(/[^\d,.-]/g, '');
        var sale = Number(saleText.replace(/\./g, '').replace(',', '.'));
        if (!Number.isFinite(sale) || sale <= 0) return;
        var unit = (sale / Number(quantity[1])).toLocaleString('tr-TR', { minimumFractionDigits:2, maximumFractionDigits:2 });
        if (!current) {
            current = document.createElement('span');
            current.className = 'ots-unit-price';
            current.dataset.otsShowtimeOwned = 'true';
            price.appendChild(current);
        }
        var label = '( ' + unit + ' / adet )';
        if (current.textContent !== label) current.textContent = label;
        current.setAttribute('aria-label', 'Adet fiyatı ' + unit + ' Türk lirası');
    }

    function decorate(item, type, first) {
        item.classList.add('ots-showtime-feature', 'ots-showtime-' + type);
        item.classList.toggle('ots-showtime-pair-start', first);
        decorateBackdrop(item);
        var detail = item.querySelector('.productDetail');
        if (detail && !detail.querySelector('.ots-showtime-heading')) {
            var heading = document.createElement('span');
            heading.className = 'ots-showtime-heading';
            heading.dataset.otsShowtimeOwned = 'true';
            heading.textContent = type === 'single' ? 'Konforu keşfedin.' : (first ? 'Her gün, sizinle.' : 'Stilinize eşlik etsin.');
            detail.insertBefore(heading, detail.firstChild);
        }
        decorateUnitPrice(item);
        decorateShipping(item);
        watchImage(item);
        setupMotion(item);
    }
    function refresh() {
        if (stopped) return;
        var current = document.getElementById(ID);
        if (!current || current.classList.contains('pr_hrz')) {
            clearList(list); list = current; state = null; return;
        }
        var items = cards(current), keys = items.map(key);
        var measuredTotal = totalCount(current, items.length);
        // Yalnızca listenin sonuna ekleme eski planı korur; sıralama, filtre veya
        // liste değişiminde yeni plan oluşturulur.
        var append = list === current && state && state.mobile === mobileBanners.matches && measuredTotal >= state.total && state.keys.length <= keys.length && state.keys.every(function (value, i) { return value === keys[i] && state.nodes[i] === items[i]; });
        if (!append) { clearList(list); items.forEach(clearItem); state = newState(measuredTotal); effectDeck = []; }
        list = current;
        extendPlan(measuredTotal, items);
        list.classList.add(PREFIX);
        items.forEach(function (item) { item.classList.add('ots-showtime-item'); owned.add(item); });
        state.events.forEach(function (event) {
            // Çiftin ikinci ürünü henüz yüklenmediyse yarım vitrin oluşturulmaz.
            if (event.start + event.size > items.length) return;
            for (var i = 0; i < event.size; i += 1) decorate(items[event.start + i], event.size === 1 ? 'single' : 'pair', event.size === 2 && i === 0);
        });
        state.keys = keys;
        state.nodes = items;
        // Sayfadan kaldırılan kartlar bırakılır; sonsuz kaydırmada eski DOM bellekte tutulmaz.
        Array.from(owned).forEach(function (item) { if (!item.isConnected) clearItem(item); });
    }
    function schedule() {
        if (stopped) return;
        window.clearTimeout(timer);
        timer = window.setTimeout(refresh, 90);
    }
    function init() {
        if (stopped) return;
        style = document.createElement('style'); style.id = 'ots-showtime-style'; style.textContent = css;
        document.head.appendChild(style);
        if (window.IntersectionObserver) imageObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var img = entry.target;
                var src = img.getAttribute('src') || '';
                var original = img.getAttribute('data-original') || img.getAttribute('data-src');
                var actual = imageURL(original);
                if (actual && (!src || /(?:load|loading|placeholder|spacer)\.(gif|png|svg)|^data:image/i.test(src))) img.src = actual;
                // Ticimax küçük resmini yalnızca görünür banner için büyük sürüme yükselt.
                // Büyük sürüm bulunamazsa orijinal resim gösterilmeye devam eder.
                var large = actual.replace('/UrunResimleri/thumb/', '/UrunResimleri/buyuk/');
                if (large && large !== actual) {
                    var preload = new Image();
                    preload.onload = function () {
                        if (!stopped && img.isConnected && (img.getAttribute('data-original') || img.getAttribute('data-src')) === original) img.src = large;
                    };
                    preload.src = large;
                }
                imageObserver.unobserve(img);
            });
        }, { rootMargin:'300px 0px' });
        if (window.IntersectionObserver) motionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var motion = motionCards.get(entry.target);
                if (!motion) return;
                motion.visible = entry.isIntersecting;
                motion.item.classList.toggle('ots-showtime-inview', motion.visible);
                if (motion.visible) { loadGallery(motion); armMotion(motion); }
                else stopMotion(motion);
            });
        }, { threshold:0 });
        document.addEventListener('visibilitychange', syncMotion);
        reducedMotion.addEventListener('change', syncMotion);
        mobileBanners.addEventListener('change', schedule);
        refresh();
        observer = new MutationObserver(function (mutations) {
            var relevant = mutations.some(function (mutation) {
                var target = mutation.target.nodeType === 1 ? mutation.target : mutation.target.parentElement;
                if (!target || target.closest('[data-ots-showtime-owned]')) return false;
                if (mutation.type === 'attributes') {
                    if (mutation.attributeName === 'class') {
                        if (target.closest('#' + ID + ' .ItemOrj') && (target.classList.contains('TukendiIco') || /(?:^|\s)TukendiIco(?:\s|$)/.test(mutation.oldValue || ''))) return true;
                        return target.id === ID && /(?:^|\s)pr_hrz(?:\s|$)/.test(mutation.oldValue || '') !== target.classList.contains('pr_hrz');
                    }
                    return target.id === ID || (target.parentElement && target.parentElement.id === ID) || !!target.closest('#' + ID + ' .productName');
                }
                if (target.id === ID || target.closest('#' + ID + ' .productName') || target.closest('#' + ID + ' .ots-showtime-feature .productPrice, #' + ID + ' .ots-showtime-feature .cargoIcon') || target.closest('#divSayfalamaAlt, #divSayfalamaUst')) return true;
                return Array.from(mutation.addedNodes).concat(Array.from(mutation.removedNodes)).some(function (node) {
                    return node.nodeType === 1 && (node.id === ID || (node.querySelector && node.querySelector('#' + ID)) ||
                        (target.closest('#' + ID + ' .ItemOrj') && (node.matches('.TukendiIco, .cargoIcon') || node.querySelector('.TukendiIco, .cargoIcon'))));
                });
            });
            if (relevant) schedule();
        });
        observer.observe(document.body, { childList:true, subtree:true, characterData:true, attributes:true, attributeOldValue:true, attributeFilter:['data-showtime-total', 'href', 'hidden', 'class'] });
        window.addEventListener('popstate', schedule);
    }
    window.otsShowtime = {
        version:VERSION,
        refresh:schedule,
        inspect:function () { return state ? { total:state.total, loaded:state.keys.length, rows:state.events.map(function (e) { return { product:e.start + 1, type:e.size === 1 ? 'single' : 'pair', applied:e.start + e.size <= state.keys.length }; }) } : null; },
        destroy:function () {
            stopped = true; window.clearTimeout(timer);
            document.removeEventListener('DOMContentLoaded', init); window.removeEventListener('popstate', schedule);
            if (observer) observer.disconnect(); if (imageObserver) imageObserver.disconnect();
            if (motionObserver) motionObserver.disconnect();
            document.removeEventListener('visibilitychange', syncMotion); reducedMotion.removeEventListener('change', syncMotion); mobileBanners.removeEventListener('change', schedule); galleryCache.clear();
            clearList(list); if (style) style.remove(); state = null; list = null; delete window.otsShowtime;
        }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true }); else init();
}(window, document));

/* ========================================================================
 * BÖLÜM 4: ÜRÜN KARTLARINDA VARYANT GÖRSELLERİ
 *
 * Ürün XML verisini kullanarak kategori listesindeki kartlara renk/varyant küçük
 * görsellerini ekler; görsele dokunulduğunda ürün detayına yönlendirir.
 *
 * Renk haritası localStorage'da saklanır: 30 dakikadan yeni kayıt doğrudan
 * kullanılır, 24 saate kadar eski kayıt hemen gösterilip arka planda yenilenir.
 * Liste HTML'de hazırsa XML isteği DOM tamamlanmadan başlar. Gözlemci yalnızca
 * yeni ürün kartı eklendiğinde çalışır; işlenmiş kartlar tekrar taranmaz.
 * Showtime vitrin kartlarındaki büyük görünüm Bölüm 3 stillerinden gelir.
 * ====================================================================== */
(function (window, document) {
    'use strict';

    // Dosya birden fazla kez yüklense bile varyant şeridini yalnızca bir kez başlat.
    if (window.__otsProductVariantStripLoaded) return;
    window.__otsProductVariantStripLoaded = true;

    var XML_URL = 'https://www.otsicgiyim.com/TicimaxCustomXml/EE3253A150FC47DA9765BFA512F7D1E3/';
    var CACHE_KEY = 'ots_variants_map_v2';
    var CACHE_TTL = 30 * 60 * 1000;
    var STALE_MAX = 24 * 60 * 60 * 1000;
    var MAX_ICONS = 5;
    var LIST_ID = 'ProductPageProductList';
    var STYLE_ID = 'variant-strip-styles';
    var CARD_SELECTOR = '.ItemOrj, .productDetail, .productName';

    var colorMap = null;
    var cardState = new WeakMap();
    var scheduled = false;
    var loadStarted = false;
    var observer = null;

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
.variant-strip { display:flex; flex-wrap:wrap; justify-content:flex-start; gap:8px; margin-bottom:10px; width:100%; }
.variant-thumb { display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer; text-decoration:none; flex:0 0 auto; }
.variant-thumb img { width:38px; height:38px; object-fit:cover; border-radius:50%; border:1px solid #eaeaea; background:#f5f5f5; display:block; transition:transform .2s ease; }
.variant-thumb:hover img { transform:scale(1.08); }
.variant-thumb span { font-size:10px; font-weight:600; color:#333; text-align:center; line-height:1.2; max-width:46px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; display:block; }
.variant-more { display:flex; flex-direction:column; align-items:center; gap:4px; cursor:pointer; text-decoration:none; }
.variant-more__circle { width:38px; height:38px; border-radius:50%; background:#f0f0f0; border:1px solid #eaeaea; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#444; }
.variant-more__label { visibility:hidden; font-size:10px; }
@media (prefers-reduced-motion: reduce) { .variant-thumb img { transition:none; } .variant-thumb:hover img { transform:none; } }
`;
        (document.head || document.documentElement).appendChild(style);
    }

    // --- Veri: XML okuma ve önbellek ---

    function normalizePath(value) {
        if (!value) return '';
        var path;
        try {
            path = new URL(value, window.location.origin).pathname;
        } catch (_) {
            path = value.replace(/^https?:\/\/[^\/]+/i, '');
        }
        return path.replace(/^\/+|\/+$/g, '').toLowerCase();
    }

    function colorOf(option) {
        var features = option.getElementsByTagName('Ozellik');
        for (var i = 0; i < features.length; i += 1) {
            if ((features[i].getAttribute('Tanim') || '').toLowerCase() === 'renk') return features[i].textContent.trim();
        }
        return '';
    }

    function parseXml(xmlText) {
        var doc = new DOMParser().parseFromString(xmlText, 'text/xml');
        var products = doc.getElementsByTagName('Urun');
        var map = {};
        var seenByPath = {};

        for (var i = 0; i < products.length; i += 1) {
            var urlEl = products[i].getElementsByTagName('UrunUrl')[0];
            var path = normalizePath(urlEl ? urlEl.textContent.trim() : '');
            if (!path) continue;

            var seen = seenByPath[path] || (seenByPath[path] = {});
            var options = products[i].getElementsByTagName('Secenek');
            for (var j = 0; j < options.length; j += 1) {
                var renk = colorOf(options[j]);
                // Aynı rengin beden seçenekleri tek görselle gösterilir.
                if (!renk || seen[renk]) continue;
                seen[renk] = true;
                var imageEl = options[j].getElementsByTagName('Resim')[0];
                (map[path] || (map[path] = [])).push({ renk: renk, resim: imageEl ? imageEl.textContent.trim() : '' });
            }
        }
        return map;
    }

    function readCache() {
        try {
            var data = JSON.parse(window.localStorage.getItem(CACHE_KEY) || 'null');
            return data && data.map && typeof data.ts === 'number' ? data : null;
        } catch (_) {
            return null;
        }
    }

    function writeCache(map) {
        try {
            window.localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), map: map }));
        } catch (_) { }
        // Eski sürümün sekme bazlı kayıtları artık kullanılmaz.
        try {
            window.sessionStorage.removeItem('ots_variants_map_v1');
            window.sessionStorage.removeItem('ots_variants_map_ts');
        } catch (_) { }
    }

    function setMap(map, refreshed) {
        colorMap = map;
        // Yenilenen veride yeni renk alan ürünlerin kartları yeniden değerlendirilir.
        if (refreshed) cardState = new WeakMap();
        schedule();
    }

    function load() {
        if (loadStarted) return;
        loadStarted = true;

        var cached = readCache();
        var age = cached ? Date.now() - cached.ts : Infinity;
        if (cached && age < STALE_MAX) setMap(cached.map, false);
        if (age < CACHE_TTL) return;

        fetch(XML_URL)
            .then(function (response) {
                if (!response.ok) throw new Error('Ağ hatası: ' + response.status);
                return response.text();
            })
            .then(function (xmlText) {
                var map = parseXml(xmlText);
                writeCache(map);
                setMap(map, !!colorMap);
            })
            .catch(function (error) {
                if (window.console && typeof window.console.warn === 'function') {
                    window.console.warn('[OTS Varyant] Hata:', error);
                }
            });
    }

    // --- Kart şeridi ---

    function thumbUrl(src) {
        if (!src) return '';
        return src.indexOf('cdn-cgi/image/') !== -1 ? src.replace(/width=\d+/, 'width=100') : src.replace('/buyuk/', '/thumb/');
    }

    function onThumbError() {
        // Küçük görsel yoksa XML'deki orijinal görsel bir kez denenir.
        this.onerror = null;
        var full = this.getAttribute('data-full');
        if (full && this.src !== full) this.src = full;
    }

    function createThumb(variant, href) {
        var link = document.createElement('a');
        link.className = 'variant-thumb';
        link.href = href;
        link.title = variant.renk;

        var img = document.createElement('img');
        img.alt = '';
        img.width = 38;
        img.height = 38;
        img.loading = 'lazy';
        img.decoding = 'async';
        if (variant.resim) {
            img.setAttribute('data-full', variant.resim);
            img.onerror = onThumbError;
            img.src = thumbUrl(variant.resim);
        }

        var label = document.createElement('span');
        label.textContent = variant.renk;

        link.appendChild(img);
        link.appendChild(label);
        return link;
    }

    function createMore(hiddenCount, href) {
        var more = document.createElement('a');
        more.className = 'variant-more';
        more.href = href;
        more.title = '+' + hiddenCount + ' renk daha';
        more.setAttribute('aria-label', '+' + hiddenCount + ' renk daha');

        var circle = document.createElement('div');
        circle.className = 'variant-more__circle';
        circle.textContent = '+' + hiddenCount;

        var label = document.createElement('span');
        label.className = 'variant-more__label';
        label.textContent = ' ';

        more.appendChild(circle);
        more.appendChild(label);
        return more;
    }

    function injectStrip(card, variants, href) {
        var current = card.querySelector('.variant-strip');
        if (current) {
            if (current.getAttribute('data-href') === href) return;
            current.remove();
        }

        var overflow = variants.length > MAX_ICONS;
        var visibleCount = overflow ? MAX_ICONS - 1 : variants.length;
        var strip = document.createElement('div');
        strip.className = 'variant-strip';
        strip.setAttribute('data-href', href);

        for (var i = 0; i < visibleCount; i += 1) strip.appendChild(createThumb(variants[i], href));
        if (overflow) strip.appendChild(createMore(variants.length - visibleCount, href));

        // Şerit tek seferde, ürün adının hemen üstüne eklenir.
        var detail = card.querySelector('.productDetail') || card;
        var name = detail.querySelector('.productName');
        if (name && name.parentNode) name.parentNode.insertBefore(strip, name);
        else detail.insertBefore(strip, detail.firstChild);
    }

    function processCard(card) {
        var link = card.querySelector('a.detailUrl') || card.querySelector('a');
        if (!link) return;
        var href = link.getAttribute('href') || '';
        var known = cardState.get(card);

        // Aynı bağlantıyla işlenmiş kart: varyantı yoksa ya da şeridi duruyorsa atlanır.
        if (known && known.href === href) {
            if (known.variants && !card.querySelector('.variant-strip')) injectStrip(card, known.variants, href);
            return;
        }

        var variants = colorMap[normalizePath(href)] || null;
        cardState.set(card, { href: href, variants: variants });
        if (variants && variants.length) injectStrip(card, variants, href);
    }

    function applyAll() {
        scheduled = false;
        if (!colorMap) return;
        var root = document.getElementById(LIST_ID) || document;
        var cards = root.querySelectorAll('.ItemOrj');
        for (var i = 0; i < cards.length; i += 1) processCard(cards[i]);
    }

    function schedule() {
        if (scheduled) return;
        scheduled = true;
        (window.requestAnimationFrame || function (callback) { return window.setTimeout(callback, 16); })(applyAll);
    }

    // --- Gözlemci ---

    function isCardNode(node) {
        if (node.nodeType !== 1 || node.classList.contains('variant-strip')) return false;
        return node.matches(CARD_SELECTOR) || !!node.querySelector(CARD_SELECTOR);
    }

    function observe() {
        if (observer || !window.MutationObserver || !document.body) return;
        // Liste öğesi filtre/sıralamada tamamen değişebildiği için body izlenir;
        // yalnızca ürün kartı içeren eklemeler tarama tetikler.
        observer = new MutationObserver(function (records) {
            if (!colorMap || scheduled) return;
            for (var i = 0; i < records.length; i += 1) {
                var added = records[i].addedNodes;
                for (var j = 0; j < added.length; j += 1) {
                    if (isCardNode(added[j])) { schedule(); return; }
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function hasListing() {
        return !!(document.getElementById(LIST_ID) || document.querySelector('.ItemOrj'));
    }

    function boot() {
        if (!hasListing()) return;
        injectStyles();
        load();
        observe();
        schedule();
    }

    // Liste HTML'de zaten varsa XML isteği DOM tamamlanmadan başlar.
    if (document.getElementById(LIST_ID)) load();

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
}(window, document));
