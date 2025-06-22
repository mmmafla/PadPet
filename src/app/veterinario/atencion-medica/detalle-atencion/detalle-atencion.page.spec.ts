import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleAtencionPage } from './detalle-atencion.page';

describe('DetalleAtencionPage', () => {
  let component: DetalleAtencionPage;
  let fixture: ComponentFixture<DetalleAtencionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleAtencionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
