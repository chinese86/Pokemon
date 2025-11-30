// Mostramos un log en consola cuando se carga la pantalla de tabs
console.log('>>> TABS INDEX CARGADO');

// Importamos React y los hooks de estado y efecto
import React, { useEffect, useState } from 'react';
// Importamos componentes básicos de React Native
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
} from 'react-native';
// Componente de tarjeta para mostrar cada Pokémon visualmente
import { PokemonCard } from '../../components/PokemonCard';

// URL base y API key de Supabase (REST API)
const SUPABASE_URL = 'https://ofdvyylsuksumtqndwzh.supabase.co';
const SUPABASE_API_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZHZ5eWxzdWtzdW10cW5kd3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzk2NjksImV4cCI6MjA3OTc1NTY2OX0.-VBaenHLxwXCD19mrTYQzj_tpYsVY_sodQGt7vwC3qc';

// Tipo que representa una fila de la tabla Pokemon en Supabase
type Pokemon = {
  id: number;
  Nombre: string;
  Tipo: string;
  Descripcion: string;
  Foto: string | null;
};

// Componente principal de la pestaña de Pokédex
export default function Index() {
  // Lista de Pokémon recibida de Supabase
  const [data, setData] = useState<Pokemon[]>([]);
  // Indicador de carga inicial
  const [loading, setLoading] = useState(true);

  // Estado para los campos del formulario (crear / editar)
  const [numero, setNumero] = useState('');       // id o número de Pokédex
  const [nombre, setNombre] = useState('');       // nombre del Pokémon
  const [tipo, setTipo] = useState('');           // tipo (agua, fuego, etc.)
  const [descripcion, setDescripcion] = useState(''); // descripción textual
  const [foto, setFoto] = useState('');           // URL o URI de la foto

  // id del Pokémon que se está editando (null = estamos creando uno nuevo)
  const [idEditando, setIdEditando] = useState<number | null>(null);

  // Al montar el componente, hacemos un GET a Supabase para obtener
  // la lista completa de Pokémon y llenamos la Pokédex.
  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        // Petición GET a la tabla Pokemon usando la REST API de Supabase
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/Pokemon?select=*`,
          {
            headers: {
              apikey: SUPABASE_API_KEY,
              Authorization: `Bearer ${SUPABASE_API_KEY}`,
            },
          }
        );

        // Convertimos la respuesta a JSON
        const json = await res.json();
        // Guardamos la lista en el estado, asegurando que sea un array
        setData(Array.isArray(json) ? json : []);
      } catch (e) {
        console.error('Error cargando Pokémon', e);
      } finally {
        // Quitamos el indicador de carga
        setLoading(false);
      }
    };

    // Llamamos a la función definida arriba
    fetchPokemon();
  }, []);

  // Función para limpiar el formulario y salir del modo edición
  const limpiarFormulario = () => {
    setNumero('');
    setNombre('');
    setTipo('');
    setDescripcion('');
    setFoto('');
    setIdEditando(null); // dejamos de editar un Pokémon concreto
  };

  // CREATE / POST -> crear un nuevo Pokémon en la tabla
  const crearPokemon = async () => {
    try {
      // Validamos campos mínimos obligatorios
      if (!numero || !nombre || !tipo) {
        alert('Rellena Número, Nombre y Tipo');
        return;
      }

      // Convertimos el número de texto a número real
      const idNumero = Number(numero);
      if (Number.isNaN(idNumero)) {
        alert('El Número Pokédex debe ser un número');
        return;
      }

      // Objeto que enviaremos en el body del POST a Supabase
      const nuevoPokemon = {
        id: idNumero,
        Nombre: nombre,
        Tipo: tipo,
        Descripcion: descripcion,
        // Si no hay foto, guardamos null en la base de datos
        Foto: foto ? foto : null,
      };

      // Petición POST a la tabla Pokemon
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/Pokemon`,
        {
          method: 'POST',
          headers: {
            apikey: SUPABASE_API_KEY,
            Authorization: `Bearer ${SUPABASE_API_KEY}`,
            'Content-Type': 'application/json',
            // return=representation nos devuelve la fila creada
            Prefer: 'return=representation',
          },
          body: JSON.stringify(nuevoPokemon),
        }
      );

      const json = await res.json();

      // Si la respuesta no es OK, mostramos error
      if (!res.ok) {
        console.error('Error creando Pokémon', json);
        alert('Error al crear el Pokémon (revisa consola)');
        return;
      }

      // Añadimos la(s) fila(s) nueva(s) a la lista actual de la Pokédex
      const filas = Array.isArray(json) ? json : [json];
      setData((prev) => [...prev, ...filas]);

      // Dejamos el formulario en blanco
      limpiarFormulario();
    } catch (e) {
      console.error('Error creando Pokémon', e);
      alert('Error de red al crear el Pokémon');
    }
  };

  // Al pulsar sobre una tarjeta, cargamos el Pokémon en el formulario
  // para poder editarlo (modo edición).
  const empezarEdicion = (pokemon: Pokemon) => {
    setIdEditando(pokemon.id);           // guardamos el id que estamos editando
    setNumero(String(pokemon.id));       // rellenamos el campo Número
    setNombre(pokemon.Nombre);           // rellenamos el campo Nombre
    setTipo(pokemon.Tipo);              // rellenamos el campo Tipo
    setDescripcion(pokemon.Descripcion ?? ''); // descripción si existe
    setFoto(pokemon.Foto ?? '');        // foto si existe
  };

  // UPDATE / PATCH -> guardar los cambios de un Pokémon ya existente
  const guardarCambios = async () => {
    // Si no hay un idEditando, no deberíamos estar en modo edición
    if (idEditando === null) {
      return;
    }

    try {
      // Validamos campos mínimos
      if (!numero || !nombre || !tipo) {
        alert('Rellena Número, Nombre y Tipo');
        return;
      }

      // Convertimos el número a número real
      const idNumero = Number(numero);
      if (Number.isNaN(idNumero)) {
        alert('El Número Pokédex debe ser un número');
        return;
      }

      // Objeto con los cambios a aplicar en la fila
      const cambios = {
        id: idNumero,
        Nombre: nombre,
        Tipo: tipo,
        Descripcion: descripcion,
        // Aquí está la integración con cámara/galería:
        // cualquier URI o URL que pongamos en `foto`
        // se enviará a la columna Foto en Supabase.
        Foto: foto ? foto : null,
      };

      // PATCH sobre la fila cuyo id sea igual a idEditando
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/Pokemon?id=eq.${idEditando}`,
        {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_API_KEY,
            Authorization: `Bearer ${SUPABASE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cambios),
        }
      );

      // Si algo va mal, intentamos leer el texto de error
      if (!res.ok) {
        let errorText = '';
        try {
          errorText = await res.text();
        } catch {
          // ignoramos errores al leer el texto
        }
        console.error('Error actualizando Pokémon', errorText);
        alert('Error al actualizar el Pokémon (revisa consola)');
        return;
      }

      // Si ha ido bien, volvemos a pedir la lista de todos los Pokémon
      // para mantener la Pokédex sincronizada con la base de datos.
      const resLista = await fetch(
        `${SUPABASE_URL}/rest/v1/Pokemon?select=*`,
        {
          headers: {
            apikey: SUPABASE_API_KEY,
            Authorization: `Bearer ${SUPABASE_API_KEY}`,
          },
        }
      );
      const jsonLista = await resLista.json();
      setData(Array.isArray(jsonLista) ? jsonLista : []);

      // Limpiamos el formulario y salimos del modo edición
      limpiarFormulario();
    } catch (e) {
      console.error('Error actualizando Pokémon', e);
      alert('Error de red al actualizar el Pokémon');
    }
  };

  // DELETE -> borrar un Pokémon definitivo de la tabla
  const borrarPokemon = async (id: number) => {
    try {
      // DELETE sobre la fila con id concreto
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/Pokemon?id=eq.${id}`,
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
        console.error('Error borrando Pokémon', json);
        alert('Error al borrar el Pokémon (revisa consola)');
        return;
      }

      // Quitamos el Pokémon de la lista de la Pokédex en memoria
      setData((prev) => prev.filter((p) => p.id !== id));

      // Si estábamos editando justo ese Pokémon, limpiamos el formulario
      if (idEditando === id) {
        limpiarFormulario();
      }
    } catch (e) {
      console.error('Error borrando Pokémon', e);
      alert('Error de red al borrar el Pokémon');
    }
  };

  // Mientras se está haciendo el GET inicial, mostramos un spinner
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render principal de la pestaña Pokédex
  return (
    <View style={styles.screen}>
      {/* Cabecera roja con el título de la app */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pokédex Escolar</Text>
      </View>

      {/* Contenido principal */}
      <View style={styles.container}>
        <Text style={styles.title}>Pokémon cargados: {data.length}</Text>

        {/* Formulario para crear o editar Pokémon */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Número Pokédex (id)"
            value={numero}
            onChangeText={setNumero}
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
            placeholder="Tipo"
            value={tipo}
            onChangeText={setTipo}
          />

          <TextInput
            style={styles.input}
            placeholder="Descripción"
            value={descripcion}
            onChangeText={setDescripcion}
          />

          {/* Campo para la URL o URI de la foto.
             Aquí puedes pegar la URI obtenida en la pestaña Cámara
             (por ejemplo, de expo-image-picker) para guardarla en Supabase. */}
          <TextInput
            style={styles.input}
            placeholder="URL o URI de la foto (opcional)"
            value={foto}
            onChangeText={setFoto}
          />

          {/* Si no estamos editando, mostramos botón de crear.
             Si sí estamos editando, mostramos botones de guardar y cancelar. */}
          {idEditando === null ? (
            // Modo creación
            <Button title="CREAR POKÉMON" onPress={crearPokemon} />
          ) : (
            // Modo edición
            <>
              <Button title="GUARDAR CAMBIOS" onPress={guardarCambios} />
              <View style={{ height: 8 }} />
              <Button
                title="CANCELAR EDICIÓN"
                color="#888"
                onPress={limpiarFormulario}
              />
            </>
          )}
        </View>

        {/* Lista de Pokémon en la Pokédex */}
        <FlatList
          // Filtramos por seguridad para evitar entradas raras sin id
          data={data.filter((p) => p && typeof p.id === 'number')}
          keyExtractor={(item, index) =>
            item && typeof item.id === 'number'
              ? item.id.toString()
              : `row-${index}`
          }
          renderItem={({ item }) => (
            // Al pulsar la tarjeta, entramos en modo edición para ese Pokémon
            <TouchableOpacity onPress={() => empezarEdicion(item)}>
              <View>
                {/* Tarjeta visual del Pokémon */}
                <PokemonCard
                  id={item.id}
                  nombre={item.Nombre}
                  tipo={item.Tipo}
                  descripcion={item.Descripcion}
                  foto={item.Foto}
                />
                {/* Botón para borrar el Pokémon */}
                <View style={{ marginBottom: 8 }}>
                  <Button
                    title="BORRAR"
                    color="#FF0000"
                    onPress={() => borrarPokemon(item.id)}
                  />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

// Estilos de la pantalla Pokédex
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FF0000', // rojo Pokémon
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
