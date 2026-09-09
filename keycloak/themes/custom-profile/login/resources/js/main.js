// 市区町村プルダウンの制御
const refresh = () => {
  const prefectureElement = document.querySelector('#prefecture')
  const cityElement = document.querySelector('#city')

  if (prefectureElement.value === '') {
    cityElement.disabled = true;
    cityElement.innerHTML = '<option>都道府県を選択してください</option>';
  } else {
    cityElement.disabled = false;

    const optionLabels = ['', ...cities[prefectureElement.value]]
    const newOptions = optionLabels.map(city => {
      const option = document.createElement('option');
      option.textContent = city;
      return option;
    });
    cityElement.replaceChildren(...newOptions);
  }
}

// チェック済みの場合のみ登録するボタンを活性化
const onChangeCheckboxes = () => {
  const termsChecked = document.getElementById('terms-checkbox').checked;
  document.getElementById('submit-button').disabled = !(termsChecked);
};

// 参加同意リンクをクリックしたらチェックボックスを有効化
const initTermsLink = (termsLink, termsCheckbox) => {
  termsLink.addEventListener('click', () => {
    termsCheckbox.disabled = false;
  });
};

window.addEventListener('load', () => {
  refresh();
  const prefectureElement = document.querySelector('#prefecture');
  if (prefectureElement){
    prefectureElement.addEventListener('change', refresh);
  }

  const termsLink = document.getElementById('terms-link');
  const termsCheckbox = document.getElementById('terms-checkbox');
  if (!termsLink || !termsCheckbox) return;

  onChangeCheckboxes();
  initTermsLink(termsLink, termsCheckbox);
});
