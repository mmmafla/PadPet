import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificarCitaPage } from './modificar-cita.page';

describe('ModificarCitaPage', () => {
  let component: ModificarCitaPage;
  let fixture: ComponentFixture<ModificarCitaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificarCitaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
