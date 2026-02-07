
/**
 * DMM VR女優マスターデータ生成スクリプト (売れ筋ランキング動画から逆引き版)
 * 
 * 概要:
 * 「VR」ジャンルの人気動画を取得し、そこに出演している女優をリストアップします。
 * その後、各女優の正確なVR作品数と最新発売日を取得して一覧を作成します。
 * 
 * 特徴:
 * - 全件スキャンより高速かつ、需要のある（人気作に出ている）女優を確実に網羅できます。
 * - 実行時間制限（6分）を超えても、次回そこから再開できる「レジューム機能」付き。
 * 
 * セットアップ:
 * 1. プロジェクトの設定 > スクリプト プロパティ は使用しません（シートに状態を保存します）。
 * 2. 以下の API_ID, AFFILIATE_ID を入力してください。
 */

// --- 設定エリア ---
const API_ID = 'YOUR_API_ID';             // DMM API ID
const AFFILIATE_ID = 'YOUR_AFFILIATE_ID'; // DMM アフィリエイトID
const HARVEST_PAGES = 50;                 // 取得するランキングページ数 (1ページ20件目安 * 50 = 1000動画)
// ----------------

const SHEET_MASTER = 'MasterData';
const SHEET_WORK = 'Work_Temp'; // 一時作業用（隠しシート推奨）
const EXECUTION_LIMIT_MS = 5.5 * 60 * 1000; // 5.5分

/**
 * メイン関数: これを実行してください
 */
function main() {
    const startTime = new Date().getTime();
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. シート準備
    let masterSheet = ss.getSheetByName(SHEET_MASTER);
    if (!masterSheet) {
        masterSheet = ss.insertSheet(SHEET_MASTER);
        masterSheet.appendRow(['ID', '女優名', '読み', 'VR作品数', '最新VR発売日']);
        masterSheet.setFrozenRows(1);
    }

    let workSheet = ss.getSheetByName(SHEET_WORK);
    const props = PropertiesService.getScriptProperties();
    const isHarvested = props.getProperty('IS_HARVESTED');

    // 2. フェーズ分岐
    if (!isHarvested) {
        console.log('【フェーズ1】 人気動画から女優リストを作成中...');
        harvestActresses(ss, workSheet);
    } else {
        console.log('【フェーズ2】 女優データの詳細情報(VR本数・最新日)を取得中...');
        enrichActresses(ss, workSheet, masterSheet, startTime);
    }
}

/**
 * フェーズ1: ランキングから女優を収集 (Harvest)
 */
function harvestActresses(ss, workSheet) {
    if (!workSheet) {
        workSheet = ss.insertSheet(SHEET_WORK);
        workSheet.appendRow(['ID', 'Name', 'Ruby', 'Status']); // Status: PENDING / DONE
    }

    // 既存データがある場合は読み込んで重複排除用セットを作成
    const existingIds = new Set();
    const lastRow = workSheet.getLastRow();
    if (lastRow > 1) {
        const data = workSheet.getRange(2, 1, lastRow - 1, 1).getValues();
        data.forEach(r => existingIds.add(r[0].toString()));
    }

    // APIでランキング取得
    const foundActresses = new Map(); // ID -> Object

    for (let p = 1; p <= HARVEST_PAGES; p++) {
        console.log(`ランキング取得中: ${p} / ${HARVEST_PAGES} ページ目`);
        Utilities.sleep(200); // API優しさ待機

        const items = fetchPopularVrVideos(p);
        if (!items || items.length === 0) break;

        items.forEach(item => {
            if (item.iteminfo && item.iteminfo.actress) {
                item.iteminfo.actress.forEach(act => {
                    const idStr = act.id.toString();
                    // まだシートになく、かつ今回のループでも未登録なら
                    if (!existingIds.has(idStr) && !foundActresses.has(idStr)) {
                        foundActresses.set(idStr, {
                            id: idStr,
                            name: act.name,
                            ruby: act.ruby || '' // Rubyが無い場合もある
                        });
                    }
                });
            }
        });
    }

    // 作業シートに書き込み
    if (foundActresses.size > 0) {
        const rows = Array.from(foundActresses.values()).map(a => [a.id, a.name, a.ruby, 'PENDING']);
        workSheet.getRange(workSheet.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
        console.log(`${rows.length} 名の新規女優を作業シートに追加しました。`);
    } else {
        console.log('新規女優は見つかりませんでした。');
    }

    // フェーズ完了フラグ
    PropertiesService.getScriptProperties().setProperty('IS_HARVESTED', 'true');
    console.log('フェーズ1完了。再度実行するとフェーズ2(詳細取得)が始まります。');
}

/**
 * フェーズ2: 詳細情報の取得 (Enrich)
 */
function enrichActresses(ss, workSheet, masterSheet, startTime) {
    if (!workSheet) {
        console.error('作業シートが見つかりません。設定をリセットしてください。');
        return;
    }

    // 作業シートから 'PENDING' の行を探して処理
    const dataRange = workSheet.getDataRange();
    const data = dataRange.getValues(); // 全データ読み込み (ID, Name, Ruby, Status)

    // ヘッダー除く
    let processedCount = 0;
    const masterRows = [];
    const updates = []; // 更新用: [rowIndex, colIndex, value]

    for (let i = 1; i < data.length; i++) {
        // 時間チェック
        if (new Date().getTime() - startTime > EXECUTION_LIMIT_MS) {
            console.warn('時間制限が近づいため、一時保存して終了します。');
            writeResults(masterSheet, workSheet, masterRows, updates);
            return;
        }

        const row = data[i];
        const status = row[3];

        if (status === 'PENDING') {
            const id = row[0];
            const name = row[1];
            const ruby = row[2];

            Utilities.sleep(100); // レート制限
            const info = getActressVrInfo(id);

            // VR作品が1つ以上あればマスターに追加
            if (info.count > 0) {
                console.log(`[追加] ${name} (VR: ${info.count}本)`);
                masterRows.push([id, name, ruby, info.count, info.latestDate]);
            } else {
                console.log(`[除外] ${name} (VRなし)`);
            }

            // 作業シートの状態をDONEに更新
            updates.push({ row: i + 1, col: 4, val: 'DONE' });
            processedCount++;
        }
    }

    // 残りを書き込み
    writeResults(masterSheet, workSheet, masterRows, updates);

    if (processedCount === 0 && updates.length === 0) {
        console.log('全ての処理が完了しています。');
        // 必要ならここでリセット処理: resetScript();
    }
}

/**
 * 結果をまとめて書き込むヘルパー
 */
function writeResults(masterSheet, workSheet, masterRows, updates) {
    // マスターデータへの追記
    if (masterRows.length > 0) {
        masterSheet.getRange(masterSheet.getLastRow() + 1, 1, masterRows.length, 5).setValues(masterRows);
    }

    // 作業シートのステータス更新 (これはまとめてできないのでSpreadsheetAPIの呼び出し回数節約のため、ある程度まとめてやるか、ループ内でやるかだが、ここでは簡易的にループ書き込みしない実装にする)
    // GASのAPI制限回避のため、本来は一括更新したいが、行がバラバラだと難しい。
    // 今回はシーケンシャルに処理しているので、startRowからまとめて更新できるはずだが、
    // 安全のため、setValuesで列ごと更新する。

    if (updates.length > 0) {
        // Status列(4列目)を一括で読み出し、更新して書き戻すほうが速い
        const statusRange = workSheet.getRange(2, 4, workSheet.getLastRow() - 1, 1);
        const statusValues = statusRange.getValues();

        updates.forEach(u => {
            // updatesのrowは1始まり(シート行)、statusValuesのインデックスは row-2
            statusValues[u.row - 2][0] = u.val;
        });

        statusRange.setValues(statusValues);
    }
}

/**
 * 人気VR動画を取得 (Harvest用)
 */
function fetchPopularVrVideos(offset) {
    // keyword=VR, sort=rank (人気順)
    const url = `https://api.dmm.com/affiliate/v3/ItemList?api_id=${API_ID}&affiliate_id=${AFFILIATE_ID}&site=DMM.com&service=digital&floor=videoa&keyword=VR&sort=rank&hits=20&offset=${offset}&output=json`;
    try {
        const res = UrlFetchApp.fetch(url);
        const json = JSON.parse(res.getContentText());
        return json.result.items;
    } catch (e) {
        console.error('ランキング取得エラー:', e);
        return [];
    }
}

/**
 * 女優の詳細VR情報を取得 (Enrich用)
 */
function getActressVrInfo(actressId) {
    // keyword=VR, sort=date (新着順)
    const url = `https://api.dmm.com/affiliate/v3/ItemList?api_id=${API_ID}&affiliate_id=${AFFILIATE_ID}&site=DMM.com&service=digital&floor=videoa&article=actress&article_id=${actressId}&keyword=VR&sort=date&hits=1&output=json`;

    try {
        const res = UrlFetchApp.fetch(url);
        const json = JSON.parse(res.getContentText());
        if (json.result && json.result.total_count > 0) {
            return {
                count: json.result.total_count,
                latestDate: json.result.items[0].date
            };
        }
    } catch (e) {
        console.warn(`詳細取得エラー ID:${actressId}:`, e);
    }
    return { count: 0, latestDate: '' };
}

/**
 * デバッグ用: 最初からやり直したいときに実行
 */
function resetScript() {
    PropertiesService.getScriptProperties().deleteProperty('IS_HARVESTED');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_WORK);
    if (sheet) ss.deleteSheet(sheet);
    console.log('リセットしました。main関数を実行すると最初から始まります。');
}
