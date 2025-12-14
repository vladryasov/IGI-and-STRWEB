## Q1. Слайдер на главной странице

### Где подключается и как запускается

- **Шаблон**: `Pizza/pizzeria/templates/pizzeria/home.html`
  - На странице есть контейнер: `<div id="main-slider"></div>`
  - Подключается скрипт: `static/js/slider.js`
  - На `DOMContentLoaded` создаётся экземпляр:

```js
const slider = new ImageSlider('main-slider', { ...options... });
```

- **Стили**: `static/css/slider.css`

### Архитектура (JS)

Слайдер реализован как класс **`ImageSlider`** (ES6 class) в `static/js/slider.js`.

#### Конструктор и поля

`new ImageSlider(containerId, options)`:

- **`this.container`**: DOM-элемент контейнера по `containerId`.
- **`this.options`**: конфиг (с дефолтами):
  - `loop` — зацикливание
  - `navs` — кнопки «вперёд/назад»
  - `pags` — пагинация (точки)
  - `auto` — автопрокрутка
  - `stopMouseHover` — пауза автопрокрутки при наведении
  - `delay` — задержка в секундах
  - `slides` — массив слайдов `{ image, caption?, url? }`
  - `showSettings` — показать админ-настройки (UI)
- **`this.currentSlide`**: индекс текущего слайда.
- **`this.autoInterval`**: id таймера `setInterval`.
- **`this.isPaused`**: пауза при hover.
- **`this.prefersReducedMotion`**: `matchMedia('(prefers-reduced-motion: reduce)')`.

#### Основные методы

- **`init()`**: точка инициализации.
  - (опционально) подгружает настройки из `localStorage` для админа (`loadSettings()`)
  - учитывает `prefers-reduced-motion` (отключает `auto`)
  - создаёт DOM-структуру (`createSliderStructure()`)
  - создаёт слайды (`loadSlides()`)
  - создаёт навигацию (`createNavigation()`)
  - создаёт пагинацию (`createPagination()`)
  - (опционально) создаёт форму настроек (`createSettingsForm()`)
  - запускает автопрокрутку (`startAutoSlide()`)
  - вешает обработчики (`attachEventListeners()`)

- **`createSliderStructure()`**: вставляет HTML-разметку внутрь `#main-slider` и сохраняет ссылки на важные узлы:
  - `.slider-slides`, `.slider-controls`, `.slider-pagination`, `.slider-counter`, `.slider-caption`

- **`loadSlides()`**: наполняет `.slider-slides` элементами `.slider-slide`.
  - каждый слайд: `div.slider-slide` → `a` → `img` + (опц.) `div.slide-caption-text`
  - картинки с `loading="lazy"`

- **`showSlide(index)`**: ключевая логика переключения.
  - нормализует индекс для `loop`
  - анимация реализована через **inline-стили** `transform/opacity` + CSS `transition`
  - состояния:
    - текущий слайд получает `.active`
    - предыдущий слайд получает `.prev`
  - для `prefersReducedMotion` — переключает без анимации

- **`nextSlide()` / `prevSlide()` / `goToSlide(index)`**: управление индексом и вызов `showSlide()`.

- **`startAutoSlide()` / `stopAutoSlide()`**: автопрокрутка через `setInterval` с периодом `delay * 1000`.

- **`attachEventListeners()`**: hover-пауза (mouseenter/mouseleave), если включены `auto` + `stopMouseHover`.

#### Админ-настройки

Если `showSettings: true`, отображается панель `.slider-settings`:

- задержка `delay`
- чекбоксы `auto`, `loop`
- при клике «Применить» значения сохраняются в `localStorage` (`saveSettings()`), автопрокрутка перезапускается.

### CSS-механика

В `static/css/slider.css` переключение построено на:

- **`.slider-slide`**: по умолчанию `opacity: 0` и `transform: translateX(100%)`
- **`.slider-slide.active`**: `opacity: 1`, `transform: translateX(0)`
- **`.slider-slide.prev`**: `transform: translateX(-100%)`, `opacity: 0`

Анимация обеспечивается `transition: transform ... , opacity ...`.

### Какие классы/свойства реально «делают» слайдер

- **Класс**: `ImageSlider`
- **CSS-классы состояний**: `.slider-slide`, `.active`, `.prev`, `.slider-pag-btn.active`
- **CSS свойства**: `transform: translateX(...)`, `opacity`, `transition`, `position: absolute`
- **JS API**:
  - `setInterval/clearInterval`
  - `requestAnimationFrame` (для плавного старта анимации входа)
  - `localStorage` (админ-настройки)
  - `matchMedia('(prefers-reduced-motion: reduce)')`

---

## Q2. Переключение темы (light/dark) и сохранение

### Где подключается (глобально для всех страниц)

Переключатель темы подключён в базовом шаблоне `templates/base.html`:

- CSS: `static/css/theme-switcher.css`
- JS: `static/js/theme-switcher.js`

### Механика хранения и применения темы

Реализация полностью клиентская:

- **Хранилище**: `localStorage` по ключу **`theme`**.
- **Применение**: установка атрибута **`data-theme`** на корневой элемент документа (`document.documentElement`, то есть `<html>`).
- **CSS-стили**: селекторы вида **`[data-theme="dark"] ...`** (в `theme-switcher.css` и частично в других css-файлах проекта).

### JS: класс `ThemeSwitcher` (что делает каждая часть)

Файл: `static/js/theme-switcher.js`

- **`constructor()`**
  - читает сохранённую тему: `localStorage.getItem('theme') || 'light'`
  - вызывает `init()`

- **`init()`**
  - применяет текущую тему: `applyTheme(this.theme)`
  - создаёт UI-переключатель (если ещё нет): `createSwitcher()`
  - вешает обработчик на чекбокс: `attachEventListeners()`

- **`createSwitcher()`**
  - создаёт DOM-блок `#theme-switcher` с чекбоксом `#theme-toggle`
  - вставляет его в `<header>`, а если header не найден — в начало `<body>`

- **`applyTheme(theme)`**
  - ставит атрибут темы: `document.documentElement.setAttribute('data-theme', theme)`
  - сохраняет тему: `localStorage.setItem('theme', theme)`
  - синхронизирует UI: состояние чекбокса и иконку (в `.theme-label`)

- **`toggleTheme()`**
  - инвертирует `light ↔ dark`, затем `applyTheme(newTheme)`

- **`attachEventListeners()`**
  - `change` на `#theme-toggle` → вызывает `toggleTheme()`

Инициализация: на `DOMContentLoaded` создаётся `new ThemeSwitcher()`.

### CSS: что именно меняется при dark-теме

Файл: `static/css/theme-switcher.css`

- `[data-theme="dark"]` задаёт набор CSS-переменных (`--bg-page`, `--text-primary`, `--border-color`, т.д.)
- далее идут правила `[data-theme="dark"] body`, `[data-theme="dark"] a`, и т.п. — они переопределяют цвета/фон/границы для различных блоков сайта.

---

## Q3. Таблица сотрудников (БД → API → таблица, сортировка, валидация, прелоадер, фишки)

### Доступ и маршруты

Маршруты объявлены в `Pizza/pizzeria/urls.py`:

- `/employees/` — страница таблицы
- `/api/employees/` — получить список сотрудников
- `/api/employees/add/` — добавить сотрудника (multipart/form-data)

Важно: доступ к ним ограничен **только админом** через `@user_passes_test(lambda u: is_admin(u), login_url='/no-access/')`.

### Откуда берутся данные (Django ORM + сериализация в JSON)

#### Модель

Модель сотрудников — `Employee` в `Pizza/pizzeria/models.py`:

- `name`, `position`
- `photo` (ImageField) + запасной `photo_url` (URLField)
- `phone` (валидируется через `validate_phone` → `validators.py`)
- `email`
- `description`
- `url`
- `is_active`

#### API получения списка: `employees_api`

В `Pizza/pizzeria/views.py`:

- перед выдачей данных вызывается `seed_employees_if_needed()` — добивает таблицу до **минимум 10 записей**, если в БД пусто/мало.
- дальше идёт ORM-запрос:
  - `Employee.objects.filter(is_active=True).order_by('name', 'id')`
- затем формируется массив dict-ов и отдаётся `JsonResponse(employees, safe=False)`.
  - фото берётся приоритетно из `emp.photo.url`, а если нет/ошибка — из `emp.photo_url` или placeholder.

### Как фронт получает данные и рисует таблицу

#### Шаблон (HTML каркас)

`Pizza/pizzeria/templates/pizzeria/employees_table.html` содержит:

- `<div class="preloader" ... hidden></div>`
- панель управления: фильтр + кнопки «Добавить», «Премировать»
- форму добавления (изначально `hidden`, `novalidate`, `multipart/form-data`)
- таблицу с `<th class="sortable" data-column="...">...<span class="sort-icon">`
- `<tbody id="employees-tbody">` с placeholder-строкой
- контейнер пагинации `#pagination-container`
- блок деталей сотрудника `#employee-details`

#### JS-класс `EmployeesTable`

В `static/js/employees-table.js` реализован класс `EmployeesTable`, который:

- хранит состояние:
  - `employees` (оригинальные)
  - `filteredEmployees` (после фильтра/сортировки)
  - `currentPage`, `itemsPerPage`
  - `sortColumn`, `sortDirection`
  - `selectedEmployees` (Set выбранных id)
- при старте:
  - `loadEmployees()` → `render()`

Данные грузятся fetch-ом:

- `GET /api/employees/`
- JSON нормализуется через `normalizeEmployee()`
- дополнительно есть `ensureMinimumRecords()` (клиентский «дублёр» сидера), чтобы UI всегда имел **минимум 10 строк** даже если API вернул пусто/ошибку.

### Сортировка

Сортировка целиком **клиентская**:

- клик по `<th class="sortable" data-column="...">` вызывает `sort(column)`
- `sort()` переключает направление `asc/desc`, сортирует `filteredEmployees` через `.sort((a,b)=>...)`
- затем `currentPage = 1` и `render()`
- иконки стрелок обновляются в `updateSortIcons()`

### Пагинация

Пагинация тоже **клиентская**:

- `itemsPerPage = 3`
- `getCurrentPageEmployees()` делает `slice(start, end)`
- `renderPagination()` генерит кнопки (1, …, current±1, …, last) и «Пред/След»
- обработчик кликов на пагинации сделан через **делегирование** на контейнер

### Фильтрация

Фильтрация тоже клиентская:

- по кнопке «Найти» или Enter в поле
- ищет подстроку во всех основных полях: `name`, `position`, `url`, `phone`, `email`, `description`
- после фильтра сбрасывает на страницу 1 и чистит `selectedEmployees` от id, которых больше нет в `filteredEmployees`

### Валидация (front + back)

#### На фронте (JS)

Валидация делается вручную (формально HTML5 валидация отключена `novalidate`):

- `validateURL()`:
  - regex `^https?:\/\/.+(\.php|\.html)$`
  - пишет сообщение в `#url-validation`
  - подсвечивает поле классом `.invalid-input`
- `validatePhone()`:
  - regex на форматы `+375 ...` или `8(0XX) ...`
  - пишет сообщение в `#phone-validation`
  - подсвечивает `.invalid-input`
- `checkFormValidity()`:
  - проверяет заполненность всех полей + валидность url/phone
  - только тогда включает кнопку submit (`#submit-employee-btn`)

#### На бэкенде (Django)

`POST /api/employees/add/` в `employees_add_api` повторяет (и усиливает) проверки:

- все поля обязательны, включая файл фото
- URL — тот же паттерн `http(s)://...(.php|.html)`
- телефон нормализуется через `normalize_phone()` из `validators.py`
- email проверяется `validate_email`
- файл фото должен быть `content_type.startswith('image/')`

Только после этого создаётся `Employee(...)` и `save()`, а в ответе возвращается JSON `{success: true, employee: {...}}`.

### Прелоадер и UX-фишки

#### Прелоадер

Прелоадер — это `<div class="preloader" hidden>` в шаблоне + стили `.preloader` в `employees-table.css`.

Механика в JS:

- `showPreloader()`:
  - показывает прелоадер (убирает `hidden`)
  - прячет `.table-wrapper` (ставит `hidden`)
- `hidePreloader()` — наоборот

Почти все действия UI (сортировка/фильтр/переход страницы) завёрнуты в `applyWithLoader(action)`:

- включает прелоадер
- выполняет действие
- выключает прелоадер с небольшой задержкой `setTimeout(..., 150)` (чтобы анимация не “мигала”)

#### Дополнительные «фишки» таблицы

- **“Select all” только текущей страницы** + корректная индикация `indeterminate` (`syncSelectAllState()`).
- **Выделение строки** и показ подробностей справа/ниже (`showEmployeeDetails()` + `highlightRow()`).
- **Кнопка “Премировать”** активна только если выбран хотя бы один сотрудник (`updatePremiateButton()`), выводит поздравительное сообщение и сбрасывает выбор.
- **Безопасный вывод текста**: `escapeHtml()` перед вставкой пользовательских строк в `innerHTML`.
- **Fallback для изображений**: в `<img ... onerror="...this.src=fallback">`.
- **CSRF для POST**:
  - в шаблоне есть `{% csrf_token %}`
  - в fetch добавления сотрудника шлётся заголовок `X-CSRFToken` из cookie (`getCookie('csrftoken')`)

---

## Q4. Генерация формы (в твоём случае: генерация “слайдера” `input type="range"`)

### Важное уточнение по коду

Страница называется “Генератор формы”, но **реально в твоём проекте она генерирует именно слайдеры `<input type="range">`** и подключает `static/js/range-generator.js`.

Файл `static/js/form-generator.js` в репозитории тоже есть (он генерирует “форму заказа пиццы”), но **на этой странице он не используется**.

### Где подключается (Django + шаблон)

- URL: `/form-generator/` → view `form_generator` (доступ только администратору).
- Шаблон: `Pizza/pizzeria/templates/pizzeria/form_generator.html`
  - подключает стили `form-generator.css` + `range-generator.css`
  - подключает скрипт `range-generator.js`
  - содержит чекбокс `#generate-range-checkbox` и контейнер `#range-generator-container`

### Как работает генерация (клиентская логика)

Файл: `static/js/range-generator.js`, класс **`RangeGenerator`**.

#### 1) Инициализация

- `new RangeGenerator()` создаётся на `DOMContentLoaded`
- в конструкторе:
  - `this.ranges = []`
  - `init()` — подписка на чекбокс “Сгенерировать слайдеры”
  - `loadFromStorage()` — восстановление ранее созданных слайдеров из `localStorage`

#### 2) Показ/скрытие генератора

Чекбокс `#generate-range-checkbox` управляет отображением:

- `showGenerator()` — вставляет панель генератора (через `innerHTML`) в `#range-generator-container`
  - кнопки: “Добавить слайдер” и “Очистить все”
  - контейнер списка: `#ranges-list`
  - после вставки — подписывает кнопки и вызывает `renderRanges()`
- `hideGenerator()` — очищает контейнер

#### 3) Создание “слайдера” (модель данных)

Новый слайдер создаётся в `addRange()` как объект (хранится в `this.ranges`):

- `id` (уникальный, на базе `Date.now()`)
- `name`, `min`, `max`, `step`, `value`
- `list` (опционально `datalist id`)
- `disabled`

После добавления:

- `saveToStorage()` сохраняет `this.ranges` в `localStorage` под ключом `generatedRanges`
- `renderRanges()` перерисовывает UI

#### 4) Рендер и live-обновление атрибутов

`renderRanges()` генерирует для каждого слайдера карточку:

- слева — поля атрибутов (`name/min/max/step/value/list/disabled`)
- справа — “Предпросмотр”: реальный `<input type="range"...>` с выставленными атрибутами + вывод текущего значения

Дальше `attachEventListeners()` привязывает обработчики:

- удалить слайдер (крестик)
- менять атрибуты (input/change) → `updateRange(id, attribute, value)`
- двигать сам range в предпросмотре → обновляет `Текущее значение`

`updateRange()`:

- обновляет объект в `this.ranges`
- синхронизирует DOM-атрибуты у предпросмотра (`min/max/step/value/name/list/disabled`)
- сохраняет в `localStorage`

#### 5) Восстановление после перезагрузки

`loadFromStorage()` читает `localStorage.getItem('generatedRanges')`, парсит JSON и кладёт в `this.ranges`.

Если чекбокс генератора уже включён — автоматически вызывает `showGenerator()` и рисует сохранённые слайдеры.

### Какие технологии/“фишки” используются

- динамическая генерация DOM через `innerHTML`
- хранение состояния в `localStorage` (`generatedRanges`)
- live-обновление атрибутов `input[type="range"]` (min/max/step/value/list/disabled)
- безопасная вставка текста через `escapeHtml()` (для name/list)

---

## Q5. Каталог пицц: фильтры/сортировка, пользовательская навигация, выбор количества элементов на странице

### 1) Серверная часть: как формируется каталог (Django ORM)

В проекте есть **2 источника каталога**:

1) `home()` — на главной странице выводится каталог с серверной пагинацией (12 на страницу).
2) `filter_pizzas()` — отдельный обработчик, который делает фильтры/сортировку + серверную пагинацию (12 на страницу) и рендерит `pizza_list.html`.

Кроме этого, есть `pizza_list()` (маршрут `/pizzas/`), который делает фильтры/поиск/сортировку, но возвращает **все** записи без `Paginator` (там дальше включается клиентская пагинация через JS).

#### Пример: серверная фильтрация/сортировка/пагинация в `filter_pizzas`

Файл: `Pizza/pizzeria/views.py`

- фильтры по `category`, `min_price/max_price`, `sauce`
- сортировка по `sort`
- пагинация через `Paginator(..., 12)` и `get_page(page)`

### 2) Шаблон каталога: фильтры и “навигация пользователя”

Файл: `Pizza/pizzeria/templates/pizzeria/pizza_list.html`

#### Фильтры/сортировка

Слева находится `<form method="get">` (то есть состояние задаётся **query-параметрами URL**):

- `category` (select)
- `min_price/max_price` (числа)
- `sort` (select)

Нажатие “Применить фильтры” просто делает GET на эту же страницу с параметрами.

#### Серверная навигация по страницам (если `pizzas` — объект Page)

Если `pizzas` пришёл как `Page` (через Django `Paginator`), то шаблон показывает `<nav class="pagination-nav">`:

- ссылки “предыдущая/следующая”
- ссылки на каждую страницу
- важная деталь: при формировании `href` сохраняются **все GET-параметры**, кроме `page` (чтобы фильтры не сбрасывались при переходе по страницам).

### 3) Клиентская “пользовательская навигация” (JS-пагинация + page size)

Файл: `static/js/catalog-pagination.js`

Это отдельная “пагинация на клиенте” поверх уже отрендеренных карточек `.pizzas-grid`:

- собирает все элементы: `this.allItems = Array.from(itemsContainer.children)`
- показывает только элементы текущей страницы, остальные скрывает через `style.display = 'none'`
- генерирует свои кнопки страниц (“Пред/След”, номера + многоточия)
- после клика делает `scrollIntoView(...)`, чтобы пользователь видел начало списка

### 4) Выбор количества элементов на странице

Выбор реализован **клиентски** в `CatalogPagination`:

- создаётся select “Элементов на страницу” с вариантами **3/6/9/12**
- значение сохраняется в `localStorage` по ключу **`catalogItemsPerPage`**
- при изменении:
  - `itemsPerPage` обновляется
  - `currentPage = 1`
  - вызывается `applyPagination()`

Важно: этот выбор **не меняет серверный `Paginator(…, 12)`**, если серверная пагинация используется; он управляет только видимостью карточек, уже присутствующих в DOM.

---

## Q6. Эффект наведения на пиццу в каталоге (hover + 3D)

Эффект сделан как комбинация:

1) **CSS hover-анимаций** (подъём карточки, тень, подсветка бордера, увеличение картинки).
2) **JS 3D-наклона** (реакция на движение мыши внутри карточки) — в отдельном скрипте `card-3d-effect.js`.

### 1) CSS-эффект (основной “подъём/тень/подсветка”)

В проекте есть два набора стилей карточки:

- `static/css/pizza-list.css` — базовый hover: `translateY(-5px)`, усиление тени, увеличение `img` на `scale(1.05)`.
- `static/css/catalog.css` — “продвинутый” hover: `translateY(-12px) scale(1.02) rotateX(5deg) rotateY(5deg)` + градиентная полоска сверху через `::before`.

Плюс предусмотрен режим доступности: `@media (prefers-reduced-motion: reduce)` отключает трансформации/transition.

### 2) JS 3D-эффект (интерактивный наклон)

Файл: `static/js/card-3d-effect.js`

- На `DOMContentLoaded` находит все `.pizza-card`.
- На `mousemove` считает положение курсора относительно центра карточки.
- Преобразует это в углы `rotateX/rotateY`.
- Ставит inline-style `transform: perspective(1000px) rotateX(...) rotateY(...) translateY(-12px) scale(1.02)`.
- На `mouseleave` очищает transform (возврат к CSS состоянию).

Также учитывается `prefers-reduced-motion`: если включено, эффект не инициализируется.

---

## Q7. Запрос даты рождения и алерт про “разрешение родителей”

В проекте это реализовано в **двух местах** (разные цели):

1) **Страница “Валидация возраста”** (`/age-validator/`) — чисто клиентская демонстрация: пользователь вводит дату рождения, JS считает возраст и при `< 18` показывает `alert(...)` + предупреждение в блоке результата.
2) **Регистрация/профиль (Django Forms)** — серверная бизнес-валидация: дата рождения обязательна, и если возраст `< 18`, форма не валидируется (показывается ошибка).

### 1) Страница “Валидация возраста” (JS + alert)

#### HTML: поле даты рождения

Шаблон: `Pizza/pizzeria/templates/pizzeria/age_validator.html`

- поле ввода даты: `<input type="date" id="birth-date-input" ... required>`
- кнопка “Проверить”
- контейнер результата `#age-validation-result`

#### JS: расчёт возраста и алерт

Файл: `static/js/age-validator.js`, класс `AgeValidator`:

- читает строку даты из `#birth-date-input`
- валидирует: пусто / неверный формат / дата в будущем
- считает полные годы (функция `calculateAge`)
- если возраст `< 18`:
  - показывает `alert("... требуется разрешение родителей")`
  - рендерит блок предупреждения в `#age-validation-result`

### 2) Регистрация: обязательный birth_date + серверная проверка 18+

#### Где запрашивается birth_date

Форма регистрации — `RegistrationForm` в `Pizza/pizzeria/forms.py`:

- `birth_date` — `forms.DateField(required=True)` с виджетом `type="date"`
- `help_text`: “Вам должно быть не менее 18 лет”

В шаблоне `register.html` поля выводятся циклом `{% for field in form %}` — поэтому `birth_date` автоматически появляется как input date.

#### Как запрещается возраст < 18

Метод `RegistrationForm.clean_birth_date()` считает возраст и при `< 18` поднимает `ValidationError('Вам должно быть не менее 18 лет')`.

То есть в регистрации это не “alert”, а **ошибка валидации формы** (серверная, надёжная).

---

## Q8. “Библиотека” (читатели): базовый класс, прототипное наследование и `class/extends`

Фича “Библиотека” — это страница `/library-readers/`, которая демонстрирует ООП в JS двумя способами:

1) **Прототипное наследование** (function-конструкторы + `.prototype` + `Object.create`)
2) **ES6 классы** (`class`, `extends`, `super`, геттеры/сеттеры)

В обоих вариантах есть:

- базовый “читатель” (обычный читатель)
- наследник “VIP читатель” (добавляет поля/методы)

### Где это подключено

- Шаблон: `Pizza/pizzeria/templates/pizzeria/library_readers.html`
  - Контейнер списка: `#readers-list`
  - Кнопки действий: найти самого “старого”, сортировать, средний стаж, поиск
  - (для admin) форма добавления читателя + чекбокс VIP с доп. полями
  - Подключение JS: `static/js/library-readers.js`

### Вариант A — прототипное наследование

Файл: `static/js/library-readers.js`

#### Базовый “класс”: `LibraryReader` (function-конструктор)

- “поля экземпляра” задаются в функции-конструкторе через `this.*`
- методы объявлены на `LibraryReader.prototype`:
  - `getFullName()`
  - `getReadingExperience(currentYear)`
  - `displayInfo()` — возвращает HTML-карточку

#### Наследник: `VipLibraryReader`

Схема классическая для прототипов:

- вызываем базовый конструктор в контексте текущего объекта:
  - `LibraryReader.call(this, ...)`
- цепочка прототипов:
  - `VipLibraryReader.prototype = Object.create(LibraryReader.prototype)`
  - `VipLibraryReader.prototype.constructor = VipLibraryReader`
- добавляем новые методы в прототип наследника:
  - `getReaderStatus()`
  - `getFullInfo()` — расширенная HTML-карточка

То есть “наследование” реализовано не через `extends`, а через **привязку прототипа** к прототипу базового типа.

### Вариант B — ES6 `class` / `extends`

#### Базовый класс: `LibraryReaderES6`

- конструктор сохраняет поля как `_lastName`, `_startYear`, ... (условно “инкапсуляция”)
- определены **геттеры/сеттеры** для полей
- методы:
  - `getFullName()`
  - `getReadingExperience(currentYear)`
  - `displayInfo()`

#### Наследник: `VipLibraryReaderES6 extends LibraryReaderES6`

- `extends` строит цепочку прототипов автоматически
- в конструкторе вызывается `super(...)` для инициализации базовой части
- добавляются поля `_category`, `_booksRead` + геттеры/сеттеры
- добавляются методы `getReaderStatus()` и `getFullInfo()`

### Где используется “базовый класс” на странице (полиморфизм)

`LibraryManager` держит массив `this.readers`, где лежат **экземпляры базового типа и наследника вперемешку**.

Дальше код работает “полиморфно”:

- у всех объектов есть `getFullName()` и `getReadingExperience()`
- для VIP дополнительно есть `getFullInfo()`
- при рендере проверяется, VIP это или нет (`instanceof ...`) и выбирается нужный метод вывода.

Также через общий интерфейс считаются:

- “самый старый” (минимальный `startYear`)
- сортировка по `startYear`
- поиск по `getFullName()`/`cardNumber`
- средний стаж через `reduce` и `getReadingExperience()`

---

## Q9. Геолокация: как используется API и что показывается пользователю

### Где находится страница и как подключено

- URL `/geolocation/` отдаётся view `geolocation` (доступ только администратору).
- Шаблон: `Pizza/pizzeria/templates/pizzeria/geolocation.html`
  - кнопка `#get-location-btn`
  - блок результата `#geolocation-result`
  - контейнер карты `#map-container`
  - подключает `static/js/geolocation-api.js` и `static/css/geolocation.css`

### Как устроен код (класс `GeolocationAPI`)

Файл: `static/js/geolocation-api.js`

#### 1) “Запуск” по кнопке

При клике на `#get-location-btn` вызывается `getUserLocation()`.

#### 2) Два режима получения координат

В коде предусмотрены 2 способа:

1) **Browser Geolocation API**: `navigator.geolocation.getCurrentPosition(...)`
   - метод-обёртка `_getCurrentPositionWithOptions(options, ...)`
   - успех → `showLocation(position, ...)`
   - ошибка → `handleError(error, ...)` (+ один retry с другими опциями)

2) **Fallback по IP**: `fetch('https://ipapi.co/json/')`
   - метод `fetchApproxLocation(...)`
   - используется как “упрощённый режим” по умолчанию (из-за проблем с geolocation на Linux/Firefox)
   - может вызываться и вручную кнопкой “Определить приблизительно по IP” при ошибке browser geolocation

#### 3) Permissions API (необязательно)

Если браузер поддерживает `navigator.permissions.query({name:'geolocation'})`, то состояние (`granted/denied/prompt`) выводится в UI как подсказка (`_renderPermissionInfo`).

### Как строится карта

Карта рисуется на клиенте через **Leaflet + OpenStreetMap**:

- если `window.L` не определён — Leaflet грузится динамически с CDN (CSS+JS)
- затем `initMap(lat,lng)` создаёт `L.map`, добавляет `tileLayer` OSM и маркер

### Что является “фишками” реализации

- graceful-degradation: IP fallback вместо жёсткой зависимости от разрешений/GeoClue
- retry при `POSITION_UNAVAILABLE/TIMEOUT` с менее строгими опциями
- подсказка про необходимость HTTPS (`window.isSecureContext`)
- таймаут для IP-запроса через `AbortController`
- экранирование пользовательских/ошибочных строк в HTML через `escapeHtml()`

---

## Q10. Работа с Chart.js (график arccos x)

### Где подключено

- URL: `/chart-arccos/` → view `chart_arccos` (доступ только администратору), рендерит `pizzeria/chart_arccos.html`.
- Шаблон: `Pizza/pizzeria/templates/pizzeria/chart_arccos.html`
  - `<canvas id="arccos-chart"></canvas>`
  - кнопки управления: “Обновить диапазон”, “Сохранить график (PNG)”
  - подключение скрипта: `static/js/chart-arccos.js`

### Как подключается Chart.js

Chart.js **не подключён тегом `<script>` в шаблоне**. Вместо этого он подгружается динамически в JS:

- `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`

Параллельно таким же образом подгружается `math.js`:

- `https://cdn.jsdelivr.net/npm/mathjs@12.2.0/lib/browser/math.min.js`

Это делается методом `loadLibraries()` и продолжение выполняется только когда обе библиотеки загрузились.

### Что именно строится в Chart.js

Создаётся линейный график:

- `type: 'line'`
- `labels`: массив `x` на отрезке `[-1, 1]` с шагом `0.1`
- 2 набора данных (datasets):
  1) `arccos x (ряд Тейлора)` — вычисляется вручную через `taylorArccos()`
  2) `arccos x (math.js)` — берётся из `math.acos(x)` (если доступно), иначе fallback на `Math.acos(x)`

### Настройки графика (options)

Используются стандартные опции Chart.js:

- `responsive`, `maintainAspectRatio`
- `animation`
- `plugins.title`, `plugins.legend`, `plugins.tooltip` (tooltip форматирует y до 4 знаков)
- `scales.x` и `scales.y` с заголовками осей и сеткой
- `interaction` (`nearest`, `axis: 'x'`, `intersect: false`)

В коде также прописан блок `plugins.annotation`, но отдельный плагин аннотаций в проекте не подгружается (то есть “оси x=0/y=0” появятся только если дополнительно подключить chartjs-plugin-annotation).

### “Фишки” страницы графика

- **Сохранение в PNG**: `chart.toBase64Image('image/png', 1)` → создаётся `<a download>` и вызывается `click()`
- **Изменение диапазона**: пользователь задаёт min/max (в пределах [-1,1]); данные пересчитываются и обновляются через `chart.update('active')`

---

## Q11. Анимация при скролле (пицца из 8 долек)

Страница “Анимация при скроллинге” реализует эффект: **пицца “разъезжается” на 8 долек по мере прокрутки**. Важная деталь: скролл происходит **не всей страницы**, а внутри отдельного контейнера, чтобы анимация была управляемой.

### Где подключено

- Шаблон: `Pizza/pizzeria/templates/pizzeria/scroll_animation.html`
  - контейнер скролла: `#scroll-animation-container` (с `overflow-y: auto`)
  - внутри “сцена” со sticky-элементом `.pizza-stage` и самой пиццей `#pizza-split-pizza`
  - 8 долек: `.pizza-slice` с CSS-переменной `--i: 0..7`
  - подключение JS: `static/js/scroll-animation-enhanced.js`
- Стили: `static/css/scroll-animation.css`

### CSS: как рисуются “дольки”

Файл: `static/css/scroll-animation.css`

- Каждая долька — это один и тот же круговой слой `.pizza-slice`, но “вырезанный” в сектор:
  - современный вариант через `mask: conic-gradient(...)`
  - фолбэк через `clip-path`, если mask не поддерживается (`@supports not (...)`)
- Смещение дольки задаётся трансформацией:
  - `transform: translate(var(--tx), var(--ty))`
  - `--tx/--ty` выставляет JS для каждой дольки отдельно

### JS: как скролл превращается в прогресс анимации

Файл: `static/js/scroll-animation-enhanced.js`, класс `PizzaSplitScrollAnimation`.

Основная идея:

1) слушаем `scroll` у `#scroll-animation-container` (а не у `window`)
2) считаем прогресс 0..1 как `scrollTop / (scrollHeight - clientHeight)`
3) сглаживаем прогресс функцией `smoothstep`
4) умножаем прогресс на “максимальную дистанцию разъезда” (зависит от размера пиццы)
5) переводим расстояние в dx/dy по углам 8 долек и записываем в CSS-переменные `--tx/--ty`

Для производительности обновление идёт через `requestAnimationFrame` (throttling через `ticking`).

### Фишки/детали

- `prefers-reduced-motion`: если включено, пицца остаётся собранной (смещения 0)
- `position: sticky` у `.pizza-stage`: пицца визуально “стоит на месте”, а скролл меняет только прогресс
- адаптив: размер пиццы задаётся CSS-переменной `--pizza-size`, от неё зависит расстояние разъезда
