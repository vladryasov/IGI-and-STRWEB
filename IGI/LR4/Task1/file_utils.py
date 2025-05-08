import csv
import pickle
import os
from student import Student

def save_to_csv(students, filename="students.csv", base_dir="files"):
    """Save student data to a CSV file in the specified task directory."""
    task_path = os.path.join(os.path.dirname(__file__), base_dir)
    os.makedirs(task_path, exist_ok=True)
    full_path = os.path.join(task_path, filename)
    print(f"Saving to CSV at: {full_path}")
    print(f"Number of students to save: {len(students)}")
    with open(full_path, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Full Name", "Birth Date", "Notes"])
        for student in students:
            writer.writerow([student.full_name, student.birth_date.strftime("%d %m %Y"), student._dynamic_attr])

def load_from_csv(filename="students.csv", base_dir="files"):
    """Load student data from a CSV file in the specified task directory."""
    task_path = os.path.join(os.path.dirname(__file__), base_dir)
    full_path = os.path.join(task_path, filename)
    print(f"Loading from CSV at: {full_path}")
    students = []
    if os.path.exists(full_path):
        with open(full_path, 'r') as file:
            reader = csv.reader(file)
            next(reader)  # Skip header
            for row in reader:
                student = Student(row[0], row[1])
                if row[2]:
                    student._dynamic_attr = eval(row[2])  # Convert string to list
                students.append(student)
    print(f"Loaded {len(students)} students from CSV")
    return students

def save_to_pickle(students, filename="students.pkl", base_dir="files"):
    """Save student data to a Pickle file in the specified task directory."""
    task_path = os.path.join(os.path.dirname(__file__), base_dir)
    os.makedirs(task_path, exist_ok=True)
    full_path = os.path.join(task_path, filename)
    print(f"Saving to Pickle at: {full_path}")
    print(f"Number of students to save: {len(students)}")
    with open(full_path, 'wb') as file:
        pickle.dump(students, file)

def load_from_pickle(filename="students.pkl", base_dir="files"):
    """Load student data from a Pickle file in the specified task directory."""
    task_path = os.path.join(os.path.dirname(__file__), base_dir)
    full_path = os.path.join(task_path, filename)
    print(f"Loading from Pickle at: {full_path}")
    students = []
    if os.path.exists(full_path):
        with open(full_path, 'rb') as file:
            students = pickle.load(file)
    print(f"Loaded {len(students)} students from Pickle")
    return students

def search_student(students, search_name):
    """Search for a student by name."""
    return [s for s in students if search_name.lower() in s.full_name.lower()]

def sort_students(students):
    """Sort students by birth date."""
    return sorted(students, key=lambda x: x.birth_date)