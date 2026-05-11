/**
 * USA Work — запись лидов из сайта в Google Таблицу.
 *
 * КАК НАСТРОИТЬ:
 * 1) Создайте Google Таблицу.
 * 2) Откройте Extensions -> Apps Script.
 * 3) Вставьте этот код.
 * 4) ВСТАВЬТЕ ID своей таблицы в SPREADSHEET_ID.
 * 5) Сохраните проект.
 * 6) Deploy -> New deployment -> Web app.
 * 7) Execute as: Me
 * 8) Who has access: Anyone
 * 9) Нажмите Deploy и скопируйте Web App URL.
 * 10) Вставьте этот URL в js/config.js на сайте.
 */

const SPREADSHEET_ID = 'PASTE_YOUR_SPREADSHEET_ID_HERE';
const SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    const sheet = getOrCreateSheet_();
    const p = e.parameter || {};

    sheet.appendRow([
      new Date(),
      p.name || '',
      p.phone || '',
      p.job || '',
      p.country || '',
      p.experience || '',
      p.messenger || '',
      p.source || '',
      p.utm || '',
      p.page || '',
      p.created_at || '',
      p.user_agent || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'date',
      'name',
      'phone',
      'job',
      'country',
      'experience',
      'messenger',
      'source',
      'utm',
      'page',
      'created_at',
      'user_agent'
    ]);
  }

  return sheet;
}
