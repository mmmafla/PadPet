import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Platform } from '@ionic/angular';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
  
})
export class AppComponent {

  alertController = inject(AlertController);
  router = inject(Router);
  platform = inject(Platform);
  supabaseService = inject(SupabaseService);

constructor() {

}


  // --------------------------------------------------------------
  // Alerta de ayuda
  async showHelpAlert() {
    const alert = await this.alertController.create({
      header: 'Centro de Ayuda',
      message: 'Para consultas, contáctanos por correo o WhatsApp.',
      buttons: [
        {
          text: 'Enviar Correo',
          handler: () => {
            window.open('mailto:ja.alvarezc@duocuc.cl');
          }
        },
        {
          text: 'WhatsApp',
          handler: () => {
            window.open('https://wa.me/56984048112');
          }
        },
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });

    await alert.present();
  }

  // --------------------------------------------------------------
  // Alerta de cierre de sesión
  async presentAlert() {
    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      message: 'Saldrás de tu perfil',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Alerta cancelada');
          }
        },
        {
          text: 'Sí',
          handler: async () => {
            try {
              await this.supabaseService.signOut();
              console.log('Sesión cerrada correctamente');
              localStorage.removeItem('user_veterinario');
              this.router.navigate(['/login']); // Redirige al login o la ruta que prefieras
            } catch (error) {
              console.error('Error cerrando sesión:', (error as Error).message);
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
