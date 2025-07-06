import { Component, Input, AfterViewInit, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  standalone: true
})
export class ChartComponent implements AfterViewInit, OnChanges {
  @Input() data: number[] = [];
  @Input() labels: string[] = [];
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;

  colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#8A2BE2', '#00CED1', '#FFD700', '#DC143C',
    '#00FA9A', '#FF4500', '#2E8B57', '#FF1493'
  ];

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if (context) {
      this.ctx = context;
      this.drawChart();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.ctx && (changes['data'] || changes['labels'])) {
      this.drawChart();
    }
  }

  drawChart() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const total = this.data.reduce((sum, val) => sum + val, 0);
    if (total === 0) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 20;
    let startAngle = 0;

    for (let i = 0; i < this.data.length; i++) {
      const value = this.data[i];
      const sliceAngle = (value / total) * 2 * Math.PI;
      const color = this.colors[i % this.colors.length];
      const midAngle = startAngle + sliceAngle / 2;

      // Dibuja sector
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Línea blanca entre sectores
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Etiqueta centrada en el sector
      const labelRadius = radius * 0.6;
      const labelX = cx + labelRadius * Math.cos(midAngle);
      const labelY = cy + labelRadius * Math.sin(midAngle);

      ctx.fillStyle = '#000';
      ctx.font = 'bold 30px Segoe UI';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 3;
      ctx.fillText(this.labels[i], labelX, labelY);
      ctx.shadowBlur = 0;

      startAngle += sliceAngle;
    }
  }
}