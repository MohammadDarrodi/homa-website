document.addEventListener('DOMContentLoaded', () => {
    // Helper function to append messages to a chat-like interface (e.g., on dashboard)
    const appendMessage = (sender, text, targetChatBoxId = 'chat-box') => {
        const chatBox = document.getElementById(targetChatBoxId);
        if (chatBox) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message');
            // Add classes for sender differentiation
            if (sender === 'شما') {
                messageElement.classList.add('user-message');
            } else {
                messageElement.classList.add('ai-message');
            }
            messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
            chatBox.appendChild(messageElement);
            chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
        }
    };

    // --- Form Submission Handlers ---

    // Register Form Handler (previously signup-form)
    const registerForm = document.querySelector('#register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = registerForm.username.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;

            try {
                // This fetch will target a Flask backend /register route
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });
                const data = await response.json();
                if (response.ok) { // Check for HTTP 2xx success status
                    alert('ثبت‌نام با موفقیت انجام شد! حالا می‌توانید وارد شوید.');
                    window.location.href = '/login'; // Redirect to login page
                } else {
                    // Handle non-2xx responses (e.g., 400 Bad Request)
                    alert('خطا در ثبت‌نام: ' + (data.message || 'خطای ناشناخته.'));
                }
            } catch (error) {
                console.error('Error during registration:', error);
                alert('مشکلی در اتصال به سرور پیش آمد. لطفاً دوباره تلاش کنید.');
            }
        });
    }

    // Login Form Handler
    const loginForm = document.querySelector('#login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;

            try {
                // This fetch will target a Flask backend /login route
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                if (response.ok) { // Check for HTTP 2xx success status
                    alert('ورود با موفقیت انجام شد!');
                    window.location.href = '/dashboard'; // Redirect to dashboard
                } else {
                    alert('خطا در ورود: ' + (data.message || 'نام کاربری یا رمز عبور اشتباه است.'));
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('مشکلی در اتصال به سرور پیش آمد. لطفاً دوباره تلاش کنید.');
            }
        });
    }

    // --- Dashboard Chat Interface (if applicable) ---
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatBox = document.getElementById('chat-box'); // Ensure this ID exists on dashboard.html

    if (sendButton && chatInput && chatBox) {
        sendButton.addEventListener('click', async () => {
            const message = chatInput.value.trim();
            if (message) {
                appendMessage('شما', message);
                chatInput.value = ''; // Clear input

                try {
                    // This fetch will target the Flask backend /process route
                    const response = await fetch('/process', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ command: message })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        appendMessage('هوما', data.response);
                    } else {
                        appendMessage('هوما', `خطا: ${data.message || 'خطایی در دریافت پاسخ پیش آمد.'}`);
                        console.error('Server responded with error:', data);
                    }
                } catch (error) {
                    console.error('Error processing command:', error);
                    appendMessage('هوما', 'متاسفانه خطایی در ارتباط با دستیار پیش آمد. لطفاً اتصال خود را بررسی کنید.');
                }
            }
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendButton.click();
            }
        });
    }
});
// --- General UI/UX Enhancements ---

    // Smooth scrolling for anchor links (if any)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Handle logout button click (assuming there's a logout button in header/dashboard)
    const logoutButton = document.querySelector('a[href="/logout"]');
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault(); // Prevent default link navigation
            try {
                // This fetch will target a Flask backend /logout route
                const response = await fetch('/logout', {
                    method: 'GET' // Or POST, depending on your backend implementation
                });
                const data = await response.json(); // Assuming JSON response for logout status
                if (response.ok) {
                    alert('با موفقیت از حساب کاربری خود خارج شدید.');
                    window.location.href = '/login'; // Redirect to login page after logout
                } else {
                    alert('خطا در خروج از حساب کاربری: ' + (data.message || 'خطای ناشناخته.'));
                }
            } catch (error) {
                console.error('Error during logout:', error);
                alert('مشکلی در اتصال به سرور پیش آمد.');
            }
        });
    }

    // Example of a simple language selector (if on languages.html)
    const languageSelector = document.getElementById('language-selector');
    const selectedLanguageInfo = document.getElementById('selected-language-info');

    if (languageSelector && selectedLanguageInfo) {
        languageSelector.addEventListener('change', () => {
            const selectedValue = languageSelector.value;
            let infoText = '';

            switch(selectedValue) {
                case 'fa':
                    infoText = 'زبان فارسی: زبان اصلی پشتیبانی شده توسط هوما با قابلیت‌های کامل.';
                    break;
                case 'en':
                    infoText = 'زبان انگلیسی: پشتیبانی کامل برای تعاملات هوش مصنوعی.';
                    break;
                case 'ar':
                    infoText = 'زبان عربی: پشتیبانی اولیه در حال توسعه.';
                    break;
                default:
                    infoText = 'لطفاً یک زبان را انتخاب کنید.';
            }
            selectedLanguageInfo.textContent = infoText;
        });
        // Set initial text based on default selected value
        languageSelector.dispatchEvent(new Event('change'));
    }

    // Add any other general client-side scripts here that apply across multiple pages
    // For example, dynamic content loading, modal interactions, etc.
   ;

// Helper function to load HTML components dynamically (as used in HTML files)
// This function needs to be outside DOMContentLoaded if used by inline <script> tags
// before DOMContentLoaded is fired, or handle its execution carefully.
// Given the current structure, it's fine if executed on DOMContentLoaded.
function loadComponent(componentPath, targetElementId, position = 'afterbegin') {
    fetch(componentPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            const targetElement = document.getElementById(targetElementId) || document.body;
            targetElement.insertAdjacentHTML(position, html);

            // Re-execute scripts within the loaded HTML (if any)
            const scripts = targetElement.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                Array.from(script.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.appendChild(document.createTextNode(script.innerHTML));
                script.parentNode.replaceChild(newScript, script);
            });
        })
        .catch(error => console.error(`Error loading component ${componentPath}:`, error));
}