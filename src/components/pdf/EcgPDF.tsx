import { Document, Page, Text, View, StyleSheet, Svg, Path, Rect, Line } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 40 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: '2px solid #1a365d', paddingBottom: 15, marginBottom: 20 },
  logoText: { fontSize: 18, fontWeight: 'black', color: '#1a365d' },
  minsalText: { fontSize: 10, color: '#64748b', textAlign: 'right' },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  section: { marginVertical: 10 },
  text: { fontSize: 11, marginBottom: 4, color: '#333' },
  bold: { fontSize: 11, fontWeight: 'bold', color: '#000' },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  col: { width: '48%' },
  chartContainer: { marginTop: 20, padding: 10, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' },
  chartTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 10, color: '#0f172a' },
  resultado: { marginTop: 15, padding: 10, borderRadius: 4 },
  resText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  footer: { position: 'absolute', bottom: 40, left: 40, right: 40, fontSize: 9, color: '#64748b', borderTop: '1px solid #cbd5e1', paddingTop: 10, textAlign: 'center' }
});

export const EcgPDF = ({ paciente, rut, fecha, tipo, resultado, ecgData }: any) => {
  // Generar la data de 10 latidos si es necesario (asumimos que ecgData viene con 1 latido y lo repetimos, o ya viene repetido)
  // Como recibimos ecgData directo del mock, sabemos que es de 140 puntos. Lo repetimos 10 veces.
  const fullData = Array(10).fill(ecgData).flat();
  
  // Calcular viewBox
  const width = 800;
  const height = 200;
  
  const min = Math.min(...fullData);
  const max = Math.max(...fullData);
  const range = max - min || 1;

  // Construir SVG Path
  const points = fullData.map((val: number, idx: number) => {
    const x = (idx / (fullData.length - 1)) * width;
    // Normalizar Y (invertir para que positivo vaya hacia arriba)
    const y = height - (((val - min) / range) * height);
    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  });

  const pathD = points.join(' ');

  // Color de resultado
  const isAnormal = resultado === 'Anormal';
  const resBg = isAnormal ? '#ef4444' : '#22c55e';

  // Grid para SVG
  const gridLines = [];
  for(let i = 0; i <= 10; i++) {
    gridLines.push(<Line key={`h${i}`} x1="0" y1={i * (height/10)} x2={width} y2={i * (height/10)} stroke="#e2e8f0" strokeWidth={0.5} />);
    gridLines.push(<Line key={`v${i}`} x1={i * (width/10)} y1="0" x2={i * (width/10)} y2={height} stroke="#e2e8f0" strokeWidth={0.5} />);
  }

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.logoText}>Clínica UANDES</Text>
            <Text style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>Plataforma Médica Integrada - Unidad de Cardiología</Text>
          </View>
          <View>
            <Text style={styles.minsalText}>Reporte Oficial DICOM/ECG</Text>
            <Text style={styles.minsalText}>Fecha de Emisión: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        <Text style={styles.title}>INFORME DE ELECTROCARDIOGRAMA (ECG)</Text>
        
        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={styles.text}>Paciente: <Text style={styles.bold}>{paciente}</Text></Text>
            <Text style={styles.text}>RUT: <Text style={styles.bold}>{rut}</Text></Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.text}>Examen: <Text style={styles.bold}>{tipo}</Text></Text>
            <Text style={styles.text}>Fecha de Registro: <Text style={styles.bold}>{new Date(fecha).toLocaleDateString()}</Text></Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Trazado Eléctrico Simulado (Derivación Única DII)</Text>
          <Svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: height }}>
            <Rect x="0" y="0" width={width} height={height} fill="#ffffff" />
            {gridLines}
            <Path d={pathD} stroke="#38bdf8" strokeWidth={1.5} fill="none" />
          </Svg>
        </View>

        {resultado && (
          <View style={[styles.resultado, { backgroundColor: resBg }]}>
            <Text style={styles.resText}>RESULTADO AUTOMATIZADO: {resultado.toUpperCase()}</Text>
          </View>
        )}
        
        <View style={styles.footer}>
          <Text>Este es un reporte generado automáticamente a partir de datos estructurados de ECG.</Text>
        </View>
      </Page>
    </Document>
  );
};
