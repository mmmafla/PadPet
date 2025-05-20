import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from 'src/app/services/supabase.service'; // Asegúrate que este servicio exista

@Component({
  selector: 'app-olvidopass',
  templateUrl: './olvidopass.page.html',
  styleUrls: ['./olvidopass.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule, HeaderComponent, FormsModule]
})
export class OlvidopassPage implements OnInit {

  correo: string = '';

  constructor(
    private toastController: ToastController,
    private supabase: SupabaseService
  ) {}

  ngOnInit() {}


  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.correo);
  }


  async enviarMensajeCorreo() {
    if (!this.isEmailValid()) {
      return this.mostrarToast('Correo electrónico no válido.', 'danger');
    }

    const { error } = await this.supabase.auth.resetPasswordForEmail(this.correo, {
      redirectTo: 'http://localhost:8100/nueva-contrasena'
    });

    if (error) {
      return this.mostrarToast('Error al enviar el correo. Verifica que esté bien escrito o registrado.', 'danger');
    }

    return this.mostrarToast('Correo de recuperación enviado. Revisa tu bandeja de entrada.', 'success');
  }

  private async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
