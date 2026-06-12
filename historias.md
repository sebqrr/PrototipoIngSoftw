Historia 01	Ingreso de Datos Clínicos	EP-01
HU-01	Como médico, quiero ingresar los datos clínicos (PA, colesterol, HbA1c) para tener un perfil actualizado del paciente.
Criterios de Aceptación
CA-01-01	El sistema debe permitir el ingreso de campos obligatorios: nombre, edad, sexo, peso, talla, presión arterial y frecuencia cardíaca.
CA-01-02	El sistema debe calcular automáticamente el IMC tras el ingreso de peso y talla.
CA-01-03	El sistema debe validar que los datos ingresados se encuentren dentro de rangos clínicamente posibles (ej. peso entre 20 y 300 kg, PA sistólica razonable) evitando errores de tipeo.

Historia 02	Cálculo Automático de Riesgo	EP-02
HU-02	Como cardiólogo, quiero que el sistema calcule automáticamente el riesgo a 10 años usando SCORE2 para decidir el tratamiento.
Criterios de Aceptación
CA-02-1	El cálculo debe basarse en modelos matemáticos predictivos (SCORE2, Framingham o ASCVD) utilizando las variables del perfil del paciente.
CA-02-2	El resultado debe categorizar el riesgo en cuatro niveles: bajo, moderado, alto o muy alto.
CA-02-03	El sistema debe proporcionar una explicación clara del cálculo para el profesional médico.

Historia 03	Alertas por Anomalías Físicas	EP-03
HU-03	Como médico, quiero recibir alertas automáticas si un paciente presenta eventos anómalos en sus exámenes médicos para intentar mitigar el riesgo de enfermedad cardiovascular.
Criterios de Aceptación
CA-03-1	El software debe generar alertas cuando: la presión arterial ≥ 140/90 mmHg (milímetro
de mercurio); o el LDL > objetivo según riesgo (100 mg/dL (miligramos por decilitro) en alto riesgo); o HbA1c (hemoglobina glicosilada) > 7%; o falta de control > 6 meses; o la medicación fue duplicada; o subida de peso >= 2 Kg. en un día (retención de líquidos).
CA-03-02	Debe generarse una alerta si no se han registrado controles en un periodo superior a 6 meses.
CA-03-3	Las alertas críticas deben requerir una confirmación de lectura o de "revisión completada" por parte del médico tratante en la interfaz para poder ser descartadas.

Historia 04	Priorización de Agendamiento Clínico	EP-05
HU-04	Como gestor administrativo, quiero que el sistema me alerte sobre pacientes con riesgo cardiovascular "Alto" que no tienen próximos controles agendados para contactarlos proactivamente.
Criterios de Aceptación
CA-04-01	El sistema debe generar un listado de pacientes con riesgo SCORE2 "Alto" o "Muy Alto" cuya última consulta haya sido hace más de 3 meses.
CA-04-02	Desde el listado, el administrativo debe poder generar una orden de contacto prioritaria, enviando un correo o SMS predefinido al paciente invitándolo a agendar.
CA-04-03	El listado debe permitir al gestor aplicar filtros avanzados como tiempo sin asistir (ej: 3 meses, 6 meses, 12 meses) y cruzarlo con el nivel de riesgo exacto del paciente.

Historia 05	Visualización de Imágenes DICOM/PDF	EP-04
HU-05	Como especialista, quiero importar y visualizar trazados eléctricos en DICOM o PDF para analizar la actividad cardíaca del paciente.
Criterios de Aceptación
CA-05-01	El visor integrado debe cargar los estudios de imagen pesados en menos de 3 segundos.
CA-05-02	Debe proveer herramientas digitales de medición para el intervalo QT y segmento ST en los electrocardiogramas.
CA-05-03	Al importar un archivo, el sistema debe calcular y almacenar su código Hash para verificar a futuro que no ha sido alterado.
CA-05-04	Los archivos eliminados deben pasar a una “papelera lógica” y retenerse en el servidor por un mínimo de 15 años por la Normativa de Ficha Clínica.

Historia 06	Evolución Gráfica	EP-05
HU-06	Como profesional de la salud, quiero visualizar gráficas de la presión arterial y colesterol para llevar un seguimiento continuo y no aislado.
Criterios de Aceptación
CA-06-01	La interfaz debe mostrar una línea de tiempo gráfica de la presión arterial.
CA-06-02	Debe incluir visualización gráfica de la evolución del colesterol y control de glucosa.
CA-06-03	Las gráficas deben soportar la superposición de datos (por ejemplo, graficar presión arterial y peso simultáneamente) para facilitar la búsqueda de correlaciones clínicas

Historia 07	Autocuidado del Paciente	EP-05
HU-07	Como paciente crónico, quiero recibir recordatorios de mi medicación en el móvil para mejorar mi adherencia terapéutica.
Criterios de Aceptación
CA-07-01	La plataforma debe permitir el ingreso de registro de registros domiciliarios de presión arterial y toma de medicación.
CA-07-02	El sistema debe mostrar notificaciones de controles y toma de medicación.
CA-07-03	El paciente debe aceptar explícitamente los términos y condiciones del servicio de recordatorios para recibir recordatorios en su móvil para cumplir con las normativas de contacto digital.
CA-07-04	Toda presión arterial registrada por el paciente debe estar etiquetada como datos auto-reportados en su cálculo.

Historia 08	Alertas de Signos Vitales y Laboratorio	EP-03
HU-08	Como cardiólogo, quiero que recibir alertas automáticas en el sistema cuando los resultados de exámenes o signos vitales ingresados estén fuera del rango esperado para detectar anomalías y tomar decisiones clínicas más precisas.
Criterios de Aceptación
CA-08-1	El sistema debe generar una alerta visual prioritaria si la presión arterial registrada en la ficha es ≥ 140/90 mmHg.
CA-08-2	Debe emitirse una advertencia clínica si los datos de laboratorio indican que la hemoglobina glicosilada (HbA1c) es > 7% o si el LDL supera el objetivo según el riesgo.
CA-08-03	Si un resultado de laboratorio presenta un valor catalogado como "crítico severo" (ej. HbA1c > 9%), el sistema debe poder enviar una notificación prioritaria al correo institucional del médico tratante.



Historia 09	Soporte a la Decisión Clínica	EP-03
HU-09	Como médico, quiero que el sistema me sugiera ajustes de tratamiento o derivaciones basándose en el nivel de riesgo del paciente para tomar decisiones clínicas más precisas.
Criterios de Aceptación
CA-09-01	Si un paciente presenta un riesgo categorizado como “Alto” o “Muy Alto”, el sistema debe sugerir visualmente la solicitud de un electrocardiograma (ECG), ecocardiograma o la derivación a cardiología.
CA-09-02	El sistema debe recomendar al inicio o la intensificación de tratamiento si el sistema detecta que el riesgo es elevado.
CA-09-03	Toda sugerencia clínica generada por el sistema debe indicar claramente qué factores de riesgo del paciente (por ejemplo: hipertensión, tabaquismo, colesterol elevado o diabetes) fueron considerados para emitir la recomendación.
 
Historia 10	Anonimización para Reportes Poblacionales	EP-05
HU-10	Como analista de datos, quiero exportar la información de los indicadores poblacionales de forma anonimizada para cumplir con la Ley de Protección de Datos Personales.
Criterios de Aceptación
CA-10-01	Al exportar reportes, el sistema debe omitir automáticamente datos identificables como nombre, RUN, teléfono y dirección física de los pacientes.
CA-10-02	Los reportes exportados deben mantener únicamente datos estadísticos (edad, sexo, niveles de riesgo).
CA-10-03	El sistema debe posibilitar la descarga del reporte anonimizado en formatos estándar y exportables, como CSV, para facilitar el trabajo del equipo de inteligencia de datos.

Historia 11	Control de Modificaciones Clínicas	EP-01
HU-11	Como asesor legal, quiero que el sistema mantenga un historial de versiones de los diagnósticos para tener un respaldo de la ficha clínica ante auditorías.
Criterios de Aceptación
CA-11-01	Al actualizar un dato clínico (ej. colesterol, presión arterial), el sistema no debe sobrescribir el dato anterior, sino guardarlo como versión histórica.
CA-11-02	Cada modificación debe exigir un comentario breve por parte del profesional justificando el cambio.
CA-11-03	El sistema debe permitir visualizar el historial de modificaciones de un dato clínico, mostrando la fecha de cambio, el valor anterior, el nuevo valor y el comentario de justificación asociado.

Historia 12	Emisión de Receta Electrónica Estándar	EP-03
HU-12	Como médico, quiero generar recetas automáticas que cumplan con la normativa del MINSAL para que estas sean válidas en farmacias nacionales.
Criterios de Aceptación
CA-12-01	La receta generada debe incluir de forma obligatoria los datos del prescriptor (RUT, especialidad, registro SIS) y del paciente.
CA-12-02	El sistema debe permitir la integración con firma electrónica avanzada para dar validez al documento digital.
CA-12-03	La receta generada debe incorporar un código QR y/o folio único rastreable que permita a la farmacia validar la autenticidad del documento y evitar duplicaciones.
 
Historia 13	Módulo de Educación Cardiovascular	EP-04
HU-13	Como paciente, quiero acceder a material de educación cardiovascular en mi portal para comprender mejor mi condición y fomentar el autocuidado.
Criterios de Aceptación
CA-13-01	La plataforma debe contar con una sección de artículos o recursos multimedia sobre nutrición, ejercicio y control de la presión.
CA-13-02	El sistema debe registrar qué módulos educativos ha completado el paciente para que el médico tratante pueda visualizar su compromiso.
CA-13-03	El módulo de educación debe ofrecer recomendaciones de contenido personalizadas según el nivel de riesgo y las patologías crónicas reportadas por el paciente.

Historia 14	Acceso a la Propia Información	EP-04
HU-14	Como paciente, quiero poder exportar mi propia ficha y datos cardiovasculares para ejercer mi derecho legal al acceso a mi información de salud.
Criterios de Aceptación
CA-14-01	La plataforma debe contar con un botón para descargar la historia clínica completa en formato PDF inalterable.
CA-14-02	El PDF exportado debe contener una marca de agua de la clínica, la fecha y hora de emisión.
CA-14-03	El sistema debe mantener un registro de auditoría (log) interno cada vez que el paciente efectúe la descarga de su información clínica, incluyendo fecha, hora e IP.


Historia 15	Simulación Financiera del Paciente	EP-05
HU-15	Como paciente, quiero simular los copagos y coberturas de mi tratamiento usando un motor de cálculo financiero para poder planificar mis gastos médicos con anticipación.
Criterios de Aceptación
CA-15-01	La interfaz de usuario debe contar con un simulador de copagos intuitivo.
CA-15-02	El motor de cálculo debe integrar correctamente los aranceles institucionales investigados.
CA-15-03	Las fórmulas financieras aplicadas deben estar validadas con datos de pruebas comerciales para asegurar su exactitud.
