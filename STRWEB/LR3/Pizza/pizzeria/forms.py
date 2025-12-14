from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import PizzaCategory, UserProfile, ROLE_CHOICES, Pizza, PizzaSize
from django.core.exceptions import ValidationError
import re
from datetime import date
from .validators import normalize_phone

class LoginForm(forms.Form):
    username = forms.CharField(max_length=150)
    password = forms.CharField(widget=forms.PasswordInput)

class RegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    birth_date = forms.DateField(
        required=True,
        widget=forms.DateInput(attrs={'type': 'date'}),
        help_text='Вам должно быть не менее 18 лет'
    )
    phone = forms.CharField(
        required=True,
        max_length=32,
        help_text='Можно вводить +375 (29) 111-22-33 или 8(029) 848 44 03 (будет сохранено как +375XXYYYYYYY)'
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'phone', 'birth_date', 'password1', 'password2')

    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        if not phone:
            return phone
        return normalize_phone(phone)

    def clean_birth_date(self):
        birth_date = self.cleaned_data.get('birth_date')
        if birth_date:
            today = date.today()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            if age < 18:
                raise ValidationError('Вам должно быть не менее 18 лет')
        return birth_date

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        
        if commit:
            user.save()
            # Получаем существующий профиль (он создается автоматически через сигнал)
            user_profile = user.userprofile
            # Обновляем данные профиля
            user_profile.phone = self.cleaned_data['phone']
            user_profile.birth_date = self.cleaned_data['birth_date']
            user_profile.email = self.cleaned_data['email']
            user_profile.save()
        return user

class ProfileEditForm(forms.ModelForm):
    phone = forms.CharField(
        required=False,
        max_length=32,
        help_text='Можно вводить +375 (29) 111-22-33 или 8(029) 848 44 03 (будет сохранено как +375XXYYYYYYY)'
    )

    class Meta:
        model = UserProfile
        fields = ['email', 'phone', 'birth_date']
        widgets = {
            'birth_date': forms.DateInput(attrs={'type': 'date'})
        }
        help_texts = {
            'phone': 'Введите номер телефона в формате +375XXYYYYYYY',
            'birth_date': 'Вам должно быть не менее 18 лет'
        }

    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        if not phone:
            return phone
        return normalize_phone(phone)

    def clean_birth_date(self):
        birth_date = self.cleaned_data.get('birth_date')
        if birth_date:
            today = date.today()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            if age < 18:
                raise ValidationError('Вам должно быть не менее 18 лет')
        return birth_date

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