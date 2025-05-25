import math
import numpy as np
import statistics

class SeriesCalculator:
    """Class to calculate arccos(x) using series expansion and compute statistics."""
    
    def __init__(self, eps=1e-6):
        """Initialize with epsilon for series convergence."""
        self.eps = eps
        self.terms = []  # Store terms of the series for statistics
        self.x_values = []  # Store x values
        self.series_values = []  # Store series approximation values
        self.math_values = []  # Store math.acos values

    def calculate(self, x):
        """Calculate arccos(x) using series expansion and return n and result."""
        if abs(x) == 1:
            return 1, 0.0 if x == 1 else math.pi

        # Initialize variables
        result = math.pi / 2  # arccos(x) = pi/2 - arcsin(x)
        term = x  # First term: x
        sum_value = term
        self.terms = [term]  # Reset terms for statistics
        n = 1

        # Compute series for arcsin(x), then adjust for arccos(x)
        while abs(term) > self.eps and n < 500:
            n += 1
            term *= (2 * n - 3) / (2 * n - 2) * (2 * n - 1) / (2 * n) * x * x
            sum_value += term / (2 * n - 1)
            self.terms.append(term)

        result -= sum_value
        return n, result

    def compute_statistics(self):
        """Compute statistical parameters of the series terms."""
        if not self.terms:
            return "No terms to analyze."

        stats = []
        # Mean
        mean = sum(self.terms) / len(self.terms)
        stats.append(f"Mean of series terms: {mean:.6f}")

        # Median
        median = statistics.median(self.terms)
        stats.append(f"Median of series terms: {median:.6f}")

        # Mode (handling if no unique mode)
        try:
            mode = statistics.mode(self.terms)
            stats.append(f"Mode of series terms: {mode:.6f}")
        except statistics.StatisticsError:
            stats.append("Mode of series terms: No unique mode")

        # Variance
        variance = statistics.variance(self.terms) if len(self.terms) > 1 else 0
        stats.append(f"Variance of series terms: {variance:.6f}")

        # Standard Deviation (СКО)
        stdev = math.sqrt(variance) if variance > 0 else 0
        stats.append(f"Standard Deviation of series terms: {stdev:.6f}")

        return stats

    def analyze_range(self, x_start, x_end, steps):
        """Analyze arccos(x) over a range of x values."""
        self.x_values = np.linspace(x_start, x_end, steps)
        self.series_values = []
        self.math_values = []

        for x in self.x_values:
            n, series_result = self.calculate(x)
            self.series_values.append(series_result)
            self.math_values.append(math.acos(x))