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
  supabaseService = inject(SupabaseService);


constructor(private platform: Platform) {
  this.platform.ready().then(() => {
    this.platform.backButton.subscribeWithPriority(10, () => {
      // Aquí controlas que no vuelva al login
      // o puedes mostrar un confirm de salida
      console.log('Botón atrás presionado');
    });
  });
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
            window.open('mailto:padpet.contacto@gmail.com');
          }
        },
        {
          text: 'WhatsApp',
          handler: () => {
            window.open('https://wa.me/56930555576');
          }
        },
        {
          text: 'Cerrar',
          role: 'cancel',
        }
      ],
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
