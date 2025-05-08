from series_calculator import SeriesCalculator
from plotter import Plotter
import numpy as np

def get_valid_input(prompt, type_func, error_msg):
    """Get valid input with type checking and error handling."""
    while True:
        try:
            value = type_func(input(prompt))
            return value
        except ValueError:
            print(error_msg)

def main():
    """Main function to run the series analysis and plotting system."""
    calculator = SeriesCalculator(eps=1e-6)

    while True:
        print("\nSeries Analysis and Plotting System")
        print("1. Analyze arccos(x) for a single x")
        print("2. Analyze arccos(x) over a range and plot")
        print("0. Exit")
        
        choice = get_valid_input("Enter your choice (0-2): ", int, "Choice must be an integer (0-2)!")
        
        try:
            if choice == 1:
                x = get_valid_input("Enter x (-1 to 1): ", float, "x must be a float!")
                if not -1 <= x <= 1:
                    print("x must be between -1 and 1!")
                    continue
                
                n, result = calculator.calculate(x)
                print(f"\nResult for x={x}: arccos(x) ≈ {result:.6f}")
                print(f"Math.acos(x) = {math.acos(x):.6f}")
                print(f"Number of terms (n): {n}")
                
                # Compute and display statistics
                stats = calculator.compute_statistics()
                print("\nStatistics of series terms:")
                for stat in stats:
                    print(stat)

            elif choice == 2:
                x_start = get_valid_input("Enter x start (-1 to 1): ", float, "x start must be a float!")
                x_end = get_valid_input("Enter x end (-1 to 1): ", float, "x end must be a float!")
                steps = get_valid_input("Enter number of steps: ", int, "Steps must be an integer!")
                
                if not (-1 <= x_start <= 1 and -1 <= x_end <= 1):
                    print("x values must be between -1 and 1!")
                    continue
                if steps <= 0:
                    print("Steps must be positive!")
                    continue

                calculator.analyze_range(x_start, x_end, steps)
                plotter = Plotter(calculator.x_values, calculator.series_values, calculator.math_values)
                plotter.plot_results()
                print(f"\nPlot saved as 'arccos_plot.png'")

            elif choice == 0:
                print("Exiting...")
                break
            else:
                print("Invalid choice! Please try again.")
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    import math  # Import here to avoid circular imports
    main()