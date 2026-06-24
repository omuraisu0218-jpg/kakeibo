// 2つのボタンを要素として取得します
const container=document.querySelector('.nyushutsu-container');
const nyukinBtn = document.querySelector('.nyushutsu-item1');
const shukkinBtn = document.querySelector('.nyushutsu-item2');
const sbpWrap = document.querySelector('.grid-container-sbp-wrap');
const nyukinPad = document.querySelector('.nyushutsu-padding1');
const shukkinPad = document.querySelector('.nyushutsu-padding2');
const submitBtn = document.querySelector('.submit-btn');
const submitBtn2 = document.querySelector('.submit-btn2');
const nyukinReasonInput = document.querySelector('.nyukin-block .input-reason');
const nyukinPriceInput = document.querySelector('.nyukin-block .input-price');
const shukkinReasonInput = document.querySelector('.shukkin-block .input-reason');
const shukkinPriceInput = document.querySelector('.shukkin-block .input-price');
const kaikeiboList = document.querySelector('#kaikeibo-list')

//家計簿データをまとめて管理する配列（最初はローカルストレージから読み込む）
let kaikeiboData = JSON.parse(localStorage.getItem('kaikeiboData')) || [
    //最初から表示しておきたい初期データを入れておく
    {date: '2026/06/20', reason:'初期残高',price: 200407,zandaka: 200407}
];
//画面にデータを全て書き出す関数
function renderaData() {
    kaikeiboList.innerHTML = ''; //一度画面をクリア

    kaikeiboData.forEach((item, index) => {
        const newRow = document.createElement('div');

        //金額の表記（マイナスの時は自動で-がつく)
        const displayPrice = item.price > 0 ? `${item.price.toLocaleString()}円`: `${item.price.toLocaleString()}円`;

        newRow.innerHTML = `
        <div class="grid-data1">${item.date}</div>
        <div class="grid-data2">${item.reason}</div>
        <div class="grid-data3">${displayPrice}</div>
        <div class="grid-data4">${item.zandaka.toLocaleString()}円</div>
        <div class="action-box">
            <button class="edit-btn" data-index="${index}">編集</button>
            <button class="delete-btn" data-index="${index}">削除</button>
        </div>
        `;
        kaikeiboList.appendChild(newRow);
    });
}

//データをローカルストレージに保存する関数
function saveAndRender(newData) {
    kaikeiboData.push(newData); //配列に新しいデータを追加
    localStorage.setItem('kaikeiboData',JSON.stringify(kaikeiboData)); //保存
    renderaData(); //画面を更新
}

//現在の一番最新の残高を取得する関数
function getLatestZandaka() {
    if (kaikeiboData.length === 0) return 0;
    return kaikeiboData[kaikeiboData.length - 1].zandaka;
}

//ボタンクリックイベント
nyukinBtn.addEventListener('click', (e) => {
    nyukinBtn.classList.add('active'); 
    shukkinBtn.classList.remove('active');
    container.classList.add('active');
    nyukinPad.classList.add('active');
    sbpWrap.classList.add('active');
    e.stopPropagation();
});

shukkinBtn.addEventListener('click', (e) => {
    shukkinBtn.classList.add('active');
    nyukinBtn.classList.remove('active');
    container.classList.add('active');
    shukkinPad.classList.add('active');
    sbpWrap.classList.add('active');
    e.stopPropagation();
});

//入金確定
submitBtn.addEventListener('click', () => {
    const reason = nyukinReasonInput.value || "未入力理由";
    const inputPrice = Number(nyukinPriceInput.value || "0");

    const currentZandaka = getLatestZandaka();
    const newZandaka = currentZandaka + inputPrice;

    const today = new Date();
    const dateString = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

    //データを保存関数に渡す
    saveAndRender({ date: dateString, reason: reason, price: inputPrice, zandaka: newZandaka });

    nyukinReasonInput.value = "";
    nyukinPriceInput.value = "";
    closeInputs();
});

//出金確定
submitBtn2.addEventListener('click', () => {
    const reason = shukkinReasonInput.value || "未入力理由";
    const inputPrice = Number(shukkinPriceInput.value || "0");

    const currentZandaka = getLatestZandaka();
    const newZandaka = currentZandaka - inputPrice; //出金だけんマイナス

    const today = new Date();
    const dateString = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

    //データを保存関数に渡す(出金だけん金額をマイナスにして保存)
    saveAndRender({ date: dateString, reason: reason, price: -inputPrice, zandaka: newZandaka});

    shukkinReasonInput.value = "";
    shukkinPriceInput.value = "";
    closeInputs();
});

function closeInputs () {
    nyukinBtn.classList.remove('active');
    shukkinBtn.classList.remove('active');
    container.classList.remove('active');
    nyukinPad.classList.remove('active');
    shukkinPad.classList.remove('active');
    sbpWrap.classList.remove('active');
}

document.addEventListener('click', (e) => {
    if (e.target.closest('.input-box')) return;
    closeInputs();
});

//アプリが起動した時に、最初に一度データを画面に描きだす
renderaData();

//現在編集中のデータの番号を記録する変数
let editingIndex = null;

//削除ボタンや編集ボタン、および編集完了のクリックを監視する処理
kaikeiboList.addEventListener('click' , (e) => {
    const targetBtn = e.target;
    const targetIndex = Number(targetBtn.getAttribute('data-index'));

    //削除ボタン（またはキャンセルボタン)がクリックされたとき
    if (targetBtn.classList.contains('delete-btn')) {
        //[キャンセル機能]もし編集モード中にキャンセルが押されたら元に戻す
        if (editingIndex !== null) {
            editingIndex = null;
            renderaData();//編集を破棄して描き直す
            return;
        }

        //通常の削除処理
        if (targetIndex === 0 ) {
            alert("初期残高の行は削除できません！");
            return;
        }
        if (!confirm("この行のデータを削除してもよろしいですか？")) {
            return;
        }
        kaikeiboData.splice(targetIndex, 1);
        recalculateZandaka();
        localStorage.setItem('kaikeiboData', JSON.stringify(kaikeiboData));
        renderaData();
        return;
    }

    //編集ボタンがクリックされたとき
    if (targetBtn.classList.contains('edit-btn')) {
        //[確定機能]すでに自分が編集モードだった場合、ここに文字を読み取って上書きする
        if (editingIndex === targetIndex) {
            const currentRow = targetBtn.closest('.grid-container-added');

            //画面のマス目から人間が書き換えた最新の文字を取得する
            const newDate = currentRow.querySelector('.grid-data1').textContent;
            const newReason = currentRow.querySelector('grid-data2').textContent;

            //金額の文字から数字だけを抽出する
            const priceText = currentRow.querySelector('.grid-data3').textContent;
            const cleanPriceText = priceText.replace(/,/g, '').replace('円', '');
            const newPrice = Number(cleanPriceText);

            //データを上書き保存する
            kaikeiboData[targetIndex].date = newDate;
            kaikeiboData[targetIndex].reason = newReason;
            kaikeiboData[targetIndex].price = newPrice;

            //再計算と保存
            recalculateZandaka();
            localStorage.setItem('kaikeiboData', JSON.stringify(kaikeiboData));

            editingIndex = null; //編集モード終了
            renderaData();
            return;
        }

        //初期残高は編集不可にするカード
        if (targetIndex === 0) {
            alert("初期残高の行は編集できません！");
            return;
        }

        //[編集モード開始]クリックされた行を編集状態にする
        editingIndex = targetIndex;
        renderaData(); //ボタンの見た目やマス目の状態を切り替えるために一度書き出す

        //書き直しした後、その行のマス目を直接入力できる状態に変える
        //index番号を元に、画面上の該当する行を見つける
        const rows = kaikeiboList.querySelectorAll('.grid-data1');
        const activeRow = rows[targetIndex - 1]; //初期データの分を引いた位置

        if (activeRow) {
            const dateCell = activeRow.querySelector('.grid-data1');
            const reasonCell = activeRow.querySelector('.grid-data2');
            const priceCell = activeRow.querySelector('.grid-data3');

            //contenteditableをtrueにすることで、直接デリートキーで消して打ち込めるようになる
            dateCell.contentEditable = "true";
            reasonCell.contentEditable = "true";
            priceCell.contentEditable = "true";

            //どこが編集できるかわかりやすいように、うっすら背景色を変える
            dateCell.style.backgroundColor = "#fff";
            reasonCell.style.backgroundColor = "#fff";
            priceCell.style.backgroundColor = "#fff";

            //最初の日付のますに自動でカーソルを合わせる
            dateCell.focus();
        }
    }
});

//画面にデータをすべて書き出す関数
function renderaData() {
    kaikeiboList.innerHTML = '';
    
    kaikeiboData.forEach((item, index) => {
        //初期残高以外のデータの行にこのクラスを付与するために調整
        const newRow = document.createElement('div');
        newRow.className = 'grid-container-added';

        const displayPrice = item.price > 0 ? `${item.price.toLocaleString()}円`:`${item.price.toLocaleString()}円`;

        //現在の行が編集中の行かどうかでボタンの文字とクラス(色)を切り替える
        const isEditing = (editingIndex === index);
        const editBtnText = isEditing ? "確定" : "編集";
        const deleteBtnText = isEditing ? "キャンセル" : "削除";

        //確定ボタンの時だけ少し色を変えたい場合はクラス名を調整する
        const editBtnClass = isEditing ? "edit-btn save-mode" : "edit-btn";

        newRow.innerHTML = `
        <div class="grid-data1">${item.date}</div>
        <div class="grid-data2">${item.reason}</div>
        <div class="grid-data3">${displayPrice}</div>
        <div class="grid-data4">${item.zandaka.toLocaleString()}円</div>
        <div class="action-box">
            <button class="${editBtnClass}" data-index="${index}">${editBtnText}</button>
            <button class="delete-btn" data-index="${index}">${deleteBtnText}</button>
        </div>
        `;
        kaikeiboList.appendChild(newRow);
    });
}

//[キャンセル機能]編集エリア以外をクリックした時にキャンセルする処理
document.addEventListener('click', (e) => {
    //もし編集モード中でなければ何もしない
    if (editingIndex === null) return;

    //クリックされた場所が、会計簿リスト(#kaikeibo-list)の外側だったらキャンセル
    if (!e.target.closest('#kaikeibo-list') && !e.target.closest('.nyushutsu-container')) {
        editingIndex = null;
        renderaData(); //描き戻す
    }
});


//↓テーブルの編集機能を追加する前のプログラム
// //削除ボタンや編集ボタンのクリックを監視する処理
// kaikeiboList.addEventListener('click', (e) => {
//     //クリックされた要素が削除ボタンかチェックする
//     if (e.target.classList.contains('delete-btn')) {
//         //ボタンに仕組んでおいた番号(index)を取得する
//         const targetIndex = Number(e.target.getAttribute('data-index'));

//         //初期データ(0番目)は削除できないようにガードをかける
//         if (targetIndex === 0) {
//             alert("初期残高の行は削除できません！");
//             return;
//         }

//         //確認メッセージを出す
//         if (!confirm("この行のデータを削除してもよろしいですか？")) {
//             return;
//         }

//         //配列から指定した番号のデータを1件削除する
//         kaikeiboData.splice(targetIndex, 1);

//         //データが消えて順番がずれたので、残高を上から再計算する
//         recalculateZandaka();

//         //ローカルストレージに最新状態を上書き保存する
//         localStorage.setItem('kaikeiboData', JSON.stringify(kaikeiboData));

//         //画面を最新のデータで描き直す
//         renderaData();
//     }
// });

// //すべてのデータの残高を最初から綺麗に計算し直す関数
// function recalculateZandaka() {
//     //0番目の初期残高をスタート地点にする
//     let currentZandaka = kaikeiboData[0].zandaka;

//     //1番目のデータから順番に、入金ならプラス、出金ならマイナスしていく
//     for (let i = 1; i < kaikeiboData; i++) {
//         currentZandaka += kaikeiboData.length[i].price; //出金は最初からマイナスの数値が入っているので足し算で大丈夫
//         kaikeiboData[i].zandaka = currentZandaka; //新しい残高をデータに上書き
//     }
// }


//↓テーブルを削除する機能を適応する前のプログラム。
// // 入金ボタンがクリックされたときの処理
// nyukinBtn.addEventListener('click', (e) => {
//     nyukinBtn.classList.add('active');     // 入金ボタンに active クラスを追加
//     shukkinBtn.classList.remove('active'); // 出金ボタンの active クラスを消去

//     container.classList.add('active');
    
//     nyukinPad.classList.add('active');
    
//     sbpWrap.classList.add('active');
    
//     e.stopPropagation();
// });

// // 出金ボタンがクリックされたときの処理
// shukkinBtn.addEventListener('click', (e) => {
//     shukkinBtn.classList.add('active');    // 出金ボタンに active クラスを追加
//     nyukinBtn.classList.remove('active');  // 入金ボタンの active クラスを消去

//     container.classList.add('active');

//     shukkinPad.classList.add('active');

//     sbpWrap.classList.add('active');

//     e.stopPropagation();
// });
// //入力確定ボタンがクリックされたときの処理
// submitBtn.addEventListener('click', (e) => {
//     console.log("入金タップ");
    
//     //入金された値を取得
//     const reason = nyukinReasonInput.value || "未入力理由";
//     const price = nyukinPriceInput.value || "0";
//     const inputPrice = Number(price); //入金された金額を数値にする

//     //一番したにある残高を取得して数値に変換する
//     //grid-data4がついている要素を全て集め、その中の一番最後の要素を選ぶ
//     const allZandakaElements = document.querySelectorAll('.grid-data4'); //grid-data4のデータを上から順に全て集めて配列の形にする
//     const lastZandakaElement = allZandakaElements[allZandakaElements.length - 1]; //集めてきた配列の一番最後を指定してひっぱてくる

//     //直前の残高テキストから,と円を消して純粋な数字にする
//     const lastZandakaText = lastZandakaElement.textContent;
//     const cleanZandakaText = lastZandakaText.replace(/,/g, '').replace('円', ''); //文字の中にある,と円の文字を削除して純粋な数字にして計算できるようにする
//     const currentZandaka = Number(cleanZandakaText);

//     //入金だけん、これまでの残高にプラス
//     const newZandaka = currentZandaka + inputPrice;

//     //今日の日付を自動生成する
//     const today = new Date();
//     const yyyy = today.getFullYear();
//     const mm = String(today.getMonth() + 1).padStart(2, '0');
//     const dd = String(today.getDate()).padStart(2, '0');
//     const dateString = `${yyyy}/${mm}/${dd}`;

//     //新しいテーブルのHTMLの塊を作成する
//     const newRow = document.createElement('div');
//     newRow.className = 'grid-container-added';
//     newRow.innerHTML = `
//     <div class="grid-data1">${dateString}</div>
//     <div class="grid-data2">${reason}</div>
//     <div class="grid-data3">${inputPrice.toLocaleString()}円</div>
//     <div class="grid-data4">${newZandaka.toLocaleString()}円</div>  
//     `; //計算が終わった数値を,と円をつけてHTMLに出力する

//     //親要素であるsdpWrapの一番下に、作ったテーブルをくっつける
//     sbpWrap.appendChild(newRow);

//     //入力欄を空っぽにして、四角を閉じる
//     nyukinReasonInput.value = " ";
//     nyukinPriceInput.value = " ";
//     closeInputs();

// });

// submitBtn2.addEventListener('click', (e) => {
//     console.log("出金タップ");

//     const reason = shukkinReasonInput.value || "未入力理由";
//     const price = shukkinPriceInput.value || "0";
//     const inputPrice = Number(price);

//     const allZandakaElements = document.querySelectorAll('.grid-data4');
//     const lastZandakaElement = allZandakaElements[allZandakaElements.length - 1];

//     const lastZandakaText = lastZandakaElement.textContent;
//     const cleanZandakaText = lastZandakaText.replace(/,/g, '').replace('円', '');
//     const currentZandaka = Number(cleanZandakaText);

//     //出勤だけんマイナス
//     const newZandaka = currentZandaka -inputPrice;
    
//     const today = new Date();
//     const yyyy = today.getFullYear();
//     const mm = String(today.getMonth() + 1).padStart(2, '0');
//     const dd = String(today.getDate()).padStart(2, '0');
//     const dateString = `${yyyy}/${mm}/${dd}`;

//     const newRow =document.createElement('div');
//     newRow.className = 'grid-container-added';
//     newRow.innerHTML = `
//     <div class="grid-data1">${dateString}</div>
//     <div class="grid-data2">${reason}</div>
//     <div class="grid-data3">-${inputPrice.toLocaleString()}円</div>
//     <div class="grid-data4">${newZandaka.toLocaleString()}円</div>
//     `;

//     sbpWrap.appendChild(newRow);

//     shukkinReasonInput.value = "";
//     shukkinPriceInput.value = "";
//     closeInputs();
// });

// //閉じる処理を何回も書くのが面倒だから1つの関数にまとめた
// function closeInputs() {
//     nyukinBtn.classList.remove('active');
//     shukkinBtn.classList.remove('active');
//     container.classList.remove('active');
//     nyukinPad.classList.remove('active');
//     shukkinPad.classList.remove('active');
//     sbpWrap.classList.remove('active');
// }

// document.addEventListener('click', (e) => {

//     if (e.target.closest('.input-box')){
//         return;      // 💡クリックされた場所が「入力欄の箱（.input-box）」の中身だったら、閉じる処理を無視する
//     }
//     closeInputs();
// });