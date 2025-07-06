#!/bin/bash

# Загружаем свежие новости
python manage.py fetch_news

# Запускаем сервер
python manage.py runserver 