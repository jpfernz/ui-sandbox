import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ITimeBlock, ITimeBox } from '../models/time-box.interface';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TimeBlockForm } from '../time-block-form/time-block-form';

@Component({
  selector: 'time-box',
  templateUrl: './time-box.html',
  styleUrls: ['./time-box.scss'],
  imports: [
    DatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    CdkDragPlaceholder,
    CdkDropList,
    CdkDrag,
  ],
})
export class TimeBox {
  readonly #dialog = inject(MatDialog);

  mockTimeBlocks: ITimeBlock[] = [
    {
      position: 1,
      duration: 30,
      description: 'Morning Meeting',
    },
    {
      position: 2,
      duration: 45,
      description: 'Project Discussion',
    },
    {
      position: 3,
      duration: 15,
      description: 'Client Call',
    },
  ];

  mockTimeBox: ITimeBox = {
    startTime: new Date('2023-01-01T05:00:00'), // Set to 05:00 to match initial input
    endTime: new Date('2023-01-01T09:00:00'),
    timeBlocks: this.mockTimeBlocks,
  };

  // Input field for start time, initialized to 05:00 GMT
  startTimeInput = '05:00';

  constructor() {
    // Initialize times on component creation
    this.updateTimesAfterReorder();
  }

  onStartTimeChange(timeValue: string) {
    // Update the input property
    this.startTimeInput = timeValue;

    // Parse the time input (HH:mm format) and update the mockTimeBox startTime
    if (timeValue) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      const newStartTime = new Date('2023-01-01T00:00:00');
      newStartTime.setHours(hours, minutes, 0, 0);

      this.mockTimeBox.startTime = newStartTime;
      this.updateTimesAfterReorder();
    }
  }

  addTimeBlock() {
    const dialogRef = this.#dialog.open(TimeBlockForm);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.mockTimeBlocks.push(result);
        this.updateTimesAfterReorder();
      }
    });
  }

  drop(event: CdkDragDrop<ITimeBlock[]>) {
    moveItemInArray(
      this.mockTimeBlocks,
      event.previousIndex,
      event.currentIndex
    );
    this.updateTimesAfterReorder();
  }

  /**
   * Add minutes to a Date returning a new Date instance.
   */
  private addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }

  /**
   * Recalculate startTime/endTime for every time block after reordering.
   * The first block starts at mockTimeBox.startTime, and each subsequent block
   * starts when the previous one ends. Also updates position values.
   */
  private updateTimesAfterReorder(): void {
    if (!this.mockTimeBlocks || this.mockTimeBlocks.length === 0) return;

    for (let i = 0; i < this.mockTimeBlocks.length; i++) {
      const block = this.mockTimeBlocks[i];

      // Update position to match array index
      block.position = i + 1;

      // Determine start time based on position
      if (i === 0) {
        // First item uses mockTimeBox startTime
        block.startTime = new Date(this.mockTimeBox.startTime);
      } else {
        // Subsequent items start when previous item ends
        const previousBlock = this.mockTimeBlocks[i - 1];
        block.startTime = previousBlock.endTime
          ? new Date(previousBlock.endTime)
          : new Date();
      }

      // Calculate end time from start time + duration
      block.endTime = this.addMinutes(block.startTime, block.duration);
    }
  }
}
