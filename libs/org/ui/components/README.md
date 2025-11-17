# UI Components Library

Бібліотека переіспользуваних Angular UI компонентів для проекту Athena.

## Встановлення

Компоненти вже включені в монорепозиторій. Імпортуйте потрібні компоненти:

```typescript
import { ButtonComponent, InputComponent, CardComponent } from '@org/ui/components';
```

## Компоненти

### Форми

#### Button

Кнопка з різними варіантами та розмірами.

```html
<org-button variant="primary" size="md" (clicked)="handleClick()"> Click me </org-button>
```

**Props:**

- `variant`: `'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'` (default: `'primary'`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `disabled`: `boolean` (default: `false`)
- `type`: `'button' | 'submit' | 'reset'` (default: `'button'`)
- `fullWidth`: `boolean` (default: `false`)
- `loading`: `boolean` (default: `false`)

**Events:**

- `clicked`: `EventEmitter<MouseEvent>`

---

#### Input

Поле вводу з валідацією та підтримкою різних типів.

```html
<org-input
  [(ngModel)]="email"
  type="email"
  label="Email"
  placeholder="Enter your email"
  [required]="true"
  [error]="emailError"
></org-input>
```

**Props:**

- `type`: `'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'` (default: `'text'`)
- `label`: `string`
- `placeholder`: `string`
- `disabled`: `boolean`
- `readonly`: `boolean`
- `required`: `boolean`
- `error`: `string`
- `hint`: `string`
- `showPasswordToggle`: `boolean` (для type="password")

**Events:**

- `blur`: `EventEmitter<FocusEvent>`
- `focus`: `EventEmitter<FocusEvent>`

**ControlValueAccessor:** Підтримує `[(ngModel)]` та `formControlName`.

---

#### Select

Випадаючий список для вибору опції.

```html
<org-select
  [(ngModel)]="selectedValue"
  [options]="options"
  label="Choose option"
  placeholder="Select an option"
></org-select>
```

**Props:**

- `options`: `SelectOption[]` - масив опцій `{ value: string | number, label: string, disabled?: boolean }`
- `label`: `string`
- `placeholder`: `string` (default: `'Select an option'`)
- `disabled`: `boolean`
- `required`: `boolean`
- `error`: `string`
- `hint`: `string`

**ControlValueAccessor:** Підтримує `[(ngModel)]` та `formControlName`.

---

#### Checkbox

Чекбокс з підтримкою indeterminate стану.

```html
<org-checkbox [(ngModel)]="isChecked" label="I agree to terms" [required]="true"></org-checkbox>
```

**Props:**

- `label`: `string`
- `disabled`: `boolean`
- `required`: `boolean`
- `indeterminate`: `boolean`

**Events:**

- `change`: `EventEmitter<boolean>`

**ControlValueAccessor:** Підтримує `[(ngModel)]` та `formControlName`.

---

#### Radio

Радіо-кнопка для вибору однієї опції з групи.

```html
<org-radio [(ngModel)]="selectedOption" value="option1" name="options" label="Option 1"></org-radio>
```

**Props:**

- `label`: `string`
- `value`: `string | number`
- `name`: `string` (для групування)
- `disabled`: `boolean`
- `required`: `boolean`

**Events:**

- `change`: `EventEmitter<string | number>`

**ControlValueAccessor:** Підтримує `[(ngModel)]` та `formControlName`.

---

#### FormField

Обгортка для полів форми з label, error та hint.

```html
<org-form-field label="Email" [required]="true" [error]="emailError">
  <org-input [(ngModel)]="email" type="email"></org-input>
</org-form-field>
```

**Props:**

- `label`: `string`
- `hint`: `string`
- `error`: `string`
- `required`: `boolean`
- `id`: `string`

---

### Навігація

#### Header

Верхня панель навігації з меню та user menu.

```html
<org-header
  title="Athena"
  [menuItems]="headerMenuItems"
  [userMenuItems]="userMenuItems"
  [showUserMenu]="true"
  userName="John Doe"
></org-header>
```

**Props:**

- `title`: `string` (default: `'Athena'`)
- `logo`: `string` (URL до логотипу)
- `menuItems`: `HeaderMenuItem[]`
- `userMenuItems`: `HeaderMenuItem[]`
- `showUserMenu`: `boolean`
- `userName`: `string`
- `userAvatar`: `string` (URL до аватара)

**Events:**

- `menuItemClick`: `EventEmitter<HeaderMenuItem>`
- `userMenuItemClick`: `EventEmitter<HeaderMenuItem>`

---

#### Sidebar

Бічна панель навігації з меню та підменю.

```html
<org-sidebar
  [menuItems]="sidebarMenuItems"
  [collapsed]="collapsed"
  [collapsible]="true"
  (toggleCollapse)="onToggle($event)"
></org-sidebar>
```

**Props:**

- `menuItems`: `SidebarMenuItem[]`
- `collapsed`: `boolean` (default: `false`)
- `collapsible`: `boolean` (default: `true`)

**Events:**

- `menuItemClick`: `EventEmitter<SidebarMenuItem>`
- `toggleCollapse`: `EventEmitter<boolean>`

---

### Відображення

#### Card

Картка для відображення контенту.

```html
<org-card title="Card Title" subtitle="Card subtitle" variant="elevated" padding="md">
  <p>Card content</p>
  <div slot="footer">Footer content</div>
</org-card>
```

**Props:**

- `title`: `string`
- `subtitle`: `string`
- `padding`: `'none' | 'sm' | 'md' | 'lg'` (default: `'md'`)
- `variant`: `'default' | 'outlined' | 'elevated'` (default: `'default'`)
- `clickable`: `boolean` (default: `false`)

**Slots:**

- Default: основний контент
- `[slot="footer"]`: футер картки

---

#### Table

Таблиця для відображення даних з сортуванням.

```html
<org-table
  [columns]="columns"
  [data]="data"
  [loading]="loading"
  [striped]="true"
  [hoverable]="true"
></org-table>
```

**Props:**

- `columns`: `TableColumn[]` - масив колонок `{ key: string, label: string, sortable?: boolean, template?: TemplateRef, width?: string }`
- `data`: `T[]` - масив даних
- `loading`: `boolean`
- `emptyMessage`: `string` (default: `'No data available'`)
- `striped`: `boolean`
- `hoverable`: `boolean`

---

#### Modal

Модальне вікно для діалогів.

```html
<org-modal
  [isOpen]="isModalOpen"
  title="Modal Title"
  size="md"
  [closable]="true"
  (close)="isModalOpen = false"
  (confirm)="handleConfirm()"
>
  <p>Modal content</p>
</org-modal>
```

**Props:**

- `isOpen`: `boolean`
- `title`: `string`
- `size`: `'sm' | 'md' | 'lg' | 'xl'` (default: `'md'`)
- `closable`: `boolean` (default: `true`)
- `showFooter`: `boolean` (default: `true`)
- `confirmText`: `string` (default: `'Confirm'`)
- `cancelText`: `string` (default: `'Cancel'`)
- `showCancel`: `boolean` (default: `true`)
- `confirmVariant`: `'primary' | 'secondary' | 'danger'` (default: `'primary'`)

**Events:**

- `close`: `EventEmitter<void>`
- `confirm`: `EventEmitter<void>`
- `cancel`: `EventEmitter<void>`

---

#### Toast

Сповіщення для відображення повідомлень.

```html
<org-toast
  message="Success message"
  type="success"
  [duration]="5000"
  [closable]="true"
  (close)="onClose()"
></org-toast>
```

**Props:**

- `message`: `string`
- `type`: `'success' | 'error' | 'warning' | 'info'` (default: `'info'`)
- `duration`: `number` (default: `5000`, 0 = не закривається автоматично)
- `closable`: `boolean` (default: `true`)

**Events:**

- `close`: `EventEmitter<void>`

---

#### ToastContainer

Контейнер для управління toast сповіщеннями.

```html
<org-toast-container></org-toast-container>
```

Використання в сервісі:

```typescript
@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private container: ToastContainerComponent) {}

  showSuccess(message: string) {
    this.container.addToast({ message, type: 'success' });
  }
}
```

---

#### Loading

Індикатор завантаження.

```html
<org-loading variant="spinner" size="md" message="Loading..." [fullScreen]="false"></org-loading>
```

**Props:**

- `variant`: `'spinner' | 'dots' | 'pulse'` (default: `'spinner'`)
- `size`: `'sm' | 'md' | 'lg'` (default: `'md'`)
- `message`: `string`
- `fullScreen`: `boolean` (default: `false`)

---

## Стилізація

Всі компоненти використовують SCSS з дизайн-токенами та responsive дизайном. Стилі автоматично підключаються при імпорті компонентів.

## Доступність

Компоненти реалізовані з урахуванням доступності:

- ARIA атрибути
- Keyboard navigation
- Focus management
- Screen reader support

## Приклади використання

### Форма з валідацією

```html
<form [formGroup]="myForm">
  <org-form-field label="Email" [required]="true" [error]="getError('email')">
    <org-input formControlName="email" type="email"></org-input>
  </org-form-field>

  <org-button type="submit" [disabled]="myForm.invalid" variant="primary"> Submit </org-button>
</form>
```

### Таблиця з даними

```html
<org-table
  [columns]="[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' }
  ]"
  [data]="users"
  [loading]="loading"
></org-table>
```

## Тестування

Всі компоненти мають unit тести. Запустіть тести:

```bash
nx test ui-components
```

## Ліцензія

MIT
