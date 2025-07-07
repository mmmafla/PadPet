import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { ToastController, AlertController } from '@ionic/angular';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Injectable({
  providedIn: 'root'
})
export class AtencionService {

    atencionId!: number;
    atencion: any = null;
    logoVet: string = '';

  constructor(
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  async cargarAtencionCompleta(id: number) {
    const { data, error } = await supabase
      .from('atencion_medica')
      .select(`
        *, 
        mascota (
          *, 
          raza (
            nom_raza,
            especie ( nom_especie )
          ),
          tutor (
            *,
            ciudad ( nombre_ciudad )
          ),
          sexo_mascota ( masc_sexo ),
          grupo_sanguineo ( nom_grupo_sanguineo )
        ),
        motivo_consulta ( motivo ),
        hidratacion ( estado_hidratacion ),
        estado_sensorial ( estado_sensorial ),
        piel_obp ( estado_piel ),
        ojos_obp ( estado_ojos ),
        oidos_obp ( estado_oidos ),
        dentadura_obp ( estado_dentadura ),
        sdigestivo_obp ( estado_sdigestivo ),
        scvascular_obp ( estado_scvascular ),
        srespiratorio_obp ( estado_srespiratorio ),
        surinario_obp ( estado_surinario ),
        snervioso_obp ( estado_snervioso ),
        slinfatico_obp ( estado_slinfatico ),
        slocomotor_obp ( estado_slocomotor ),
        sreproductor_obp ( estado_sreproductor ),
        tipo_alimentacion ( tipo_alimentacion ),
        veterinario (
          nombre_vet, apellidos_vet, run_vet, celular_vet, email_vet,  
          dato_profesional ( foto_perfil,firma_png )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al cargar la atención!', error);
      return null;
    }
    return data;
  }

  private dibujarMarcoYPie(doc: jsPDF, numeroPagina: number) {
  // Dibuja el borde
  doc.setLineWidth(1);
  doc.setDrawColor(237, 249, 249);
  doc.rect(10, 10, 196, 338);

  // Pie de página con número de página centrado abajo
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const textoPagina = `Página ${numeroPagina}`;
  const anchoTexto = doc.getTextWidth(textoPagina);
  const xCentro = (doc.internal.pageSize.getWidth() - anchoTexto) / 2;
  const yPie = 345;
  doc.text(textoPagina, xCentro, yPie);

    // Firma "Generado en PadPet" en esquina inferior derecha
  const textoFirma = 'Generado en PadPet';
  const anchoFirma = doc.getTextWidth(textoFirma);
  const xFirma = doc.internal.pageSize.getWidth() - 15 - anchoFirma;
  doc.text(textoFirma, xFirma, yPie);


}


//--------------------------------
  private escribirTextoMultilinea(
  doc: jsPDF,
  texto: string,
  x: number,
  y: number,
  anchoMax: number,
  salto: number
): number {
  const lineas = doc.splitTextToSize(texto, anchoMax);
  for (let linea of lineas) {
    if (y >= 290) {
        doc.addPage();
        this.dibujarMarcoYPie(doc, doc.getNumberOfPages());
        y = 20; 
        doc.setFontSize(10);
doc.setFont('helvetica', 'normal');

    }
    doc.text(linea, x, y);
    y += salto;
  }
  return y;
}


// ------------------------------------------------------------------------------------ PDF
// ------------------------------------------------------------------------------------ PDF
// ------------------------------------------------------------------------------------ PDF
async generarPdfAtencion(atencion: any, logoVet: string): Promise<Blob> {
 const doc = new jsPDF({
  orientation: 'portrait', 
  unit: 'mm',           
  format: 'legal' 
});

let firmaImagen: HTMLImageElement | null = null;

  // Función interna para terminar el PDF y devolverlo como Blob
  const terminarDoc = (): Blob => {
    this.dibujarMarcoYPie(doc, 1);


    // TÍTULO PRINCIPAL
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE CONSULTA MÉDICA VETERINARIA', 15, 20);

        // Fecha formateada
    const fecha = new Date(atencion?.fecha_hora_atencion);
    const fechaFormateada = fecha.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha consulta: ${fechaFormateada}`, 15, 25);

    // DATOS MASCOTA
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(237, 249, 249);
    doc.rect(10, 40, 196, 10, 'F');
    doc.text('Paciente', 108, 45, { align: 'center', baseline: 'middle' });

    let xLeft = 20;
    let xRight = 110;
    let y = 55;
    const lineGap = 5;

    doc.setFontSize(10);
    // 1. Nombre
    doc.setFont('helvetica', 'bold');
    doc.text('Nombre: ', xLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text(atencion?.mascota?.masc_nom ?? '', xLeft + 20, y);

    // 2. Fecha de nacimiento
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha de nacimiento: ', xLeft, y);
    doc.setFont('helvetica', 'normal');
    const fechaNacimiento = atencion?.mascota?.masc_nacimiento ? new Date(atencion.mascota.masc_nacimiento).toLocaleDateString() : 'Sin fecha';
    doc.text(fechaNacimiento, xLeft + 40, y);

    // 3. Sexo
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Sexo: ', xLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text(atencion?.mascota?.sexo_mascota?.masc_sexo ?? '', xLeft + 15, y);

    // 4. Grupo Sanguíneo
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Grupo Sanguíneo: ', xLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text(atencion?.mascota?.grupo_sanguineo?.nom_grupo_sanguineo ?? 'Sin información', xLeft + 35, y);

    // 5. Tutor
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Tutor: ', xLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text((atencion?.mascota?.tutor?.nombre_tutor ?? '') + ' ' + (atencion?.mascota?.tutor?.apellidos_tutor ?? ''), xLeft + 15, y);

    // 6. Dirección
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Dirección: ', xLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text(atencion?.mascota?.tutor?.direccion_tutor ?? 'Sin dirección', xLeft + 20, y);

    // COLUMNA DERECHA
    y = 55;
    // 1. Especie
    doc.setFont('helvetica', 'bold');
    doc.text('Especie: ', xRight, y);
    doc.setFont('helvetica', 'normal');
    doc.text(atencion?.mascota?.raza?.especie?.nom_especie ??'', xRight + 20, y);

    // 2. Edad
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Edad: ', xRight, y);
    doc.setFont('helvetica', 'normal');
    doc.text((atencion?.mascota?.masc_edad !== undefined && atencion?.mascota?.masc_edad !== null) ? `${atencion.mascota.masc_edad} años` : '', xRight + 15, y);


    // 3. Raza
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Raza: ', xRight, y);
    doc.setFont('helvetica', 'normal');
    doc.text(atencion?.mascota?.raza?.nom_raza ?? '', xRight + 15, y);

    // 4. RUN Tutor
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('RUN Tutor: ', xRight, y);
    doc.setFont('helvetica', 'normal');
    doc.text(atencion?.mascota?.tutor?.run_tutor?.toString() ?? '', xRight + 25, y);

    // 5. Teléfono
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Celular: ', xRight, y);
    doc.setFont('helvetica', 'normal');
    doc.text(atencion?.mascota?.tutor?.celular_tutor  ? `+569 ${atencion.mascota.tutor.celular_tutor.toString()}` : 'Sin Celular',  xRight + 15,  y);


    // 6. Ciudad
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Ciudad: ', xRight, y);
    doc.setFont('helvetica', 'normal');
    doc.text(atencion?.mascota?.tutor?.ciudad?.nombre_ciudad ?? 'Sin Ciudad', xRight + 15, y);
//--------------------------------------------------------------------------------
    // DETALLE CONSULTA
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(237, 249, 249);
    doc.rect(10, 85, 196, 10, 'F');
    doc.text('Detalles de la Consulta', 108, 90, { align: 'center', baseline: 'middle' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Motivo de consulta: ${atencion?.motivo_consulta?.motivo}`, 25, 100);
      y = 105;
      const anamnesisTexto = `Anamnesis: ${atencion?.anamnesis ?? '-'}`;
      y = this.escribirTextoMultilinea(doc, anamnesisTexto, 25, y, 170, 5);
      const observacionesTexto = `Observaciones: ${atencion?.observaciones ?? '-'}`;
      y = this.escribirTextoMultilinea(doc, observacionesTexto, 25, y, 170, 5);
//------------------------
    doc.setFont('helvetica', 'bold');
    doc.text(`EXAMEN GENERAL`, 20,y);
 y += 5;
doc.setFont('helvetica', 'normal');
// 
        const examenGeneral = [
          { label: 'Mucosas', valor: atencion?.mucosa ?? '-' },
          { label: 'Temperatura', valor: `${atencion?.temperatura ?? '-'} ºC` },
          { label: 'Peso', valor: `${atencion?.peso ?? '-'} Kg` },
          { label: 'Condición corporal', valor: atencion?.condicion_corporal ?? '-' },
          { label: 'Estado sensorial', valor: atencion?.estado_sensorial?.estado_sensorial ?? '-' },
          { label: 'Estado hidratación', valor: atencion?.hidratacion?.estado_hidratacion ?? '-' },
        ];
              // Recorremos los pares de 2 en 2 (columna izquierda y derecha)
              for (let i = 0; i < examenGeneral.length; i += 2) {
                const itemIzq = examenGeneral[i];
                const itemDer = examenGeneral[i + 1];

                doc.text(`${itemIzq.label}: ${itemIzq.valor}`, 25, y);
                if (itemDer) {
                  doc.text(`${itemDer.label}: ${itemDer.valor}`, 110, y);
                }
                y += 5;
              }
// Observaciones debajo
const obsGeneral = `Observaciones: ${atencion?.observacion_examen ?? '-'}`;
y = this.escribirTextoMultilinea(doc, obsGeneral, 25, y, 170, 5);


          // ------------------
          // Título del bloque
          doc.setFont('helvetica', 'bold');
          doc.text(`EXAMEN PARTICULAR`, 20, y);
          y += 5;


          doc.setFont('helvetica', 'normal');
          // Datos del examen particular
          const examenParticular = [
            { label: 'Piel y Pelaje', estado: atencion?.piel_obp?.estado_piel, obs: atencion?.obs_piel },
            { label: 'Ojos', estado: atencion?.ojos_obp?.estado_ojos, obs: atencion?.obs_ojos },
            { label: 'Oídos', estado: atencion?.oidos_obp?.estado_oidos, obs: atencion?.obs_oidos },
            { label: 'Dentadura', estado: atencion?.dentadura_obp?.estado_dentadura, obs: atencion?.obs_dentadura },
            { label: 'Sistema Digestivo', estado: atencion?.sdigestivo_obp?.estado_sdigestivo, obs: atencion?.obs_sdigestivo },
            { label: 'Sistema Cardio Vascular', estado: atencion?.scvascular_obp?.estado_scvascular, obs: atencion?.obs_scvascular },
            { label: 'Sistema Respiratorio', estado: atencion?.srespiratorio_obp?.estado_srespiratorio, obs: atencion?.obs_srespiratorio },
            { label: 'Sistema Urinario', estado: atencion?.surinario_obp?.estado_surinario, obs: atencion?.obs_surinario },
            { label: 'Sistema Nervioso', estado: atencion?.snervioso_obp?.estado_snervioso, obs: atencion?.obs_snervioso },
            { label: 'Sistema Linfático', estado: atencion?.slinfatico_obp?.estado_slinfatico, obs: atencion?.obs_linfatico },
            { label: 'Sistema Locomotor', estado: atencion?.slocomotor_obp?.estado_slocomotor, obs: atencion?.obs_slocomotor },
            { label: 'Sistema Reproductor', estado: atencion?.sreproductor_obp?.estado_sreproductor, obs: atencion?.obs_sreproductor }
          ];
          for (const item of examenParticular) {
            const linea = `${item.label}: ${item.estado ?? '-'}  • Observación: ${item.obs ?? '-'}`;
            y = this.escribirTextoMultilinea(doc, linea, 25, y, 170, 5);
            y += 1;
          }

// ----------------

    doc.setFont('helvetica', 'bold');
    y += 5;
    doc.text(`ALIMENTACIÓN`, 20,y);
    y += 5;
          const alimentacionTexto = 
            `Tipo Alimentación: ${atencion?.tipo_alimentacion?.tipo_alimentacion ?? '-'}\n` +
            `Cantidad de Alimentación: ${atencion?.cantidad_alimentacion ?? '-'}\n` +
            `Veces al día: ${atencion?.veces_alimentaión ?? '-'}`;
doc.setFont('helvetica', 'normal');
y = this.escribirTextoMultilinea(doc, alimentacionTexto, 25, y, 170, 5);

 // Diagnostico
y += 5;
doc.setFont('helvetica', 'bold');
doc.text('Diagnóstico:', 20, y);
doc.setFont('helvetica', 'normal');
doc.text(atencion?.diagnostico ?? '-', 20 + doc.getTextWidth('Diagnóstico: ') + 2, y);


    // DATOS VETERINARIO
if (firmaImagen) {
  doc.addImage(firmaImagen, 'PNG', 80, 300, 50, 25); 
}
            doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`MV ${atencion?.veterinario?.nombre_vet} ${atencion?.veterinario?.apellidos_vet}`, 105, 330, { align: 'center' });
    doc.text(`RUN ${atencion?.veterinario?.run_vet}`, 105, 335, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`Correo: ${atencion?.veterinario?.email_vet}`, 31, 340) ;
    doc.text(`Celular: +569 ${atencion?.veterinario?.celular_vet}`, 145, 340) ; 

    return doc.output('blob');
  };

  // Si hay logo y firma , cargar la imagen antes de terminar
//
if (logoVet?.startsWith('http') || atencion?.veterinario?.dato_profesional?.firma_png?.startsWith('http')) {
  return new Promise<Blob>((resolve) => {
    const logoImg = new Image();
    const firmaImg = new Image();
    let logoCargado = false;
    let firmaCargada = false;

    const terminarSiListo = () => {
      if ((logoCargado || logoVet) && (firmaCargada || !atencion?.veterinario?.dato_profesional?.firma_png)) {
        resolve(terminarDoc());
      }
    };

    if (logoVet?.startsWith('http')) {
      logoImg.crossOrigin = 'anonymous';
      logoImg.onload = () => {
        doc.addImage(logoImg, 'PNG', 160, 10, 40, 30);
        logoCargado = true;
        terminarSiListo();
      };
      logoImg.onerror = () => {
        console.warn('No se pudo cargar el logo.');
        logoCargado = true;
        terminarSiListo();
      };
      logoImg.src = logoVet;
    } else {
      logoCargado = true;
    }

    if (atencion?.veterinario?.dato_profesional?.firma_png?.startsWith('http')) {
      firmaImg.crossOrigin = 'anonymous';
      firmaImg.onload = () => {
        firmaImagen = firmaImg;
        firmaCargada = true;
        terminarSiListo();
      };
      firmaImg.onerror = () => {
        console.warn('No se pudo cargar la firma.');
        firmaCargada = true;
        terminarSiListo();
      };
      firmaImg.src = atencion.veterinario.dato_profesional.firma_png;
    } else {
      firmaCargada = true;
    }
  });
} else {
  return terminarDoc();
}
}
}