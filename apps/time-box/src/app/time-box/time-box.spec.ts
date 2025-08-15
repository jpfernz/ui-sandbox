import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { TimeBox } from './time-box';

describe('TimeBox', () => {
  let component: TimeBox;
  let fixture: ComponentFixture<TimeBox>;
  let mockDialog: Partial<MatDialog>;

  beforeEach(async () => {
    mockDialog = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        TimeBox,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
      ],
      providers: [{ provide: MatDialog, useValue: mockDialog }],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeBox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toBe('Time Box');
  });

  it('should display start time input', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('[data-testid="start-time-input"]');
    expect(input).toBeTruthy();
  });

  it('should display time blocks', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const timeBlocks = compiled.querySelectorAll(
      '[data-testid^="time-block-"]'
    );
    expect(timeBlocks.length).toBeGreaterThan(0);
  });

  it('should display add button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const addButton = compiled.querySelector(
      '[data-testid="add-time-block-button"]'
    );
    expect(addButton).toBeTruthy();
  });

  it('should have initial start time value', () => {
    expect(component['startTimeInput']).toBe('05:00');
  });

  it('should update start time when input changes', () => {
    component.onStartTimeChange('10:00');
    expect(component['startTimeInput']).toBe('10:00');
  });

  it('should display delete buttons for time blocks', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const deleteButtons = compiled.querySelectorAll(
      '[data-testid^="delete-button-"]'
    );
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('should delete time block when delete button is clicked', () => {
    const initialCount = component['mockTimeBlocks'].length;
    component.deleteTimeBlock(0);
    expect(component['mockTimeBlocks'].length).toBe(initialCount - 1);
  });

  it('should not delete time block with invalid index', () => {
    const initialCount = component['mockTimeBlocks'].length;
    component.deleteTimeBlock(-1);
    expect(component['mockTimeBlocks'].length).toBe(initialCount);

    component.deleteTimeBlock(999);
    expect(component['mockTimeBlocks'].length).toBe(initialCount);
  });

  it('should update positions after deletion', () => {
    // Delete the first item (Morning Meeting)
    component.deleteTimeBlock(0);

    // Check that positions are recalculated
    const timeBlocks = component['mockTimeBlocks'];
    timeBlocks.forEach((block, index) => {
      expect(block.position).toBe(index + 1);
    });
  });
});
