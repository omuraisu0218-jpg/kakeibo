// 2つのボタンを要素として取得します
const container=document.querySelector('.nyushutsu-container');
const nyukinBtn = document.querySelector('.nyushutsu-item1');
const shukkinBtn = document.querySelector('.nyushutsu-item2');
const sbpWrap = document.querySelector('.grid-container-sbp-wrap');
const nyukinPad = document.querySelector('.nyushutsu-padding1');
const shukkinPad = document.querySelector('.nyushutsu-padding2');

// 入金ボタンがクリックされたときの処理
nyukinBtn.addEventListener('click', (e) => {
    nyukinBtn.classList.add('active');     // 入金ボタンに active クラスを追加
    shukkinBtn.classList.remove('active'); // 出金ボタンの active クラスを消去

    container.classList.add('active');
    
    nyukinPad.classList.add('active');
    
    sbpWrap.classList.add('active');
    
    e.stopPropagation();
});

// 出金ボタンがクリックされたときの処理
shukkinBtn.addEventListener('click', (e) => {
    shukkinBtn.classList.add('active');    // 出金ボタンに active クラスを追加
    nyukinBtn.classList.remove('active');  // 入金ボタンの active クラスを消去

    container.classList.add('active');

    shukkinPad.classList.add('active');

    sbpWrap.classList.add('active');

    e.stopPropagation();
});

document.addEventListener('click', (e) => {

    if (e.target.closest('.input-box')){
        return;
    }

    nyukinBtn.classList.remove('active');
    shukkinBtn.classList.remove('active');

    container.classList.remove('active');

    nyukinPad.classList.remove('active');
    shukkinPad.classList.remove('active');

    sbpWrap.classList.remove('active');
});