# Task-Universitario 🎓

**Gestor Académico Multiplataforma UJAT — proyecto académico.**

Monorepo con **Ionic React + Apache Cordova + TypeScript**, arquitectura **MVVM**, **SQLite local** y **REST API**. Sin Capacitor, sin Firebase.

## Incluye

- CRUD de tareas, prioridad, categoría, fecha límite y completado.
- Plan de inglés de **4 u 8 módulos**, desde inscripción hasta acreditación y constancia.
- Registro CEDA / CEFODE, horarios de actividad deportiva o cultural y constancia.
- Agenda académica y bitácora de eventos y errores.
- SQLite nativo en Android mediante `cordova-plugin-sqlite-storage`.
- SQLite mediante sql.js/WebAssembly con base binaria guardada en **IndexedDB** en web; el WASM forma parte del bundle, sin descargarlo de CDN.
- API REST Express (GET, POST, PUT, PATCH, DELETE) y sincronización básica con borrados lógicos.
- Estado pendiente de sincronización, modo local y reintentos manuales/al detectar Internet.

## Requisitos

Node.js LTS, npm, JDK y Android Studio + SDK (para APK), además de Apache Cordova CLI. La aplicación y la API se ejecutan como procesos separados.

## Ejecutar web y API

Desde la raíz del repositorio:

```bash
npm install
npm run dev:api
```

En una segunda terminal:

```bash
npm run dev:web
```

Abre `http://localhost:5173`. API local: `http://localhost:3001`. Para simular desconexión, desactiva red en DevTools, registra tareas, reactiva red y usa **Sincronizar**.

## Generar APK con Apache Cordova (Windows)

```bash
npm install -g cordova
npm install
npm run build:web
cd apps/mobile
cordova platform add android
cordova build android --debug
```

El APK normalmente queda en `apps/mobile/platforms/android/app/build/outputs/apk/debug/app-debug.apk`. Requiere Android SDK y JDK configurados en tu computadora. **No se incluye un APK compilado** en este repositorio.

## Configuración de API en Android

En **Configuración** puedes colocar la URL base de tu API. `localhost` dentro del APK es el teléfono, no la computadora. Para una prueba en red local usa la IP accesible de tu equipo y revisa los permisos de tráfico HTTP de Android; para despliegue real usa **HTTPS**.

La API de demostración utiliza SQLite en el servidor y carece de autenticación; **no se recomienda publicarla como servicio multiusuario**. Antes de pasar a producción agregaremos usuarios, permisos, seguridad y una base remota persistente (por ejemplo Supabase).

## Organización

```text
apps/
  mobile/
    config.xml
    src/models/         Tipos y entidades
    src/views/          Pantallas y estilos
    src/viewmodels/     Estado y operaciones UI
    src/repositories/   Persistencia y cambios CRUD
    src/services/       SQLite, API, sincronización, bitácora
  api/
    src/                Servidor Express REST + SQLite
    tests/              Pruebas automatizadas de endpoints
docs/
  arquitectura.md
  pruebas.md
```

## Estado y limitaciones

Código **inicial de desarrollo**, no entrega final certificada. Hace falta ejecutar las pruebas web/Android, revisar compatibilidad de SDK y plugin, implementar autenticación, resolver conflictos concurrentes de sincronización y completar las evidencias. Los requisitos exactos de titulación, CEDA/CEFODE y horarios deben verificarse con la UJAT.

## Pruebas automatizadas de API

```bash
npm run test:api
```

Consulta `docs/pruebas.md` para la matriz que se llenará con resultados obtenidos.
