// ======================== НАСТРОЙКА GOOGLE SHEETS ========================
// 1) Создайте Google таблицу.
// 2) Откройте Apps Script и вставьте код из файла google-apps-script.js
// 3) Опубликуйте как Web App (Anyone)
// 4) Вставьте ссылку сюда.
//
// ВАЖНО: без вашей личной ссылки Google Apps Script форма не сможет записывать лиды
// в вашу таблицу, потому что только вы можете создать web app в своём Google аккаунте.

window.SITE_CONFIG = {
  googleSheetsEndpoint: 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
  successMessage: 'Спасибо! Заявка отправлена. Менеджер скоро свяжется с вами.'
};
