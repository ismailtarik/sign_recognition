import React from 'react';
import { StyleSheet, SafeAreaView, Image, TouchableOpacity, View, Text } from 'react-native';
import { Fontisto } from '@expo/vector-icons';

const PhotoPreviewSection = ({ photo, handleRetakePhoto }) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.box}>
      {/* Vérification que l'image est bien formée */}
      {photo && photo.base64 ? (
        <Image
          style={styles.previewContainer}
          source={{ uri: 'data:image/jpeg;base64,' + photo.base64 }}  // Utilisation du format base64
        />
      ) : (
        <Text style={styles.errorText}>Aucune image ou image invalide</Text>
      )}
    </View>

    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={handleRetakePhoto}>
        <Fontisto name="trash" size={36} color="black" />
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    borderRadius: 15,
    padding: 1,
    width: '95%',
    backgroundColor: 'darkgray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: '95%',
    height: '85%',
    borderRadius: 15,
  },
  buttonContainer: {
    marginTop: '4%',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    backgroundColor: 'gray',
    borderRadius: 25,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default PhotoPreviewSection;
