/*
 * ÖTS İÇ GİYİM - KAMPANYALAR SAYFASI
 *
 * Yükleme adresi : https://ornekler.com.tr/js/ots/sayfalar/kampanyalar.js
 * Çalıştığı yer  : Kampanyalar sayfası
 *
 * Yalnızca bu sayfada çalışan arayüz modülüdür.
 *
 * Bölümler:
 *  1. Kampanya kartları ve bülten formu
 */

/* ========================================================================
 * BÖLÜM 1: KAMPANYA KARTLARI VE BÜLTEN FORMU
 *
 * Aktif/pasif kampanyaları veri listesinden üretir, eski sayfa içeriğini
 * güvenle gizler ve var olan Ticimax bülten gönderim akışını tekrar kullanır.
 * ====================================================================== */
(function () {
    'use strict';

    var ROOT_ID = 'otsCampaignPage';
    var STYLE_ID = 'otsCampaignPageStyles';
    var WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=902163135687&text=' + encodeURIComponent('Merhaba, ÖTS kampanyaları hakkında bilgi almak istiyorum. ');

    var campaigns = [
        {
            active: true,
            tag: 'Kasım Fırsatları',
            title: 'Tüm Ürünlerde %30 İndirim Fırsatı!',
            subtitle: '3000 TL ve üzeri alışverişlerde 250 TL indirim',
            description: 'Sepet avantajı ve havale/EFT fırsatı birlikte seni bekliyor.',
            image: 'https://static.ticimax.cloud/cdn-cgi/image/width=1497,quality=99,format=webp/30662/uploads/sayfatasarim/sayfa33/ic-giyim-indirim-8a211.jpg',
            url: 'https://www.otsicgiyim.com/sepet-kampanyasi',
            cta: 'Kampanyayı incele',
            pill: '%30 + 250 TL'
        },
        {
            active: true,
            tag: 'Üyelik Fırsatı',
            title: 'İlk Üyeliğe Özel 100 TL İndirim!',
            subtitle: 'Havale ödemelerinde %5 ekstra indirim',
            description: 'Sepet avantajı ve havale/EFT fırsatı birlikte seni bekliyor.',
            image: 'https://static.ticimax.cloud/cdn-cgi/image/width=1905,quality=99,format=webp/30662/uploads/sayfatasarim/sayfa33/ic-giyim-ucretsiz-kargo-8d11.jpg',
            url: 'https://www.otsicgiyim.com/sepet-kampanyasi',
            cta: 'Kampanyayı incele',
            pill: '100 TL + %5'
        },
        {
            active: false,
            tag: 'Ekim Fırsatları',
            title: 'Tüm Ürünlerde %20 İndirim Fırsatı!',
            subtitle: 'Havale ödemelerinde %5 ekstra indirim',
            description: 'Sepet avantajı ve havale/EFT fırsatı birlikte seni bekliyor.',
            image: 'https://static.ticimax.cloud/cdn-cgi/image/width=1497,quality=99,format=webp/30662/uploads/sayfatasarim/sayfa33/ic-giyim-indirim-8a21.jpg',
            url: 'https://www.otsicgiyim.com/sepet-kampanyasi',
            cta: 'Kampanyayı incele',
            pill: '%20 + %5'
        },
        {
            active: false,
            tag: 'Eylül Fırsatları',
            title: 'Tüm Kadın ve Erkek İç Giyim Ürünlerinde %10 İndirim',
            subtitle: 'Havale ödemelerinde %5 ekstra indirim',
            description: 'Sepet avantajı ve havale/EFT fırsatı birlikte seni bekliyor.',
            image: 'https://static.ticimax.cloud/cdn-cgi/image/width=1960,quality=99,format=webp/30662/uploads/sayfatasarim/sayfa33/kadin-erkek-ic-giyim-316a.jpg',
            url: 'https://www.otsicgiyim.com/sepet-kampanyasi',
            cta: 'Kampanyayı incele',
            pill: '%10 + %5'
        },
        {
            active: false,
            tag: 'Okula dönüş',
            title: 'Okula Geri Dönüş Başladı',
            subtitle: 'Tüm çocuk iç giyim ürünlerinde 3 Al 2 Öde',
            description: 'Çocuk koleksiyonlarında okul dönemine konforlu başlangıç.',
            image: 'https://static.ticimax.cloud/cdn-cgi/image/width=1960,quality=99,format=webp/30662/uploads/sayfatasarim/sayfa33/ic-giyim-indirim-fc0f.jpg',
            url: 'https://www.otsicgiyim.com/3-al-2-ode',
            cta: '3 Al 2 Öde’ye git',
            pill: '3 Al 2 Öde'
        }
    ];

    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            'body {',
            '  --ots-campaign-navy: #0c154c;',
            '  --ots-campaign-navy-2: #172568;',
            '  --ots-campaign-cyan: #73d8ef;',
            '  --ots-campaign-sky: #eef9ff;',
            '  --ots-campaign-muted: #66708b;',
            '}',
            '#mainHolder_divDesign { width: 100% !important; max-width: none !important; }',
            '#mainHolder_divDesign > div,',
            '#mainHolder_divDesign .ticiContainer { width: 100% !important; max-width: none !important; padding-left: 0 !important; padding-right: 0 !important; }',
            '.ots-campaign-page-hidden { display: none !important; }',
            '#otsCampaignPage, #otsCampaignPage * { box-sizing: border-box; }',
            '#otsCampaignPage {',
            '  position: relative;',
            '  width: 100%;',
            '  overflow: hidden;',
            '  padding: 72px 24px 84px;',
            '  color: var(--ots-campaign-navy);',
            '  background:',
            '    radial-gradient(circle at 12% 12%, rgba(115,216,239,.28), transparent 30%),',
            '    radial-gradient(circle at 92% 8%, rgba(12,21,76,.1), transparent 34%),',
            '    linear-gradient(180deg, #fbfdff 0%, #f4f9fc 100%);',
            '  font-family: Manrope, "DM Sans", sans-serif;',
            '}',
            '#otsCampaignPage::before {',
            '  content: "";',
            '  position: absolute;',
            '  inset: 0;',
            '  opacity: .42;',
            '  pointer-events: none;',
            '  background-image: radial-gradient(circle, rgba(12,21,76,.13) 0 1.2px, transparent 1.5px);',
            '  background-size: 24px 24px;',
            '}',
            '.ots-campaign-page-wrap {',
            '  position: relative;',
            '  z-index: 1;',
            '  width: min(1260px, 100%);',
            '  margin: 0 auto;',
            '}',
            '.ots-campaign-hero {',
            '  display: grid;',
            '  grid-template-columns: minmax(0, .92fr) minmax(330px, .55fr);',
            '  gap: clamp(24px, 4vw, 58px);',
            '  align-items: end;',
            '  margin-bottom: 30px;',
            '}',
            '.ots-campaign-kicker {',
            '  display: inline-flex;',
            '  align-items: center;',
            '  gap: 12px;',
            '  margin: 0 0 18px;',
            '  color: var(--ots-campaign-navy);',
            '  font-size: 12px;',
            '  font-weight: 850;',
            '  letter-spacing: .19em;',
            '  text-transform: uppercase;',
            '}',
            '.ots-campaign-kicker::before { content: ""; width: 36px; height: 1px; background: currentColor; opacity: .7; }',
            '.ots-campaign-title {',
            '  max-width: 850px;',
            '  margin: 0;',
            '  color: var(--ots-campaign-navy);',
            '  font-size: clamp(42px, 6vw, 88px);',
            '  font-weight: 850;',
            '  line-height: .94;',
            '  letter-spacing: -.07em;',
            '}',
            '.ots-campaign-title span { color: #2092b2; }',
            '.ots-campaign-lead {',
            '  max-width: 690px;',
            '  margin: 22px 0 0;',
            '  color: var(--ots-campaign-muted);',
            '  font-size: 16px;',
            '  font-weight: 650;',
            '  line-height: 1.8;',
            '}',
            '.ots-campaign-hero-panel {',
            '  position: relative;',
            '  padding: 26px;',
            '  overflow: hidden;',
            '  border: 1px solid rgba(12,21,76,.1);',
            '  border-radius: 30px;',
            '  background: rgba(255,255,255,.78);',
            '  box-shadow: 0 24px 70px rgba(12,21,76,.1);',
            '  backdrop-filter: blur(12px);',
            '}',
            '.ots-campaign-hero-panel::after {',
            '  content: "";',
            '  position: absolute;',
            '  right: -52px;',
            '  top: -52px;',
            '  width: 160px;',
            '  height: 160px;',
            '  border-radius: 50%;',
            '  border: 1px solid rgba(12,21,76,.1);',
            '  box-shadow: 0 0 0 32px rgba(115,216,239,.12);',
            '}',
            '.ots-campaign-hero-panel strong {',
            '  display: block;',
            '  max-width: 270px;',
            '  color: var(--ots-campaign-navy);',
            '  font-size: 28px;',
            '  font-weight: 850;',
            '  line-height: 1.08;',
            '  letter-spacing: -.045em;',
            '}',
            '.ots-campaign-hero-panel p {',
            '  max-width: 330px;',
            '  margin: 16px 0 0;',
            '  color: var(--ots-campaign-muted);',
            '  font-size: 13px;',
            '  font-weight: 650;',
            '  line-height: 1.65;',
            '}',
            '.ots-campaign-mini-badges { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 22px; }',
            '.ots-campaign-mini-badges span {',
            '  display: inline-flex;',
            '  align-items: center;',
            '  min-height: 34px;',
            '  padding: 0 13px;',
            '  color: var(--ots-campaign-navy);',
            '  font-size: 11px;',
            '  font-weight: 850;',
            '  border: 1px solid rgba(12,21,76,.12);',
            '  border-radius: 999px;',
            '  background: #fff;',
            '}',
            '.ots-campaign-grid {',
            '  display: grid;',
            '  grid-template-columns: repeat(2, minmax(0, 1fr));',
            '  gap: 20px;',
            '  margin-top: 32px;',
            '}',
            '.ots-campaign-card {',
            '  position: relative;',
            '  min-height: 620px;',
            '  display: flex;',
            '  flex-direction: column;',
            '  overflow: hidden;',
            '  padding: 1px;',
            '  border-radius: 34px;',
            '  background: linear-gradient(135deg, rgba(115,216,239,.95), rgba(12,21,76,.32), rgba(255,255,255,.8));',
            '  box-shadow: 0 28px 80px rgba(12,21,76,.13);',
            '}',
            '.ots-campaign-card.is-passive {',
            '  background: linear-gradient(135deg, rgba(161,171,187,.7), rgba(96,106,125,.32), rgba(255,255,255,.8));',
            '  box-shadow: 0 20px 56px rgba(12,21,76,.08);',
            '}',
            '.ots-campaign-card::before {',
            '  content: "";',
            '  position: absolute;',
            '  width: 180%;',
            '  height: 180%;',
            '  left: -40%;',
            '  top: -40%;',
            '  background: conic-gradient(from 0deg, transparent 0 16%, rgba(115,216,239,.92) 24%, transparent 38%, rgba(12,21,76,.58) 55%, transparent 74%, rgba(255,255,255,.88) 88%, transparent 100%);',
            '  animation: otsCampaignPageBorder 10s linear infinite;',
            '}',
            '.ots-campaign-card.is-passive::before { animation: none; opacity: .25; }',
            '.ots-campaign-card-inner {',
            '  position: relative;',
            '  z-index: 1;',
            '  height: 100%;',
            '  display: flex;',
            '  flex-direction: column;',
            '  overflow: hidden;',
            '  border-radius: 33px;',
            '  background: #fff;',
            '}',
            '.ots-campaign-image {',
            '  position: relative;',
            '  min-height: 310px;',
            '  overflow: hidden;',
            '  background: var(--ots-campaign-sky);',
            '}',
            '.ots-campaign-image img {',
            '  width: 100%;',
            '  height: 100%;',
            '  min-height: 310px;',
            '  display: block;',
            '  object-fit: cover;',
            '  transition: transform .55s cubic-bezier(.2,.75,.2,1);',
            '}',
            '.ots-campaign-card:hover .ots-campaign-image img { transform: scale(1.045); }',
            '.ots-campaign-card.is-passive:hover .ots-campaign-image img { transform: none; }',
            '.ots-campaign-card.is-passive .ots-campaign-image img { filter: grayscale(.72) saturate(.45) contrast(.92); opacity: .72; }',
            '.ots-campaign-card.is-passive .ots-campaign-image::after {',
            '  content: "ŞU AN AKTİF DEĞİL";',
            '  position: absolute;',
            '  inset: 0;',
            '  z-index: 1;',
            '  display: flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  padding: 20px;',
            '  color: #fff;',
            '  font-size: 13px;',
            '  font-weight: 900;',
            '  letter-spacing: .13em;',
            '  text-align: center;',
            '  background: rgba(12,21,76,.23);',
            '}',
            '.ots-campaign-pill {',
            '  position: absolute;',
            '  right: 18px;',
            '  top: 18px;',
            '  display: inline-flex;',
            '  align-items: center;',
            '  min-height: 42px;',
            '  padding: 0 16px;',
            '  color: #fff;',
            '  font-size: 13px;',
            '  font-weight: 900;',
            '  letter-spacing: -.02em;',
            '  border-radius: 999px;',
            '  background: rgba(12,21,76,.92);',
            '  box-shadow: 0 16px 36px rgba(12,21,76,.22);',
            '}',
            '.ots-campaign-card.is-passive .ots-campaign-pill { z-index: 2; background: rgba(79,88,105,.9); box-shadow: none; }',
            '.ots-campaign-content {',
            '  flex: 1;',
            '  display: flex;',
            '  flex-direction: column;',
            '  padding: 30px;',
            '}',
            '.ots-campaign-tag {',
            '  display: inline-flex;',
            '  align-items: center;',
            '  gap: 9px;',
            '  margin: 0 0 13px;',
            '  color: #1d8dab;',
            '  font-size: 11px;',
            '  font-weight: 900;',
            '  letter-spacing: .16em;',
            '  text-transform: uppercase;',
            '}',
            '.ots-campaign-tag::before { content: ""; width: 28px; height: 1px; background: currentColor; }',
            '.ots-campaign-card h2 {',
            '  max-width: 560px;',
            '  margin: 0;',
            '  color: var(--ots-campaign-navy);',
            '  font-size: clamp(27px, 3vw, 44px);',
            '  font-weight: 850;',
            '  line-height: 1.02;',
            '  letter-spacing: -.055em;',
            '}',
            '.ots-campaign-subtitle {',
            '  margin: 16px 0 0;',
            '  color: #1583a2;',
            '  font-size: 18px;',
            '  font-weight: 850;',
            '  line-height: 1.28;',
            '}',
            '.ots-campaign-description {',
            '  max-width: 540px;',
            '  margin: 12px 0 28px;',
            '  color: var(--ots-campaign-muted);',
            '  font-size: 14px;',
            '  font-weight: 650;',
            '  line-height: 1.7;',
            '}',
            '.ots-campaign-card.is-passive .ots-campaign-tag,',
            '.ots-campaign-card.is-passive .ots-campaign-subtitle { color: #69758a; }',
            '.ots-campaign-card.is-passive h2,',
            '.ots-campaign-card.is-passive .ots-campaign-description { color: #758095; }',
            '.ots-campaign-actions {',
            '  display: flex;',
            '  gap: 12px;',
            '  flex-wrap: wrap;',
            '  margin-top: auto;',
            '}',
            '.ots-campaign-btn {',
            '  min-height: 52px;',
            '  display: inline-flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  gap: 10px;',
            '  padding: 0 22px;',
            '  color: #fff !important;',
            '  font-size: 13px;',
            '  font-weight: 900;',
            '  letter-spacing: .02em;',
            '  text-decoration: none !important;',
            '  border: 1px solid var(--ots-campaign-navy);',
            '  border-radius: 15px;',
            '  background: var(--ots-campaign-navy);',
            '  box-shadow: 0 16px 36px rgba(12,21,76,.18);',
            '  transition: transform .22s ease, background .22s ease;',
            '}',
            '.ots-campaign-btn:hover { transform: translateY(-2px); background: var(--ots-campaign-navy-2); }',
            '.ots-campaign-btn.is-secondary {',
            '  color: var(--ots-campaign-navy) !important;',
            '  border-color: rgba(12,21,76,.16);',
            '  background: #fff;',
            '  box-shadow: none;',
            '}',
            '.ots-campaign-btn.is-secondary:hover { color: #fff !important; background: var(--ots-campaign-navy); }',
            '.ots-campaign-btn.is-disabled,',
            '.ots-campaign-btn.is-disabled:hover {',
            '  color: #69758a !important;',
            '  border-color: #d7dde6;',
            '  background: #eef1f5;',
            '  box-shadow: none;',
            '  cursor: not-allowed;',
            '  transform: none;',
            '}',
            '.ots-campaign-cta {',
            '  display: grid;',
            '  grid-template-columns: minmax(0, .88fr) minmax(320px, .62fr);',
            '  gap: 18px;',
            '  margin-top: 22px;',
            '}',
            '.ots-campaign-signup, .ots-campaign-message-card {',
            '  min-height: 210px;',
            '  padding: 28px;',
            '  border: 1px solid rgba(12,21,76,.1);',
            '  border-radius: 30px;',
            '  background: rgba(255,255,255,.78);',
            '  box-shadow: 0 20px 60px rgba(12,21,76,.075);',
            '}',
            '.ots-campaign-signup h2, .ots-campaign-message-card h2 {',
            '  max-width: 540px;',
            '  margin: 0;',
            '  color: var(--ots-campaign-navy);',
            '  font-size: clamp(24px, 3vw, 36px);',
            '  font-weight: 850;',
            '  line-height: 1.06;',
            '  letter-spacing: -.045em;',
            '}',
            '.ots-campaign-signup p, .ots-campaign-message-card p {',
            '  max-width: 560px;',
            '  margin: 11px 0 0;',
            '  color: var(--ots-campaign-muted);',
            '  font-size: 13px;',
            '  font-weight: 650;',
            '  line-height: 1.65;',
            '}',
            '.ots-campaign-form {',
            '  display: grid;',
            '  grid-template-columns: minmax(0, 1fr) auto;',
            '  gap: 10px;',
            '  margin-top: 22px;',
            '  padding: 8px;',
            '  border: 1px solid rgba(12,21,76,.12);',
            '  border-radius: 18px;',
            '  background: #fff;',
            '}',
            '.ots-campaign-form input {',
            '  width: 100%;',
            '  min-width: 0;',
            '  height: 50px;',
            '  padding: 0 14px;',
            '  color: var(--ots-campaign-navy);',
            '  font: 750 14px Manrope, "DM Sans", sans-serif;',
            '  border: 0;',
            '  outline: 0;',
            '  background: transparent;',
            '}',
            '.ots-campaign-form input::placeholder { color: #8b94ad; }',
            '.ots-campaign-form button {',
            '  height: 50px;',
            '  padding: 0 20px;',
            '  color: #fff;',
            '  font: 900 12px Manrope, "DM Sans", sans-serif;',
            '  letter-spacing: .04em;',
            '  border: 0;',
            '  border-radius: 13px;',
            '  background: var(--ots-campaign-navy);',
            '  cursor: pointer;',
            '}',
            '.ots-campaign-form-status {',
            '  min-height: 18px;',
            '  margin: 9px 0 0;',
            '  color: #177d99;',
            '  font-size: 11px;',
            '  font-weight: 800;',
            '}',
            '.ots-campaign-message-card {',
            '  position: relative;',
            '  overflow: hidden;',
            '  color: #fff;',
            '  background:',
            '    radial-gradient(circle at 85% 12%, rgba(115,216,239,.3), transparent 30%),',
            '    linear-gradient(135deg, #0c154c, #172568);',
            '}',
            '.ots-campaign-message-card h2, .ots-campaign-message-card p { color: #fff; }',
            '.ots-campaign-message-card p { opacity: .76; }',
            '.ots-campaign-message-card .ots-campaign-message-cta {',
            '  position: static !important;',
            '  display: inline-flex !important;',
            '  align-items: center !important;',
            '  justify-content: center !important;',
            '  gap: 9px;',
            '  left: auto !important;',
            '  right: auto !important;',
            '  top: auto !important;',
            '  bottom: auto !important;',
            '  transform: none !important;',
            '  width: auto !important;',
            '  min-width: 0 !important;',
            '  max-width: min(100%, 360px) !important;',
            '  height: 52px !important;',
            '  min-height: 52px !important;',
            '  margin: 24px 0 0 !important;',
            '  padding: 0 24px !important;',
            '  overflow: hidden;',
            '  border: 1px solid rgba(255,255,255,.34) !important;',
            '  border-radius: 999px !important;',
            '  background: #1cb967 !important;',
            '  box-shadow: 0 18px 42px rgba(28,185,103,.25) !important;',
            '  color: #fff !important;',
            '  font: 900 13px Manrope, "DM Sans", sans-serif !important;',
            '  line-height: 1.18 !important;',
            '  letter-spacing: .01em;',
            '  text-decoration: none !important;',
            '  text-align: center;',
            '  white-space: normal !important;',
            '  word-break: normal;',
            '  cursor: pointer !important;',
            '  pointer-events: auto !important;',
            '  transform: none !important;',
            '  transition: transform .2s ease, filter .2s ease, box-shadow .2s ease;',
            '}',
            '.ots-campaign-message-card .ots-campaign-message-cta:hover {',
            '  filter: brightness(1.04);',
            '  transform: translateY(-2px) !important;',
            '  box-shadow: 0 22px 48px rgba(28,185,103,.32) !important;',
            '}',
            '.ots-campaign-message-card .ots-campaign-message-cta span {',
            '  flex: 0 0 auto;',
            '}',
            '.ots-campaign-message-card .ots-campaign-message-cta i,',
            '.ots-campaign-message-card .ots-campaign-message-cta svg { display: none !important; }',
            '@keyframes otsCampaignPageBorder { to { transform: rotate(360deg); } }',
            '@media (max-width: 980px) {',
            '  .ots-campaign-hero, .ots-campaign-cta { grid-template-columns: 1fr; }',
            '  .ots-campaign-grid { grid-template-columns: 1fr; }',
            '  .ots-campaign-card { min-height: 0; }',
            '}',
            '@media (max-width: 620px) {',
            '  #otsCampaignPage { padding: 44px 14px 58px; }',
            '  .ots-campaign-title { font-size: 42px; }',
            '  .ots-campaign-lead { font-size: 14px; line-height: 1.65; }',
            '  .ots-campaign-hero-panel, .ots-campaign-signup, .ots-campaign-message-card { padding: 22px; border-radius: 24px; }',
            '  .ots-campaign-card, .ots-campaign-card-inner { border-radius: 25px; }',
            '  .ots-campaign-image, .ots-campaign-image img { min-height: 230px; }',
            '  .ots-campaign-content { padding: 22px; }',
            '  .ots-campaign-card h2 { font-size: 28px; }',
            '  .ots-campaign-subtitle { font-size: 15px; }',
            '  .ots-campaign-actions, .ots-campaign-btn { width: 100%; }',
            '  .ots-campaign-message-card h2 { font-size: 32px; }',
            '  .ots-campaign-message-card .ots-campaign-message-cta {',
            '    width: 100% !important;',
            '    max-width: 100% !important;',
            '    min-height: 54px !important;',
            '    height: auto !important;',
            '    padding: 13px 18px !important;',
            '    font-size: 12px !important;',
            '  }',
            '  .ots-campaign-form { grid-template-columns: 1fr; }',
            '}',
            '@media (prefers-reduced-motion: reduce) {',
            '  #otsCampaignPage * { animation: none !important; transition-duration: .01ms !important; }',
            '}'
        ].join('\n');

        document.head.appendChild(style);
    }

    function hideLegacyContent(holder) {
        qsa('#boshtml_0, #mainHolder_SayfaIcerikTasarim_divFacebookYorumContainer', holder).forEach(function (element) {
            element.classList.add('ots-campaign-page-hidden');
            element.setAttribute('aria-hidden', 'true');
        });
    }

    function createCampaignCard(campaign) {
        var isActive = campaign.active === true;
        var imageTag = isActive ? 'a' : 'div';
        var imageAttributes = isActive
            ? ' href="' + campaign.url + '" aria-label="' + campaign.title + '"'
            : ' role="img" aria-label="' + campaign.title + '. Kampanya şu an aktif değil."';
        var primaryAction = isActive
            ? '<a class="ots-campaign-btn" href="' + campaign.url + '">' + campaign.cta + ' <span aria-hidden="true">→</span></a>'
            : '<span class="ots-campaign-btn is-disabled" aria-disabled="true">Şu an aktif değil</span>';

        return [
            '<article class="ots-campaign-card' + (isActive ? '' : ' is-passive') + '">',
            '  <div class="ots-campaign-card-inner">',
            '    <' + imageTag + ' class="ots-campaign-image"' + imageAttributes + '>',
            '      <img src="' + campaign.image + '" alt="' + campaign.title + '" loading="lazy">',
            '      <span class="ots-campaign-pill">' + campaign.pill + '</span>',
            '    </' + imageTag + '>',
            '    <div class="ots-campaign-content">',
            '      <p class="ots-campaign-tag">' + campaign.tag + '</p>',
            '      <h2>' + campaign.title + '</h2>',
            '      <p class="ots-campaign-subtitle">' + campaign.subtitle + '</p>',
            '      <p class="ots-campaign-description">' + campaign.description + '</p>',
            '      <div class="ots-campaign-actions">',
            '        ' + primaryAction,
            isActive ? '        <a class="ots-campaign-btn is-secondary" href="/kampanyalar">Aktif kampanyalar</a>' : '',
            '      </div>',
            '    </div>',
            '  </div>',
            '</article>'
        ].join('');
    }

    function createPage() {
        var root = document.createElement('section');
        root.id = ROOT_ID;
        root.setAttribute('aria-label', 'ÖTS kampanyaları');
        root.innerHTML = [
            '<div class="ots-campaign-page-wrap">',
            '  <div class="ots-campaign-hero">',
            '    <div>',
            '      <p class="ots-campaign-kicker">ÖTS kampanyaları</p>',
            '      <h1 class="ots-campaign-title">Kampanyalara katılın, <span>kazançlı çıkın.</span></h1>',
            '      <p class="ots-campaign-lead">Güncel indirimleri, sepet avantajlarını ve ödeme fırsatlarını tek sayfada takip edin. Size uygun kampanyayı seçin, alışverişinizi daha avantajlı tamamlayın.</p>',
            '    </div>',
            '    <aside class="ots-campaign-hero-panel">',
            '      <strong>Tüm ürünlerde %30 indirim.</strong>',
            '      <p>Şu an aktif fırsat, sepet avantajını havale/EFT ödemelerinde ek indirimle birleştirir.</p>',
            '      <div class="ots-campaign-mini-badges"><span>%30 indirim</span><span>%5 EFT avantajı</span><span>250 TL İndirim</span></div>',
            '    </aside>',
            '  </div>',
            '  <div class="ots-campaign-grid">',
            campaigns.map(createCampaignCard).join(''),
            '  </div>',
            '  <div class="ots-campaign-cta">',
            '    <div class="ots-campaign-signup">',
            '      <h2>Kampanyalardan ilk siz haberdar olun.</h2>',
            '      <p>E-posta listenize kaydolun; indirimleri, yeni koleksiyonları ve dönemsel fırsatları kaçırmayın.</p>',
            '      <form class="ots-campaign-form" novalidate>',
            '        <input id="otsCampaignEmail" type="email" autocomplete="email" inputmode="email" placeholder="E-posta adresinizi yazın...">',
            '        <button type="submit">KAYDOL</button>',
            '      </form>',
            '      <p class="ots-campaign-form-status" aria-live="polite"></p>',
            '    </div>',
            '    <div class="ots-campaign-message-card">',
            '      <h2>WhatsApp ile kampanya bildirimi alın.</h2>',
            '      <p>Kampanya bilgi mesajı gönderin; aktif fırsatlar ve alışveriş avantajları hakkında hızlıca bilgi alın.</p>',
            '      <a class="ots-campaign-message-cta" href="#" data-ots-campaign-url="' + WHATSAPP_URL + '" aria-label="WhatsApp üzerinden kampanya bilgi mesajı gönder">WhatsApp’tan mesaj gönder <span aria-hidden="true">→</span></a>',
            '    </div>',
            '  </div>',
            '</div>'
        ].join('');

        return root;
    }

    function submitNewsletter(email, statusElement) {
        var existingInput = qs('#txtbxNewsletterMail');
        var existingButton = qs('#btnMailKaydet');

        // Ticimax gönderimi adresi kendi alanından okur; alan yoksa kayıt yapılamaz.
        if (existingInput) {
            existingInput.value = email;

            if (typeof window.saveNewsletter === 'function') {
                window.saveNewsletter();
                statusElement.textContent = 'E-posta adresiniz kayıt için gönderildi.';
                return;
            }

            if (existingButton) {
                existingButton.click();
                statusElement.textContent = 'E-posta adresiniz kayıt için gönderildi.';
                return;
            }
        }

        statusElement.textContent = 'Kayıt şu anda yapılamadı, lütfen daha sonra tekrar deneyin.';
    }

    function bindForm(root) {
        var form = qs('.ots-campaign-form', root);
        var input = qs('#otsCampaignEmail', root);
        var status = qs('.ots-campaign-form-status', root);

        if (!form || !input || !status) return;

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            var email = String(input.value || '').trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                status.textContent = 'Lütfen geçerli bir e-posta adresi yazın.';
                input.focus();
                return;
            }

            submitNewsletter(email, status);
        });
    }

    function bindCampaignMessage(root) {
        var button = qs('.ots-campaign-message-cta', root);
        if (!button) return;

        button.addEventListener('click', function (event) {
            var url = button.getAttribute('data-ots-campaign-url');
            if (!url) return;

            event.preventDefault();
            window.open(url, '_blank', 'noopener,noreferrer');
        });
    }

    function mount() {
        var holder = qs('#mainHolder_divDesign');
        if (!holder || document.getElementById(ROOT_ID)) return false;

        injectStyles();

        var page = createPage();
        holder.insertBefore(page, holder.firstChild);
        hideLegacyContent(holder);
        bindForm(page);
        bindCampaignMessage(page);

        return true;
    }

    function init() {
        if (mount()) return;

        if (!document.documentElement) return;

        var observer = new MutationObserver(function () {
            if (mount()) observer.disconnect();
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        window.setTimeout(function () {
            observer.disconnect();
        }, 12000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.otsCampaignPageInit = init;
}());
