from flask import Flask, request, jsonify
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image

app = Flask(__name__)

# Charger le modèle
model = tf.keras.models.load_model('C:\\Users\\tarik\\OneDrive\\Bureau\\TP_ML_DL\\Projet_DL_ML\\my_model.h5')

# Labels pour les lettres arabes
arabic_labels = [
    'ain', 'al', 'aleff', 'bb', 'dal', 'dha', 'dhad', 'fa', 'gaaf', 'ghain',
    'ha', 'haa', 'jeem', 'kaaf', 'khaa', 'la', 'laam', 'meem', 'nun', 'ra',
    'saad', 'seen', 'sheen', 'ta', 'taa', 'thaa', 'thal', 'toot', 'waw', 'ya',
    'yaa', 'zay'
]

def preprocess_img(img):
    """
    Prétraiter une image pour le modèle :
    - Redimensionner
    - Normaliser
    """
    img = cv2.resize(img, (64, 64))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0
    return img_array

@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint pour prédire une lettre arabe à partir d'une image uploadée.
    """
    try:
        # Vérifier si un fichier a été envoyé
        file = request.files.get('file')
        if not file:
            return jsonify({'error': 'No file uploaded'}), 400

        # Lire l'image depuis le fichier
        np_img = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({'error': 'Invalid image file'}), 400

        # Prétraiter l'image
        img_array = preprocess_img(img)

        # Faire une prédiction
        predictions = model.predict(img_array)
        predicted_class = np.argmax(predictions, axis=1)
        arabic_letter = arabic_labels[predicted_class[0]]

        return jsonify({'predicted_letter': arabic_letter})
    except Exception as e:
        print(f"Erreur côté serveur : {e}")
        return jsonify({'error': 'Erreur lors de la prédiction'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
