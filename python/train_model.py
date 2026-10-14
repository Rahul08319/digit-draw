"""
Handwritten Digit Recognition - High-Accuracy CNN Training Script
Dataset: MNIST (60,000 train, 10,000 test)
Libraries: TensorFlow, Keras, NumPy
Target Accuracy: > 99.2%
"""

import os
import numpy as np

def train_and_export():
    try:
        import tensorflow as tf
        from tensorflow.keras import layers, models, callbacks
        from tensorflow.keras.datasets import mnist
        from tensorflow.keras.utils import to_categorical
    except ImportError:
        print("TensorFlow/Keras is required to train the Python model.")
        print("Install via: pip install tensorflow keras numpy")
        return

    print("=" * 60)
    print("DigitDraw: Training MNIST Convolutional Neural Network")
    print(f"TensorFlow Version: {tf.__version__}")
    print("=" * 60)

    # 1. Load MNIST Dataset
    print("\n[1/5] Loading MNIST dataset...")
    (x_train, y_train), (x_test, y_test) = mnist.load_data()

    # 2. Preprocess Data: Reshape to (N, 28, 28, 1) and normalize to [0, 1]
    print("[2/5] Preprocessing and normalizing images...")
    x_train = x_train.reshape(-1, 28, 28, 1).astype('float32') / 255.0
    x_test = x_test.reshape(-1, 28, 28, 1).astype('float32') / 255.0

    y_train_cat = to_categorical(y_train, 10)
    y_test_cat = to_categorical(y_test, 10)

    print(f"Training set: {x_train.shape[0]} samples")
    print(f"Test set:     {x_test.shape[0]} samples")

    # 3. Build Deep CNN Architecture
    print("\n[3/5] Building Convolutional Neural Network architecture...")
    model = models.Sequential([
        # Block 1
        layers.Conv2D(32, kernel_size=(3, 3), padding='same', input_shape=(28, 28, 1)),
        layers.BatchNormalization(),
        layers.Activation('relu'),
        layers.Conv2D(32, kernel_size=(3, 3), padding='same'),
        layers.BatchNormalization(),
        layers.Activation('relu'),
        layers.MaxPooling2D(pool_size=(2, 2)),
        layers.Dropout(0.25),

        # Block 2
        layers.Conv2D(64, kernel_size=(3, 3), padding='same'),
        layers.BatchNormalization(),
        layers.Activation('relu'),
        layers.Conv2D(64, kernel_size=(3, 3), padding='same'),
        layers.BatchNormalization(),
        layers.Activation('relu'),
        layers.MaxPooling2D(pool_size=(2, 2)),
        layers.Dropout(0.25),

        # Dense Classifier Head
        layers.Flatten(),
        layers.Dense(128),
        layers.BatchNormalization(),
        layers.Activation('relu'),
        layers.Dropout(0.5),
        layers.Dense(10, activation='softmax')
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='categoricalCrossentropy',
        metrics=['accuracy']
    )

    model.summary()

    # 4. Data Augmentation Generator
    print("\n[4/5] Training with Data Augmentation (Rotation, Shift, Zoom)...")
    datagen = tf.keras.preprocessing.image.ImageDataGenerator(
        rotation_range=10,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.1
    )
    datagen.fit(x_train)

    # Callbacks
    os.makedirs("models", exist_ok=True)
    cb_checkpoint = callbacks.ModelCheckpoint(
        "models/mnist_cnn_best.keras",
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    )
    cb_reduce_lr = callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=2,
        min_lr=1e-5,
        verbose=1
    )

    batch_size = 64
    epochs = 12

    history = model.fit(
        datagen.flow(x_train, y_train_cat, batch_size=batch_size),
        epochs=epochs,
        validation_data=(x_test, y_test_cat),
        callbacks=[cb_checkpoint, cb_reduce_lr],
        verbose=1
    )

    # 5. Evaluate on Test Set
    print("\n[5/5] Evaluating model on 10,000 MNIST test samples...")
    test_loss, test_acc = model.evaluate(x_test, y_test_cat, verbose=0)
    print(f"Final Test Accuracy: {test_acc * 100:.2f}%")
    print(f"Final Test Loss:     {test_loss:.4f}")

    # Save artifact formats
    model.save("models/mnist_cnn.keras")
    model.save("models/mnist_cnn.h5")
    print("\nSaved models to:")
    print("  - models/mnist_cnn.keras")
    print("  - models/mnist_cnn.h5")

    # Optional: Export to TensorFlow.js
    try:
        import tensorflowjs as tfjs
        tfjs.converters.save_keras_model(model, "models/tfjs_model")
        print("  - models/tfjs_model/ (TensorFlow.js web bundle)")
    except ImportError:
        print("\nNote: 'tensorflowjs' package not detected. To export to web format, run:")
        print("  pip install tensorflowjs")
        print("  tensorflowjs_converter --input_format=keras models/mnist_cnn.keras models/tfjs_model")

if __name__ == '__main__':
    train_and_export()
