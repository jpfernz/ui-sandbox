import { Locator, Page } from '@playwright/test';

export class TimeBoxPage {
  readonly page: Page;
  readonly addTimeBlockButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addTimeBlockButton = this.page.locator(
      '[data-testid="add-time-block-button"]'
    );
  }

  async navigateTo() {
    await this.page.goto('/time-box');
  }

  async clickAddTimeBlockButton() {
    await this.addTimeBlockButton.click();
  }
}
