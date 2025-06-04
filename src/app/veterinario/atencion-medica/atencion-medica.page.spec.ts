import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AtencionMedicaPage } from './atencion-medica.page';

describe('AtencionMedicaPage', () => {
  let component: AtencionMedicaPage;
  let fixture: ComponentFixture<AtencionMedicaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AtencionMedicaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
