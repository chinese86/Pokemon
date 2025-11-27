// Componente de tarjeta para mostrar la información de un Pokémon
// Separa la presentación de la lógica de datos.

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

// Definimos el tipo de las props que recibe la tarjeta
type PokemonCardProps = {
  id: number;             // Número de Pokédex
  nombre: string;         // Nombre del Pokémon
  tipo: string;           // Tipo
  descripcion: string;    // Descripción
  foto: string | null;    // URL de la foto o null
};

export function PokemonCard({
  id,
  nombre,
  tipo,
  descripcion,
  foto,
}: PokemonCardProps) {
  return (
    <View style={styles.card}>
      {/* Número de Pokédex y nombre */}
      <Text style={styles.name}>
        #{id} - {nombre}
      </Text>

      {/* Tipo del Pokémon */}
      <Text>{tipo}</Text>

      {/* Descripción (máximo dos líneas) */}
      <Text numberOfLines={2}>{descripcion}</Text>

      {/* Imagen si existe URL */}
      {foto ? <Image source={{ uri: foto }} style={styles.image} /> : null}
    </View>
  );
}

// Estilos propios de la tarjeta (pueden ser iguales a los que ya tenías)
const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#000000',   // Borde negro
    borderRadius: 8,
    backgroundColor: '#F8F8F8', // Gris muy claro
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  image: {
    width: 80,
    height: 80,
    marginTop: 8,
  },
});
