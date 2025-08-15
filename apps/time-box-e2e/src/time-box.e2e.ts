import { test, expect } from '@playwright/test';
import { TimeBoxPage } from './pages/time-box.page';

test.describe('Time Box', () => {
  let timeBoxPage: TimeBoxPage;

  test.beforeEach(async ({ page }) => {
    timeBoxPage = new TimeBoxPage(page);
    await timeBoxPage.navigateTo();
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

    expect(descriptions).toEqual([
      'Morning Meeting',
      'Project Discussion',
      'Client Call',
    ]);
  });

  test('should display correct initial times based on duration and position', async () => {
    // First block: starts at 08:00, duration 30m -> ends at 08:30
    const morningMeetingTime = await timeBoxPage.getTimeBlockTimeInfo(
      'Morning Meeting'
    );
    expect(morningMeetingTime).toContain('08:00 - 08:30 (30m)');

    // Second block: starts at 08:30, duration 45m -> ends at 09:15
    const projectDiscussionTime = await timeBoxPage.getTimeBlockTimeInfo(
      'Project Discussion'
    );
    expect(projectDiscussionTime).toContain('08:30 - 09:15 (45m)');

    // Third block: starts at 09:15, duration 15m -> ends at 09:30
    const clientCallTime = await timeBoxPage.getTimeBlockTimeInfo(
      'Client Call'
    );
    expect(clientCallTime).toContain('09:15 - 09:30 (15m)');
  });

  test('should display draggable time blocks', async () => {
    // Verify all time blocks are present and draggable
    const timeBlocks = timeBoxPage.timeBlocks;
    await expect(timeBlocks).toHaveCount(3);

    // Verify each block has the CDK drag attribute
    const allBlocks = await timeBlocks.all();
    for (const block of allBlocks) {
      await expect(block).toHaveAttribute('cdkdrag', '');
    }
  });

  test('should display correct time calculations', async () => {
    // Test that time calculations are working correctly
    const morningTime = await timeBoxPage.getTimeBlockTimeInfo(
      'Morning Meeting'
    );
    const projectTime = await timeBoxPage.getTimeBlockTimeInfo(
      'Project Discussion'
    );
    const clientTime = await timeBoxPage.getTimeBlockTimeInfo('Client Call');

    // Verify the times follow the expected pattern:
    // Morning Meeting: 08:00 - 08:30 (30m)
    // Project Discussion: 08:30 - 09:15 (45m)
    // Client Call: 09:15 - 09:30 (15m)
    expect(morningTime).toContain('08:00 - 08:30 (30m)');
    expect(projectTime).toContain('08:30 - 09:15 (45m)');
    expect(clientTime).toContain('09:15 - 09:30 (15m)');
  });

  test('should have proper test ids for automation', async () => {
    // Verify all necessary test IDs are present for future automation
    await expect(
      timeBoxPage.page.locator('[data-testid="time-block-1"]')
    ).toBeVisible();
    await expect(
      timeBoxPage.page.locator('[data-testid="time-block-2"]')
    ).toBeVisible();
    await expect(
      timeBoxPage.page.locator('[data-testid="time-block-3"]')
    ).toBeVisible();

    await expect(
      timeBoxPage.page.locator('[data-testid="description-1"]')
    ).toBeVisible();
    await expect(
      timeBoxPage.page.locator('[data-testid="description-2"]')
    ).toBeVisible();
    await expect(
      timeBoxPage.page.locator('[data-testid="description-3"]')
    ).toBeVisible();

    await expect(
      timeBoxPage.page.locator('[data-testid="time-info-1"]')
    ).toBeVisible();
    await expect(
      timeBoxPage.page.locator('[data-testid="time-info-2"]')
    ).toBeVisible();
    await expect(
      timeBoxPage.page.locator('[data-testid="time-info-3"]')
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

  test('should update UI when item is moved to middle position', async () => {
    // Simulate moving "Morning Meeting" (index 0) to middle position (index 1)
    await timeBoxPage.page.evaluate(() => {
      // Access Angular component through debugging APIs
      const element = document.querySelector('time-box');
      if (element) {
        // Type declarations for Angular debugging
        interface NgWindow extends Window {
          ng?: {
            getComponent?: (element: Element) => unknown;
            applyChanges?: (element: Element) => void;
          };
        }

        interface NgElement extends Element {
          __ngContext__?: unknown[];
        }

        interface TimeBoxComponent {
          mockTimeBlocks: Array<{
            position: number;
            description: string;
            duration: number;
            startTime?: Date;
            endTime?: Date;
          }>;
          updateTimesAfterReorder: () => void;
          cdr?: { detectChanges: () => void };
        }

        const ngWindow = window as NgWindow;
        const component =
          ngWindow.ng?.getComponent?.(element) ||
          (element as NgElement).__ngContext__?.[8];

        if (
          component &&
          typeof component === 'object' &&
          'mockTimeBlocks' in component &&
          'updateTimesAfterReorder' in component
        ) {
          const timeBoxComp = component as TimeBoxComponent;

          // Simulate drag: move first item to position 1 (after "Project Discussion")
          const movedItem = timeBoxComp.mockTimeBlocks.splice(0, 1)[0];
          timeBoxComp.mockTimeBlocks.splice(1, 0, movedItem);
          timeBoxComp.updateTimesAfterReorder();

          // Trigger Angular change detection
          if (timeBoxComp.cdr && timeBoxComp.cdr.detectChanges) {
            timeBoxComp.cdr.detectChanges();
          } else if (ngWindow.ng?.applyChanges) {
            ngWindow.ng.applyChanges(element);
          }
        }
      }
    });

    // Wait for DOM updates
    await timeBoxPage.page.waitForFunction(
      () =>
        document.querySelectorAll('[data-testid^="time-block-"]').length === 3
    );

    // Verify the new order in the UI
    const descriptions = await timeBoxPage.getTimeBlockDescriptions();
    expect(descriptions).toEqual([
      'Project Discussion',
      'Morning Meeting',
      'Client Call',
    ]);

    // Verify times have been recalculated and updated in the UI
    const projectTime = await timeBoxPage.getTimeBlockTimeInfo(
      'Project Discussion'
    );
    expect(projectTime).toContain('08:00 - 08:45 (45m)');

    const morningTime = await timeBoxPage.getTimeBlockTimeInfo(
      'Morning Meeting'
    );
    expect(morningTime).toContain('08:45 - 09:15 (30m)');

    const clientTime = await timeBoxPage.getTimeBlockTimeInfo('Client Call');
    expect(clientTime).toContain('09:15 - 09:30 (15m)');

    // Verify position attributes have been updated
    await expect(
      timeBoxPage.page.locator('[data-testid="time-block-1"]')
    ).toContainText('Project Discussion');
    await expect(
      timeBoxPage.page.locator('[data-testid="time-block-2"]')
    ).toContainText('Morning Meeting');
    await expect(
      timeBoxPage.page.locator('[data-testid="time-block-3"]')
    ).toContainText('Client Call');
  });

  test('should update UI when last item is moved to first position', async () => {
    // Simulate moving "Client Call" (index 2) to first position (index 0)
    await timeBoxPage.page.evaluate(() => {
      const element = document.querySelector('time-box');
      if (element) {
        interface NgWindow extends Window {
          ng?: {
            getComponent?: (element: Element) => unknown;
            applyChanges?: (element: Element) => void;
          };
        }
        interface NgElement extends Element {
          __ngContext__?: unknown[];
        }
        interface TimeBoxComponent {
          mockTimeBlocks: Array<{
            position: number;
            description: string;
            duration: number;
            startTime?: Date;
            endTime?: Date;
          }>;
          updateTimesAfterReorder: () => void;
          cdr?: { detectChanges: () => void };
        }

        const ngWindow = window as NgWindow;
        const component =
          ngWindow.ng?.getComponent?.(element) ||
          (element as NgElement).__ngContext__?.[8];

        if (
          component &&
          typeof component === 'object' &&
          'mockTimeBlocks' in component &&
          'updateTimesAfterReorder' in component
        ) {
          const timeBoxComp = component as TimeBoxComponent;

          // Move last item to first position
          const movedItem = timeBoxComp.mockTimeBlocks.splice(2, 1)[0];
          timeBoxComp.mockTimeBlocks.splice(0, 0, movedItem);
          timeBoxComp.updateTimesAfterReorder();

          // Trigger change detection
          if (timeBoxComp.cdr && timeBoxComp.cdr.detectChanges) {
            timeBoxComp.cdr.detectChanges();
          } else if (ngWindow.ng?.applyChanges) {
            ngWindow.ng.applyChanges(element);
          }
        }
      }
    });

    await timeBoxPage.page.waitForFunction(
      () =>
        document.querySelectorAll('[data-testid^="time-block-"]').length === 3
    );

    // Verify new order
    const descriptions = await timeBoxPage.getTimeBlockDescriptions();
    expect(descriptions).toEqual([
      'Client Call',
      'Morning Meeting',
      'Project Discussion',
    ]);

    // Verify times have been recalculated
    const clientTime = await timeBoxPage.getTimeBlockTimeInfo('Client Call');
    expect(clientTime).toContain('08:00 - 08:15 (15m)');

    const morningTime = await timeBoxPage.getTimeBlockTimeInfo(
      'Morning Meeting'
    );
    expect(morningTime).toContain('08:15 - 08:45 (30m)');

    const projectTime = await timeBoxPage.getTimeBlockTimeInfo(
      'Project Discussion'
    );
    expect(projectTime).toContain('08:45 - 09:30 (45m)');

    // Verify positions in DOM
    await expect(
      timeBoxPage.page.locator('[data-testid="time-block-1"]')
    ).toContainText('Client Call');
    await expect(
      timeBoxPage.page.locator('[data-testid="time-block-2"]')
    ).toContainText('Morning Meeting');
    await expect(
      timeBoxPage.page.locator('[data-testid="time-block-3"]')
    ).toContainText('Project Discussion');
  });

  test('should update UI correctly after multiple moves', async () => {
    // Perform multiple moves and verify UI updates each time

    // First move: Client Call to front
    await timeBoxPage.page.evaluate(() => {
      const element = document.querySelector('time-box');
      const component =
        (window as any).ng?.getComponent?.(element) ||
        (element as any).__ngContext__?.[8];

      if (
        component &&
        component.mockTimeBlocks &&
        component.updateTimesAfterReorder
      ) {
        const movedItem = component.mockTimeBlocks.splice(2, 1)[0];
        component.mockTimeBlocks.splice(0, 0, movedItem);
        component.updateTimesAfterReorder();

        if (component.cdr && component.cdr.detectChanges) {
          component.cdr.detectChanges();
        } else if ((window as any).ng?.applyChanges) {
          (window as any).ng.applyChanges(element);
        }
      }
    });

    await timeBoxPage.page.waitForFunction(
      () =>
        document.querySelectorAll('[data-testid^="time-block-"]').length === 3
    );

    // Verify first move
    let descriptions = await timeBoxPage.getTimeBlockDescriptions();
    expect(descriptions).toEqual([
      'Client Call',
      'Morning Meeting',
      'Project Discussion',
    ]);

    // Second move: Morning Meeting to end
    await timeBoxPage.page.evaluate(() => {
      const element = document.querySelector('time-box');
      const component =
        (window as any).ng?.getComponent?.(element) ||
        (element as any).__ngContext__?.[8];

      if (
        component &&
        component.mockTimeBlocks &&
        component.updateTimesAfterReorder
      ) {
        const movedItem = component.mockTimeBlocks.splice(1, 1)[0];
        component.mockTimeBlocks.push(movedItem);
        component.updateTimesAfterReorder();

        if (component.cdr && component.cdr.detectChanges) {
          component.cdr.detectChanges();
        } else if ((window as any).ng?.applyChanges) {
          (window as any).ng.applyChanges(element);
        }
      }
    });

    await timeBoxPage.page.waitForFunction(
      () =>
        document.querySelectorAll('[data-testid^="time-block-"]').length === 3
    );

    // Verify final order and times
    descriptions = await timeBoxPage.getTimeBlockDescriptions();
    expect(descriptions).toEqual([
      'Client Call',
      'Project Discussion',
      'Morning Meeting',
    ]);

    const clientTime = await timeBoxPage.getTimeBlockTimeInfo('Client Call');
    expect(clientTime).toContain('08:00 - 08:15 (15m)');

    const projectTime = await timeBoxPage.getTimeBlockTimeInfo(
      'Project Discussion'
    );
    expect(projectTime).toContain('08:15 - 09:00 (45m)');

    const morningTime = await timeBoxPage.getTimeBlockTimeInfo(
      'Morning Meeting'
    );
    expect(morningTime).toContain('09:00 - 09:30 (30m)');

    // Verify final positions
    await expect(
      timeBoxPage.page.locator('[data-testid="time-block-1"]')
    ).toContainText('Client Call');
    await expect(
      timeBoxPage.page.locator('[data-testid="time-block-2"]')
    ).toContainText('Project Discussion');
    await expect(
      timeBoxPage.page.locator('[data-testid="time-block-3"]')
    ).toContainText('Morning Meeting');
  });
});
