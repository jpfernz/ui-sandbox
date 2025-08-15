import { test, expect } from '@playwright/test';
import { TimeBoxPage } from './pages/time-box.page';

test.describe('Time Box', () => {
  let timeBoxPage: TimeBoxPage;

  test.beforeEach(async ({ page }) => {
    timeBoxPage = new TimeBoxPage(page);
    await timeBoxPage.navigateTo();

    // Ensure we always start with a clean state
    // Hard refresh the page to reset component state
    await page.reload();
  });

  test('should display Time Box', async ({ page }) => {
    // Expect h1 to contain a substring.
    expect(await page.locator('h1').innerText()).toContain('Time Box');
  });

  test('should display Add Time Block button', async () => {
    // Expect button to be visible.
    await expect(timeBoxPage.addTimeBlockButton).toBeVisible();
  });

  test('should display initial time blocks with correct order', async () => {
    const descriptions = await timeBoxPage.getTimeBlockDescriptions();

    expect(descriptions).toEqual(['Wake up + Coffee']);
  });

  test('should display correct initial times based on duration and position', async () => {
    // First block: starts at 05:00, duration 15m -> ends at 05:15
    const wakeUpTime = await timeBoxPage.getTimeBlockTimeInfo(
      'Wake up + Coffee'
    );
    expect(wakeUpTime).toContain('05:00 - 05:15 (15m)');
  });

  test('should display start time input with initial value', async () => {
    // Verify the start time input is visible and has correct initial value
    const startTimeInput = timeBoxPage.page.locator(
      '[data-testid="start-time-input"]'
    );
    await expect(startTimeInput).toBeVisible();
    await expect(startTimeInput).toHaveValue('05:00');

    // Verify the label is present
    const label = timeBoxPage.page.locator(
      'mat-label:has-text("Start Time (GMT)")'
    );
    await expect(label).toBeVisible();
  });

  test('should recalculate times when start time changes', async () => {
    // Update start time to 10:00
    await timeBoxPage.updateStartTime('10:00');

    // Wait for recalculation and verify new times
    // First block: starts at 10:00, duration 15m -> ends at 10:15
    const wakeUpTime = await timeBoxPage.getTimeBlockTimeInfo(
      'Wake up + Coffee'
    );
    expect(wakeUpTime).toContain('10:00 - 10:15 (15m)');

    // Verify the input shows the updated value
    expect(await timeBoxPage.getStartTimeValue()).toBe('10:00');
  });

  test('should display draggable time blocks', async () => {
    // Verify all time blocks are present and draggable
    const timeBlocks = timeBoxPage.timeBlocks;
    await expect(timeBlocks).toHaveCount(1);

    // Verify each block has the CDK drag attribute
    const allBlocks = await timeBlocks.all();
    for (const block of allBlocks) {
      await expect(block).toHaveAttribute('cdkdrag', '');
    }
  });

  test('should display correct time calculations', async () => {
    // Test that time calculations are working correctly
    const wakeUpTime = await timeBoxPage.getTimeBlockTimeInfo(
      'Wake up + Coffee'
    );

    // Verify the time follows the expected pattern:
    // Wake up + Coffee: 05:00 - 05:15 (15m)
    expect(wakeUpTime).toContain('05:00 - 05:15 (15m)');
  });

  test('should have proper test ids for automation', async () => {
    // Verify all necessary test IDs are present for future automation
    await expect(
      timeBoxPage.page.locator('[data-testid="time-block-1"]')
    ).toBeVisible();

    await expect(
      timeBoxPage.page.locator('[data-testid="description-1"]')
    ).toBeVisible();

    await expect(
      timeBoxPage.page.locator('[data-testid="time-info-1"]')
    ).toBeVisible();
  });

  // Note: Drag and drop tests are complex with CDK and require specific setup.
  // The infrastructure is in place with the page object methods, but CDK drag-drop
  // requires careful handling of mouse events and timing that may need adjustment
  // based on the specific CDK version and browser behavior.

  test('should have drag and drop infrastructure ready', async () => {
    // Verify the CDK drop list is present
    await expect(timeBoxPage.timeBlocksList).toBeVisible();
    await expect(timeBoxPage.timeBlocksList).toHaveAttribute('cdkdroplist', '');

    // Verify blocks are draggable
    const blocks = await timeBoxPage.timeBlocks.all();
    for (const block of blocks) {
      await expect(block).toHaveAttribute('cdkdrag', '');
    }

    // This confirms the infrastructure is ready for drag-and-drop testing
    // when the simulation issues are resolved
  });

  test('should display basic time block information', async () => {
    // Verify the initial time block shows expected information
    const descriptions = await timeBoxPage.getTimeBlockDescriptions();
    expect(descriptions.length).toBe(1);
    expect(descriptions[0]).toBe('Wake up + Coffee');

    // Verify time information is displayed
    const timeInfo = await timeBoxPage.getTimeBlockTimeInfo('Wake up + Coffee');
    expect(timeInfo).toContain('05:00 - 05:15 (15m)');
  });

  test('should display delete buttons for time blocks', async () => {
    // Check that delete buttons are present for each time block
    await expect(timeBoxPage.getDeleteButton(1)).toBeAttached();
  });

  test('should delete time block when delete button is clicked', async () => {
    // Get initial count
    const initialCount = await timeBoxPage.getTimeBlockCount();
    expect(initialCount).toBeGreaterThanOrEqual(1);

    // Delete the first time block
    await timeBoxPage.deleteTimeBlock(1);

    // Verify count decreased
    const newCount = await timeBoxPage.getTimeBlockCount();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should add time blocks via dialog', async () => {
    // Get initial count
    const initialCount = await timeBoxPage.getTimeBlockCount();
    expect(initialCount).toBe(1);

    // Click add button
    await timeBoxPage.addTimeBlockButton.click();

    // Wait for the dialog to appear
    expect(await timeBoxPage.isTimeBlockFormVisible()).toBe(true);

    // Fill in the form
    await timeBoxPage.fillTimeBlockForm('New Meeting', 60);

    // Click add button
    await timeBoxPage.clickAddButton();

    // Wait for dialog to close and new block to be added
    const formsAfterAdd = timeBoxPage.page.locator(
      '[data-testid="time-block-form"]'
    );
    await expect(formsAfterAdd).toHaveCount(0);

    const newCount = await timeBoxPage.getTimeBlockCount();
    expect(newCount).toBe(initialCount + 1);
  });

  test('should trigger Add Time Block button with T key', async () => {
    // Count initial time blocks
    const initialCount = await timeBoxPage.getTimeBlockCount();

    // Press T key to trigger add dialog
    await timeBoxPage.page.keyboard.press('KeyT');

    // Wait for the dialog to appear
    expect(await timeBoxPage.isTimeBlockFormVisible()).toBe(true);

    // Fill in the form
    await timeBoxPage.fillTimeBlockForm('Keyboard Added Task', 45);

    // Click add button
    await timeBoxPage.clickAddButton();

    // Wait for dialog to close and new block to be added
    const formsAfterAdd = timeBoxPage.page.locator(
      '[data-testid="time-block-form"]'
    );
    await expect(formsAfterAdd).toHaveCount(0);

    const newCount = await timeBoxPage.getTimeBlockCount();
    expect(newCount).toBe(initialCount + 1);
  });

  test('should not trigger Add Time Block button with Ctrl+T', async ({
    page,
  }) => {
    // Count initial time blocks
    const initialCount = await timeBoxPage.getTimeBlockCount();

    // Press Ctrl+T key (should not trigger add time block)
    await page.keyboard.press('Control+KeyT');

    // Wait briefly using a stable element to ensure no changes occurred
    await page.locator('.example-list').waitFor({ state: 'visible' });
    const newCount = await timeBoxPage.getTimeBlockCount();
    expect(newCount).toBe(initialCount);
  });

  test('should show underlined T in Add Time Block button', async () => {
    // Verify the button contains underlined T
    const buttonText = await timeBoxPage.addTimeBlockButton.innerText();
    expect(buttonText).toContain('Time Block');

    // Check for underlined T in the button
    const underlinedT = timeBoxPage.page.locator('button u');
    await expect(underlinedT).toBeVisible();
    await expect(underlinedT).toHaveText('T');
  });

  test('should open edit dialog when time block is clicked', async () => {
    // Click on the initial time block
    await timeBoxPage.clickTimeBlockToEdit('Wake up + Coffee');

    // Verify the form opens
    expect(await timeBoxPage.isTimeBlockFormVisible()).toBe(true);

    // Verify the form title shows "Edit Time Block"
    const title = await timeBoxPage.getTimeBlockFormTitle();
    expect(title).toBe('Edit Time Block');

    // Verify the form is pre-filled with existing values
    const descriptionInput = timeBoxPage.page.locator(
      'input[formControlName="description"]'
    );
    const durationInput = timeBoxPage.page.locator(
      'input[formControlName="duration"]'
    );

    await expect(descriptionInput).toHaveValue('Wake up + Coffee');
    await expect(durationInput).toHaveValue('15');
  });

  test('should save changes when editing a time block', async () => {
    // Use the existing time block that's already on the page (Wake up + Coffee)
    // Click on the time block to edit
    await timeBoxPage.clickTimeBlockToEdit('Wake up + Coffee');

    // Wait for the edit dialog to be visible
    await expect(
      timeBoxPage.page.locator('[data-testid="time-block-form"]')
    ).toBeVisible();

    // Clear and fill the form fields
    const descriptionInput = timeBoxPage.page.locator(
      '[data-testid="time-block-form"] input[formControlName="description"]'
    );
    const durationInput = timeBoxPage.page.locator(
      '[data-testid="time-block-form"] input[formControlName="duration"]'
    );

    await descriptionInput.clear();
    await descriptionInput.fill('Morning Routine');
    await durationInput.clear();
    await durationInput.fill('30');

    // Save the changes using the save button
    await timeBoxPage.clickSaveButton();

    // Wait for dialog to close
    const formsAfterSave = timeBoxPage.page.locator(
      '[data-testid="time-block-form"]'
    );
    await expect(formsAfterSave).toHaveCount(0);

    // Verify the time block was updated
    const descriptions = await timeBoxPage.getTimeBlockDescriptions();
    expect(descriptions).toContain('Morning Routine');

    // Verify the time info was updated (30 minutes: 05:00 - 05:30)
    const timeInfo = await timeBoxPage.getTimeBlockTimeInfo('Morning Routine');
    expect(timeInfo).toContain('05:00 - 05:30 (30m)');
  });

  test('should cancel editing without saving changes', async () => {
    // Click on the initial time block to edit
    await timeBoxPage.clickTimeBlockToEdit('Wake up + Coffee');

    // Update the description and duration
    await timeBoxPage.fillTimeBlockForm('This should not save', 99);

    // Cancel the changes
    await timeBoxPage.clickCancelButton();

    // Wait for dialog to close
    const formsAfterCancel = timeBoxPage.page.locator(
      '[data-testid="time-block-form"]'
    );
    await expect(formsAfterCancel).toHaveCount(0);

    // Verify the time block was not updated
    const descriptions = await timeBoxPage.getTimeBlockDescriptions();
    expect(descriptions).toEqual(['Wake up + Coffee']);

    // Verify the time info was not updated
    const timeInfo = await timeBoxPage.getTimeBlockTimeInfo('Wake up + Coffee');
    expect(timeInfo).toContain('05:00 - 05:15 (15m)');
  });

  test('should support keyboard navigation for editing time blocks', async () => {
    // Get the time block info element
    const timeBlockInfo = timeBoxPage.page.locator(
      '[data-testid="time-block-info-1"]'
    );

    // Focus the element using tab navigation
    await timeBlockInfo.focus();

    // Press Enter to trigger edit
    await timeBoxPage.page.keyboard.press('Enter');

    // Verify the form opens
    expect(await timeBoxPage.isTimeBlockFormVisible()).toBe(true);

    // Cancel to close
    await timeBoxPage.clickCancelButton();

    // Wait for dialog to close completely
    const formsAfterCancel = timeBoxPage.page.locator(
      '[data-testid="time-block-form"]'
    );
    await expect(formsAfterCancel).toHaveCount(0);

    // Focus again and use Space key
    await timeBlockInfo.focus();
    await timeBoxPage.page.keyboard.press('Space');

    // Verify the form opens again
    expect(await timeBoxPage.isTimeBlockFormVisible()).toBe(true);
  });
});
