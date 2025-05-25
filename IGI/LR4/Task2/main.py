from text_analyzer import TextAnalyzer
from file_utils import read_text_file, save_results, archive_results

def get_valid_input(prompt, type_func, error_msg):
    """Get valid input with type checking and error handling."""
    while True:
        try:
            value = type_func(input(prompt))
            return value
        except ValueError:
            print(error_msg)

def main():
    """Main function to run the text analysis system."""
    while True:
        print("\nText Analysis System")
        print("1. Analyze Text File")
        print("0. Exit")
        
        choice = get_valid_input("Enter your choice (0-1): ", int, "Choice must be an integer (0 or 1)!")
        
        try:
            if choice == 1:
                filename = input("Enter the input file name (e.g., input.txt): ")
                text = read_text_file(filename)
                analyzer = TextAnalyzer(text)
                results = analyzer.analyze()
                print("\nAnalysis Results:")
                print(analyzer)
                
                # Save and archive results
                result_file = save_results(results)
                print(f"\nResults saved to {result_file}")
                archive_info = archive_results(result_file)
                print("\nArchive Info:")
                for info in archive_info:
                    print(info)
            elif choice == 0:
                print("Exiting...")
                break
            else:
                print("Invalid choice! Please try again.")
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()