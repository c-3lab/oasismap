// usernameの値をhiddenのnicknameにコピー
// Keycloakはusernameを小文字で保存するため、nicknameも小文字にそろえる
// （サーバー側でも oasismap-nickname Validator が username との一致を検証する）
const copyNickname = () => {
  const usernameElement = document.querySelector('#username');
  const nicknameElement = document.querySelector('#nickname');
  const copy = () => {
    nicknameElement.value = usernameElement.value.toLowerCase();
  };
  usernameElement.addEventListener('input', copy);
  // 入力エラーで画面が再表示されたとき、usernameだけ値が残るためロード時にもコピーする
  copy();
}

window.addEventListener('load', () => {
  copyNickname();
});
