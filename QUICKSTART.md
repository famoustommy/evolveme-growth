# Quick Start Guide

Get your Expo app running in 5 minutes!

## 1. Create Your App

```bash
npx create-expo-base-app my-app
cd my-app
```

## 2. Start Development Server

```bash
npm start
```

You'll see a QR code in the terminal.

## 3. Run on Your Device

### Option A: Use Expo Go (Easiest)

1. Install [Expo Go](https://expo.dev/go) on your phone
2. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

### Option B: Run on Simulator/Emulator

```bash
# iOS (macOS only)
npm run ios

# Android
npm run android

# Web browser
npm run web
```

## 4. Start Building

Your app is now running! Let's make some changes:

### Edit the Home Screen

Open [src/app/index.tsx](src/app/index.tsx) and modify the code. The app will reload automatically.

### Add a New Screen

Create [src/app/profile.tsx](src/app/profile.tsx):

```typescript
import { View, Text } from 'react-native';

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-2xl font-bold">Profile Screen</Text>
    </View>
  );
}
```

Access it at `/profile` or use:
```typescript
import { router } from 'expo-router';

router.push('/profile');
```

### Connect to Your API

1. Create a `.env` file:
   ```bash
   EXPO_PUBLIC_API_URL=https://your-api.com/api/v1
   ```

2. Use the API client:
   ```typescript
   import { api } from '@/api';

   const data = await api.get('/endpoint');
   ```

See [src/api/README.md](src/api/README.md) for full API documentation.

### Style Your Components

Use Tailwind classes with NativeWind:

```typescript
<View className="flex-1 bg-surface p-4">
  <Text className="text-2xl font-bold text-primary mb-4">
    Hello World
  </Text>
  <Pressable className="bg-primary rounded-lg p-4">
    <Text className="text-white text-center">Button</Text>
  </Pressable>
</View>
```

### Add Translations

Edit [src/locales/en.json](src/locales/en.json):

```json
{
  "welcome": {
    "title": "Welcome to My App",
    "subtitle": "Let's get started!"
  }
}
```

Use in components:

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return <Text>{t('welcome.title')}</Text>;
}
```

## Common Commands

| Command | What it does |
|---------|-------------|
| `npm start` | Start dev server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run web` | Run in browser |
| `npm run lint` | Check code quality |
| `npm run type-check` | Check TypeScript types |

## Next Steps

1. Read the full [README.md](README.md) for detailed documentation
2. Check out [src/api/README.md](src/api/README.md) for API client usage
3. Customize your theme in [tailwind.config.js](tailwind.config.js)
4. Update [app.json](app.json) with your app details

## Need Help?

- Check the [README.md](README.md) for comprehensive documentation
- Read the [API Documentation](src/api/README.md)
- Look at example services in [src/api/services/](src/api/services/)
- Visit [Expo Documentation](https://docs.expo.dev)

## File Structure at a Glance

```
my-app/
├── src/
│   ├── app/              # Your screens (file-based routing)
│   │   ├── _layout.tsx   # Root layout
│   │   └── index.tsx     # Home screen
│   ├── api/              # API client & services
│   ├── components/       # Reusable components
│   ├── locales/          # Translations
│   └── types/            # TypeScript types
├── assets/               # Images, fonts, etc.
├── app.json              # Expo configuration
├── tailwind.config.js    # Theme & colors
└── package.json          # Dependencies
```

---

Happy coding! Build something amazing! 🚀
