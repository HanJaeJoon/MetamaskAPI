const initialize = async () => {
  const btnSend = document.getElementById('btn-send-email');
  const name = document.getElementById('name');
  const email = document.getElementById('email');

  btnSend.addEventListener('click', async () => {
    if (!name.value) {
      alert('이름을 입력해주세요.');
      name.focus();
      return;
    }

    if (!email.value) {
      alert('email을 입력해주세요.');
      email.focus();
      return;
    }

    fetch('/api/saveUserAndSendEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
      }),
    })
      .then(async (response) => {
        if (response.ok) {
          alert('Email 전송 성공!');
          return;
        }

        const text = await response.text();
        throw new Error(text);
      })
      .catch((error) => {
        alert(`에러 발생!\n${error}`);
      });
  });
};

window.addEventListener('DOMContentLoaded', initialize);
