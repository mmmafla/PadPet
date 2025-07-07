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
    // 1. Buscar al veterinario por run
    const { data: vetData, error: vetError } = await this.supabaseService
      .from('veterinario')
      .select('id_auth, nombre_vet, email_vet')
      .eq('run_vet', run)
      .maybeSingle();

    if (vetError || !vetData) {
      this.mostrarToast('RUN no registrado', 'danger');
      return;
    }

    const email = vetData.email_vet;

    // 2. Login con email
    const { data: loginData, error: loginError } = await this.supabaseService.login(email, password!);

    if (loginError || !loginData?.user) {
      this.mostrarToast('Contraseña incorrecta', 'danger');
      return;
    }

    // 3. Obtener datos completos del veterinario por su id_auth
    const id_auth = loginData.user.id;
    const veterinario = await this.supabaseService.getVeterinario(id_auth);

    // 4. Guardar en localStorage
    localStorage.setItem('user_veterinario', JSON.stringify(veterinario));

    // 5. Bienvenida
    const nombreVet = (veterinario.nombre_vet || 'Veterinario').toUpperCase();
    this.mostrarToast(`¡Bienvenido MV. ${nombreVet}!`, 'success');

    // 6. Redirigir
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
