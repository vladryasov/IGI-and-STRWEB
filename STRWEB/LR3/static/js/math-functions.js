/**
 * Математические функции для варианта 19 (пиццерия)
 * Используем функции связанные с окружностями и площадями (как пицца)
 */

class MathFunctions {
    constructor() {
        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Обработчики для всех функций
        const calculateButtons = document.querySelectorAll('.calculate-btn');
        calculateButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const funcName = e.target.dataset.function;
                this.calculateFunction(funcName);
            });
        });
    }

    calculateFunction(funcName) {
        const input = document.getElementById(`input-${funcName}`);
        const resultDiv = document.getElementById(`result-${funcName}`);
        
        if (!input || !resultDiv) return;

        const x = parseFloat(input.value);
        
        if (isNaN(x)) {
            resultDiv.textContent = 'Ошибка: введите число';
            resultDiv.className = 'result error';
            return;
        }

        let result;
        let isValid = true;
        let errorMsg = '';

        switch(funcName) {
            case 'circle-area':
                if (x <= 0) {
                    isValid = false;
                    errorMsg = 'Радиус должен быть больше 0';
                } else {
                    result = Math.PI * x * x;
                }
                break;
            case 'circle-perimeter':
                if (x <= 0) {
                    isValid = false;
                    errorMsg = 'Радиус должен быть больше 0';
                } else {
                    result = 2 * Math.PI * x;
                }
                break;
            case 'sphere-volume':
                if (x <= 0) {
                    isValid = false;
                    errorMsg = 'Радиус должен быть больше 0';
                } else {
                    result = (4/3) * Math.PI * x * x * x;
                }
                break;
            case 'sin':
                result = Math.sin(x);
                break;
            case 'cos':
                result = Math.cos(x);
                break;
            case 'tan':
                result = Math.tan(x);
                break;
            case 'exp':
                result = Math.exp(x);
                break;
            case 'ln':
                if (x <= 0) {
                    isValid = false;
                    errorMsg = 'Аргумент должен быть больше 0';
                } else {
                    result = Math.log(x);
                }
                break;
            case 'sqrt':
                if (x < 0) {
                    isValid = false;
                    errorMsg = 'Аргумент должен быть неотрицательным';
                } else {
                    result = Math.sqrt(x);
                }
                break;
            case 'power':
                const power = parseFloat(document.getElementById('input-power-value').value);
                if (isNaN(power)) {
                    isValid = false;
                    errorMsg = 'Введите степень';
                } else {
                    result = Math.pow(x, power);
                }
                break;
            default:
                isValid = false;
                errorMsg = 'Неизвестная функция';
        }

        if (!isValid) {
            resultDiv.textContent = errorMsg;
            resultDiv.className = 'result error';
        } else {
            resultDiv.textContent = `Результат: ${result.toFixed(6)}`;
            resultDiv.className = 'result success';
        }
    }

    // Ряд Тейлора для sin(x)
    taylorSin(x, n = 10) {
        let result = 0;
        for (let i = 0; i < n; i++) {
            const term = Math.pow(-1, i) * Math.pow(x, 2 * i + 1) / this.factorial(2 * i + 1);
            result += term;
        }
        return result;
    }

    // Ряд Тейлора для cos(x)
    taylorCos(x, n = 10) {
        let result = 0;
        for (let i = 0; i < n; i++) {
            const term = Math.pow(-1, i) * Math.pow(x, 2 * i) / this.factorial(2 * i);
            result += term;
        }
        return result;
    }

    // Ряд Тейлора для exp(x)
    taylorExp(x, n = 10) {
        let result = 0;
        for (let i = 0; i < n; i++) {
            result += Math.pow(x, i) / this.factorial(i);
        }
        return result;
    }

    // Ряд Тейлора для ln(1+x)
    taylorLn(x, n = 10) {
        if (Math.abs(x) >= 1) {
            return null; // Ряд сходится только при |x| < 1
        }
        let result = 0;
        for (let i = 1; i <= n; i++) {
            result += Math.pow(-1, i + 1) * Math.pow(x, i) / i;
        }
        return result;
    }

    factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    new MathFunctions();
});


