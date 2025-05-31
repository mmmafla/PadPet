import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatosprofesionalesPage } from './datosprofesionales.page';

describe('DatosprofesionalesPage', () => {
  let component: DatosprofesionalesPage;
  let fixture: ComponentFixture<DatosprofesionalesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosprofesionalesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
