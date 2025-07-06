import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Platform, ToastController } from '@ionic/angular';
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
  private toastController = inject(ToastController);

  async ngOnInit() {
    await this.procesarTokenDeUrl();
    await this.verificarSesion();
    this.controlarBotonAtras();
  }

  private async procesarTokenDeUrl() {
    try {
      const { data, error } = await this.supabaseService.processSessionFromUrl();

      if (error) {
        console.error('Error obteniendo sesión:', error.message);
        this.mostrarToast('Error procesando la confirmación de email', 'danger');
        return;
      }

      if (data?.session) {
        console.log('Sesión actualizada tras confirmar token:', data.session);
        this.mostrarToast('Correo confirmado correctamente', 'success');
        // Aquí puedes recargar datos o navegar si quieres
      }
    } catch (error) {
      console.error('Error inesperado procesando token de URL:', error);
    }
  }

  private async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color,
      position: 'middle',
    });
    await toast.present();
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
        console.log('Botón atrás desactivado en /home');
        return;
      } else {
        window.history.back();
      }
    });
  }

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