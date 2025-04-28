import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-olvidopass',
  templateUrl: './olvidopass.page.html',
  styleUrls: ['./olvidopass.page.scss'],
  standalone:true,
  imports: [IonicModule, RouterModule]
})
export class OlvidopassPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
