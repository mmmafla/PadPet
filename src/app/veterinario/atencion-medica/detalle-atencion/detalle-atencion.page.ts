import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { createClient } from '@supabase/supabase-js';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { jsPDF } from 'jspdf';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-detalle-atencion',
  templateUrl: './detalle-atencion.page.html',
  styleUrls: ['./detalle-atencion.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent]
})
export class DetalleAtencionPage implements OnInit {
  atencionId!: number;
  atencion: any;
  receta: any = null;
  medicamentosReceta: any[] = [];
  logoVet: string = '';

  alertController = inject(AlertController);
  toastController = inject(ToastController);

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.atencionId = navigation?.extras?.state?.['id'];
  }

  async ngOnInit() {
    if (this.atencionId) {
      await this.cargarAtencion();
      await this.cargarReceta();
    }
  }

  ionViewWillEnter() {
    if (this.atencionId) {
      this.cargarAtencion();
      this.cargarReceta();
    }
  }

  async cargarAtencion() {
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
      .eq('id', this.atencionId)
      .single();

    if (error) {
      console.error('Error al cargar la atención!', error);
    } else {
      this.atencion = data;
      this.logoVet = this.atencion?.veterinario?.dato_profesional?.foto_perfil || 'assets/default-user.png';
    }
  }

  async cargarReceta() {
    const { data: receta, error: errorReceta } = await supabase
      .from('receta')
      .select('*')
      .eq('id_atencion', this.atencionId)
      .single();

    if (errorReceta) {
      console.warn('No se encontró receta para esta atención.');
      return;
    }

    this.receta = receta;

    const { data: detalles, error: errorDetalles } = await supabase
      .from('detalle_receta')
      .select(`
        *,
        medicamento (
          nombre_medicamento
        )
      `)
      .eq('id_receta', receta.id_receta);

    if (errorDetalles) {
      console.error('Error al cargar detalle de la receta:', errorDetalles);
    } else {
      this.medicamentosReceta = detalles ?? [];
    }
  }

  modificarConsulta() {
    this.router.navigate(['/editar-atencion'], {
      state: { atencion: this.atencion }
    });
  }

  modificarReceta() {
  if (this.receta && this.receta.id_receta) {
    this.router.navigate(['/veterinario/recetas/modificar-receta', this.receta.id_receta]);
  } else {
    this.toastController.create({
      message: 'No hay receta para modificar.',
      duration: 2000,
      color: 'warning'
    }).then(toast => toast.present());
  }
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
private async generarPdf(): Promise<Blob> {
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
    const fecha = new Date(this.atencion?.fecha_hora_atencion);
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
    doc.text(this.atencion?.mascota?.masc_nom ?? '', xLeft + 20, y);

    // 2. Fecha de nacimiento
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha de nacimiento: ', xLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(this.atencion?.mascota?.masc_nacimiento).toLocaleDateString(), xLeft + 40, y);

    // 3. Sexo
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Sexo: ', xLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text(this.atencion?.mascota?.sexo_mascota?.masc_sexo ?? '', xLeft + 15, y);

    // 4. Grupo Sanguíneo
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Grupo Sanguíneo: ', xLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text(this.atencion?.mascota?.grupo_sanguineo?.nom_grupo_sanguineo ?? 'Sin información', xLeft + 35, y);

    // 5. Tutor
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Tutor: ', xLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text((this.atencion?.mascota?.tutor?.nombre_tutor ?? '') + ' ' + (this.atencion?.mascota?.tutor?.apellidos_tutor ?? ''), xLeft + 15, y);

    // 6. Dirección
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Dirección: ', xLeft, y);
    doc.setFont('helvetica', 'normal');
    doc.text(this.atencion?.mascota?.tutor?.direccion_tutor ?? 'Sin dirección', xLeft + 20, y);

    // COLUMNA DERECHA
    y = 55;
    // 1. Especie
    doc.setFont('helvetica', 'bold');
    doc.text('Especie: ', xRight, y);
    doc.setFont('helvetica', 'normal');
    doc.text(this.atencion?.mascota?.raza?.especie?.nom_especie ??'', xRight + 20, y);

    // 2. Edad
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Edad: ', xRight, y);
    doc.setFont('helvetica', 'normal');
    doc.text((this.atencion?.mascota?.masc_edad !== undefined && this.atencion?.mascota?.masc_edad !== null) ? `${this.atencion.mascota.masc_edad} años` : '', xRight + 15, y);


    // 3. Raza
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Raza: ', xRight, y);
    doc.setFont('helvetica', 'normal');
    doc.text(this.atencion?.mascota?.raza?.nom_raza ?? '', xRight + 15, y);

    // 4. RUN Tutor
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('RUN Tutor: ', xRight, y);
    doc.setFont('helvetica', 'normal');
    doc.text(this.atencion?.mascota?.tutor?.run_tutor?.toString() ?? '', xRight + 25, y);

    // 5. Teléfono
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Celular: ', xRight, y);
    doc.setFont('helvetica', 'normal');
    doc.text( this.atencion?.mascota?.tutor?.celular_tutor  ? `+569 ${this.atencion.mascota.tutor.celular_tutor.toString()}` : 'Sin Celular',  xRight + 15,  y);


    // 6. Ciudad
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Ciudad: ', xRight, y);
    doc.setFont('helvetica', 'normal');
    doc.text(this.atencion?.mascota?.tutor?.ciudad?.nombre_ciudad ?? 'Sin Ciudad', xRight + 15, y);
//--------------------------------------------------------------------------------
    // DETALLE CONSULTA
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(237, 249, 249);
    doc.rect(10, 85, 196, 10, 'F');
    doc.text('Detalles de la Consulta', 108, 90, { align: 'center', baseline: 'middle' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Motivo de consulta: ${this.atencion?.motivo_consulta?.motivo}`, 25, 100);
      y = 105;
      const anamnesisTexto = `Anamnesis: ${this.atencion?.anamnesis ?? '-'}`;
      y = this.escribirTextoMultilinea(doc, anamnesisTexto, 25, y, 170, 5);
      const observacionesTexto = `Observaciones: ${this.atencion?.observaciones ?? '-'}`;
      y = this.escribirTextoMultilinea(doc, observacionesTexto, 25, y, 170, 5);
//------------------------
    doc.setFont('helvetica', 'bold');
    doc.text(`EXAMEN GENERAL`, 20,y);
 y += 5;
doc.setFont('helvetica', 'normal');
// 
        const examenGeneral = [
          { label: 'Mucosas', valor: this.atencion?.mucosa ?? '-' },
          { label: 'Temperatura', valor: `${this.atencion?.temperatura ?? '-'} ºC` },
          { label: 'Peso', valor: `${this.atencion?.peso ?? '-'} Kg` },
          { label: 'Condición corporal', valor: this.atencion?.condicion_corporal ?? '-' },
          { label: 'Estado sensorial', valor: this.atencion?.estado_sensorial?.estado_sensorial ?? '-' },
          { label: 'Estado hidratación', valor: this.atencion?.hidratacion?.estado_hidratacion ?? '-' },
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
const obsGeneral = `Observaciones: ${this.atencion?.observacion_examen ?? '-'}`;
y = this.escribirTextoMultilinea(doc, obsGeneral, 25, y, 170, 5);


          // ------------------
          // Título del bloque
          doc.setFont('helvetica', 'bold');
          doc.text(`EXAMEN PARTICULAR`, 20, y);
          y += 5;


          doc.setFont('helvetica', 'normal');
          // Datos del examen particular
          const examenParticular = [
            { label: 'Piel y Pelaje', estado: this.atencion?.piel_obp?.estado_piel, obs: this.atencion?.obs_piel },
            { label: 'Ojos', estado: this.atencion?.ojos_obp?.estado_ojos, obs: this.atencion?.obs_ojos },
            { label: 'Oídos', estado: this.atencion?.oidos_obp?.estado_oidos, obs: this.atencion?.obs_oidos },
            { label: 'Dentadura', estado: this.atencion?.dentadura_obp?.estado_dentadura, obs: this.atencion?.obs_dentadura },
            { label: 'Sistema Digestivo', estado: this.atencion?.sdigestivo_obp?.estado_sdigestivo, obs: this.atencion?.obs_sdigestivo },
            { label: 'Sistema Cardio Vascular', estado: this.atencion?.scvascular_obp?.estado_scvascular, obs: this.atencion?.obs_scvascular },
            { label: 'Sistema Respiratorio', estado: this.atencion?.srespiratorio_obp?.estado_srespiratorio, obs: this.atencion?.obs_srespiratorio },
            { label: 'Sistema Urinario', estado: this.atencion?.surinario_obp?.estado_surinario, obs: this.atencion?.obs_surinario },
            { label: 'Sistema Nervioso', estado: this.atencion?.snervioso_obp?.estado_snervioso, obs: this.atencion?.obs_snervioso },
            { label: 'Sistema Linfático', estado: this.atencion?.slinfatico_obp?.estado_slinfatico, obs: this.atencion?.obs_linfatico },
            { label: 'Sistema Locomotor', estado: this.atencion?.slocomotor_obp?.estado_slocomotor, obs: this.atencion?.obs_slocomotor },
            { label: 'Sistema Reproductor', estado: this.atencion?.sreproductor_obp?.estado_sreproductor, obs: this.atencion?.obs_sreproductor }
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
            `Tipo Alimentación: ${this.atencion?.tipo_alimentacion?.tipo_alimentacion ?? '-'}\n` +
            `Cantidad de Alimentación: ${this.atencion?.cantidad_alimentacion ?? '-'}\n` +
            `Veces al día: ${this.atencion?.veces_alimentaión ?? '-'}`;
doc.setFont('helvetica', 'normal');
y = this.escribirTextoMultilinea(doc, alimentacionTexto, 25, y, 170, 5);

 // Diagnostico
y += 5;
doc.setFont('helvetica', 'bold');
doc.text('Diagnóstico:', 20, y);
doc.setFont('helvetica', 'normal');
doc.text(this.atencion?.diagnostico ?? '-', 20 + doc.getTextWidth('Diagnóstico: ') + 2, y);


    // DATOS VETERINARIO
if (firmaImagen) {
  doc.addImage(firmaImagen, 'PNG', 80, 300, 50, 25); 
}
            doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`MV ${this.atencion?.veterinario?.nombre_vet} ${this.atencion?.veterinario?.apellidos_vet}`, 105, 330, { align: 'center' });
    doc.text(`RUN ${this.atencion?.veterinario?.run_vet}`, 105, 335, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`Correo: ${this.atencion?.veterinario?.email_vet}`, 31, 340) ;
    doc.text(`Celular: +569 ${this.atencion?.veterinario?.celular_vet}`, 145, 340) ; 

    return doc.output('blob');
  };

  // Si hay logo y firma , cargar la imagen antes de terminar
//
if (this.logoVet?.startsWith('http') || this.atencion?.veterinario?.dato_profesional?.firma_png?.startsWith('http')) {
  return new Promise<Blob>((resolve) => {
    const logoImg = new Image();
    const firmaImg = new Image();
    let logoCargado = false;
    let firmaCargada = false;

    const terminarSiListo = () => {
      if ((logoCargado || !this.logoVet) && (firmaCargada || !this.atencion?.veterinario?.dato_profesional?.firma_png)) {
        resolve(terminarDoc());
      }
    };

    if (this.logoVet?.startsWith('http')) {
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
      logoImg.src = this.logoVet;
    } else {
      logoCargado = true;
    }

    if (this.atencion?.veterinario?.dato_profesional?.firma_png?.startsWith('http')) {
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
      firmaImg.src = this.atencion.veterinario.dato_profesional.firma_png;
    } else {
      firmaCargada = true;
    }
  });
} else {
  return terminarDoc();
}
}
// ------------------------------------------------------------- EXPORTAR PDF PRUEBA (solo para navegador)
exportarPdfPrueba() {
  this.generarPdf().then(pdfBlob => {
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;

    // Nombre del archivo usando template literals (backticks)
    const nombreMascota = (this.atencion?.mascota?.masc_nom ?? 'Consulta').replace(/[^a-zA-Z0-9]/g, '_');
    const fecha = new Date().toLocaleDateString().replace(/\//g, '-'); // Reemplaza / por - para evitar errores en nombres
    a.download = `Atencion_${nombreMascota}_${fecha}.pdf`;

    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
}

// ------------------------------------------------------------- EXPORTAR PDF

async exportarPdf() {
  const pdfBlob = await this.generarPdf();

  // Convertir a base64
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(pdfBlob);
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = () => resolve('');
  });

  const nombreMascota = (this.atencion?.mascota?.masc_nom ?? 'Consulta').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Atencion_${nombreMascota}_${new Date().toISOString().split('T')[0]}.pdf`;

  try {
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Documents, // O Directory.Downloads (requiere permiso extra)
      recursive: true
    });

    // ✅ Mostrar toast o alerta de confirmación si deseas
    const toast = await this.toastController.create({
      message: 'PDF guardado correctamente en Documentos.',
      duration: 2500,
      color: 'success'
    });
    await toast.present();

    // (Opcional) Mostrar opción para compartir luego de guardar
    await Share.share({
      title: 'Consulta médica',
      text: 'Aquí tienes el PDF guardado.',
      url: result.uri,
      dialogTitle: 'Compartir PDF',
    });

  } catch (error) {
    console.error('Error al guardar el PDF:', error);

const toast = await this.toastController.create({
      message: 'Error al guardar el PDF.',
      duration: 2500,
      color: 'danger'
    });
    await toast.present();
  }
}

// ------------------------------------------------------------- ENVIAR PDF
async enviarPdf() {
  const pdfBlob = await this.generarPdf();

  // Convertir a base64
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(pdfBlob);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = () => resolve('');
  });

  const fileName = `Atencion_${this.atencion?.mascota?.masc_nom?.replace(/ /g,'_')}_${new Date().toISOString().split('T')[0]}.pdf`;

  try {
    const file = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache,
    });

    // Mostrar opciones de envío
    await this.mostrarOpcionesEnvio(file.uri);
  } catch (error) {
    console.error('Error al guardar el PDF:', error);
  }
}
  // ------------
async mostrarOpcionesEnvio(pdfPath: string) {
  const alert = await this.alertController.create({
    header: 'Enviar PDF',
    message: '¿Cómo deseas compartir el PDF de la última consulta?',
    buttons: [
      {
        text: 'Correo electrónico',
        handler: () => {
          const email = this.atencion?.mascota?.tutor?.correo_tutor;
          if (email) {
            window.location.href = `mailto:${email}?subject=Resultado de Consulta&body=Te comparto el PDF de la última atención médica.`;
          } else {
            console.warn('No se encontró el correo del tutor');
          }
        }
      },
      {
        text: 'WhatsApp',
        handler: () => {
          let telefono = this.atencion?.mascota?.tutor?.celular_tutor ?? '';
          telefono = telefono.toString().replace(/\D/g, '');
          if (telefono.startsWith('0')) {
            telefono = telefono.slice(1);
          }
          const numeroConPrefijo = `569${telefono}`;
          if (numeroConPrefijo.length === 11) {
            window.open(
              `https://wa.me/${numeroConPrefijo}?text=${encodeURIComponent('Hola, te comparto el PDF con los resultados de la última consulta.')}`,
              '_blank'
            );
          } else {
            console.warn('Número inválido para WhatsApp');
          }
        }
      },
      {
        text: 'Compartir (otros)',
        handler: async () => {
          await Share.share({
            title: 'Consulta médica',
            text: 'Te comparto el PDF de la atención médica.',
            url: pdfPath,
            dialogTitle: 'Compartir PDF',
          });
        }
      },
      {
        text: 'Cancelar',
        role: 'cancel'
      }
    ]
  });

  await alert.present();
}

}