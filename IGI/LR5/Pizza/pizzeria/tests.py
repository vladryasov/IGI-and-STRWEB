from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal
from .models import (
    Pizza, PizzaCategory, UserProfile, Review,
    PromoCode, Order, OrderItem, PizzaSize
)
from .forms import RegistrationForm, PizzaCategoryForm, ProfileEditForm

class ModelTests(TestCase):
    def setUp(self):
        # Создаем тестового пользователя
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        # Получаем автоматически созданный профиль и обновляем его
        self.profile = UserProfile.objects.get(user=self.user)
        self.profile.phone = '+375291234567'
        self.profile.age = 25
        self.profile.save()
        
        # Создаем категорию пиццы
        self.category = PizzaCategory.objects.create(
            name='Тестовая категория',
            description='Описание тестовой категории'
        )
        
        # Создаем пиццу
        self.pizza = Pizza.objects.create(
            name='Тестовая пицца',
            description='Описание тестовой пиццы',
            base_price=Decimal('10.00')
        )
        self.pizza.categories.add(self.category)
        
        # Создаем размер пиццы
        self.size = PizzaSize.objects.create(
            name='Средняя',
            price_multiplier=1.0
        )

    def test_pizza_creation(self):
        """Тест создания пиццы"""
        self.assertEqual(self.pizza.name, 'Тестовая пицца')
        self.assertEqual(self.pizza.base_price, Decimal('10.00'))
        self.assertTrue(self.pizza.categories.filter(id=self.category.id).exists())

    def test_user_profile_creation(self):
        """Тест создания профиля пользователя"""
        self.assertEqual(self.profile.user.username, 'testuser')
        self.assertEqual(self.profile.role, 'client')
        self.assertEqual(self.profile.phone, '+375291234567')
        self.assertEqual(self.profile.age, 25)

    def test_order_creation(self):
        """Тест создания заказа"""
        order = Order.objects.create(
            customer=self.profile,
            status='cart',
            total_price=Decimal('0.00')
        )
        
        order_item = OrderItem.objects.create(
            order=order,
            pizza=self.pizza,
            size=self.size,
            quantity=2,
            price=self.pizza.base_price
        )
        
        self.assertEqual(order.status, 'cart')
        self.assertEqual(order_item.quantity, 2)

class ViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        # Получаем автоматически созданный профиль и обновляем его
        self.profile = UserProfile.objects.get(user=self.user)
        self.profile.phone = '+375291234567'
        self.profile.age = 25
        self.profile.save()

    def test_home_view(self):
        """Тест главной страницы"""
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'pizzeria/home.html')

    def test_login_view(self):
        """Тест страницы входа"""
        response = self.client.get(reverse('login'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'pizzeria/login.html')

    def test_protected_view_redirect(self):
        """Тест редиректа для защищенных страниц"""
        response = self.client.get(reverse('edit_profile'))
        self.assertEqual(response.status_code, 302)
        self.assertTrue(response.url.startswith('/login/'))

    def test_authenticated_access(self):
        """Тест доступа аутентифицированного пользователя"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('edit_profile'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'pizzeria/edit_profile.html')

class FormTests(TestCase):
    def test_registration_form_valid(self):
        """Тест валидной формы регистрации"""
        form_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password1': 'complex_password123',
            'password2': 'complex_password123',
            'phone': '+375291234567',
            'age': 25
        }
        form = RegistrationForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_registration_form_invalid(self):
        """Тест невалидной формы регистрации"""
        form_data = {
            'username': 'newuser',
            'email': 'invalid_email',
            'password1': 'pass',
            'password2': 'different_pass',
        }
        form = RegistrationForm(data=form_data)
        self.assertFalse(form.is_valid())

    def test_category_form_valid(self):
        """Тест валидной формы категории"""
        form_data = {
            'name': 'Новая категория',
            'description': 'Описание новой категории'
        }
        form = PizzaCategoryForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_category_form_invalid(self):
        """Тест невалидной формы категории"""
        form_data = {
            'name': '',  # Пустое имя
            'description': 'Только описание'
        }
        form = PizzaCategoryForm(data=form_data)
        self.assertFalse(form.is_valid())
