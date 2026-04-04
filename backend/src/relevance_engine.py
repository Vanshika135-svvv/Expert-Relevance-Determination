from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def calculate_similarity(candidate_clean_text, experts_clean_list):
    """
    Calculates the Cosine Similarity score between a candidate and all experts.
    """
    if not experts_clean_list:
        return np.array([])

    # 1. Initialize Vectorizer
    tfidf = TfidfVectorizer()
    
    # 2. Combine candidate and expert texts for the matrix
    # Index 0 is the candidate, all others are experts
    all_docs = [candidate_clean_text] + experts_clean_list
    
    # 3. Transform text into numerical vectors
    tfidf_matrix = tfidf.fit_transform(all_docs)
    
    # 4. Compare candidate vector (index 0) against all expert vectors (index 1 onwards)
    scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    
    return scores