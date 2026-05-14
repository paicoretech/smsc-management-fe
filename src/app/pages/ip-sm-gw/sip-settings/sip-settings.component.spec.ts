import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SipSettingsComponent } from './sip-settings.component';

describe('SipSettingsComponent', () => {
  let component: SipSettingsComponent;
  let fixture: ComponentFixture<SipSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SipSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SipSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
