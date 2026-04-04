import string

def preprocess_text(text):
    """
    Cleans raw technical text for AI processing.
    """
    if not isinstance(text, str):
        return ""
    
    # 1. Lowercase for uniformity
    text = text.lower()
    
    # 2. Remove Punctuation (e.g., 'Python!' becomes 'python')
    text = text.translate(str.maketrans('', '', string.punctuation))
    
    # 3. Remove Noise Words
    stop_words = ["and", "the", "is", "in", "for", "with", "on", "a", "of", "to", "at", "an"]
    words = text.split()
    clean_words = [w for w in words if w not in stop_words]
    
    return " ".join(clean_words)