from django.core.management.base import BaseCommand
from django.utils.text import slugify
from Pizza.pizzeria.models import News

class Command(BaseCommand):
    help = 'Исправляет пустые slug в новостях'

    def handle(self, *args, **options):
        # Получаем все новости с пустыми slug
        news_without_slug = News.objects.filter(slug='')
        
        if not news_without_slug.exists():
            self.stdout.write(self.style.SUCCESS('Все новости имеют корректные slug'))
            return
        
        for news in news_without_slug:
            # Генерируем базовый slug из заголовка
            base_slug = slugify(news.title)
            
            # Проверяем уникальность slug
            unique_slug = base_slug
            counter = 1
            
            while News.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            
            news.slug = unique_slug
            news.save()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Исправлен slug для новости "{news.title}": {news.slug}'
                )
            )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Исправлено {news_without_slug.count()} новостей'
            )
        ) 