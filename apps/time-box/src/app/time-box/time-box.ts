import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ITimeBlock, ITimeBox } from '../models/time-box.interface';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'time-box',
  templateUrl: './time-box.html',
  styleUrls: ['./time-box.scss'],
  imports: [
    DatePipe,
    MatButtonModule,
    CdkDragPlaceholder,
    CdkDropList,
    CdkDrag,
  ],
})
export class TimeBox {
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
    startTime: new Date('2023-01-01T08:00:00'),
    endTime: new Date('2023-01-01T09:00:00'),
    timeBlocks: this.mockTimeBlocks,
  };

  constructor() {
    // Initialize times on component creation
    this.updateTimesAfterReorder();
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
