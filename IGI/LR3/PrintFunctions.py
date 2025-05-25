# Function to print a table (DataFrame) without including the index
def print_table(df):

    print("\nTable : ")
    print(df.to_string(index=False))  # Convert the DataFrame to a string and print it without the index

# Function to print a list of real numbers with their indices
def print_list_real_numbers(list_real_numbers):

    for i in range(len(list_real_numbers)):
        # Loop through the list of real numbers
        print(f"num {i + 1} = {list_real_numbers[i]}")  # Print the number with its index (1-based)

def print_digit_product(numbers: list[int], last_digits: list[int], product: int) -> None:
    """
    Print the result of multiplying last digits.
    
    Args:
        numbers (list[int]): Input numbers.
        last_digits (list[int]): Last digits of the numbers.
        product (int): Product of the last digits.
    """
    print("\nTask 2 Result:")
    print(f"Input numbers: {numbers}")
    print(f"Last digits: {last_digits}")
    print(f"Product of last digits: {product}")

def print_string_analysis(text: str, spaces: int, digits: int, punctuation: int) -> None:
    """
    Print the result of string analysis for task 3.
    
    Args:
        text (str): Input string.
        spaces (int): Number of spaces.
        digits (int): Number of digits.
        punctuation (int): Number of punctuation marks.
    """
    print("\nTask 3 Result:")
    print(f"Input string: {text}")
    print(f"Spaces: {spaces}")
    print(f"Digits: {digits}")
    print(f"Punctuation marks: {punctuation}")

def print_task4_analysis(text: str, vowel_words: int, char_freq: dict, comma_words: list[str]) -> None:
    """
    Print the result of text analysis for task 4.
    
    Args:
        text (str): Input text.
        vowel_words (int): Number of words starting or ending with a vowel.
        char_freq (dict): Dictionary of character frequencies.
        comma_words (list[str]): Sorted list of words following commas.
    """
    print("\nTask 4 Result:")
    print(f"Input text: {text}")
    print(f"a) Number of words starting or ending with a vowel: {vowel_words}")
    print("b) Character frequencies:")
    for char, freq in sorted(char_freq.items()):
        if char.isspace():
            print(f"  ' ' (space): {freq}")
        else:
            print(f"  '{char}': {freq}")
    print("c) Words following commas (sorted):")
    for word in comma_words:
        print(f"  {word}")

def print_float_list_analysis(numbers: list[float], max_index: int, product: float) -> None:
    """
    Print the list and results of float list analysis for task 5.
    
    Args:
        numbers (list[float]): Input list of float numbers.
        max_index (int): Index of the maximum element.
        product (float): Product of elements between first and second nonzero elements.
    """
    print("\nTask 5 Result:")
    print(f"List: {numbers}")
    print(f"Index of maximum element: {max_index}")
    print(f"Product between first and second nonzero elements: {product}")