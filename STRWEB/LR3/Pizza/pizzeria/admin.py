from django.contrib import admin
from django import forms
from .models import PizzaCategory, PizzaSize, Pizza, Courier, Order, OrderItem, PromoCode, Review, Vacancy, UserProfile, PickupPoint, Coupon, OrderStatistics, Contact, News, Partner, DictionaryTerm, CompanyInfo, CompanyHistory, Employee
from .validators import normalize_phone


class PhoneNormalizeModelForm(forms.ModelForm):
    """
    Базовая ModelForm, которая позволяет вводить телефон в «красивом» формате,
    но сохраняет в БД канонический вид +375XXYYYYYYY (7 цифр основной части).
    """
    phone = forms.CharField(required=False, max_length=32)

    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        if not phone:
            return phone
        return normalize_phone(phone)


class UserProfileAdminForm(PhoneNormalizeModelForm):
    class Meta:
        model = UserProfile
        fields = '__all__'


class EmployeeAdminForm(PhoneNormalizeModelForm):
    class Meta:
        model = Employee
        fields = '__all__'

class ContactAdminForm(PhoneNormalizeModelForm):
    class Meta:
        model = Contact
        fields = '__all__'


class PickupPointAdminForm(PhoneNormalizeModelForm):
    class Meta:
        model = PickupPoint
        fields = '__all__'

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    form = UserProfileAdminForm
    list_display = ('user', 'role', 'phone', 'email', 'age')
    list_filter = ('role',)
    search_fields = ('user__username', 'phone', 'email')

@admin.register(PizzaCategory)
class PizzaCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(PizzaSize)
class PizzaSizeAdmin(admin.ModelAdmin):
    list_display = ('name', 'price_multiplier')

@admin.register(Pizza)
class PizzaAdmin(admin.ModelAdmin):
    list_display = ('name', 'base_price', 'sauce')
    list_filter = ('categories', 'sauce')
    search_fields = ('name', 'description')

@admin.register(Courier)
class CourierAdmin(admin.ModelAdmin):
    list_display = ('user_profile', 'total_orders', 'total_earnings')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'courier', 'total_price', 'status', 'order_date')
    list_filter = ('status', 'payment_status', 'is_delivery')
    search_fields = ('customer__user__username', 'delivery_address')

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'pizza', 'size', 'quantity', 'price')

@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount', 'is_active', 'expiry_date')
    list_filter = ('is_active',)
    search_fields = ('code',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('customer', 'rating', 'created_at')
    list_filter = ('rating',)

@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    search_fields = ('title', 'description')

@admin.register(PickupPoint)
class PickupPointAdmin(admin.ModelAdmin):
    form = PickupPointAdminForm
    list_display = ('address', 'working_hours', 'phone', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('address', 'phone')

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount', 'is_active', 'expiry_date', 'used')
    list_filter = ('is_active', 'is_physical', 'used')
    search_fields = ('code',)

@admin.register(OrderStatistics)
class OrderStatisticsAdmin(admin.ModelAdmin):
    list_display = ('date', 'total_orders', 'total_revenue', 'average_order_value', 'most_popular_pizza')
    list_filter = ('date',)

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    form = ContactAdminForm
    list_display = ('address', 'phone', 'email', 'working_hours', 'is_main')
    list_filter = ('is_main',)
    search_fields = ('address', 'phone', 'email')
    ordering = ('-is_main', 'address')

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_at', 'is_published')
    list_filter = ('is_published', 'created_at')
    search_fields = ('title', 'content')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('-created_at',)

@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ('name', 'website_url', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)

@admin.register(DictionaryTerm)
class DictionaryTermAdmin(admin.ModelAdmin):
    list_display = ('question', 'created_at', 'is_published')
    list_filter = ('is_published', 'created_at')
    search_fields = ('question', 'answer')
    ordering = ('question',)

@admin.register(CompanyInfo)
class CompanyInfoAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at', 'updated_at')
    search_fields = ('title', 'content')
    ordering = ('-created_at',)

@admin.register(CompanyHistory)
class CompanyHistoryAdmin(admin.ModelAdmin):
    list_display = ('year', 'event', 'company_info')
    list_filter = ('year',)
    search_fields = ('event',)
    ordering = ('year',)

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    form = EmployeeAdminForm
    list_display = ('name', 'position', 'phone', 'email', 'is_active')
    list_filter = ('is_active', 'position')
    search_fields = ('name', 'position', 'email')
    ordering = ('name',)