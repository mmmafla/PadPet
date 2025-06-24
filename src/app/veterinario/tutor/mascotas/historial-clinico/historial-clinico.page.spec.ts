import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialClinicoPage } from './historial-clinico.page';

describe('HistorialClinicoPage', () => {
  let component: HistorialClinicoPage;
  let fixture: ComponentFixture<HistorialClinicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialClinicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
