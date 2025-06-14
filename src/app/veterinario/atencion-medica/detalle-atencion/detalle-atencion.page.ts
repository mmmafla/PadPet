import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { createClient } from '@supabase/supabase-js';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);

@Component({
  selector: 'app-detalle-atencion',
  templateUrl: './detalle-atencion.page.html',
  styleUrls: ['./detalle-atencion.page.scss'],
      standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent] 
})
export class DetalleAtencionPage implements OnInit {
  atencion: any;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    this.atencion = navigation?.extras?.state?.['atencion'];

  }

  ngOnInit() {
  }

  modificarConsulta() {
  this.router.navigate(['/editar-atencion'], {
    state: { atencion: this.atencion }
  });
}
}