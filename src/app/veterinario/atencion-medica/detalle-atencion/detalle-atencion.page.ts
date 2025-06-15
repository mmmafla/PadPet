import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { createClient } from '@supabase/supabase-js';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { jsPDF } from "jspdf";
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
  atencion: any ;

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
          masc_nom, 
          tutor ( nombre_tutor, apellidos_tutor, run_tutor )
        ),
        motivo_consulta ( motivo ),
        hidratacion ( estado_hidratacion ),
        veterinario ( nombre_vet, apellidos_vet, run_vet )
      `)
      .eq('id', this.atencionId)
      .single();

    if (error) {
      console.error('Error al cargar la atención!', error);
    } else {
      this.atencion = data;
    }
  }

// ------------------------------------------------------------- MODIFICAR ATENCIÓN
  modificarConsulta() {
  this.router.navigate(['/editar-atencion'], {
    state: { atencion: this.atencion }
  });
}

// ------------------------------------------------------------- GENERAR PDF
 private async generarPdf(): Promise<Blob> {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');  
    doc.text('Consulta Médica', 105, 30, { align:'center' });

    // Veterinario
    doc.setFontSize(10);
    doc.text(`Veterinario: ${this.atencion?.veterinario?.nombre_vet} ${this.atencion?.veterinario?.apellidos_vet}` , 20, 50);
    doc.text(`RUN: ${this.atencion?.veterinario?.run_vet}` , 20, 60);

    // Mascota
    doc.setFontSize(12);
    doc.text('Datos de la Mascota', 20, 80, { align:'center' });
    doc.setFontSize(10);
    doc.text(`Nombre: ${this.atencion?.mascota?.masc_nom}` , 20, 90);
    doc.text(`Tutor: ${this.atencion?.mascota?.tutor?.nombre_tutor} ${this.atencion?.mascota?.tutor?.apellidos_tutor}` , 20, 100);
    doc.text(`Run Tutor: ${this.atencion?.mascota?.tutor?.run_tutor}` , 20, 110);
    doc.text(`Fecha de Consulta: ${new Date(this.atencion?.fecha_hora_atencion).toLocaleString()}` , 20, 120);

    // Detalles de la Consulta
    doc.setFontSize(12);
    doc.text('Detalles de la Consulta', 20, 140, { align:'center' });
    doc.setFontSize(10);
    doc.text(`Motivo: ${this.atencion?.motivo_consulta?.motivo}` , 20, 150);
    doc.text(`Diagnóstico: ${this.atencion?.diagnostico}` , 20, 160);
    doc.text(`Tratamiento: ${this.atencion?.tratamiento}` , 20, 170);
    doc.text(`Hidratacion: ${this.atencion?.hidratacion?.estado_hidratacion}` , 20, 180);
  
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
    const file = await Filesystem.writeFile({ 
      path: `Atencion_${this.atencion?.mascota?.masc_nom}_${new Date().toLocaleDateString()}.pdf`,
      data: base64,
      directory: Directory.Cache
    });

    // luego compartir
    await Share.share({ 
      title: 'Atención Médica',
      text: 'Aquí están los resultados de la última consulta',
      url: file.uri
    });
  }
}