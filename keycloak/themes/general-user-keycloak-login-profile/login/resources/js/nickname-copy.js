// usernameの値をhiddenのnicknameにコピー
const copyNickname = () => {
  const usernameElement = document.querySelector('#username');
  const nicknameElement = document.querySelector('#nickname');
  usernameElement.addEventListener('input', () => {
    nicknameElement.value = usernameElement.value;
  });
}

window.addEventListener('load', () => {
  copyNickname();
});
