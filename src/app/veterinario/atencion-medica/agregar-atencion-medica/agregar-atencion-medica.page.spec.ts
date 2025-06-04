import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarAtencionMedicaPage } from './agregar-atencion-medica.page';

describe('AgregarAtencionMedicaPage', () => {
  let component: AgregarAtencionMedicaPage;
  let fixture: ComponentFixture<AgregarAtencionMedicaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarAtencionMedicaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
