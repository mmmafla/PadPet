import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevacuentaPage } from './nuevacuenta.page';

describe('NuevacuentaPage', () => {
  let component: NuevacuentaPage;
  let fixture: ComponentFixture<NuevacuentaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevacuentaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
