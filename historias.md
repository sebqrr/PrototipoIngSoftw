# Especificación de Historias de Usuario
## Plataforma de Gestión de Riesgo y Prevención Cardiovascular

Este documento contiene el backlog estructurado de historias de usuario para el sistema de gestión de riesgo cardiovascular, organizado por épicas, módulos y criterios de aceptación detallados. Todas las historias cuentan con al menos 3 criterios de aceptación.

---

### Módulo 1: Matriz de Trazabilidad (Épicas e Historias)

| Código HU | Épica | Título de la Historia | Rol |
| :--- | :--- | :--- | :--- |
| **HU-01** | EP-01 | Ingreso de Datos Clínicos | Médico |
| **HU-02** | EP-02 | Cálculo Automático de Riesgo | Cardiólogo |
| **HU-03** | EP-03 | Alertas por Anomalías Físicas | Médico |
| **HU-04** | EP-05 | Priorización de Agendamiento Clínico | Gestor Administrativo |
| **HU-05** | EP-04 | Visualización de Imágenes DICOM/PDF | Especialista |
| **HU-06** | EP-05 | Evolución Gráfica | Profesional de la Salud |
| **HU-07** | EP-05 | Autocuidado del Paciente | Paciente Crónico |
| **HU-08** | EP-03 | Alertas de Signos Vitales y Laboratorio | Cardiólogo |
| **HU-09** | EP-03 | Soporte a la Decisión Clínica | Médico |
| **HU-10** | EP-05 | Anonimización para Reportes Poblacionales | Analista de Datos |
| **HU-11** | EP-01 | Control de Modificaciones Clínicas | Asesor Legal |
| **HU-12** | EP-03 | Emisión de Receta Electrónica Estándar | Médico |
| **HU-13** | EP-04 | Módulo de Educación Cardiovascular | Paciente |
| **HU-14** | EP-04 | Acceso a la Propia Información | Paciente |

---

### Detalle de Historias de Usuario

#### 📋 ÉPICA 01: Gestión de Ficha y Datos Clínicos

### Historia 01: Ingreso de Datos Clínicos
* **Código:** HU-01 (Asociada a **EP-01**)
* **Declaración:** > **Como** médico,  
  > **quiero** ingresar los datos clínicos (PA, colesterol, HbA1c),  
  > **para** tener un perfil actualizado del paciente.

| ID Criterio | Descripción del Criterio de Aceptación |
| :--- | :--- |
| **CA-01-1** | El sistema debe permitir el ingreso de campos obligatorios: nombre, edad, sexo, peso, talla, presión arterial y frecuencia cardíaca. |
| **CA-01-2** | El sistema debe calcular automáticamente el Índice de Masa Corporal (IMC) tras el ingreso de peso y talla. |
| **CA-01-3** | El sistema debe validar que los datos ingresados se encuentren dentro de rangos clínicamente posibles (ej. peso entre 20 y 300 kg, PA sistólica razonable) evitando errores de tipeo. |

---

### Historia 11: Control de Modificaciones Clínicas
* **Código:** HU-11 (Asociada a **EP-01**)
* **Declaración:** > **Como** asesor legal,  
  > **quiero** que el sistema mantenga un historial de versiones de los diagnósticos,  
  > **para** tener un respaldo de la ficha clínica ante auditorías.

| ID Criterio | Descripción del Criterio de Aceptación |
| :--- | :--- |
| **CA-11-1** | Al actualizar un dato clínico (ej. colesterol, presión arterial), el sistema no debe sobrescribir el dato anterior, sino guardarlo como versión histórica. |
| **CA-11-2** | Cada modificación debe exigir un comentario breve por parte del profesional justificando el cambio. |
| **CA-11-3** | El historial de modificaciones debe mostrar la fecha, la hora exacta, el valor anterior, el nuevo valor y la identidad del profesional que realizó el cambio. |

---

#### 🧠 ÉPICA 02: Modelos Predictivos y de Riesgo

### Historia 02: Cálculo Automático de Riesgo
* **Código:** HU-02 (Asociada a **EP-02**)
* **Declaración:** > **Como** cardiólogo,  
  > **quiero** que el sistema calcule automáticamente el riesgo a 10 años usando SCORE2,  
  > **para** decidir el tratamiento de forma precisa.

| ID Criterio | Descripción del Criterio de Aceptación |
| :--- | :--- |
| **CA-02-1** | El cálculo debe basarse en modelos matemáticos predictivos (SCORE2, Framingham o ASCVD) utilizando las variables del perfil del paciente. |
| **CA-02-2** | El resultado debe categorizar el riesgo en cuatro niveles bien definidos: bajo, moderado, alto o muy alto. |
| **CA-02-3** | El sistema debe proporcionar una explicación clara del cálculo e indicar el modelo empleado para el profesional médico. |

---

#### ⚠️ ÉPICA 03: Alertas, Reglas de Negocio y Soporte Clínico

### Historia 03: Alertas por Anomalías Físicas
* **Código:** HU-03 (Asociada a **EP-03**)
* **Declaración:** > **Como** médico,  
  > **quiero** recibir alertas automáticas si un paciente presenta eventos anómalos en sus exámenes médicos,  
  > **para** intentar mitigar el riesgo de enfermedad cardiovascular.

| ID Criterio | Descripción del Criterio de Aceptación |
| :--- | :--- |
| **CA-03-1** | El software debe generar alertas cuando se cumpla alguna de las siguientes condiciones:<br>• Presión arterial ≥ 140/90 mmHg.<br>• LDL > objetivo según riesgo (ej. 100 mg/dL en alto riesgo).<br>• HbA1c (hemoglobina glicosilada) > 7%.<br>• Falta de control presencial > 6 meses.<br>• Medicación duplicada detectada.<br>• Subida abrupta de peso ≥ 2 Kg en un solo día (indicio de retención de líquidos). |
| **CA-03-2** | Debe generarse una alerta específica en la ficha si no se han registrado controles médicos en un periodo superior a 6 meses. |
| **CA-03-3** | Las alertas críticas deben requerir una confirmación de lectura o de "revisión completada" por parte del médico tratante en la interfaz para poder ser descartadas. |

---

### Historia 08: Alertas de Signos Vitales y Laboratorio
* **Código:** HU-08 (Asociada a **EP-03**)
* **Declaración:** > **Como** cardiólogo,  
  > **quiero** recibir alertas automáticas en el sistema cuando los resultados de exámenes o signos vitales ingresados estén fuera del rango esperado,  
  > **para** detectar anomalías y tomar decisiones clínicas más precisas.

| ID Criterio | Descripción del Criterio de Aceptación |
| :--- | :--- |
| **CA-08-1** | El sistema debe generar una alerta visual prioritaria en pantalla si la presión arterial registrada en la ficha es ≥ 140/90 mmHg. |
| **CA-08-2** | Debe emitirse una advertencia clínica si los datos de laboratorio indican que la hemoglobina glicosilada (HbA1c) es > 7% o si el LDL supera el objetivo según el riesgo estratificado. |
| **CA-08-3** | Si un resultado de laboratorio presenta un valor catalogado como "crítico severo" (ej. HbA1c > 9%), el sistema debe poder enviar una notificación prioritaria al correo institucional del médico tratante. |

---

### Historia 09: Soporte a la Decisión Clínica
* **Código:** HU-09 (Asociada a **EP-03**)
* **Declaración:** > **Como** médico,  
  > **quiero** que el sistema me sugiera ajustes de tratamiento o derivaciones basándose en el nivel de riesgo del paciente,  
  > **para** tomar decisiones clínicas más precisas y oportunas.

| ID Criterio | Descripción del Criterio de Aceptación |
| :--- | :--- |
| **CA-09-1** | Si un paciente presenta un riesgo categorizado como “Alto” o “Muy Alto”, el sistema debe sugerir visualmente la solicitud de un electrocardiograma (ECG), ecocardiograma o la derivación inmediata a cardiología. |
| **CA-09-2** | El sistema debe recomendar la iniciación o la intensificación del tratamiento farmacológico/terapéutico si detecta que el riesgo calculado es elevado. |
| **CA-09-3** | Toda sugerencia clínica generada por el sistema debe indicar claramente qué factores de riesgo del paciente (por ejemplo: hipertensión, tabaquismo, colesterol elevado o diabetes) fueron considerados para emitir la recomendación. |

---

### Historia 12: Emisión de Receta Electrónica Estándar
* **Código:** HU-12 (Asociada a **EP-03**)
* **Declaración:** > **Como** médico,  
  > **quiero** generar recetas automáticas que cumplan con la normativa del MINSAL,  
  > **para** que estas sean válidas en las redes de farmacias nacionales.

| ID Criterio | Descripción del Criterio de Aceptación |
| :--- | :--- |
| **CA-12-1** | La receta generada debe incluir de forma estrictamente obligatoria los datos del prescriptor (RUT, especialidad, registro en la Superintendencia de Salud - SIS) y los datos completos del paciente. |
| **CA-12-2** | El sistema debe permitir la integración nativa con Firma Electrónica Avanzada (FEA) para otorgar validez legal plena al documento digital. |
| **CA-12-3** | La receta generada debe incorporar un código QR y/o folio único rastreable que permita a la farmacia validar la autenticidad del documento y evitar duplicaciones. |

---

#### 💻 ÉPICA 04: Gestión de Exámenes, Portal e Información del Paciente

### Historia 05: Visualización de Imágenes DICOM/PDF
* **Código:** HU-05 (Asociada a **EP-04**)
* **Declaración:** > **Como** especialista,  
  > **quiero** importar y visualizar trazados eléctricos en formato DICOM o PDF,  
  > **para** analizar detalladamente la actividad cardíaca del paciente.

| ID Criterio | Descripción del Criterio de Aceptación |
| :--- | :--- |
| **CA-05-01** | El visor web/nativo integrado debe cargar los estudios de imagen pesados en un tiempo inferior a 3 segundos. |
| **CA-05-02** | Debe proveer herramientas digitales interactivas de medición en pantalla para el intervalo QT y el segmento ST en los electrocardiogramas. |
| **CA-05-03** | Al importar cualquier archivo, el sistema debe calcular y almacenar su código Hash único para verificar en el futuro que no ha sufrido alteraciones. |
| **CA-05-04** | Los archivos eliminados deben pasar a una “papelera lógica” y retenerse de forma segura en el servidor por un mínimo de 15 años, conforme a la Normativa vigente de Ficha Clínica. |

---

### Historia 13: Módulo de Educación Cardiovascular
* **Código:** HU-13 (Asociada a **EP-04**)
* **Declaración:** > **Como** paciente,  
  > **quiero** acceder a material de educación cardiovascular en mi portal,  
  > **para** comprender mejor mi condición médica y fomentar el autocuidado.

| ID Criterio | Descripción del Criterio de Aceptación |
| :--- | :--- |
| **CA-13-01** | La plataforma debe contar con una sección dedicada a artículos informativos o recursos multimedia sobre nutrición saludable, rutinas de ejercicio y control diario de la presión. |
| **CA-13-02** | El sistema debe registrar de forma automática qué módulos educativos ha completado el paciente, permitiendo que el médico tratante visualice su nivel de compromiso en la consulta. |
| **CA-13-03** | El módulo de educación debe ofrecer recomendaciones de contenido personalizadas según el nivel de riesgo y las patologías crónicas reportadas por el paciente. |

---

### Historia 14: Acceso a la Propia Información
* **Código:** HU-14 (Asociada a **EP-04**)
* **Declaración:** > **Como** paciente,  
  > **quiero** poder exportar mi propia ficha y datos cardiovasculares,  
  > **para** ejercer mi derecho legal al acceso a mi información de salud.

| ID Criterio | Descripción del Criterio de Aceptación |
| :--- | :--- |
| **CA-14-01** | La plataforma del paciente debe contar con un botón visible para descargar la historia clínica consolidada en formato PDF inalterable. |
| **CA-14-02** | El archivo PDF exportado debe contener de forma obligatoria una marca de agua institucional de la clínica, junto con la fecha y hora exacta de emisión. |
| **CA-14-03** | El sistema debe mantener un registro de auditoría (log) interno cada vez que el paciente efectúe la descarga de su información clínica, incluyendo fecha, hora e IP. |

---

#### 📊 ÉPICA 05: Herramientas Administrativas, Reportes y Seguimiento

### Historia 04: Priorización de Agendamiento Clínico
* **Código:** HU-04 (Asociada a **EP-05**)
* **Declaración:** > **Como** gestor administrativo,  
  > **quiero** que el sistema me alerte sobre pacientes con riesgo cardiovascular "Alto" sin próximos controles agendados,  
  > **para** contactarlos de manera proactiva.

| ID Criterio | Descripción del Criterio de Aceptación |
| :--- | :--- |
| **CA-04-01** | El sistema debe generar un listado dinámico de pacientes con riesgo SCORE2 clasificado como "Alto" o "Muy Alto" cuya última consulta registrada haya sido hace más de 3 meses. |
| **CA-04-02** | Desde dicho listado, el usuario administrativo debe poder generar una orden de contacto prioritaria, enviando un correo electrónico o SMS predefinido con la invitación a agendar. |
| **CA-04-03** | El listado debe permitir al gestor aplicar filtros avanzados como tiempo sin asistir (e.g. 3 meses, 6 meses, 12 meses) y cruzarlo con el nivel de riesgo exacto del paciente. |

---

### Historia 06: Evolución Gráfica
* **Código:** HU-06 (Asociada a **EP-05**)
* **Declaración:** > **Como** profesional de la salud,  
  > **quiero** visualizar gráficas de la presión arterial y el colesterol,  
  > **para** llevar un seguimiento continuo, evolutivo y no aislado.

| ID Criterio | Descripción del Criterio de Aceptación |
| :--- | :--- |
| **CA-06-01** | La interfaz clínica debe mostrar una línea de tiempo gráfica e interactiva de los valores de la presión arterial. |
| **CA-06-02** | Debe incluir un panel de visualización gráfica para la evolución de los distintos tipos de colesterol y las métricas de control de glucosa en el tiempo. |
| **CA-06-03** | Las gráficas deben soportar la superposición de datos (por ejemplo, graficar presión arterial y peso simultáneamente) para facilitar la búsqueda de correlaciones clínicas. |

---

### Historia 07: Autocuidado del Paciente
* **Código:** HU-07 (Asociada a **EP-05**)
* **Declaración:** > **Como** paciente crónico,  
  > **quiero** recibir recordatorios de mi medicación en el dispositivo móvil,  
  > **para** mejorar mi adherencia al tratamiento médico.

| ID Criterio | Descripción del Criterio de Aceptación |
| :--- | :--- |
| **CA-07-01** | La plataforma debe habilitar un formulario para el ingreso de registros domiciliarios personales de presión arterial y confirmación de toma de medicación. |
| **CA-07-02** | El sistema debe enviar notificaciones push o alertas sobre próximos controles clínicos y horarios de toma de medicamentos. |
| **CA-07-03** | El paciente debe aceptar de forma explícita y firmada digitalmente los términos y condiciones del servicio para activar los recordatorios móviles, cumpliendo las normativas de comunicación digital institucional. |
| **CA-07-04** | Toda toma de presión arterial registrada directamente por el paciente debe quedar explícitamente etiquetada como "Dato auto-reportado" para diferenciarla de los registros en entornos clínicos oficiales. |

---

### Historia 10: Anonimización para Reportes Poblacionales
* **Código:** HU-10 (Asociada a **EP-05**)
* **Declaración:** > **Como** analista de datos,  
  > **quiero** exportar la información de los indicadores poblacionales de forma anonimizada,  
  > **para** cumplir estrictamente con la Ley de Protección de Datos Personales.

| ID Criterio | Descripción del Criterio de Aceptación |
| :--- | :--- |
| **CA-10-01** | Al realizar la exportación de reportes poblacionales, el sistema debe omitir, enmascarar o eliminar automáticamente datos identificables (Nombre, RUN, número telefónico y dirección física). |
| **CA-10-02** | Los archivos generados deben mantener única y exclusivamente datos de valor estadístico y clínico agregado (edad, sexo biológico, niveles de riesgo calculados). |
| **CA-10-03** | El sistema debe posibilitar la descarga del reporte anonimizado en formatos estándar y exportables, como CSV o Excel (XLSX), para facilitar el trabajo del equipo de inteligencia de datos. |
