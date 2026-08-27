import json
import time
import os
import numpy as np
from scipy.sparse import hstack, csr_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from ml.dataset import SYNTHETIC_DATASET
from app.signal_detection.detectors import SignalDetector

def train_and_evaluate_model():
    detector = SignalDetector()
    texts = [item["text"] for item in SYNTHETIC_DATASET]
    labels = [item["label"] for item in SYNTHETIC_DATASET]
    
    unique_labels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, min_df=1)
    X_tfidf = vectorizer.fit_transform(texts)

    # Extract signal features
    signal_features = []
    for t in texts:
        sigs = detector.analyze_message(t, sender="other")
        vec = [0.0] * 6
        sig_map = {"PII_REQUEST": 0, "SECRECY": 1, "ISOLATION": 2, "COERCION": 3, "TOXICITY": 4, "TARGETED_BEHAVIOR": 5}
        for s in sigs:
            if s.name.value in sig_map:
                vec[sig_map[s.name.value]] = s.score
        signal_features.append(vec)

    X_sig = csr_matrix(np.array(signal_features))
    X = hstack([X_tfidf, X_sig]).tocsr()
    y = np.array(labels)

    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

    clf = LogisticRegression(C=5.0, max_iter=200, class_weight='balanced', random_state=42)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)

    accuracy = float(accuracy_score(y_test, y_pred))
    p, r, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted', zero_division=0)
    cm = confusion_matrix(y_test, y_pred, labels=unique_labels).tolist()

    metrics = {
        "accuracy": round(accuracy, 4),
        "precision": round(float(p), 4),
        "recall": round(float(r), 4),
        "f1_score": round(float(f1), 4),
        "confusion_matrix": cm,
        "labels": unique_labels,
        "sample_count": len(SYNTHETIC_DATASET),
        "last_trained": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
    }

    output_path = os.path.join(os.path.dirname(__file__), "model_metrics.json")
    with open(output_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"ML Model Training & Evaluation Complete!")
    print(f"Accuracy: {accuracy:.4f} | Precision: {p:.4f} | Recall: {r:.4f} | F1: {f1:.4f}")
    return metrics

if __name__ == "__main__":
    train_and_evaluate_model()
