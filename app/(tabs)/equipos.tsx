// Importamos React y hooks para estado y efectos
import React, { useEffect, useState } from 'react';
// Importamos componentes básicos de React Native
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  Button,
} from 'react-native';
// Importamos el selector tipo desplegable
import { Picker } from '@react-native-picker/picker';

// URL base y API key de Supabase (las mismas que en el resto de pantallas)
const SUPABASE_URL = 'https://ofdvyylsuksumtqndwzh.supabase.co';
const SUPABASE_API_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZHZ5eWxzdWtzdW10cW5kd3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzk2NjksImV4cCI6MjA3OTc1NTY2OX0.-VBaenHLxwXCD19mrTYQzj_tpYsVY_sodQGt7vwC3qc';

// Tipo mínimo de Entrenador para esta pantalla (id y Nombre)
type Entrenador = {
  id: number;
  Nombre: string;
};

// Tipo mínimo de Pokémon (id y Nombre)
type Pokemon = {
  id: number;
  Nombre: string;
};

// Fila de la tabla intermedia Equipos (relación Entrenador–Pokémon)
type EquipoFila = {
  id: number;
  entrenador_id: number;
  pokemon_id: number;
  posicion: number;
};

// Tipo para mostrar “Pokémon de un entrenador concreto”
type PokemonDeEntrenador = {
  id: number;       // id del Pokémon
  Nombre: string;   // nombre del Pokémon
  posicion: number; // posición en el equipo
};

// Componente principal de la pestaña de Equipos
export default function EquiposScreen() {
  // Estado de carga inicial (mientras traemos datos de Supabase)
  const [loading, setLoading] = useState(true);

  // Listas que vienen de Supabase
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [equipos, setEquipos] = useState<EquipoFila[]>([]);

  // Entrenador y Pokémon seleccionados en los Pickers
  const [entrenadorSeleccionado, setEntrenadorSeleccionado] =
    useState<number | null>(null);
  const [pokemonSeleccionado, setPokemonSeleccionado] =
    useState<number | null>(null);

  // Campo de texto para la posición dentro del equipo
  const [posicionTexto, setPosicionTexto] = useState('');

  // Lista calculada de “Pokémon del entrenador seleccionado”
  const [pokemonDelEntrenador, setPokemonDelEntrenador] = useState<
    PokemonDeEntrenador[]
  >([]);

  // useEffect inicial: hace 3 peticiones GET a Supabase para
  // Entrenadores, Pokemon y Equipos al montar la pantalla.
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Hacemos las 3 peticiones en paralelo con Promise.all
        const [resEntrenadores, resPokemons, resEquipos] = await Promise.all([
          // GET de Entrenadores (solo id y Nombre)
          fetch(`${SUPABASE_URL}/rest/v1/Entrenadores?select=id,Nombre`, {
            headers: {
              apikey: SUPABASE_API_KEY,
              Authorization: `Bearer ${SUPABASE_API_KEY}`,
            },
          }),
          // GET de Pokemon (solo id y Nombre)
          fetch(`${SUPABASE_URL}/rest/v1/Pokemon?select=id,Nombre`, {
            headers: {
              apikey: SUPABASE_API_KEY,
              Authorization: `Bearer ${SUPABASE_API_KEY}`,
            },
          }),
          // GET de todas las filas de Equipos
          fetch(`${SUPABASE_URL}/rest/v1/Equipos?select=*`, {
            headers: {
              apikey: SUPABASE_API_KEY,
              Authorization: `Bearer ${SUPABASE_API_KEY}`,
            },
          }),
        ]);

        // Convertimos las respuestas a JSON
        const [jsonEntrenadores, jsonPokemons, jsonEquipos] =
          await Promise.all([
            resEntrenadores.json(),
            resPokemons.json(),
            resEquipos.json(),
          ]);

        // Guardamos las listas en estado (siempre arrays)
        setEntrenadores(
          Array.isArray(jsonEntrenadores) ? jsonEntrenadores : []
        );
        setPokemons(Array.isArray(jsonPokemons) ? jsonPokemons : []);
        setEquipos(Array.isArray(jsonEquipos) ? jsonEquipos : []);

        // Seleccionamos por defecto el primer entrenador y el primer Pokémon
        if (Array.isArray(jsonEntrenadores) && jsonEntrenadores.length > 0) {
          setEntrenadorSeleccionado(jsonEntrenadores[0].id);
        }
        if (Array.isArray(jsonPokemons) && jsonPokemons.length > 0) {
          setPokemonSeleccionado(jsonPokemons[0].id);
        }
      } catch (e) {
        console.error('Error cargando datos de equipos', e);
      } finally {
        // Quitamos el indicador de carga
        setLoading(false);
      }
    };

    // Llamamos a la función definida arriba
    fetchAll();
  }, []);

  // Función que calcula “Pokémon del entrenador seleccionado”
  // usando la tabla intermedia Equipos y la lista de pokemons.
  const actualizarPokemonDelEntrenador = () => {
    if (!entrenadorSeleccionado) {
      // Si no hay entrenador elegido, la lista queda vacía
      setPokemonDelEntrenador([]);
      return;
    }

    // 1) Filtramos Equipos por el entrenador actual
    const filasDeEseEntrenador = equipos.filter(
      (fila) => fila.entrenador_id === entrenadorSeleccionado
    );

    // 2) Para cada fila, buscamos el Pokémon correspondiente
    const lista: PokemonDeEntrenador[] = filasDeEseEntrenador
      .map((fila) => {
        const poke = pokemons.find((p) => p.id === fila.pokemon_id);
        if (!poke) return null;

        // Devolvemos objeto con la info que queremos mostrar
        return {
          id: poke.id,
          Nombre: poke.Nombre,
          posicion: fila.posicion,
        };
      })
      // Eliminamos posibles null
      .filter((item): item is PokemonDeEntrenador => item !== null);

    // 3) Actualizamos el estado con la lista resultante
    setPokemonDelEntrenador(lista);
  };

  // Cada vez que cambien el entrenador seleccionado o las filas de Equipos,
  // recalculamos la lista de Pokémon de ese entrenador (simula el endpoint).
  useEffect(() => {
    actualizarPokemonDelEntrenador();
  }, [entrenadorSeleccionado, equipos]);

  // Función para INSERT en Equipos (añadir un Pokémon a un entrenador)
  const agregarAlEquipo = async () => {
    // Validamos que hay entrenador, Pokémon y posición
    if (!entrenadorSeleccionado || !pokemonSeleccionado || !posicionTexto) {
      alert('Selecciona entrenador, Pokémon y posición');
      return;
    }

    // Convertimos la posición a número
    const posicionNum = Number(posicionTexto);
    if (Number.isNaN(posicionNum)) {
      alert('La posición debe ser un número');
      return;
    }

    // Objeto que se enviará a Supabase
    const nuevaFila = {
      entrenador_id: entrenadorSeleccionado,
      pokemon_id: pokemonSeleccionado,
      posicion: posicionNum,
    };

    try {
      // POST a la tabla Equipos con return=representation
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

      // Añadimos las filas nuevas a nuestro estado local
      const filasNuevas = Array.isArray(json) ? json : [json];
      setEquipos((prev) => [...prev, ...filasNuevas]);

      // Limpiamos el campo de posición
      setPosicionTexto('');
    } catch (e) {
      console.error('Error agregando al equipo', e);
      alert('Error de red al agregar al equipo');
    }
  };

  // Función para DELETE en Equipos (quitar una fila del equipo)
  const eliminarFilaEquipo = async (idFila: number) => {
    try {
      // DELETE sobre la fila con id concreto
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

      // Quitamos la fila del estado local
      setEquipos((prev) => prev.filter((fila) => fila.id !== idFila));
    } catch (e) {
      console.error('Error eliminando del equipo', e);
      alert('Error de red al eliminar del equipo');
    }
  };

  // Función auxiliar para obtener el nombre de un entrenador a partir de su id
  const nombreEntrenador = (id: number) =>
    entrenadores.find((e) => e.id === id)?.Nombre ?? `Entrenador ${id}`;

  // Función auxiliar para obtener el nombre de un Pokémon a partir de su id
  const nombrePokemon = (id: number) =>
    pokemons.find((p) => p.id === id)?.Nombre ?? `Pokémon ${id}`;

  // Mientras estamos cargando los datos iniciales mostramos un spinner
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render principal de la pantalla
  return (
    <View style={styles.screen}>
      {/* Cabecera oscura con el título de la pantalla */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestor de Equipos</Text>
      </View>

      {/* Contenido principal */}
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

        {/* Campo para la posición dentro del equipo */}
        <TextInput
          style={styles.input}
          placeholder="Posición en el equipo (1, 2, 3...)"
          value={posicionTexto}
          onChangeText={setPosicionTexto}
          keyboardType="numeric"
        />

        {/* Botón que hace el POST en Equipos */}
        <Button title="AÑADIR AL EQUIPO" onPress={agregarAlEquipo} />

        {/* Lista de Pokémon del entrenador seleccionado
            (este bloque demuestra el endpoint lógico
            “Pokémon de un entrenador concreto”) */}
        <Text style={[styles.title, { marginTop: 16 }]}>
          Pokémon del entrenador seleccionado ({pokemonDelEntrenador.length})
        </Text>

        <FlatList
          data={pokemonDelEntrenador}
          keyExtractor={(item) => item.id.toString() + '-' + item.posicion}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowText}>
                #{item.id} - {item.Nombre} (posición {item.posicion})
              </Text>
            </View>
          )}
        />

        {/* Lista completa de filas de Equipos (todas las relaciones) */}
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

// Estilos de la pantalla (fondos, márgenes, etc.)
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
