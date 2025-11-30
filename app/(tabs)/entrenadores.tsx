import React, { useEffect, useState } from 'react';
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
import { TrainerCard } from '../../components/TrainerCard';

// URL y API key de Supabase (las mismas que en index.tsx)
const SUPABASE_URL = 'https://ofdvyylsuksumtqndwzh.supabase.co';
const SUPABASE_API_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZHZ5eWxzdWtzdW10cW5kd3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzk2NjksImV4cCI6MjA3OTc1NTY2OX0.-VBaenHLxwXCD19mrTYQzj_tpYsVY_sodQGt7vwC3qc';

// Tipo que representa una fila de la tabla Entrenadores
type Entrenador = {
  id: number;
  Nombre: string;
  Ciudad: string;
  nivel: number;
  NombreEquipo: string;
};

export default function EntrenadoresScreen() {
  // Lista de entrenadores que viene de Supabase
  const [data, setData] = useState<Entrenador[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado del formulario
  const [idTexto, setIdTexto] = useState('');
  const [nombre, setNombre] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [nivelTexto, setNivelTexto] = useState('');
  const [nombreEquipo, setNombreEquipo] = useState('');

  // id del entrenador que se está editando (null = modo crear)
  const [idEditando, setIdEditando] = useState<number | null>(null);

  // GET inicial de todos los entrenadores
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
        setData(Array.isArray(json) ? json : []);
      } catch (e) {
        console.error('Error cargando entrenadores', e);
      } finally {
        setLoading(false);
      }
    };

    fetchEntrenadores();
  }, []);

  // Limpiar formulario y salir de modo edición
  const limpiarFormulario = () => {
    setIdTexto('');
    setNombre('');
    setCiudad('');
    setNivelTexto('');
    setNombreEquipo('');
    setIdEditando(null);
  };

  // CREATE / POST
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

      const filas = Array.isArray(json) ? json : [json];
      setData((prev) => [...prev, ...filas]);
      limpiarFormulario();
    } catch (e) {
      console.error('Error creando entrenador', e);
      alert('Error de red al crear el entrenador');
    }
  };

  // Cargar un entrenador en el formulario (entrar en modo edición)
  const empezarEdicion = (entrenador: Entrenador) => {
    setIdEditando(entrenador.id);
    setIdTexto(String(entrenador.id));
    setNombre(entrenador.Nombre);
    setCiudad(entrenador.Ciudad);
    setNivelTexto(String(entrenador.nivel));
    setNombreEquipo(entrenador.NombreEquipo);
  };

  // UPDATE / PATCH
  const guardarCambios = async () => {
    if (idEditando === null) {
      return;
    }

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

    const cambios = {
      id: idNum,
      Nombre: nombre,
      Ciudad: ciudad,
      nivel: nivelNum,
      NombreEquipo: nombreEquipo,
    };

    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/Entrenadores?id=eq.${idEditando}`,
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

      if (!res.ok) {
        let errorText = '';
        try {
          errorText = await res.text();
        } catch {
          // ignoramos
        }
        console.error('Error actualizando entrenador', errorText);
        alert('Error al actualizar el entrenador (revisa consola)');
        return;
      }

      // Recargar lista completa
      const resLista = await fetch(
        `${SUPABASE_URL}/rest/v1/Entrenadores?select=*`,
        {
          headers: {
            apikey: SUPABASE_API_KEY,
            Authorization: `Bearer ${SUPABASE_API_KEY}`,
          },
        }
      );
      const jsonLista = await resLista.json();
      setData(Array.isArray(jsonLista) ? jsonLista : []);

      limpiarFormulario();
    } catch (e) {
      console.error('Error actualizando entrenador', e);
      alert('Error de red al actualizar el entrenador');
    }
  };

  // DELETE
  const borrarEntrenador = async (id: number) => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/Entrenadores?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            apikey: SUPABASE_API_KEY,
            Authorization: `Bearer ${SUPABASE_API_KEY}`,
          },
        }
      );

      if (!res.ok) {
        let txt = '';
        try {
          txt = await res.text();
        } catch {
          // ignoramos
        }
        console.error('Error borrando entrenador', txt);
        alert('Error al borrar el entrenador (revisa consola)');
        return;
      }

      setData((prev) => prev.filter((e) => e.id !== id));

      if (idEditando === id) {
        limpiarFormulario();
      }
    } catch (e) {
      console.error('Error borrando entrenador', e);
      alert('Error de red al borrar el entrenador');
    }
  };

  // Mientras carga el GET inicial
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Cabecera */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Entrenadores Pokémon</Text>
      </View>

      {/* Contenido */}
      <View style={styles.container}>
        <Text style={styles.title}>
          Entrenadores cargados: {data.length}
        </Text>

        {/* Formulario de crear / editar */}
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

          {idEditando === null ? (
            <Button title="CREAR ENTRENADOR" onPress={crearEntrenador} />
          ) : (
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

        {/* Lista de entrenadores */}
        <FlatList
          data={data}
          keyExtractor={(item, index) =>
            item && typeof item.id === 'number'
              ? item.id.toString()
              : `row-${index}`
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => empezarEdicion(item)}>
              <View>
                <TrainerCard
                  id={item.id}
                  nombre={item.Nombre}
                  ciudad={item.Ciudad}
                  nivel={item.nivel}
                  nombreEquipo={item.NombreEquipo}
                />
                <View style={{ marginBottom: 8 }}>
                  <Button
                    title="BORRAR"
                    color="#FF0000"
                    onPress={() => borrarEntrenador(item.id)}
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

// Estilos
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
