import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/componentes/header/header.component';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-datosprofesionales',
  templateUrl: './datosprofesionales.page.html',
  styleUrls: ['./datosprofesionales.page.scss'],
  standalone:true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, HeaderComponent]
})
export class DatosprofesionalesPage implements OnInit {

  form!: FormGroup;

  // Injecting SupabaseService and ToastController for toast notifications
  supabase = inject(SupabaseService);
  toastController = inject(ToastController);
  router = inject(Router);




  ngOnInit() {
    
    this.form = new FormGroup({
    universidad: new FormControl('', [Validators.required]),
    pais: new FormControl('', [Validators.required]),
    especialidad: new FormControl('', [Validators.required]),
    anoTitulacion: new FormControl('', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]),
  });
}
}
