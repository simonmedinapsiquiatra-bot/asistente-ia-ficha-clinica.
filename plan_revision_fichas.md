# Plan de Revisión de Fichas Clínicas para Extracción de Información

El objetivo de este plan es establecer una metodología sistemática para revisar el historial de fichas clínicas (tanto de pacientes de consulta como de Centro Diurno) y extraer un directorio completo de términos, abreviaturas, formatos y patrones de lenguaje. Esto servirá como base de conocimiento o "diccionario" para que el modelo de IA genere redacciones precisas y fieles a tu estilo clínico.

## Fase 1: Muestreo y Selección de Documentos
No es necesario analizar todas las fichas (más de 1,000 documentos). Se debe extraer una muestra representativa que abarque distintos tipos de pacientes y diagnósticos.

1. **Selección por Categoría:**
   - Seleccionar 15-20 fichas de la carpeta de **Pacientes Centro Diurno** (suele tener evoluciones más continuas, intervenciones multidisciplinarias y reportes de talleres).
   - Seleccionar 15-20 fichas de la carpeta de **Pacientes Consulta** (suele tener ingresos completos, anamnesis detallada, controles farmacológicos).
2. **Selección por Formato:**
   - Priorizar archivos en formato de texto plano (`.txt`), `.docx` y `.gdoc`.
   - Incluir algunos documentos de "Epicrisis" y "Certificados" para extraer el lenguaje formal utilizado en esos casos.

## Fase 2: Proceso de Anonimización
Antes de realizar la extracción automatizada o manual profunda, se debe garantizar la privacidad.

- **Filtro de Entidades:** Eliminar o reemplazar por etiquetas los siguientes datos:
  - Nombres y Apellidos (`[NOMBRE PACIENTE]`)
  - RUT (`[RUT]`)
  - Correos electrónicos y teléfonos (`[EMAIL]`, `[TELEFONO]`)
  - Nombres de familiares específicos (`[NOMBRE MADRE/PADRE/PAREJA]`)

## Fase 3: Análisis Léxico y Extracción de Datos
Se revisarán las fichas seleccionadas buscando elementos específicos para poblar el directorio de términos.

1. **Abreviaturas y Siglas Médicas:**
   - *Antecedentes:* AM, AQ, ASM, AF, OH, TBQ, THC.
   - *Diagnósticos:* TDM, TAB, EQZ, TCA, TDAH, AN.
   - *Examen Mental:* OTE (Orientado en Tiempo y Espacio), EII (Extremidades Inferiores).
2. **Terminología Psicopatológica y Semiológica:**
   - *Descriptores de estado:* "contacto sintónico", "hipomimia facial", "afecto embotado", "ánimo depresivo", "labilidad", "anhedonia", "hipervigilia".
   - *Ideación:* "ideación suicida pasiva", "ideas de minusvalía", "ideas de culpa sobrevaloradas".
3. **Farmacología y Posología (Estilo de formulación):**
   - Extraer la forma exacta en la que se anotan las dosis (ej: `Mirtazapina 30 mg: 0-0-1 comp vo`, `Clotiazepam: 5mg-5mg-0`, `SOS`).
4. **Estructura y Bloques de Texto (Templates):**
   - Identificar los encabezados recurrentes: `Motivo de Consulta`, `Anamnesis próxima`, `Examen mental`, `Hipótesis diagnóstica`, `Planes`.
   - Sistema multiaxial (Eje I al Eje IV).

## Fase 4: Construcción del Directorio (Glosario)
Con la información extraída, se creará un archivo maestro (idealmente en formato `Markdown`, `JSON` o `CSV`) que la IA pueda consultar rápidamente. 

**Estructura sugerida para el Directorio:**
- **Término / Sigla:** *Ej. "OTE"*
- **Significado:** *Orientado en Tiempo y Espacio.*
- **Contexto de uso:** *Se utiliza en la sección de "Examen Mental" bajo el apartado de "Conciencia" o general.*
- **Ejemplo real:** *"Vigil, lúcida, OTE. Atenta, cooperadora."*

## Fase 5: Validación y Ajuste Iterativo
1. **Revisión Médica:** Revisar el directorio generado para confirmar que las definiciones de uso interno (o de tu propio estilo) estén reflejadas correctamente y no existan sesgos.
2. **Prueba de Prompting:** Utilizar el documento generado junto con los ejemplos de Few-Shot para pedirle a la IA que redacte una evolución ficticia.
3. **Corrección:** Ajustar los términos en el diccionario si la IA malinterpreta el contexto (por ejemplo, si usa "AM" para referirse a la mañana en lugar de Antecedentes Médicos).

---

### Siguientes Pasos
Si estás de acuerdo con este plan, puedo crear un script (en Python) que recorra automáticamente los archivos `.txt` de esas carpetas y comience a extraer las palabras y siglas en mayúsculas más frecuentes, o bien, podemos ir revisando fichas específicas juntos para ir armando el diccionario paso a paso.
