import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarRecetaPage } from './agregar-receta.page';

describe('AgregarRecetaPage', () => {
  let component: AgregarRecetaPage;
  let fixture: ComponentFixture<AgregarRecetaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarRecetaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
