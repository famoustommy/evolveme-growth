# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2025-01-18

### Added
- Security vulnerability fixes via npm overrides (glob package)
- Improved file exclusion in project generation (template-specific files)
- CHANGELOG.md for tracking releases
- Support for creating project in current directory (using `.` or no argument)
- Support for capitalized project names (auto-lowercased where needed)
- Automatic project name normalization (removes invalid characters)

### Changed
- Updated Expo SDK from 54.0.20 to 54.0.24
- Updated expo-router from 6.0.13 to 6.0.15
- Updated expo-splash-screen from 31.0.10 to 31.0.11
- Updated expo-linking from 8.0.8 to 8.0.9
- Updated expo-web-browser from 15.0.8 to 15.0.9
- Improved create-expo-app.js script with better name replacement logic
- Project names are now automatically lowercased in package.json and slugs
- CLI now uses current directory name when run with `.` or no arguments

### Fixed
- TypeScript error in LanguageSwitcher component (dynamic translation key)
- Security vulnerabilities: 16 high + 1 moderate (now 0 vulnerabilities)
- Package name replacement in generated projects now works correctly

### Removed
- Template-specific files from generated projects:
  - CONTRIBUTING.md
  - PUBLISHING.md
  - PACKAGE-SETUP-COMPLETE.md
  - sonar-project.properties
  - .npmignore

## [1.0.1] - Initial Release

### Added
- Production-ready Expo template with TypeScript
- NativeWind (TailwindCSS) integration
- i18n support with react-i18next
- Authentication structure
- API client with axios and react-query
- Expo Router setup
- Dark mode support
- CLI tool for creating new projects
