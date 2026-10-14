"""
Model Evaluation and Error Diagnostics Script
Computes test metrics, per-class precision/recall, and confusion matrix.
"""

import os
import numpy as np

def run_evaluation():
    try:
        import tensorflow as tf
        from tensorflow.keras.datasets import mnist
        from tensorflow.keras.utils import to_categorical
    except ImportError:
        print("TensorFlow is required for evaluation. Run: pip install tensorflow")
        return

    model_path = "models/mnist_cnn.keras"
    if not os.path.exists(model_path):
        model_path = "models/mnist_cnn_best.keras"
        if not os.path.exists(model_path):
            print("Trained model checkpoint not found in models/. Run 'python train_model.py' first.")
            return

    print(f"Loading model from: {model_path}")
    model = tf.keras.models.load_model(model_path)

    (_, _), (x_test, y_test) = mnist.load_data()
    x_test_norm = x_test.reshape(-1, 28, 28, 1).astype('float32') / 255.0

    print("Running inference across 10,000 test samples...")
    predictions = model.predict(x_test_norm, batch_size=128)
    y_pred = np.argmax(predictions, axis=1)

    # Compute Confusion Matrix
    num_classes = 10
    confusion_matrix = np.zeros((num_classes, num_classes), dtype=int)
    for true_label, pred_label in zip(y_test, y_pred):
        confusion_matrix[true_label, pred_label] += 1

    overall_accuracy = np.trace(confusion_matrix) / len(y_test)
    print("\n" + "=" * 55)
    print(f"Overall MNIST Test Accuracy: {overall_accuracy * 100:.2f}%")
    print("=" * 55)

    print("\nPer-Digit Performance Report:")
    print(f"{'Digit':<8} {'Support':<10} {'Precision':<12} {'Recall':<10} {'F1-Score':<10}")
    print("-" * 55)

    for digit in range(num_classes):
        tp = confusion_matrix[digit, digit]
        fp = np.sum(confusion_matrix[:, digit]) - tp
        fn = np.sum(confusion_matrix[digit, :]) - tp
        support = np.sum(confusion_matrix[digit, :])

        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

        print(f"{digit:<8} {support:<10} {precision * 100:<11.2f}% {recall * 100:<9.2f}% {f1:<10.4f}")

    print("-" * 55)

if __name__ == '__main__':
    run_evaluation()
