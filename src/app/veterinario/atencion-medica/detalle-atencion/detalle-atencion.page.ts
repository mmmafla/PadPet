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
import { RecetaService } from 'src/app/services/receta.service';
import { AtencionService } from 'src/app/services/atencion.service';

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
  atencion: any = null;
  receta: any = null;
  medicamentosReceta: any[] = [];
  logoVet: string = '';


  pdfRecetaBlob: Blob | null = null;
  pdfAtencionBlob: Blob | null = null;

  alertController = inject(AlertController);
  toastController = inject(ToastController);
  recetaService = inject(RecetaService);
  atencionService = inject(AtencionService);


  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.atencionId = navigation?.extras?.state?.['id'];

  }


async ngOnInit() {
  this.receta = await this.recetaService.cargarRecetaCompleta(this.atencionId);
  if (this.atencionId) {
    this.atencion = await this.atencionService.cargarAtencionCompleta(this.atencionId);
    this.receta = await this.recetaService.cargarRecetaCompleta(this.atencionId);

    if (this.atencion) {
      this.pdfAtencionBlob = await this.atencionService.generarPdfAtencion(this.atencion, this.logoVet);
    }
    if (this.receta) {
      this.pdfRecetaBlob = await this.recetaService.generarPdfRecetaDetallado(this.receta, this.logoVet);
    }
  }
}

  ionViewWillEnter() {
    if (this.atencionId) {
      this.cargarAtencion();
    this.cargarRecetaDesdeServicio();
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
  //--------------------------------------------------
async cargarReceta() {
  console.log('Cargando receta para atención ID:', this.atencionId);
  if (!this.atencionId) {
    console.warn('No hay atencionId definido.');
    return;
  }

  const { data: receta, error: errorReceta } = await supabase
    .from('receta')
    .select('*')
    .eq('id_atencion', this.atencionId)
    .single();

  if (errorReceta || !receta) {
    console.warn('No se encontró receta para esta atención.', errorReceta);
    this.receta = null;
    this.medicamentosReceta = [];
    return;
  }

  this.receta = receta;
  console.log('Receta cargada:', receta);

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
    this.medicamentosReceta = [];
  } else {
    this.medicamentosReceta = detalles ?? [];
    console.log('Medicamentos receta:', this.medicamentosReceta);
  }
}



  //--------------------------------------------------

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

// ------------------------------------------------------------- EXPORTAR PDF PRUEBA (solo para navegador)
async exportarPdfAtencion() {
  if (!this.atencion) return;

  const pdfBlob = await this.atencionService.generarPdfAtencion(this.atencion, this.logoVet);

  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;

  const nombreMascota = (this.atencion?.mascota?.masc_nom ?? 'Consulta').replace(/[^a-zA-Z0-9]/g, '_');
  const fecha = new Date().toLocaleDateString().replace(/\//g, '-');
  a.download = `Atencion_${nombreMascota}_${fecha}.pdf`;

  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}


// ------------------------------------------------------------- EXPORTAR PDF

async descargarCelularPDFAtencion() {
  if (!this.atencion) return;

  const pdfBlob = await this.atencionService.generarPdfAtencion(this.atencion, this.logoVet);

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
      directory: Directory.Documents, // O Directory.Downloads
      recursive: true
    });

    const toast = await this.toastController.create({
      message: 'PDF guardado correctamente en Documentos.',
      duration: 2500,
      color: 'success'
    });
    await toast.present();

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



async cargarRecetaDesdeServicio() {
  this.receta = await this.recetaService.cargarRecetaCompleta(this.atencionId);
  if (this.receta) {
    this.logoVet = this.receta?.veterinario?.dato_profesional?.foto_perfil || 'assets/default-user.png';
    this.medicamentosReceta = this.receta?.detalle_receta ?? [];
        console.log('Medicamentos receta:', this.medicamentosReceta);
  } else {
    this.medicamentosReceta = [];
  }
}


// --- Receta
async descargarPdfReceta() {
  if (!this.receta) {
    const toast = await this.toastController.create({
      message: 'No hay receta para descargar.',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
    return;
  }

  const pdfBlob = await this.recetaService.generarPdfRecetaDetallado(this.receta, this.logoVet);

  const url = URL.createObjectURL(pdfBlob);
  const nombreMascota = this.receta?.mascota?.masc_nom?.replace(/ /g, '_') || 'Receta';
  const fecha = new Date().toISOString().split('T')[0];
  const fileName = `Receta_${nombreMascota}_${fecha}.pdf`;

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();

  a.remove();
  URL.revokeObjectURL(url);
}




}