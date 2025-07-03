import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { createClient } from '@supabase/supabase-js';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { jsPDF } from "jspdf";
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { AlertController } from '@ionic/angular';
import { observeNotification } from 'rxjs/internal/Notification';

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
  atencion: any ;
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
    }
  }
  ionViewWillEnter() {
  if (this.atencionId) {
    this.cargarAtencion();
  }
}

  
// ------------------------------------------------------------- CARGAR ATENCIÓN
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
        ciudad (
          nombre_ciudad
        )
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
    veterinario ( nombre_vet, apellidos_vet, run_vet, celular_vet, email_vet,  
          dato_profesional (
          foto_perfil
        ) )
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

// ------------------------------------------------------------- MODIFICAR ATENCIÓN
  modificarConsulta() {
  this.router.navigate(['/editar-atencion'], {
    state: { atencion: this.atencion }
  });
}

truncarTexto(texto: string, max: number = 80): string {
  if (!texto) return '-';
  return texto.length > max ? texto.substring(0, max) + '...' : texto;
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

  // Función interna para terminar el PDF y devolverlo como Blob
  const terminarDoc = (): Blob => {
    // Marco en toda la hoja
    doc.setLineWidth(1);
    doc.setDrawColor(237, 249, 249);
    doc.rect(10, 10, 196, 338);

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
    doc.text(`Anamnesis: ${this.atencion?.anamnesis ?? '-'}`, 110, 100);
    doc.text(`Observaciones: ${this.atencion?.observaciones ?? '-'}`, 25, 105);
//------------------------
    doc.setFont('helvetica', 'bold');
    doc.text(`EXAMEN GENERAL`, 20, 110);
    doc.setFont('helvetica', 'normal');
    doc.text(`Mucosas: ${this.atencion?.mucosa ?? '-'}`, 25, 115);
      doc.text(`Temperatura: ${this.atencion?.temperatura} ºC`, 110, 115);
    doc.text(`Peso: ${this.atencion?.peso ?? '-'} Kg`, 25, 120);
      doc.text(`Condición corporal: ${this.atencion?.condicion_corporal ?? '-'}`, 110, 120);
    doc.text(`Estado sensorial: ${this.atencion?.estado_sensorial?.estado_sensorial ?? '-'}`, 25, 125);
      doc.text(`Estado hidratación: ${this.atencion?.hidratacion?.estado_hidratacion ?? '-'}`, 110, 125);
    doc.text(`Observaciones: ${this.atencion?.observacion_examen ?? '-'}`, 25, 130);
 // ------------------

 
    doc.setFont('helvetica', 'bold');
    doc.text(`EXAMEN PARTICULAR`, 20, 135);
    doc.setFont('helvetica', 'normal');
    doc.text(`Piel y Pelaje: ${this.atencion?.piel_obp?.estado_piel ?? '-'}`, 25, 140);
              doc.text(`• Observación: ${this.truncarTexto(this.atencion?.obs_piel)}`, 30, 145);
    doc.text(`Ojos: ${this.atencion?.ojos_obp?.estado_ojos ?? '-'}`, 25, 150);
              doc.text(`• Observación: ${this.truncarTexto(this.atencion?.obs_ojos)}`, 30, 155);
    doc.text(`Oídos: ${this.atencion?.oidos_obp?.estado_oidos ?? '-'}`, 25, 160);
              doc.text(`• Observación: ${this.atencion?.obs_oidos ?? '-'}`, 30, 165);     
    doc.text(`Dentadura: ${this.atencion?.dentadura_obp?.estado_dentadura ?? '-'}`, 25, 170);
              doc.text(`• Observación: ${this.truncarTexto(this.atencion?.obs_dentadura)}`, 30, 175);
    doc.text(`Sistema Digestivo: ${this.atencion?.sdigestivo_obp?.estado_sdigestivo ?? '-'}`, 25, 180);  
              doc.text(`• Observación: ${this.truncarTexto(this.atencion?.obs_sdigestivo) ?? '-'}`, 30, 185);
    doc.text(`Sistema Cardio Vascular: ${this.atencion?.scvascular_obp?.estado_scvascular ?? '-'}`, 25, 190);
              doc.text(`• Observación: ${this.truncarTexto(this.atencion?.obs_scvascular) ?? '-'}`, 30, 195); 
    doc.text(`Sistema Respiratorio: ${this.atencion?.srespiratorio_obp?.estado_srespiratorio ?? '-'}`, 30, 200);
              doc.text(`• Observación: ${this.truncarTexto(this.atencion?.obs_srespiratorio) ?? '-'}`, 30, 205); 
    doc.text(`Sistema Urinario: ${this.atencion?.surinario_obp?.estado_surinario ?? '-'}`, 25, 210);
              doc.text(`• Observación: ${this.truncarTexto(this.atencion?.obs_surinario) ?? '-'}`, 30, 215); 
    doc.text(`Sistema Nervioso: ${this.atencion?.snervioso_obp?.estado_snervioso ?? '-'}`, 25, 220);
              doc.text(`• Observación: ${this.truncarTexto(this.atencion?.obs_snervioso) ?? '-'}`, 30, 225); 
    doc.text(`Sistema Linfático: ${this.atencion?.slinfatico_obp?.estado_slinfatico ?? '-'}`, 25, 230);
              doc.text(`• Observación: ${this.truncarTexto(this.atencion?.obs_linfatico) ?? '-'}`, 30, 235); 
    doc.text(`Sistema Locomotor: ${this.atencion?.slocomotor_obp?.estado_slocomotor ?? '-'}`, 25, 240);  
                  doc.text(`• Observación: ${this.truncarTexto(this.atencion?.obs_surinario) ?? '-'}`, 30, 245); 
    doc.text(`Sistema Reproductor: ${this.atencion?.sreproductor_obp?.estado_sreproductor ?? '-'}`, 25, 250); 
              doc.text(`• Observación: ${this.truncarTexto(this.atencion?.obs_sreproductor) ?? '-'}`, 30, 255); 

    // ----------------

    doc.setFont('helvetica', 'bold');
    doc.text(`ALIMENTACIÓN`, 20, 260);
    doc.setFont('helvetica', 'normal');
          doc.text(`Tipo Alimentación: ${this.atencion?.tipo_alimentacion?.tipo_alimentacion ?? '-'}`, 25, 265);
          doc.text(`Cantidad de Alimentación: ${this.atencion?.cantidad_alimentacion ?? '-'}`, 25, 270);
          doc.text(`Veces al día: ${this.atencion?.veces_alimentaión ?? '-'}`, 25, 275); 
          doc.text(`Diagnóstico: ${this.atencion?.diagnostico ?? '-'}`, 20, 285);

    doc.setFont('helvetica', 'bold');
    doc.text(`TRATAMIENTO/INDICACIONES`, 20, 290);
    doc.setFont('helvetica', 'normal');       

    // DATOS VETERINARIO
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`MV ${this.atencion?.veterinario?.nombre_vet} ${this.atencion?.veterinario?.apellidos_vet}`, 105, 335, { align: 'center' });
    doc.text(`${this.atencion?.veterinario?.run_vet}`, 105, 340, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`Correo: ${this.atencion?.veterinario?.email_vet}`, 31, 345) ;
    doc.text(`Celular: +569 ${this.atencion?.veterinario?.celular_vet}`, 145, 345) ; 

    return doc.output('blob');
  };

  // Si hay logo, cargar la imagen antes de terminar
  if (this.logoVet && this.logoVet.startsWith('http')) {
    return new Promise<Blob>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';  
      img.onload = () => {
        doc.addImage(img, 'PNG', 160, 10, 30, 30);
        resolve(terminarDoc());
      };
      img.onerror = () => {
        console.warn('No se pudo cargar la imagen del logo.');
        resolve(terminarDoc());
      };
      img.src = this.logoVet;
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