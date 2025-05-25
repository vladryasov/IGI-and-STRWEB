# Import necessary modules for print functions, search operations, string manipulations, input handling, and mathematical operations
import PrintFunctions
import StringFunctions
import InputFunctions
import MathFunctions
from GenerateFunctions import generate_arg, generate_sequence, generate_float_list
from InputFunctions import input_number, input_sequence, input_string, input_float_list


# Function to handle task 1: Process data and display the table
def task1():
    # Create an empty DataFrame with specified columns to store results
    df = StringFunctions.pd.DataFrame(columns = ["x", "n", "F(x)", "Math(F(x))", "eps"])

    while True:

        input_function = InputFunctions.choose_generate_or_input(input_number,generate_arg)

        while True:

            x = input_function(float) if input_function == input_number else next(input_function(float))
            eps = input_function(float) if input_function == input_number else next(input_function(float))

            if x > 1 or eps <= 0 or eps >= 1 or x < -1:
                continue
            else:
                break

        # Fill the table with results and display the updated table
        df = StringFunctions.fill_in_the_table(x, eps, df)
        PrintFunctions.print_table(df)

        # Ask user whether they want to continue or quit the task
        user_input = input("\nEnter q to quit task or any other key to continue: ")
        if user_input == "q":
            break  # Exit the loop if user chooses to quit

# Function to handle task 2: Process a list of numbers and perform calculations
def task2() -> None:
    """
    Run task to multiply last digits of integers until 0 is entered.
    """
    while True:
        print("\n=== Multiply Last Digits ===")
        input_function = InputFunctions.choose_generate_or_input(input_sequence, generate_sequence)
        
        try:
            numbers = input_function()
            if not numbers:
                print("Error: At least one number must be entered before 0.")
                continue
            product, last_digits = MathFunctions.multiply_last_digits(numbers)
            PrintFunctions.print_digit_product(numbers, last_digits, product)
        except ValueError as e:
            print(f"Error: {e}")
        
        user_input = input("\nEnter 'q' to quit task or any key to continue: ").strip().lower()
        if user_input == "q":
            break

# Function to handle task 3: Process a string and calculate the quality of lowercase substrings
def task3() -> None:
    """
    Run task to analyze a string for spaces, digits, and punctuation.
    """
    while True:
        print("\n=== Analyze String ===")
        input_function = InputFunctions.choose_generate_or_input(input_string, lambda: next(generate_arg(str)))
        
        try:
            text = input_function()
            spaces, digits, punctuation = StringFunctions.analyze_string(text)
            PrintFunctions.print_string_analysis(text, spaces, digits, punctuation)
        except ValueError as e:
            print(f"Error: {e}")
        
        user_input = input("\nEnter 'q' to quit task or any key to continue: ").strip().lower()
        if user_input == "q":
            break
# Function to handle task 4: Process a predefined string and search for the longest word
def task4() -> None:
    """
    Run task to analyze a fixed text for vowels, character frequency, and words after commas.
    """
    text = ("So she was considering in her own mind, as well as she could, for the hot day "
            "made her feel very sleepy and stupid, whether the pleasure of making a daisy-chain "
            "would be worth the trouble of getting up and picking the daisies, when suddenly "
            "a White Rabbit with pink eyes ran close by her.")
    
    while True:
        print("\n=== Analyze Fixed Text ===")
        try:
            vowel_words, char_freq, comma_words = StringFunctions.analyze_text_task4(text)
            PrintFunctions.print_task4_analysis(text, vowel_words, char_freq, comma_words)
        except ValueError as e:
            print(f"Error: {e}")
        
        user_input = input("\nEnter 'q' to quit task or any key to continue: ").strip().lower()
        if user_input == "q":
            break

def task5() -> None:
    """
    Run task to analyze a list of float numbers for max index and product between nonzero elements.
    """
    while True:
        print("\n=== Analyze Float List ===")
        input_function = InputFunctions.choose_generate_or_input(input_float_list, generate_float_list)
        
        try:
            numbers = input_function()
            if not numbers:
                print("Error: List cannot be empty.")
                continue
            max_index, product = MathFunctions.analyze_float_list(numbers)
            PrintFunctions.print_float_list_analysis(numbers, max_index, product)
        except ValueError as e:
            print(f"Error: {e}")
        
        user_input = input("\nEnter 'q' to quit task or any key to continue: ").strip().lower()
        if user_input == "q":
            break

# Function to choose which task to run based on user input
def choose_task():
    while True:
        try:
            # Prompt the user to select a task
            inp = input("\nEnter 1 to run task1"
                        "\nor 2 to run task2"
                        "\nor 3 to run task3"
                        "\nor 4 to run task4"
                        "\nor 5 to run task5: ")

            # Use match-case statement to determine which task to return
            match inp:
                case "1":
                    return "task1"
                case "2":
                    return "task2"
                case "3":
                    return "task3"
                case "4":
                    return "task4"
                case "5":
                    return "task5"
                case _:
                    print("Invalid input.Enter right value")  # Handle invalid input

        except ValueError:
            print("Invalid input.Enter right value")  # Handle exceptions due to invalid input