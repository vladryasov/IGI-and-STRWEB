from math import factorial, prod, pi
from functools import wraps

# Memoization decorator to optimize repeated calculations
def memorize(func):
    cache = {}  # Cache to store previously computed results
    @wraps(func)
    def wrapper(*args):

        if args in cache:

            return cache[args]
            # Return cached result if available
        result = func(*args)  # Otherwise, call the original function
        cache[args] = result
        # Store the result in the cache
        return result
    return wrapper


@memorize
def calculate (x, eps):

    if abs(x) == 1:
        return 0.0 if x == 1 else pi, 1

    # Initialize variables
    result = pi / 2  # arccos(x) = pi/2 - arcsin(x)
    term = x  # First term: x
    sum_value = term
    n = 1

    # Compute series for arcsin(x), then adjust for arccos(x)
    while abs(term) > eps and n < 500:
        n += 1
        # Compute next term: term * (2n-1)/(2n) * x^2 * (2n-3)/(2n-2)
        term *= (2 * n - 3) / (2 * n - 2) * (2 * n - 1) / (2 * n) * x * x
        sum_value += term / (2 * n - 1)
    
    result -= sum_value
    return n, result

# Function to sum only the even numbers in a list
def multiply_last_digits(numbers: list[int]) -> tuple[int, list[int]]:
    """
    Multiply the last digits of a list of integers.
    
    Args:
        numbers (list[int]): List of integers.
    
    Returns:
        tuple[int, list[int]]: (product of last digits, list of last digits).
    
    Raises:
        ValueError: If the list is empty.
    """
    if not numbers:
        raise ValueError("List of numbers cannot be empty.")
    
    numbers.pop()
    if(numbers == []):
        return 0, []
    last_digits = [abs(num) % 10 for num in numbers]
    product = 1
    for digit in last_digits:
        product *= digit
    
    return product, last_digits

def analyze_float_list(numbers: list[float]) -> tuple[int, float]:
    """
    Find the index of the maximum element and the product of elements between the first and second zero elements.
    
    Args:
        numbers (list[float]): List of float numbers.
    
    Returns:
        tuple[int, float]: (index of max element, product between first and second zero elements).
    
    Raises:
        ValueError: If list is empty or has fewer than two zero elements.
    """
    if not numbers:
        raise ValueError("List cannot be empty.")
    
    # Find index of maximum element
    max_index = 0
    for i in range(1, len(numbers)):
        if numbers[i] > numbers[max_index]:
            max_index = i
    
    # Find first and second zero elements
    zero_count = 0
    first_zero_idx = -1
    second_zero_idx = -1
    
    for i, num in enumerate(numbers):
        if num == 0.0:
            zero_count += 1
            if first_zero_idx == -1:
                first_zero_idx = i
            elif second_zero_idx == -1:
                second_zero_idx = i
                break
    
    if zero_count < 2:
        raise ValueError("List must contain at least two zero elements.")
    
    # Calculate product between first and second zero elements
    product = 1.0
    if second_zero_idx - first_zero_idx > 1:  # Есть элементы между
        for i in range(first_zero_idx + 1, second_zero_idx):
            product *= numbers[i]
    else:
        product = 0.0  # Если нет элементов между, возвращаем 0
    
    return max_index, product