import matplotlib.pyplot as plt
import numpy as np
import os

class Plotter:
    """Class to plot and save comparison of series and math.acos values."""
    
    def __init__(self, x_values, series_values, math_values):
        """Initialize with data for plotting."""
        self.x_values = x_values
        self.series_values = series_values
        self.math_values = math_values

    def plot_results(self, filename="arccos_plot.png", base_dir="plot"):
        task_path = os.path.join(os.path.dirname(__file__), base_dir)
        os.makedirs(task_path, exist_ok=True)
        full_path = os.path.join(task_path, filename)
        """Plot the series approximation and math.acos values, then save to file."""
        plt.figure(figsize=(10, 6))
        
        # Plot series approximation
        plt.plot(self.x_values, self.series_values, 'b-', label='Series Approximation')
        # Plot math.acos
        plt.plot(self.x_values, self.math_values, 'r--', label='Math.acos')

        # Add axes, grid, and labels
        plt.axhline(0, color='black', linewidth=0.5)
        plt.axvline(0, color='black', linewidth=0.5)
        plt.grid(True, linestyle='--', alpha=0.7)
        plt.xlabel('x')
        plt.ylabel('arccos(x)')
        plt.title('Comparison of arccos(x): Series vs Math.acos')

        # Add legend
        plt.legend()

        # Add text annotation
        plt.text(0, 2.5, 'Series vs Math.acos', fontsize=12, ha='center')
        
        # Add annotation for a specific point
        mid_idx = len(self.x_values) // 2
        mid_x = self.x_values[mid_idx]
        mid_y = self.series_values[mid_idx]
        plt.annotate(f'Approx at x={mid_x:.2f}', 
                     xy=(mid_x, mid_y), 
                     xytext=(mid_x + 0.2, mid_y + 0.5),
                     arrowprops=dict(facecolor='blue', shrink=0.05))

        # Save plot to file
        plt.savefig(full_path)
        plt.close()