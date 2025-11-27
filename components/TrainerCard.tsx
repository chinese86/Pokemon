import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type TrainerCardProps = {
  id: number;
  nombre: string;
  ciudad: string;
  nivel: number;
  nombreEquipo: string;
};

export function TrainerCard({
  id,
  nombre,
  ciudad,
  nivel,
  nombreEquipo,
}: TrainerCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>
        Entrenador #{id} - {nombre}
      </Text>
      <Text>Ciudad: {ciudad}</Text>
      <Text>Nivel: {nivel}</Text>
      <Text>Equipo: {nombreEquipo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    backgroundColor: '#E0F0FF',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
