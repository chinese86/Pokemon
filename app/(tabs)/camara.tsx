// Importamos React y useState para guardar la imagen seleccionada
import React, { useState } from 'react';
// Componentes básicos de interfaz de React Native
import { View, Text, StyleSheet, Button, Image, Alert } from 'react-native';
// Módulo de Expo para acceder a cámara y galería
import * as ImagePicker from 'expo-image-picker';

// Componente principal de la pestaña "Cámara"
export default function CamaraScreen() {
  // Estado para guardar la URI (ruta local) de la imagen seleccionada o tomada
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Función para pedir permiso y abrir la GALERÍA de imágenes
  const elegirDesdeGaleria = async () => {
    // Pedimos permiso de acceso a la galería (media library)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    // Si el usuario no da permiso, mostramos aviso y salimos
    if (status !== 'granted') {
      Alert.alert(
        'Permiso requerido',
        'Necesitas dar permiso a la galería para elegir una imagen.'
      );
      return;
    }

    // Abrimos el selector de imágenes de la galería
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // solo imágenes
      allowsEditing: true,                             // permitir recorte
      quality: 1,                                      // calidad máxima
    });

    // Si el usuario cancela, no hacemos nada
    if (result.canceled) {
      return;
    }

    // Tomamos la primera imagen seleccionada y guardamos su URI en el estado
    const uri = result.assets[0].uri;
    setImageUri(uri);
  };

  // Función para pedir permiso y abrir la CÁMARA
  const tomarFotoConCamara = async () => {
    // Pedimos permiso de acceso a la cámara
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    // Si no hay permiso, mostramos un aviso
    if (status !== 'granted') {
      Alert.alert(
        'Permiso requerido',
        'Necesitas dar permiso a la cámara para hacer una foto.'
      );
      return;
    }

    // Abrimos la cámara del dispositivo
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,           // permitir recorte básico
      quality: 1,                    // calidad máxima
    });

    // Si el usuario cancela, salimos
    if (result.canceled) {
      return;
    }

    // Guardamos la URI de la foto tomada
    const uri = result.assets[0].uri;
    setImageUri(uri);
  };

  // Render de la pantalla
  return (
    <View style={styles.screen}>
      {/* Cabecera simple para la pestaña de cámara */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cámara y Galería</Text>
      </View>

      {/* Contenido principal */}
      <View style={styles.container}>
        <Text style={styles.text}>
          Aquí puedes probar la cámara y la galería. La imagen seleccionada se
          muestra debajo.
        </Text>

        {/* Botón para abrir la galería */}
        <Button
          title="Elegir imagen de la galería"
          onPress={elegirDesdeGaleria}
        />

        {/* Espacio vertical entre botones */}
        <View style={{ height: 12 }} />

        {/* Botón para abrir la cámara */}
        <Button
          title="Tomar foto con la cámara"
          onPress={tomarFotoConCamara}
        />

        {/* Si hay una imagen seleccionada, la mostramos */}
     {imageUri && (
  <View style={styles.imageContainer}>
    <Text style={styles.text}>Imagen seleccionada:</Text>

    {/* Mostramos la URI de la imagen como texto, para poder leerla/explicarla */}
    <Text style={[styles.text, { fontSize: 12 }]}>
      URI: {imageUri}
    </Text>

    <Image
      source={{ uri: imageUri }}
      style={styles.image}
      resizeMode="cover"
    />
  </View>
)}

      </View>
    </View>
  );
}

// Estilos de la pantalla
const styles = StyleSheet.create({
  screen: {
    flex: 1,                 // La pantalla ocupa todo el alto disponible
    backgroundColor: '#FFF', // Fondo blanco
  },
  header: {
    backgroundColor: '#000', // Cabecera negra
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#FFF',           // Texto blanco
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 12,                 // Pequeño espacio entre elementos (solo RN nuevo)
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  imageContainer: {
    marginTop: 16,
    alignItems: 'center',    // Centrar la imagen en horizontal
  },
  image: {
    width: 250,              // Ancho de la imagen en píxeles
    height: 250,             // Alto de la imagen
    borderRadius: 8,         // Bordes redondeados
    borderWidth: 1,
    borderColor: '#ccc',
  },
});
