import re
from abc import ABC, abstractmethod

class TextAnalyzerBase(ABC):
    """Abstract base class for text analysis."""
    
    _total_analyses = 0  # Static attribute

    def __init__(self, text):
        """Initialize with text to analyze."""
        self._text = text
        TextAnalyzerBase._total_analyses += 1

    @property
    def text(self):
        """Getter for text."""
        return self._text

    @text.setter
    def text(self, value):
        """Setter for text."""
        if not isinstance(value, str):
            raise ValueError("Text must be a string")
        self._text = value

    @abstractmethod
    def analyze(self):
        """Abstract method to analyze text."""
        pass

class AnalysisMixin:
    """Mixin class for additional analysis methods."""
    
    def count_upper_lower(self, text):
        """Count uppercase and lowercase letters."""
        upper = sum(1 for c in text if c.isupper())
        lower = sum(1 for c in text if c.islower())
        return upper, lower

    def find_first_z_word(self, text):
        """Find the first word containing 'z' and its index."""
        words = re.findall(r'\b\w+\b', text)
        for i, word in enumerate(words):
            if 'z' in word.lower():
                return word, i
        return None, -1

class TextAnalyzer(TextAnalyzerBase, AnalysisMixin):
    """Class for analyzing text with regular expressions."""
    
    def __init__(self, text):
        """Initialize with inherited attributes."""
        super().__init__(text)
        self._results = []  # Dynamic attribute

    def add_result(self, result):
        """Add a result to the dynamic list."""
        self._results.append(result)

    def __str__(self):
        """String representation of analysis results."""
        return "\n".join(self._results)

    def __add__(self, other):
        """Polymorphic method to combine results."""
        if isinstance(other, TextAnalyzer):
            new_analyzer = TextAnalyzer(self._text + " " + other._text)
            new_analyzer._results = self._results + other._results
            return new_analyzer
        raise TypeError("Can only add another TextAnalyzer")

    def analyze(self):
        """Perform text analysis and return results."""
        self._results = []  # Reset results
        text = self._text

        # Split text into sentences
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        sentences = [s.strip() for s in sentences if s.strip()]
        self.add_result(f"Total sentences: {len(sentences)}")

        # Count sentence types
        declarative = sum(1 for s in sentences if s.endswith('.'))
        interrogative = sum(1 for s in sentences if s.endswith('?'))
        imperative = sum(1 for s in sentences if s.endswith('!'))
        self.add_result(f"Declarative sentences: {declarative}")
        self.add_result(f"Interrogative sentences: {interrogative}")
        self.add_result(f"Imperative sentences: {imperative}")

        # Average sentence length (only words)
        total_word_length = 0
        total_words = 0
        for sentence in sentences:
            words = re.findall(r'\b\w+\b', sentence)
            total_word_length += sum(len(word) for word in words)
            total_words += len(words)
        avg_sentence_length = total_word_length / len(sentences) if sentences else 0
        self.add_result(f"Average sentence length (chars, words only): {avg_sentence_length:.2f}")

        # Average word length
        avg_word_length = total_word_length / total_words if total_words else 0
        self.add_result(f"Average word length (chars): {avg_word_length:.2f}")

        # Count smileys
        smiley_pattern = r'[;:]-*(\(+|\)+|\[+|\]+)'
        smileys = re.findall(smiley_pattern, text)
        self.add_result(f"Number of smileys: {len(smileys)}")

        # Sentences with spaces, digits, and punctuation
        complex_sentences = [s for s in sentences if re.search(r'[\s\d.,!?]', s)]
        self.add_result("Sentences with spaces, digits, and punctuation:")
        for s in complex_sentences:
            self.add_result(f"  {s}")

        # Validate date format (dd/mm/yyyy, 1600-9999)
        date_pattern = r'\b(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/([1-9][6-9][0-9]{2}|9[0-9]{3})\b'
        dates = re.findall(date_pattern, text)
        self.add_result("Dates found (dd/mm/yyyy, 1600-9999):")
        for date in dates:
            self.add_result(f"  {date[0]}/{date[1]}/{date[2]}")

        # Count uppercase and lowercase letters
        upper, lower = self.count_upper_lower(text)
        self.add_result(f"Uppercase letters: {upper}")
        self.add_result(f"Lowercase letters: {lower}")

        # Find first word with 'z'
        z_word, z_index = self.find_first_z_word(text)
        if z_word:
            self.add_result(f"First word with 'z': {z_word}, Index: {z_index}")
        else:
            self.add_result("No word with 'z' found")

        # Remove words starting with 'a'
        modified_text = re.sub(r'\b[aA]\w*\b', '', text)
        modified_text = re.sub(r'\s+', ' ', modified_text).strip()
        self.add_result("Text after removing words starting with 'a':")
        self.add_result(modified_text)

        return self._results