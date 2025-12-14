## Лаба 3 — ответы на вопросы

### 1) Анимация при скроллинге. Как реализовал, какое событие обрабатывал.
- **Где код**: `STRWEB/LR3/static/js/scroll-animation.js`
- **Где подключено**: `STRWEB/LR3/Pizza/pizzeria/templates/pizzeria/scroll_animation.html`
- **Событие**: обработка **`scroll`** на контейнере секции (не на `window`).

Как работает:
- В `PizzaSplitScrollAnimation` берутся элементы `#scroll-animation-container` и `#pizza-split-pizza`.
- В `init()` навешивается:
  - `this.container.addEventListener('scroll', ...)` — на скролл внутри блока.
  - `window.addEventListener('resize', ...)` — пересчёт размеров.
- Чтобы не делать тяжёлые вычисления на каждом событии, используется **`requestAnimationFrame`** (throttling через флаг `ticking`).
- Прогресс скролла: `scrollTop / (scrollHeight - clientHeight)` → `0..1`, затем сглаживание `smoothstep()`.
- Смещение долек: по углу, в CSS-переменные `--tx`, `--ty`, и CSS делает `transform: translate(var(--tx), var(--ty))`.
- Учтено `prefers-reduced-motion`: если true — движение выключается.

---

### 2) Изменение delay для slider в коде. Как проверить, что это может делать только админ.
- **Где создаётся слайдер и задаётся delay**: `STRWEB/LR3/Pizza/pizzeria/templates/pizzeria/home.html` (скрипт, где `new ImageSlider(..., { delay: 5, showSettings: isAdmin })`).
- **Где логика delay и сохранения**: `STRWEB/LR3/static/js/slider.js`.

Как ограничено «только админ»:
- В `home.html` вычисляется `isAdmin` по `user.is_authenticated` и `user.userprofile.role === "admin"`.
- `showSettings: isAdmin` → **только админ** увидит панель настроек.
- В `slider.js` весь функционал настроек (UI + `loadSettings()`/`saveSettings()`) выполняется **только если `options.showSettings === true`**.

Как проверить на практике:
- **Зайти под админом** → на главной появится блок `.slider-settings`, можно менять delay и он сохранится в `localStorage`.
- **Зайти под не-админом** → блока настроек нет, `loadSettings()` не вызывается.

Важно: это фронтенд-ограничение (UI). В реальном проде «строго только админ» делается ещё и серверной проверкой (как минимум выдавать настройки/возможность менять их через backend).

---

### 3) Где сохраняешь тему (светлую/тёмную), чтобы при обновлении не менялась. Где описаны стили для темы.
- **Хранилище**: `localStorage` по ключу **`theme`**.
- **JS**: `STRWEB/LR3/static/js/theme-switcher.js`
  - чтение: `localStorage.getItem('theme') || 'light'`
  - применение: `document.documentElement.setAttribute('data-theme', theme)`
  - сохранение: `localStorage.setItem('theme', theme)`
- **CSS стили темы**:
  - основное: `STRWEB/LR3/static/css/theme-switcher.css` (селекторы `[data-theme="dark"] ...` и CSS-переменные)
  - также есть правки в других CSS (например `static/css/base.css`, `static/css/pizza-list.css`, `static/css/catalog-pagination.css`, `static/css/employees-table.css`, `static/css/geolocation.css` и т.д.)

---

### 4) Добавления сотрудника.
Это реализовано как «таблица + API».

- **Страница**: `STRWEB/LR3/Pizza/pizzeria/templates/pizzeria/employees_table.html`
- **JS (UI/логика добавления)**: `STRWEB/LR3/static/js/employees-table.js`
  - обработчик submit формы → `addEmployee()`
  - собирается `FormData` и отправляется POST на `'/api/employees/add/'` с CSRF.
- **Backend API**:
  - URL: `STRWEB/LR3/Pizza/pizzeria/urls.py`
    - `path('api/employees/add/', views.employees_add_api, ...)`
  - View: `STRWEB/LR3/Pizza/pizzeria/views.py`
    - `employees_add_api()` принимает multipart/form-data, валидирует поля, проверяет URL/телефон/email, проверяет что фото — изображение, сохраняет `Employee`.

Плюс ограничение доступа:
- `employees_table`, `employees_api`, `employees_add_api` помечены `@user_passes_test(lambda u: is_admin(u), login_url='/no-access/')`.

---

### 5) Сортировка сотрудников в коде и на странице. Как сделать чтобы сортировались как строки и как, чтобы сортировались как числа.
- **Где сортировка**: `STRWEB/LR3/static/js/employees-table.js` → метод `sort(column)`.
- **На странице**: клик по заголовкам `th.sortable` (в HTML у заголовков есть `data-column`), обработчик навешан через `querySelectorAll('.sortable')`.

Сейчас:
- Если значение строка → приводится к lower-case.
- Сравнение делается через `aVal > bVal` / `aVal < bVal`.

Как сортировать **как строки** правильно:
- Использовать `localeCompare`, например:

```js
return aVal.localeCompare(bVal, 'ru', { sensitivity: 'base' });
```

Как сортировать **как числа**:
- Привести к Number и сравнить разностью:

```js
return Number(aVal) - Number(bVal);
```

Если нужно универсально: по колонкам заранее знать тип (строка/число) и выбирать способ сравнения.

---

### 6) Покажи где у тебя премирование, как ты реализовал это.
- **Где кнопка и блок результата**: `STRWEB/LR3/Pizza/pizzeria/templates/pizzeria/employees_table.html`
  - кнопка `#premiate-btn`
  - вывод результата `#premiate-result`
- **Логика**: `STRWEB/LR3/static/js/employees-table.js`
  - `selectedEmployees` хранится в `Set()`.
  - `updatePremiateButton()` включает/выключает кнопку.
  - `premiateEmployees()` берёт выбранных, формирует сообщение и вставляет в DOM через `premiateResult.innerHTML = ...`, затем сбрасывает выбор.

---

### 7) Что такое innerHTML.
`innerHTML` — это свойство DOM-элемента:
- **get**: возвращает HTML-разметку внутри элемента строкой.
- **set**: заменяет содержимое элемента на HTML, который браузер распарсит в DOM.

Важно:
- Если вставлять туда непроверенный пользовательский ввод — риск **XSS**.

---

### 8) Как удалить элемент из начала массива и из конца (shift/pop).
- **Удалить из начала**: `arr.shift()`
  - удаляет первый элемент, возвращает его, сдвигает индексы.
- **Удалить из конца**: `arr.pop()`
  - удаляет последний элемент, возвращает его.

---

### 9) 4 задание, покажи как работает удаление.
(В проекте это сделано в генераторе input range.)

- **Где**: `STRWEB/LR3/static/js/range-generator.js`
- Удаление одного слайдера:
  - клик по кнопке `×` → `removeRange(id)`
  - реализация: `this.ranges = this.ranges.filter(r => r.id !== id);` → затем `saveToStorage()` и `renderRanges()`.
- Удаление всех:
  - кнопка «Очистить все» → `clearAll()`
  - подтверждение `confirm()` → `this.ranges = []` → `saveToStorage()` → `renderRanges()`.

---

### 10) Покажи, как в коде у тебя отображается и добавляется элемент (4 задание).
(Тоже `RangeGenerator`.)

- **Добавление элемента**: метод `addRange()`
  - создаёт объект `range` с полями `min/max/step/value/...`
  - добавляет в массив: `this.ranges.push(range)`
  - сохраняет: `saveToStorage()`
  - перерисовывает: `renderRanges()`

- **Отображение**: метод `renderRanges()`
  - строит HTML строкой через `map().join('')`
  - вставляет в DOM: `container.innerHTML = ...`
  - после рендера заново навешивает обработчики (`attachEventListeners()`).

---

### 11) Как можно получить элементы в js из HTML документа.
Основные способы:
- `document.getElementById('id')`
- `document.querySelector('селектор')`
- `document.querySelectorAll('селектор')`
- `document.getElementsByClassName('class')`
- `document.getElementsByTagName('tag')`
- `element.closest('селектор')` (поиск вверх по DOM)

---

### 12) Пагинация, как реализовал в коде. Для каталога товаров, как реализовал выбор кол-ва элементов на странице.
Пагинация сделана в двух местах:

1) **Серверная (Django Paginator)**
- `STRWEB/LR3/Pizza/pizzeria/views.py` использует `Paginator` для списка пицц/новостей.
- Шаблоны с выводом страниц: `templates/pizzeria/home.html`, `templates/pizzeria/pizza_list.html`, `templates/pizzeria/news_list.html`.

2) **Клиентская (для каталога на странице, выбор количества)**
- JS: `STRWEB/LR3/static/js/catalog-pagination.js`
  - хранит настройку в `localStorage` по ключу `catalogItemsPerPage`
  - создаёт `<select>` (3/6/9/12)
  - при смене значения пересчитывает пагинацию и скрывает/показывает элементы через `style.display`.
- CSS: `STRWEB/LR3/static/css/catalog-pagination.css`

---

### 13) Покажи как реализовал параллакс
Параллакс-эффект у фона реализован через CSS:
- `STRWEB/LR3/static/css/base.css`
- На `body` стоит `background-attachment: fixed;` → фон остаётся «приклеенным» к viewport, а контент прокручивается поверх, визуально создавая parallax-ощущение.

---

### 14) Показывай, как ты создаёшь объект класса, который был реализован в стиле прототипного наследования.
- **Где прототипный стиль**: `STRWEB/LR3/static/js/library-readers.js`
- Пример создания объекта:
  - базовый: `new LibraryReader(lastName, firstName, middleName, startYear, cardNumber)`
  - наследник: `new VipLibraryReader(..., category, booksRead)`

В коде это используется в `LibraryManager.createDemoData()` (когда `this.useES6 = false`).

---

### 15) Где ты наследуешься с помощью прототипа.
- `STRWEB/LR3/static/js/library-readers.js`

Ключевые строки:
- `LibraryReader.call(this, ...)` (вызов конструктора родителя)
- `VipLibraryReader.prototype = Object.create(LibraryReader.prototype);`
- `VipLibraryReader.prototype.constructor = VipLibraryReader;`

---

### 16) Покажи где у тебя внешняя api.
Внешние API/сервисы используются в геолокации:
- **JS**: `STRWEB/LR3/static/js/geolocation-api.js`

Что именно внешнее:
- **IP geolocation API**: запрос `fetch('https://ipapi.co/json/')`.
- **Leaflet CDN**:
  - CSS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`
  - JS: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`
- **OpenStreetMap tiles**: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`

Также используется browser API:
- `navigator.geolocation.getCurrentPosition(...)` (это Web API браузера).
