from geometric_figure import Trapezoid
from figure_plotter import FigurePlotter

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
    """Main function to test trapezoid geometric figure class."""    
    while True:
        print("\n1. Create and analyze Trapezoid")
        print("0. Exit")
        
        choice = get_valid_input("Enter your choice (0-1): ", int, "Choice must be an integer (0-1)!")
        
        try:
            if choice == 1:
                height = get_valid_input("Enter height (> 0): ", float, "Height must be a positive number!", lambda x: x > 0)
                base_a = get_valid_input("Enter base a (> 0): ", float, "Base a must be a positive number!", lambda x: x > 0)
                mid_line = get_valid_input("Enter mid-line (> 0): ", float, "Mid-line must be a positive number!", lambda x: x > 0)
                color = get_valid_input("Enter color: ", str, "Color must be a non-empty string!")
                label = get_valid_input("Enter label text: ", str, "Label must be a non-empty string!")

                trap = Trapezoid(height, base_a, mid_line, color)
                print("\n" + trap.get_info())
                plotter = FigurePlotter(trap, label)
                plotter.draw(f"{trap.get_figure_name().lower()}_plot.png")

            elif choice == 0:
                print("Exiting...")
                break
            else:
                print("Invalid choice! Please try again.")
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()