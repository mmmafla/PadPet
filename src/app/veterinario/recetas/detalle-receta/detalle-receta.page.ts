import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';
import { ToastController, AlertController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';


@Component({
  selector: 'app-detalle-receta',
  templateUrl: './detalle-receta.page.html',
  styleUrls: ['./detalle-receta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class DetalleRecetaPage implements OnInit {

   idReceta: number;
     atencionId!: number;
  atencion: any ;
    logoVet: string = '';

    alertController = inject(AlertController);
    toastController = inject(ToastController);


  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.idReceta = navigation?.extras?.state?.['id'];
  }

  ngOnInit() {
    if (this.idReceta) {
      this.cargarDetalleReceta(this.idReceta);
    }
  }

  cargarDetalleReceta(id: number) {
  

  }

  modificarReceta(){
      this.router.navigate(['/veterinario/recetas/modificar-receta'], {
    state: { atencion: this.idReceta }
  });

  }

  exportarPdfReceta(){

  }
  exportarPdfRecetaPrueba(){

  }
  enviarPdfReceta(){

  }
}
