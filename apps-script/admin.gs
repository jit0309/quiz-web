/**
 * 관리자 모드용 Apps Script 코드 (참고용 사본 — 실제 코드는 Google Apps Script 프로젝트에 있다).
 *
 * 적용 방법
 * 1) 프로젝트 설정 > 스크립트 속성에 아래 두 값을 추가
 *      ADMIN_EMAILS = 관리자 이메일을 쉼표로 구분 (예: a@khu.ac.kr,b@khu.ac.kr)
 *      CLIENT_ID    = index.html의 Google 클라이언트 ID
 * 2) 기존 doPost를 이 파일의 doPost로 교체하고 verifyAdmin_/adminRows_를 추가
 *    (doGet은 건드리지 않음)
 * 3) 배포 > 배포 관리 > 연필 > 새 버전 > 배포
 *    ※ 외부 요청(UrlFetchApp) 권한 승인 창이 한 번 뜬다. 승인해야 동작한다.
 */

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  // 관리자 조회 요청
  if (data.action === 'adminRows') return adminRows_(data);

  // 이하 기존 결과 저장 로직 (변경 없음)
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0)
    sheet.appendRow(['시간','닉네임','이메일','구글ID','시험','점수','총문제','정답률','틀린문항']);
  const newRow = sheet.getLastRow() + 1;
  sheet.appendRow([
    data.time, data.nickname, data.email, data.googleId,
    data.exam, data.score, data.total, data.rate,
    data.wrong || ''
  ]);
  sheet.getRange(newRow, 6, 1, 3).setNumberFormat('0');
  return json_({ status: 'ok' });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Google ID 토큰을 검증하고 이메일을 반환. 실패하면 null.
function verifyAdmin_(idToken) {
  if (!idToken) return null;
  const props = PropertiesService.getScriptProperties();
  const res = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
    { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) return null;
  const info = JSON.parse(res.getContentText());
  if (info.aud !== props.getProperty('CLIENT_ID')) return null;
  if (String(info.email_verified) !== 'true') return null;
  return String(info.email).toLowerCase();
}

// 관리자에게만 집계용 행을 돌려준다. 이메일·닉네임·구글ID는 포함하지 않는다.
function adminRows_(data) {
  let email;
  try { email = verifyAdmin_(data.idToken); }
  catch (err) { return json_({ status: 'error', message: String(err) }); }
  if (!email) return json_({ status: 'unauthorized' });

  const allowed = (PropertiesService.getScriptProperties().getProperty('ADMIN_EMAILS') || '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (allowed.indexOf(email) === -1) return json_({ status: 'forbidden' });

  const values = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getDataRange().getValues();
  if (values.length < 2) return json_({ status: 'ok', email: email, rows: [] });
  const h = {};
  values[0].forEach(function (name, i) { h[String(name).trim()] = i; });
  const rows = values.slice(1).map(function (r) {
    const t = r[h['시간']];
    return {
      time:  t instanceof Date ? t.toISOString() : String(t),
      exam:  r[h['시험']],
      score: r[h['점수']],
      total: r[h['총문제']],
      wrong: String(r[h['틀린문항']] == null ? '' : r[h['틀린문항']])
    };
  });
  return json_({ status: 'ok', email: email, rows: rows });
}
