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
    run: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  toastController = inject(ToastController);
  router = inject(Router);
  supabaseService = inject(SupabaseService);

  ngOnInit(): void {}

  async submit() {
    if (this.form.invalid) return;

    const { run, password } = this.form.value;

    try {
      // Buscar al veterinario por run_vet
      const { data: vetData, error: vetError } = await this.supabaseService
        .from('veterinario')
        .select('id_auth, nombre_vet, email_vet')
        .eq('run_vet', run)
        .maybeSingle();

      if (vetError || !vetData) {
        this.mostrarToast('RUN no registrado', 'danger');
        console.error('Error al obtener veterinario:', vetError?.message);
        return;
      }

      const email = vetData.email_vet;

      // Iniciar sesión con el email encontrado
      const { error: loginError } = await this.supabaseService.login(email, password!);

      if (loginError) {
        this.mostrarToast('Contraseña incorrecta', 'danger');
        console.error('Error de login:', loginError.message);
        return;
      }

      // Obtener usuario autenticado
      const { data: userData, error: userError } = await this.supabaseService.auth.getUser();

      if (userError || !userData?.user) {
        this.mostrarToast('No se pudo obtener el usuario autenticado', 'danger');
        console.error('Error al obtener usuario:', userError?.message);
        return;
      }

      const nombreVet = (vetData.nombre_vet || 'Veterinario').toUpperCase();
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
