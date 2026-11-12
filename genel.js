/*
 * ÖTS İÇ GİYİM - GENEL ARAYÜZ MODÜLLERİ
 *
 * Yükleme adresi : https://ornekler.com.tr/js/ots/genel.js
 * Çalıştığı yer  : Üyelik, şifre, iletişim sayfaları ve çerez bildirimi
 *
 * Oturum, üyelik, iletişim ve çerez akışlarını tek dosyada toplar.
 * Header ve footer kod tekrarını önlemek için yalnızca tumsayfalar.js içindedir.
 * Her bölüm kendi kapsamında (IIFE) bağımsız çalışır ve yalnızca ilgili
 * sayfa elemanları bulunduğunda devreye girer.
 *
 * Bölümler:
 *  1. Üye girişi sayfası
 *  2. Yeni üye kayıt sayfası
 *  3. Şifremi unuttum ve şifre yenileme akışı
 *  4. İletişim sayfası
 *  5. Çerez kullanım bildirimi
 */

/* ========================================================================
 * BÖLÜM 1: ÜYE GİRİŞİ SAYFASI
 *
 * Ticimax üye giriş formunu kurumsal ÖTS arayüzüne dönüştürür.
 * Mevcut form alanlarını ve platformun giriş davranışını korur.
 * Yalnızca ilgili giriş formu sayfada bulunduğunda çalışır.
 * ====================================================================== */
(function () {
    'use strict';

    function modernizeLogin() {
        var source = document.getElementById('divUyeGirisForm');
        var container = document.getElementById('divNewUyeGirisContent');

        if (!source || !container || document.getElementById('otsLoginShell')) return;

        var fontLink = document.createElement('link');
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800;900&display=swap';
        document.head.appendChild(fontLink);

        var style = document.createElement('style');
        style.id = 'otsModernLoginStyles';
        style.textContent = `
            body.NewUyeGiris {
                --ots-ink: #11110f;
                --ots-muted: #6f6d67;
                --ots-paper: #f3f2ee;
                --ots-line: #d7d5ce;
                --ots-white: #fff;
            }

            body.NewUyeGiris #divIcerik.ticiContainer {
                width: 100% !important;
                max-width: none !important;
                padding: 0 !important;
            }

            body.NewUyeGiris #mainHolder_divUserLoginContent {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            body.NewUyeGiris #divNewUyeGirisContent.newUserContainer {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
                background: transparent !important;
                box-shadow: none !important;
            }

            #otsLoginShell,
            #otsLoginShell * { box-sizing: border-box; }

            #otsLoginShell {
                position: relative;
                isolation: isolate;
                min-height: clamp(680px, 78vh, 900px);
                display: grid;
                place-items: center;
                padding: 72px 24px;
                overflow: hidden;
                color: var(--ots-ink);
                background:
                    radial-gradient(circle at 14% 16%, rgba(0,0,0,.045) 0 1px, transparent 1.4px) 0 0 / 18px 18px,
                    var(--ots-paper);
                font-family: 'DM Sans', sans-serif;
            }

            #otsLoginShell::before {
                content: '';
                position: absolute;
                z-index: -1;
                width: 480px;
                height: 480px;
                left: -230px;
                bottom: -245px;
                border: 1px solid rgba(17,17,15,.13);
                border-radius: 50%;
                box-shadow: 0 0 0 70px rgba(17,17,15,.025), 0 0 0 140px rgba(17,17,15,.018);
            }

            .ots-login-card {
                width: min(1120px, 100%);
                min-height: 610px;
                display: grid;
                grid-template-columns: minmax(0, 1.04fr) minmax(390px, .96fr);
                overflow: hidden;
                background: var(--ots-white);
                border: 1px solid rgba(17,17,15,.12);
                border-radius: 28px;
                box-shadow: 0 28px 80px rgba(23,22,19,.11);
                animation: otsCardIn .7s cubic-bezier(.2,.7,.2,1) both;
            }

            .ots-login-visual {
                position: relative;
                min-height: 610px;
                padding: 54px;
                overflow: hidden;
                color: #fff;
                background: #0c154c;
            }

            .ots-login-visual::after {
                content: '';
                position: absolute;
                inset: 0;
                pointer-events: none;
                opacity: .14;
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E");
                mix-blend-mode: soft-light;
            }

            .ots-visual-top,
            .ots-visual-copy { position: relative; z-index: 2; }

            .ots-visual-top {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 11px;
                font-weight: 600;
                letter-spacing: .18em;
                text-transform: uppercase;
            }

            .ots-visual-top::before {
                content: '';
                width: 32px;
                height: 1px;
                background: currentColor;
            }

            .ots-fashion-art {
                position: absolute;
                width: min(500px, 92%);
                height: auto;
                right: -38px;
                top: 34px;
                color: #deddd8;
                opacity: .88;
            }

            .ots-visual-copy {
                position: absolute;
                left: 54px;
                right: 54px;
                bottom: 50px;
            }

            .ots-visual-copy h2 {
                max-width: 470px;
                margin: 0 0 17px;
                color: #fff;
                font-family: 'Manrope', sans-serif;
                font-size: clamp(34px, 4vw, 58px);
                font-weight: 500;
                line-height: 1.02;
                letter-spacing: -.055em;
            }

            .ots-visual-copy p {
                max-width: 380px;
                margin: 0;
                color: rgba(255,255,255,.64);
                font-size: 13px;
                line-height: 1.7;
            }

            .ots-login-panel {
                display: flex;
                flex-direction: column;
                justify-content: center;
                padding: 58px clamp(38px, 5vw, 72px);
                background: #fff;
            }

            .ots-panel-kicker {
                margin-bottom: 16px;
                color: var(--ots-muted);
                font-size: 11px;
                font-weight: 600;
                letter-spacing: .16em;
                text-transform: uppercase;
            }

            .ots-login-panel h1 {
                margin: 0;
                color: var(--ots-ink);
                font-family: 'Manrope', sans-serif;
                font-size: clamp(34px, 3.1vw, 48px);
                font-weight: 600;
                line-height: 1.08;
                letter-spacing: -.045em;
            }

            .ots-panel-intro {
                margin: 13px 0 32px;
                color: var(--ots-muted);
                font-size: 13px;
                line-height: 1.65;
            }

            #otsLoginShell #divUyeGirisForm,
            #otsLoginShell .uyeGirisFormDetail {
                float: none !important;
                width: 100% !important;
                max-width: none !important;
                min-height: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                border: 0 !important;
                background: transparent !important;
                box-shadow: none !important;
            }

            #otsLoginShell .uyeGirisFormDetailInputList { margin: 0 !important; }

            #otsLoginShell .newUserWrapper {
                position: relative !important;
                float: none !important;
                width: 100% !important;
                margin: 0 0 17px !important;
            }

            #otsLoginShell .newUserWrapper .textbox {
                width: 100% !important;
                height: 58px !important;
                margin: 0 !important;
                padding: 22px 48px 8px 17px !important;
                color: var(--ots-ink) !important;
                font: 500 14px 'DM Sans', sans-serif !important;
                outline: 0 !important;
                border: 1px solid var(--ots-line) !important;
                border-radius: 12px !important;
                background: #fafaf8 !important;
                box-shadow: none !important;
                transition: border-color .2s, background .2s, box-shadow .2s !important;
            }

            #otsLoginShell .newUserWrapper .textbox:hover { border-color: #aaa89f !important; }
            #otsLoginShell .newUserWrapper .textbox:focus {
                border-color: var(--ots-ink) !important;
                background: #fff !important;
                box-shadow: 0 0 0 3px rgba(17,17,15,.07) !important;
            }

            #otsLoginShell .placeholderLabel {
                position: absolute !important;
                z-index: 1;
                top: 9px !important;
                left: 17px !important;
                margin: 0 !important;
                padding: 0 !important;
                color: #77756f !important;
                font: 500 10px 'DM Sans', sans-serif !important;
                line-height: 1 !important;
                letter-spacing: .035em;
                pointer-events: none;
                transform: none !important;
                background: transparent !important;
            }

            #otsLoginShell .TcxPassEye {
                right: 16px !important;
                top: 18px !important;
                color: #62615d;
            }

            #otsLoginShell .TcxPassEye svg { width: 21px; height: 21px; }

            #otsLoginShell .alert-danger {
                display: block;
                margin: 6px 0 0 !important;
                padding: 0 !important;
                color: #9d2722 !important;
                font-size: 11px !important;
                border: 0 !important;
                background: transparent !important;
            }

            #otsLoginShell .alert-danger.displayNone { display: none !important; }

            #otsLoginShell .uyeGirisFormDetailButtonList {
                display: flex;
                flex-direction: column;
                margin: 3px 0 0 !important;
            }

            #otsLoginShell .newUserLoginBtn {
                position: relative;
                float: none !important;
                width: 100% !important;
                height: 56px !important;
                margin: 0 !important;
                padding: 0 22px !important;
                overflow: hidden;
                color: #fff !important;
                font: 700 13px 'DM Sans', sans-serif !important;
                letter-spacing: .09em;
                text-transform: uppercase;
                border: 1px solid #0c154c !important;
                border-radius: 12px !important;
                background: #0c154c !important;
                box-shadow: none !important;
                transition: transform .2s, background .2s !important;
            }

            #otsLoginShell .newUserLoginBtn::after {
                content: '\\2192';
                position: absolute;
                right: 20px;
                font-size: 18px;
                transition: transform .2s;
            }

            #otsLoginShell .newUserLoginBtn:hover { background: #111947 !important; transform: translateY(-1px); }
            #otsLoginShell .newUserLoginBtn:hover::after { transform: translateX(4px); }

            #otsLoginShell .forgotpasswordDiv {
                order: -1;
                align-self: flex-end;
                margin: -4px 0 17px !important;
            }

            #otsLoginShell .userPassBtn {
                color: #55534e !important;
                font-size: 11px !important;
                font-weight: 500;
                text-decoration: none !important;
                border-bottom: 1px solid #c6c4bd;
            }

            /* Üyeliksiz devam: giriş butonunun hemen altında, ikinci ana seçenek. */
            #otsLoginShell .uyeliksizDevamEtDivider {
                display: flex !important;
                align-items: center;
                gap: 12px;
                margin: 18px 0 !important;
                color: #96938b;
                font-size: 10px;
                font-weight: 600;
                letter-spacing: .14em;
                text-transform: uppercase;
            }

            #otsLoginShell .uyeliksizDevamEtDividerLine {
                flex: 1;
                height: 1px;
                background: #e2e0da;
            }

            #otsLoginShell .uyeliksizDevamEtBtn {
                float: none !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            #otsLoginShell .uyeliksizDevamEtBtn a {
                position: relative;
                display: grid !important;
                grid-template-columns: 44px minmax(0, 1fr) 20px;
                align-items: center;
                gap: 3px 14px;
                width: 100% !important;
                min-height: 72px;
                margin: 0 !important;
                padding: 13px 18px 13px 14px !important;
                color: #0c154c !important;
                text-align: left;
                text-decoration: none !important;
                cursor: pointer;
                border: 1.5px solid #0c154c !important;
                border-radius: 12px !important;
                background: #f2f4fa !important;
                box-shadow: 0 10px 24px rgba(12,21,76,.08);
                transition: transform .2s, background .2s, box-shadow .2s !important;
            }

            #otsLoginShell .uyeliksizDevamEtBtn a::before {
                content: '';
                grid-column: 1;
                grid-row: 1 / span 2;
                width: 44px;
                height: 44px;
                border-radius: 11px;
                background: #0c154c url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 7h14l1 14H4L5 7Z'/%3E%3Cpath d='M8 8V6a4 4 0 0 1 8 0v2'/%3E%3C/svg%3E") center / 22px no-repeat;
            }

            #otsLoginShell .uyeliksizDevamEtBtn a::after {
                content: '\\2192';
                grid-column: 3;
                grid-row: 1 / span 2;
                font-size: 18px;
                transition: transform .2s;
            }

            #otsLoginShell .uyeliksizDevamEtBtn a > span {
                grid-column: 2;
                color: #0c154c !important;
                font: 800 14px 'DM Sans', sans-serif !important;
                letter-spacing: .02em;
            }

            #otsLoginShell .uyeliksizDevamEtBtn .ots-guest-note {
                grid-column: 2;
                color: #5c6584 !important;
                font: 500 11.5px/1.4 'DM Sans', sans-serif !important;
                letter-spacing: 0;
            }

            #otsLoginShell .uyeliksizDevamEtBtn a:hover {
                background: #e7ebf6 !important;
                transform: translateY(-1px);
                box-shadow: 0 14px 30px rgba(12,21,76,.13);
            }

            #otsLoginShell .uyeliksizDevamEtBtn a:hover::after { transform: translateX(4px); }

            #otsLoginShell .uyeliksizDevamEtBtn a:focus-visible {
                outline: 3px solid rgba(12,21,76,.25);
                outline-offset: 2px;
            }

            #otsLoginShell .socialMediaLoginButtons {
                position: relative;
                width: 100% !important;
                margin: 28px 0 0 !important;
                padding-top: 25px;
                display: grid !important;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 10px;
                border-top: 1px solid #e2e0da;
            }

            #otsLoginShell .socialMediaLoginButtons::before {
                content: 'veya';
                position: absolute;
                top: -8px;
                left: 50%;
                padding: 0 10px;
                color: #96938b;
                font-size: 10px;
                background: #fff;
                transform: translateX(-50%);
            }

            #otsLoginShell .socialBaglanButton,
            #otsLoginShell .socialBaglanButton a { width: 100% !important; }

            #otsLoginShell .socialBaglanButton { margin: 0 !important; }

            #otsLoginShell .socialBaglanButton a {
                height: 52px !important;
                display: flex !important;
                align-items: center;
                justify-content: center;
                gap: 10px;
                color: var(--ots-ink) !important;
                font-size: 12px !important;
                font-weight: 600;
                cursor: pointer;
                border: 1px solid var(--ots-line) !important;
                border-radius: 12px !important;
                background: #fff !important;
                transition: background .2s, border-color .2s !important;
            }

            #otsLoginShell .socialBaglanButton a:hover { background: #f6f5f1 !important; border-color: #aaa89f !important; }
            #otsLoginShell .socialBaglanButton svg { width: 21px; height: 21px; filter: none !important; }
            #otsLoginShell .socialBaglanButton svg g { opacity: 1 !important; }
            #otsLoginShell .FacebookLoginContainer i,
            #otsLoginShell .facebookLoginContainer i,
            #otsLoginShell [id*='Facebook'] i,
            #otsLoginShell [id*='facebook'] i { color: #1877f2 !important; }

            #otsLoginShell .socialUserSozlesmeDiv {
                width: 100% !important;
                margin: 15px 0 0 !important;
            }

            #otsLoginShell .socialUserInput { position: relative; padding-left: 25px; }
            #otsLoginShell .socialUserInput input { position: absolute; left: 0; top: 2px; accent-color: #171715; }
            #otsLoginShell .newSocialChkSozlesme { display: none !important; }
            #otsLoginShell .newSocialChkSozlesmeTranslate {
                color: #88857e !important;
                font-size: 11px !important;
                font-weight: 500;
                line-height: 1.65 !important;
            }
            #otsLoginShell .newSocialChkSozlesmeTranslate a {
                color: #55534e !important;
                font-weight: 600;
                text-decoration: underline;
                text-underline-offset: 2px;
            }

            .ots-signup-note {
                display: grid;
                grid-template-columns: 1fr;
                justify-items: center;
                gap: 12px;
                margin: 27px 0 0;
                color: var(--ots-muted);
                font-size: 13px;
                line-height: 1.45;
                text-align: center;
            }

            .ots-signup-note a {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 132px;
                height: 42px;
                margin-left: 0;
                padding: 0 20px;
                color: #0c154c;
                font-size: 12px;
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
                text-decoration: none;
                border: 1px solid #0c154c;
                border-radius: 999px;
                background: #fff;
                transition: color .2s, background .2s, transform .2s;
            }

            .ots-signup-note a:hover {
                color: #fff;
                background: #0c154c;
                transform: translateY(-1px);
            }

            @keyframes otsCardIn {
                from { opacity: 0; transform: translateY(18px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @media (max-width: 860px) {
                #otsLoginShell { padding: 34px 16px; }
                .ots-login-card { grid-template-columns: 1fr; max-width: 560px; }
                .ots-login-visual { min-height: 280px; padding: 34px; }
                .ots-fashion-art { width: 330px; right: -14px; top: -16px; opacity: .65; }
                .ots-visual-copy { left: 34px; right: 34px; bottom: 30px; }
                .ots-visual-copy h2 { max-width: 360px; font-size: 34px; margin-bottom: 8px; }
                .ots-visual-copy p { display: none; }
                .ots-login-panel { padding: 42px 34px 44px; }
            }

            @media (max-width: 480px) {
                #otsLoginShell { padding: 18px 12px 30px; background: #f3f2ee; }
                .ots-login-card { border-radius: 20px; }
                .ots-login-visual { min-height: 205px; padding: 25px; }
                .ots-fashion-art { width: 245px; top: -30px; right: -24px; }
                .ots-visual-copy { left: 25px; right: 25px; bottom: 23px; }
                .ots-visual-copy h2 { max-width: 280px; font-size: 27px; }
                .ots-visual-top { font-size: 9px; }
                .ots-login-panel { padding: 34px 24px 36px; }
                .ots-login-panel h1 { font-size: 34px; }
                .ots-panel-intro { margin-bottom: 25px; }
            }

            /* Mobil: başlık ve giriş metni kaldırılır, form daha sıkı yerleşir,
               Google ve Facebook butonları yan yana durur. */
            @media (max-width: 767px) {
                .ots-login-panel h1,
                .ots-login-panel .ots-panel-intro { display: none !important; }
                .ots-login-panel { padding: 24px 18px 26px; }
                .ots-panel-kicker { margin-bottom: 14px; }

                #otsLoginShell .newUserWrapper { margin-bottom: 12px !important; }
                #otsLoginShell .newUserWrapper .textbox { height: 52px !important; padding-top: 20px !important; }
                #otsLoginShell .placeholderLabel { top: 8px !important; }
                #otsLoginShell .TcxPassEye { top: 15px !important; }
                #otsLoginShell .forgotpasswordDiv { margin: -2px 0 12px !important; }
                #otsLoginShell .newUserLoginBtn { height: 50px !important; }

                #otsLoginShell .uyeliksizDevamEtDivider { margin: 14px 0 !important; }
                #otsLoginShell .uyeliksizDevamEtBtn a {
                    grid-template-columns: 38px minmax(0, 1fr) 18px;
                    gap: 2px 12px;
                    min-height: 62px;
                    padding: 11px 14px 11px 12px !important;
                }
                #otsLoginShell .uyeliksizDevamEtBtn a::before { width: 38px; height: 38px; border-radius: 10px; background-size: 19px; }
                #otsLoginShell .uyeliksizDevamEtBtn a > span { font-size: 13px !important; }
                #otsLoginShell .uyeliksizDevamEtBtn .ots-guest-note { font-size: 11px !important; }

                #otsLoginShell .socialMediaLoginButtons {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 8px;
                    margin-top: 20px !important;
                    padding-top: 18px;
                }
                #otsLoginShell .socialBaglanButton a {
                    height: 46px !important;
                    gap: 7px;
                    padding: 0 8px !important;
                    font-size: 11px !important;
                    line-height: 1.2 !important;
                    text-align: center;
                }
                #otsLoginShell .socialBaglanButton svg { flex: none; width: 18px; height: 18px; }
                #otsLoginShell .socialUserSozlesmeDiv { margin-top: 12px !important; }

                .ots-signup-note { gap: 9px; margin-top: 18px; font-size: 12px; }
                .ots-signup-note a { height: 38px; }
            }

            @media (prefers-reduced-motion: reduce) {
                .ots-login-card { animation: none; }
                #otsLoginShell * { scroll-behavior: auto !important; transition-duration: .01ms !important; }
            }
        `;
        document.head.appendChild(style);

        var shell = document.createElement('section');
        shell.id = 'otsLoginShell';
        shell.setAttribute('aria-label', 'Üye giriş alanı');
        shell.innerHTML = `
            <div class="ots-login-card">
                <div class="ots-login-visual" aria-hidden="true">
                    <div class="ots-visual-top">ÖTS / 1980'den beri</div>
                    <svg class="ots-fashion-art" viewBox="0 0 560 620" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M336 40c-31 10-51 43-48 76 2 21 14 43 33 54-7 24-26 43-46 57-23 17-51 30-66 55-17 29-14 66-10 100 4 38 7 79-10 113-11 23-31 42-54 53" stroke="currentColor" stroke-width="1.3"/>
                        <path d="M348 45c23 14 33 44 29 70-4 27-20 51-42 67 24 2 50 13 68 30 30 29 36 75 37 117 1 59-7 118 12 174 8 24 21 47 40 64" stroke="currentColor" stroke-width="1.3"/>
                        <path d="M279 221c-7 52-2 114 4 165 8 66 19 131 18 197M399 210c-18 39-31 81-38 123-13 80-7 163 10 242" stroke="currentColor" stroke-width="1.1"/>
                        <path d="M241 253c34 22 69 34 110 37 33 2 65-4 92-18M207 342c40 22 83 33 128 34 38 1 75-5 108-19" stroke="currentColor" stroke-width=".8" opacity=".55"/>
                        <path d="M323 171c12 7 24 8 37 2M317 83c17-10 35-9 50 3M352 91c0 12 2 22 8 32-5 4-10 6-16 5" stroke="currentColor" stroke-width="1"/>
                        <circle cx="467" cy="140" r="83" stroke="currentColor" stroke-width=".8" opacity=".18"/>
                        <circle cx="467" cy="140" r="112" stroke="currentColor" stroke-width=".8" opacity=".11"/>
                        <path d="M85 476c76-44 142-40 198 12M84 498c74-34 141-27 199 22" stroke="currentColor" stroke-width=".8" opacity=".23"/>
                    </svg>
                    <div class="ots-visual-copy">
                        <h2>Konfor, kendin gibi hissettiğinde başlar.</h2>
                        <p>Favorilerin, siparişlerin ve sana özel fırsatların tek bir yerde.</p>
                    </div>
                </div>
                <div class="ots-login-panel">
                    <span class="ots-panel-kicker">Hesabım</span>
                    <h1>Tekrar hoş geldin.</h1>
                    <p class="ots-panel-intro">Kaldığın yerden devam etmek için bilgilerini gir.</p>
                    <div id="otsLoginFormSlot"></div>
                    <p class="ots-signup-note">Henüz hesabın yok mu? <a href="/UyeOl">ÜYE OL</a></p>
                </div>
            </div>`;

        container.parentNode.insertBefore(shell, container);
        document.getElementById('otsLoginFormSlot').appendChild(source);
        container.style.display = 'none';

        var email = document.getElementById('txtUyeGirisEmail');
        var password = document.getElementById('txtUyeGirisPassword');
        var loginButton = shell.querySelector('.newUserLoginBtn');
        if (email) email.setAttribute('placeholder', 'ornek@eposta.com');
        if (password) password.setAttribute('placeholder', '••••••••');
        if (loginButton) {
            var normalizeLoginButton = function () {
                var buttonText = loginButton.querySelector('span');
                if (buttonText) buttonText.textContent = 'GİRİŞ YAP';
                else loginButton.textContent = 'GİRİŞ YAP';
            };
            normalizeLoginButton();
            window.setTimeout(normalizeLoginButton, 800);
        }

        // --- Üyeliksiz devam butonu ---
        // Açıklama satırı eklenir; bağlantı klavyeyle de kullanılabilir hale getirilir.
        var guestLink = shell.querySelector('.uyeliksizDevamEtBtn a');
        if (guestLink && !guestLink.querySelector('.ots-guest-note')) {
            var guestNote = document.createElement('span');
            guestNote.className = 'ots-guest-note';
            guestNote.textContent = 'Üye olmadan, birkaç adımda siparişini tamamla.';
            guestLink.appendChild(guestNote);
            guestLink.setAttribute('role', 'button');
            guestLink.setAttribute('tabindex', '0');
            guestLink.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    guestLink.click();
                }
            });
        }

        [email, password].forEach(function (input) {
            if (!input) return;
            input.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' && window.mem && window.mem.form) {
                    event.preventDefault();
                    window.mem.form.login();
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', modernizeLogin);
    } else {
        modernizeLogin();
    }
}());

/* ========================================================================
 * BÖLÜM 2: YENİ ÜYE KAYIT SAYFASI
 *
 * Yeni üyelik formunu modern, anlaşılır ve mobil uyumlu hale getirir.
 * Ticimax alanlarını yeniden üretmeden mevcut kontrolleri yeni düzene taşır.
 * Yalnızca üyelik formu bulunan sayfalarda devreye girer.
 * ====================================================================== */
(function () {
    'use strict';

    function modernizeRegister() {
        var source = document.getElementById('newUyeOlSection');
        var content = document.getElementById('divIcerik');

        if (document.getElementById('otsRegisterShell')) return true;
        if (!source || !content) return false;

        if (!document.querySelector('link[data-ots-account-fonts]')) {
            var fontLink = document.createElement('link');
            fontLink.rel = 'stylesheet';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800;900&display=swap';
            fontLink.setAttribute('data-ots-account-fonts', 'true');
            document.head.appendChild(fontLink);
        }

        var style = document.createElement('style');
        style.id = 'otsModernRegisterStyles';
        style.textContent = `
            body {
                --ots-register-ink: #11110f;
                --ots-register-muted: #6f6d67;
                --ots-register-paper: #f3f2ee;
                --ots-register-line: #d7d5ce;
            }

            body #divIcerik.ticiContainer {
                width: 100% !important;
                max-width: none !important;
                padding: 0 !important;
            }

            #otsRegisterShell,
            #otsRegisterShell * { box-sizing: border-box; }

            #otsRegisterShell {
                position: relative;
                isolation: isolate;
                width: 100%;
                padding: 72px 24px;
                overflow: hidden;
                color: var(--ots-register-ink);
                background:
                    radial-gradient(circle at 14% 16%, rgba(0,0,0,.045) 0 1px, transparent 1.4px) 0 0 / 18px 18px,
                    var(--ots-register-paper);
                font-family: 'DM Sans', sans-serif;
            }

            #otsRegisterShell::before {
                content: '';
                position: absolute;
                z-index: -1;
                width: 520px;
                height: 520px;
                right: -260px;
                top: -260px;
                border: 1px solid rgba(17,17,15,.12);
                border-radius: 50%;
                box-shadow: 0 0 0 75px rgba(17,17,15,.024), 0 0 0 150px rgba(17,17,15,.014);
            }

            .ots-register-card {
                width: min(1160px, 100%);
                display: grid;
                grid-template-columns: minmax(380px, .88fr) minmax(0, 1.12fr);
                margin: 0 auto;
                overflow: hidden;
                background: #fff;
                border: 1px solid rgba(17,17,15,.12);
                border-radius: 28px;
                box-shadow: 0 28px 80px rgba(23,22,19,.11);
                animation: otsRegisterIn .7s cubic-bezier(.2,.7,.2,1) both;
            }

            .ots-register-visual {
                position: relative;
                min-height: 780px;
                color: #fff;
                background: #0c154c;
            }

            .ots-register-visual::after {
                content: '';
                position: absolute;
                inset: 0;
                opacity: .14;
                pointer-events: none;
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E");
                mix-blend-mode: soft-light;
            }

            .ots-register-visual-inner {
                position: sticky;
                /* Sabit header'ın altında kalmaması için header yüksekliği kadar aşağıdan yapışır. */
                top: calc(var(--ots-header-height, 0px) + 28px);
                height: min(780px, calc(100vh - 56px - var(--ots-header-height, 0px)));
                min-height: 620px;
                padding: 52px;
                overflow: hidden;
            }

            .ots-register-kicker,
            .ots-register-visual-copy { position: relative; z-index: 2; }

            .ots-register-kicker {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 11px;
                font-weight: 600;
                letter-spacing: .18em;
                text-transform: uppercase;
            }

            .ots-register-kicker::before {
                content: '';
                width: 32px;
                height: 1px;
                background: currentColor;
            }

            .ots-register-art {
                position: absolute;
                width: min(500px, 112%);
                height: auto;
                top: 60px;
                right: -80px;
                color: #deddd8;
                opacity: .85;
            }

            .ots-register-visual-copy {
                position: absolute;
                left: 52px;
                right: 45px;
                bottom: 50px;
            }

            .ots-register-visual-copy h2 {
                max-width: 430px;
                margin: 0 0 18px;
                color: #fff;
                font-family: 'Manrope', sans-serif;
                font-size: clamp(36px, 4vw, 58px);
                font-weight: 500;
                line-height: 1.02;
                letter-spacing: -.055em;
            }

            .ots-register-visual-copy p {
                max-width: 350px;
                margin: 0;
                color: rgba(255,255,255,.62);
                font-size: 13px;
                line-height: 1.7;
            }

            .ots-register-panel {
                padding: 58px clamp(38px, 5vw, 72px) 64px;
                background: #fff;
            }

            .ots-register-panel-kicker {
                display: block;
                margin-bottom: 15px;
                color: var(--ots-register-muted);
                font-size: 11px;
                font-weight: 600;
                letter-spacing: .16em;
                text-transform: uppercase;
            }

            .ots-register-panel h1 {
                margin: 0;
                color: var(--ots-register-ink);
                font-family: 'Manrope', sans-serif;
                font-size: clamp(36px, 3.2vw, 48px);
                font-weight: 600;
                line-height: 1.08;
                letter-spacing: -.045em;
            }

            .ots-register-intro {
                margin: 13px 0 30px;
                color: var(--ots-register-muted);
                font-size: 13px;
                line-height: 1.65;
            }

            #otsRegisterShell #newUyeOlSection,
            #otsRegisterShell .newUyeOlContainer,
            #otsRegisterShell .newUyeOlRow,
            #otsRegisterShell .newUyeOlCol,
            #otsRegisterShell #FrmYeniUye {
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

            #otsRegisterShell .FormTitle { display: none !important; }

            #otsRegisterShell .newUserWrapper {
                position: relative !important;
                float: none !important;
                width: 100% !important;
                margin: 0 0 16px !important;
            }

            #otsRegisterShell .uyeAdSoyadRow,
            #otsRegisterShell .adresColRow,
            #otsRegisterShell .dogumGunuRow {
                display: grid !important;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 10px;
            }

            #otsRegisterShell .dogumGunuRow { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            #otsRegisterShell .uyeAdSoyadRow > .newUserWrapper,
            #otsRegisterShell .adresColRow > .newUserWrapper,
            #otsRegisterShell .dogumGunuRow > .newUserWrapper { margin-bottom: 0 !important; }
            #otsRegisterShell .ots-register-phone-wrapper { margin-bottom: 6px !important; }
            #otsRegisterShell .ots-register-phone-wrapper + .adresColRow { margin-top: 0 !important; }

            #otsRegisterShell .newUserWrapper input:not([type='checkbox']),
            #otsRegisterShell .newUserWrapper select {
                width: 100% !important;
                height: 58px !important;
                margin: 0 !important;
                padding: 21px 45px 7px 16px !important;
                color: var(--ots-register-ink) !important;
                font: 500 14px 'DM Sans', sans-serif !important;
                outline: 0 !important;
                border: 1px solid var(--ots-register-line) !important;
                border-radius: 12px !important;
                background: #fafaf8 !important;
                box-shadow: none !important;
                transition: border-color .2s, background .2s, box-shadow .2s !important;
            }

            #otsRegisterShell .newUserWrapper select {
                appearance: none;
                cursor: pointer;
                background-image: linear-gradient(45deg, transparent 50%, #777 50%), linear-gradient(135deg, #777 50%, transparent 50%) !important;
                background-position: calc(100% - 19px) 26px, calc(100% - 14px) 26px !important;
                background-size: 5px 5px, 5px 5px !important;
                background-repeat: no-repeat !important;
            }

            #otsRegisterShell .newUserWrapper input:not([type='checkbox']):hover,
            #otsRegisterShell .newUserWrapper select:hover { border-color: #aaa89f !important; }

            #otsRegisterShell .newUserWrapper input:not([type='checkbox']):focus,
            #otsRegisterShell .newUserWrapper select:focus {
                border-color: var(--ots-register-ink) !important;
                background-color: #fff !important;
                box-shadow: 0 0 0 3px rgba(17,17,15,.07) !important;
            }

            #otsRegisterShell .placeholderLabel {
                position: absolute !important;
                z-index: 2;
                top: 9px !important;
                left: 17px !important;
                width: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                color: #77756f !important;
                font: 500 10px 'DM Sans', sans-serif !important;
                line-height: 1 !important;
                letter-spacing: .035em;
                pointer-events: none;
                transform: none !important;
                background: transparent !important;
            }

            #otsRegisterShell .iti,
            #otsRegisterShell .intl-tel-input { width: 100% !important; }

            #otsRegisterShell #txtCepTelefon,
            #otsRegisterShell .iti input[type='tel'],
            #otsRegisterShell .intl-tel-input input[type='tel'] {
                padding: 0 45px 0 72px !important;
                line-height: normal !important;
            }

            #otsRegisterShell .iti__flag-container,
            #otsRegisterShell .intl-tel-input .flag-container {
                z-index: 4 !important;
            }

            #otsRegisterShell .iti .placeholderLabel,
            #otsRegisterShell .intl-tel-input + .placeholderLabel { left: 72px !important; }

            #otsRegisterShell .newUserWrapper.webkitAppearance::before,
            #otsRegisterShell .newUserWrapper.webkitAppearance::after {
                content: none !important;
                display: none !important;
                background: none !important;
            }

            #otsRegisterShell .TcxPassEye { right: 16px !important; top: 18px !important; color: #62615d; }
            #otsRegisterShell .TcxPassEye svg { width: 21px; height: 21px; }

            #otsRegisterShell .validateField,
            #otsRegisterShell .alert-danger,
            #otsRegisterShell .uyeOlSifreStrengthShowMessage {
                display: block;
                margin: 6px 0 0 !important;
                padding: 0 !important;
                color: #9d2722 !important;
                font-size: 11px !important;
                font-weight: 500 !important;
                border: 0 !important;
                background: transparent !important;
            }

            #otsRegisterShell .displayNone { display: none !important; }
            #otsRegisterShell .passControlProgress { margin-top: 7px; border-radius: 5px; overflow: hidden; }

            #otsRegisterShell .socialMediaLoginButtons {
                position: relative;
                display: grid !important;
                grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                gap: 10px;
                width: 100% !important;
                margin: 0 0 28px !important;
                padding-bottom: 28px;
                border-bottom: 1px solid #e2e0da;
            }

            #otsRegisterShell .socialMediaLoginButtons::after {
                content: 'veya bilgilerinle devam et';
                position: absolute;
                left: 50%;
                bottom: -6px;
                padding: 0 10px;
                color: #96938b;
                font-size: 9px;
                white-space: nowrap;
                background: #fff;
                transform: translateX(-50%);
            }

            #otsRegisterShell .socialBaglanButton,
            #otsRegisterShell .socialBaglanButton a { width: 100% !important; margin: 0 !important; }

            #otsRegisterShell .socialBaglanButton a {
                height: 52px !important;
                display: flex !important;
                align-items: center;
                justify-content: center;
                gap: 9px;
                color: var(--ots-register-ink) !important;
                font-size: 11px !important;
                font-weight: 600;
                cursor: pointer;
                border: 1px solid var(--ots-register-line) !important;
                border-radius: 12px !important;
                background: #fff !important;
                transition: background .2s, border-color .2s !important;
            }

            #otsRegisterShell .socialBaglanButton a:hover { background: #f6f5f1 !important; border-color: #aaa89f !important; }
            #otsRegisterShell .socialBaglanButton svg { width: 20px; height: 20px; filter: none !important; }
            #otsRegisterShell .socialBaglanButton svg g { opacity: 1 !important; }
            #otsRegisterShell .FacebookLoginContainer i,
            #otsRegisterShell .facebookLoginContainer i,
            #otsRegisterShell [id*='Facebook'] i,
            #otsRegisterShell [id*='facebook'] i { color: #1877f2 !important; }

            #otsRegisterShell .signSozlesmeDiv {
                display: grid;
                gap: 11px;
                margin: 8px 0 24px !important;
                padding: 18px;
                border: 1px solid #e2e0da;
                border-radius: 12px;
                background: #fafaf8;
            }

            #otsRegisterShell .checkboxItem {
                position: relative;
                display: grid !important;
                grid-template-columns: 18px minmax(0, 1fr);
                align-items: start;
                column-gap: 10px;
                min-height: 20px;
                padding: 0 !important;
            }
            #otsRegisterShell .checkboxItem input[type='checkbox'] {
                position: static !important;
                z-index: 3 !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
                width: 16px !important;
                height: 16px !important;
                margin: 1px 0 0 !important;
                padding: 0 !important;
                clip: auto !important;
                cursor: pointer !important;
                grid-column: 1;
                grid-row: 1;
                accent-color: #0c154c;
                appearance: auto !important;
                -webkit-appearance: checkbox !important;
            }
            #otsRegisterShell .checkboxItem .newSocialChkSozlesme { display: none !important; }
            #otsRegisterShell .checkboxItem .newSocialChkSozlesmeTranslate {
                display: block;
                position: static !important;
                float: none !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                cursor: pointer;
                pointer-events: auto !important;
                grid-column: 2;
                grid-row: 1;
                color: #6f6d67 !important;
                font-size: 11px !important;
                font-weight: 500;
                line-height: 1.65 !important;
            }
            #otsRegisterShell .checkboxItem > .validateField { grid-column: 2; }
            #otsRegisterShell .checkboxItem a { color: #33322f !important; font-size: inherit !important; font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }

            #otsRegisterShell #btnSave {
                position: relative;
                float: none !important;
                width: 100% !important;
                height: 56px !important;
                margin: 0 !important;
                padding: 0 22px !important;
                color: #fff !important;
                font: 700 13px 'DM Sans', sans-serif !important;
                letter-spacing: .09em;
                text-transform: uppercase;
                border: 1px solid #0c154c !important;
                border-radius: 12px !important;
                background: #0c154c !important;
                box-shadow: none !important;
                transition: transform .2s, background .2s !important;
            }

            #otsRegisterShell #btnSave::after {
                content: '\\2192';
                position: absolute;
                right: 20px;
                font-size: 18px;
                transition: transform .2s;
            }

            #otsRegisterShell #btnSave:hover { background: #111947 !important; transform: translateY(-1px); }
            #otsRegisterShell #btnSave:hover::after { transform: translateX(4px); }

            .ots-register-login {
                display: grid;
                grid-template-columns: 1fr;
                justify-items: center;
                gap: 12px;
                margin: 27px 0 0;
                color: var(--ots-register-muted);
                font-size: 13px;
                line-height: 1.45;
                text-align: center;
            }

            .ots-register-login a {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 132px;
                height: 42px;
                margin-left: 0;
                padding: 0 20px;
                color: #0c154c;
                font-size: 12px;
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
                text-decoration: none;
                border: 1px solid #0c154c;
                border-radius: 999px;
                background: #fff;
                transition: color .2s, background .2s, transform .2s;
            }

            .ots-register-login a:hover {
                color: #fff;
                background: #0c154c;
                transform: translateY(-1px);
            }

            @keyframes otsRegisterIn {
                from { opacity: 0; transform: translateY(18px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @media (max-width: 900px) {
                #otsRegisterShell { padding: 34px 16px; }
                .ots-register-card { grid-template-columns: 1fr; max-width: 640px; }
                .ots-register-visual { min-height: 275px; }
                .ots-register-visual-inner { position: relative; top: auto; height: 275px; min-height: 0; padding: 34px; }
                .ots-register-art { width: 340px; top: -42px; right: -10px; opacity: .6; }
                .ots-register-visual-copy { left: 34px; right: 34px; bottom: 29px; }
                .ots-register-visual-copy h2 { max-width: 390px; margin-bottom: 0; font-size: 34px; }
                .ots-register-visual-copy p { display: none; }
                .ots-register-panel { padding: 42px 34px 48px; }
            }

            @media (max-width: 540px) {
                #otsRegisterShell { padding: 18px 12px 30px; }
                .ots-register-card { border-radius: 20px; }
                .ots-register-visual { min-height: 205px; }
                .ots-register-visual-inner { height: 205px; padding: 25px; }
                .ots-register-art { width: 250px; top: -50px; right: -20px; }
                .ots-register-visual-copy { left: 25px; right: 25px; bottom: 22px; }
                .ots-register-visual-copy h2 { max-width: 290px; font-size: 27px; }
                .ots-register-kicker { font-size: 9px; }
                .ots-register-panel { padding: 34px 23px 38px; }
                .ots-register-panel h1 { font-size: 34px; }
                #otsRegisterShell .uyeAdSoyadRow,
                #otsRegisterShell .adresColRow { grid-template-columns: 1fr; gap: 0; }
                #otsRegisterShell .uyeAdSoyadRow > .newUserWrapper,
                #otsRegisterShell .adresColRow > .newUserWrapper { margin-bottom: 0 !important; }
                #otsRegisterShell .uyeAdSoyadRow > .newUserWrapper:not(:last-child),
                #otsRegisterShell .adresColRow > .newUserWrapper:not(:last-child) {
                    margin-bottom: 16px !important;
                }
                #otsRegisterShell .dogumGunuRow { gap: 7px; }
                #otsRegisterShell .dogumGunuRow .placeholderLabel { font-size: 8px !important; }
                #otsRegisterShell .socialMediaLoginButtons { grid-template-columns: 1fr; }
            }

            @media (prefers-reduced-motion: reduce) {
                .ots-register-card { animation: none; }
                #otsRegisterShell * { transition-duration: .01ms !important; }
            }
        `;
        document.head.appendChild(style);

        var shell = document.createElement('section');
        shell.id = 'otsRegisterShell';
        shell.setAttribute('aria-label', 'Üyelik oluşturma alanı');
        shell.innerHTML = `
            <div class="ots-register-card">
                <aside class="ots-register-visual" aria-hidden="true">
                    <div class="ots-register-visual-inner">
                        <div class="ots-register-kicker">ÖTS / Aramıza katıl</div>
                        <svg class="ots-register-art" viewBox="0 0 560 650" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M333 42c-28 13-45 45-39 76 4 22 18 40 36 52-10 25-31 42-54 56-28 17-59 31-75 60-16 30-10 66-4 100 8 45 13 94-8 135-12 24-33 43-57 56" stroke="currentColor" stroke-width="1.3"/>
                            <path d="M346 45c24 13 37 42 35 69-2 28-17 53-39 70 29 2 57 12 78 32 28 27 36 68 38 107 4 68-3 139 21 203 8 22 21 42 39 57" stroke="currentColor" stroke-width="1.3"/>
                            <path d="M282 220c-2 61 7 122 16 182 10 69 20 138 15 207M409 213c-21 45-34 94-39 144-8 80 1 160 22 237" stroke="currentColor" stroke-width="1.05"/>
                            <path d="M237 262c53 30 117 40 176 21M205 353c74 37 165 43 241 9M195 443c78 34 172 39 251 4" stroke="currentColor" stroke-width=".8" opacity=".48"/>
                            <path d="M326 170c13 8 27 8 40 0M320 82c17-10 36-9 51 4M356 91c-1 12 2 23 8 33-5 4-11 6-17 5" stroke="currentColor" stroke-width="1"/>
                            <circle cx="452" cy="132" r="78" stroke="currentColor" stroke-width=".8" opacity=".17"/>
                            <circle cx="452" cy="132" r="107" stroke="currentColor" stroke-width=".8" opacity=".1"/>
                            <path d="M75 508c76-42 147-34 207 22M75 532c77-32 147-17 207 43" stroke="currentColor" stroke-width=".8" opacity=".22"/>
                        </svg>
                        <div class="ots-register-visual-copy">
                            <h2>Sana özel bir alan aç.</h2>
                            <p>Favorilerini kaydet, siparişlerini kolayca takip et ve yeni koleksiyonlardan önce haberdar ol.</p>
                        </div>
                    </div>
                </aside>
                <main class="ots-register-panel">
                    <span class="ots-register-panel-kicker">Yeni hesap</span>
                    <h1>Aramıza hoş geldin.</h1>
                    <p class="ots-register-intro">Birkaç bilgiyle hesabını oluştur, alışverişini kişiselleştir.</p>
                    <div id="otsRegisterFormSlot"></div>
                    <p class="ots-register-login">Zaten hesabın var mı? <a href="/UyeGiris">GİRİŞ YAP</a></p>
                </main>
            </div>`;

        source.parentNode.insertBefore(shell, source);
        document.getElementById('otsRegisterFormSlot').appendChild(source);

        var placeholders = {
            txtAd: 'Adın',
            txtSoyAd: 'Soyadın',
            txtMailAdres: 'ornek@eposta.com',
            txtSifre: 'En az 6 karakter',
            txtCepTelefon: '5XX XXX XX XX'
        };

        Object.keys(placeholders).forEach(function (id) {
            var input = document.getElementById(id);
            if (input) input.setAttribute('placeholder', placeholders[id]);
        });

        var phoneInput = document.getElementById('txtCepTelefon');
        if (phoneInput && phoneInput.closest('.newUserWrapper')) {
            phoneInput.closest('.newUserWrapper').classList.add('ots-register-phone-wrapper');
        }

        var saveButton = document.getElementById('btnSave');
        if (saveButton) {
            // Buton <input> ise metin value'da, <a>/<button> ise içerikte durur.
            var normalizeSaveButton = function () {
                if (saveButton.tagName === 'INPUT') saveButton.value = 'ÜYE OL';
                else saveButton.textContent = 'ÜYE OL';
            };
            normalizeSaveButton();
            window.setTimeout(normalizeSaveButton, 800);
        }

        return true;
    }

    function initializeRegisterModernizer() {
        var currentPath = String(window.location.pathname || '').toLocaleLowerCase('tr-TR');
        var registerPage = document.getElementById('newUyeOlSection') || /uye-?ol|quickmembership/.test(currentPath);
        if (!registerPage) return;

        if (modernizeRegister()) return;

        // Platform formu AJAX ile eklediğinde yalnızca o DOM değişimini bekle.
        // Sürekli aralıkla sorgulamak yerine izleyiciyi başarılı olduğunda kapat.
        if (window.MutationObserver && document.documentElement) {
            var observer = new MutationObserver(function () {
                if (modernizeRegister()) observer.disconnect();
            });

            observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });

            window.setTimeout(function () {
                observer.disconnect();
            }, 12000);
            return;
        }

        // MutationObserver bulunmayan eski tarayıcılar için sınırlı geri dönüş.
        [300, 1000, 2500].forEach(function (delay) {
            window.setTimeout(modernizeRegister, delay);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeRegisterModernizer);
    } else {
        initializeRegisterModernizer();
    }
}());

/* ========================================================================
 * BÖLÜM 3: ŞİFREMİ UNUTTUM VE ŞİFRE YENİLEME AKIŞI
 *
 * Şifre talebi, e-posta gönderim sonucu ve yeni şifre oluşturma ekranlarını düzenler.
 * Sayfa içeriği sonradan yenilendiğinde MutationObserver ile görünümü tekrar uygular.
 * Ticimax form gönderme ve doğrulama fonksiyonlarını değiştirmez.
 * ====================================================================== */
(function () {
    'use strict';

    var STYLE_ID = 'otsPasswordFlowStyles';
    var RESET_SHELL_ID = 'otsPasswordResetShell';
    var SENT_SHELL_ID = 'otsPasswordSentShell';
    var FONT_ATTR = 'data-ots-password-flow-fonts';
    var LOGO_URL = 'https://static.ticimax.cloud/30662/uploads/editoruploads/logo/logo.svg';
    var SUCCESS_TEXT = 'Gerekli bilgiler e-posta adresinize gönderildi.';
    var observer = null;
    var retryTimer = null;

    function addFonts() {
        if (document.querySelector('link[' + FONT_ATTR + ']')) return;

        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800;900&display=swap';
        link.setAttribute(FONT_ATTR, 'true');
        document.head.appendChild(link);
    }

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            body #divIcerik.ticiContainer {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
                background: transparent !important;
            }

            body .pageSifremiUnuttum,
            body .pageSifremiUnuttum .pageForgetPass,
            body .pageSifreOlustur,
            body .pageSifreOlustur .pageCreatPass {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            #${RESET_SHELL_ID},
            #${RESET_SHELL_ID} *,
            #${SENT_SHELL_ID},
            #${SENT_SHELL_ID} * {
                box-sizing: border-box;
            }

            #${RESET_SHELL_ID},
            #${SENT_SHELL_ID} {
                --ots-blue: #0c154c;
                --ots-blue-2: #17256a;
                --ots-ink: #12172f;
                --ots-muted: #677087;
                --ots-line: #d8deeb;
                --ots-soft: #f5f7fc;
                position: relative;
                isolation: isolate;
                min-height: clamp(580px, 72vh, 820px);
                display: grid;
                place-items: center;
                padding: 64px 22px;
                overflow: hidden;
                color: var(--ots-ink);
                font-family: 'DM Sans', Arial, sans-serif;
                background:
                    radial-gradient(circle at 14% 14%, rgba(12,21,76,.10) 0 1px, transparent 1.5px) 0 0 / 18px 18px,
                    linear-gradient(135deg, #f7f8fc 0%, #eef2fa 100%);
            }

            #${RESET_SHELL_ID}::before,
            #${SENT_SHELL_ID}::before {
                content: '';
                position: absolute;
                z-index: -1;
                width: 600px;
                height: 600px;
                right: -300px;
                top: -300px;
                border: 1px solid rgba(12,21,76,.15);
                border-radius: 50%;
                box-shadow: 0 0 0 84px rgba(12,21,76,.04), 0 0 0 168px rgba(12,21,76,.025);
            }

            .ots-password-card {
                width: min(1040px, 100%);
                display: grid;
                grid-template-columns: minmax(360px, .9fr) minmax(0, 1.1fr);
                overflow: hidden;
                border: 1px solid rgba(12,21,76,.13);
                border-radius: 30px;
                background: #fff;
                box-shadow: 0 30px 90px rgba(12,21,76,.14);
                animation: otsPasswordIn .65s cubic-bezier(.2,.7,.2,1) both;
            }

            .ots-password-visual {
                position: relative;
                min-height: 560px;
                overflow: hidden;
                padding: 50px;
                color: #dce4ff;
                background:
                    radial-gradient(circle at 24% 20%, rgba(255,255,255,.18), transparent 32%),
                    linear-gradient(145deg, var(--ots-blue), var(--ots-blue-2));
            }

            .ots-password-visual::after {
                content: '';
                position: absolute;
                inset: 0;
                opacity: .18;
                background-image: radial-gradient(rgba(255,255,255,.85) 1px, transparent 1px);
                background-size: 22px 22px;
            }

            .ots-password-kicker,
            .ots-password-visual-copy {
                position: relative;
                z-index: 2;
            }

            .ots-password-kicker {
                display: flex;
                align-items: center;
                gap: 12px;
                color: #fff;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: .18em;
                text-transform: uppercase;
            }

            .ots-password-kicker::before {
                content: '';
                width: 32px;
                height: 1px;
                background: currentColor;
            }

            .ots-password-art {
                position: absolute;
                z-index: 1;
                left: 50%;
                top: 46%;
                width: min(380px, 78%);
                height: auto;
                color: #dce4ff;
                opacity: .9;
                transform: translate(-50%, -50%);
                filter: drop-shadow(0 24px 34px rgba(0,0,0,.16));
            }

            .ots-password-visual-copy {
                position: absolute;
                left: 50px;
                right: 42px;
                bottom: 46px;
            }

            .ots-password-visual-copy h2 {
                max-width: 410px;
                margin: 0 0 15px;
                color: #fff;
                font-family: 'Manrope', Arial, sans-serif;
                font-size: clamp(34px, 4vw, 54px);
                font-weight: 700;
                line-height: 1.03;
                letter-spacing: -.06em;
            }

            .ots-password-visual-copy p {
                max-width: 350px;
                margin: 0;
                color: rgba(255,255,255,.72);
                font-size: 13px;
                line-height: 1.7;
            }

            .ots-password-panel {
                padding: 58px clamp(34px, 5vw, 72px) 62px;
                background: #fff;
            }

            .ots-password-logo {
                width: 112px;
                height: auto;
                display: block;
                margin: 0 0 30px;
            }

            .ots-password-panel-kicker {
                display: block;
                margin-bottom: 14px;
                color: var(--ots-blue);
                font-size: 11px;
                font-weight: 800;
                letter-spacing: .16em;
                text-transform: uppercase;
            }

            .ots-password-panel h1 {
                margin: 0;
                color: var(--ots-blue);
                font-family: 'Manrope', Arial, sans-serif;
                font-size: clamp(34px, 3.5vw, 50px);
                font-weight: 700;
                line-height: 1.06;
                letter-spacing: -.055em;
            }

            .ots-password-intro,
            .ots-password-sent-message {
                margin: 14px 0 28px;
                color: var(--ots-muted);
                font-size: 14px;
                line-height: 1.75;
            }

            #${RESET_SHELL_ID} #divSifremiUnuttum {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
                background: transparent !important;
            }

            #${RESET_SHELL_ID} #divSifremiUnuttum,
            #${RESET_SHELL_ID} #divSifremiUnuttum form,
            #${RESET_SHELL_ID} #divSifremiUnuttum .form-group,
            #${RESET_SHELL_ID} #divSifremiUnuttum .newUserWrapper {
                float: none !important;
                display: block !important;
                width: 100% !important;
                max-width: none !important;
                margin: 0 0 15px !important;
            }

            #${RESET_SHELL_ID} #divSifremiUnuttum input[type='email'],
            #${RESET_SHELL_ID} #divSifremiUnuttum input[type='text'],
            #${RESET_SHELL_ID} #divSifremiUnuttum input.textbox,
            #${RESET_SHELL_ID} #divSifremiUnuttum .textbox {
                width: 100% !important;
                height: 58px !important;
                padding: 18px 16px !important;
                color: var(--ots-ink) !important;
                font: 600 14px 'DM Sans', Arial, sans-serif !important;
                border: 1px solid var(--ots-line) !important;
                border-radius: 13px !important;
                background: #f8f9fd !important;
                outline: 0 !important;
                box-shadow: none !important;
                transition: border-color .2s ease, background .2s ease, box-shadow .2s ease !important;
            }

            #${RESET_SHELL_ID} #divSifremiUnuttum input:focus {
                border-color: var(--ots-blue) !important;
                background: #fff !important;
                box-shadow: 0 0 0 3px rgba(12,21,76,.09) !important;
            }

            #${RESET_SHELL_ID} #divSifremiUnuttum button,
            #${RESET_SHELL_ID} #divSifremiUnuttum input[type='button'],
            #${RESET_SHELL_ID} #divSifremiUnuttum input[type='submit'],
            #${RESET_SHELL_ID} #divSifremiUnuttum .button {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                float: none !important;
                clear: both !important;
                width: 100% !important;
                height: 54px !important;
                margin: 0 !important;
                padding: 0 20px !important;
                color: #fff !important;
                font: 800 13px 'DM Sans', Arial, sans-serif !important;
                letter-spacing: .045em !important;
                text-transform: uppercase !important;
                border: 0 !important;
                border-radius: 12px !important;
                background: var(--ots-blue) !important;
                box-shadow: 0 14px 30px rgba(12,21,76,.18) !important;
                cursor: pointer !important;
                transition: transform .2s ease, background .2s ease !important;
            }

            #${RESET_SHELL_ID} #divSifremiUnuttum button:hover,
            #${RESET_SHELL_ID} #divSifremiUnuttum input[type='button']:hover,
            #${RESET_SHELL_ID} #divSifremiUnuttum input[type='submit']:hover,
            #${RESET_SHELL_ID} #divSifremiUnuttum .button:hover {
                background: var(--ots-blue-2) !important;
                transform: translateY(-1px);
            }

            #${RESET_SHELL_ID} #divSifremiUnuttum .alert-danger,
            #${RESET_SHELL_ID} #divSifremiUnuttum .validateField {
                margin: 7px 0 0 !important;
                padding: 0 !important;
                color: #a72a35 !important;
                font-size: 11px !important;
                font-weight: 700 !important;
                border: 0 !important;
                background: transparent !important;
            }

            /* Giriş ve kayıt bölümleriyle aynı: yalnızca Ticimax'ın gizlediği mesajlar gizlenir;
               hata gösterimi sınıf veya satır içi stil ile yapılsa da görünür kalır. */
            #${RESET_SHELL_ID} #divSifremiUnuttum .alert-danger.displayNone,
            #${RESET_SHELL_ID} #divSifremiUnuttum .validateField.displayNone {
                display: none !important;
            }

            .ots-password-login {
                display: flex !important;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                width: 100%;
                margin: 30px 0 0 !important;
                color: var(--ots-muted);
                font-size: 12px;
                text-align: center;
            }

            .ots-password-btn,
            .ots-password-login a {
                min-height: 40px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 9px;
                padding: 0 17px;
                color: #fff !important;
                font-size: 12px;
                font-weight: 800;
                letter-spacing: .02em;
                text-decoration: none !important;
                border: 1px solid var(--ots-blue);
                border-radius: 11px;
                background: var(--ots-blue);
                box-shadow: 0 10px 22px rgba(12,21,76,.14);
                transition: transform .2s ease, background .2s ease;
            }

            .ots-password-btn:hover,
            .ots-password-login a:hover {
                color: #fff !important;
                background: var(--ots-blue-2);
                transform: translateY(-1px);
            }

            .ots-password-sent-note {
                display: inline-flex;
                align-items: center;
                gap: 9px;
                margin: 0 0 8px;
                padding: 12px 15px;
                color: var(--ots-blue);
                font-size: 12px;
                font-weight: 800;
                border: 1px solid rgba(12,21,76,.12);
                border-radius: 999px;
                background: var(--ots-soft);
            }

            .ots-password-sent-note svg {
                width: 17px;
                height: 17px;
                flex: 0 0 auto;
            }

            .ots-password-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                margin-top: 34px;
            }

            .ots-password-btn.is-ghost {
                color: var(--ots-blue) !important;
                background: #fff;
                box-shadow: none;
            }

            .ots-password-btn.is-ghost:hover {
                color: var(--ots-blue) !important;
                background: var(--ots-soft);
            }

            @keyframes otsPasswordIn {
                from { opacity: 0; transform: translateY(18px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @media (max-width: 860px) {
                #${RESET_SHELL_ID},
                #${SENT_SHELL_ID} {
                    padding: 34px 14px;
                }

                .ots-password-card {
                    grid-template-columns: 1fr;
                    max-width: 680px;
                    border-radius: 24px;
                }

                .ots-password-visual {
                    order: -1;
                    min-height: 245px;
                    padding: 32px;
                }

                .ots-password-art {
                    width: 245px;
                    left: auto;
                    right: -28px;
                    top: -38px;
                    opacity: .58;
                    transform: none;
                }

                .ots-password-visual-copy {
                    left: 32px;
                    right: 32px;
                    bottom: 27px;
                }

                .ots-password-visual-copy h2 {
                    max-width: 390px;
                    margin-bottom: 0;
                    font-size: 32px;
                }

                .ots-password-visual-copy p {
                    display: none;
                }

                .ots-password-panel {
                    padding: 40px 30px 44px;
                }
            }

            @media (max-width: 520px) {
                #${RESET_SHELL_ID},
                #${SENT_SHELL_ID} {
                    padding: 18px 10px 28px;
                }

                .ots-password-card {
                    border-radius: 20px;
                }

                .ots-password-visual {
                    min-height: 205px;
                    padding: 24px;
                }

                .ots-password-visual-copy {
                    left: 24px;
                    right: 24px;
                    bottom: 22px;
                }

                .ots-password-visual-copy h2,
                .ots-password-panel h1 {
                    font-size: 30px;
                }

                .ots-password-panel {
                    padding: 34px 22px 36px;
                }

                .ots-password-logo {
                    width: 100px;
                    margin-bottom: 24px;
                }

                .ots-password-actions {
                    display: grid;
                    grid-template-columns: 1fr;
                }

                .ots-password-btn,
                .ots-password-login a {
                    width: 100%;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .ots-password-card {
                    animation: none;
                }

                #${RESET_SHELL_ID} *,
                #${SENT_SHELL_ID} * {
                    transition-duration: .01ms !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function accountSvg() {
        return [
            '<svg class="ots-password-art" viewBox="0 0 560 560" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
            '<circle cx="280" cy="258" r="150" stroke="currentColor" stroke-width="1.5" opacity=".45"/>',
            '<circle cx="280" cy="258" r="112" stroke="currentColor" stroke-width="1" opacity=".3"/>',
            '<path d="M150 370c46-54 103-81 171-81 67 0 125 27 173 81M175 410c69-36 139-43 210-17" stroke="currentColor" stroke-width="2" opacity=".6"/>',
            '<path d="M239 182c20-20 61-20 82 0M222 229c34-31 101-31 136 0M244 276c24-16 48-16 72 0" stroke="currentColor" stroke-width="2" opacity=".7"/>',
            '<circle cx="421" cy="124" r="27" stroke="currentColor" stroke-width="1.3" opacity=".5"/>',
            '<path d="M114 122c32-19 69-28 111-28" stroke="currentColor" stroke-width="2" opacity=".32"/>',
            '</svg>'
        ].join('');
    }

    function mailSvg() {
        return [
            '<svg class="ots-password-art" viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">',
            '<circle cx="210" cy="210" r="151" fill="currentColor" opacity=".1"/>',
            '<circle cx="210" cy="210" r="116" stroke="currentColor" stroke-width="2" opacity=".35"/>',
            '<path d="M111 159h198c11 0 20 9 20 20v96c0 11-9 20-20 20H111c-11 0-20-9-20-20v-96c0-11 9-20 20-20Z" stroke="currentColor" stroke-width="13" stroke-linejoin="round"/>',
            '<path d="m100 172 100 72c6 4 14 4 20 0l100-72" stroke="currentColor" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>',
            '<circle cx="303" cy="122" r="47" fill="#fff"/>',
            '<path d="m283 123 14 14 28-32" stroke="#0c154c" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>',
            '<path d="M117 320c55 27 122 31 186 7" stroke="currentColor" stroke-width="2" opacity=".28"/>',
            '<path d="M138 104c39-22 91-29 145-8" stroke="currentColor" stroke-width="2" opacity=".32"/>',
            '</svg>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getSuccessNode() {
        var wrapper = document.querySelector('.divsifremiUnuttumTop');
        if (!wrapper || document.getElementById(RESET_SHELL_ID)) return null;

        var success = wrapper.querySelector('.islemTamamlandi');
        if (success) return success;

        var text = (wrapper.textContent || '').replace(/\s+/g, ' ').trim();
        if (/Gerekli bilgiler|e-?posta adresinize gönderildi|telefonunuza gönderildi/i.test(text)) {
            return wrapper;
        }

        return null;
    }

    function renderSentSuccess() {
        var wrapper = document.querySelector('.divsifremiUnuttumTop');
        var successNode = getSuccessNode();

        if (!wrapper || !successNode || document.getElementById(SENT_SHELL_ID)) return false;

        var rawMessage = (successNode.textContent || '').replace(/\s+/g, ' ').trim();
        var message = rawMessage || SUCCESS_TEXT;

        addFonts();
        injectStyles();

        wrapper.innerHTML = [
            '<section id="' + SENT_SHELL_ID + '" aria-label="Şifre sıfırlama bilgilendirmesi">',
            '<div class="ots-password-card">',
            '<main class="ots-password-panel">',
            '<img class="ots-password-logo" src="' + LOGO_URL + '" alt="ÖTS Underwear">',
            '<span class="ots-password-panel-kicker">ÖTS / Şifre yenileme</span>',
            '<h1>Şifre yenileme bağlantın gönderildi.</h1>',
            '<p class="ots-password-sent-message">' + escapeHtml(message) + '</p>',
            '<div class="ots-password-sent-note">',
            '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 12.2 9.4 17 19.5 7" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            'Gelen kutunu ve spam klasörünü kontrol etmeyi unutma.',
            '</div>',
            '<div class="ots-password-actions">',
            '<a class="ots-password-btn" href="/UyeGiris">Giriş yap <span aria-hidden="true">→</span></a>',
            '<a class="ots-password-btn is-ghost" href="/">Alışverişe dön</a>',
            '</div>',
            '</main>',
            '<aside class="ots-password-visual" aria-hidden="true">',
            '<div class="ots-password-kicker">ÖTS / Güvenli işlem</div>',
            mailSvg(),
            '<div class="ots-password-visual-copy"><h2>Bilgiler güvenle iletildi.</h2><p>Bağlantı yalnızca kayıtlı iletişim adresine gönderilir.</p></div>',
            '</aside>',
            '</div>',
            '</section>'
        ].join('');

        return true;
    }

    function renderResetForm() {
        var source = document.getElementById('divSifremiUnuttum');
        var content = document.getElementById('divIcerik');

        if (!source || !content || document.getElementById(RESET_SHELL_ID) || document.getElementById(SENT_SHELL_ID)) return false;
        if (getSuccessNode()) return renderSentSuccess();

        addFonts();
        injectStyles();

        var shell = document.createElement('section');
        shell.id = RESET_SHELL_ID;
        shell.setAttribute('aria-label', 'ÖTS şifre yenileme');
        shell.innerHTML = [
            '<div class="ots-password-card">',
            '<aside class="ots-password-visual" aria-hidden="true">',
            '<div class="ots-password-kicker">ÖTS / Hesap erişimi</div>',
            accountSvg(),
            '<div class="ots-password-visual-copy"><h2>Hesabına yeniden ulaş.</h2><p>E-posta adresini bırak; yeni şifre bağlantını güvenle gönderelim.</p></div>',
            '</aside>',
            '<main class="ots-password-panel">',
            '<img class="ots-password-logo" src="' + LOGO_URL + '" alt="ÖTS Underwear">',
            '<span class="ots-password-panel-kicker">Şifre yenileme</span>',
            '<h1>Şifreni yeniden belirle.</h1>',
            '<p class="ots-password-intro">Üyelikte kullandığın e-posta adresini yaz. Yeni şifre oluşturman için gerekli bağlantıyı hemen gönderelim.</p>',
            '<div id="otsPasswordResetFormSlot"></div>',
            '<p class="ots-password-login">Şifreni hatırladın mı? <a href="/UyeGiris">Giriş yap</a></p>',
            '</main>',
            '</div>'
        ].join('');

        var legacyDescription = document.querySelector('.SifremiUnuttumContentDesc');
        var modernDescription = shell.querySelector('.ots-password-intro');

        if (legacyDescription && modernDescription) {
            modernDescription.textContent = legacyDescription.textContent.replace(/\s+/g, ' ').trim();
            legacyDescription.style.display = 'none';
        }

        source.parentNode.insertBefore(shell, source);
        shell.querySelector('#otsPasswordResetFormSlot').appendChild(source);

        // Yalnızca boş mesajlar gizlenir; sunucunun gönderdiği hata (ör. kayıtlı
        // olmayan e-posta) sayfa açıldığında görünür kalmalıdır.
        Array.prototype.forEach.call(shell.querySelectorAll('.alert-danger,.validateField'), function (message) {
            if (!message.textContent.trim()) message.classList.add('displayNone');
        });

        return true;
    }

    function run() {
        if (renderSentSuccess()) return true;
        return renderResetForm();
    }

    function scheduleRun() {
        clearTimeout(retryTimer);
        retryTimer = setTimeout(run, 80);
    }

    function observe() {
        if (!window.MutationObserver || !document.body) return;

        observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i += 1) {
                var target = mutations[i].target;
                if (target && target.closest && (target.closest('#' + RESET_SHELL_ID) || target.closest('#' + SENT_SHELL_ID))) continue;
                scheduleRun();
                break;
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // Arayüz hiç kurulamasa da gözlemci 12 saniye sonra kapatılır; aksi halde
        // yalnızca adresle eşleşen sayfalarda her DOM değişiminde sonsuza kadar çalışıyordu.
        window.setTimeout(function () {
            if (observer) observer.disconnect();
        }, 12000);
    }

    function isPasswordFlowPage() {
        var currentPath = String(window.location.pathname || '').toLocaleLowerCase('tr-TR');
        return !!(
            document.getElementById('divSifremiUnuttum') ||
            document.querySelector('.pageSifremiUnuttum, .pageSifreOlustur, .pageForgetPass, .pageCreatPass') ||
            /sifremi|sifre-?olustur|password|forgetpass/.test(currentPath)
        );
    }

    function init() {
        if (!isPasswordFlowPage()) return;

        [0, 250, 700, 1400].forEach(function (delay) {
            setTimeout(run, delay);
        });
        observe();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());

/* ========================================================================
 * BÖLÜM 4: İLETİŞİM SAYFASI
 *
 * Firma bilgileri, iletişim kanalları ve mesaj formunu kurumsal düzende sunar.
 * Mevcut iletişim formu alanlarını ve gönderme işlevini korur.
 * Yalnızca iletişim sayfasındaki gerekli elemanlar bulunduğunda çalışır.
 * ====================================================================== */
(function () {
    'use strict';

    function modernizeContact() {
        var content = document.getElementById('divCenterBlock');
        var contactInfo = content && content.querySelector('.iletisimLeft');
        var form = document.getElementById('mainHolder_Iletisim_divMailGonder');
        var bank = document.getElementById('mainHolder_Iletisim_divBanka');

        if (!content || !contactInfo || !form || document.getElementById('otsContactShell')) return;

        if (!document.querySelector('link[data-ots-account-fonts]')) {
            var fontLink = document.createElement('link');
            fontLink.rel = 'stylesheet';
            fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800;900&display=swap';
            fontLink.setAttribute('data-ots-account-fonts', 'true');
            document.head.appendChild(fontLink);
        }

        var style = document.createElement('style');
        style.id = 'otsModernContactStyles';
        style.textContent = `
            body {
                --ots-contact-ink: #11110f;
                --ots-contact-muted: #6f6d67;
                --ots-contact-paper: #f3f2ee;
                --ots-contact-line: #d7d5ce;
                --ots-contact-white: #fff;
            }

            body #divIcerik.ticiContainer { width: 100% !important; max-width: none !important; padding: 0 !important; }
            body #divCenterBlock.iletisimContent { width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; }
            #otsContactShell, #otsContactShell * { box-sizing: border-box; }

            #otsContactShell {
                position: relative;
                isolation: isolate;
                width: 100%;
                padding: 72px 24px;
                overflow: hidden;
                color: var(--ots-contact-ink);
                background:
                    radial-gradient(circle at 14% 16%, rgba(0,0,0,.045) 0 1px, transparent 1.4px) 0 0 / 18px 18px,
                    var(--ots-contact-paper);
                font-family: 'DM Sans', sans-serif;
            }

            #otsContactShell::before {
                content: '';
                position: absolute;
                z-index: -1;
                width: 520px;
                height: 520px;
                right: -260px;
                top: -260px;
                border: 1px solid rgba(17,17,15,.12);
                border-radius: 50%;
                box-shadow: 0 0 0 75px rgba(17,17,15,.024), 0 0 0 150px rgba(17,17,15,.014);
            }

            .ots-contact-card {
                width: min(1160px, 100%);
                display: grid;
                grid-template-columns: minmax(370px, .88fr) minmax(0, 1.12fr);
                margin: 0 auto;
                overflow: hidden;
                border: 1px solid rgba(17,17,15,.12);
                border-radius: 28px;
                background: #fff;
                box-shadow: 0 28px 80px rgba(23,22,19,.11);
                animation: otsContactIn .7s cubic-bezier(.2,.7,.2,1) both;
            }

            .ots-contact-visual {
                position: relative;
                min-height: 760px;
                padding: 52px;
                overflow: hidden;
                color: #fff;
                background: #1a2357;
            }

            .ots-contact-visual::after {
                content: '';
                position: absolute;
                inset: 0;
                opacity: .14;
                pointer-events: none;
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E");
                mix-blend-mode: soft-light;
            }

            .ots-contact-kicker, .ots-contact-copy, #otsContactInfoSlot { position: relative; z-index: 2; }
            .ots-contact-kicker {
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 11px;
                font-weight: 600;
                letter-spacing: .18em;
                text-transform: uppercase;
            }
            .ots-contact-kicker::before { content: ''; width: 32px; height: 1px; background: currentColor; }

            .ots-contact-art {
                position: absolute;
                width: min(490px, 110%);
                height: auto;
                top: 48px;
                right: -78px;
                color: #deddd8;
                opacity: .76;
            }

            .ots-contact-copy { margin-top: 355px; }
            .ots-contact-copy h2 {
                max-width: 420px;
                margin: 0 0 14px;
                color: #fff;
                font-family: 'Manrope', sans-serif;
                font-size: clamp(36px, 4vw, 56px);
                font-weight: 500;
                line-height: 1.02;
                letter-spacing: -.055em;
            }
            .ots-contact-copy p { max-width: 350px; margin: 0; color: rgba(255,255,255,.62); font-size: 13px; line-height: 1.7; }

            #otsContactInfoSlot { margin-top: 34px; }
            #otsContactShell .iletisimLeft {
                display: grid !important;
                grid-template-columns: 1fr 1fr;
                gap: 0 20px;
                float: none !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 20px 0 0 !important;
                border-top: 1px solid rgba(255,255,255,.16);
                background: transparent !important;
            }
            #otsContactShell .iletisimLeft .categoryTitle { display: none !important; }
            #otsContactShell .iletisimLeft .span {
                display: block !important;
                float: none !important;
                width: auto !important;
                margin: 0 !important;
                padding: 11px 0 !important;
                color: #fff;
                border: 0 !important;
                background: transparent !important;
            }
            #otsContactShell .iletisimLeft .span.iletisimLeftAdres { grid-column: 1 / -1; }
            #otsContactShell .iletisimLeft .Left {
                float: none !important;
                width: auto !important;
                margin: 0 0 5px !important;
                color: rgba(255,255,255,.45) !important;
                font-size: 11px !important;
                font-weight: 500;
                letter-spacing: .09em;
                text-transform: uppercase;
            }
            #otsContactShell .iletisimLeft .Center { display: none !important; }
            #otsContactShell .iletisimLeft .Right {
                float: none !important;
                width: auto !important;
                margin: 0 !important;
                color: rgba(255,255,255,.84) !important;
                font-size: 13px !important;
                font-weight: 500;
                line-height: 1.65;
            }
            #otsContactShell .iletisimLeft a { color: #fff !important; text-decoration: none !important; }

            .ots-contact-panel { min-width: 0; padding: 58px clamp(38px, 5vw, 72px) 64px; background: #fff; }
            .ots-contact-panel-kicker {
                display: block;
                margin-bottom: 15px;
                color: var(--ots-contact-muted);
                font-size: 11px;
                font-weight: 600;
                letter-spacing: .16em;
                text-transform: uppercase;
            }
            .ots-contact-panel h1 {
                margin: 0;
                color: var(--ots-contact-ink);
                font-family: 'Manrope', sans-serif;
                font-size: clamp(36px, 3.2vw, 48px);
                font-weight: 600;
                line-height: 1.08;
                letter-spacing: -.045em;
            }
            .ots-contact-intro { margin: 13px 0 30px; color: var(--ots-contact-muted); font-size: 13px; line-height: 1.65; }

            #otsContactShell .iletisimForm,
            #otsContactShell .iletisimForm .row,
            #otsContactShell .iletisimForm .span,
            #otsContactShell .iletisimForm .Right {
                position: static !important;
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
                border: 0 !important;
                background: transparent !important;
                transform: none !important;
            }
            #otsContactShell .iletisimForm > .categoryTitle,
            #otsContactShell .iletisimForm > .clear,
            #otsContactShell .iletisimForm .Center { display: none !important; }
            #otsContactShell .iletisimForm { display: grid !important; gap: 16px; }
            #otsContactShell .iletisimForm .row { display: grid !important; gap: 16px; }
            #otsContactShell .iletisimForm .span { position: relative !important; }
            #otsContactShell .iletisimForm .Left {
                position: absolute !important;
                z-index: 2;
                top: 9px !important;
                left: 17px !important;
                float: none !important;
                width: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                color: #77756f !important;
                font: 500 10px 'DM Sans', sans-serif !important;
                line-height: 1 !important;
                letter-spacing: .035em;
                pointer-events: none;
            }

            #otsContactShell .iletisimForm input[type='text'],
            #otsContactShell .iletisimForm textarea {
                position: static !important;
                display: block !important;
                float: none !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                margin: 0 !important;
                color: var(--ots-contact-ink) !important;
                font: 500 14px 'DM Sans', sans-serif !important;
                outline: 0 !important;
                border: 1px solid var(--ots-contact-line) !important;
                border-radius: 12px !important;
                background: #fafaf8 !important;
                box-shadow: none !important;
                transition: border-color .2s, background .2s, box-shadow .2s !important;
            }
            #otsContactShell .iletisimForm input[type='text'] { height: 58px !important; padding: 22px 17px 8px !important; }
            #otsContactShell .iletisimTelefon .Right,
            #otsContactShell .iletisimTelefon .iti,
            #otsContactShell .iletisimTelefon .intl-tel-input { position: relative !important; width: 100% !important; }
            #otsContactShell #txtbxTelefon {
                height: 58px !important;
                padding: 20px 17px 6px 72px !important;
                line-height: 32px !important;
            }
            #otsContactShell .iletisimTelefon > .Left { left: 72px !important; }
            #otsContactShell .iletisimTelefon .iti__flag-container,
            #otsContactShell .iletisimTelefon .flag-container {
                top: 0 !important;
                bottom: 0 !important;
                display: flex !important;
                align-items: center !important;
                height: 58px !important;
            }
            #otsContactShell .iletisimTelefon .iti__selected-flag,
            #otsContactShell .iletisimTelefon .selected-flag {
                display: flex !important;
                align-items: center !important;
                height: 58px !important;
                padding-left: 15px !important;
            }
            #otsContactShell .iletisimForm textarea { height: 138px !important; min-height: 138px !important; padding: 25px 17px 14px !important; resize: vertical; }
            #otsContactShell .iletisimForm input[type='text']:hover,
            #otsContactShell .iletisimForm textarea:hover { border-color: #aaa89f !important; }
            #otsContactShell .iletisimForm input[type='text']:focus,
            #otsContactShell .iletisimForm textarea:focus {
                border-color: var(--ots-contact-ink) !important;
                background: #fff !important;
                box-shadow: 0 0 0 3px rgba(17,17,15,.07) !important;
            }

            #otsContactShell .iletisimForm .validate {
                display: block;
                min-height: 14px;
                margin: 5px 0 0 !important;
                padding: 0 !important;
                color: #9d2722 !important;
                font-size: 10px !important;
                font-weight: 500;
                border: 0 !important;
                background: transparent !important;
            }

            #otsContactShell .iletisimCaptcha { padding: 12px !important; border: 1px solid var(--ots-contact-line) !important; border-radius: 12px; background: #fafaf8 !important; }
            #otsContactShell .iletisimCaptcha > .Left { position: static !important; display: block; margin: 0 0 10px !important; }
            #otsContactShell .iletisimCaptcha .xIDDiv {
                display: grid !important;
                grid-template-columns: minmax(120px, 1fr) 42px;
                align-items: center;
                gap: 9px;
                width: 100% !important;
                margin: 0 !important;
            }
            #otsContactShell #imgTicimaxCaptcha { display: block !important; width: 100% !important; max-width: 220px !important; height: 48px !important; object-fit: contain; object-position: left center; }
            #otsContactShell .iletisimCaptcha .xIDDiv > a {
                display: grid !important;
                place-items: center;
                width: 42px !important;
                height: 42px !important;
                margin: 0 !important;
                color: var(--ots-contact-ink) !important;
                text-decoration: none;
                border: 1px solid var(--ots-contact-line);
                border-radius: 9px;
                background: #fff;
            }
            #otsContactShell #txtGuvenlikKodu,
            #otsContactShell #errorCaptcha { grid-column: 1 / -1; }

            #otsContactShell .iletisimBtn {
                position: static !important;
                float: none !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            #otsContactShell #mainHolder_Iletisim_btnGonder {
                position: relative;
                float: none !important;
                width: 100% !important;
                height: 56px !important;
                margin: 0 !important;
                padding: 0 22px !important;
                color: #fff !important;
                font: 700 13px 'DM Sans', sans-serif !important;
                letter-spacing: .09em;
                text-transform: uppercase;
                cursor: pointer;
                border: 1px solid #1a2357 !important;
                border-radius: 12px !important;
                background: #1a2357 !important;
                box-shadow: none !important;
                transition: transform .2s, background .2s !important;
            }
            #otsContactShell #mainHolder_Iletisim_btnGonder:hover { background: #111947 !important; transform: translateY(-1px); }
            .ots-contact-privacy { margin: 17px 0 0; padding-left: 16px; color: #88857e; font-size: 10px; line-height: 1.55; border-left: 2px solid #c9c7c0; }

            .ots-contact-bank {
                width: min(1160px, 100%);
                margin: 22px auto 0;
                padding: 28px;
                color: #fff;
                border: 1px solid rgba(255,255,255,.14);
                border-radius: 18px;
                background:
                    radial-gradient(circle at 10% 0%, rgba(255,255,255,.12), transparent 34%),
                    #1a2357;
                backdrop-filter: blur(8px);
            }
            #otsContactShell .ots-bank-source { display: none !important; }
            .ots-bank-header {
                display: flex;
                align-items: flex-end;
                justify-content: space-between;
                gap: 20px;
                margin-bottom: 20px;
                padding-bottom: 18px;
                border-bottom: 1px solid rgba(255,255,255,.16);
            }
            .ots-bank-kicker { display: block; margin-bottom: 7px; color: rgba(255,255,255,.58); font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; }
            .ots-bank-header h2 { margin: 0; color: #fff; font: 600 24px 'Manrope', sans-serif; letter-spacing: -.025em; }
            .ots-bank-header p { margin: 0; color: rgba(255,255,255,.68); font-size: 13px; line-height: 1.5; }
            .ots-bank-card {
                position: relative;
                display: grid;
                grid-template-columns: minmax(190px, .75fr) minmax(260px, 1.25fr);
                gap: 0;
                overflow: hidden;
                border: 1px solid rgba(255,255,255,.36);
                border-radius: 14px;
                background: #fff;
                box-shadow: 0 18px 38px rgba(0,0,0,.16);
            }
            .ots-bank-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #1a2357; }
            .ots-bank-primary { padding: 27px; color: #fff; background: #1a2357; }
            .ots-bank-primary-label { display: block; margin-bottom: 9px; color: rgba(255,255,255,.55); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; }
            .ots-bank-name { display: block; margin-bottom: 22px; font: 600 21px 'Manrope', sans-serif; letter-spacing: -.02em; line-height: 1.22; }
            .ots-bank-currency { display: inline-flex; align-items: center; gap: 7px; padding: 8px 11px; color: rgba(255,255,255,.88); font-size: 12px; border: 1px solid rgba(255,255,255,.20); border-radius: 99px; }
            .ots-bank-currency::before { content: '\\20BA'; display: grid; place-items: center; width: 18px; height: 18px; color: #1a2357; font-weight: 700; border-radius: 50%; background: #fff; }
            .ots-bank-details { display: grid; grid-template-columns: 1fr; padding: 13px 25px; }
            .ots-bank-row { display: grid; grid-template-columns: 120px minmax(0, 1fr); gap: 18px; align-items: start; padding: 15px 0; border-bottom: 1px solid #eceef6; }
            .ots-bank-row:last-child { border-bottom: 0; }
            .ots-bank-label { color: #74788f; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
            .ots-bank-value { min-width: 0; color: #17204f; font-size: 14px; font-weight: 600; line-height: 1.6; overflow-wrap: anywhere; }
            .ots-bank-copy-wrap { display: flex; align-items: center; gap: 12px; min-width: 0; }
            .ots-bank-iban { font-family: 'DM Sans', sans-serif; font-size: 16px; letter-spacing: .045em; }
            .ots-bank-copy {
                flex: 0 0 auto;
                height: 36px;
                padding: 0 13px;
                color: #fff;
                font: 700 11px 'DM Sans', sans-serif;
                letter-spacing: .05em;
                text-transform: uppercase;
                cursor: pointer;
                border: 1px solid #1a2357;
                border-radius: 999px;
                background: #1a2357;
                transition: transform .2s, background .2s, color .2s;
            }
            .ots-bank-copy:hover { background: #111947; transform: translateY(-1px); }
            .ots-bank-copy.is-copied { color: #1a2357; background: #dff4e8; border-color: #dff4e8; }

            @keyframes otsContactIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
            @media (max-width: 900px) {
                #otsContactShell { padding: 34px 16px; }
                .ots-contact-card { grid-template-columns: 1fr; max-width: 640px; }
                .ots-contact-visual { min-height: 360px; padding: 34px; }
                .ots-contact-art { width: 330px; top: -45px; right: -12px; opacity: .55; }
                .ots-contact-copy { margin-top: 145px; }
                .ots-contact-copy h2 { font-size: 34px; }
                .ots-contact-copy p { display: none; }
                #otsContactInfoSlot { margin-top: 20px; }
                .ots-contact-panel { padding: 42px 34px 48px; }
                .ots-contact-bank { max-width: 640px; }
            }
            @media (max-width: 540px) {
                #otsContactShell { padding: 18px 12px 30px; }
                .ots-contact-card { border-radius: 20px; }
                .ots-contact-visual { min-height: 390px; padding: 25px; }
                .ots-contact-art { width: 245px; top: -48px; right: -24px; }
                .ots-contact-copy { margin-top: 125px; }
                .ots-contact-copy h2 { font-size: 27px; }
                .ots-contact-kicker { font-size: 9px; }
                #otsContactShell .iletisimLeft { grid-template-columns: 1fr; }
                #otsContactShell .iletisimLeft .span.iletisimLeftAdres { grid-column: auto; }
                .ots-contact-panel { padding: 34px 23px 38px; }
                .ots-contact-panel h1 { font-size: 34px; }
                .ots-contact-bank { padding: 21px; border-radius: 14px; }
                .ots-bank-header { align-items: flex-start; flex-direction: column; gap: 7px; }
                .ots-bank-card { grid-template-columns: 1fr; }
                .ots-bank-primary { padding: 22px; }
                .ots-bank-details { padding: 10px 20px; }
                .ots-bank-row { grid-template-columns: 1fr; gap: 6px; }
                .ots-bank-copy-wrap { align-items: flex-start; flex-direction: column; }
            }
            @media (prefers-reduced-motion: reduce) {
                .ots-contact-card { animation: none; }
                #otsContactShell * { transition-duration: .01ms !important; }
            }
        `;
        document.head.appendChild(style);

        var shell = document.createElement('section');
        shell.id = 'otsContactShell';
        shell.setAttribute('aria-label', 'İletişim alanı');
        shell.innerHTML = `
            <div class="ots-contact-card">
                <aside class="ots-contact-visual">
                    <div class="ots-contact-kicker">ÖTS / Bize ulaşın</div>
                    <svg class="ots-contact-art" viewBox="0 0 560 620" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M336 40c-31 10-51 43-48 76 2 21 14 43 33 54-7 24-26 43-46 57-23 17-51 30-66 55-17 29-14 66-10 100 4 38 7 79-10 113-11 23-31 42-54 53" stroke="currentColor" stroke-width="1.3"/>
                        <path d="M348 45c23 14 33 44 29 70-4 27-20 51-42 67 24 2 50 13 68 30 30 29 36 75 37 117 1 59-7 118 12 174 8 24 21 47 40 64" stroke="currentColor" stroke-width="1.3"/>
                        <path d="M279 221c-7 52-2 114 4 165 8 66 19 131 18 197M399 210c-18 39-31 81-38 123-13 80-7 163 10 242" stroke="currentColor" stroke-width="1.1"/>
                        <path d="M241 253c34 22 69 34 110 37 33 2 65-4 92-18M207 342c40 22 83 33 128 34 38 1 75-5 108-19" stroke="currentColor" stroke-width=".8" opacity=".55"/>
                        <circle cx="467" cy="140" r="83" stroke="currentColor" stroke-width=".8" opacity=".18"/><circle cx="467" cy="140" r="112" stroke="currentColor" stroke-width=".8" opacity=".11"/>
                        <path d="M80 115h125v82H80zM80 115l62 50 63-50" stroke="currentColor" stroke-width="1" opacity=".28"/>
                    </svg>
                    <div class="ots-contact-copy"><h2>Bir mesaj kadar yakınız.</h2><p>Soruların, önerilerin ve ihtiyaç duyduğun her konuda seni dinliyoruz.</p></div>
                    <div id="otsContactInfoSlot"></div>
                </aside>
                <main class="ots-contact-panel">
                    <span class="ots-contact-panel-kicker">İletişim formu</span>
                    <h1>Nasıl yardımcı olabiliriz?</h1>
                    <p class="ots-contact-intro">Formu doldur; müşteri deneyimi ekibimiz en kısa sürede sana dönüş yapsın.</p>
                    <div id="otsContactFormSlot"></div>
                    <p class="ots-contact-privacy">Paylaştığın bilgiler yalnızca talebini yanıtlamak amacıyla kullanılır.</p>
                </main>
            </div>
            <div class="ots-contact-bank" id="otsContactBankSlot"></div>`;

        contactInfo.parentNode.insertBefore(shell, contactInfo);
        document.getElementById('otsContactInfoSlot').appendChild(contactInfo);
        document.getElementById('otsContactFormSlot').appendChild(form);
        if (bank) {
            var bankSlot = document.getElementById('otsContactBankSlot');
            bankSlot.appendChild(bank);
            bank.classList.add('ots-bank-source');

            function readBankValue(selector) {
                var row = bank.querySelector(selector);
                if (!row) return '';
                var values = Array.prototype.map.call(row.querySelectorAll(':scope > span'), function (span) {
                    return span.textContent.trim();
                }).filter(function (value) { return value && value !== ':'; });
                return values.length > 1 ? values[values.length - 1] : '';
            }

            var bankData = {
                name: readBankValue('.iletisimbanka > .span > .line1 > .line1'),
                currency: readBankValue('.iletisimbanka > .span > .line1 > .line4'),
                accountName: readBankValue('.iletisimbanka > .span > .line2 > .line1'),
                iban: readBankValue('.iletisimbanka > .span > .line3 > .line1')
            };

            var bankView = document.createElement('div');
            bankView.className = 'ots-bank-view';
            bankView.innerHTML = `
                <div class="ots-bank-header">
                    <div><span class="ots-bank-kicker">Ödeme bilgileri</span><h2>Banka hesap bilgilerimiz</h2></div>
                    <p>Havale açıklamasına sipariş numaranı eklemeyi unutma.</p>
                </div>
                <div class="ots-bank-card">
                    <div class="ots-bank-primary">
                        <span class="ots-bank-primary-label">Banka</span>
                        <strong class="ots-bank-name"></strong>
                        <span class="ots-bank-currency"></span>
                    </div>
                    <div class="ots-bank-details">
                        <div class="ots-bank-row">
                            <span class="ots-bank-label">Hesap sahibi</span>
                            <span class="ots-bank-copy-wrap">
                                <strong class="ots-bank-value ots-bank-account-name"></strong>
                                <button class="ots-bank-copy" type="button" data-copy-field="accountName">Kopyala</button>
                            </span>
                        </div>
                        <div class="ots-bank-row">
                            <span class="ots-bank-label">IBAN</span>
                            <span class="ots-bank-copy-wrap">
                                <strong class="ots-bank-value ots-bank-iban"></strong>
                                <button class="ots-bank-copy" type="button" data-copy-field="iban">Kopyala</button>
                            </span>
                        </div>
                    </div>
                </div>`;
            bankView.querySelector('.ots-bank-name').textContent = bankData.name || 'Banka bilgisi';
            bankView.querySelector('.ots-bank-currency').textContent = bankData.currency || 'TRY';
            bankView.querySelector('.ots-bank-account-name').textContent = bankData.accountName || '—';
            bankView.querySelector('.ots-bank-iban').textContent = bankData.iban || '—';
            bankView.querySelectorAll('.ots-bank-copy').forEach(function (copyButton) {
                copyButton.addEventListener('click', function () {
                    var copyField = copyButton.getAttribute('data-copy-field');
                    var copyText = (bankData[copyField] || '').trim();
                    if (!copyText) return;

                    function markCopied() {
                        copyButton.textContent = 'Kopyalandı';
                        copyButton.classList.add('is-copied');
                        window.setTimeout(function () {
                            copyButton.textContent = 'Kopyala';
                            copyButton.classList.remove('is-copied');
                        }, 1800);
                    }

                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(copyText).then(markCopied).catch(function () {
                            window.prompt('Bilgiyi kopyalayın:', copyText);
                        });
                    } else {
                        window.prompt('Bilgiyi kopyalayın:', copyText);
                    }
                });
            });
            bankSlot.appendChild(bankView);
        } else {
            document.getElementById('otsContactBankSlot').remove();
        }

        var fields = {
            txtbxAdSoyad: { placeholder: 'Adın ve soyadın', autocomplete: 'name' },
            txtbxTelefon: { placeholder: '5XX XXX XX XX', autocomplete: 'tel', inputmode: 'tel' },
            txtbxMail: { placeholder: 'ornek@eposta.com', autocomplete: 'email', inputmode: 'email' },
            txtbxMesaj: { placeholder: 'Sana nasıl yardımcı olabiliriz?' },
            txtGuvenlikKodu: { placeholder: 'Güvenlik kodunu yaz', autocomplete: 'off' }
        };
        Object.keys(fields).forEach(function (id) {
            var input = document.getElementById(id);
            if (!input) return;
            var settings = fields[id];
            Object.keys(settings).forEach(function (attribute) { input.setAttribute(attribute, settings[attribute]); });
        });

        var submit = document.getElementById('mainHolder_Iletisim_btnGonder');
        if (submit) {
            var normalizeSubmit = function () {
                if (submit.tagName === 'INPUT') submit.value = 'GÖNDER';
                else submit.textContent = 'GÖNDER';
            };
            normalizeSubmit();
            window.setTimeout(normalizeSubmit, 800);
        }

        var captcha = document.getElementById('imgTicimaxCaptcha');
        if (captcha && (!captcha.getAttribute('src') || captcha.getAttribute('src') === '#') && window.mem && window.mem.init) {
            window.mem.init.refreshXId();
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', modernizeContact);
    else modernizeContact();
}());

/* ========================================================================
 * BÖLÜM 5: ÇEREZ KULLANIM BİLDİRİMİ
 *
 * Ticimax çerez bilgilendirme alanını kurumsal, kompakt ve mobil uyumlu
 * biçimde gösterir; mevcut kabul bağlantısının davranışını korur.
 * ====================================================================== */
(function () {
    'use strict';

    var STYLE_ID = 'otsCookieNoticeStyles';
    var READY_CLASS = 'ots-cookie-ready';
    var HIDDEN_CLASS = 'ots-cookie-dismissed';
    var STORAGE_KEY = 'ots-cookie-notice-dismissed-v1';
    var renderTimer = null;
    var pageObserver = null;

    function injectStyles() {
        var style = document.getElementById(STYLE_ID);
        if (!style) {
            style = document.createElement('style');
            style.id = STYLE_ID;
            document.head.appendChild(style);
        }

        var css = [
            '#cerekKullanimUyari, #cerekKullanimUyari * {',
            '  box-sizing: border-box !important;',
            '}',
            '#cerekKullanimUyari.' + HIDDEN_CLASS + ' { display: none !important; }',
            '#cerekKullanimUyari.' + READY_CLASS + ' {',
            '  position: fixed !important;',
            '  left: 18px !important;',
            '  right: auto !important;',
            '  bottom: 20px !important;',
            '  top: auto !important;',
            '  z-index: 2147482400 !important;',
            '  width: min(420px, calc(100vw - 36px)) !important;',
            '  height: 70px !important;',
            '  min-height: 70px !important;',
            '  max-height: 70px !important;',
            '  display: grid !important;',
            '  grid-template-columns: 38px minmax(0, 1fr) 30px !important;',
            '  grid-template-rows: auto auto !important;',
            '  align-items: center !important;',
            '  align-content: center !important;',
            '  justify-content: start !important;',
            '  gap: 2px 10px !important;',
            '  margin: 0 !important;',
            '  padding: 0 12px !important;',
            '  overflow: hidden !important;',
            '  color: #0c154c !important;',
            '  border: 1px solid rgba(12,21,76,.12) !important;',
            '  border-radius: 18px !important;',
            '  background: rgba(255,255,255,.94) !important;',
            '  box-shadow: 0 18px 48px rgba(5,11,42,.16) !important;',
            '  backdrop-filter: blur(12px) !important;',
            '  -webkit-backdrop-filter: blur(12px) !important;',
            '  font-family: Arial, Helvetica, sans-serif !important;',
            '  animation: otsCookieIn .35s ease both !important;',
            '  transform: none !important;',
            '}',
            '#cerekKullanimUyari.' + READY_CLASS + '::before {',
            '  content: "" !important;',
            '  grid-column: 1 !important;',
            '  grid-row: 1 / span 2 !important;',
            '  width: 38px !important;',
            '  height: 38px !important;',
            '  min-width: 38px !important;',
            '  min-height: 38px !important;',
            '  display: block !important;',
            '  margin: 0 !important;',
            '  padding: 0 !important;',
            '  align-self: center !important;',
            '  justify-self: center !important;',
            '  border-radius: 13px !important;',
            '  background: #0c154c url("data:image/svg+xml,%3Csvg viewBox=\'0 0 24 24\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'7.2\' stroke=\'white\' stroke-width=\'2\'/%3E%3Ccircle cx=\'15.5\' cy=\'9\' r=\'1.1\' fill=\'white\'/%3E%3Ccircle cx=\'10\' cy=\'13\' r=\'1\' fill=\'white\'/%3E%3Ccircle cx=\'14\' cy=\'15.5\' r=\'1\' fill=\'white\'/%3E%3C/svg%3E") center / 23px 23px no-repeat !important;',
            '  box-shadow: inset 0 0 0 1px rgba(255,255,255,.14) !important;',
            '  transform: none !important;',
            '}',
            '#cerekKullanimUyari.' + READY_CLASS + '::after {',
            '  content: none !important;',
            '  display: none !important;',
            '}',
            '#cerekKullanimUyari.' + READY_CLASS + ' .title {',
            '  grid-column: 2 !important;',
            '  grid-row: 1 !important;',
            '  align-self: end !important;',
            '  justify-self: start !important;',
            '  margin: 0 !important;',
            '  padding: 0 !important;',
            '  color: #0c154c !important;',
            '  font-size: 13px !important;',
            '  font-weight: 900 !important;',
            '  line-height: 1.2 !important;',
            '  transform: none !important;',
            '}',
            '#cerekKullanimUyari.' + READY_CLASS + ' .title span {',
            '  color: inherit !important;',
            '  margin: 0 !important;',
            '  padding: 0 !important;',
            '}',
            '#cerekKullanimUyari.' + READY_CLASS + ' p {',
            '  grid-column: 2 !important;',
            '  grid-row: 2 !important;',
            '  align-self: start !important;',
            '  justify-self: start !important;',
            '  margin: 0 !important;',
            '  padding: 0 !important;',
            '  color: #6b7287 !important;',
            '  display: -webkit-box !important;',
            '  overflow: hidden !important;',
            '  -webkit-line-clamp: 2 !important;',
            '  -webkit-box-orient: vertical !important;',
            '  font-size: 11px !important;',
            '  font-weight: 600 !important;',
            '  line-height: 1.2 !important;',
            '  transform: none !important;',
            '}',
            '#cerekKullanimUyari.' + READY_CLASS + ' .closeBtn {',
            '  position: static !important;',
            '  grid-column: 3 !important;',
            '  grid-row: 1 / span 2 !important;',
            '  align-self: center !important;',
            '  justify-self: center !important;',
            '  width: 30px !important;',
            '  height: 30px !important;',
            '  min-width: 30px !important;',
            '  min-height: 30px !important;',
            '  display: inline-flex !important;',
            '  align-items: center !important;',
            '  justify-content: center !important;',
            '  margin: 0 !important;',
            '  padding: 0 !important;',
            '  color: #fff !important;',
            '  font-size: 13px !important;',
            '  border-radius: 50% !important;',
            '  background: #0c154c !important;',
            '  cursor: pointer !important;',
            '  opacity: 1 !important;',
            '  transform: none !important;',
            '}',
            '#cerekKullanimUyari.' + READY_CLASS + ' .closeBtn i {',
            '  color: inherit !important;',
            '  line-height: 1 !important;',
            '  font-size: inherit !important;',
            '  margin: 0 !important;',
            '  padding: 0 !important;',
            '}',
            '@keyframes otsCookieIn {',
            '  from { opacity: 0; transform: translateY(12px); }',
            '  to { opacity: 1; transform: translateY(0); }',
            '}',
            '@media (max-width: 540px) {',
            '  #cerekKullanimUyari.' + READY_CLASS + ' {',
            '    left: 12px !important;',
            '    right: auto !important;',
            '    bottom: 12px !important;',
            '    width: calc(100vw - 24px) !important;',
            '    height: 70px !important;',
            '    min-height: 70px !important;',
            '    max-height: 70px !important;',
            '    grid-template-columns: 36px minmax(0, 1fr) 30px !important;',
            '    gap: 2px 10px !important;',
            '    padding: 0 10px !important;',
            '    border-radius: 16px !important;',
            '  }',
            '  #cerekKullanimUyari.' + READY_CLASS + '::before {',
            '    width: 36px !important;',
            '    height: 36px !important;',
            '    min-width: 36px !important;',
            '    min-height: 36px !important;',
            '    border-radius: 12px !important;',
            '    background-size: 21px 21px !important;',
            '  }',
            '  #cerekKullanimUyari.' + READY_CLASS + '::after {',
            '    content: none !important;',
            '    display: none !important;',
            '  }',
            '}'
        ].join('\n');
        // Aynı CSS'i yeniden yazmak tüm sayfanın stilini yeniden hesaplatır.
        if (style.textContent !== css) style.textContent = css;
    }

    function ensureText(cookieBox) {
        var title = cookieBox.querySelector('#spnCerez') || cookieBox.querySelector('.title');
        var paragraph = cookieBox.querySelector('p');

        if (title && !title.textContent.trim()) {
            title.textContent = 'Çerez Kullanımı';
        }

        if (paragraph && !paragraph.textContent.trim()) {
            paragraph.textContent = 'Size daha iyi bir alışveriş deneyimi sunmak için çerezleri kullanıyoruz.';
        }
    }

    function isDismissed() {
        try {
            if (window.localStorage && window.localStorage.getItem(STORAGE_KEY) === 'true') return true;
        } catch (ignore) {
            /* Gizli mod veya depolama politikası localStorage erişimini engelleyebilir. */
        }

        return new RegExp('(?:^|;\\s*)' + STORAGE_KEY + '=true(?:;|$)').test(document.cookie || '');
    }

    function persistDismissal() {
        try {
            if (window.localStorage) window.localStorage.setItem(STORAGE_KEY, 'true');
        } catch (ignore) {
            /* Cookie yedeği, localStorage kullanılamadığında da tercihi korur. */
        }

        document.cookie = STORAGE_KEY + '=true; path=/; max-age=315360000; SameSite=Lax';
    }

    function hideNotice(cookieBox) {
        cookieBox.classList.remove(READY_CLASS);
        cookieBox.classList.add(HIDDEN_CLASS);
        cookieBox.setAttribute('aria-hidden', 'true');
        cookieBox.style.setProperty('display', 'none', 'important');
    }

    function showNotice(cookieBox) {
        cookieBox.classList.remove(HIDDEN_CLASS);
        cookieBox.removeAttribute('aria-hidden');
        cookieBox.style.removeProperty('display');
        cookieBox.classList.add(READY_CLASS);
    }

    function bindClose(cookieBox) {
        var close = cookieBox.querySelector('.closeBtn');
        if (!close) return false;
        if (close.getAttribute('data-ots-cookie-bound') === 'true') return true;

        close.setAttribute('data-ots-cookie-bound', 'true');
        close.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();

            persistDismissal();
            hideNotice(cookieBox);

            if (typeof window.closeCerezUyarisi === 'function') {
                try {
                    window.closeCerezUyarisi();
                } catch (ignore) {
                    /* fallback display none already applied */
                }
            }
        }, true);

        return true;
    }

    function render() {
        injectStyles();

        var cookieBox = document.getElementById('cerekKullanimUyari') ||
            document.querySelector('.cerezPopupUyari');

        if (!cookieBox) return false;

        // Tema farklı sınıfla eklese bile tek, stil hedefli bir kimlik kullan.
        if (!cookieBox.id) cookieBox.id = 'cerekKullanimUyari';

        if (isDismissed()) {
            hideNotice(cookieBox);
            return true;
        }

        ensureText(cookieBox);
        showNotice(cookieBox);

        return bindClose(cookieBox);
    }

    function scheduleRender() {
        clearTimeout(renderTimer);
        renderTimer = setTimeout(function () {
            if (render() && pageObserver) {
                pageObserver.disconnect();
                pageObserver = null;
            }
        }, 80);
    }

    function observePage() {
        if (!window.MutationObserver || !document.body) return;

        pageObserver = new MutationObserver(function (mutations) {
            var hasCookieChange = mutations.some(function (mutation) {
                var target = mutation.target;
                if (target && target.closest && target.closest('#cerekKullanimUyari, .cerezPopupUyari')) {
                    return true;
                }

                return Array.prototype.some.call(mutation.addedNodes, function (node) {
                    return node.nodeType === 1 && (
                        node.id === 'cerekKullanimUyari' ||
                        (node.matches && node.matches('.cerezPopupUyari')) ||
                        (node.querySelector && node.querySelector('#cerekKullanimUyari, .cerezPopupUyari')) ||
                        (node.parentElement && node.parentElement.closest &&
                            node.parentElement.closest('#cerekKullanimUyari, .cerezPopupUyari'))
                    );
                });
            });

            if (hasCookieChange) scheduleRender();
        });

        pageObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        window.setTimeout(function () {
            if (pageObserver) {
                pageObserver.disconnect();
                pageObserver = null;
            }
        }, 12000);
    }

    function init() {
        if (render()) return;
        observePage();

        // MutationObserver bulunmayan eski tarayıcılarda sınırlı geri dönüş denemesi.
        if (!window.MutationObserver) {
            [300, 1000, 2500].forEach(function (delay) {
                setTimeout(render, delay);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
