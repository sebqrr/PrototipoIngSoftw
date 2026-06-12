import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 40 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: '2px solid #1a365d', paddingBottom: 15, marginBottom: 20 },
  logoText: { fontSize: 18, fontWeight: 'black', color: '#1a365d' },
  minsalText: { fontSize: 10, color: '#64748b', textAlign: 'right' },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  section: { marginVertical: 10, flexGrow: 1 },
  text: { fontSize: 11, marginBottom: 4, color: '#333' },
  bold: { fontSize: 11, fontWeight: 'bold', color: '#000' },
  box: { marginTop: 15, padding: 15, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4 },
  medItem: { marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #e2e8f0' },
  medTitle: { fontSize: 12, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  medInd: { fontSize: 11, color: '#475569' },
  footer: { position: 'absolute', bottom: 40, left: 40, right: 40, fontSize: 9, color: '#64748b', borderTop: '1px solid #cbd5e1', paddingTop: 10, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }
});

export const RecetaPDF = ({ paciente, rut, medico, medicamentos, folio, fechaHora }: any) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VERIFICACION_MINSAL_FOLIO_${folio}`;
  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.logoText}>Clínica UANDES</Text>
            <Text style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>Plataforma Médica Integrada</Text>
          </View>
          <View>
            <Text style={styles.minsalText}>Servicio de Salud</Text>
            <Text style={styles.minsalText}>MINSAL</Text>
          </View>
        </View>

        <Text style={styles.title}>RECETA MÉDICA ELECTRÓNICA</Text>
        
        <View style={styles.section}>
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.text}>Médico Tratante: <Text style={styles.bold}>{medico}</Text></Text>
            <Text style={styles.text}>Paciente: <Text style={styles.bold}>{paciente}</Text></Text>
            <Text style={styles.text}>RUT: <Text style={styles.bold}>{rut}</Text></Text>
            <Text style={styles.text}>Fecha de Emisión: <Text style={styles.bold}>{new Date(fechaHora).toLocaleString()}</Text></Text>
          </View>

          <View style={styles.box}>
            <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 10, color: '#64748b', textTransform: 'uppercase' }}>Prescripción Farmacológica:</Text>
            {medicamentos?.map((m: any, i: number) => (
              <View key={i} style={styles.medItem}>
                <Text style={styles.medTitle}>{(i + 1)}. {m.nombre}</Text>
                <Text style={styles.medInd}>Indicaciones: {m.indicacion}</Text>
              </View>
            ))}
          </View>
        </View>

        <PDFImage src={qrUrl} style={{ width: 60, height: 60, position: 'absolute', bottom: 50, right: 40 }} />
        
        <View style={styles.footer}>
          <Text>Firma Electrónica Avanzada</Text>
          <Text>Folio: {folio}</Text>
        </View>
      </Page>
    </Document>
  );
};
