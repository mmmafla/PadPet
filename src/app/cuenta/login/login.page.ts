import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormularioComponent } from 'src/app/componentes/formulario/formulario.component';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, RouterModule, ReactiveFormsModule, FormularioComponent, CommonModule],
})
export class LoginPage implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  toastController = inject(ToastController);
  router = inject(Router);
  supabaseService = inject(SupabaseService);

  ngOnInit(): void {}

  async submit() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;

    try {
      const { error, data } = await this.supabaseService.login(email!, password!);

      if (error) {
        this.mostrarToast('Correo o contraseña incorrecta', 'danger');
        console.error('Error de login:', error.message);
        return;
      }

      // Obtener los datos del veterinario usando el id_auth
      const { data: vetData, error: vetError } = await this.supabaseService
        .from('veterinario')
        .select('nombre_vet')
        .eq('id_auth', data.user.id)
        .single();

      if (vetError) {
        console.error('Error al obtener el veterinario:', vetError.message);
        this.mostrarToast('Error al obtener los datos del veterinario', 'danger');
        return;
      }

      // Mostrar el toast personalizado con el nombre del veterinario
      const nombreVet = (vetData?.nombre_vet || 'Veterinario').toUpperCase();
      this.mostrarToast(`¡Bienvenido MV. ${nombreVet}! Sesión iniciada con éxito`, 'success');

      localStorage.setItem('user_veterinario', 'true');
      this.router.navigate(['/home']); 
    } catch (err: any) {
      this.mostrarToast('Error inesperado: ' + err.message, 'danger');
    }
  }

  private async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'middle',
    });
    toast.present();
  }
}
