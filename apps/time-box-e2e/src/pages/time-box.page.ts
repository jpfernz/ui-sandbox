import { Locator, Page } from '@playwright/test';

export class TimeBoxPage {
  readonly page: Page;
  readonly addTimeBlockButton: Locator;
  readonly timeBlocksList: Locator;
  readonly timeBlocks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addTimeBlockButton = this.page.locator(
      '[data-testid="add-time-block-button"]'
    );
    this.timeBlocksList = this.page.locator('.example-list');
    this.timeBlocks = this.page.locator('[data-testid^="time-block-"]');
  }

  async navigateTo() {
    await this.page.goto('/time-box');
  }

  async clickAddTimeBlockButton() {
    await this.addTimeBlockButton.click();
  }

  async getTimeBlockByDescription(description: string): Promise<Locator> {
    // Find the time block that contains a description div with the exact text
    const allBlocks = await this.timeBlocks.all();

    for (const block of allBlocks) {
      const descriptionDiv = block.locator('[data-testid^="description-"]');
      const text = await descriptionDiv.textContent();
      if (text?.trim() === description) {
        return block;
      }
    }

    throw new Error(`Time block with description "${description}" not found`);
  }

  async getTimeBlockDescriptions(): Promise<string[]> {
    // Wait for elements to be stable
    await this.timeBlocks.first().waitFor();

    const blocks = await this.timeBlocks.all();
    const descriptions: string[] = [];

    for (const block of blocks) {
      try {
        // Get the description div within this block
        const descriptionDiv = block.locator('[data-testid^="description-"]');
        const description = await descriptionDiv.textContent();
        const trimmedDescription = description?.trim();
        if (trimmedDescription) {
          descriptions.push(trimmedDescription);
        }
      } catch (error) {
        // Skip if element is not found or not accessible
        console.warn('Could not get description for block:', error);
      }
    }

    return descriptions;
  }

  async getTimeBlockTimeInfo(description: string): Promise<string> {
    const block = await this.getTimeBlockByDescription(description);
    // Get the time info div within this block
    const timeDiv = block.locator('[data-testid^="time-info-"]');
    const timeInfo = await timeDiv.textContent();
    return timeInfo?.trim() || '';
  }

  async dragTimeBlockToPosition(
    sourceDescription: string,
    targetDescription: string
  ): Promise<void> {
    const sourceBlock = await this.getTimeBlockByDescription(sourceDescription);
    const targetBlock = await this.getTimeBlockByDescription(targetDescription);

    // Get positions
    const sourceBox = await sourceBlock.boundingBox();
    const targetBox = await targetBlock.boundingBox();

    if (!sourceBox || !targetBox) {
      throw new Error('Could not get bounding boxes for drag operation');
    }

    // Perform drag using mouse events that work with CDK
    await this.page.mouse.move(
      sourceBox.x + sourceBox.width / 2,
      sourceBox.y + sourceBox.height / 2
    );
    await this.page.mouse.down();

    // Move in steps to simulate realistic drag
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const x =
        sourceBox.x +
        sourceBox.width / 2 +
        (targetBox.x +
          targetBox.width / 2 -
          sourceBox.x -
          sourceBox.width / 2) *
          (i / steps);
      const y =
        sourceBox.y +
        sourceBox.height / 2 +
        (targetBox.y +
          targetBox.height / 2 -
          sourceBox.y -
          sourceBox.height / 2) *
          (i / steps);
      await this.page.mouse.move(x, y);
    }

    await this.page.mouse.up();

    // Wait for DOM to update after drag
    await this.page.waitForFunction(() => document.readyState === 'complete');
  }

  async dragTimeBlockToTop(description: string): Promise<void> {
    const allDescriptions = await this.getTimeBlockDescriptions();
    if (allDescriptions.length === 0) return;

    const firstDescription = allDescriptions[0];
    if (firstDescription !== description) {
      await this.dragTimeBlockToPosition(description, firstDescription);
    }
  }

  async dragTimeBlockToBottom(description: string): Promise<void> {
    const allDescriptions = await this.getTimeBlockDescriptions();
    if (allDescriptions.length === 0) return;

    const lastDescription = allDescriptions[allDescriptions.length - 1];
    if (lastDescription !== description) {
      await this.dragTimeBlockToPosition(description, lastDescription);
    }
  }
}
