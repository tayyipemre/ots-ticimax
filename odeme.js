/*
 * ÖTS İÇ GİYİM - ÖDEME SAYFASI MODÜLLERİ
 *
 * Yükleme adresi : https://ornekler.com.tr/js/ots/odeme.js
 * Çalıştığı yer  : Checkout ödeme adımı (/checkout?step=payment); Google Tag
 *                  Manager (GTM-KBF9BXW) "Özel HTML" etiketiyle yüklenir
 *
 * Ödeme adımı tam sayfa yenilemeyle açılır ve Ticimax burada panel script
 * alanlarındaki hiçbir kodu çalıştırmaz; bu adıma özel düzenlemeler bu
 * dosyadadır ve GTM üzerinden eklenir.
 * Her bölüm kendi kapsamında (IIFE) bağımsız çalışır.
 *
 * Bölümler:
 *  1. Adres formu sadeleştirme
 */

/* ========================================================================
 * BÖLÜM 1: ADRES FORMU SADELEŞTİRME
 *
 * Adres formundaki fatura tipi seçimini ve adres başlığı alanını gizler.
 * Gizlenen adres başlığı boşsa "Adresim" ile doldurulur; e-posta alanına
 * "(zorunlu değil)" ibaresi eklenir.
 * ====================================================================== */
(function () {
    'use strict';

    if (window.__otsAddressFormV1) return;
    window.__otsAddressFormV1 = true;

    var styleId = 'otsAdresAlanlariniGizle';
    var style = document.getElementById(styleId);

    if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
    }

    style.textContent = `
        .bill-type-wrapper,
        .form-field[data-cy="address-form-definition"] {
            display: none !important;
        }

        [data-cy="address-form-mail"] .textfield-label::after {
            content: " (zorunlu değil)";
        }
    `;

    // Vue'nun değeri algılaması için input'un yerel value setter'ı kullanılır.
    var valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;

    /* Gizli adres başlığı alanı boşsa varsayılan değeri yazar ve
       form doğrulamasının görmesi için input/change olaylarını tetikler. */
    function doldur() {
        document.querySelectorAll(
            '.form-field[data-cy="address-form-definition"] input'
        ).forEach(function (input) {
            if (input.value.trim()) return;

            valueSetter.call(input, 'Adresim');
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    /* Adres formu sonradan açıldığında veya yeniden çizildiğinde alanı tekrar doldurur. */
    function init() {
        new MutationObserver(doldur).observe(document.body, {
            childList: true,
            subtree: true
        });

        doldur();
    }

    // Script head içinde çalışırsa body oluşana kadar bekler.
    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init, { once: true });
})();
