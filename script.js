// Инициализация переменных для чисел, знака операции и состояния завершения
let a = '';
let b = '';
let sign = '';
let finish = false;

// Переменные для запоминания последней операции и числа (для повторного '=')
let lastB = '';
let lastSign = '';

// Массивы допустимых цифр и операций
const digit = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ','];
const action = ['-', '+', 'X', '/'];

// Получение ссылки на экран калькулятора и кнопку очистки
const out = document.querySelector('.calc-screen p');
const clearBtn = document.querySelector('.ac');

// Функция конвертации строки с ',' в число с плавающей точкой
function toNumber(str) {
    return parseFloat(str.replace(',', '.'));
}

// Функция форматирования числа для вывода (с точностью до 10 знаков, замена '.' на ',')
function toDisplay(num) {
    return parseFloat(num.toFixed(10)).toString().replace('.', ',');
}

// Обновление текста кнопки очистки в зависимости от состояния
function updateClearButton() {
    if (a === '' && b === '') {
        clearBtn.textContent = 'AC';
    } else {
        clearBtn.textContent = 'C';
    }
}

// Полное очищение калькулятора
function clearAll() {
    a = '';
    b = '';
    sign = '';
    finish = false;
    lastB = '';
    lastSign = '';
    out.textContent = 0;
    updateClearButton();
}

// Очистка текущего введенного значения или знака, в зависимости от состояния
function clearCurrent() {
    if (finish) {
        a = '';
        finish = false;
    } else if (b !== '') {
        b = '';
    } else if (sign) {
        sign = '';
    } else if (a !== '') {
        a = '';
    }
    out.textContent = a || 0;
    updateClearButton();
}

// Инициализация кнопки очистки при загрузке
updateClearButton();

// Основной обработчик кликов по кнопкам калькулятора
document.querySelector('.buttons').onclick = (event) => {
    if (!event.target.classList.contains('btn')) return; // Если клик не по кнопке, игнорировать

    let key = event.target.textContent;

    // Обработка нажатия на кнопку "AC" или "C"
    if (event.target.classList.contains('ac')) {
        if (clearBtn.textContent === 'AC') clearAll();
        else clearCurrent();
        return;
    }

    // Обработка кнопки изменения знака (±)
    if (key === '+/-') {
        if (b !== '') {
            if (b.startsWith('-')) b = b.slice(1);
            else b = '-' + b;
            out.textContent = b;
        } else if (a !== '') {
            if (a.startsWith('-')) a = a.slice(1);
            else a = '-' + a;
            out.textContent = a;
        }
        return;
    }

    // Замена символов операторов для унификации
    if (key === '÷') key = '/';
    if (key === '×') key = 'X';

    // Обработка ввода цифр и десятичной точки
    if (digit.includes(key)) {
        // Запрет ввода второй запятой (десятичной точки) в числе
        if (key === ',' && ((sign === '' && a.includes(',')) || (sign !== '' && b.includes(',')))) return;

        // Если завершено вычисление, сброс перед новым вводом
        if (finish) {
            a = '';
            b = '';
            sign = '';
            finish = false;
        }

        // Добавление цифры или запятой в нужное число (a или b)
        if (sign === '') {
            if (key === ',' && a === '') a = '0,';
            else a += key;
            out.textContent = a;
        } else {
            if (key === ',' && b === '') b = '0,';
            else b += key;
            out.textContent = b;
        }
        updateClearButton();

        // Сброс активного состояния у кнопок операции
        document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
        return;
    }

    // Обработка нажатий на операторы (+, -, X, /)
    if (action.includes(key)) {
        if (finish) {
            // Если предыдущее вычисление завершено, новая операция на уже вычисленном значении
            finish = false;
            sign = key;
            out.textContent = a;
            document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            return;
        }

        // Если уже есть операция и второе число, выполнить предыдущую операцию
        if (sign !== '' && b !== '') {
            switch (sign) {
                case '+': a = toNumber(a) + toNumber(b); break;
                case '-': a = toNumber(a) - toNumber(b); break;
                case 'X': a = toNumber(a) * toNumber(b); break;
                case '/':
                    if (toNumber(b) === 0) {
                        out.textContent = 'Ошибка';
                        a = '';
                        b = '';
                        sign = '';
                        finish = false;
                        updateClearButton();
                        return;
                    }
                    a = toNumber(a) / toNumber(b);
                    break;
            }
            a = toDisplay(a);
            b = '';
            out.textContent = a;
        }

        // Установка нового знака операции
        sign = key;
        finish = false;

        // Обновление класса активной кнопки операции
        document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        updateClearButton();
        return;
    }

    // Обработка нажатия кнопки "=" для вычисления результата
    if (key === '=') {
        if (sign === '' && !finish) return; // Если нет операции, ничего не делать

        if (!finish) {
            // Если ещё не нажата "=", выполнить вычисление
            if (b === '') b = a; // Если второй операнд пуст, взять равным первому

            switch (sign) {
                case '+': a = toNumber(a) + toNumber(b); break;
                case '-': a = toNumber(a) - toNumber(b); break;
                case 'X': a = toNumber(a) * toNumber(b); break;
                case '/':
                    if (toNumber(b) === 0) {
                        out.textContent = 'Ошибка'; // Обработка деления на ноль
                        a = '';
                        b = '';
                        sign = '';
                        finish = false;
                        updateClearButton();
                        return;
                    }
                    a = toNumber(a) / toNumber(b);
                    break;
            }
            // Запоминаем последнюю операцию для повторного '='
            lastB = b;
            lastSign = sign;
            finish = true;
            b = '';
        } else {
            // Если "=" нажато повторно, повторяем последнюю операцию с lastB и lastSign
            if (lastSign === '' || lastB === '') return;

            switch (lastSign) {
                case '+': a = toNumber(a) + toNumber(lastB); break;
                case '-': a = toNumber(a) - toNumber(lastB); break;
                case 'X': a = toNumber(a) * toNumber(lastB); break;
                case '/':
                    if (toNumber(lastB) === 0) {
                        out.textContent = 'Ошибка'; // Обработка деления на ноль при повторении
                        a = '';
                        b = '';
                        sign = '';
                        finish = false;
                        updateClearButton();
                        return;
                    }
                    a = toNumber(a) / toNumber(lastB);
                    break;
            }
        }

        // Отображаем результат с форматированием
        a = toDisplay(a);
        out.textContent = a;

        // Сброс знака операции и сброс активных кнопок
        sign = '';
        document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
        updateClearButton();
    }
};