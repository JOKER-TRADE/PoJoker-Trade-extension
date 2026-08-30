// ==UserScript==
// @name         JOKER TRADE (Pocket Option)
// @namespace    https://joker-trade.online/
// @version      3.1.0
// @description  Сигнали, трекер та статистика для Pocket Option
// @author       JOKER TRADE
// @match        https://pocketoption.com/*
// @match        https://*.pocketoption.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @connect      po.joker-trade.online
// @run-at       document-idle
// @noframes
// @updateURL    https://raw.githubusercontent.com/JOKER-TRADE/PoJoker-Trade-extension/main/joker-trade.user.js
// @downloadURL  https://raw.githubusercontent.com/JOKER-TRADE/PoJoker-Trade-extension/main/joker-trade.user.js
// ==/UserScript==

(() => {
  'use strict';

  if (window.__JOKER_TM_ACTIVE__) return;
  window.__JOKER_TM_ACTIVE__ = true;

  const API_BASE = 'https://po.joker-trade.online';

  // ---------------------------------------------------------------------
  // i18n
  // ---------------------------------------------------------------------
  const LANGS = ['uk', 'ru', 'en'];
  const LANG_LABEL = { uk: 'UA', ru: 'RU', en: 'EN' };

  const DICT = {
    loginIntro: {
      uk: 'Увійдіть через email та пароль, щоб отримати доступ до функціоналу JOKER TRADE.',
      ru: 'Войдите через email и пароль, чтобы получить доступ к функционалу JOKER TRADE.',
      en: 'Sign in with your email and password to access JOKER TRADE.'
    },
    emailPlaceholder: { uk: 'Email', ru: 'Email', en: 'Email' },
    passwordPlaceholder: { uk: 'Пароль', ru: 'Пароль', en: 'Password' },
    loginBtn: { uk: 'Увійти', ru: 'Войти', en: 'Log in' },
    loginBtnLoading: { uk: 'ВХІД...', ru: 'ВХОД...', en: 'SIGNING IN...' },
    fillFields: { uk: 'Вкажіть email і пароль.', ru: 'Укажите email и пароль.', en: 'Enter email and password.' },
    loginError: { uk: 'Помилка авторизації.', ru: 'Ошибка авторизации.', en: 'Login error.' },
    loginErrorPrefix: { uk: 'Помилка входу: ', ru: 'Ошибка входа: ', en: 'Login failed: ' },
    noTokenInResponse: {
      uk: 'Відповідь сервера не містить token або refresh_token.',
      ru: 'Ответ сервера не содержит token или refresh_token.',
      en: 'Server response is missing token or refresh_token.'
    },
    loggedOut: { uk: 'Ви вийшли з акаунту.', ru: 'Вы вышли из аккаунта.', en: 'You have been logged out.' },
    sessionInvalid: {
      uk: 'Сесія недійсна. Увійдіть знову.',
      ru: 'Сессия недействительна. Войдите снова.',
      en: 'Session invalid. Please log in again.'
    },
    sessionExpired: {
      uk: 'Сесія завершилась. Увійдіть знову.',
      ru: 'Сессия завершилась. Войдите снова.',
      en: 'Session expired. Please log in again.'
    },
    networkError: {
      uk: 'Мережева помилка. Перевірте з’єднання.',
      ru: 'Сетевая ошибка. Проверьте соединение.',
      en: 'Network error. Check your connection.'
    },
    timeoutError: { uk: 'Час очікування вичерпано.', ru: 'Время ожидания истекло.', en: 'Request timed out.' },

    tabBot: { uk: '🤖 Сигнали', ru: '🤖 Сигналы', en: '🤖 Signals' },
    tabTracker: { uk: '📊 Трекер', ru: '📊 Трекер', en: '📊 Tracker' },
    tabHistory: { uk: '📋 Статистика', ru: '📋 Статистика', en: '📋 History' },

    currentAsset: { uk: 'Поточний актив', ru: 'Текущий актив', en: 'Current asset' },
    searchingPair: { uk: 'Пошук пари...', ru: 'Поиск пары...', en: 'Searching pair...' },
    expiration: { uk: 'Термін експірації', ru: 'Срок экспирации', en: 'Expiration time' },
    getSignal: { uk: 'ОТРИМАТИ СИГНАЛ', ru: 'ПОЛУЧИТЬ СИГНАЛ', en: 'GET SIGNAL' },
    analyzing: { uk: 'АНАЛІЗ РИНКУ...', ru: 'АНАЛИЗ РЫНКА...', en: 'ANALYZING MARKET...' },

    direction: { uk: 'Напрямок:', ru: 'Направление:', en: 'Direction:' },
    entryPrice: { uk: 'Ціна входу:', ru: 'Цена входа:', en: 'Entry price:' },
    strength: { uk: 'Сила сигналу:', ru: 'Сила сигнала:', en: 'Signal strength:' },
    expirationLabel: { uk: 'Експірація:', ru: 'Экспирация:', en: 'Expiration:' },
    recommendation: { uk: 'Рекомендація:', ru: 'Рекомендация:', en: 'Recommendation:' },
    profitBtn: { uk: 'Профіт', ru: 'Профит', en: 'Profit' },
    lossBtn: { uk: 'Збиток', ru: 'Убыток', en: 'Loss' },
    skipBtn: { uk: 'Не входив', ru: 'Не входил', en: 'Skipped' },

    winrate: { uk: 'Прибуткових угод:', ru: 'Прибыльных сделок:', en: 'Winning trades:' },
    plusBtn: { uk: 'ПЛЮС (+)', ru: 'ПЛЮС (+)', en: 'WIN (+)' },
    minusBtn: { uk: 'МІНУС (-)', ru: 'МИНУС (-)', en: 'LOSS (-)' },
    resetStats: { uk: 'Скинути статистику', ru: 'Сбросить статистику', en: 'Reset stats' },

    loadingHistory: { uk: 'Завантаження історії...', ru: 'Загрузка истории...', en: 'Loading history...' },
    noHistory: { uk: 'Немає історії сигналів', ru: 'Нет истории сигналов', en: 'No signal history yet' },

    logout: { uk: 'Вийти з акаунту', ru: 'Выйти из аккаунта', en: 'Log out' },
    logoutConfirm: { uk: 'Вийти з акаунту?', ru: 'Выйти из аккаунта?', en: 'Log out of your account?' },
    resetConfirm: {
      uk: 'Обнулити локальну статистику?',
      ru: 'Обнулить локальную статистику?',
      en: 'Reset local stats to zero?'
    },

    noPairFound: {
      uk: 'Активну пару не знайдено на сторінці!',
      ru: 'Активная пара не найдена на странице!',
      en: 'No active pair found on the page!'
    },
    needLogin: { uk: 'Потрібно авторизуватися.', ru: 'Нужно авторизоваться.', en: 'You need to log in.' },
    signalErrorPrefix: { uk: 'Помилка отримання сигналу: HTTP ', ru: 'Ошибка получения сигнала: HTTP ', en: 'Signal request error: HTTP ' },
    genericErrorPrefix: { uk: 'Помилка: ', ru: 'Ошибка: ', en: 'Error: ' },
    statsSendErrorPrefix: { uk: 'Помилка відправки статистики: ', ru: 'Ошибка отправки статистики: ', en: 'Error sending stats: ' },
    statsSendHttpErrorPrefix: { uk: 'Помилка відправки статистики: HTTP ', ru: 'Ошибка отправки статистики: HTTP ', en: 'Error sending stats: HTTP ' },

    authActive: { uk: 'Авторизація активна', ru: 'Авторизация активна', en: 'Logged in' },
    accessibleSections: { uk: 'Доступні розділи:', ru: 'Доступные разделы:', en: 'Accessible sections:' },
    needAuthShort: { uk: 'Потрібно авторизуватися.', ru: 'Нужно авторизоваться.', en: 'Please log in.' },

    hotkeyLabel: { uk: 'Гаряча клавіша', ru: 'Горячая клавиша', en: 'Hotkey' },
    hotkeyDesc: {
      uk: 'Комбінація для відкриття/закриття віджета.',
      ru: 'Комбинация для открытия/закрытия виджета.',
      en: 'Combo to open/close the widget.'
    },
    changeBtn: { uk: 'Змінити', ru: 'Изменить', en: 'Change' },
    pressKeys: { uk: 'Натисніть комбінацію...', ru: 'Нажмите комбинацию...', en: 'Press a key combo...' },
    backBtn: { uk: 'Назад', ru: 'Назад', en: 'Back' },
    loggedInAs: { uk: 'Авторизовано як:', ru: 'Авторизован как:', en: 'Logged in as:' },
    notLoggedIn: { uk: 'Ви не авторизовані.', ru: 'Вы не авторизованы.', en: 'You are not logged in.' }
  };

  let currentLang = GM_getValue('joker_lang', 'uk');
  if (!LANGS.includes(currentLang)) currentLang = 'uk';

  function t(key) {
    const entry = DICT[key];
    if (!entry) return key;
    return entry[currentLang] || entry.uk || key;
  }

  function setLang(lang) {
    if (!LANGS.includes(lang)) return;
    currentLang = lang;
    GM_setValue('joker_lang', lang);
    // Re-render whichever view is currently showing.
    if (body.querySelector('#joker-login-view')) {
      renderLoginView();
    } else if (body.querySelector('#joker-settings-view')) {
      renderSettingsView();
    } else {
      renderAppView();
    }
  }

  // ---------------------------------------------------------------------
  // Hotkey config (stored, user-changeable from Settings)
  // ---------------------------------------------------------------------
  const DEFAULT_HOTKEY = { alt: true, ctrl: false, shift: false, meta: false, code: 'KeyJ', key: 'j' };

  function getHotkey() {
    const hk = GM_getValue('joker_hotkey', null);
    return hk && hk.code ? hk : DEFAULT_HOTKEY;
  }

  function saveHotkey(hk) {
    GM_setValue('joker_hotkey', hk);
  }

  function formatHotkey(hk) {
    const parts = [];
    if (hk.ctrl) parts.push('Ctrl');
    if (hk.alt) parts.push('Alt');
    if (hk.shift) parts.push('Shift');
    if (hk.meta) parts.push('Meta');
    let label = hk.key || hk.code || '?';
    if (/^Key[A-Z]$/.test(hk.code || '')) label = hk.code.slice(3);
    else if (/^Digit[0-9]$/.test(hk.code || '')) label = hk.code.slice(5);
    else label = (hk.key || label).length === 1 ? hk.key.toUpperCase() : (hk.key || label);
    parts.push(label);
    return parts.join('+');
  }

  function isModifierKey(key) {
    return key === 'Alt' || key === 'Control' || key === 'Shift' || key === 'Meta' || key === 'OS';
  }

  function matchesHotkey(e, hk) {
    return !!e.altKey === !!hk.alt &&
      !!e.ctrlKey === !!hk.ctrl &&
      !!e.shiftKey === !!hk.shift &&
      !!e.metaKey === !!hk.meta &&
      (e.code === hk.code || (hk.key && e.key.toLowerCase() === hk.key.toLowerCase()));
  }

  // ---------------------------------------------------------------------
  // Storage helpers (Tampermonkey GM storage instead of chrome.storage)
  // ---------------------------------------------------------------------
  function getAuth() {
    return {
      token: GM_getValue('joker_access_token', ''),
      refreshToken: GM_getValue('joker_refresh_token', ''),
      user: GM_getValue('joker_user', null),
      stats: GM_getValue('joker_stats', [])
    };
  }

  function saveAuth(data, fallback = {}) {
    GM_setValue('joker_access_token', data.token || fallback.token || '');
    GM_setValue('joker_refresh_token', data.refresh_token || fallback.refreshToken || '');
    GM_setValue('joker_user', data.user || fallback.user || null);
    GM_setValue('joker_stats', Array.isArray(data.stats) ? data.stats : (fallback.stats || []));
  }

  function saveStats(stats) {
    GM_setValue('joker_stats', stats);
  }

  function clearAuth() {
    GM_deleteValue('joker_access_token');
    GM_deleteValue('joker_refresh_token');
    GM_deleteValue('joker_user');
    GM_deleteValue('joker_stats');
  }

  // ---------------------------------------------------------------------
  // Network helper (GM_xmlhttpRequest avoids CORS issues cross-origin)
  // ---------------------------------------------------------------------
  function apiRequest(path, { method = 'GET', token, body } = {}) {
    return new Promise((resolve, reject) => {
      const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      GM_xmlhttpRequest({
        method,
        url: `${API_BASE}${path}`,
        headers,
        data: body ? JSON.stringify(body) : undefined,
        onload(res) {
          let data = {};
          try { data = JSON.parse(res.responseText); } catch (_) {}
          resolve({ status: res.status, ok: res.status >= 200 && res.status < 300, data });
        },
        onerror() { reject(new Error(t('networkError'))); },
        ontimeout() { reject(new Error(t('timeoutError'))); }
      });
    });
  }

  // ---------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');

    #joker-stats-tracker {
      --panel1: #0B0E0A;
      --panel2: #161C0F;
      --hairline: #2A3A1F;
      --green: #107350;
      --green-bright: #3E9457;
      --violet: #8B6BF6;
      --violet-bright: #B79CFF;
      --muted-a: #4E5752;
      --muted-b: #788079;
      --secondary: #A6A89F;
      --primary: #DBDBD6;
      --red: #C4604A;

      position: fixed;
      top: 96px;
      right: 40px;
      width: 320px;
      min-width: 260px;
      min-height: 220px;
      max-width: calc(100vw - 24px);
      max-height: calc(100vh - 120px);
      overflow: auto;
      resize: both;
      background:
        radial-gradient(circle at 88% -8%, rgba(62,148,87,0.18), transparent 55%),
        radial-gradient(circle at -8% 108%, rgba(139,107,246,0.14), transparent 55%),
        linear-gradient(160deg, var(--panel1) 0%, var(--panel2) 140%);
      color: var(--primary);
      border: 1px solid var(--hairline);
      border-radius: 20px;
      font-family: 'Inter', sans-serif;
      z-index: 999999;
      box-shadow: 0 20px 50px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,107,246,0.05);
      padding: 18px;
      box-sizing: border-box;
      display: none;
    }
    #joker-stats-tracker.open { display: block; }
    #joker-stats-tracker *, #joker-stats-tracker *::before, #joker-stats-tracker *::after { box-sizing: border-box; }
    #joker-stats-tracker::-webkit-scrollbar { width: 6px; }
    #joker-stats-tracker::-webkit-scrollbar-thumb { background: var(--hairline); border-radius: 4px; }

    #joker-header {
      cursor: move;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      margin-bottom: 14px;
      border-bottom: 1px solid var(--hairline);
      gap: 8px;
    }
    .brand-logo {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: -0.01em;
      background: linear-gradient(90deg, var(--green-bright), var(--violet-bright));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      white-space: nowrap;
    }
    .header-controls { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .header-controls span { cursor: pointer; font-size: 13px; color: var(--muted-b); }
    .hotkey-hint { font-size: 9.5px !important; cursor: default !important; color: var(--muted-a) !important; letter-spacing: 0.02em; }

    #joker-lang-select {
      background: var(--panel1);
      border: 1px solid var(--hairline);
      color: var(--secondary);
      font-family: 'Inter', sans-serif;
      font-size: 10.5px;
      border-radius: 8px;
      padding: 3px 4px;
      cursor: pointer;
      outline: none;
    }

    /* ---- Login view ---- */
    #joker-login-view p {
      font-size: 12px;
      color: var(--secondary);
      line-height: 1.5;
      margin: 0 0 14px;
    }
    #joker-login-view input {
      width: 100%;
      padding: 11px 12px;
      margin-bottom: 10px;
      background: var(--panel1);
      border: 1px solid var(--hairline);
      border-radius: 12px;
      color: var(--primary);
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      outline: none;
    }
    #joker-login-view input::placeholder { color: var(--muted-b); }
    #joker-login-view input:focus { border-color: var(--violet); }
    #joker-login-view button {
      width: 100%;
      padding: 13px;
      border: none;
      border-radius: 14px;
      background: linear-gradient(120deg, var(--violet-bright) 0%, var(--violet) 100%);
      color: #0B0E0A;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 13.5px;
      cursor: pointer;
    }
    #joker-login-view button:disabled { opacity: 0.6; cursor: default; }
    #joker-login-status {
      margin-top: 12px;
      padding: 10px 12px;
      background: var(--panel1);
      border: 1px solid var(--hairline);
      border-radius: 12px;
      font-size: 11px;
      color: var(--secondary);
      line-height: 1.5;
      white-space: pre-wrap;
      display: none;
    }
    #joker-login-status.error { color: var(--red); display: block; }
    #joker-login-status.show { display: block; }

    /* ---- Settings view ---- */
    .settings-block {
      background: var(--panel1);
      border: 1px solid var(--hairline);
      border-radius: 14px;
      padding: 12px;
      margin-bottom: 12px;
      font-size: 11px;
    }
    .settings-title {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      color: var(--violet-bright);
      margin-bottom: 5px;
      font-size: 12px;
    }
    .settings-desc { color: var(--muted-b); margin-bottom: 9px; }
    .hotkey-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    #joker-hotkey-display {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: var(--primary);
      background: var(--panel2);
      border: 1px solid var(--hairline);
      border-radius: 8px;
      padding: 6px 10px;
      flex: 1;
      text-align: center;
    }
    #joker-hotkey-change {
      background: var(--violet);
      border: none;
      color: #0B0E0A;
      font-weight: 700;
      font-size: 11px;
      border-radius: 8px;
      padding: 7px 12px;
      cursor: pointer;
      white-space: nowrap;
    }
    #joker-hotkey-change:disabled { opacity: 0.7; cursor: default; }
    .settings-account-row { color: var(--secondary); margin-bottom: 4px; }
    .settings-account-row b { color: var(--primary); }
    #joker-settings-back {
      width: 100%;
      padding: 11px;
      border: none;
      border-radius: 12px;
      background: var(--panel1);
      border: 1px solid var(--hairline);
      color: var(--secondary);
      font-family: 'Inter', sans-serif;
      font-size: 12.5px;
      cursor: pointer;
    }

    /* ---- App view ---- */
    .tab-buttons { display: flex; gap: 6px; margin-bottom: 14px; min-width: 0; }
    .tab-btn {
      flex: 1;
      background: var(--panel1);
      border: 1px solid var(--hairline);
      color: var(--muted-b);
      border-radius: 10px;
      padding: 8px 4px;
      font-size: 10.5px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
    }
    .tab-btn.active { color: var(--primary); border-color: var(--violet); background: var(--panel2); }
    .tab-content { display: none; }
    .tab-content.active { display: block; }

    .pair-title { font-size: 10.5px; color: var(--muted-b); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.03em; }
    #joker-pair {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 15px;
      color: var(--violet-bright);
      margin-bottom: 12px;
    }
    .tf-buttons { display: flex; gap: 6px; margin-bottom: 14px; min-width: 0; }
    .tf-btn {
      flex: 1;
      background: var(--panel1);
      border: 1px solid var(--hairline);
      color: var(--muted-b);
      border-radius: 10px;
      padding: 8px;
      font-size: 11px;
      cursor: pointer;
    }
    .tf-btn.active { color: #0B0E0A; background: var(--green-bright); border-color: var(--green-bright); }

    .action-section { margin-bottom: 12px; }
    #joker-get-signal {
      width: 100%;
      padding: 13px;
      border: none;
      border-radius: 14px;
      background: linear-gradient(120deg, var(--green-bright) 0%, var(--green) 100%);
      color: #0B0E0A;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
    #joker-get-signal:disabled { opacity: 0.6; cursor: default; }

    #joker-result-box {
      background: var(--panel1);
      border: 1px solid var(--hairline);
      border-radius: 14px;
      padding: 12px;
      font-size: 12px;
    }
    .result-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
    .res-label { color: var(--muted-b); }
    #res-direction.up { color: var(--green-bright); font-weight: 700; }
    #res-direction.down { color: var(--red); font-weight: 700; }
    .result-comment { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--hairline); color: var(--secondary); font-size: 11px; }
    .signal-actions { display: flex; gap: 6px; margin-top: 12px; min-width: 0; }
    .sig-action-btn { flex: 1; border: none; border-radius: 10px; padding: 8px; font-size: 11px; cursor: pointer; color: #0B0E0A; }
    .sig-action-btn.profit { background: var(--green-bright); }
    .sig-action-btn.loss { background: var(--red); }
    .sig-action-btn.skip { background: var(--muted-a); color: var(--primary); }

    .winrate-section { margin-bottom: 14px; }
    .winrate-header { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
    .winrate-bar-bg { height: 6px; background: var(--panel1); border-radius: 4px; overflow: hidden; }
    #joker-winrate-bar { height: 100%; background: var(--green-bright); width: 0%; }

    .joker-counters { display: flex; gap: 10px; min-width: 0; }
    .counter-block { flex: 1; text-align: center; background: var(--panel1); border: 1px solid var(--hairline); border-radius: 12px; padding: 10px; }
    .counter-num { font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 700; margin-bottom: 6px; }
    .joker-btn { width: 100%; border: none; border-radius: 8px; padding: 6px; font-size: 10.5px; cursor: pointer; color: #0B0E0A; }
    .plus-btn { background: var(--green-bright); }
    .minus-btn { background: var(--red); }

    .history-container { max-height: 260px; overflow-y: auto; }
    .history-empty { text-align: center; color: var(--muted-b); font-size: 12px; padding: 20px 0; }
    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--hairline);
      font-size: 11.5px;
    }
    .history-status.win { color: var(--green-bright); }
    .history-status.loss { color: var(--red); }

    .footer-section { text-align: center; }
    #joker-btn-reset, #joker-btn-logout {
      background: transparent;
      border: none;
      color: var(--muted-b);
      text-decoration: underline;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-size: 11px;
    }
    #joker-btn-reset:hover, #joker-btn-logout:hover { color: var(--secondary); }
  `;
  document.head.appendChild(style);

  // ---------------------------------------------------------------------
  // Build DOM shell (launcher + panel).
  // ---------------------------------------------------------------------
  const panel = document.createElement('div');
  panel.id = 'joker-stats-tracker';
  panel.innerHTML = `
    <div id="joker-header">
      <span class="brand-logo">🃏 JOKER TRADE</span>
      <div class="header-controls">
        <span class="hotkey-hint" id="joker-hotkey-hint" title="${t('hotkeyLabel')}">${formatHotkey(getHotkey())}</span>
        <select id="joker-lang-select" title="Language">
          ${LANGS.map(l => `<option value="${l}">${LANG_LABEL[l]}</option>`).join('')}
        </select>
        <span id="joker-btn-settings" title="Settings">⚙️</span>
      </div>
    </div>
    <div id="joker-body"></div>
  `;
  document.body.appendChild(panel);

  const body = panel.querySelector('#joker-body');
  const langSelect = panel.querySelector('#joker-lang-select');
  langSelect.value = currentLang;
  langSelect.addEventListener('change', (e) => setLang(e.target.value));
  langSelect.addEventListener('mousedown', (e) => e.stopPropagation()); // don't trigger header drag
  panel.querySelector('#joker-btn-settings').addEventListener('click', () => renderSettingsView());

  function renderLoginView(message = '') {
    body.innerHTML = `
      <div id="joker-login-view">
        <p>${t('loginIntro')}</p>
        <input id="joker-email" type="email" autocomplete="username" placeholder="${t('emailPlaceholder')}">
        <input id="joker-password" type="password" autocomplete="current-password" placeholder="${t('passwordPlaceholder')}">
        <button id="joker-login-btn">${t('loginBtn')}</button>
        <div id="joker-login-status"></div>
      </div>
    `;

    const emailInput = body.querySelector('#joker-email');
    const passwordInput = body.querySelector('#joker-password');
    const loginBtn = body.querySelector('#joker-login-btn');
    const statusEl = body.querySelector('#joker-login-status');

    function setStatus(text, isError = false) {
      statusEl.textContent = text;
      statusEl.className = text ? (isError ? 'show error' : 'show') : '';
    }
    if (message) setStatus(message);

    async function doLogin() {
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      if (!email || !password) { setStatus(t('fillFields'), true); return; }

      loginBtn.disabled = true;
      loginBtn.textContent = t('loginBtnLoading');
      try {
        const { ok, data } = await apiRequest('/api/user/auth/login', { method: 'POST', body: { email, password } });
        if (!ok || data.status !== 'ok') {
          throw new Error(data?.detail || data?.message || data?.error || t('loginError'));
        }
        if (!data.token || !data.refresh_token) {
          throw new Error(t('noTokenInResponse'));
        }
        saveAuth(data);
        renderAppView();
      } catch (err) {
        console.error('[JOKER TM] Login failed:', err);
        setStatus(t('loginErrorPrefix') + (err?.message || err), true);
      } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = t('loginBtn');
      }
    }

    loginBtn.addEventListener('click', doLogin);
    passwordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
  }

  function renderSettingsView() {
    const auth = getAuth();
    const hk = getHotkey();

    body.innerHTML = `
      <div id="joker-settings-view">
        <div class="settings-block">
          <div class="settings-title">${t('hotkeyLabel')}</div>
          <div class="settings-desc">${t('hotkeyDesc')}</div>
          <div class="hotkey-row">
            <span id="joker-hotkey-display">${formatHotkey(hk)}</span>
            <button id="joker-hotkey-change">${t('changeBtn')}</button>
          </div>
        </div>
        <div class="settings-block">
          <div class="settings-title">${t('authActive')}</div>
          ${auth.user
            ? `<div class="settings-account-row">${t('loggedInAs')} <b>${auth.user.email || ''}</b></div>` +
              (Array.isArray(auth.user.accessible_sections) && auth.user.accessible_sections.length
                ? `<div class="settings-account-row">${t('accessibleSections')} ${auth.user.accessible_sections.join(', ')}</div>`
                : '')
            : `<div class="settings-account-row">${t('notLoggedIn')}</div>`}
        </div>
        <button id="joker-settings-back">${t('backBtn')}</button>
      </div>
    `;

    const display = body.querySelector('#joker-hotkey-display');
    const changeBtn = body.querySelector('#joker-hotkey-change');

    changeBtn.addEventListener('click', () => {
      changeBtn.disabled = true;
      changeBtn.textContent = t('changeBtn');
      display.textContent = t('pressKeys');

      const handler = (e) => {
        if (isModifierKey(e.key)) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.key === 'Escape') {
          display.textContent = formatHotkey(hk);
          changeBtn.disabled = false;
          document.removeEventListener('keydown', handler, true);
          return;
        }
        const newHk = { alt: e.altKey, ctrl: e.ctrlKey, shift: e.shiftKey, meta: e.metaKey, code: e.code, key: e.key };
        saveHotkey(newHk);
        display.textContent = formatHotkey(newHk);
        const hintEl = panel.querySelector('#joker-hotkey-hint');
        if (hintEl) { hintEl.textContent = formatHotkey(newHk); hintEl.title = formatHotkey(newHk); }
        changeBtn.disabled = false;
        document.removeEventListener('keydown', handler, true);
      };
      document.addEventListener('keydown', handler, true);
    });

    body.querySelector('#joker-settings-back').addEventListener('click', () => {
      const a = getAuth();
      if (a.token) renderAppView(); else renderLoginView();
    });
  }

  function renderAppView() {
    body.innerHTML = `
      <div class="tab-buttons">
        <button class="tab-btn active" data-tab="bot">${t('tabBot')}</button>
        <button class="tab-btn" data-tab="tracker">${t('tabTracker')}</button>
        <button class="tab-btn" data-tab="history">${t('tabHistory')}</button>
      </div>

      <div id="tab-content-bot" class="tab-content active">
        <div class="pair-section">
          <div class="pair-title">${t('currentAsset')}</div>
          <div id="joker-pair">${t('searchingPair')}</div>
        </div>
        <div class="timeframe-section">
          <div class="pair-title">${t('expiration')}</div>
          <div class="tf-buttons">
            <button class="tf-btn" data-tf="S5">С5</button>
            <button class="tf-btn active" data-tf="M2">М2</button>
            <button class="tf-btn" data-tf="M5">М5</button>
            <button class="tf-btn" data-tf="M10">М10</button>
          </div>
        </div>
        <div class="action-section">
          <button id="joker-get-signal">${t('getSignal')}</button>
        </div>
        <div id="joker-result-box" style="display:none;">
          <div class="result-row"><span class="res-label">${t('direction')}</span> <span id="res-direction">-</span></div>
          <div class="result-row"><span class="res-label">${t('entryPrice')}</span> <span id="res-price">-</span></div>
          <div class="result-row"><span class="res-label">${t('strength')}</span> <span id="res-strength">-</span></div>
          <div class="result-row"><span class="res-label">${t('expirationLabel')}</span> <span id="res-expiration">-</span></div>
          <div class="result-row"><span class="res-label">${t('recommendation')}</span> <span id="res-entry">-</span></div>
          <div class="result-comment" id="res-comment">-</div>
          <div class="signal-actions">
            <button id="joker-btn-profit" class="sig-action-btn profit">${t('profitBtn')}</button>
            <button id="joker-btn-loss" class="sig-action-btn loss">${t('lossBtn')}</button>
            <button id="joker-btn-skip" class="sig-action-btn skip">${t('skipBtn')}</button>
          </div>
        </div>
      </div>

      <div id="tab-content-tracker" class="tab-content">
        <div class="winrate-section">
          <div class="winrate-header"><span>${t('winrate')}</span><span id="joker-winrate-value">0%</span></div>
          <div class="winrate-bar-bg"><div id="joker-winrate-bar" style="width: 0%"></div></div>
        </div>
        <div class="joker-counters">
          <div class="counter-block">
            <div id="joker-count-plus" class="counter-num">0</div>
            <button id="joker-btn-plus" class="joker-btn plus-btn">${t('plusBtn')}</button>
          </div>
          <div class="counter-block">
            <div id="joker-count-minus" class="counter-num">0</div>
            <button id="joker-btn-minus" class="joker-btn minus-btn">${t('minusBtn')}</button>
          </div>
        </div>
        <div class="footer-section" style="margin-top:10px">
          <button id="joker-btn-reset">${t('resetStats')}</button>
        </div>
      </div>

      <div id="tab-content-history" class="tab-content">
        <div class="history-container" id="joker-history-list">
          <div class="history-empty">${t('loadingHistory')}</div>
        </div>
      </div>

      <div class="footer-section" style="margin-top:15px">
        <button id="joker-btn-logout">${t('logout')}</button>
      </div>
    `;

    let selectedTimeframe = 'M2';
    let pluses = 0, minuses = 0;
    let currentAssetForStats = '';

    body.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        body.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        body.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        body.querySelector('#tab-content-' + e.currentTarget.getAttribute('data-tab')).classList.add('active');
      });
    });

    const pNum = body.querySelector('#joker-count-plus');
    const mNum = body.querySelector('#joker-count-minus');
    const winrateVal = body.querySelector('#joker-winrate-value');
    const winrateBar = body.querySelector('#joker-winrate-bar');
    const historyContainer = body.querySelector('#joker-history-list');

    function updateCountersDisplay() {
      if (!pNum || !mNum || !winrateVal || !winrateBar) return;
      pNum.textContent = pluses;
      mNum.textContent = minuses;
      const total = pluses + minuses;
      if (total === 0) {
        winrateVal.textContent = '0%';
        winrateBar.style.width = '0%';
        return;
      }
      const percentage = ((pluses / total) * 100).toFixed(1);
      winrateVal.textContent = `${percentage}%`;
      winrateBar.style.width = `${percentage}%`;
    }

    function renderHistory(statsArray) {
      if (!historyContainer) return;
      const signalsOnly = (statsArray || []).filter(item => item.source === 'SIGNALS');
      if (signalsOnly.length === 0) {
        historyContainer.innerHTML = `<div class="history-empty">${t('noHistory')}</div>`;
        return;
      }
      let html = '';
      signalsOnly.forEach(item => {
        const isWin = item.profit === true;
        const statusClass = isWin ? 'win' : 'loss';
        const statusText = isWin ? t('plusBtn') : t('minusBtn');
        const d = new Date(item.created_at);
        const dateStr = d.toLocaleDateString([], { day: '2-digit', month: '2-digit' }) +
          ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        html += `<div class="history-item"><span class="history-asset">${item.asset}</span><span style="color:var(--muted-b);font-family:'JetBrains Mono',monospace;font-size:10px">${dateStr}</span><span class="history-status ${statusClass}">${statusText}</span></div>`;
      });
      historyContainer.innerHTML = html;
    }

    function loadLocalStats() {
      const auth = getAuth();
      renderHistory(auth.stats);
      updateCountersDisplay();
    }

    body.querySelector('#joker-btn-plus').addEventListener('click', () => { pluses++; updateCountersDisplay(); });
    body.querySelector('#joker-btn-minus').addEventListener('click', () => { minuses++; updateCountersDisplay(); });
    body.querySelector('#joker-btn-reset').addEventListener('click', () => {
      if (confirm(t('resetConfirm'))) {
        pluses = 0; minuses = 0;
        updateCountersDisplay();
      }
    });
    body.querySelector('#joker-btn-logout').addEventListener('click', () => {
      if (confirm(t('logoutConfirm'))) {
        clearAuth();
        renderLoginView(t('loggedOut'));
      }
    });

    body.querySelectorAll('.tf-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        body.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        selectedTimeframe = e.currentTarget.getAttribute('data-tf');
      });
    });

    function updatePairFromPage() {
      const pairEl = body.querySelector('#joker-pair');
      if (!pairEl || !panel.classList.contains('open')) return;
      let foundPair = '';
      const pairRegex = /[A-Z]{3}\/[A-Z]{3}(\s*OTC)?/i;
      const elements = document.querySelectorAll('span,div,h1,h2,p,button');
      for (const el of elements) {
        if (el.closest && el.closest('#joker-stats-tracker')) continue;
        if (el.innerText && pairRegex.test(el.innerText)) {
          const match = el.innerText.match(pairRegex);
          if (match) { foundPair = match[0]; break; }
        }
      }
      if (foundPair) pairEl.textContent = foundPair.toUpperCase();
    }
    if (panel._jokerPairInterval) clearInterval(panel._jokerPairInterval);
    panel._jokerPairInterval = setInterval(updatePairFromPage, 2000);
    updatePairFromPage();

    function formatAsset(pairText) {
      let cleaned = pairText.replace(/\s+/g, '').replace('/', '');
      if (cleaned.toUpperCase().includes('OTC')) cleaned = cleaned.replace(/OTC/i, '') + '_otc';
      return cleaned;
    }

    async function sendStatsResult(profitVal) {
      const auth = getAuth();
      if (!auth.token) { alert(t('needLogin')); return; }

      try {
        const { ok, status, data } = await apiRequest('/api/bot/stats/', {
          method: 'POST', token: auth.token,
          body: { asset: currentAssetForStats, source: 'SIGNALS', profit: profitVal }
        });
        if (status === 401) throw new Error(t('sessionExpired'));
        if (!ok) throw new Error(t('statsSendHttpErrorPrefix') + status);

        const stats = Array.isArray(auth.stats) ? auth.stats : [];
        if (data && typeof data === 'object' && data.id) {
          stats.unshift(data);
        } else {
          stats.unshift({
            id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
            asset: currentAssetForStats,
            profit: profitVal,
            source: 'SIGNALS',
            created_at: new Date().toISOString()
          });
        }
        saveStats(stats);

        if (profitVal) pluses++; else minuses++;
        updateCountersDisplay();
        renderHistory(stats);
      } catch (err) {
        console.error('[JOKER TM] Stats error:', err);
        if (err.message === t('sessionExpired')) {
          clearAuth();
          renderLoginView(t('sessionInvalid'));
          return;
        }
        alert(t('statsSendErrorPrefix') + err.message);
      }
      const resultBox = body.querySelector('#joker-result-box');
      if (resultBox) resultBox.style.display = 'none';
    }
    body.querySelector('#joker-btn-profit').addEventListener('click', () => sendStatsResult(true));
    body.querySelector('#joker-btn-loss').addEventListener('click', () => sendStatsResult(false));
    body.querySelector('#joker-btn-skip').addEventListener('click', () => {
      const resultBox = body.querySelector('#joker-result-box');
      if (resultBox) resultBox.style.display = 'none';
    });

    body.querySelector('#joker-get-signal').addEventListener('click', async () => {
      const pairEl = body.querySelector('#joker-pair');
      const rawPair = pairEl ? pairEl.textContent : '';
      const btn = body.querySelector('#joker-get-signal');

      if (!rawPair || rawPair === t('searchingPair')) { alert(t('noPairFound')); return; }

      const auth = getAuth();
      if (!auth.token) { alert(t('needLogin')); return; }

      const asset = formatAsset(rawPair);
      currentAssetForStats = rawPair;
      btn.textContent = t('analyzing');
      btn.disabled = true;

      try {
        const { ok, status, data } = await apiRequest('/api/bot/signal/', {
          method: 'POST', token: auth.token,
          body: { asset, deal_type: selectedTimeframe }
        });
        if (status === 401) throw new Error(t('sessionExpired'));
        if (!ok) throw new Error(t('signalErrorPrefix') + status);

        if (!body.isConnected) return;

        body.querySelector('#res-expiration').textContent = data.expiration ?? '-';
        body.querySelector('#res-strength').textContent = data.strength ?? '-';
        const dirEl = body.querySelector('#res-direction');
        dirEl.textContent = data.direction ?? '-';
        dirEl.className = String(data.direction || '').toUpperCase() === 'UP' ? 'up' : 'down';
        body.querySelector('#res-price').textContent = data.price ?? '-';
        body.querySelector('#res-entry').textContent = data.entry_section ?? '-';
        body.querySelector('#res-comment').textContent = data.comment ?? '-';
        body.querySelector('#joker-result-box').style.display = 'block';
      } catch (err) {
        console.error('[JOKER TM] Signal error:', err);
        if (err.message === t('sessionExpired')) {
          clearAuth();
          renderLoginView(t('sessionInvalid'));
          return;
        }
        alert(t('genericErrorPrefix') + err.message);
      } finally {
        btn.textContent = t('getSignal');
        btn.disabled = false;
      }
    });

    updateCountersDisplay();
    loadLocalStats();
  }

  // ---------------------------------------------------------------------
  // Hotkey toggle (Alt+J) + drag
  // ---------------------------------------------------------------------
  function toggleWidget() {
    const isOpen = panel.classList.toggle('open');
    if (isOpen) {
      const auth = getAuth();
      if (auth.token) renderAppView(); else renderLoginView();
    }
  }

  document.addEventListener('keydown', (e) => {
    const hk = getHotkey();
    if (matchesHotkey(e, hk)) {
      e.preventDefault();
      toggleWidget();
    }
  }, true);

  (function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = panel.querySelector('#joker-header');
    header.addEventListener('mousedown', dragMouseDown);
    header.addEventListener('touchstart', dragTouchStart, { passive: true });

    function dragMouseDown(e) {
      if (e.target.id === 'joker-btn-settings' || e.target.id === 'joker-lang-select') return;
      e.preventDefault();
      pos3 = e.clientX; pos4 = e.clientY;
      document.addEventListener('mouseup', closeDragElement);
      document.addEventListener('mousemove', elementDrag);
    }
    function dragTouchStart(e) {
      if (e.target.id === 'joker-btn-settings' || e.target.id === 'joker-lang-select') return;
      pos3 = e.touches[0].clientX; pos4 = e.touches[0].clientY;
      document.addEventListener('touchend', closeDragElement);
      document.addEventListener('touchmove', elementTouchDrag);
    }
    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY;
      pos3 = e.clientX; pos4 = e.clientY;
      elmnt.style.top = (elmnt.offsetTop - pos2) + 'px';
      elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
      elmnt.style.right = 'auto';
    }
    function elementTouchDrag(e) {
      pos1 = pos3 - e.touches[0].clientX; pos2 = pos4 - e.touches[0].clientY;
      pos3 = e.touches[0].clientX; pos4 = e.touches[0].clientY;
      elmnt.style.top = (elmnt.offsetTop - pos2) + 'px';
      elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
      elmnt.style.right = 'auto';
    }
    function closeDragElement() {
      document.removeEventListener('mouseup', closeDragElement);
      document.removeEventListener('mousemove', elementDrag);
      document.removeEventListener('touchend', closeDragElement);
      document.removeEventListener('touchmove', elementTouchDrag);
    }
  })(panel);

  console.log('%c[JOKER TM] userscript loaded', 'color:#8B6BF6;font-weight:bold');
})();
