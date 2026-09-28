// 市区町村プルダウンの制御
const updateCitySelect = () => {
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
  const termsChecked = document.querySelector('#terms-checkbox').checked;
  document.querySelector('#submit-button').disabled = !(termsChecked);
};

// 参加同意リンクをクリックしたらチェックボックスを有効化
const onClickTermsLink = (termsLink, termsCheckbox) => {
  termsLink.addEventListener('click', () => {
    termsCheckbox.disabled = false;
  });
};

window.addEventListener('load', () => {
  const termsLink = document.querySelector('#terms-link');
  const termsCheckbox = document.querySelector('#terms-checkbox');

  if (termsLink && termsCheckbox) {
    try {
      termsCheckbox.disabled = true;
      onClickTermsLink(termsLink, termsCheckbox);
    } catch (error) {
      termsCheckbox.disabled = false;
      console.error(error);
    }
  }

  updateCitySelect();

  const prefectureElement = document.querySelector('#prefecture');
  if (prefectureElement) {
    prefectureElement.addEventListener('change', updateCitySelect);
  }
});
