console.log('>>> TABS INDEX CARGADO');
// Importamos React y los hooks useEffect y useState para manejar estado y efectos
import React, { useEffect, useState } from 'react';
// Importamos componentes básicos de interfaz de React Native
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Button,
} from 'react-native';
// Importamos el componente de tarjeta de Pokémon
import { PokemonCard } from '../../components/PokemonCard';

// URL de tu proyecto Supabase (Settings → API → Project URL)
const SUPABASE_URL = 'https://ofdvyylsuksumtqndwzh.supabase.co';

// Clave pública / anon key de tu proyecto Supabase (Settings → API → Publishable key)
const SUPABASE_API_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZHZ5eWxzdWtzdW10cW5kd3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzk2NjksImV4cCI6MjA3OTc1NTY2OX0.-VBaenHLxwXCD19mrTYQzj_tpYsVY_sodQGt7vwC3qc';

// Tipo de un Pokémon según las columnas reales de la tabla (id, Nombre, Tipo, Descripcion, Foto)
type Pokemon = {
  id: number;          // Número de Pokédex (primary key)
  Nombre: string;      // Nombre del Pokémon
  Tipo: string;        // Tipo (Planta, Fuego, etc.)
  Descripcion: string; // Descripción (sin tilde, igual que en la tabla)
  Foto: string | null; // URL de la foto o null
};

// Componente principal que se usa como pantalla inicial (ruta /index)
export default function Index() {
  // Estado con la lista de Pokémon leídos desde Supabase
  const [data, setData] = useState<Pokemon[]>([]);
  // Estado para mostrar un loader mientras se hace el GET inicial
  const [loading, setLoading] = useState(true);

  // Estados del formulario de creación
  const [numero, setNumero] = useState('');           // Campo para el id / número Pokédex
  const [nombre, setNombre] = useState('');           // Campo para Nombre
  const [tipo, setTipo] = useState('');               // Campo para Tipo
  const [descripcion, setDescripcion] = useState(''); // Campo para Descripcion
  const [foto, setFoto] = useState('');               // Campo para URL de la foto

  // Efecto que se ejecuta al montar el componente para cargar los Pokémon (GET)
  useEffect(() => {
    // Función asíncrona que hace la petición GET a Supabase
    const fetchPokemon = async () => {
      try {
        // Llamada HTTP GET a la REST API de Supabase para leer toda la tabla Pokemon
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/Pokemon?select=*`,
          {
            // Cabeceras necesarias para autenticar la petición
            headers: {
              apikey: SUPABASE_API_KEY,                    // Clave pública
              Authorization: `Bearer ${SUPABASE_API_KEY}`, // Token Bearer con la misma clave
            },
          }
        );

        // Convertimos la respuesta HTTP en un objeto JSON
        const json = await res.json();
        // Guardamos la lista de Pokémon en el estado local
        setData(json);
      } catch (e) {
        // Si ocurre algún error de red o de parseo, lo mostramos en la consola
        console.error('Error cargando Pokémon', e);
      } finally {
        // Sea éxito o error, dejamos de mostrar el indicador de carga
        setLoading(false);
      }
    };

    // Ejecutamos la función que hace el GET
    fetchPokemon();
    // El array vacío hace que solo se ejecute una vez (al montar el componente)
  }, []);

  // Función que se ejecuta al pulsar el botón "CREAR POKÉMON" (POST)
  const crearPokemon = async () => {
    try {
      // Validación básica: que haya número, nombre y tipo
      if (!numero || !nombre || !tipo) {
        alert('Rellena Número, Nombre y Tipo');
        return;
      }

      // Convertimos el número a entero
      const idNumero = Number(numero);

      // Si no es un número válido, avisamos
      if (Number.isNaN(idNumero)) {
        alert('El Número Pokédex debe ser un número');
        return;
      }

      // Construimos el objeto que vamos a enviar a Supabase
      const nuevoPokemon = {
        id: idNumero,             // Usamos el número de Pokédex como id
        Nombre: nombre,           // Nombre del formulario
        Tipo: tipo,               // Tipo del formulario
        Descripcion: descripcion, // Descripcion (sin tilde, igual que en la tabla)
        Foto: foto ? foto : null, // Si no se ha puesto foto, enviamos null
      };

      // Petición HTTP POST a la REST API de Supabase
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/Pokemon`, // Endpoint de la tabla
        {
          method: 'POST',                  // Método POST para crear
          headers: {
            apikey: SUPABASE_API_KEY,                    // Misma clave pública que en el GET
            Authorization: `Bearer ${SUPABASE_API_KEY}`, // Token Bearer
            'Content-Type': 'application/json',          // Indicamos que el cuerpo es JSON
            Prefer: 'return=representation',             // Que devuelva la fila creada
          },
          body: JSON.stringify(nuevoPokemon),            // Cuerpo de la petición en JSON
        }
      );

      // Parseamos la respuesta (normalmente un array con la fila insertada)
      const json = await res.json();

      // Si el código HTTP no es 2xx, mostramos el error
      if (!res.ok) {
        console.error('Error creando Pokémon', json);
        alert('Error al crear el Pokémon (revisa consola)');
        return;
      }

      // Añadimos el nuevo Pokémon a la lista local
      setData((prev) => [...prev, ...json]);

      // Limpiamos los campos del formulario
      setNumero('');
      setNombre('');
      setTipo('');
      setDescripcion('');
      setFoto('');
    } catch (e) {
      // Cualquier error de red u otro problema inesperado
      console.error('Error creando Pokémon', e);
      alert('Error de red al crear el Pokémon');
    }
  };

  // Mientras loading sea true, mostramos un spinner centrado
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
      {/* Cabecera roja tipo Pokémon */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pokédex Escolar</Text>
      </View>

      {/* Contenido principal debajo de la cabecera */}
      <View style={styles.container}>
        {/* Cabecera con el número de Pokémon cargados */}
        <Text style={styles.title}>Pokémon cargados: {data.length}</Text>

        {/* Formulario para crear un nuevo Pokémon */}
        <View style={styles.form}>
          {/* Número Pokédex / id */}
          <TextInput
            style={styles.input}
            placeholder="Número Pokédex (id)"
            value={numero}
            onChangeText={setNumero} // Actualiza el estado numero
            keyboardType="numeric"   // Muestra teclado numérico en móvil
          />

          {/* Nombre */}
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre} // Actualiza el estado nombre
          />

          {/* Tipo */}
          <TextInput
            style={styles.input}
            placeholder="Tipo"
            value={tipo}
            onChangeText={setTipo} // Actualiza el estado tipo
          />

          {/* Descripción */}
          <TextInput
            style={styles.input}
            placeholder="Descripción"
            value={descripcion}
            onChangeText={setDescripcion} // Actualiza el estado descripcion
          />

          {/* URL de la foto */}
          <TextInput
            style={styles.input}
            placeholder="URL de la foto (opcional)"
            value={foto}
            onChangeText={setFoto} // Actualiza el estado foto
          />

          {/* Botón que envía el formulario (POST) */}
          <Button title="CREAR POKÉMON" onPress={crearPokemon} />
        </View>

        {/* Lista de Pokémon obtenidos de Supabase */}
        <FlatList
          data={data}                                  // Array de Pokémon
          keyExtractor={(item) => item.id.toString()}  // Clave única por fila (usa id)
          renderItem={({ item }) => (
            <PokemonCard
              id={item.id}
              nombre={item.Nombre}
              tipo={item.Tipo}
              descripcion={item.Descripcion}
              foto={item.Foto}
            />
          )}
        />
      </View>
    </View>
  );
}

// Estilos de la pantalla
const styles = StyleSheet.create({
  // Vista raíz con fondo blanco
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Cabecera roja tipo Pokémon
  header: {
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Contenedor principal del contenido
  container: {
    flex: 1,       // Ocupa todo el alto disponible
    padding: 16,   // Margen interno
    gap: 12,       // Espacio vertical entre bloques
  },
  center: {
    flex: 1,
    justifyContent: 'center', // Centrado vertical
    alignItems: 'center',     // Centrado horizontal
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
