import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  Button,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

// MISMA URL Y API KEY
const SUPABASE_URL = 'https://ofdvyylsuksumtqndwzh.supabase.co';
const SUPABASE_API_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZHZ5eWxzdWtzdW10cW5kd3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzk2NjksImV4cCI6MjA3OTc1NTY2OX0.-VBaenHLxwXCD19mrTYQzj_tpYsVY_sodQGt7vwC3qc';

// Tipos según tus tablas
type Entrenador = {
  id: number;
  Nombre: string;
};

type Pokemon = {
  id: number;
  Nombre: string;
};

type EquipoFila = {
  id: number;
  entrenador_id: number;
  pokemon_id: number;
  posicion: number;
};

export default function EquiposScreen() {
  const [loading, setLoading] = useState(true);

  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [equipos, setEquipos] = useState<EquipoFila[]>([]);

  const [entrenadorSeleccionado, setEntrenadorSeleccionado] = useState<number | null>(null);
  const [pokemonSeleccionado, setPokemonSeleccionado] = useState<number | null>(null);
  const [posicionTexto, setPosicionTexto] = useState('');

  // Cargar entrenadores, pokemons y equipos
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resEntrenadores, resPokemons, resEquipos] = await Promise.all([
          fetch(`${SUPABASE_URL}/rest/v1/Entrenadores?select=id,Nombre`, {
            headers: {
              apikey: SUPABASE_API_KEY,
              Authorization: `Bearer ${SUPABASE_API_KEY}`,
            },
          }),
          fetch(`${SUPABASE_URL}/rest/v1/Pokemon?select=id,Nombre`, {
            headers: {
              apikey: SUPABASE_API_KEY,
              Authorization: `Bearer ${SUPABASE_API_KEY}`,
            },
          }),
          fetch(`${SUPABASE_URL}/rest/v1/Equipos?select=*`, {
            headers: {
              apikey: SUPABASE_API_KEY,
              Authorization: `Bearer ${SUPABASE_API_KEY}`,
            },
          }),
        ]);

        const [jsonEntrenadores, jsonPokemons, jsonEquipos] = await Promise.all([
          resEntrenadores.json(),
          resPokemons.json(),
          resEquipos.json(),
        ]);

        setEntrenadores(Array.isArray(jsonEntrenadores) ? jsonEntrenadores : []);
        setPokemons(Array.isArray(jsonPokemons) ? jsonPokemons : []);
        setEquipos(Array.isArray(jsonEquipos) ? jsonEquipos : []);

        if (Array.isArray(jsonEntrenadores) && jsonEntrenadores.length > 0) {
          setEntrenadorSeleccionado(jsonEntrenadores[0].id);
        }
        if (Array.isArray(jsonPokemons) && jsonPokemons.length > 0) {
          setPokemonSeleccionado(jsonPokemons[0].id);
        }
      } catch (e) {
        console.error('Error cargando datos de equipos', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Añadir Pokémon a un entrenador (INSERT en Equipos)
  const agregarAlEquipo = async () => {
    if (!entrenadorSeleccionado || !pokemonSeleccionado || !posicionTexto) {
      alert('Selecciona entrenador, Pokémon y posición');
      return;
    }

    const posicionNum = Number(posicionTexto);
    if (Number.isNaN(posicionNum)) {
      alert('La posición debe ser un número');
      return;
    }

    const nuevaFila = {
      entrenador_id: entrenadorSeleccionado,
      pokemon_id: pokemonSeleccionado,
      posicion: posicionNum,
    };

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/Equipos`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_API_KEY,
          Authorization: `Bearer ${SUPABASE_API_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(nuevaFila),
      });

      const json = await res.json();

      if (!res.ok) {
        console.error('Error agregando al equipo', json);
        alert('Error al agregar al equipo (revisa consola)');
        return;
      }

      const filasNuevas = Array.isArray(json) ? json : [json];
      setEquipos((prev) => [...prev, ...filasNuevas]);
      setPosicionTexto('');
    } catch (e) {
      console.error('Error agregando al equipo', e);
      alert('Error de red al agregar al equipo');
    }
  };

  // Quitar Pokémon de un equipo (DELETE en Equipos)
  const eliminarFilaEquipo = async (idFila: number) => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/Equipos?id=eq.${idFila}`,
        {
          method: 'DELETE',
          headers: {
            apikey: SUPABASE_API_KEY,
            Authorization: `Bearer ${SUPABASE_API_KEY}`,
          },
        }
      );

      if (!res.ok) {
        const json = await res.json();
        console.error('Error eliminando del equipo', json);
        alert('Error al eliminar del equipo (revisa consola)');
        return;
      }

      setEquipos((prev) => prev.filter((fila) => fila.id !== idFila));
    } catch (e) {
      console.error('Error eliminando del equipo', e);
      alert('Error de red al eliminar del equipo');
    }
  };

  // Helpers para mostrar nombres
  const nombreEntrenador = (id: number) =>
    entrenadores.find((e) => e.id === id)?.Nombre ?? `Entrenador ${id}`;

  const nombrePokemon = (id: number) =>
    pokemons.find((p) => p.id === id)?.Nombre ?? `Pokémon ${id}`;

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
        <Text style={styles.headerTitle}>Gestor de Equipos</Text>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Asignar Pokémon a entrenadores</Text>

        {/* Selector de entrenador */}
        <Text>Entrenador:</Text>
        <Picker
          selectedValue={entrenadorSeleccionado ?? undefined}
          style={styles.picker}
          onValueChange={(value) => setEntrenadorSeleccionado(value)}
        >
          {(entrenadores || []).map((ent) => (
            <Picker.Item
              key={ent.id}
              label={`${ent.id} - ${ent.Nombre}`}
              value={ent.id}
            />
          ))}
        </Picker>

        {/* Selector de Pokémon */}
        <Text>Pokémon:</Text>
        <Picker
          selectedValue={pokemonSeleccionado ?? undefined}
          style={styles.picker}
          onValueChange={(value) => setPokemonSeleccionado(value)}
        >
          {(pokemons || []).map((pk) => (
            <Picker.Item
              key={pk.id}
              label={`${pk.id} - ${pk.Nombre}`}
              value={pk.id}
            />
          ))}
        </Picker>

        {/* Posición */}
        <TextInput
          style={styles.input}
          placeholder="Posición en el equipo (1, 2, 3...)"
          value={posicionTexto}
          onChangeText={setPosicionTexto}
          keyboardType="numeric"
        />

        <Button title="AÑADIR AL EQUIPO" onPress={agregarAlEquipo} />

        {/* Lista de filas de Equipos */}
        <Text style={[styles.title, { marginTop: 16 }]}>
          Composición de equipos ({equipos.length} filas)
        </Text>

        <FlatList
          data={equipos || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowText}>
                Entrenador: {nombreEntrenador(item.entrenador_id)} | Pokémon:{' '}
                {nombrePokemon(item.pokemon_id)} | Posición: {item.posicion}
              </Text>
              <Button
                title="Quitar"
                color="#FF0000"
                onPress={() => eliminarFilaEquipo(item.id)}
              />
            </View>
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
    backgroundColor: '#222222',
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  picker: {
    height: 40,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 8,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#ccc',
  },
  rowText: {
    flex: 1,
    marginRight: 8,
  },
});
