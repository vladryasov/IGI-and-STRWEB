
# Function to handle user input for real numbers
def input_number(value_type):

    while True:
        try:
            num = value_type(input("\nEnter a number: "))
            # Prompt user to enter a number
            break

        except ValueError:

            print("Invalid input. Enter right value")

    return num

# Function to prompt the user for a string input
def input_string():
    return input("\nEnter a string : ")  # Prompt the user to enter a string


def choose_generate_or_input(input_function,generate_function):
    while True:

        try:

            inp = int(input("\nEnter 1 to input by yourself or any other key to continue: "))
            return input_function if inp == 1 else generate_function

        except ValueError:
            print("Invalid input. Enter right value")

def input_sequence() -> list[int]:
    """
    Prompt user to enter a sequence of integers until 0 is entered.
    
    Returns:
        list[int]: List of entered integers (excluding 0).
    """
    numbers = []
    print("Enter integers (0 to finish):")
    while True:
        try:
            num = int(input("Enter a number: "))
            if num == 0:
                numbers.append(num)
                break
            numbers.append(num)
        except ValueError:
            print("Invalid input. Please enter an integer.")
    return numbers

def input_float_list() -> list[float]:
    """
    Prompt user to enter a list of float numbers until an empty input is provided.
    
    Returns:
        list[float]: List of entered float numbers.
    
    Raises:
        ValueError: If no valid numbers were entered.
    """
    numbers = []
    print("Enter float numbers (press Enter without input to finish):")
    while True:
        user_input = input("Enter a number: ").strip()
        if not user_input:  # Пустой ввод завершает
            if not numbers:
                raise ValueError("List cannot be empty. Please enter at least one number.")
            break
        try:
            num = float(user_input)
            numbers.append(num)
        except ValueError:
            print("Invalid input. Please enter a valid float number.")
    return numbers
