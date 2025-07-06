import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Platform } from '@ionic/angular';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {

  private platform = inject(Platform);
  private alertController = inject(AlertController);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);

  async ngOnInit() {
    await this.verificarSesion();
    this.controlarBotonAtras(); // ← Aquí llamamos la función
  }

  private async verificarSesion() {
    const { data } = await this.supabaseService.getSession();
    if (!data.session) {
      this.router.navigate(['/login']);
    }
  }

  private controlarBotonAtras() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      const currentUrl = this.router.url;

      if (currentUrl === '/home') {
        // Si estamos en /home, desactivamos el botón atrás (no hace nada)
        console.log('Botón atrás desactivado en /home');
        return;
      } else {
        // En otras páginas, ejecuta la navegación hacia atrás
        window.history.back();
      }
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
        },
        {
          text: 'Sí',
          handler: async () => {
            try {
              await this.supabaseService.signOut();
              localStorage.removeItem('user_veterinario');
              this.router.navigate(['/login']);
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
