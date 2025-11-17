# Supabase Row Level Security (RLS) Setup

## Огляд

Supabase показує попередження про те, що Row Level Security (RLS) не увімкнено на таблицях. Це важлива функція безпеки, особливо коли використовується PostgREST API.

## Що таке RLS?

Row Level Security (RLS) - це механізм PostgreSQL, який дозволяє контролювати доступ до рядків таблиці на основі політик. У Supabase це особливо важливо, оскільки PostgREST API використовує RLS для захисту даних.

## Поточна ситуація

Ваш NestJS додаток використовує **service_role** ключ для підключення до Supabase. Цей ключ **обходить RLS**, що означає:

- ✅ Ваш NestJS додаток працює нормально
- ⚠️ Але якщо хтось отримає доступ до БД напряму, дані не захищені
- ⚠️ Якщо ви використовуєте Supabase PostgREST API, дані не захищені

## Рішення

### Варіант 1: Увімкнути RLS (Рекомендовано для production)

Запустіть міграції:

```bash
npm run db:migrate:up
```

Це запустить міграції:

- `005-enable-rls.js` - увімкне RLS на всіх таблицях
- `006-create-rls-policies.js` - створить політики безпеки

**Важливо**:

- NestJS продовжить працювати, оскільки використовує service_role
- RLS захистить дані від прямого доступу до БД
- PostgREST API буде захищений

### Варіант 2: Вимкнути попередження (Тільки для development)

Якщо ви не використовуєте Supabase PostgREST API і працюєте тільки через NestJS:

1. Відкрийте Supabase Dashboard
2. Перейдіть до Settings → Database
3. Вимкніть "Enable RLS warnings" (якщо доступно)

**НЕ рекомендується для production!**

## Політики RLS

### `users` таблиця

- **Читання**: Користувачі можуть читати тільки свої дані
- **Запис/Оновлення/Видалення**: Тільки через NestJS (service_role)

### `refresh_tokens` таблиця

- **Всі операції**: Тільки через NestJS (service_role)
- Користувачі не можуть отримати доступ напряму

### `blacklisted_tokens` таблиця

- **Всі операції**: Тільки через NestJS (service_role)

### `reset_tokens` таблиця

- **Всі операції**: Тільки через NestJS (service_role)

### `SequelizeMeta` таблиця

- **Всі операції**: Тільки через NestJS (service_role)

## Перевірка

Після запуску міграцій:

1. Перевірте Supabase Dashboard - попередження мають зникнути
2. Перевірте, що NestJS додаток працює нормально
3. Спробуйте підключитися до БД з anon ключем - доступ має бути обмежений

## Troubleshooting

### Помилка: "row-level security is not enabled"

Запустіть міграцію 005 окремо:

```bash
node scripts/migrate.js up 005
```

### Помилка: "policy already exists"

Це нормально, міграція використовує `DROP POLICY IF EXISTS`.

### NestJS не може отримати доступ до даних

Перевірте, що ви використовуєте **service_role** ключ, а не **anon** або **authenticated**.

У `.env` файлі:

```env
DB_USER=postgres
DB_PASS=your-service-role-key  # Має бути service_role ключ
```

## Production Checklist

- [ ] RLS увімкнено на всіх таблицях
- [ ] Політики створені
- [ ] NestJS використовує service_role ключ
- [ ] Supabase попередження зникли
- [ ] Тестування доступу через PostgREST (якщо використовується)
- [ ] Документація оновлена

## Додаткова інформація

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
