import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonicModule, RefresherCustomEvent, AlertController, ToastController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { createClient } from '@supabase/supabase-js';
import { CommonModule } from '@angular/common';

// Configuración de Supabase
const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-mascotas',
  templateUrl: './mascotas.page.html',
  styleUrls: ['./mascotas.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule, HeaderComponent]
})
export class MascotasPage implements OnInit {
  mascotas: any[] = [];
  runTutor!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    this.runTutor = this.route.snapshot.paramMap.get('runTutor') || '';
    await this.cargarMascotas();
  }

  async cargarMascotas() {
    const { data, error } = await supabase
      .from('mascota')
      .select('*')
      .eq('run_tutor', this.runTutor);

    if (error) {
      console.error('Error al cargar mascotas', error);
    } else {
      this.mascotas = data;
    }
  }

  irAgregarMascota() {
    this.router.navigate(['/veterinario/tutor/mascotas/agregar-mascota', this.runTutor]);
  }

  irEditarMascota(idMasc: number) {
    this.router.navigate(['/veterinario/tutor/mascotas/editar-mascota', idMasc]);
  }

  async confirmarEliminarMascota(mascota: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Seguro que quieres eliminar a ${mascota.nombre_masc}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => this.eliminarMascota(mascota.id_masc)
        }
      ]
    });

    await alert.present();
  }

  async eliminarMascota(idMasc: number) {
    const { error } = await supabase
      .from('mascota')
      .delete()
      .eq('id_masc', idMasc);

    if (error) {
      console.error('Error al eliminar mascota:', error);
      return;
    }

    const toast = await this.toastController.create({
      message: 'Mascota eliminada correctamente',
      duration: 2000,
      color: 'success'
    });

    await toast.present();
    await this.cargarMascotas();
  }

  async handleRefresh(event: RefresherCustomEvent) {
    await this.cargarMascotas();
    event.detail.complete();
  }
}
