import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatospersonalesPage } from './datospersonales.page';

describe('DatospersonalesPage', () => {
  let component: DatospersonalesPage;
  let fixture: ComponentFixture<DatospersonalesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DatospersonalesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
