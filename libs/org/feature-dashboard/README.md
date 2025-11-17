# Dashboard Feature

Dashboard компонент для проекту Athena з інтеграцією Header, Sidebar та картками статистики.

## Встановлення

Компонент вже включений в монорепозиторій. Імпортуйте:

```typescript
import { DashboardComponent } from '@org/feature-dashboard';
```

## Використання

### Маршрутизація

```typescript
import { DashboardComponent } from '@org/feature-dashboard';
import { AuthGuard } from '@org/util-guards';

export const routes: Route[] = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard], // Захист роута
  },
];
```

## Компонент

### DashboardComponent

Основний компонент Dashboard з Header, Sidebar та контентом.

**Features:**

- Header з навігацією та user menu
- Sidebar з меню та підменю
- Картки статистики
- Responsive дизайн
- OnPush change detection

**Props:**

- Немає (всі дані конфігуруються всередині компонента)

**Методи:**

- `onSidebarToggle(collapsed: boolean)`: Обробка зміни стану sidebar
- `handleLogout()`: Обробка виходу з системи

## Структура

```
dashboard/
├── dashboard.component.ts      # Логіка компонента
├── dashboard.component.html    # Шаблон
├── dashboard.component.scss    # Стилі
└── dashboard.component.spec.ts # Тести
```

## Налаштування меню

Меню налаштовується в компоненті:

```typescript
headerMenuItems: HeaderMenuItem[] = [
  { label: 'Dashboard', route: '/dashboard', icon: '📊' },
  { label: 'Demographics', route: '/demographics', icon: '👥' },
];

sidebarMenuItems: SidebarMenuItem[] = [
  {
    label: 'Dashboard',
    route: '/dashboard',
    icon: '📊',
  },
  {
    label: 'Demographics',
    icon: '👥',
    children: [
      { label: 'Overview', route: '/demographics', icon: '📈' },
      { label: 'Reports', route: '/demographics/reports', icon: '📄' },
    ],
  },
];
```

## Захист роута

Dashboard захищений `AuthGuard`, який перенаправляє неавтентифікованих користувачів на сторінку логіну.

## Тестування

Запустіть unit тести:

```bash
nx test feature-dashboard
```

Запустіть E2E тести:

```bash
npm run e2e:ui:chromium
```

## Майбутні покращення

- [ ] Реальні дані замість заглушок
- [ ] Графіки та діаграми
- [ ] Фільтри та пошук
- [ ] Експорт даних
- [ ] Налаштування dashboard (drag & drop карток)
