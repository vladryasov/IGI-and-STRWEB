from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils.text import slugify
from Pizza.pizzeria.models import News, UserProfile
from django.contrib.auth.models import User
import requests
from datetime import datetime
import pytz

class Command(BaseCommand):
    help = 'Загружает новости из News API'

    def handle(self, *args, **options):
        # Получаем или создаем системного пользователя
        user, created = User.objects.get_or_create(
            username='system',
            defaults={
                'email': 'system@example.com',
                'is_staff': True
            }
        )
        
        if created:
            user.set_password(''.join([str(x) for x in range(10)]))  # Случайный пароль
            user.save()
            
        try:
            system_user = user.userprofile
            system_user.role = 'staff'
            system_user.save()
        except UserProfile.DoesNotExist:
            system_user = UserProfile.objects.create(
                user=user,
                role='staff',
                email='system@example.com'
            )

        # Параметры запроса к API
        params = {
            'q': 'пицца OR пиццерия',  # Поиск новостей о пицце на русском
            'apiKey': settings.NEWS_API_KEY,
            'language': 'ru',  # Русский язык
            'pageSize': 2,  # Получаем только 2 новости
            'sortBy': 'publishedAt',
            'searchIn': 'title,description'  # Ищем только в заголовках и описаниях
        }

        try:
            # Делаем запрос к API
            response = requests.get(settings.NEWS_API_URL, params=params)
            response.raise_for_status()  # Проверяем на ошибки
            news_data = response.json()

            for article in news_data.get('articles', []):
                # Создаем уникальный slug из заголовка
                base_slug = slugify(article['title'])
                slug = base_slug
                counter = 1
                
                # Проверяем уникальность slug
                while News.objects.filter(slug=slug).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1

                # Создаем новость только если такого slug еще нет
                if not News.objects.filter(slug=slug).exists():
                    # Загружаем изображение, если оно есть
                    image_url = article.get('urlToImage')
                    image = None
                    if image_url:
                        try:
                            image_response = requests.get(image_url)
                            if image_response.status_code == 200:
                                from django.core.files.base import ContentFile
                                image_name = f"news/{slug}.jpg"
                                image = ContentFile(image_response.content)
                        except Exception as e:
                            self.stdout.write(self.style.WARNING(f'Ошибка при загрузке изображения: {e}'))

                    # Создаем новость
                    news = News(
                        title=article['title'],
                        content=article['description'] or article['content'],
                        author=system_user,
                        slug=slug
                    )
                    
                    # Сохраняем новость
                    news.save()

                    # Если есть изображение, сохраняем его
                    if image:
                        news.image.save(image_name, image, save=True)

                    self.stdout.write(self.style.SUCCESS(f'Создана новость: {news.title}'))

            self.stdout.write(self.style.SUCCESS('Загрузка новостей завершена'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Ошибка при загрузке новостей: {e}')) 