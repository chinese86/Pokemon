#Jerry Wong Cal
#PGL
# Aplicación Pokémon con React Native + Expo y Supabase

## Índice
- [Introducción](#introducción)
- [Desarrollo](#desarrollo)
- [Componentes](#componentes)
- [Pestañas](#pestañas)
- [Pokédex](#pokédex)
- [Entrenadores](#entrenadores)
- [Equipos](#equipos)
- [Cámara](#cámara)
- [Mapa](#mapa)
- [Conclusión](#conclusión)
- [GitHub](#github)

## Introducción
Aplicación sobre equipos Pokémon cuya función es gestionar Pokémon, entrenadores y equipos de forma sencilla desde el móvil. Desarrollada usando React Native + Expo y Supabase, en la que creamos tres tablas: Pokémon, Entrenadores y Equipos, y accedemos a estas tablas utilizando su API REST, lo que permite implementar operaciones completas de creación, lectura, actualización y borrado (CRUD) sobre varias tablas relacionadas.

## Desarrollo
La aplicación utiliza Expo para el desarrollo móvil y Supabase como backend, permitiendo el acceso a datos mediante su API REST. Cada componente se conecta a la API para realizar operaciones CRUD y mostrar la información de forma dinámica.

## Componentes

### Pokédex (index.tsx)
- Lista de Pokémon + formulario.
- Métodos: GET, POST, PATCH, DELETE en `/rest/v1/Pokemon`.

### Entrenadores (entrenadores.tsx)
- Lista + CRUD de entrenadores.

### Equipos (equipos.tsx)
- Usa tabla intermedia Equipos para relacionar Entrenadores ↔ Pokémon (muchos-a-muchos).
- Endpoints: GET de Entrenadores, Pokémon, Equipos; POST y DELETE en Equipos.
- Lista “Pokémon del entrenador seleccionado” calculada con esos datos.

### Cámara (camara.tsx)
- Usa `expo-image-picker` para elegir imagen de galería o cámara, muestra la URI y la imagen.

### Mapa (mapa.tsx)
- Usa `react-native-maps` para mostrar un mapa centrado en una ciudad con un marcador.

## Pestañas

### Pokédex
Muestra la lista de Pokémon y permite gestionarlos.

### Entrenadores
Muestra la lista de entrenadores y permite realizar operaciones CRUD.

### Equipos
Muestra los equipos y permite gestionar la relación entre entrenadores y Pokémon.

### Cámara
Permite seleccionar o tomar fotos desde la cámara del dispositivo.

### Mapa
Muestra un mapa con un marcador en una ubicación predeterminada.

## Ejemplo de código

### Entrenadores (get inicial)
