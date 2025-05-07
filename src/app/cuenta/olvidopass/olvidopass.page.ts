import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-olvidopass',
  templateUrl: './olvidopass.page.html',
  styleUrls: ['./olvidopass.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule,HeaderComponent, FormsModule]
})
export class OlvidopassPage implements OnInit {

  opcionSeleccionada: string = 'telefono';  // valor por defecto
  telefono: string = '';
  correo: string = '';

  constructor(private toastController: ToastController) {}

  ngOnInit() {}

  isPhoneValid(): boolean {
    const phoneRegex = /^9[0-9]{8}$/; // formato chileno: 9 dígitos empezando por 9
    return phoneRegex.test(this.telefono);
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.correo);
  }

  async enviarMensaje() {
    if (this.isPhoneValid()) {
      // Simulación de envío de link al celular
      await this.mostrarToast('Se ha enviado un enlace de recuperación a tu celular.');
      // Aquí puedes integrar la lógica real para el envío de SMS
    }
  }

  async enviarMensajeCorreo() {
    if (this.isEmailValid()) {
      // Simulación de envío de correo
      await this.mostrarToast('Se ha enviado un enlace de recuperación a tu correo.');
      // Aquí puedes integrar la lógica real para el envío de email
    }
  }

  private async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }
}
