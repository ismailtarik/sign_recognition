import React, { useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Assurez-vous que l'import est correct
import PhotoPreviewSection from './PhotoPreviewSection'; // Vérifiez également ce chemin

export default function Camera() {
  const [facing, setFacing] = useState('back'); // 'back' ou 'front'
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [prediction, setPrediction] = useState(null); // Prédiction du backend
  const cameraRef = useRef(null);

  // Gestion des permissions de la caméra
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Bascule entre caméra frontale et arrière
  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Capture et envoi de photo au backend
  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      try {
        // Capture de la photo
        const options = { quality: 0.5, base64: true }; // Réduction de qualité pour une meilleure performance
        const takenPhoto = await cameraRef.current.takePictureAsync(options);

        if (!takenPhoto || !takenPhoto.uri) {
          Alert.alert('Error', 'Failed to capture the photo.');
          return;
        }

        setPhoto(takenPhoto); // Affichage de l'image capturée

        // Préparation des données pour le backend
        const formData = new FormData();
        formData.append('file', {
          uri: takenPhoto.uri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        });

        // Envoi de la requête au backend
        const response = await fetch('http://192.168.1.21:5000/predict', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok && result.predicted_letter) {
          setPrediction(result.predicted_letter);
        } else {
          console.error('Erreur de réponse:', result.error);
          Alert.alert('Prediction Error', 'Unable to get prediction from server.');
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi:', error);
        Alert.alert('Network Error', 'Failed to communicate with the server.');
      }
    }
  };

  // Réinitialise la photo et la prédiction
  const handleRetakePhoto = () => {
    setPhoto(null);
    setPrediction(null);
  };

  if (photo) {
    return (
      <PhotoPreviewSection
        photo={photo}
        handleRetakePhoto={handleRetakePhoto}
      />
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <AntDesign name="retweet" size={44} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
            <AntDesign name="camera" size={44} color="black" />
          </TouchableOpacity>
        </View>
      </CameraView>

      {prediction && (
        <View style={styles.predictionContainer}>
          <Text style={styles.predictionText}>Predicted Letter: {prediction}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: 300,
    height: 400,
    backgroundColor: 'gray',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  button: {
    marginHorizontal: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
  },
  text: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'blue',
  },
  predictionContainer: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 8,
  },
  predictionText: {
    fontSize: 20,
    color: 'white',
  },
});
