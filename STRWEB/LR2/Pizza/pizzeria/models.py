import re
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import MinValueValidator
from .validators import validate_phone
from django.db.models.signals import post_save
from django.core.exceptions import ValidationError
from django.dispatch import receiver
from decimal import Decimal
from django.utils.text import slugify
from datetime import date

# Валидатор телефона
def validate_phone(value):
    pattern = r'^\+375(17|25|29|33|44)\d{7}$'
    if not re.match(pattern, value):
        raise ValidationError('Номер телефона должен быть в формате +375XXYYYYYYY')

# Роли пользователя
ROLE_CHOICES = (
    ('client', 'Client'),
    ('staff', 'Staff'),
    ('admin', 'Admin'),
)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    phone = models.CharField(max_length=17, validators=[validate_phone], blank=True, null=True, verbose_name='Телефон')
    email = models.EmailField(blank=True, null=True)
    birth_date = models.DateField(verbose_name='Дата рождения', null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.user.username} ({self.role})"

    @property
    def age(self):
        if self.birth_date:
            today = date.today()
            return today.year - self.birth_date.year - ((today.month, today.day) < (self.birth_date.month, self.birth_date.day))
        return None

# Сигнал для автоматического создания UserProfile
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(
            user=instance,
            role='client',
            email=instance.email
        )

# Категория пиццы
class PizzaCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

# Размер пиццы
class PizzaSize(models.Model):
    name = models.CharField(max_length=50, unique=True)  # S, M, L
    price_multiplier = models.FloatField(default=1.0)  # Множитель цены

    def __str__(self):
        return self.name

# Пицца
class Pizza(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    base_price = models.DecimalField(max_digits=6, decimal_places=2)
    categories = models.ManyToManyField(PizzaCategory)
    sizes = models.ManyToManyField(PizzaSize)
    sauce = models.CharField(max_length=50, default="Tomato")
    image = models.ImageField(upload_to='pizzas/', blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Courier(models.Model):
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='courier_profile')
    total_orders = models.IntegerField(default=0)
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return self.user_profile.user.username

# Заказ
class Order(models.Model):
    customer = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    courier = models.ForeignKey(Courier, on_delete=models.SET_NULL, null=True, blank=True)
    pizzas = models.ManyToManyField(Pizza, through='OrderItem')
    total_price = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    order_date = models.DateTimeField(default=timezone.now)
    delivery_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default="cart")
    pickup_point = models.ForeignKey('PickupPoint', on_delete=models.SET_NULL, null=True, blank=True)
    is_delivery = models.BooleanField(default=True)
    delivery_address = models.CharField(max_length=255, blank=True, null=True)
    promo_code = models.ForeignKey('PromoCode', on_delete=models.SET_NULL, null=True, blank=True)
    coupon = models.ForeignKey('Coupon', on_delete=models.SET_NULL, null=True, blank=True)
    payment_status = models.CharField(max_length=20, default="Pending")
    payment_method = models.CharField(max_length=20, default="Cash")
    special_instructions = models.TextField(blank=True)

    def __str__(self):
        return f"Order #{self.id} by {self.customer}"

    def calculate_total(self):
        # Инициализируем total как Decimal
        total = Decimal('0.00')
        
        # Суммируем все элементы заказа
        for item in self.orderitem_set.all():
            total += item.price * Decimal(str(item.quantity))
        
        # Применяем скидки только если есть товары в заказе
        if total > 0:
            if self.promo_code and self.promo_code.is_active:
                discount = Decimal(str(self.promo_code.discount))
                total = total * (Decimal('1.0') - discount)
            
            if self.coupon and self.coupon.is_active and not self.coupon.used:
                discount = Decimal(str(self.coupon.discount))
                total = total * (Decimal('1.0') - discount)
                
                if self.coupon.one_time_use:
                    self.coupon.used = True
                    self.coupon.save()
        
        self.total_price = total.quantize(Decimal('0.01'))
        self.save()
        return self.total_price

# Элемент заказа
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    pizza = models.ForeignKey(Pizza, on_delete=models.CASCADE)
    size = models.ForeignKey(PizzaSize, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.pizza.name} ({self.size.name})"

# Промокод
class PromoCode(models.Model):
    code = models.CharField(max_length=20, unique=True)
    discount = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('0.10'))
    is_active = models.BooleanField(default=True)
    expiry_date = models.DateField()

    def __str__(self):
        return self.code

    def clean(self):
        if self.discount < Decimal('0.0') or self.discount > Decimal('1.0'):
            raise ValidationError('Скидка должна быть между 0 и 1 (0% - 100%)')

# Отзыв
class Review(models.Model):
    customer = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    pizza = models.ForeignKey(Pizza, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    text = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Review by {self.customer} for {self.pizza.name if self.pizza else 'Unknown'} (Rating: {self.rating})"

# Вакансия
class Vacancy(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

# Точка самовывоза
class PickupPoint(models.Model):
    address = models.CharField(max_length=255)
    working_hours = models.CharField(max_length=100)
    phone = models.CharField(max_length=17, validators=[validate_phone])
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.address}"

# Купон
class Coupon(models.Model):
    code = models.CharField(max_length=20, unique=True)
    discount = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('0.15'))
    is_physical = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    expiry_date = models.DateField()
    one_time_use = models.BooleanField(default=True)
    used = models.BooleanField(default=False)

    def __str__(self):
        return self.code

    def clean(self):
        if self.discount < Decimal('0.0') or self.discount > Decimal('1.0'):
            raise ValidationError('Скидка должна быть между 0 и 1 (0% - 100%)')

# Статистика заказов
class OrderStatistics(models.Model):
    date = models.DateField(unique=True)
    total_orders = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    average_order_value = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    most_popular_pizza = models.ForeignKey(Pizza, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Statistics for {self.date}"

# Контакты
class Contact(models.Model):
    address = models.CharField(max_length=255, verbose_name='Адрес')
    phone = models.CharField(max_length=17, validators=[validate_phone], verbose_name='Телефон')
    email = models.EmailField(verbose_name='Email')
    working_hours = models.CharField(max_length=100, verbose_name='Часы работы')
    map_link = models.URLField(verbose_name='Ссылка на карту', blank=True, null=True)
    is_main = models.BooleanField(default=False, verbose_name='Основной офис')
    image = models.ImageField(upload_to='contacts/', blank=True, null=True, verbose_name='Изображение')
    
    class Meta:
        verbose_name = 'Контакт'
        verbose_name_plural = 'Контакты'
    
    def __str__(self):
        return f"{self.address} ({self.phone})"
    
    def save(self, *args, **kwargs):
        if self.is_main:
            # Если этот контакт помечен как основной, снимаем отметку с других
            Contact.objects.filter(is_main=True).update(is_main=False)
        super().save(*args, **kwargs)

# Новости
class News(models.Model):
    title = models.CharField(max_length=200, verbose_name='Заголовок')
    content = models.TextField(verbose_name='Содержание')
    image = models.ImageField(upload_to='news/', blank=True, null=True, verbose_name='Изображение')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Дата создания')
    is_published = models.BooleanField(default=True, verbose_name='Опубликовано')
    author = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, verbose_name='Автор')
    slug = models.SlugField(unique=True, blank=True, verbose_name='URL')
    
    class Meta:
        verbose_name = 'Новость'
        verbose_name_plural = 'Новости'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            # Генерируем базовый slug из заголовка
            base_slug = slugify(self.title)
            
            # Проверяем уникальность slug
            unique_slug = base_slug
            counter = 1
            
            while News.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            
            self.slug = unique_slug
        
        super().save(*args, **kwargs)

# Партнеры
class Partner(models.Model):
    name = models.CharField(max_length=200, verbose_name='Название компании')
    logo = models.ImageField(upload_to='partners/', verbose_name='Логотип')
    website_url = models.URLField(verbose_name='Ссылка на сайт')
    description = models.TextField(blank=True, verbose_name='Описание')
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Дата добавления')
    
    class Meta:
        verbose_name = 'Партнер'
        verbose_name_plural = 'Партнеры'
        ordering = ['name']
    
    def __str__(self):
        return self.name

# Словарь терминов
class DictionaryTerm(models.Model):
    question = models.CharField(max_length=300, verbose_name='Вопрос')
    answer = models.TextField(verbose_name='Ответ')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Дата добавления')
    is_published = models.BooleanField(default=True, verbose_name='Опубликовано')
    
    class Meta:
        verbose_name = 'Термин словаря'
        verbose_name_plural = 'Словарь терминов'
        ordering = ['question']
    
    def __str__(self):
        return self.question

# Информация о компании
class CompanyInfo(models.Model):
    title = models.CharField(max_length=200, verbose_name='Заголовок')
    content = models.TextField(verbose_name='Содержание')
    video_url = models.URLField(blank=True, null=True, verbose_name='Ссылка на видео')
    logo = models.ImageField(upload_to='company/', blank=True, null=True, verbose_name='Логотип компании')
    requisites = models.TextField(blank=True, verbose_name='Реквизиты')
    certificate_text = models.TextField(blank=True, verbose_name='Текст сертификата')
    created_at = models.DateTimeField(default=timezone.now, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        verbose_name = 'Информация о компании'
        verbose_name_plural = 'Информация о компании'
    
    def __str__(self):
        return self.title

# История компании по годам
class CompanyHistory(models.Model):
    year = models.IntegerField(verbose_name='Год')
    event = models.TextField(verbose_name='Событие')
    company_info = models.ForeignKey(CompanyInfo, on_delete=models.CASCADE, related_name='history')
    
    class Meta:
        verbose_name = 'История компании'
        verbose_name_plural = 'История компании'
        ordering = ['year']
    
    def __str__(self):
        return f"{self.year}: {self.event[:50]}..."

# Сотрудники
class Employee(models.Model):
    name = models.CharField(max_length=100, verbose_name='Имя')
    position = models.CharField(max_length=100, verbose_name='Должность')
    photo = models.ImageField(upload_to='employees/', verbose_name='Фото')
    phone = models.CharField(max_length=17, validators=[validate_phone], verbose_name='Телефон')
    email = models.EmailField(verbose_name='Email')
    description = models.TextField(verbose_name='Описание работы')
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    
    class Meta:
        verbose_name = 'Сотрудник'
        verbose_name_plural = 'Сотрудники'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} - {self.position}"