import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import type { PatientRecord, Medicion } from '@/db/mockDb';
import { configRiesgo } from '@/lib/clinical';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1e293b' },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#2563eb', paddingBottom: 15, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1e3a8a' },
  headerSubtitle: { fontSize: 10, color: '#64748b', marginTop: 5 },
  logoContainer: { alignItems: 'flex-end' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 10, backgroundColor: '#f1f5f9', padding: 5, borderRadius: 3 },
  patientInfo: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  infoItem: { width: '50%', marginBottom: 5 },
  label: { color: '#64748b', fontSize: 9 },
  value: { fontWeight: 'bold' },
  table: { width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', minHeight: 25, paddingVertical: 5, alignItems: 'center' },
  tableHeader: { backgroundColor: '#f8fafc', fontWeight: 'bold' },
  tableCell: { padding: 5, paddingRight: 10 },
  colFecha: { width: '15%' },
  colParams: { width: '35%', fontSize: 8, color: '#475569' },
  colNotas: { width: '50%', fontSize: 9 },
  chartsImage: { width: '100%', marginTop: 10 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#94a3b8', fontSize: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10 }
});

interface FichaPDFProps {
  patient: PatientRecord;
  mediciones: Medicion[];
  riesgo: string;
  chartsImage?: string;
}

export function FichaPDF({ patient, mediciones, riesgo, chartsImage }: FichaPDFProps) {
  const riesgoConfig = configRiesgo[riesgo as keyof typeof configRiesgo] || configRiesgo.BAJO;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Ficha Clínica Electrónica</Text>
            <Text style={styles.headerSubtitle}>Generado el {new Date().toLocaleDateString()} a las {new Date().toLocaleTimeString()}</Text>
          </View>
          <View style={styles.logoContainer}>
            <Text style={{ fontWeight: 'bold', color: '#2563eb' }}>MediConnect Pro</Text>
            <Text style={{ fontSize: 8, color: '#64748b' }}>Plataforma Médica Avanzada</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Identificación del Paciente</Text>
        <View style={styles.patientInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Nombre Completo</Text>
            <Text style={styles.value}>{patient.nombre} {patient.apellidos}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>RUT</Text>
            <Text style={styles.value}>{patient.rut}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Fecha de Nacimiento</Text>
            <Text style={styles.value}>{new Date(patient.fechaNacimiento).toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Género</Text>
            <Text style={styles.value}>{patient.sexo === 'M' ? 'Masculino' : 'Femenino'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Riesgo Cardiovascular (SCORE2)</Text>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>{riesgoConfig.text}</Text>
          <Text style={{ fontSize: 9, color: '#64748b', marginTop: 3 }}>Estimación a 10 años basada en los parámetros actuales.</Text>
        </View>

        <Text style={styles.sectionTitle}>Historial de Controles Médicos (Filtrado)</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, styles.colFecha]}><Text>Fecha</Text></View>
            <View style={[styles.tableCell, styles.colParams]}><Text>Parámetros Físicos/Bioquímicos</Text></View>
            <View style={[styles.tableCell, styles.colNotas]}><Text>Evolución / Justificación Médica</Text></View>
          </View>
          {mediciones.map((m, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={[styles.tableCell, styles.colFecha]}><Text>{new Date(m.fecha).toLocaleDateString()}</Text></View>
              <View style={[styles.tableCell, styles.colParams]}>
                <Text>PA: {m.presionSistolica}/{m.presionDiastolica} mmHg</Text>
                <Text>Peso: {m.peso} kg</Text>
                {m.colesterol && <Text>Chol: {m.colesterol} mg/dL</Text>}
                {(m.talla && m.peso) && <Text>IMC: {(m.peso / (m.talla * m.talla)).toFixed(1)}</Text>}
              </View>
              <View style={[styles.tableCell, styles.colNotas]}>
                <Text>{m.comentarioMedico || 'Sin justificación registrada.'}</Text>
              </View>
            </View>
          ))}
          {mediciones.length === 0 && (
             <View style={styles.tableRow}><View style={styles.tableCell}><Text>No hay controles en este período.</Text></View></View>
          )}
        </View>

        {chartsImage && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Análisis de Evolución y Tendencias</Text>
            <Image src={chartsImage} style={styles.chartsImage} />
          </View>
        )}

        <Text style={styles.footer} fixed>
          Documento generado confidencialmente mediante el Sistema Médico. Válido como copia de Historia Clínica. Pág. 1
        </Text>
      </Page>
    </Document>
  );
}
