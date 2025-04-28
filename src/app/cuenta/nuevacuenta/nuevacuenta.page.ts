import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-nuevacuenta',
  templateUrl: './nuevacuenta.page.html',
  styleUrls: ['./nuevacuenta.page.scss'],
  standalone:true,
  imports: [IonicModule, RouterModule]
})
export class NuevacuentaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
