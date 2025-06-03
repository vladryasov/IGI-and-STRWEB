from django.urls import path
from . import views
from django.contrib.auth.views import LogoutView
from django.views.generic import RedirectView

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('news/', views.news_list, name='news_list'),
    path('news/<slug:slug>/', views.news_detail, name='news_detail'),
    path('dictionary/', views.dictionary, name='dictionary'),
    path('contacts/', views.contacts, name='contacts'),
    path('privacy/', views.privacy, name='privacy'),
    path('vacancies/', views.vacancies, name='vacancies'),
    path('reviews/', views.reviews, name='reviews'),
    path('promocodes/', views.promocodes, name='promocodes'),
    path('logout/', views.logout_view, name='logout'),
    path('login/', views.user_login, name='login'),
    path('register/', views.register, name='register'),
    path('clients/', views.client_list, name='client_list'),
    path('profile/edit/', views.edit_profile, name='edit_profile'),
    path('profile/delete/', views.delete_profile, name='delete_profile'),
    path('reviews/create/', views.create_review, name='create_review'),  # Новый маршрут
    path('pickup-points/', views.pickup_points_list, name='pickup_points'),
    path('pizzas/filter/', views.filter_pizzas, name='filter_pizzas'),
    path('promo/apply/', views.apply_promo, name='apply_promo'),
    path('statistics/', views.order_statistics, name='order_statistics'),
    path('staff/statistics/', views.staff_statistics, name='staff_statistics'),  # Новый URL для статистики
    # CRUD для категорий
    path('categories/', views.category_list, name='category_list'),
    path('categories/create/', views.category_create, name='category_create'),
    path('categories/<int:pk>/update/', views.category_update, name='category_update'),
    path('categories/<int:pk>/delete/', views.category_delete, name='category_delete'),
    # CRUD для пицц
    path('pizzas/', views.pizza_list, name='pizza_list'),
    path('pizzas/create/', views.pizza_create, name='pizza_create'),
    path('pizza/<int:pizza_id>/', views.pizza_detail, name='pizza_detail'),
    # Корзина и заказы
    path('cart/', views.cart, name='cart'),
    path('cart/add/<int:pizza_id>/', views.add_to_cart, name='add_to_cart'),
    path('cart/update/<int:item_id>/', views.update_cart_item, name='update_cart_item'),
    path('cart/remove/<int:item_id>/', views.remove_from_cart, name='remove_from_cart'),
    path('checkout/', views.checkout, name='checkout'),
    path('order/<int:order_id>/confirmation/', views.order_confirmation, name='order_confirmation'),
    path('orders/history/', views.order_history, name='order_history'),
    path('coupon/apply/', views.apply_coupon, name='apply_coupon'),
]