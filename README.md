# 🚌 PelicanTracker (v0.1 - Alpha)

**Trabajo de Fin de Grado (TFG) - Desarrollo de Aplicaciones Web**

PelicanTracker es una plataforma web diseñada para el **rastreo en tiempo real** del transporte urbano en Carmona (Sevilla). El objetivo final es conectar dispositivos GPS (Sinotrack OBD) con una interfaz web moderna para visualizar la ubicación del autobús en vivo.

> 🚧 **Estado Actual:** Fase de Construcción de Frontend y Arquitectura Base.

## ✅ Lo que tenemos implementado actualmente

A fecha de hoy, el proyecto cuenta con los cimientos sólidos de la arquitectura **Monorepo** y la interfaz visual principal:

### 1. Arquitectura del Proyecto
- **Estructura Monorepo:** Gestión unificada de `client` (Frontend) y `server` (Backend) en un solo repositorio.
- **Scripts Automatizados:** Configuración de `concurrently` para ejecutar todo el entorno de desarrollo con un solo comando (`npm run start:all`).

### 2. Frontend (Cliente)
- **Motor Visual:** React + Vite funcionando correctamente.
- **Mapa Interactivo:** Integración de **React-Leaflet** con OpenStreetMap.
  - *Estado:* Centrado en las coordenadas de **Carmona, Sevilla**.
  - *Configuración:* Zoom optimizado y controles por defecto desactivados para personalización.
- **Diseño UI (Glassmorphism):**
  - Implementación de **Tailwind CSS (v3.4)**.
  - Estilos translúcidos (efecto cristal) en paneles y tarjetas.
  - Tipografías y reseteo de estilos globales para pantalla completa (HUD).
- **Componentes Base:** Estructura de carpetas lista (`/components/Map`, `/components/UI`) y primeros componentes visuales creados.

### 3. Backend (Servidor)
- **Estructura Inicial:** Servidor Node.js inicializado.
- **Dependencias:** Instalación de `express`, `socket.io` y `mongoose` lista para empezar a desarrollar la lógica.

---

## 🛠️ Stack Tecnológico Actual

- **Frontend:** React 18, Vite, Tailwind CSS 3.4, React-Leaflet, Lucide-React (Iconos).
- **Backend:** Node.js (Estructura lista).
- **Control de Versiones:** Git + GitHub.

---

## 📸 Capturas (Próximamente)
*(Aquí irá una captura del mapa de Carmona con la UI de cristal)*

---

## ⚙️ Instalación y Despliegue Local

Si descargas este repositorio en su estado actual, sigue estos pasos para verlo funcionar:

1. **Clonar el proyecto:**
   ```bash
   git clone <URL_DEL_REPO>
   cd PelicanTracker