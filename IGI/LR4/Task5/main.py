# main.py
# Purpose: Main module to test NumPy matrix operations
# Lab Work: #5 - Object-Oriented Programming
# Version: 1.0
# Developer: [Your Full Name]
# Date: May 08, 2025

from matrix_analyzer import MatrixAnalyzer

def get_valid_input(prompt, type_func, error_msg, condition=None):
    """Get valid input with type checking and optional condition."""
    while True:
        try:
            value = type_func(input(prompt))
            if condition and not condition(value):
                print(error_msg)
                continue
            return value
        except ValueError:
            print(error_msg)

def main():
    """Main function to test NumPy matrix operations."""
    print("NumPy Matrix Analyzer")
    
    # Get matrix dimensions from user
    n = get_valid_input("Enter number of rows (n > 0): ", int, "Rows must be a positive integer!", lambda x: x > 0)
    m = get_valid_input("Enter number of columns (m > 0): ", int, "Columns must be a positive integer!", lambda x: x > 0)
    
    # Create MatrixAnalyzer instance
    analyzer = MatrixAnalyzer(n, m, min_val=1, max_val=100)
    
    try:
        # Demonstrate NumPy features
        print("\n=== NumPy Features ===")
        numpy_results = analyzer.demonstrate_numpy_features()
        for result in numpy_results:
            print(result)

        # Compute statistical operations
        print("\n=== Statistical Operations ===")
        stats_results = analyzer.compute_statistics()
        for result in stats_results:
            print(result)

        # Analyze even and odd numbers
        print("\n=== Even and Odd Analysis ===")
        even_odd_results = analyzer.analyze_even_odd()
        for result in even_odd_results:
            print(result)

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()