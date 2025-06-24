import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { createClient } from '@supabase/supabase-js';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { jsPDF } from "jspdf";
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { AlertController } from '@ionic/angular';

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

  alertController = inject(AlertController);

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.atencionId = navigation?.extras?.state?.['id'];
  }

  async ngOnInit() {
    if (this.atencionId) {
      await this.cargarAtencion();
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
          raza ( nom_raza ,
                   especie ( nom_especie)
                ),
          tutor ( * ),
          sexo_mascota ( masc_sexo ),
          grupo_sanguineo( nom_grupo_sanguineo )
        ),
        motivo_consulta ( motivo ),
        hidratacion ( estado_hidratacion ),
        estado_sensorial ( estado_sensorial ),
        piel_obp ( estado_piel ),
        ojos_obp ( estado_ojos ),
        oidos_obp ( estado_oidos),
        dentadura_obp ( estado_dentadura ),
        veterinario ( nombre_vet, apellidos_vet, run_vet )
      `)
      .eq('id', this.atencionId)
      .single();

    if (error) {
      console.error('Error al cargar la atención!', error);
    } else {
      // Convertir run_vet a string para evitar errores de tipo
      if (data?.veterinario?.run_vet != null) {
        data.veterinario.run_vet = data.veterinario.run_vet.toString();
      }
      // Similar para tutor.run_tutor si quieres asegurar también
      if (data?.mascota?.tutor?.run_tutor != null) {
        data.mascota.tutor.run_tutor = data.mascota.tutor.run_tutor.toString();
      }

      this.atencion = data;
    }
  }

  // ------------------------------------------------------------- MODIFICAR ATENCIÓN
  modificarConsulta() {
    this.router.navigate(['/editar-atencion'], {
      state: { atencion: this.atencion }
    });
  }

  private async generarPdf(): Promise<Blob> {
    const doc = new jsPDF();

    // Marco en toda la hoja
    doc.setLineWidth(1);
    doc.setDrawColor(237, 249, 249);
    doc.rect(10, 10, 190, 277);

    // ------------------------------------------- TÍTULO PRINCIPAL
    doc.setFontSize(16);
    doc.setFont('helvetica');
    doc.text('DETALLE CONSULTA MÉDICA VETERINARIA', 105, 30, { align: 'center' });

    // ------------------------------------------- DATOS MASCOTA
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(237, 249, 249);
    doc.rect(10, 40, 190, 10, 'F');
    doc.text('Paciente', 105, 45, { align: 'center', baseline: 'middle' });

    let xLeft = 30;
    let xRight = 120;
    let y = 55;
    let lineGap = 5;

    doc.setFontSize(10);
    // 1. Nombre
    doc.setFont('helvetica', 'bold');
    doc.text('Nombre: ', xLeft, y);
    doc.setFont('helvetica', '');
    doc.text(this.atencion?.mascota?.masc_nom ?? '', xLeft + 20, y);

    // 2. Fecha de nacimiento
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha de nacimiento: ', xLeft, y);
    doc.setFont('helvetica', '');
    doc.text(new Date(this.atencion?.mascota?.masc_nacimiento).toLocaleDateString(), xLeft + 40, y);

    // 3. Sexo
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Sexo: ', xLeft, y);
    doc.setFont('helvetica', '');
    doc.text(this.atencion?.mascota?.sexo_mascota?.masc_sexo ?? '', xLeft + 15, y);

    // 4. Temperatura
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Temperatura: ', xLeft, y);
    doc.setFont('helvetica', '');
    const temperatura = this.atencion?.temperatura ?? '';
    doc.text(temperatura + (temperatura ? 'ºC' : ''), xLeft + 27, y);

    // 5. Tutor
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Tutor: ', xLeft, y);
    doc.setFont('helvetica', '');
    doc.text((this.atencion?.mascota?.tutor?.nombre_tutor ?? '') + ' ' + (this.atencion?.mascota?.tutor?.apellidos_tutor ?? ''), xLeft + 15, y);

    // 6. Dirección
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Dirección: ', xLeft, y);
    doc.setFont('helvetica', '');
    doc.text(this.atencion?.mascota?.tutor?.direccion_tutor ?? 'Sin dirección', xLeft + 20, y);

    // COLUMNA DERECHA
    y = 55;
    // 1. Especie
    doc.setFont('helvetica', 'bold');
    doc.text('Especie: ', xRight, y);
    doc.setFont('helvetica', '');
    doc.text(this.atencion?.mascota?.raza?.especie?.nom_especie ?? '', xRight + 20, y);

    // 2. Edad
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Edad: ', xRight, y);
    doc.setFont('helvetica', '');
    doc.text(this.atencion?.mascota?.masc_edad?.toString() ?? '', xRight + 15, y);

    // 3. Raza
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Raza: ', xRight, y);
    doc.setFont('helvetica', '');
    doc.text(this.atencion?.mascota?.raza?.nom_raza ?? '', xRight + 15, y);

    // 4. Grupo Sanguíneo
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('Grupo Sanguíneo: ', xRight, y);
    doc.setFont('helvetica', '');
    doc.text(this.atencion?.mascota?.grupo_sanguineo?.nom_grupo_sanguineo ?? 'Sin información', xRight + 35, y);

    // 5. RUN Tutor
    y += lineGap;
    doc.setFont('helvetica', 'bold');
    doc.text('RUN Tutor: ', xRight, y);
    doc.setFont('helvetica', '');
    doc.text(this.atencion?.mascota?.tutor?.run_tutor?.toString() ?? '', xRight + 25, y);

    // ------------------------------------------- DETALLE CONSULTA
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(237, 249, 249);
    doc.rect(10, 90, 190, 10, 'F');
    doc.text('Detalles de la Consulta', 105, 95, { align: 'center', baseline: 'middle' });

    doc.setFontSize(10);
    doc.setFont('helvetica', '');

    // Primero parseas la fecha
    const fecha = new Date(this.atencion?.fecha_hora_atencion);

    // Después la formateas según tus necesidades, por ejemplo:
    // "DD-MM-YYYY HH:MM"
    const fechaFormateada = fecha.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    doc.text(`Fecha consulta: ${fechaFormateada}`, 30, 110);
    doc.text(`Motivo de consulta: ${this.atencion?.motivo_consulta?.motivo}`, 30, 115);
    doc.text(`Anamnesis: ${this.atencion?.anamnesis ?? '-'}`, 30, 120);
    doc.setFont('helvetica', 'bold');
    doc.text(`EXAMEN OBJETIVO GENERAL`, 30, 125);
    doc.setFont('helvetica', ' ');
    doc.text(`Mucosas: ${this.atencion?.mucosa ?? '-'}`, 30, 130);
    doc.text(`Temperatura: ${this.atencion?.temperatura} ºC  `, 30, 135);
    doc.text(`Peso: ${this.atencion?.peso ?? '-'} Kg`, 30, 140);
    doc.text(`Condición corporal: ${this.atencion?.condicion_corporal ?? '-'}`, 30, 145);
    doc.text(`Estado sensorial: ${this.atencion?.estado_sensorial?.estado_sensorial ?? '-'}`, 30, 150);
    doc.text(`Estado hidratación: ${this.atencion?.hidratacion?.estado_hidratacion ?? '-'}`, 30, 155);
    doc.text(`Observaciones: ${this.atencion?.observacion_examen ?? '-'}`, 30, 160);
    doc.setFont('helvetica', 'bold');
    doc.text(`EXAMEN OBJETIVO PARTICULAR`, 30, 165);
    doc.setFont('helvetica', ' ');
    doc.text(`Piel y Pelaje: ${this.atencion?.piel_obp?.estado_piel ?? '-'}`, 30, 170);
    doc.text(`Ojos: ${this.atencion?.ojos_obp?.estado_ojos ?? '-'}`, 30, 175);
    doc.text(`Oidos: ${this.atencion?.oidos_obp?.estado_oidos ?? '-'}`, 30, 180);
    doc.text(`Dentadura: ${this.atencion?.dentadura_obp?.estado_dentadura ?? '-'}`, 30, 185);

    doc.text(`Diagnóstico: ${this.atencion?.diagnostico ?? '-'}`, 30, 200);
    doc.text(`Tratamiento: ${this.atencion?.tratamiento ?? '-'}`, 30, 205);
    doc.text(`Observaciones: ${this.atencion?.observaciones ?? '-'}`, 30, 210);

    // ------------------------------------------- DATOS VETERINARIO

    doc.setFontSize(10);
    doc.setFont('helvetica', '');
    doc.text(`MV ${this.atencion?.veterinario?.nombre_vet} ${this.atencion?.veterinario?.apellidos_vet}`, 105, 260, { align: 'center' });
    doc.text(`${this.atencion?.veterinario?.run_vet}`, 105, 265, { align: 'center' });

    return doc.output('blob');
  }

  // ------------------------------------------------------------- EXPORTAR PDF
  exportarPdf() {
    this.generarPdf().then(pdfBlob => {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Atencion_${this.atencion?.mascota?.masc_nom}_${new Date().toLocaleDateString()}.pdf`;
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  // ------------------------------------------------------------- ENVIAR PDF
  async enviarPdf() {
    const pdfBlob = await this.generarPdf();

    // Convertir a base64
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = () => resolve('');
    });

    // guardar primero en el dispositivo
    const fileName = `Atencion_${this.atencion?.mascota?.masc_nom?.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    const file = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache
    });
    // luego mostrar opciones de envío
    await this.showSendOptions(file.uri);
  }

  // ------------
  async showSendOptions(pdfPath: string) {
    const email = this.atencion?.mascota?.tutor?.correo_tutor;
    const phone = this.atencion?.mascota?.tutor?.celular_tutor;

    const alert = await this.alertController.create({
      header: 'Enviar PDF',
      message: '¿Cómo deseas compartir el PDF de la última consulta?',
      buttons: [
        {
          text: 'Correo electrónico',
          handler: () => {
            if (email) {
              // Esto no adjunta PDF pero deja redactado el correo
              window.location.href = `mailto:${email}?subject=Resultado de Consulta&body=Adjunto el PDF de la última consulta. Por favor, revisa el adjunto.`;
            } else {
              console.warn('Tutor sin email');
            }
          }
        },
        {
          text: 'WhatsApp',
          handler: () => {
            let phoneNum = this.atencion?.mascota?.tutor?.celular_tutor ?? '';
            phoneNum = String(phoneNum).trim();
            phoneNum = phoneNum.replace(/\D/g, '');
            if (phoneNum.startsWith('0')) {
              phoneNum = phoneNum.substring(1);
            }
            const phoneConPrefijo = `569${phoneNum}`;
            if (phoneConPrefijo.length === 11) {
              window.open(`https://wa.me/${phoneConPrefijo}?text=${encodeURIComponent('Aquí están los resultados de la última consulta.')}`, '_blank');
            } else {
              console.warn('Número de teléfono inválido para WhatsApp');
            }
          }
        },
        {
          text: 'General',
          handler: async () => {
            await Share.share({
              title: 'Atención Médica',
              text: 'Resultado de la última consulta',
              url: pdfPath
            });
          }
        }
      ]
    });

    await alert.present();
  }
}
