import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-detalle-cita',
  templateUrl: './detalle-cita.page.html',
  styleUrls: ['./detalle-cita.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class DetalleCitaPage {
  cita: any = null;
  id_cita: number | null = null;

  toastController = inject(ToastController);

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.id_cita = nav?.extras?.state?.['id_cita'] || null;
  }

  ionViewWillEnter() {
    if (this.id_cita) {
      this.cargarDetalleCita(this.id_cita);
    }
  }

  async cargarDetalleCita(id: number) {
    const { data, error } = await supabase
      .from('cita')
      .select(`
        id_cita,
        fecha_cita,
        comentario_cita,
        mascota (
          id_masc,
          masc_nom,
          tutor (
            nombre_tutor,
            apellidos_tutor,
            correo_tutor,
            celular_tutor,
            direccion_tutor
          )
        ),
        estado_cita (
          id_estado_cita,
          nombre_estado_cita
        )
      `)
      .eq('id_cita', id)
      .single();

    if (error) {
      console.error('Error al cargar cita:', error);
      this.mostrarToast('Error al cargar los datos de la cita', 'danger');
    } else {
      this.cita = data;
    }
  }

  modificarCita() {
    if (!this.id_cita) return;
    this.router.navigate(['/agenda/modificar-cita'], {
      state: { id_cita: this.id_cita }
    });
  }

  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }
}
