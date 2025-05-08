from abc import ABC, abstractmethod
import math

class ColorFigure:
    """Class to manage the color of a geometric figure."""
    
    def __init__(self, color):
        self._color = color

    @property
    def color(self):
        """Getter for color property."""
        return self._color

    @color.setter
    def color(self, value):
        """Setter for color property with validation."""
        if not isinstance(value, str) or not value.strip():
            raise ValueError("Color must be a non-empty string!")
        self._color = value.strip()

class GeometricFigure(ABC):
    """Abstract base class for geometric figures."""
    
    def __init__(self, color_obj):
        self.color_obj = color_obj

    @abstractmethod
    def area(self):
        """Abstract method to compute the area of the figure."""
        pass

    @classmethod
    def get_figure_name(cls):
        """Class method to return the name of the figure."""
        return cls.__name__

class Trapezoid(GeometricFigure):
    """Class representing an isosceles trapezoid."""
    
    def __init__(self, height, base_a, mid_line, color):
        super().__init__(ColorFigure(color))
        if height <= 0 or base_a <= 0 or mid_line <= 0:
            raise ValueError("Height, base_a, and mid_line must be positive!")
        # For isosceles trapezoid, mid_line = (base_a + base_b) / 2
        base_b = 2 * mid_line - base_a
        if base_b <= 0:
            raise ValueError("Derived base_b must be positive!")
        self.height = height
        self.base_a = base_a
        self.base_b = base_b

    def area(self):
        """Compute the area of the isosceles trapezoid."""
        return (self.base_a + self.base_b) * self.height / 2

    def get_info(self):
        """Return a formatted string with trapezoid details."""
        area = self.area()
        return "Трапеция {0} цвета с высотой {1}, основанием {2}, средняя линия {3}. Площадь: {4:.2f}".format(
            self.color_obj.color, self.height, self.base_a, self.base_b, area
        )