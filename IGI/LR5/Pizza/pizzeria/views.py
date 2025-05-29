from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.forms import AuthenticationForm
from .models import Pizza, Review, PromoCode, Vacancy, UserProfile, PickupPoint, PizzaCategory, Order, OrderItem, Coupon, PizzaSize
from .forms import LoginForm, PizzaCategoryForm, RegistrationForm, ProfileEditForm, PizzaForm
from django.db.models import Q, Sum, Count, Avg
from django.utils import timezone
from decimal import Decimal
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.contrib import messages

# Проверка роли
def get_user_role(user):
    if not user.is_authenticated:
        return 'guest'
    return user.userprofile.role if hasattr(user, 'userprofile') else 'client'

def is_admin(user):
    return user.is_authenticated and get_user_role(user) == 'admin'

def is_staff(user):
    return user.is_authenticated and get_user_role(user) == 'staff'

def is_client(user):
    return user.is_authenticated and get_user_role(user) == 'client'

# Главная страница
def home(request):
    # Получаем все категории с их пиццами
    categories = PizzaCategory.objects.all().prefetch_related('pizza_set')
    # Получаем пиццы без категории (если такие есть)
    pizzas_without_category = Pizza.objects.filter(categories=None)
    
    context = {
        'categories': categories,
        'pizzas_without_category': pizzas_without_category
    }
    return render(request, 'pizzeria/home.html', {'context': context})

def about(request):
    return render(request, 'pizzeria/about.html')

def news_list(request):
    return render(request, 'pizzeria/news_list.html')

def dictionary(request):
    return render(request, 'pizzeria/dictionary.html')

def contacts(request):
    return render(request, 'pizzeria/contacts.html')

def privacy(request):
    return render(request, 'pizzeria/privacy.html')

def vacancies(request):
    vacancies = Vacancy.objects.all().order_by('-created_at')
    return render(request, 'pizzeria/vacancies.html', {'vacancies': vacancies})

def reviews(request):
    reviews = Review.objects.all()
    can_create_review = False
    if request.user.is_authenticated and hasattr(request.user, 'userprofile'):
        role = request.user.userprofile.role
        can_create_review = role in ['client', 'staff', 'admin']
    context = {'reviews': reviews, 'can_create_review': can_create_review}
    return render(request, 'pizzeria/reviews.html', context)

def promocodes(request):
    active_promos = PromoCode.objects.filter(is_active=True)
    archived_promos = PromoCode.objects.filter(is_active=False)
    return render(request, 'pizzeria/promocodes.html', {'active_promos': active_promos, 'archived_promos': archived_promos})

def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Регистрация успешна!')
            return redirect('home')
    else:
        form = RegistrationForm()
    return render(request, 'pizzeria/register.html', {'form': form})

def user_login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, 'Вы успешно вошли в систему!')
                return redirect('home')
            else:
                messages.error(request, 'Неверное имя пользователя или пароль')
    else:
        form = LoginForm()
    return render(request, 'pizzeria/login.html', {'form': form})

def logout_view(request):
    logout(request)
    messages.success(request, 'Вы успешно вышли из системы')
    return redirect('home')

@user_passes_test(lambda u: is_staff(u) or is_admin(u))
def client_list(request):
    clients = UserProfile.objects.filter(role='client')
    return render(request, 'pizzeria/client_list.html', {'clients': clients})

@login_required
def edit_profile(request):
    profile = request.user.userprofile
    if request.method == 'POST':
        form = ProfileEditForm(request.POST, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Профиль успешно обновлен!')
            return redirect('edit_profile')
    else:
        form = ProfileEditForm(instance=profile)
    
    # Получаем все заказы пользователя, кроме корзины
    orders = Order.objects.filter(
        customer=profile
    ).exclude(
        status='cart'
    ).order_by('-order_date')
    
    return render(request, 'pizzeria/edit_profile.html', {
        'form': form,
        'orders': orders
    })

@login_required
def delete_profile(request):
    if request.method == 'POST':
        user = request.user
        user.delete()
        messages.success(request, 'Ваш профиль был успешно удален')
        return redirect('home')
    return render(request, 'pizzeria/delete_profile.html')

@login_required
def create_review(request):
    if request.method == 'POST':
        if is_client(request.user) or is_staff(request.user) or is_admin(request.user):
            try:
                rating = int(request.POST.get('rating'))
                text = request.POST.get('text')
                if not (1 <= rating <= 5):
                    return render(request, 'pizzeria/create_review.html', {'error': 'Rating must be between 1 and 5.'})
                if not text:
                    return render(request, 'pizzeria/create_review.html', {'error': 'Review text cannot be empty.'})
                # Получаем Customer через UserProfile
                customer = request.user.userprofile.customer_profile
                if customer:
                    Review.objects.create(customer=customer, rating=rating, text=text)
                    return redirect('reviews')
                else:
                    return render(request, 'pizzeria/create_review.html', {'error': 'No customer profile found. Please contact support.'})
            except ValueError:
                return render(request, 'pizzeria/create_review.html', {'error': 'Invalid rating value.'})
            except AttributeError:
                return render(request, 'pizzeria/create_review.html', {'error': 'Customer profile not linked. Please contact support.'})
        return render(request, 'pizzeria/create_review.html', {'error': 'Only clients, staff, and admins can create reviews.'})
    return render(request, 'pizzeria/create_review.html')

@login_required
def pickup_points_list(request):
    points = PickupPoint.objects.filter(is_active=True)
    return render(request, 'pizzeria/pickup_points.html', {'points': points})

def filter_pizzas(request):
    pizzas = Pizza.objects.all()
    
    # Фильтрация по категории
    category = request.GET.get('category')
    if category:
        pizzas = pizzas.filter(categories__name=category)
    
    # Фильтрация по цене
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    if min_price:
        pizzas = pizzas.filter(base_price__gte=min_price)
    if max_price:
        pizzas = pizzas.filter(base_price__lte=max_price)
    
    # Фильтрация по соусу
    sauce = request.GET.get('sauce')
    if sauce:
        pizzas = pizzas.filter(sauce=sauce)
    
    # Сортировка
    sort = request.GET.get('sort')
    if sort == 'price_asc':
        pizzas = pizzas.order_by('base_price')
    elif sort == 'price_desc':
        pizzas = pizzas.order_by('-base_price')
    elif sort == 'name':
        pizzas = pizzas.order_by('name')
    
    # Пагинация
    paginator = Paginator(pizzas, 12)
    page = request.GET.get('page')
    pizzas = paginator.get_page(page)
    
    return render(request, 'pizzeria/pizza_list.html', {
        'pizzas': pizzas,
        'categories': PizzaCategory.objects.all()
    })

@login_required
def apply_promo(request):
    if request.method == 'POST':
        code = request.POST.get('promo_code')
        try:
            promo = PromoCode.objects.get(
                code=code,
                is_active=True,
                expiry_date__gte=timezone.now().date()
            )
            order = Order.objects.get(customer=request.user.userprofile, status='cart')
            order.promo_code = promo
            order.save()
            order.calculate_total()
            messages.success(request, 'Промокод успешно применен!')
        except PromoCode.DoesNotExist:
            messages.error(request, 'Недействительный промокод')
        except Order.DoesNotExist:
            messages.error(request, 'Корзина пуста')
    return redirect('cart')

@login_required
def order_statistics(request):
    if not request.user.userprofile.role in ['staff', 'admin']:
        return redirect('home')
    
    # Общая статистика
    total_orders = Order.objects.count()
    total_revenue = Order.objects.aggregate(Sum('total_price'))['total_price__sum'] or 0
    avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    # Популярные пиццы
    popular_pizzas = OrderItem.objects.values('pizza__name')\
        .annotate(total_ordered=Count('id'))\
        .order_by('-total_ordered')[:5]
    
    # Статистика по курьерам
    courier_stats = Order.objects.values('courier__user_profile__user__username')\
        .annotate(
            total_orders=Count('id'),
            total_earnings=Sum('total_price')
        ).order_by('-total_orders')
    
    # Статистика по клиентам
    customer_stats = Order.objects.values('customer__user_profile__user__username')\
        .annotate(
            total_orders=Count('id'),
            total_spent=Sum('total_price')
        ).order_by('-total_orders')
    
    return render(request, 'pizzeria/statistics.html', {
        'total_orders': total_orders,
        'total_revenue': total_revenue,
        'avg_order_value': avg_order_value,
        'popular_pizzas': popular_pizzas,
        'courier_stats': courier_stats,
        'customer_stats': customer_stats
    })

# CRUD для Категорий Пиццы
@user_passes_test(lambda u: is_staff(u) or is_admin(u))
def category_list(request):
    categories = PizzaCategory.objects.all()
    return render(request, 'pizzeria/category_list.html', {'categories': categories})

@user_passes_test(lambda u: is_staff(u) or is_admin(u))
def category_create(request):
    if request.method == 'POST':
        form = PizzaCategoryForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Категория успешно создана!')
            return redirect('category_list')
    else:
        form = PizzaCategoryForm()
    return render(request, 'pizzeria/category_form.html', {'form': form, 'action': 'Создать'})

@user_passes_test(lambda u: is_staff(u) or is_admin(u))
def category_update(request, pk):
    category = get_object_or_404(PizzaCategory, pk=pk)
    if request.method == 'POST':
        form = PizzaCategoryForm(request.POST, instance=category)
        if form.is_valid():
            form.save()
            messages.success(request, 'Категория успешно обновлена!')
            return redirect('category_list')
    else:
        form = PizzaCategoryForm(instance=category)
    return render(request, 'pizzeria/category_form.html', {'form': form, 'action': 'Обновить'})

@user_passes_test(lambda u: is_staff(u) or is_admin(u))
def category_delete(request, pk):
    category = get_object_or_404(PizzaCategory, pk=pk)
    if request.method == 'POST':
        category.delete()
        messages.success(request, 'Категория успешно удалена!')
        return redirect('category_list')
    return render(request, 'pizzeria/category_confirm_delete.html', {'category': category})

def pizza_list(request):
    pizzas = Pizza.objects.all()
    categories = PizzaCategory.objects.all()
    
    # Фильтрация по категориям
    category = request.GET.get('category')
    if category:
        pizzas = pizzas.filter(categories__name=category)
    
    # Фильтрация по цене
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    if min_price:
        pizzas = pizzas.filter(base_price__gte=min_price)
    if max_price:
        pizzas = pizzas.filter(base_price__lte=max_price)
    
    # Поиск по названию
    search_query = request.GET.get('search')
    if search_query:
        pizzas = pizzas.filter(
            Q(name__icontains=search_query) |
            Q(description__icontains=search_query)
        )
    
    # Сортировка
    sort = request.GET.get('sort')
    if sort == 'price_asc':
        pizzas = pizzas.order_by('base_price')
    elif sort == 'price_desc':
        pizzas = pizzas.order_by('-base_price')
    elif sort == 'name':
        pizzas = pizzas.order_by('name')
    
    context = {
        'pizzas': pizzas,
        'categories': categories,
        'current_category': category,
        'min_price': min_price,
        'max_price': max_price,
        'search_query': search_query,
        'sort': sort
    }
    return render(request, 'pizzeria/pizza_list.html', context)

def pizza_detail(request, pizza_id):
    pizza = get_object_or_404(Pizza, id=pizza_id)
    reviews = Review.objects.filter(pizza=pizza).order_by('-created_at')
    avg_rating = reviews.aggregate(Avg('rating'))['rating__avg']
    
    if request.method == 'POST' and request.user.is_authenticated:
        rating = request.POST.get('rating')
        text = request.POST.get('text')
        if rating and text:
            Review.objects.create(
                customer=request.user.userprofile,
                pizza=pizza,
                rating=rating,
                text=text
            )
            return redirect('pizza_detail', pizza_id=pizza_id)
    
    context = {
        'pizza': pizza,
        'reviews': reviews,
        'avg_rating': avg_rating
    }
    return render(request, 'pizzeria/pizza_detail.html', context)

@login_required
def add_to_cart(request, pizza_id):
    pizza = get_object_or_404(Pizza, id=pizza_id)
    size = request.POST.get('size')
    quantity = int(request.POST.get('quantity', 1))
    
    # Проверяем, что размер указан
    if not size:
        messages.error(request, 'Пожалуйста, выберите размер пиццы')
        return redirect('pizza_detail', pizza_id=pizza_id)
    
    # Получаем объект размера
    try:
        size_obj = PizzaSize.objects.get(id=size)
    except PizzaSize.DoesNotExist:
        messages.error(request, 'Выбран недопустимый размер пиццы')
        return redirect('pizza_detail', pizza_id=pizza_id)
    
    # Получаем или создаем заказ в статусе "корзина"
    order, created = Order.objects.get_or_create(
        customer=request.user.userprofile,
        status='cart'
    )
    
    # Добавляем пиццу в заказ
    order_item, created = OrderItem.objects.get_or_create(
        order=order,
        pizza=pizza,
        size=size_obj,
        defaults={'quantity': quantity, 'price': pizza.base_price}
    )
    
    if not created:
        order_item.quantity += quantity
        order_item.save()
    
    order.calculate_total()
    messages.success(request, 'Пицца добавлена в корзину!')
    return redirect('cart')

@login_required
def cart(request):
    try:
        order = Order.objects.get(customer=request.user.userprofile, status='cart')
        items = order.orderitem_set.all()
    except Order.DoesNotExist:
        order = None
        items = []
    
    context = {
        'order': order,
        'items': items
    }
    return render(request, 'pizzeria/cart.html', context)

@login_required
def checkout(request):
    try:
        order = Order.objects.get(customer=request.user.userprofile, status='cart')
        if order.orderitem_set.exists():
            order.status = 'confirmed'
            order.save()
            messages.success(request, 'Заказ успешно оформлен! Спасибо за покупку!')
        else:
            messages.error(request, 'Ваша корзина пуста')
    except Order.DoesNotExist:
        messages.error(request, 'Заказ не найден')
    
    return redirect('edit_profile')

def order_confirmation(request, order_id):
    order = get_object_or_404(Order, id=order_id, customer=request.user.userprofile)
    return render(request, 'pizzeria/order_confirmation.html', {'order': order})

def apply_coupon(request):
    if request.method == 'POST':
        code = request.POST.get('coupon_code')
        try:
            coupon = Coupon.objects.get(
                code=code,
                is_active=True,
                expiry_date__gte=timezone.now().date(),
                used=False
            )
            order = Order.objects.get(customer=request.user.userprofile, status='cart')
            order.coupon = coupon
            order.save()
            order.calculate_total()
            messages.success(request, 'Купон успешно применен!')
        except Coupon.DoesNotExist:
            messages.error(request, 'Недействительный купон')
        except Order.DoesNotExist:
            messages.error(request, 'Корзина пуста')
    return redirect('cart')

@login_required
def order_history(request):
    orders = Order.objects.filter(
        customer=request.user.userprofile
    ).exclude(
        status='cart'
    ).order_by('-order_date')
    return render(request, 'pizzeria/order_history.html', {'orders': orders})

@user_passes_test(lambda u: is_staff(u) or is_admin(u))
def pizza_create(request):
    if request.method == 'POST':
        form = PizzaForm(request.POST, request.FILES)
        if form.is_valid():
            pizza = form.save()
            messages.success(request, 'Пицца успешно создана!')
            return redirect('home')
    else:
        form = PizzaForm()
    return render(request, 'pizzeria/pizza_form.html', {'form': form, 'action': 'Создать'})

@login_required
def update_cart_item(request, item_id):
    item = get_object_or_404(OrderItem, id=item_id, order__customer=request.user.userprofile)
    if request.method == 'POST':
        quantity = int(request.POST.get('quantity', 1))
        if quantity > 0:
            item.quantity = quantity
            item.save()
            item.order.calculate_total()
            messages.success(request, 'Количество успешно обновлено')
        else:
            messages.error(request, 'Количество должно быть больше 0')
    return redirect('cart')

@login_required
def remove_from_cart(request, item_id):
    item = get_object_or_404(OrderItem, id=item_id, order__customer=request.user.userprofile)
    if request.method == 'POST':
        order = item.order
        item.delete()
        order.calculate_total()
        messages.success(request, 'Товар удален из корзины')
    return redirect('cart')