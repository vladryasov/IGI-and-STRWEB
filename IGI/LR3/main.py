# Import the necessary module for tasks
import TasksFunctions
import GenerateFunctions

# Main function to run the program
def main():

    while True:
        # Call the function to choose a task from the TasksFunctions module
        input_function = TasksFunctions.choose_task()

        # Match the selected task and call the appropriate function
        match input_function:
            case "task1":
                TasksFunctions.task1()  # Run task 1
            case "task2":
                TasksFunctions.task2()  # Run task 2
            case "task3":
                TasksFunctions.task3()  # Run task 3
            case "task4":
                TasksFunctions.task4()  # Run task 4
            case "task5":
                TasksFunctions.task5()  # Run task 5
            case _:
                print("Invalid input")  # Handle invalid input for task selection

        # Ask the user whether to continue or quit the program
        user_input = input("\nEnter q to quit program or any other key to continue: ")
        if user_input == "q":
            break  # Exit the loop and end the program if the user chooses to quit

# Entry point for the program
if __name__ == "__main__":
    main()  # Call the main function to start the program