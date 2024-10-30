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

window.addEventListener('load', () => {
  refresh()
  document.querySelector('#prefecture').addEventListener('change', refresh)
})

// チェック済みの場合のみ登録するボタンを活性化
const onChangeCheckboxes = () => {
  const termsChecked = document.getElementById('terms-checkbox').checked;
  document.getElementById('submit-button').disabled = !(termsChecked);
};