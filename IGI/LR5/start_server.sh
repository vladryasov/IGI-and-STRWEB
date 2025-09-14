#!/bin/bash

# Активируем виртуальное окружение
source venv/bin/activate

# Загружаем свежие новости
python manage.py fetch_news

# Запускаем сервер
python manage.py runserver 