import { Injectable } from '@angular/core';
import { ITimeBox } from '../models/time-box.interface';

export interface SavedTimeBoxData {
  timeBox: ITimeBox;
  savedAt: string;
  version: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly DATA_FILE_PATH = 'timebox-data.json';
  private readonly VERSION = '1.0.0';

  /**
   * Save time box data to JSON file
   */
  async saveTimeBoxData(timeBox: ITimeBox): Promise<void> {
    try {
      const dataToSave: SavedTimeBoxData = {
        timeBox: this.serializeTimeBox(timeBox),
        savedAt: new Date().toISOString(),
        version: this.VERSION,
      };

      const jsonString = JSON.stringify(dataToSave, null, 2);
      await this.downloadJsonFile(jsonString, this.DATA_FILE_PATH);

      console.log('Time box data saved successfully');
    } catch (error) {
      console.error('Error saving time box data:', error);
      throw error;
    }
  }

  /**
   * Load time box data from JSON file
   */
  async loadTimeBoxData(): Promise<ITimeBox | null> {
    try {
      const fileContent = await this.loadJsonFile();
      if (!fileContent) return null;

      const savedData: SavedTimeBoxData = JSON.parse(fileContent);
      return this.deserializeTimeBox(savedData.timeBox);
    } catch (error) {
      console.error('Error loading time box data:', error);
      throw error;
    }
  }

  /**
   * Load example data from the public directory
   */
  async loadExampleData(): Promise<ITimeBox | null> {
    try {
      const response = await fetch('/timebox-data-example.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedData: SavedTimeBoxData = await response.json();
      return this.deserializeTimeBox(savedData.timeBox);
    } catch (error) {
      console.error('Error loading example data:', error);
      throw error;
    }
  }

  /**
   * Convert dates to strings for JSON serialization
   */
  private serializeTimeBox(timeBox: ITimeBox): ITimeBox {
    return {
      ...timeBox,
      startTime: timeBox.startTime,
      endTime: timeBox.endTime,
      timeBlocks: timeBox.timeBlocks.map((block) => ({
        ...block,
        startTime: block.startTime,
        endTime: block.endTime,
      })),
    };
  }

  /**
   * Convert date strings back to Date objects
   */
  private deserializeTimeBox(timeBox: ITimeBox): ITimeBox {
    return {
      ...timeBox,
      startTime: new Date(timeBox.startTime),
      endTime: new Date(timeBox.endTime),
      timeBlocks: timeBox.timeBlocks.map((block) => ({
        ...block,
        startTime: block.startTime ? new Date(block.startTime) : undefined,
        endTime: block.endTime ? new Date(block.endTime) : undefined,
      })),
    };
  }

  /**
   * Download JSON data as file
   */
  private async downloadJsonFile(
    jsonString: string,
    filename: string
  ): Promise<void> {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Load JSON file using file input
   */
  private async loadJsonFile(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          resolve(content);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      };

      input.oncancel = () => resolve(null);
      input.click();
    });
  }
}
