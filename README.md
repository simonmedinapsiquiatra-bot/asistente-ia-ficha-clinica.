# Clinical Docs AI

Clinical Docs AI es una aplicación web impulsada por Inteligencia Artificial diseñada específicamente para asistir a profesionales de la salud mental (como psiquiatras y psicólogos) en la generación de documentación clínica y evoluciones médicas.

## Características Principales

* **Generación Modular de Documentos**: Genera documentos clínicos por secciones (Motivo de consulta, Enfermedad actual, Antecedentes, Examen mental, Impresión diagnóstica, Indicaciones/Tratamiento).
* **Organización Flexible**: Las secciones del documento final pueden ser ordenadas mediante arrastrar y soltar (Drag and Drop) antes de solicitar la generación.
* **Instrucciones Personalizadas**: Permite agregar instrucciones adicionales a la IA para modificar el tono, el resumen o hacer hincapié en síntomas específicos.
* **Múltiples Fuentes de Entrada**:
  * **Ficha Clínica**: Permite adjuntar el historial del paciente copiando y pegando, subiendo documentos Word (.docx), archivos de texto (.txt) o leyendo directamente desde Google Drive.
  * **Transcripción de Voz (es-CL)**: Grabación en tiempo real (speech-to-text) adaptada al español de Chile, optimizada para capturar el diálogo durante la sesión.
  * **Apuntes Manuales**: Área de texto amplia para las notas del clínico durante la sesión.
* **Terminología Especializada Interna**: Incorpora un glosario interno invisible (bibliografía semiológica) que asegura que la IA utilice un lenguaje técnico formal y estandarizado (ej. eutímico, taquipsiquia, alucinaciones).
* **Exportación**: Renderizado del documento final en Markdown con un botón rápido para copiar al portapapeles.

## Tecnologías Utilizadas

* **Frontend**: React, Vite, TypeScript, Tailwind CSS, Lucide Icons.
* **Reconocimiento de Voz**: Web Speech API nativa del navegador.
* **Procesamiento de Archivos**: `mammoth` para lectura de archivos Word (.docx) de forma nativa en el cliente.
* **Inteligencia Artificial**: Integración nativa desde el cliente con la API de Google Gemini (vía `@google/genai`).
* **Integración con Drive**: `@react-oauth/google` y Google Drive API v3.
* **Sin Backend**: La aplicación es 100% Client-Side. No depende de servidores intermedios, Firebase, ni bases de datos.

## Consideraciones de Seguridad y Privacidad

- **Procesamiento local y temporal**: La aplicación no almacena datos de pacientes. Todos los insumos y credenciales se guardan localmente en tu propio navegador (Local Storage).
- **Conexión Directa**: La conexión se realiza directamente entre tu navegador y los servidores de Google (Gemini y Drive), sin intermediarios.
- **Transparencia**: Las claves de acceso a las APIs son provistas directamente por el usuario a través de la interfaz de Ajustes de la aplicación.

## Ejecución Local y Configuración

1. **Instalar dependencias**: `npm install`
2. **Iniciar entorno de desarrollo**: `npm run dev`
3. Abre el navegador y haz clic en el icono de **Ajustes (⚙️)**.
4. **Para la IA (Requerido)**: Ingresa tu `Gemini API Key`.
5. **Para usar Google Drive (Opcional)**: Ingresa tu `Google Drive Client ID` (debes crearlo en Google Cloud Console autorizando la API de Drive).
