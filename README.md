# Expert-Relevance-Determination
A web-based system that evaluates and ranks subject experts for interview boards by analyzing relevance to candidate expertise using AI-based text matching.

## Project Overview
Expert Relevance Determination is an AI-assisted decision support system designed
to evaluate and rank subject experts for interview boards. The system determines
expert suitability by analyzing the relevance between candidate expertise,
interview subject requirements, and expert profiles using text similarity
techniques.

## Problem Statement
The process of selecting appropriate subject experts for interview panels is
often manual and subjective. This may result in mismatches between candidate
expertise and interviewer specialization. An automated system is required to
objectively assess and determine expert relevance based on defined criteria.

## Objectives
- To automate the determination of expert relevance for interview boards
- To analyze candidate expertise and expert profiles using AI-based methods
- To generate relevance scores for expert ranking
- To support objective and efficient expert selection decisions

## Proposed System
The proposed system applies Natural Language Processing (NLP) techniques to
compare candidate expertise with expert profiles. Text data is converted into
numerical vectors using TF-IDF vectorization, and relevance is measured using
cosine similarity. Expert experience is incorporated as an additional factor in
the final relevance score.

## System Workflow
1. Input candidate expertise and interview subject
2. Load expert profile information
3. Perform text preprocessing and vectorization
4. Calculate relevance using similarity measures
5. Rank experts based on final relevance score
6. Display ranked experts through a web interface

## Technologies Used
- Python
- Flask
- HTML, CSS, JavaScript
- TF-IDF Vectorization
- Cosine Similarity
- CSV / SQLite Database
- Git and GitHub

## Project Structure
/docs - Project documentation
/data - Expert and candidate datasets
/backend - Backend logic and relevance computation
/frontend - User interface files
app.py - Flask application entry point
README.md - Project overview and documentation


## Team Members
- Vanshika Tiwari – Team Leader & Backend Development
- Dhanshri – Dataset Preparation and Research
- Harman – Frontend Development
- Vaidika – Documentation and Presentation

## Development Methodology
The project follows an incremental development approach inspired by Agile
methodology. Development is divided into phases including planning, data
preparation, backend implementation, frontend integration, and testing.

## Current Status
Phase 1: Planning and Requirement Analysis  
Phase 2: Data Preparation and Backend Development (In Progress)

## Future Scope
- Integration of advanced NLP models such as BERT
- Incorporation of expert availability and scheduling
- Deployment on cloud platforms
- Use of real-time databases for scalability

## Conclusion
The Expert Relevance Determination system provides a structured and objective
approach to expert selection for interview boards. By leveraging AI-based text
analysis techniques, the system enhances decision accuracy and minimizes manual
bias in expert evaluation.
