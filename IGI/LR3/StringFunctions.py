import pandas as pd
from math import acos
from MathFunctions import calculate

# Function to define the quality of a string by cleaning and splitting it into substrings
def define_quality_of_string(string):

    string = string.replace(",", "")  # Remove commas
    string = string.replace(".", "")  # Remove periods
    sub_strings = string.split(" ")  # Split the string into a list of words (substrings)

    return sub_strings  # Return the list of substrings

# Function to fill in the table with calculated values
def fill_in_the_table(x, eps, df):
    n, f = calculate(x, eps)  # Call the calculate function from MathFunctions to get n and f values

    # Create a new row as a DataFrame to add to the existing DataFrame
    new_row = pd.DataFrame([{
       "x": x,  # Value of x
       "n": n,  # Value of n
       "F(x)": f,  # Calculated value of F(x)
       "Math(F(x))": acos(x),  # Mathematical calculation of F(x) using acos
       "eps": eps  # Value of epsilon (eps)
    }])

    # Concatenate the new row to the existing DataFrame and return the updated DataFrame
    df = pd.concat([df, new_row], ignore_index=True)
    return df  # Return the updated DataFrame

def analyze_string(text: str) -> tuple[int, int, int]:
    """
    Count spaces, digits, and punctuation marks in a string without using regex.
    
    Args:
        text (str): Input string to analyze.
    
    Returns:
        tuple[int, int, int]: (number of spaces, digits, punctuation marks).
    
    Raises:
        ValueError: If the input string is empty.
    """
    if not text:
        raise ValueError("Input string cannot be empty.")
    
    spaces = 0
    digits = 0
    punctuation = 0
    
    punctuation_marks = ".,;:!?-()\"'"
    
    for char in text:
        if char == ' ':
            spaces += 1
        elif char in '0123456789':
            digits += 1
        elif char in punctuation_marks:
            punctuation += 1
    
    return spaces, digits, punctuation

def analyze_text_task4(text: str) -> tuple[int, dict, list[str]]:
    """
    Analyze text for task 4 without using regex.
    
    Args:
        text (str): Input text to analyze.
    
    Returns:
        tuple[int, dict, list[str]]: 
            - Number of words starting or ending with a vowel.
            - Dictionary of character frequencies.
            - Sorted list of words following commas.
    
    Raises:
        ValueError: If the input text is empty.
    """
    if not text:
        raise ValueError("Input text cannot be empty.")
    
    # a) Count words starting or ending with a vowel
    vowels = "aeiouAEIOU"
    words = []
    current_word = ""
    
    # Разделяем слова по пробелам и запятым
    for char in text:
        if char == ' ' or char == ',':
            if current_word:
                words.append(current_word)
                current_word = ""
        else:
            current_word += char
    if current_word:  # Добавляем последнее слово
        words.append(current_word)
    
    vowel_words = 0
    for word in words:
        if not word:  # Пропускаем пустые слова
            continue
        if word[0] in vowels or word[-1] in vowels:
            vowel_words += 1
    
    # b) Count frequency of each character
    char_freq = {}
    for char in text:
        char_freq[char] = char_freq.get(char, 0) + 1
    
    # c) Extract and sort words following commas
    comma_words = []
    parts = []
    current_part = ""
    
    # Разделяем по запятым
    for char in text:
        if char == ',':
            if current_part:
                parts.append(current_part.strip())
                current_part = ""
        else:
            current_part += char
    if current_part:
        parts.append(current_part.strip())
    
    # Извлекаем первое слово после каждой запятой
    for i in range(1, len(parts)):
        part = parts[i].strip()
        if part:
            first_word = ""
            for char in part:
                if char == ' ':
                    break
                first_word += char
            if first_word:
                comma_words.append(first_word)
    
    comma_words.sort(key=str.lower)  # Сортировка без учёта регистра
    
    return vowel_words, char_freq, comma_words