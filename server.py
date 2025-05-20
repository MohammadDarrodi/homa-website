import os
import json
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
import requests # برای برقراری ارتباط با API OpenAI
import logging

# تنظیمات لاگ‌دهی
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- تنظیمات Flask ---
app = Flask(__name__,
            static_folder='homa-website/assets', # مسیر فایل‌های CSS/JS/Images
            template_folder='homa-website') # مسیر فایل‌های HTML

# کلید مخفی برای مدیریت سشن‌ها (بسیار مهم: در محیط پروداکشن یک کلید قوی و تصادفی قرار دهید)
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'your_super_secret_key_please_change_this_in_production')
app.config['JSON_AS_ASCII'] = False # برای نمایش صحیح حروف فارسی در پاسخ‌های JSON

# --- تنظیمات کاربران ---
USERS_FILE = 'users.json'

def load_users():
    """کاربران را از فایل JSON بارگذاری می‌کند."""
    if not os.path.exists(USERS_FILE) or os.path.getsize(USERS_FILE) == 0:
        return {}
    with open(USERS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_users(users):
    """کاربران را در فایل JSON ذخیره می‌کند."""
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=4, ensure_ascii=False)

# --- تنظیمات OpenAI API ---
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    logger.error("OPENAI_API_KEY environment variable not set. Please set it before running the server.")
    # می‌توانید اینجا برنامه را متوقف کنید یا یک پیام خطا نمایش دهید
    # exit(1)

OPENAI_API_URL = "https://api.openai.com/v1/chat/completions" # نقطه پایانی برای چت کامپلیشن OpenAI

# --- مسیرهای وب‌سایت (سرویس‌دهی صفحات استاتیک) ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/dashboard')
def dashboard_page():
    # بررسی کنید که آیا کاربر وارد شده است
    if 'username' not in session:
        return redirect(url_for('login_page'))
    return render_template('dashboard.html')

@app.route('/services')
def services_page():
    return render_template('services.html')

@app.route('/languages')
def languages_page():
    return render_template('languages.html')

@app.route('/about')
def about_page():
    return render_template('about.html')

@app.route('/contact')
def contact_page():
    return render_template('contact.html')

@app.route('/pricing')
def pricing_page():
    return render_template('pricing.html')

@app.route('/privacy')
def privacy_page():
    return render_template('privacy.html')

# برای هندل کردن فایل‌های کامپوننت (header/footer)
@app.route('/components/<path:filename>')
def serve_component(filename):
    return app.send_static_file(f'../components/{filename}')

# --- مسیرهای API بک‌اند ---

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        logger.warning("Registration attempt with missing data.")
        return jsonify({'message': 'تمام فیلدها الزامی هستند.'}), 400

    users = load_users()
    if username in users:
        logger.warning(f"Registration attempt for existing username: {username}")
        return jsonify({'message': 'نام کاربری قبلاً وجود دارد.'}), 409
    
    # هش کردن رمز عبور
    hashed_password = generate_password_hash(password)
    users[username] = {'email': email, 'password': hashed_password}
    save_users(users)
    logger.info(f"User {username} registered successfully.")
    return jsonify({'message': 'ثبت‌نام با موفقیت انجام شد!'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        logger.warning("Login attempt with missing credentials.")
        return jsonify({'message': 'نام کاربری و رمز عبور الزامی هستند.'}), 400

    users = load_users()
    user = users.get(username)

    if user and check_password_hash(user['password'], password):
        session['username'] = username
        logger.info(f"User {username} logged in successfully.")
        return jsonify({'message': 'ورود با موفقیت انجام شد!'}), 200
    else:
        logger.warning(f"Failed login attempt for username: {username}")
        return jsonify({'message': 'نام کاربری یا رمز عبور اشتباه است.'}), 401

@app.route('/logout')
def logout():
    session.pop('username', None)
    logger.info("User logged out.")
    return jsonify({'message': 'با موفقیت خارج شدید.'}), 200

@app.route('/process', methods=['POST'])
def process_command():
    if 'username' not in session:
        return jsonify({'message': 'لطفاً ابتدا وارد حساب کاربری خود شوید.'}), 401

    data = request.get_json()
    command = data.get('command')

    if not command:
        return jsonify({'message': 'دستور ارسالی خالی است.'}), 400
    
    if not OPENAI_API_KEY:
        logger.error("OpenAI API Key is not configured.")
        return jsonify({'message': 'مشکل در تنظیمات سرور: API Key یافت نشد.'}), 500

    try:
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # ماژول GPT-4o برای مکالمه
        payload = {
            "model": "gpt-4o", # یا هر مدل دیگری که می‌خواهید استفاده کنید (مثلاً gpt-3.5-turbo)
            "messages": [
                {"role": "system", "content": "شما یک دستیار هوش مصنوعی مفید و دوستانه به نام هوما هستید که به فارسی پاسخ می‌دهد."},
                {"role": "user", "content": command}
            ],
            "temperature": 0.7, # خلاقیت پاسخ (0.0 تا 2.0)
            "max_tokens": 500   # حداکثر طول پاسخ
        }

        logger.info(f"Sending request to OpenAI for user {session['username']}: {command[:50]}...")
        response = requests.post(OPENAI_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status() # برای برانگیختن یک Exception برای کدهای وضعیت HTTP ناموفق
        
        openai_response = response.json()
        
        # استخراج پاسخ از ساختار JSON اوپن‌ای‌آی
        ai_message = openai_response['choices'][0]['message']['content']
        logger.info(f"Received response from OpenAI: {ai_message[:50]}...")
        
        return jsonify({'response': ai_message}), 200

    except requests.exceptions.RequestException as e:
        logger.error(f"Error communicating with OpenAI API: {e}")
        return jsonify({'response': 'متاسفانه در حال حاضر امکان ارتباط با دستیار هوشمند وجود ندارد. لطفاً بعداً تلاش کنید.'}), 503
    except KeyError as e:
        logger.error(f"Unexpected response format from OpenAI API: {e}. Full response: {openai_response}")
        return jsonify({'response': 'پاسخ دریافتی از سرور نامعتبر است. لطفاً بعداً تلاش کنید.'}), 500
    except Exception as e:
        logger.error(f"An unexpected error occurred during command processing: {e}")
        return jsonify({'response': 'خطایی غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.'}), 500

# --- هندل کردن خطاهای 404 (صفحه یافت نشد) ---
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

# --- اجرای برنامه ---
if __name__ == '__main__':
    # در محیط پروداکشن، از یک WSGI server مانند Gunicorn یا uWSGI استفاده کنید
    # debug=True فقط برای توسعه است
    logger.info("Starting Flask server...")
    app.run(debug=True, host='127.0.0.1', port=5520)