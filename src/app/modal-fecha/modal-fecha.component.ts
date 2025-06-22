import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-fecha',
  templateUrl: './modal-fecha.component.html',
  styleUrls: ['./modal-fecha.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ModalFechaComponent {
 @Input() fecha = '';
  hora = '';

  constructor(private modalCtrl: ModalController) {}

  onFechaSeleccionada(event: any) {
    this.fecha = event.detail.value.split('T')[0];
  }

  onHoraSeleccionada(event: any) {
    this.hora = event.detail.value.split('T')[1].substring(0, 5);
  }

aceptar() {
  this.modalCtrl.dismiss({
    fecha: this.fecha,
    hora: this.hora
  });
}


    cerrar() {
    this.modalCtrl.dismiss();
  }
}



