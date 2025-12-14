import re
from django.core.exceptions import ValidationError

ALLOWED_OPERATOR_CODES = {'17', '25', '29', '33', '44'}

def normalize_phone(value: str) -> str:
    """
    Нормализует телефон в канонический вид: +375XXYYYYYYY
    где XX — код оператора (17, 25, 29, 33, 44), YYYYYYY — 7 цифр.

    Принимает ввод с пробелами/скобками/дефисами, например:
    - +375 (29) 111-22-33
    - 8(029) 848 44 03
    """
    raw = (value or '').strip()
    digits = re.sub(r'\D+', '', raw)

    # +375 XX YYYYYYY  -> digits: 375XXYYYYYYY (12 цифр)
    if digits.startswith('375'):
        if len(digits) != 12:
            raise ValidationError('Номер должен содержать 12 цифр после +375 (код+7 цифр).')
        operator = digits[3:5]
        subscriber = digits[5:]
    # 8(0XX) YYYYYYY -> digits: 80XXYYYYYYY (11 цифр), где 0XX включает 0 + 2 цифры оператора
    elif digits.startswith('80'):
        if len(digits) != 11:
            raise ValidationError('Номер должен начинаться с 8(0XX) и содержать 7 цифр основной части.')
        code3 = digits[2:5]  # например 029
        if len(code3) != 3 or code3[0] != '0':
            raise ValidationError('Код после 8 должен быть вида 0XX (например 029).')
        operator = code3[1:]
        subscriber = digits[5:]
    else:
        raise ValidationError('Номер должен начинаться с +375 или 8.')

    if operator not in ALLOWED_OPERATOR_CODES:
        raise ValidationError('Недопустимый код оператора. Разрешены: 17, 25, 29, 33, 44.')
    if len(subscriber) != 7:
        raise ValidationError('Основная часть номера должна содержать ровно 7 цифр.')

    return f'+375{operator}{subscriber}'

def validate_phone(value):
    """
    Валидатор для номера телефона.

    Допускаемые варианты (примеры):
    - +375 (29) 111-22-33
    - +375(29)1112233
    - 8(029) 848 44 03
    - 8029 848-44-03
    """
    # Проверяем нормализацией: она гарантирует 7 цифр основной части
    normalize_phone(value)