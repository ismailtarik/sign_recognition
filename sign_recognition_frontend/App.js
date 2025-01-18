import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomCamera from './Camera';  // Assurez-vous que le chemin d'importation est correct

export default function App() {
  return (
    <View style={styles.container}>
      <CustomCamera />  {/* Composant de la caméra */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
