# Expo Base Template

A production-ready Expo template with everything you need to build a modern, scalable mobile app. Skip the boilerplate setup and start building features on day one.

## Quick Start

```bash
npx create-expo-base-app my-app
cd my-app
npm start
```

That's it! Your app is ready to go.

## What's Included

This template comes pre-configured with essential features and best practices for building production mobile apps:

### Core Technologies

- **[Expo SDK 54](https://expo.dev/)** - Latest Expo with new architecture enabled
- **[React Native 0.81](https://reactnative.dev/)** - Latest React Native runtime
- **[TypeScript](https://www.typescriptlang.org/)** - Full type safety throughout the app
- **[Expo Router](https://docs.expo.dev/router/introduction/)** - File-based routing with native navigation
- **[React 19](https://react.dev/)** - Latest React with improved performance

### Styling & UI

- **[NativeWind v4](https://www.nativewind.dev/)** - Tailwind CSS for React Native
- **Custom Design System** - Pre-configured color palette and theme
- **Responsive Layouts** - Mobile-first design patterns
- **Custom Fonts** - Playfair Display integrated (easy to swap)

### State Management & Data

- **[TanStack Query (React Query)](https://tanstack.com/query/)** - Server state management, caching, and data fetching
- **[Axios](https://axios-http.com/)** - HTTP client with interceptors
- **Custom API Client** - Production-ready client with:
  - Automatic token refresh
  - Request queuing during token refresh
  - Error handling with retry logic
  - Support for authenticated, public, and external endpoints
  - Type-safe request/response handling

### Authentication & Security

- **Token-based Authentication** - JWT access/refresh token flow
- **Secure Storage** - Credentials stored in device secure storage (Expo SecureStore)
- **Auto Token Refresh** - Seamless token renewal with request queuing
- **Session Management** - Automatic logout on token expiration

### Internationalization (i18n)

- **[i18next](https://www.i18next.com/)** - Full internationalization support
- **[react-i18next](https://react.i18next.com/)** - React bindings for i18n
- **Multi-language Ready** - English and French included (easily extensible)
- **Language Switcher Component** - Pre-built UI for language selection
- **Type-safe Translations** - TypeScript definitions for all translation keys

### Developer Experience

- **ESLint** - Code linting with Expo config
- **Prettier** - Code formatting with Tailwind plugin
- **TypeScript Path Aliases** - Clean imports (`@/components`, `@/api`, etc.)
- **Type Checking** - Strict TypeScript configuration
- **Git Ready** - Pre-configured `.gitignore`

### Code Organization

```
src/
├── app/              # Expo Router pages (file-based routing)
│   ├── _layout.tsx   # Root layout with providers
│   └── index.tsx     # Home screen
├── api/              # API client and services
│   ├── api-client.ts       # Main API client (axios instance)
│   ├── token-manager.ts    # Token storage and refresh logic
│   ├── services/           # Organized API endpoints
│   │   ├── auth.service.ts
│   │   └── example.service.ts
│   └── README.md           # Comprehensive API documentation
├── components/       # Reusable UI components
│   └── LanguageSwitcher.tsx
├── locales/          # Translation files
│   ├── i18n.ts      # i18n configuration
│   ├── en.json      # English translations
│   └── fr.json      # French translations
├── types/            # TypeScript type definitions
│   ├── auth.ts      # Authentication types
│   ├── i18next.d.ts # i18n type augmentation
│   └── index.ts
├── utils/            # Utility functions
│   └── cn.ts        # Tailwind class name merger
├── constants.ts      # App-wide constants
├── theme.ts          # Theme configuration
└── global.css        # Global Tailwind styles
```

## Features in Detail

### 1. API Client

The template includes a production-ready API client that handles all the complexities of making HTTP requests:

**Key Features:**
- Automatic JWT token attachment
- Token refresh with request queuing
- Error handling and user-friendly messages
- Support for authenticated, public, and external APIs
- File upload/download support
- Configurable timeouts and retries

**Usage Example:**

```typescript
import { api } from '@/api';

// Authenticated request (token added automatically)
const user = await api.get<User>('/users/me');

// Public endpoint (no auth required)
const posts = await api.public.get('/posts');

// External API
const data = await api.external.get('https://api.example.com/data');
```

See [src/api/README.md](src/api/README.md) for comprehensive documentation.

### 2. Authentication Flow

Complete authentication system with:

- Login/signup endpoints
- Secure token storage
- Automatic token refresh
- Session expiry handling
- Logout functionality

```typescript
import { authService } from '@/api';

// Login
const { access, refresh } = await authService.login(email, password);

// Tokens are automatically stored and used for subsequent requests

// Logout
await authService.logout();
```

### 3. Internationalization

Multi-language support with type safety:

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <View>
      <Text>{t('welcome.title')}</Text>
      <Button onPress={() => i18n.changeLanguage('fr')}>
        Switch to French
      </Button>
    </View>
  );
}
```

Add new languages by creating a new JSON file in `src/locales/` and importing it in `i18n.ts`.

### 4. Styling with NativeWind

Use Tailwind CSS classes directly in your React Native components:

```typescript
<View className="flex-1 bg-surface p-4">
  <Text className="text-2xl font-bold text-primary">
    Hello World
  </Text>
  <Button className="bg-primary rounded-lg p-4 mt-4">
    <Text className="text-white text-center">Click Me</Text>
  </Button>
</View>
```

Custom color palette defined in [tailwind.config.js](tailwind.config.js).

### 5. Type-Safe Routing

Expo Router provides file-based routing with TypeScript support:

```typescript
import { router } from 'expo-router';

// Navigate programmatically
router.push('/profile');
router.push({ pathname: '/post/[id]', params: { id: '123' } });

// Use Link component
<Link href="/settings">
  <Text>Settings</Text>
</Link>
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- [Expo Go](https://expo.dev/go) app on your phone (for testing)
- Xcode (for iOS development on macOS)
- Android Studio (for Android development)

### Installation

Create a new project:

```bash
npx create-expo-base-app my-awesome-app
```

### Development

Start the development server:

```bash
npm start
```

Run on specific platforms:

```bash
npm run android   # Run on Android
npm run ios       # Run on iOS (macOS only)
npm run web       # Run in web browser
```

### Configuration

#### 1. Set up your API URL

Create a `.env` file in the project root:

```bash
EXPO_PUBLIC_API_URL=https://your-api.com/api/v1
```

Or configure in [app.json](app.json):

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-api.com/api/v1"
    }
  }
}
```

#### 2. Update app.json

Customize your app name, slug, and bundle identifiers:

```json
{
  "expo": {
    "name": "My App",
    "slug": "my-app",
    "scheme": "my-app"
  }
}
```

#### 3. Configure colors and theme

Edit [tailwind.config.js](tailwind.config.js) to customize your color palette.

#### 4. Add translations

Add new language files in `src/locales/` and update `src/locales/i18n.ts`.

## Project Structure

### Adding New Screens

Create a new file in `src/app/`:

```typescript
// src/app/profile.tsx
export default function ProfileScreen() {
  return (
    <View className="flex-1 p-4">
      <Text>Profile Screen</Text>
    </View>
  );
}
```

Access at `/profile`.

### Adding API Services

Create organized service files in `src/api/services/`:

```typescript
// src/api/services/posts.service.ts
import { api } from '../api-client';
import type { Post } from '@/types';

export const postsService = {
  getAll: async () => {
    const response = await api.get<Post[]>('/posts');
    return response.data;
  },

  create: async (data: CreatePostRequest) => {
    const response = await api.post<Post>('/posts', data);
    return response.data;
  },
};
```

### Adding Components

Create reusable components in `src/components/`:

```typescript
// src/components/Card.tsx
import { View, Text } from 'react-native';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <View className="bg-surface-elevated rounded-lg p-4 shadow">
      <Text className="text-xl font-bold mb-2">{title}</Text>
      {children}
    </View>
  );
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS simulator (macOS only) |
| `npm run web` | Run in web browser |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

## Deployment

### Build for iOS

```bash
eas build --platform ios
```

### Build for Android

```bash
eas build --platform android
```

### Setup EAS

First time setup:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

See [Expo EAS documentation](https://docs.expo.dev/build/introduction/) for more details.

## Common Tasks

### Connecting to Your Backend

1. Update `EXPO_PUBLIC_API_URL` in `.env`
2. Modify auth endpoints in `src/api/services/auth.service.ts` if needed
3. Update type definitions in `src/types/auth.ts` to match your API responses

### Adding a New Language

1. Create `src/locales/es.json` (for Spanish)
2. Add translations matching the structure of `en.json`
3. Import in `src/locales/i18n.ts`:

```typescript
import es from './es.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es }, // Add here
  },
  // ...
});
```

### Using React Query with the API Client

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api';

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['posts'],
  queryFn: async () => {
    const response = await api.get<Post[]>('/posts');
    return response.data;
  },
});

// Mutate data
const createPost = useMutation({
  mutationFn: async (data: CreatePostRequest) => {
    const response = await api.post<Post>('/posts', data);
    return response.data;
  },
});
```

### Handling Forms

```typescript
import { useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    try {
      await authService.login(email, password);
      router.push('/home');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <View className="p-4">
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        className="border border-input p-3 rounded-lg mb-4"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        className="border border-input p-3 rounded-lg mb-4"
      />
      <Button onPress={handleSubmit}>Login</Button>
    </View>
  );
}
```

## Troubleshooting

### Port already in use

```bash
npx expo start -c
```

### Metro bundler issues

```bash
npx expo start -c
# or
rm -rf node_modules && npm install
```

### TypeScript errors

```bash
npm run type-check
```

### iOS build issues

```bash
cd ios && pod install && cd ..
```

## Tech Stack Reference

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| Expo | Framework | [docs.expo.dev](https://docs.expo.dev) |
| React Native | UI Framework | [reactnative.dev](https://reactnative.dev) |
| TypeScript | Type Safety | [typescriptlang.org](https://www.typescriptlang.org) |
| Expo Router | Navigation | [docs.expo.dev/router](https://docs.expo.dev/router/introduction/) |
| NativeWind | Styling | [nativewind.dev](https://www.nativewind.dev) |
| TanStack Query | Data Fetching | [tanstack.com/query](https://tanstack.com/query) |
| i18next | Internationalization | [i18next.com](https://www.i18next.com) |
| Axios | HTTP Client | [axios-http.com](https://axios-http.com) |

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- [Open an issue](https://github.com/yourusername/create-expo-base-app/issues)
- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)

## Acknowledgments

Built with:
- [Expo](https://expo.dev)
- [React Native](https://reactnative.dev)
- [NativeWind](https://www.nativewind.dev)
- And many other amazing open-source projects

---

Made with love for the React Native community
