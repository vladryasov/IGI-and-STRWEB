# matrix_analyzer.py
# Purpose: Defines a class for analyzing a matrix using NumPy
# Lab Work: #5 - Object-Oriented Programming
# Version: 1.0
# Developer: [Your Full Name]
# Date: May 08, 2025

import numpy as np

class MatrixAnalyzer:
    """Class to analyze a matrix using NumPy operations."""
    
    def __init__(self, n, m, min_val=1, max_val=100):
        """Initialize with matrix dimensions and value range."""
        self.n = n
        self.m = m
        self.matrix = self.create_matrix(min_val, max_val)

    def create_matrix(self, min_val, max_val):
        """Create a random integer matrix using NumPy."""
        # Using np.random.randint to create an integer matrix
        return np.random.randint(min_val, max_val + 1, size=(self.n, self.m))

    def demonstrate_numpy_features(self):
        """Demonstrate NumPy features for array creation and operations."""
        results = []
        
        # 1. Array creation using array() and values()
        results.append("1. Array Creation:")
        results.append(f"Original matrix:\n{self.matrix}")
        
        # Creating a matrix of zeros (example of specialized array creation)
        zeros_matrix = np.zeros((self.n, self.m), dtype=int)
        results.append(f"Zeros matrix:\n{zeros_matrix}")
        
        # Creating a matrix of ones
        ones_matrix = np.ones((self.n, self.m), dtype=int)
        results.append(f"Ones matrix:\n{ones_matrix}")

        # 2. Indexing and slicing
        results.append("\n2. Indexing and Slicing:")
        # First row
        first_row = self.matrix[0, :]
        results.append(f"First row: {first_row}")
        # Last column
        last_column = self.matrix[:, -1]
        results.append(f"Last column: {last_column}")
        # Submatrix (first 2 rows and 2 columns, if possible)
        if self.n >= 2 and self.m >= 2:
            submatrix = self.matrix[:2, :2]
            results.append(f"Submatrix (first 2 rows, 2 columns):\n{submatrix}")

        # 3. Element-wise operations (universal functions)
        results.append("\n3. Element-wise Operations:")
        # Square all elements
        squared_matrix = np.square(self.matrix)
        results.append(f"Matrix with squared elements:\n{squared_matrix}")
        # Add 10 to all elements
        added_matrix = self.matrix + 10
        results.append(f"Matrix with 10 added to all elements:\n{added_matrix}")
        
        return results

    def compute_statistics(self):
        """Compute mathematical and statistical operations on the matrix."""
        results = []
        
        # Flatten the matrix for easier statistical operations
        flat_matrix = self.matrix.flatten()
        
        # 1. Mean
        mean_val = np.mean(flat_matrix)
        results.append(f"Mean of all elements: {mean_val:.2f}")
        
        # 2. Median
        median_val = np.median(flat_matrix)
        results.append(f"Median of all elements: {median_val:.2f}")
        
        # 3. Variance
        variance_val = np.var(flat_matrix)
        results.append(f"Variance of all elements: {variance_val:.2f}")
        
        # 4. Standard Deviation
        std_val = np.std(flat_matrix)
        results.append(f"Standard Deviation of all elements: {std_val:.2f}")

        return results

    def analyze_even_odd(self):
        """Analyze even and odd numbers and compute correlation."""
        results = []
        
        # Flatten the matrix
        flat_matrix = self.matrix.flatten()
        
        # Count even and odd numbers
        even_count = np.sum(flat_matrix % 2 == 0)
        odd_count = np.sum(flat_matrix % 2 == 1)
        results.append(f"Number of even numbers: {even_count}")
        results.append(f"Number of odd numbers: {odd_count}")

        # Compute correlation between even and odd elements
        # Create arrays for even and odd indicators (1 if even/odd, 0 otherwise)
        even_indicators = (flat_matrix % 2 == 0).astype(int)
        odd_indicators = (flat_matrix % 2 == 1).astype(int)
        
        # Compute correlation coefficient
        if len(flat_matrix) > 1:  # Need at least 2 elements for correlation
            corr = np.corrcoef(even_indicators, odd_indicators)[0, 1]
            results.append(f"Correlation coefficient between even and odd elements: {corr:.4f}")
        else:
            results.append("Correlation coefficient: Not enough data to compute.")

        return results