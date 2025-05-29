from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import PizzaCategory, UserProfile, ROLE_CHOICES, Pizza, PizzaSize
from django.core.exceptions import ValidationError
import re

class LoginForm(forms.Form):
    username = forms.CharField(max_length=150)
    password = forms.CharField(widget=forms.PasswordInput)

class RegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    age = forms.IntegerField(required=True, min_value=18, 
                           help_text='Вам должно быть не менее 18 лет')
    phone = forms.CharField(required=True, 
                          help_text='Введите номер телефона в формате +375XXYYYYYYY')

    class Meta:
        model = User
        fields = ('username', 'email', 'phone', 'age', 'password1', 'password2')

    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        if not re.match(r'^\+375(17|25|29|33|44)\d{7}$', phone):
            raise ValidationError(
                'Неверный формат номера телефона. Используйте формат +375XXYYYYYYY, '
                'где XX - код оператора (17, 25, 29, 33, 44)'
            )
        return phone

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        
        if commit:
            user.save()
            # Получаем существующий профиль (он создается автоматически через сигнал)
            user_profile = user.userprofile
            # Обновляем данные профиля
            user_profile.phone = self.cleaned_data['phone']
            user_profile.age = self.cleaned_data['age']
            user_profile.email = self.cleaned_data['email']
            user_profile.save()
        return user

class ProfileEditForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['email', 'phone', 'age']
        help_texts = {
            'phone': 'Введите номер телефона в формате +375XXYYYYYYY',
            'age': 'Вам должно быть не менее 18 лет'
        }

    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        if not re.match(r'^\+375(17|25|29|33|44)\d{7}$', phone):
            raise ValidationError(
                'Неверный формат номера телефона. Используйте формат +375XXYYYYYYY, '
                'где XX - код оператора (17, 25, 29, 33, 44)'
            )
        return phone

class PizzaCategoryForm(forms.ModelForm):
    class Meta:
        model = PizzaCategory
        fields = ['name', 'description']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }

class PizzaForm(forms.ModelForm):
    class Meta:
        model = Pizza
        fields = ['name', 'description', 'base_price', 'categories', 'sizes', 'sauce', 'image']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'base_price': forms.NumberInput(attrs={'class': 'form-control', 'min': '0', 'step': '0.01'}),
            'categories': forms.SelectMultiple(attrs={'class': 'form-control'}),
            'sizes': forms.SelectMultiple(attrs={'class': 'form-control'}),
            'sauce': forms.TextInput(attrs={'class': 'form-control'}),
        }
        help_texts = {
            'base_price': 'Базовая цена для маленького размера',
            'categories': 'Выберите одну или несколько категорий',
            'sizes': 'Выберите доступные размеры',
            'image': 'Загрузите изображение пиццы (необязательно)'
        }