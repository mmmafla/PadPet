import { Component, Input, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  standalone: true
})
export class ChartComponent implements AfterViewInit {

  @Input() data: number[] = [];
  @Input() labels: string[] = [];

  ngAfterViewInit(): void {
    const canvas = document.getElementById('chartCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (!canvas) {
      console.error('No se encontró el elemento canvas');
      return;
    }

    if (!ctx) {
      console.error('No se pudo obtener el contexto del canvas');
      return;
    }

    if (!this.data.length || !this.labels.length) {
      console.error('Datos o etiquetas vacías');
      return;
    }

  console.log('Creando gráfico con datos:', this.data);
  console.log('Etiquetas:', this.labels);

    new Chart(ctx, {
      type: 'pie', // 👈 Aquí cambiamos el tipo de gráfico
      data: {
        labels: this.labels,
        datasets: [{
          label: 'Atenciones por especie',
          data: this.data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: 'Especies atendidas'
          }
        }
      }
    });
  }
}