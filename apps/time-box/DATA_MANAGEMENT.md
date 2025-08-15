# Time Box Data Management

The time-box application now includes save and load functionality for persisting your time box configurations.

## Features

### Save Data

- Click the "Save Data" button to download your current time box configuration as a JSON file
- The file will be saved as `timebox-data.json` and contains:
  - Time box start and end times
  - All time blocks with their descriptions, durations, and calculated times
  - Metadata including save date and version

### Load Data

- Click the "Load Data" button to upload a previously saved JSON file
- This will restore your time box configuration including:
  - Start time setting
  - All time blocks in their saved order
  - Time calculations are automatically updated

### Load Example

- Click the "Load Example" button to load a sample time box configuration
- This loads data from `/timebox-data-example.json` in the public directory
- Useful for seeing how a complete time box schedule looks

## JSON File Structure

The saved JSON files follow this structure:

```json
{
  "timeBox": {
    "startTime": "2023-01-01T05:00:00.000Z",
    "endTime": "2023-01-01T09:00:00.000Z",
    "timeBlocks": [
      {
        "position": 1,
        "startTime": "2023-01-01T05:00:00.000Z",
        "endTime": "2023-01-01T05:15:00.000Z",
        "duration": 15,
        "description": "Wake up + Coffee"
      }
    ]
  },
  "savedAt": "2025-08-15T12:00:00.000Z",
  "version": "1.0.0"
}
```

## File Locations

- **Saved files**: Downloaded to your default download folder
- **Example file**: Located at `apps/time-box/public/timebox-data-example.json`
- **Data service**: `apps/time-box/src/app/services/data.service.ts`

## Usage Tips

1. **Backup your work**: Use the save feature before making major changes
2. **Share configurations**: Save and share JSON files with others
3. **Template creation**: Create and save template schedules for reuse
4. **Data persistence**: Files are saved locally and persist between browser sessions when loaded
