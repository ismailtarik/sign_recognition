import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Alert, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  PermissionsAndroid, 
  Platform 
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import axios from 'axios';

export default function App() {
  const [imageUri, setImageUri] = useState(null);
  const [predictedLetter, setPredictedLetter] = useState(null);

  // Demander la permission pour la caméra (Android uniquement)
  const requestCameraPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        if (
          granted['android.permission.CAMERA'] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          Alert.alert(
            'Permissions requises',
            'La caméra et l’accès au stockage sont nécessaires pour utiliser cette fonctionnalité.'
          );
          return false;
        }
        return true;
      } catch (error) {
        console.error('Erreur lors de la demande des permissions :', error);
        return false;
      }
    }
    return true;
  };

  // Fonction pour démarrer la caméra
  const startCamera = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        saveToPhotos: true,
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          Alert.alert('Action annulée', 'Vous avez annulé la capture.');
        } else if (response.errorCode) {
          Alert.alert('Erreur caméra', `Erreur : ${response.errorCode}`);
        } else if (response.assets && response.assets.length > 0) {
          const photo = response.assets[0];
          setImageUri(photo.uri);
          sendImageToServer(photo); // Envoyer l'image au backend
        } else {
          Alert.alert('Erreur', 'Impossible de capturer une image.');
        }
      }
    );
  };

  // Fonction pour envoyer l'image au serveur Flask
  const sendImageToServer = async (photo) => {
    const formData = new FormData();
    formData.append('file', {
      uri: photo.uri,
      type: photo.type,
      name: photo.fileName,
    });

    try {
      const response = await axios.post('http://192.168.0.151:5000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPredictedLetter(response.data.predicted_letter);
    } catch (error) {
      console.error('Erreur lors de l’envoi de l’image :', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la prédiction.');
    }
  };

  return (
    <View style={styles.container}>
      {imageUri ? (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Text style={styles.prediction}>
            Prédiction : {predictedLetter || 'En attente...'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={startCamera}>
            <Text style={styles.buttonText}>Reprendre une photo</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Reconnaissance de Lettres Arabes</Text>
          <TouchableOpacity style={styles.button} onPress={startCamera}>
            <Text style={styles.buttonText}>Démarrer</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 16 },
  image: { width: 300, height: 300, marginBottom: 20 },
  prediction: { fontSize: 18, marginBottom: 20 },
});
