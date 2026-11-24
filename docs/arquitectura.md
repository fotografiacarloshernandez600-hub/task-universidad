# Arquitectura MVVM

- **Modelos**: types.ts define Tarea, RegistroAcadémico y Bitácora.
- **Vistas**: App.tsx y styles.css presentan datos y formularios.
- **ViewModel**: useAcademic.ts administra estado de la UI, validaciones y operaciones.
- **Repositorios**: academicRepository.ts abstrae creación, edición y borrado lógico.
- **Servicios**: localDb.ts ofrece SQLite nativo (Cordova) o SQLite-WASM persistido en IndexedDB (web). api.ts contiene transporte HTTP, sync.ts implementa cola por estado y logger.ts registra eventos.

## Notas de alcance
La API Express guarda una base SQLite de demostración. Antes de publicar el servicio para usuarios reales, se requieren autenticación, autorización por usuario y un backend alojado persistentemente. La versión inicial usa resolución por marca de tiempo (last-write-wins) y requiere pruebas de conflicto concurrente. Las reglas UJAT para módulos, horarios y trámites son configurables y no sustituyen lineamientos oficiales.
