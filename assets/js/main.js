// Function to handle form submissions (e.g., login, signup)
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('#login-form');
    const signupForm = document.querySelector('#signup-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                if (data.success) {
                    alert('ورود با موفقیت انجام شد!');
                    window.location.href = '/dashboard'; // Redirect to dashboard
                } else {
                    alert('خطا در ورود: ' + data.message);
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('مشکلی در اتصال به سرور پیش آمد.');
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = signupForm.username.value;
            const email = signupForm.email.value;
            const password = signupForm.password.value;

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });
                const data = await response.json();
                if (data.success) {
                    alert('ثبت‌نام با موفقیت انجام شد!');
                    window.location.href = '/login'; // Redirect to login page
                } else {
                    alert('خطا در ثبت‌نام: ' + data.message);
                }
            } catch (error) {
                console.error('Error during signup:', error);
                alert('مشکلی در اتصال به سرور پیش آمد.');
            }
        });
    }

    // Example for a simple chat interface (if applicable to dashboard)
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatBox = document.getElementById('chat-box');

    if (sendButton && chatInput && chatBox) {
        sendButton.addEventListener('click', async () => {
            const message = chatInput.value.trim();
            if (message) {
                appendMessage('شما', message);
                chatInput.value = '';

                try {
                    const response = await fetch('/process', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ command: message })
                    });
                    const data = await response.json();
                    appendMessage('هوما', data.response);
                } catch (error) {
                    console.error('Error processing command:', error);
                    appendMessage('هوما', 'متاسفانه خطایی در پردازش درخواست شما پیش آمد.');
                }
            }
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendButton.click();
            }
        });
    }

    function appendMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');
        messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
    }
});

// Add any other general client-side scripts here