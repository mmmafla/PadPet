import { inject, Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { createClient } from '@supabase/supabase-js';
import { AlertController, ToastController } from '@ionic/angular';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);


@Injectable({ providedIn: 'root' })
export class RecetaService {
  receta: any;
   logoVet: string = '';

  toastController = inject(ToastController);
  alertController = inject(AlertController);

async cargarRecetaCompleta(atencionId: number) {
 const { data, error } = await supabase
 .from('receta')
  .select(`
    id_receta,
    indicaciones,
    fecha_receta,
    run_vet,
    mascota (
      *, 
      raza (
        nom_raza,
        especie ( nom_especie )
      ),
      tutor (
        *,
        ciudad (
          nombre_ciudad
        )
      ),
      sexo_mascota ( masc_sexo ),
      grupo_sanguineo ( nom_grupo_sanguineo )
    ),
    veterinario (
      nombre_vet,
      apellidos_vet,
      run_vet,
      celular_vet,
      email_vet,  
      dato_profesional (
        foto_perfil, firma_png
      )
    ),
    detalle_receta (
      dosis_medicamento,
      duracion_medicamento,
      frecuencia_medicamento,
      medicamento (
        nombre_medicamento
      )
    )
  `)
  .eq('id_atencion', atencionId) 
    .single();

  if (error) {
    console.error('Error al cargar receta:', error);
    return null;
  }

  return data;
}




  //---------------
private dibujarMarcoYPie(doc: jsPDF, numeroPagina: number) {
  // Dibuja el borde
  doc.setLineWidth(1);
  doc.setDrawColor(237, 249, 249);
  doc.rect(10, 10, 120, 196); // Tamaño ajustado para media carta (140 - 20, 216 - 20)

  // Pie de página con número de página centrado abajo
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const textoPagina = `Página ${numeroPagina}`;
  const anchoTexto = doc.getTextWidth(textoPagina);
  const xCentro = (doc.internal.pageSize.getWidth() - anchoTexto) / 2;
  const yPie = 210; // cerca del borde inferior
  doc.text(textoPagina, xCentro, yPie);

  // Firma "Generado en PadPet" en esquina inferior derecha
  const textoFirma = 'Generado en PadPet';
  const anchoFirma = doc.getTextWidth(textoFirma);
  const xFirma = doc.internal.pageSize.getWidth() - 15 - anchoFirma;
  doc.text(textoFirma, xFirma, yPie);
}

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
    if (y >= 190) { // Ajustar altura para media carta
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

// --------------------------------------
async generarPdfRecetaDetallado(receta: any, logoVet: string): Promise<Blob> {
  const doc = new jsPDF({ format: [140, 216], unit: 'mm' }); // media carta

  let firmaImagen: HTMLImageElement | null = null;
  const terminarDoc = (): Blob => {
  // Dibuja el marco y pie inicial
  this.dibujarMarcoYPie(doc, 1);

  // Título
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('RECETA VETERINARIA', 15, 20);

   // Fecha formateada
    const fecha = new Date(receta?.fecha_receta);
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


  // Encabezado paciente con fondo
  doc.setFontSize(12);
  doc.setFillColor(237, 249, 249);
  doc.rect(10, 30, 120, 10, 'F');
  doc.text('Paciente', 70, 37, { align: 'center' });

  let xLeft = 20, xRight = 80, y = 48, gap = 4;
  doc.setFontSize(10);

  // Columna izquierda
  doc.setFont('helvetica', 'bold'); doc.text('Nombre:', xLeft, y);
  doc.setFont('helvetica', 'normal'); doc.text(receta?.mascota?.masc_nom ?? '', xLeft + 20, y);

  y += gap; doc.setFont('helvetica', 'bold'); doc.text('Nacimiento:', xLeft, y);
  doc.setFont('helvetica', 'normal'); doc.text(new Date(receta?.mascota?.masc_nacimiento).toLocaleDateString(), xLeft + 30, y);

  y += gap; doc.setFont('helvetica', 'bold'); doc.text('Sexo:', xLeft, y);
  doc.setFont('helvetica', 'normal'); doc.text(receta?.mascota?.sexo_mascota?.masc_sexo ?? '', xLeft + 15, y);

  y += gap; doc.setFont('helvetica', 'bold'); doc.text('Grupo Sanguíneo:', xLeft, y);
  doc.setFont('helvetica', 'normal'); doc.text(receta?.mascota?.grupo_sanguineo?.nom_grupo_sanguineo ?? 'Sin info', xLeft + 40, y);

  y += gap; doc.setFont('helvetica', 'bold'); doc.text('Tutor:', xLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${receta?.mascota?.tutor?.nombre_tutor ?? ''} ${receta?.mascota?.tutor?.apellidos_tutor ?? ''}`, xLeft + 15, y);

  y += gap; doc.setFont('helvetica', 'bold'); doc.text('Dirección:', xLeft, y);
  doc.setFont('helvetica', 'normal'); doc.text(receta?.mascota?.tutor?.direccion_tutor ?? 'Sin dirección', xLeft + 20, y);

  // Columna derecha
  y = 48;
  doc.setFont('helvetica', 'bold'); doc.text('Especie:', xRight, y);
  doc.setFont('helvetica', 'normal'); doc.text(receta?.mascota?.raza?.especie?.nom_especie ?? '', xRight + 20, y);

  y += gap; doc.setFont('helvetica', 'bold'); doc.text('Edad:', xRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${receta?.mascota?.masc_edad ?? '-'} años`, xRight + 15, y);

  y += gap; doc.setFont('helvetica', 'bold'); doc.text('Raza:', xRight, y);
  doc.setFont('helvetica', 'normal'); doc.text(receta?.mascota?.raza?.nom_raza ?? '', xRight + 15, y);

  y += gap; doc.setFont('helvetica', 'bold'); doc.text('RUN Tutor:', xRight, y);
  doc.setFont('helvetica', 'normal'); doc.text(receta?.mascota?.tutor?.run_tutor?.toString() ?? '', xRight + 20, y);

  y += gap; doc.setFont('helvetica', 'bold'); doc.text('Celular:', xRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(receta?.mascota?.tutor?.celular_tutor ? `+569 ${receta.mascota.tutor.celular_tutor}` : 'Sin celular', xRight + 15, y);

  y += gap; doc.setFont('helvetica', 'bold'); doc.text('Ciudad:', xRight, y);
  doc.setFont('helvetica', 'normal'); doc.text(receta?.mascota?.tutor?.ciudad?.nombre_ciudad ?? 'Sin ciudad', xRight + 15, y);

  // Detalles tratamiento
  y += 15;
  doc.setFillColor(237, 249, 249);
  doc.rect(10, y - 7, 120, 10, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle de la Receta/Tratamiento', 70, y - 2, { align: 'center' });

  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Indicaciones:', 20, y);
  doc.setFont('helvetica', 'normal');
  y = this.escribirTextoMultilinea(doc, receta?.indicaciones || '-', 25, y + 4, 100, 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Medicamentos:', 20, y);
  y += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  receta?.detalle_receta?.forEach((med: any) => {
    if (y >= 190) { // control salto pagina
      doc.addPage();
      this.dibujarMarcoYPie(doc, doc.getNumberOfPages());
      y = 20;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
    }
    doc.text(`• ${med.medicamento?.nombre_medicamento}`, 25, y);
    y += 5;
    doc.text(`Dosis: ${med.dosis_medicamento}`, 30, y);
    y += 5;
    doc.text(`Frecuencia: ${med.frecuencia_medicamento}`, 30, y);
    y += 5;
    doc.text(`Duración: ${med.duracion_medicamento}`, 30, y);
    y += 8;
  });

  // Veterinario al final
  if (y >= 180) { // espacio para pie de página
    doc.addPage();
    this.dibujarMarcoYPie(doc, doc.getNumberOfPages());
    y = 20;
  }

// DATOS VETERINARIO
const yFinal = 150; 
          if (firmaImagen) {
            doc.addImage(firmaImagen, 'PNG', 45, yFinal, 50, 25);  // posición y tamaño ajustado para media carta
          }
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`MV ${receta?.veterinario?.nombre_vet ?? ''} ${receta?.veterinario?.apellidos_vet ?? ''}`, 70, yFinal + 35, { align: 'center' });
          doc.text(`RUN ${receta?.veterinario?.run_vet ?? ''}`, 70, yFinal + 40, { align: 'center' });

          doc.setFontSize(9);
          doc.text(`Correo: ${receta?.veterinario?.email_vet ?? '-'}`, 20, yFinal + 48);
          doc.text(`Celular: +569 ${receta?.veterinario?.celular_vet ?? '-'}`, 80, yFinal + 48);

          return doc.output('blob');
  };

//
   if (logoVet?.startsWith('http') || receta?.veterinario?.dato_profesional?.firma_png?.startsWith('http')) {
  return new Promise<Blob>((resolve) => {
    const logoImg = new Image();
    const firmaImg = new Image();
    let logoCargado = false;
    let firmaCargada = false;

    const terminarSiListo = () => {
      if ((logoCargado || logoVet) && (firmaCargada || !receta?.veterinario?.dato_profesional?.firma_png)) {
        resolve(terminarDoc());
      }
    };

    if (logoVet?.startsWith('http')) {
      logoImg.crossOrigin = 'anonymous';
      logoImg.onload = () => {
        doc.addImage(logoImg, 'PNG', 90, 10, 30, 20);
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

    if (receta?.veterinario?.dato_profesional?.firma_png?.startsWith('http')) {
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
      firmaImg.src = receta.veterinario.dato_profesional.firma_png;
    } else {
      firmaCargada = true;
    }
  });
} else {
  return terminarDoc();
}
}
}

