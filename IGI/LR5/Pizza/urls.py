from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),  # Админка уже настроена
    path('', include('Pizza.pizzeria.urls')),  # Подключаем маршруты приложения pizzeria
]