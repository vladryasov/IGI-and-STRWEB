import matplotlib.pyplot as plt
import os

class FigurePlotter:
    """Class to draw and save geometric figures."""
    
    def __init__(self, figure, label_text):
        """Initialize with figure object and label text."""
        self.figure = figure
        self.label_text = label_text

    def draw(self, filename, base_dir = "plot"):
        task_path = os.path.join(os.path.dirname(__file__), base_dir)
        os.makedirs(task_path, exist_ok=True)
        full_path = os.path.join(task_path, filename)
        """Draw and fill the isosceles trapezoid with color, add label, and save to file."""
        fig, ax = plt.subplots()
        
        # Draw isosceles trapezoid
        h = self.figure.height
        a = self.figure.base_a
        b = self.figure.base_b
        
        # Calculate coordinates for isosceles trapezoid
        offset = (a - b) / 2  # Offset to center the top base
        x = [0, a, a - offset, offset, 0]  # Bottom left, bottom right, top right, top left, close
        y = [0, 0, h, h, 0]
        
        # Fill with color and draw outline
        ax.fill(x, y, color=self.figure.color_obj.color, alpha=0.4)  # Reduced alpha for visibility
        ax.plot(x, y, 'k-', linewidth=2)  # Black outline with increased thickness

        # Add label at the center
        center_x = a / 2
        center_y = h / 2
        ax.text(center_x, center_y, self.label_text, ha='center', va='center', fontsize=12)

        ax.set_aspect('equal')
        ax.set_title(f"{self.figure.get_figure_name()} - {self.label_text}")
        ax.grid(True)
        
        # Save to file
        plt.savefig(full_path)
        plt.close()
        print(f"Figure saved as {filename}")