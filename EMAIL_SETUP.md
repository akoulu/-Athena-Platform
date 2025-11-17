# Email Service Setup

## Проблема

Email service вимкнений за замовчуванням. Для відправки email (наприклад, password reset) потрібно налаштувати SMTP сервер.

## Швидке налаштування

### 1. Додайте змінні в `.env` файл

Відкрийте `org/.env` і додайте:

```env
# Email Configuration
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@org.com
```

### 2. Варіанти налаштування

#### Варіант A: Gmail (для development)

1. Увімкніть 2-Step Verification в Google Account
2. Створіть App Password:

   - Перейдіть до [Google Account Security](https://myaccount.google.com/security)
   - Увімкніть 2-Step Verification (якщо ще не увімкнено)
   - Перейдіть до "App passwords"
   - Створіть новий App Password для "Mail"
   - Скопіюйте 16-символьний пароль

3. Додайте в `.env`:

```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # App Password (без пробілів)
EMAIL_FROM=your-email@gmail.com
```

#### Варіант B: Mailtrap (для testing - рекомендується для development)

1. Зареєструйтеся на [Mailtrap](https://mailtrap.io/) (безкоштовно)
2. Створіть новий Inbox
3. Скопіюйте SMTP credentials з Mailtrap
4. Додайте в `.env`:

```env
EMAIL_ENABLED=true
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
EMAIL_FROM=noreply@org.com
```

**Переваги Mailtrap:**

- ✅ Безкоштовний для development
- ✅ Не відправляє реальні email
- ✅ Переглядаєте email в веб-інтерфейсі
- ✅ Ідеально для тестування

#### Варіант C: SendGrid / AWS SES / інші (для production)

Для production використовуйте професійні email сервіси:

**SendGrid:**

```env
EMAIL_ENABLED=true
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

**AWS SES:**

```env
EMAIL_ENABLED=true
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-aws-smtp-username
EMAIL_PASSWORD=your-aws-smtp-password
EMAIL_FROM=noreply@yourdomain.com
```

### 3. Перезапустіть сервер

Після додавання змінних оточення перезапустіть backend:

```bash
# Зупиніть поточний процес (Ctrl+C)
npm run serve:all
```

### 4. Перевірка

1. Відкрийте `/auth/forgot-password`
2. Введіть email
3. Перевірте логи - має з'явитися:
   ```
   [EmailService] Email sent successfully to user@example.com
   ```

## Troubleshooting

### Email не відправляється

1. **Перевірте логи:**

   - Якщо бачите "Email service is disabled" → `EMAIL_ENABLED=true`
   - Якщо бачите "Email credentials not configured" → перевірте `EMAIL_USER` та `EMAIL_PASSWORD`

2. **Перевірте з'єднання:**

   ```bash
   # Перевірте, чи змінні оточення завантажені
   # В логах при старті має бути:
   [EmailService] Email service initialized
   ```

3. **Gmail помилки:**

   - Переконайтеся, що використовуєте App Password, а не звичайний пароль
   - Перевірте, що 2-Step Verification увімкнено

4. **Firewall/Network:**
   - Переконайтеся, що порт 587 (або 465 для SSL) не заблокований

## Development без email

Якщо не хочете налаштовувати email для development:

1. Email service залишається вимкненим (`EMAIL_ENABLED=false`)
2. Password reset токени все одно зберігаються в БД
3. Можете вручну скопіювати токен з БД або логів для тестування

**Примітка:** Для production обов'язково налаштуйте email сервіс!
