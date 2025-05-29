import re
from django.core.exceptions import ValidationError

def validate_phone(value):
    """
    Валидатор для номера телефона в формате +375 (29) XXX-XX-XX.
    """
    pattern = r'^\+375\s\(29\)\s\d{3}-\d{2}-\d{2}$'
    if not re.match(pattern, value):
        raise ValidationError('Phone number must be in format +375 (29) XXX-XX-XX')