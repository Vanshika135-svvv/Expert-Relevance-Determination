import string

def clean_text(text):
    if not isinstance(text, str):
        return ""
    # 1. Lowercase
    text = text.lower()
    # 2. Remove Punctuation (commas, dots, etc.)
    text = text.translate(str.maketrans('', '', string.punctuation))
    # 3. Basic Stopword removal (simple words that don't help in matching)
    stop_words = ["and", "the", "is", "in", "for", "with", "on", "a", "of"]
    words = text.split()
    clean_words = [w for w in words if w not in stop_words]
    return " ".join(clean_words)