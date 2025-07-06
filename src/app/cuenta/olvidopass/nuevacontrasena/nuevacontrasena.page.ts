import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-nuevacontrasena',
  templateUrl: './nuevacontrasena.page.html',
  styleUrls: ['./nuevacontrasena.page.scss'],
    standalone: true,
  imports: [IonicModule, RouterModule, CommonModule, HeaderComponent, FormsModule]
})

export class NuevacontrasenaPage implements OnInit {
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';

  constructor(
    private toastController: ToastController,
    private supabase: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {}

  formValido(): boolean {
    return (
      this.nuevaContrasena.length >= 6 &&
      this.nuevaContrasena === this.confirmarContrasena
    );
  }

  async cambiarContrasena() {
    const { error } = await this.supabase.auth.updateUser({
      password: this.nuevaContrasena
    });

    if (error) {
      return this.mostrarToast('Error al cambiar contraseña.', 'danger');
    }

    await this.mostrarToast('Contraseña cambiada con éxito.');
    this.router.navigate(['/login']);
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
