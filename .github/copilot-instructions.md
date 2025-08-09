# Synology Download Chrome Extension

This is a React-based Chrome extension built with TypeScript, Material-UI, and webpack that provides a comprehensive interface for managing downloads on Synology NAS Download Station. The extension includes a popup, side panel, options page, content scripts, and a background service worker.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap, Build, and Test the Repository
- Install dependencies: `yarn install` -- takes 5.5 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
- Build web target: `yarn build:web` -- takes 1 minute. NEVER CANCEL. Set timeout to 5+ minutes.
- Build extension target: `yarn build:extension` -- takes 1 minute. NEVER CANCEL. Set timeout to 5+ minutes.
- Build both targets: `yarn build` -- takes 2 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
- Run linting: `yarn lint` -- takes 20 seconds. Set timeout to 2+ minutes.
- Fix linting issues: `yarn lint:fix` -- takes 20 seconds. Set timeout to 2+ minutes.
- Run type checking: `yarn lint:type` -- takes 12 seconds. Set timeout to 2+ minutes.
- Build TypeScript aliases: `yarn build:tsc-alias` -- takes 5 seconds.
- Bundle analysis: `ANALYSE_BUNDLE=true yarn build:web` -- opens bundle analyzer
- Style linting: `yarn style` -- has configuration issues, use lint:fix instead
- Fix style issues: `yarn style:fix` -- use lint:fix for most cases
- **BROKEN COMMAND**: `yarn build:web-types` -- script references missing file, do not use

### Development Servers
- Start web development server: `yarn start:web` -- builds in 35 seconds, runs on http://localhost:3001/
- Start extension development server: `yarn start:extension` -- builds in 35 seconds, runs on http://localhost:3001/
- Both dev servers support hot reloading for popup and service worker but NOT content scripts

### Testing
- Run unit tests: `yarn test:unit` -- Currently requires Chrome API mocking, tests exist but minimal coverage
- Tests use Jest with TypeScript support and @testing-library/react
- Chrome API globals are mocked in `test/setup.test.ts`
- CRITICAL: Tests currently have limited coverage due to complex Chrome extension dependencies

## Validation

### ALWAYS run through complete validation after making changes:
1. **Build Validation**: Run `yarn build` to ensure both web and extension builds succeed
2. **Lint Validation**: Run `yarn lint:fix && yarn lint:type` to check code quality and types
3. **Development Server Testing**: Start `yarn start:web` or `yarn start:extension` and verify the application loads
4. **Manual Extension Testing**: Load the built extension in Chrome for testing actual Chrome extension functionality
5. **CRITICAL**: Always test real extension functionality in a browser - the web dev server only simulates the UI

### Manual Testing Scenarios
After making changes, ALWAYS test these core workflows:
- **Extension Loading**: 
  1. Run `yarn build:extension` to create production build
  2. Open Chrome and go to `chrome://extensions/`
  3. Enable "Developer mode" 
  4. Click "Load unpacked" and select the `dist/` folder
  5. Verify extension loads without errors
- **Popup Functionality**: Click the extension icon and verify the popup renders and functions correctly
- **Context Menu**: Right-click on magnet/torrent links to test context menu integration
- **Content Script**: Visit pages with magnet links (e.g., torrent sites) and test one-click download functionality
- **Side Panel**: Open the side panel via the extension and test the full interface
- **Background Tasks**: Test download management, polling, and notification features
- **Web Component**: Use `yarn start:web` and test the standalone web component at http://localhost:3001/
- **Settings/Options**: Open the extension options page and test configuration options
- **Permissions**: Verify required permissions are requested and granted properly

### Development Workflow Testing
- **Hot Reload**: Use development servers to test popup and service worker hot reloading
- **Content Script Changes**: Requires extension reload in Chrome (content scripts don't hot reload)
- **API Integration**: Test with actual Synology NAS when possible, or use web component with mocked data

## Key Projects and Structure

### Source Structure (`src/`)
- `components/` - React components organized by feature (common, navbar, panel)
- `pages/` - Entry points for different extension pages (background, content, options, popup, panel, web)
- `services/` - Business logic services (download, http, notification, polling)
- `store/` - Redux store with slices for state management
- `utils/` - Utility functions including Chrome API wrappers
- `themes/` - Material-UI theme configuration
- `models/` - TypeScript interfaces and enums
- `manifest.json` - Chrome extension manifest (MV3)

### Build System
- Uses webpack with separate configurations for web and extension builds
- `webpack/build/` - Production build configurations
- `webpack/dev/` - Development server configurations
- `webpack/config/` - Shared webpack configuration
- Multiple entry points: background, contentScript, options, popup, panel, web

### Dependencies
- **Node.js**: >=16.0.0 required (tested with v20.19.4)
- **Yarn**: >=3.2.0 required (tested with v3.6.1, uses Yarn 3 with PnP)
- **React**: 17.x with TypeScript
- **Material-UI**: v5 for UI components
- **Redux Toolkit**: For state management
- **Chrome Extension APIs**: MV3 with service worker

### Environment Setup
1. Install Node.js 16+ (v20.19.4 recommended)
2. Enable corepack: `corepack enable` (if using Node.js 16.9+)
3. Yarn will be automatically managed via packageManager field in package.json

## Common Commands Reference

### Repository Root Structure
```
.
├── README.md
├── package.json
├── yarn.lock
├── src/
├── webpack/
├── test/
├── dist/ (generated)
├── .github/
├── .husky/
└── node_modules/ (generated)
```

### Key Package.json Scripts (Verified Working)
```json
{
  "build:web": "node webpack/build/web.js && yarn build:tsc-alias",
  "build:extension": "node webpack/build/extension.js", 
  "build": "yarn build:web && yarn build:extension",
  "build:debug": "DEBUG=true yarn build",
  "build:devtool": "DEVTOOL=true yarn build:debug",
  "build:web:analyse": "ANALYSE_BUNDLE=true yarn build:web",
  "build:extension:analyse": "ANALYSE_BUNDLE=true yarn build:extension",
  "start:web": "node webpack/dev/web.js",
  "start:extension": "node webpack/dev/extension.js",
  "test:unit": "jest --watchAll=false --coverage",
  "test:change": "yarn test:unit -- --onlyChanged",
  "lint": "eslint src",
  "lint:fix": "eslint src --fix",
  "lint:type": "tsc -p tsconfig.json --noEmit",
  "style": "stylelint src/**/*.{css,scss,less,html}",
  "style:fix": "yarn style --fix",
  "devtools": "redux-devtools --hostname=localhost --port=8000"
}
```

### Additional Useful Commands
- Debug builds: `DEBUG=true yarn build` -- includes additional debugging information
- Redux DevTools: `yarn devtools` -- starts Redux DevTools server on localhost:8000
- Change-based testing: `yarn test:change` -- runs tests only on changed files (requires git changes)
- Bundle size analysis: `ANALYSE_BUNDLE=true yarn build:web` -- opens webpack bundle analyzer

## Critical Build Information

### Timing Expectations
- **NEVER CANCEL**: Dependency installation takes 5.5 minutes
- **NEVER CANCEL**: Web build takes 1 minute
- **NEVER CANCEL**: Extension build takes 1 minute  
- **NEVER CANCEL**: Combined build takes 2 minutes
- **NEVER CANCEL**: Development server initial build takes 35 seconds
- Linting takes 20 seconds
- Type checking takes 12 seconds

### Build Outputs
- Web build outputs to `dist/` for standalone web component
- Extension build outputs to `dist/` for Chrome extension
- Built files include: popup.html, panel.html, options.html, background service worker, content scripts

### Development Workflow
1. Always run `yarn install` first after cloning
2. Use `yarn start:web` for developing the standalone web application
3. Use `yarn start:extension` for developing the Chrome extension
4. Run `yarn build` before committing to ensure production builds work
5. Load `dist/` folder as unpacked extension in Chrome for testing extension functionality

## Troubleshooting

### Common Issues
- **Tests failing with Chrome API errors**: Chrome APIs must be mocked in test environment
- **Style linting errors**: Use `yarn lint:fix` instead of `yarn style` due to configuration issues
- **TypeScript version warnings**: The project uses TypeScript 5.8.3 which may show warnings with older tools
- **Extension not loading**: Ensure you build with `yarn build:extension` and load the `dist/` folder

### Git Hooks
- Pre-commit hooks run lint-staged via Husky
- Commits must pass linting checks
- Use `yarn lint:fix` before committing to avoid hook failures

## Extension-Specific Features

### Chrome Extension Capabilities
- **Download Management**: Integrates with Synology Download Station API
- **Context Menus**: Right-click integration for download links
- **Content Scripts**: One-click magnet link downloads on web pages
- **Notifications**: Browser notifications for download status
- **Side Panel**: Modern Chrome side panel interface
- **Badge Management**: Extension icon badge shows download counts
- **Storage**: Persistent settings and connection data

### API Integration
- Synology NAS Download Station API client
- Support for HTTP/HTTPS with 2FA authentication
- File management and folder browsing
- Task creation, monitoring, and control