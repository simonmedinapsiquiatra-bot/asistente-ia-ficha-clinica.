# Clinical Docs AI

Clinical Docs AI es una aplicación web impulsada por Inteligencia Artificial diseñada específicamente para asistir a profesionales de la salud mental (como psiquiatras y psicólogos) en la generación de documentación clínica y evoluciones médicas.

## Características Principales

* **Generación Modular de Documentos**: Genera documentos clínicos por secciones (Motivo de consulta, Enfermedad actual, Antecedentes, Examen mental, Impresión diagnóstica, Indicaciones/Tratamiento).
* **Organización Flexible**: Las secciones del documento final pueden ser ordenadas mediante arrastrar y soltar (Drag and Drop) antes de solicitar la generación.
* **Múltiples Fuentes de Entrada**:
  * **Ficha Clínica**: Permite adjuntar el historial del paciente leyendo documentos directamente desde Google Drive o subiendo archivos de texto locales.
  * **Transcripción de Voz (es-CL)**: Grabación en tiempo real (speech-to-text) adaptada al español de Chile, optimizada para capturar el diálogo durante la sesión.
  * **Apuntes Manuales**: Área de texto amplia para las notas del clínico durante la sesión.
* **Terminología Especializada Interna**: Incorpora un glosario interno invisible (bibliografía semiológica) que asegura que la IA utilice un lenguaje técnico formal y estandarizado (ej. eutímico, taquipsiquia, alucinaciones).
* **Modo de Acceso Dual**: Permite autenticación segura con Google (para acceso a Drive) o un "Modo Invitado" para uso rápido sin vinculación de cuenta.
* **Exportación**: Renderizado del documento final en Markdown con un botón rápido para copiar al portapapeles.

## Tecnologías Utilizadas

* **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons.
* **Reconocimiento de Voz**: Web Speech API nativa del navegador.
* **IA y Backend**: Integración con la API de Gemini de Google (vía `@google/genai`) mediante un servidor Express backend intermedio (Arquitectura Full-Stack).
* **Autenticación y Almacenamiento**: Firebase Auth y Google Drive API.

## Consideraciones de Seguridad y Privacidad

- **No almacena datos sensibles en bases de datos externas**: La aplicación procesa los datos en memoria para generar el documento y los envía directamente al LLM; no guarda historiales clínicos en una base de datos propia.
- Las consultas a Google Drive se realizan bajo los permisos delegados del usuario (OAuth) exclusivamente para extraer el texto durante la sesión.

## Ejecución Local

1. Instalar dependencias: `npm install`
2. Configurar variables de entorno `.env` (necesita `GEMINI_API_KEY`).
3. Iniciar entorno de desarrollo: `npm run dev`
