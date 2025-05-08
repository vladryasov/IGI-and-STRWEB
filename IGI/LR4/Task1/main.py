import sys
from student import Student
from file_utils import save_to_csv, load_from_csv, save_to_pickle, load_from_pickle, search_student, sort_students

def get_valid_input(prompt, type_func, error_msg):
    """Get valid input with type checking and error handling."""
    while True:
        try:
            value = type_func(input(prompt))
            return value
        except ValueError:
            print(error_msg)

def add_student(students):
    """Add a new student to the list."""
    name = get_valid_input("Enter full name: ", str, "Name must be a string!")
    day = get_valid_input("Enter day of birth (1-31): ", int, "Day must be an integer between 1 and 31!")
    month = get_valid_input("Enter month of birth (1-12): ", int, "Month must be an integer between 1 and 12!")
    year = get_valid_input("Enter year of birth (e.g., 2000): ", int, "Year must be an integer!")
    if not (1 <= day <= 31 and 1 <= month <= 12 and 1900 <= year <= 2025):
        raise ValueError("Invalid date!")
    birth_date = f"{day:02d} {month:02d} {year}"
    student = Student(name, birth_date)
    note = input("Enter a note (or press Enter to skip): ")
    if note:
        student.add_note(note)
    students.append(student)
    print(f"Added: {student}")
    print(f"Current number of students in list: {len(students)}")

def display_students(students):
    """Display all students."""
    if not students:
        print("No students to display.")
    else:
        for student in students:
            print(student)
    print(f"Total students displayed: {len(students)}")

def calculate_class_birthday(students):
    """Calculate and display the average birthday of the class."""
    try:
        if not students:
            raise ValueError("No students to calculate average birthday")
        avg_birthday = students[0].calculate_average_birthday(students)
        print(f"Average class birthday: {avg_birthday.strftime('%d %m %Y')}")
    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

def main():
    """Main function to run the student management system."""
    students = []
    while True:
        print("\nStudent Management System")
        print("1. Add Student")
        print("2. Display All Students")
        print("3. Search Student")
        print("4. Sort Students by Birth Date")
        print("5. Calculate Class Average Birthday")
        print("6. Save to CSV")
        print("7. Load from CSV")
        print("8. Save to Pickle")
        print("9. Load from Pickle")
        print("0. Exit")
        
        choice = get_valid_input("Enter your choice (0-9): ", int, "Choice must be an integer between 0 and 9!")
        
        try:
            if choice == 1:
                add_student(students)
            elif choice == 2:
                display_students(students)
            elif choice == 3:
                search_name = get_valid_input("Enter name to search: ", str, "Name must be a string!")
                results = search_student(students, search_name)
                display_students(results)
            elif choice == 4:
                sorted_students = sort_students(students)
                display_students(sorted_students)
            elif choice == 5:
                calculate_class_birthday(students)
            elif choice == 6:
                if not students:
                    print("No students to save!")
                else:
                    save_to_csv(students)
                    print("Saved to students.csv in Task1 directory")
            elif choice == 7:
                loaded_students = load_from_csv()
                if loaded_students:
                    students = loaded_students
                    print("Loaded from students.csv in Task1 directory:")
                    display_students(students)
                else:
                    print("No students loaded from CSV (file empty or not found).")
            elif choice == 8:
                if not students:
                    print("No students to save!")
                else:
                    save_to_pickle(students)
                    print("Saved to students.pkl in Task1 directory")
            elif choice == 9:
                loaded_students = load_from_pickle()
                if loaded_students:
                    students = loaded_students
                    print("Loaded from students.pkl in Task1 directory:")
                    display_students(students)
                else:
                    print("No students loaded from Pickle (file empty or not found).")
            elif choice == 0:
                print("Exiting...")
                break
            else:
                print("Invalid choice! Please try again.")
        except Exception as e:
            print(f"An error occurred: {e}")
            print(f"Current number of students in list: {len(students)}")

if __name__ == "__main__":
    main()