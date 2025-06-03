from django.contrib import admin
from .models import PizzaCategory, PizzaSize, Pizza, Courier, Order, OrderItem, PromoCode, Review, Vacancy, UserProfile, PickupPoint, Coupon, OrderStatistics, Contact, News

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
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