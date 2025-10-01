# Power Plant Configuration File

## File Location
`frontend/src/plantConfig.json`

## Structure

The configuration file contains an array of power plant objects with the following properties:

### Properties

- **assetName**: The full display name of the power plant (string)
- **assetMnemonic**: The short identifier/code used in the API and system (string, lowercase)
- **maximumCapability**: The maximum power generation capacity in MW (number)
- **rampRate**: The rate at which the plant can change output in MW/minute (number)

## Example Entry

```json
{
  "assetName": "Shepard Energy Centre",
  "assetMnemonic": "shepard",
  "maximumCapability": 800,
  "rampRate": 10
}
```

## Usage

This file can be imported into the React application:

```javascript
import plantConfig from './plantConfig.json';

// Access plant data
const plants = plantConfig.plants;

// Find a specific plant by mnemonic
const plant = plants.find(p => p.assetMnemonic === 'shepard');
```

## Editing Instructions

1. Open `plantConfig.json` in any text editor
2. Modify the values as needed
3. Ensure the JSON syntax remains valid (proper quotes, commas, brackets)
4. The `assetMnemonic` should match the plant identifiers used in your API responses
5. Save the file
6. Restart the React development server to see changes

## Notes

- Keep the `assetMnemonic` values in lowercase to match API conventions
- `maximumCapability` is measured in Megawatts (MW)
- `rampRate` is measured in MW per minute (MW/min)
- Make sure each plant entry is separated by a comma
- The last entry should NOT have a trailing comma before the closing bracket