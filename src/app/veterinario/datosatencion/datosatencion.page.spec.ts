import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatosatencionPage } from './datosatencion.page';

describe('DatosatencionPage', () => {
  let component: DatosatencionPage;
  let fixture: ComponentFixture<DatosatencionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosatencionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
