import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/componentes/header/header.component';

@Component({
  selector: 'app-datosprofesionales',
  templateUrl: './datosprofesionales.page.html',
  styleUrls: ['./datosprofesionales.page.scss'],
  standalone:true,
  imports: [IonicModule, RouterModule, HeaderComponent]
})
export class DatosprofesionalesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
