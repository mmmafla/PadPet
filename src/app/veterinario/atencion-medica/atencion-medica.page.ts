import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

@Component({
  selector: 'app-atencion-medica',
  templateUrl: './atencion-medica.page.html',
  styleUrls: ['./atencion-medica.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent]

})
export class AtencionMedicaPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

    irAgregarAtencion() {
      this.router.navigate(['/veterinario/atencion-medica/agregar-atencion-medica']);
  }


}
