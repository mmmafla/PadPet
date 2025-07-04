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
        mascota (
          masc_nom,
          tutor (
            nombre_tutor,
            apellidos_tutor,
            correo_tutor,
            celular_tutor
          )
        ),
        detalle_receta (
          dosis_medicamento,
          duracion_medicamento,
          medicamento (
            nombre_medicamento
          )
        )
      `)
      .eq('id_receta', id)
      .single();

    if (error || !data) {
      const toast = await this.toastController.create({
        message: 'Error al cargar la receta médica.',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
      return;
    }

    this.receta = data;
  }

  modificarReceta() {
    this.router.navigate(['/veterinario/recetas/modificar-receta'], {
      state: { id: this.idReceta }
    });
  }

  private async generarPdf(): Promise<Blob> {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text('Receta Médica Veterinaria', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Paciente: ${this.receta?.mascota?.masc_nom}`, 20, 35);
    doc.text(`Fecha: ${new Date(this.receta?.fecha_receta).toLocaleDateString()}`, 20, 42);
    doc.text(`Tutor: ${this.receta?.mascota?.tutor?.nombre_tutor} ${this.receta?.mascota?.tutor?.apellidos_tutor}`, 20, 49);
    doc.text(`Correo: ${this.receta?.mascota?.tutor?.correo_tutor}`, 20, 56);
    doc.text(`Teléfono: ${this.receta?.mascota?.tutor?.celular_tutor}`, 20, 63);

    doc.setFontSize(12);
    doc.text('Indicaciones:', 20, 75);
    doc.setFontSize(10);
    doc.text(this.receta?.indicaciones || '-', 25, 82, { maxWidth: 160 });

    let y = 95;
    doc.setFontSize(12);
    doc.text('Medicamentos:', 20, y);
    y += 7;

    this.receta?.detalle_receta?.forEach((med: any) => {
      doc.setFontSize(10);
      doc.text(`• ${med.medicamento?.nombre_medicamento}`, 25, y);
      y += 5;
      doc.text(`  Dosis: ${med.dosis_medicamento}`, 30, y);
      y += 5;
      doc.text(`  Duración: ${med.duracion_medicamento}`, 30, y);
      y += 8;
    });

    return doc.output('blob');
  }

  exportarPdfRecetaPrueba() {
    this.generarPdf().then(pdfBlob => {
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
    const pdfBlob = await this.generarPdf();

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
    const pdfBlob = await this.generarPdf();

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
