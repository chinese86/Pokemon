import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Button,
} from 'react-native';
import { TrainerCard } from '../../components/TrainerCard';

// MISMA URL Y API KEY QUE EN index.tsx
const SUPABASE_URL = 'https://ofdvyylsuksumtqndwzh.supabase.co';
const SUPABASE_API_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZHZ5eWxzdWtzdW10cW5kd3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzk2NjksImV4cCI6MjA3OTc1NTY2OX0.-VBaenHLxwXCD19mrTYQzj_tpYsVY_sodQGt7vwC3qc';

// Ajusta los nombres de columnas EXACTOS a tu tabla Entrenadores
type Entrenador = {
  id: number;
  Nombre: string;
  Ciudad: string;
  nivel: number;
  NombreEquipo: string;
};

export default function EntrenadoresScreen() {
  const [data, setData] = useState<Entrenador[]>([]);
  const [loading, setLoading] = useState(true);

  // formulario
  const [idTexto, setIdTexto] = useState('');
  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [nivelTexto, setNivelTexto] = useState('');
  const [nombreEquipo, setNombreEquipo] = useState('');

  // GET de entrenadores
  useEffect(() => {
    const fetchEntrenadores = async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/Entrenadores?select=*`,
          {
            headers: {
              apikey: SUPABASE_API_KEY,
              Authorization: `Bearer ${SUPABASE_API_KEY}`,
            },
          }
        );
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error('Error cargando entrenadores', e);
      } finally {
        setLoading(false);
      }
    };

    fetchEntrenadores();
  }, []);

  // POST crear entrenador
  const crearEntrenador = async () => {
    if (!idTexto || !nombre || !ciudad || !nivelTexto || !nombreEquipo) {
      alert('Rellena todos los campos del entrenador');
      return;
    }

    const idNum = Number(idTexto);
    const nivelNum = Number(nivelTexto);

    if (Number.isNaN(idNum) || Number.isNaN(nivelNum)) {
      alert('id y nivel deben ser números');
      return;
    }

    const nuevoEntrenador = {
      id: idNum,
      Nombre: nombre,
      Ciudad: ciudad,
      nivel: nivelNum,
      NombreEquipo: nombreEquipo,
    };

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/Entrenadores`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_API_KEY,
          Authorization: `Bearer ${SUPABASE_API_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(nuevoEntrenador),
      });

      const json = await res.json();

      if (!res.ok) {
        console.error('Error creando entrenador', json);
        alert('Error al crear el entrenador (revisa consola)');
        return;
      }

      setData((prev) => [...prev, ...json]);

      setIdTexto('');
      setNombre('');
      setCiudad('');
      setNivelTexto('');
      setNombreEquipo('');
    } catch (e) {
      console.error('Error creando entrenador', e);
      alert('Error de red al crear el entrenador');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Entrenadores Pokémon</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Entrenadores cargados: {data.length}</Text>

        {/* Formulario de creación */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="ID entrenador"
            value={idTexto}
            onChangeText={setIdTexto}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
          />
          <TextInput
            style={styles.input}
            placeholder="Ciudad"
            value={ciudad}
            onChangeText={setCiudad}
          />
          <TextInput
            style={styles.input}
            placeholder="Nivel"
            value={nivelTexto}
            onChangeText={setNivelTexto}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre del equipo"
            value={nombreEquipo}
            onChangeText={setNombreEquipo}
          />

          <Button title="CREAR ENTRENADOR" onPress={crearEntrenador} />
        </View>

        {/* Lista de entrenadores */}
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TrainerCard
              id={item.id}
              nombre={item.Nombre}
              ciudad={item.Ciudad}
              nivel={item.nivel}
              nombreEquipo={item.NombreEquipo}
            />
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  form: {
    marginBottom: 16,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
});
