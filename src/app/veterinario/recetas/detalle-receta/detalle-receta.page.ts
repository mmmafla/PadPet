import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { ToastController, AlertController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { jsPDF } from 'jspdf';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-detalle-receta',
  templateUrl: './detalle-receta.page.html',
  styleUrls: ['./detalle-receta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class DetalleRecetaPage {
  idReceta: number;
  receta: any;
   logoVet: string = '';

  toastController = inject(ToastController);
  alertController = inject(AlertController);

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.idReceta = navigation?.extras?.state?.['id'];
  }

  ionViewWillEnter() {
    if (this.idReceta) {
      this.cargarDetalleReceta(this.idReceta);
    }
  }

  async cargarDetalleReceta(id: number) {
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
        foto_perfil
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
  .eq('id_receta', id)
  .single();


  
  if (error) {
    console.error('Error al cargar receta:', error);
  } else {
    this.receta = data;
    // Aquí asignas la URL o base64 del logo:
    this.logoVet = this.receta?.veterinario?.dato_profesional?.foto_perfil || 'assets/default-user.png';
  }
}

  modificarReceta() {
    this.router.navigate(['/veterinario/recetas/modificar-receta'], {
      state: { id: this.idReceta }
    });
  }
// -------------------------------------------------------------
private async generarPdfReceta(): Promise<Blob> {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });

  // Función para terminar el documento
  const terminarDoc = (): Blob => {
    return doc.output('blob');
  };

  // Borde página A4
  doc.setLineWidth(1);
  doc.setDrawColor(237, 249, 249); // azul clarito
  doc.rect(10, 10, 190, 277);

  // Logo si existe
  const agregarLogo = (): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        doc.addImage(img, 'PNG', 160, 10, 30, 30);
        resolve(terminarDoc());
      };
      img.onerror = () => {
        console.warn('No se pudo cargar el logo');
        resolve(terminarDoc());
      };
      img.src = this.logoVet;
    });
  };

  // Título principal
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('TRATAMIENTO VETERINARIO', 15, 20);

  // --- Encabezado datos paciente ---
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(237, 249, 249);
  doc.rect(10, 40, 190, 10, 'F');
  doc.text('Paciente', 105, 45, { align: 'center' });

  let xLeft = 20;
  let xRight = 110;
  let y = 55;
  const lineGap = 5;

  doc.setFontSize(10);

  // Columna izquierda
  doc.setFont('helvetica', 'bold');
  doc.text('Nombre:', xLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(this.receta?.mascota?.masc_nom ?? '', xLeft + 20, y);

  y += lineGap;
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha de nacimiento:', xLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(this.receta?.mascota?.masc_nacimiento).toLocaleDateString(), xLeft + 40, y);

  y += lineGap;
  doc.setFont('helvetica', 'bold');
  doc.text('Sexo:', xLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(this.receta?.mascota?.sexo_mascota?.masc_sexo ?? '', xLeft + 15, y);

  y += lineGap;
  doc.setFont('helvetica', 'bold');
  doc.text('Grupo Sanguíneo:', xLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(this.receta?.mascota?.grupo_sanguineo?.nom_grupo_sanguineo ?? 'Sin información', xLeft + 35, y);

  y += lineGap;
  doc.setFont('helvetica', 'bold');
  doc.text('Tutor:', xLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${this.receta?.mascota?.tutor?.nombre_tutor ?? ''} ${this.receta?.mascota?.tutor?.apellidos_tutor ?? ''}`, xLeft + 15, y);

  y += lineGap;
  doc.setFont('helvetica', 'bold');
  doc.text('Dirección:', xLeft, y);
  doc.setFont('helvetica', 'normal');
  doc.text(this.receta?.mascota?.tutor?.direccion_tutor ?? 'Sin dirección', xLeft + 20, y);

  // Columna derecha
  y = 55;
  doc.setFont('helvetica', 'bold');
  doc.text('Especie:', xRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(this.receta?.mascota?.raza?.especie?.nom_especie ?? '', xRight + 20, y);

  y += lineGap;
  doc.setFont('helvetica', 'bold');
  doc.text('Edad:', xRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(
    this.receta?.mascota?.masc_edad !== undefined && this.receta?.mascota?.masc_edad !== null
      ? `${this.receta.mascota.masc_edad} años`
      : '',
    xRight + 15, y
  );

  y += lineGap;
  doc.setFont('helvetica', 'bold');
  doc.text('Raza:', xRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(this.receta?.mascota?.raza?.nom_raza ?? '', xRight + 15, y);

  y += lineGap;
  doc.setFont('helvetica', 'bold');
  doc.text('RUN Tutor:', xRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(this.receta?.mascota?.tutor?.run_tutor?.toString() ?? '', xRight + 25, y);

  y += lineGap;
  doc.setFont('helvetica', 'bold');
  doc.text('Celular:', xRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(this.receta?.mascota?.tutor?.celular_tutor ? `+569 ${this.receta.mascota.tutor.celular_tutor}` : 'Sin celular', xRight + 15, y);

  y += lineGap;
  doc.setFont('helvetica', 'bold');
  doc.text('Ciudad:', xRight, y);
  doc.setFont('helvetica', 'normal');
  doc.text(this.receta?.mascota?.tutor?.ciudad?.nombre_ciudad ?? 'Sin ciudad', xRight + 15, y);

  // Detalle del tratamiento
  y += 15;
  doc.setFillColor(237, 249, 249);
  doc.rect(10, 85, 190, 10, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle del Tratamiento', 105, 90, { align: 'center' });

  y += 20;
  doc.setFontSize(12);
  doc.text('Indicaciones:', 20, y);
  doc.setFontSize(10);
  const indicaciones = this.receta?.indicaciones || '-';
  const indicacionesLines = doc.splitTextToSize(indicaciones, 170);
  doc.text(indicacionesLines, 25, y + 7);
  y += indicacionesLines.length * 5 + 15;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Medicamentos:', 20, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  this.receta?.detalle_receta?.forEach((med: any) => {
    doc.text(`• ${med.medicamento?.nombre_medicamento}`, 25, y);
    y += 5;
    doc.text(`Dosis: ${med.dosis_medicamento}`, 30, y);
    y += 5;
    doc.text(`Frecuencia: ${med.frecuencia_medicamento}`, 30, y);
    y += 5;
    doc.text(`Duración: ${med.duracion_medicamento}`, 30, y);
    y += 8;
  });

  // Datos del veterinario
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`MV ${this.receta?.veterinario?.nombre_vet ?? ''} ${this.receta?.veterinario?.apellidos_vet ?? ''}`, 105, 260, { align: 'center' });
  doc.text(`${this.receta?.veterinario?.run_vet ?? ''}`, 105, 265, { align: 'center' });

  doc.setFontSize(9);
  doc.text(`Correo: ${this.receta?.veterinario?.email_vet ?? '-'}`, 31, 270);
  doc.text(`Celular: +569 ${this.receta?.veterinario?.celular_vet ?? '-'}`, 145, 270);

  // Ahora, antes de terminar, si tienes logo, cargalo y agrega
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

// -------------------------------------------------------------

  exportarPdfRecetaPrueba() {
    this.generarPdfReceta().then(pdfBlob => {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      const nombre = this.receta?.mascota?.masc_nom?.replace(/ /g, '_') || 'Receta';
      const fecha = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `Receta_${nombre}_${fecha}.pdf`;
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  async exportarPdfReceta() {
    const pdfBlob = await this.generarPdfReceta();

    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = () => resolve('');
    });

    const fileName = `Receta_${this.receta?.mascota?.masc_nom?.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    try {
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Documents,
        recursive: true
      });

      const toast = await this.toastController.create({
        message: 'PDF guardado correctamente',
        duration: 2000,
        color: 'success'
      });
      toast.present();

      await Share.share({
        title: 'Receta Médica',
        text: 'Te comparto la receta veterinaria en PDF.',
        url: result.uri,
        dialogTitle: 'Compartir PDF'
      });

    } catch (error) {
      const toast = await this.toastController.create({
        message: 'Error al guardar el PDF',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }

  async enviarPdfReceta() {
    const pdfBlob = await this.generarPdfReceta();

    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = () => resolve('');
    });

    const fileName = `Receta_${this.receta?.mascota?.masc_nom?.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    const file = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache,
    });

    const alert = await this.alertController.create({
      header: 'Enviar PDF',
      message: '¿Cómo deseas compartir la receta médica?',
      buttons: [
        {
          text: 'WhatsApp',
          handler: () => {
            const mensaje = encodeURIComponent('Hola, te comparto la receta médica de tu mascota.');
            window.open(`https://wa.me/?text=${mensaje}`, '_blank');
          }
        },
        {
          text: 'Correo',
          handler: () => {
            window.location.href = `mailto:?subject=Receta Médica&body=Te adjunto la receta veterinaria.`;
          }
        },
        {
          text: 'Otros...',
          handler: () => {
            Share.share({
              title: 'Receta Médica',
              text: 'Te adjunto la receta médica en PDF.',
              url: file.uri,
              dialogTitle: 'Compartir receta'
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
