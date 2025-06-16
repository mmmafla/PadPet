import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { createClient } from '@supabase/supabase-js';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

// Configuración Supabase
const supabaseUrl = 'https://irorlonysbmkbdthvrmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyb3Jsb255c2Jta2JkdGh2cm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODgwMDQsImV4cCI6MjA2MTg2NDAwNH0.s-ZEteHxMWX43NCQIuNmTWpbBoEUxseKyg_YaXpi6Ek';
const supabase = createClient(supabaseUrl, supabaseKey);


@Component({
  selector: 'app-historial-clinico',
  templateUrl: './historial-clinico.page.html',
  styleUrls: ['./historial-clinico.page.scss'],
    standalone: true,
  imports: [IonicModule, HeaderComponent, CommonModule]
})
export class HistorialClinicoPage implements OnInit {
 idMasc!: number;
  atenciones: any[] = [];

  constructor(private route: ActivatedRoute) { }

  async ngOnInit() {
    this.idMasc = Number(this.route.snapshot.paramMap.get('id_masc')) || 0;
    if (this.idMasc <= 0) {
      console.error('Id de mascota no válida');
      return;
    }
    await this.cargarAtenciones();
  }

  async cargarAtenciones() {
    const { data, error } = await supabase
      .from('atencion_medica')
      .select('*')
      .eq('id_masc', this.idMasc)
      .order('fecha_hora_atencion', { ascending: false });

    if (error) {
      console.error('Error al cargar atenciones', error);
    } else {
      this.atenciones = data || []; 
    }
  }
}
