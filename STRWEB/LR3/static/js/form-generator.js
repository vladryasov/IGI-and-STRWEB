/**
 * Генератор элементов формы для варианта 19 (пиццерия)
 * Генерирует элемент формы для заказа пиццы
 */

class FormElementGenerator {
    constructor() {
        this.generatedElement = null;
        this.init();
    }

    init() {
        const checkbox = document.getElementById('generate-form-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.generateFormElement();
                } else {
                    this.removeFormElement();
                }
            });
        }
    }

    generateFormElement() {
        const container = document.getElementById('form-generator-container');
        if (!container) return;

        // Генерируем форму заказа пиццы
        const formHTML = `
            <div id="generated-pizza-form" class="generated-form">
                <h3>Форма заказа пиццы</h3>
                <form id="pizza-order-form">
                    <div class="form-group">
                        <label for="pizza-size">Размер пиццы:</label>
                        <select id="pizza-size" name="size">
                            <option value="small">Маленькая (25 см)</option>
                            <option value="medium" selected>Средняя (30 см)</option>
                            <option value="large">Большая (35 см)</option>
                            <option value="xlarge">Огромная (40 см)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="pizza-crust">Тип теста:</label>
                        <select id="pizza-crust" name="crust">
                            <option value="thin">Тонкое</option>
                            <option value="thick" selected>Толстое</option>
                            <option value="cheese">Сырные бортики</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="pizza-sauce">Соус:</label>
                        <select id="pizza-sauce" name="sauce">
                            <option value="tomato" selected>Томатный</option>
                            <option value="white">Белый</option>
                            <option value="bbq">Барбекю</option>
                            <option value="pesto">Песто</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Дополнительные ингредиенты:</label>
                        <div class="checkbox-group">
                            <label><input type="checkbox" name="toppings" value="pepperoni"> Пепперони</label>
                            <label><input type="checkbox" name="toppings" value="mushrooms"> Грибы</label>
                            <label><input type="checkbox" name="toppings" value="olives"> Оливки</label>
                            <label><input type="checkbox" name="toppings" value="onions"> Лук</label>
                            <label><input type="checkbox" name="toppings" value="peppers"> Перец</label>
                            <label><input type="checkbox" name="toppings" value="cheese"> Дополнительный сыр</label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="pizza-quantity">Количество:</label>
                        <input type="number" id="pizza-quantity" name="quantity" min="1" max="10" value="1">
                    </div>
                    
                    <div class="form-group">
                        <label for="pizza-notes">Особые пожелания:</label>
                        <textarea id="pizza-notes" name="notes" rows="3" placeholder="Например: без лука, больше сыра..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="pizza-delivery">Способ получения:</label>
                        <select id="pizza-delivery" name="delivery">
                            <option value="pickup">Самовывоз</option>
                            <option value="delivery" selected>Доставка</option>
                        </select>
                    </div>
                    
                    <div class="form-attributes">
                        <h4>Атрибуты формы:</h4>
                        <div class="attribute-controls">
                            <label>
                                <input type="checkbox" id="attr-required" checked> required
                            </label>
                            <label>
                                <input type="checkbox" id="attr-autocomplete"> autocomplete
                            </label>
                            <label>
                                <input type="checkbox" id="attr-novalidate"> novalidate
                            </label>
                        </div>
                        <div class="attribute-inputs">
                            <label>
                                action:
                                <input type="text" id="attr-action" value="/order/">
                            </label>
                            <label>
                                method:
                                <select id="attr-method">
                                    <option value="post" selected>POST</option>
                                    <option value="get">GET</option>
                                </select>
                            </label>
                            <label>
                                enctype:
                                <select id="attr-enctype">
                                    <option value="">(не указан)</option>
                                    <option value="application/x-www-form-urlencoded" selected>application/x-www-form-urlencoded</option>
                                    <option value="multipart/form-data">multipart/form-data</option>
                                    <option value="text/plain">text/plain</option>
                                </select>
                            </label>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn">Заказать пиццу</button>
                </form>
            </div>
        `;

        container.innerHTML = formHTML;
        this.generatedElement = document.getElementById('generated-pizza-form');
        
        // Применяем атрибуты
        this.attachAttributeListeners();
        
        // Обработчик отправки формы
        const form = document.getElementById('pizza-order-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        }
    }

    attachAttributeListeners() {
        const form = document.getElementById('pizza-order-form');
        if (!form) return;

        // Обновление атрибутов формы
        const updateAttributes = () => {
            const action = document.getElementById('attr-action')?.value;
            const method = document.getElementById('attr-method')?.value;
            const enctype = document.getElementById('attr-enctype')?.value;
            const required = document.getElementById('attr-required')?.checked;
            const autocomplete = document.getElementById('attr-autocomplete')?.checked;
            const novalidate = document.getElementById('attr-novalidate')?.checked;

            if (action) form.action = action;
            if (method) form.method = method;
            if (enctype) form.enctype = enctype;
            
            if (required) {
                form.setAttribute('required', '');
            } else {
                form.removeAttribute('required');
            }
            
            if (autocomplete) {
                form.setAttribute('autocomplete', 'on');
            } else {
                form.removeAttribute('autocomplete');
            }
            
            if (novalidate) {
                form.setAttribute('novalidate', '');
            } else {
                form.removeAttribute('novalidate');
            }
        };

        document.querySelectorAll('.attribute-controls input, .attribute-inputs input, .attribute-inputs select').forEach(input => {
            input.addEventListener('change', updateAttributes);
        });
    }

    handleFormSubmit(form) {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        const resultDiv = document.getElementById('form-submit-result');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="form-result">
                    <h4>Данные формы:</h4>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                    <p class="success-message">Форма успешно отправлена!</p>
                </div>
            `;
        }
    }

    removeFormElement() {
        const container = document.getElementById('form-generator-container');
        if (container) {
            container.innerHTML = '';
        }
        this.generatedElement = null;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    new FormElementGenerator();
});


