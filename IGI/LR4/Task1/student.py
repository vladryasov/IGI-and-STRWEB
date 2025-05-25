from datetime import datetime

class Person:
    """Base class representing a person with basic attributes."""
    
    _total_students = 0  # Static attribute

    def __init__(self, full_name, birth_date):
        """Initialize Person with name and birth date."""
        self._full_name = full_name
        self._birth_date = datetime.strptime(birth_date, "%d %m %Y")
        Person._total_students += 1

    @property
    def full_name(self):
        """Getter for full_name."""
        return self._full_name

    @full_name.setter
    def full_name(self, value):
        """Setter for full_name."""
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Full name must be a non-empty string")
        self._full_name = value

    @property
    def birth_date(self):
        """Getter for birth_date."""
        return self._birth_date

    def __str__(self):
        """String representation of Person."""
        return f"{self._full_name}, Born: {self._birth_date.strftime('%d %m %Y')}"

    @classmethod
    def get_total_students(cls):
        """Class method to get total number of students."""
        return cls._total_students

class StudentMixin:
    """Mixin class for student-specific functionality."""
    
    def calculate_average_birthday(self, students):
        """Calculate average birthday across all students."""
        if not students:
            raise ValueError("No students to calculate average birthday")
        total_days = sum(s.birth_date.day for s in students)
        total_months = sum(s.birth_date.month for s in students)
        total_years = sum(s.birth_date.year for s in students)
        count = len(students)
        return datetime(total_years // count, total_months // count, total_days // count)

class Student(Person, StudentMixin):
    """Class representing a student with inherited properties."""
    
    def __init__(self, full_name, birth_date):
        """Initialize Student with inherited attributes."""
        super().__init__(full_name, birth_date)
        self._dynamic_attr = []  # Dynamic attribute

    def add_note(self, note):
        """Add a note to dynamic attribute."""
        self._dynamic_attr.append(note)

    def __add__(self, other):
        """Polymorphic method to combine notes."""
        if isinstance(other, Student):
            new_student = Student(self._full_name, self._birth_date.strftime("%d %m %Y"))
            new_student._dynamic_attr = self._dynamic_attr + other._dynamic_attr
            return new_student
        raise TypeError("Can only add another Student")

    def __str__(self):
        """Override string representation."""
        return f"{super().__str__()}, Notes: {self._dynamic_attr}"