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
  @Input() fechaActual: string = ''; 
  fechaSeleccionada: string = '';

  constructor(private modalCtrl: ModalController) {}

  seleccionar(event: any) {
    this.fechaSeleccionada = event.detail.value;
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }

  aceptar() {
    this.modalCtrl.dismiss(this.fechaSeleccionada || this.fechaActual);
  }
}
