
import random
import string

def generate_arg(value_type):

    if value_type == int:
       yield random.randint(-10000, 10000)
    elif value_type == float:
        yield random.uniform(-1, 1)
    elif value_type == str:
        yield ''.join(random.choices(string.ascii_letters + string.digits + " "*10 + '.,;:!?-()"', k=random.randint(1, 100)))

def generate_sequence():
    """
    Generate a sequence of random integers ending with 0.
    
    Returns:
        list[int]: List of random integers followed by 0.
    """
    count = random.randint(2, 10)
    sequence = [random.randint(-100, -1) for _ in range(count//2)]
    sequence += [random.randint(1, 100) for _ in range(count//2)]
    sequence.append(0)
    return sequence

def generate_float_list():
    """
    Generate a random list of float numbers with at least two zero elements.
    
    Returns:
        list[float]: List of 3 to 10 random float numbers, ensuring at least two zeros.
    """
    count = random.randint(3, 10)
    numbers = [random.uniform(-100.0, 100.0) for _ in range(count)]
    # Ensure at least two zero elements
    zero_indices = random.sample(range(count), 2)  # Выбираем ровно 2 индекса
    for idx in zero_indices:
        numbers[idx] = 0.0
    return numbers

