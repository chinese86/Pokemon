// Importa los módulos base de React Native y react-native-maps
import React from 'react';
import { View, StyleSheet } from 'react-native';
// MapView muestra el mapa y Marker señala ubicaciones en el mapa
import MapView, { Marker } from 'react-native-maps';

// Pantalla sencilla de mapa centrado en Madrid como ciudad ejemplo de entrenador
export default function MapaScreen() {
  return (
    // El View crea el contenedor principal de la pantalla (ocupa toda la pantalla)
    <View style={styles.container}>
      {/* MapView es el componente principal que dibuja el mapa */}
      <MapView
        style={styles.map}
        // initialRegion indica el centro del mapa y el nivel de zoom (delta)
        initialRegion={{
          latitude: 28.12743,      
          longitude: -15.44684,     
          latitudeDelta: 0.1,     
          longitudeDelta: 0.1,    
        }}
      >
        {/* Marker dibuja un punto en el mapa con título y descripción */}
        <Marker
          coordinate={{ latitude: 40.4168, longitude: -3.7038 }}
          title="Ciudad del entrenador"
          description="Ejemplo de marcador fijo en el mapa"
        />
      </MapView>
    </View>
  );
}

// Estilos separan el mapa y el contenedor, para que ocupen toda la pantalla
const styles = StyleSheet.create({
  container: { flex: 1 }, // Hace que el contenedor use todo el espacio disponible
  map: { flex: 1 },       // El mapa ocupa todo el espacio del contenedor
});
