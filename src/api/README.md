# API Client Documentation

A flexible, mobile-optimized API client that handles all your HTTP requests with automatic authentication, token refresh, and error handling. Think of it as your app's communication layer with any backend API.

## What Does This Do?

This API client automatically:
- **Adds your authentication token** to every request (so you don't have to)
- **Refreshes expired tokens** and retries failed requests (seamlessly in the background)
- **Handles errors gracefully** with user-friendly messages
- **Queues requests** during token refresh (so nothing gets lost)
- **Redirects to login** when your session expires (with a nice alert)
- **Works with any API** - yours, external APIs, public endpoints, etc.

## Basic Usage - Just Making Requests

### Getting data from your API (with automatic authentication)

When you need to fetch data from your authenticated backend, just use `api.get()`. The auth token is automatically added for you:

```typescript
import { api } from "@/api";

// Get the current user's profile
// The API client automatically adds: Authorization: Bearer <your-token>
const response = await api.get<User>("/users/me");
const user = response.data;

// Get a list of recipes
const recipesResponse = await api.get<Recipe[]>("/recipes");
const recipes = recipesResponse.data;
```

**What's happening here?**
1. You make a simple GET request to `/users/me`
2. The client automatically grabs your stored auth token
3. It adds the token to the request headers
4. It sends the request to `https://your-api.com/api/v1/users/me`
5. You get back the data

### Sending data to your API

Use `api.post()`, `api.put()`, or `api.patch()` to send data. Again, authentication is automatic:

```typescript
import { api } from "@/api";

// Create a new recipe
await api.post("/recipes", {
  title: "Chocolate Cake",
  ingredients: ["flour", "sugar", "cocoa"],
  instructions: "Mix and bake at 350°F",
});

// Update your profile
await api.put("/users/profile", {
  name: "Jane Doe",
  bio: "Love cooking!",
});

// Update just one field (partial update)
await api.patch("/users/settings", {
  theme: "dark",
});

// Delete something
await api.delete("/recipes/123");
```

**What's the difference between PUT and PATCH?**
- `PUT`: Replace the entire resource (send all fields)
- `PATCH`: Update only specific fields (send just what changed)

## Public Endpoints - No Login Required

Some endpoints don't need authentication (like login, signup, or public content). Use `api.public` for these:

```typescript
import { api } from "@/api";

// Get public recipes (anyone can see these, no login needed)
const publicRecipes = await api.public.get("/public/recipes");

// Login request - obviously you're not logged in yet!
const response = await api.public.post<AuthResponse>("/auth/login", {
  email: "user@example.com",
  password: "secret123",
});

// Signup - creating a new account
await api.public.post("/auth/signup", {
  email: "newuser@example.com",
  password: "mypassword",
});
```

**Why use `api.public`?**
Without `.public`, the client tries to add an auth token. For login/signup, you don't have a token yet! Using `.public` tells the client "skip the auth token for this one."

## Calling External APIs

Sometimes you need to call a completely different API (like GitHub, Weather API, etc.). Use `api.external`:

```typescript
import { api } from "@/api";

// Get data from GitHub's API
const githubUser = await api.external.get(
  "https://api.github.com/users/octocat"
);

// Call a weather API
const weather = await api.external.get(
  "https://api.weather.com/v1/forecast?city=Paris"
);

// Send data to an external webhook
await api.external.post("https://hooks.slack.com/your-webhook-url", {
  message: "Hello from my app!",
});
```

**What's different about external calls?**
- Uses the **full URL** you provide (doesn't add your API's base URL)
- Still adds your auth token by default (unless you skip it)
- Good for integrating third-party services

## Advanced Features

### Custom Base URL (Different API Version)

Your main API is at `https://api.yourdomain.com/api/v1`, but you need to call v2 for one endpoint:

```typescript
// This request goes to https://api.yourdomain.com/api/v2/new-feature
// Instead of the default /api/v1
await api.get("/new-feature", {
  customBaseURL: "https://api.yourdomain.com/api/v2",
});
```

**When would you use this?**
- Testing a new API version
- Your API has multiple versions (v1, v2)
- Different microservices with different base URLs

### Skip Auth for Specific Requests

Sometimes an endpoint is public but you're using the regular `api` (not `api.public`):

```typescript
// This endpoint doesn't need auth, but we're not using api.public
await api.get("/public/announcements", {
  skipAuth: true, // Don't add the Authorization header
});
```

### Prevent Auto-Redirect on Auth Failure

By default, if your token is invalid, you're redirected to login. Sometimes you want to handle this yourself:

```typescript
try {
  // Try to get protected data
  await api.get("/admin/users", {
    skipAuthRedirect: true, // Don't auto-redirect if auth fails
  });
} catch (error) {
  // Handle the error your way
  if (error instanceof ApiError && error.status === 401) {
    console.log("Not authorized, but staying on this page");
  }
}
```

**Use case:** Checking permissions without disrupting the user experience.

### Silent Requests (No Error Logging)

Some requests fail often (like checking if a username exists). You don't want to flood the console:

```typescript
// Check if username is taken, but don't log errors
const response = await api.get(`/users/check-username/${username}`, {
  silent: true, // Don't log errors to console
});
```

### Custom Headers

Add extra headers when needed (like API keys for third-party services):

```typescript
await api.get("/external-service/data", {
  headers: {
    "X-API-Key": "your-api-key",
    "X-Custom-Header": "custom-value",
  },
});
```

### Custom Timeout

Default timeout is 30 seconds. Override it for slow or fast endpoints:

```typescript
// Fast endpoint - fail quickly if it takes too long
await api.get("/quick-check", {
  timeout: 5000, // 5 seconds
});

// Slow endpoint - give it more time (like generating a report)
await api.get("/generate-report", {
  timeout: 120000, // 2 minutes
});
```

### Query Parameters

Add URL parameters easily (no need to build the URL string yourself):

```typescript
// Want to call: /recipes?page=2&limit=10&category=dessert
await api.get("/recipes", {
  params: {
    page: 2,
    limit: 10,
    category: "dessert",
  },
});
// The client automatically builds: /recipes?page=2&limit=10&category=dessert
```

**Much cleaner than:** `/recipes?page=${page}&limit=${limit}&category=${category}`

## File Operations

### Uploading Files

Upload images, PDFs, or any files using FormData:

```typescript
// Create a form data object
const formData = new FormData();
formData.append("file", imageFile); // The actual file
formData.append("name", "Profile Picture"); // Additional fields
formData.append("category", "avatar");

// Upload it
await api.post("/upload", formData, {
  headers: {
    "Content-Type": "multipart/form-data", // Tell server it's a file upload
  },
  timeout: 60000, // 60 seconds - files take longer to upload
});
```

**Step by step:**
1. Create a `FormData` object (like an HTML form)
2. Add your file and any extra data
3. Set `Content-Type` to `multipart/form-data`
4. Increase timeout (files are slow)

### Downloading Files

Download PDFs, images, etc. as blobs:

```typescript
// Get the file as a blob (binary data)
const response = await api.get<Blob>(`/files/${fileId}`, {
  responseType: "blob", // Tell axios we want binary data, not JSON
});

// Create a download link and click it (triggers browser download)
const url = window.URL.createObjectURL(response.data);
const link = document.createElement("a");
link.href = url;
link.download = "my-recipe.pdf"; // Filename for download
link.click();

// Clean up
window.URL.revokeObjectURL(url);
```

**What's a blob?** Binary data representing the file (image, PDF, etc.)

## Error Handling

The client throws `ApiError` objects with helpful information:

```typescript
import { api, ApiError } from "@/api";

try {
  const response = await api.get("/users/me");
  console.log("Success!", response.data);
} catch (error) {
  // Check if it's an API error (vs network error, etc.)
  if (error instanceof ApiError) {
    console.log(error.message); // "Unauthorized" or "User not found"
    console.log(error.status); // 401, 404, 500, etc.
    console.log(error.code); // Backend error code (if provided)
    console.log(error.details); // Extra details from backend
  } else {
    console.log("Something else went wrong:", error);
  }
}
```

**Common status codes:**
- `400`: Bad request (you sent invalid data)
- `401`: Unauthorized (not logged in or token expired)
- `403`: Forbidden (logged in but don't have permission)
- `404`: Not found (endpoint doesn't exist)
- `422`: Validation error (data didn't pass validation)
- `500`: Server error (backend crashed)

## Token Management

You rarely need to touch tokens directly, but here's how:

```typescript
import { tokenManager } from "@/api";

// After login, store the tokens you got from the backend
await tokenManager.setTokens(
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // access token
  "refresh_token_here", // refresh token
  3600 // expires in 3600 seconds (1 hour)
);

// Check if current token is expired or about to expire
const isExpired = await tokenManager.isTokenExpired();
if (isExpired) {
  console.log("Token is expired, but don't worry - it'll auto-refresh!");
}

// Get the current token (rare - the client does this automatically)
const token = await tokenManager.getAccessToken();

// Clear tokens on logout
await tokenManager.clearTokens();
```

**Where are tokens stored?** In secure encrypted storage on the device (expo-secure-store).

## Service Layer Pattern (Recommended)

Instead of calling `api` everywhere, create service files to organize your API calls:

```typescript
// src/api/services/recipe.service.ts
import { api } from "../api-client";
import type { Recipe, CreateRecipeRequest } from "@/types";

export const recipeService = {
  // Get all user's recipes
  getMyRecipes: async () => {
    const response = await api.get<Recipe[]>("/recipes");
    return response.data;
  },

  // Get a single recipe by ID
  getRecipe: async (id: string) => {
    const response = await api.get<Recipe>(`/recipes/${id}`);
    return response.data;
  },

  // Create a new recipe
  createRecipe: async (data: CreateRecipeRequest) => {
    const response = await api.post<Recipe>("/recipes", data);
    return response.data;
  },

  // Update a recipe
  updateRecipe: async (id: string, data: Partial<CreateRecipeRequest>) => {
    const response = await api.patch<Recipe>(`/recipes/${id}`, data);
    return response.data;
  },

  // Delete a recipe
  deleteRecipe: async (id: string) => {
    await api.delete(`/recipes/${id}`);
  },

  // Search recipes
  searchRecipes: async (query: string, category?: string) => {
    const response = await api.get<Recipe[]>("/recipes/search", {
      params: { q: query, category },
    });
    return response.data;
  },
};

// Now in your components:
import { recipeService } from "@/api";

const recipes = await recipeService.getMyRecipes();
await recipeService.createRecipe({ title: "Pizza", ingredients: [...] });
```

**Why use services?**
- All API calls in one place (easy to find and update)
- Consistent error handling
- Type safety with TypeScript
- Easier to test
- Cleaner component code

## Configuration Reference

All options you can pass to requests:

| Option             | Type      | What it does                                                   | Example                     |
| ------------------ | --------- | -------------------------------------------------------------- | --------------------------- |
| `skipAuth`         | `boolean` | Don't add auth token to this request                           | `{ skipAuth: true }`        |
| `skipAuthRetry`    | `boolean` | Don't auto-retry with refreshed token on 401                   | `{ skipAuthRetry: true }`   |
| `skipAuthRedirect` | `boolean` | Don't redirect to login if auth fails                          | `{ skipAuthRedirect: true}` |
| `absoluteUrl`      | `boolean` | Use full URL (for external APIs)                               | `{ absoluteUrl: true }`     |
| `customBaseURL`    | `string`  | Override the base URL for this request                         | `{ customBaseURL: "..." }`  |
| `silent`           | `boolean` | Don't log errors to console                                    | `{ silent: true }`          |
| `timeout`          | `number`  | Max time to wait for response (milliseconds)                   | `{ timeout: 5000 }`         |
| `headers`          | `object`  | Extra headers to send                                          | `{ headers: {...} }`        |
| `params`           | `object`  | URL query parameters                                           | `{ params: { page: 1 } }`   |
| `responseType`     | `string`  | Expected response format: "json", "blob", "arraybuffer", etc.  | `{ responseType: "blob" }`  |

## Environment Setup

Tell the client where your API lives by setting the URL in your `.env` file:

```bash
# .env file in your project root
EXPO_PUBLIC_API_URL=http://localhost:8000
```

For production:
```bash
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
```

Or in `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://api.yourdomain.com"
    }
  }
}
```

**The client automatically uses this URL for all requests.**

## What Happens Automatically

### Token Refresh Flow
1. You make a request → `api.get("/users/me")`
2. Token is expired → Backend returns 401
3. Client pauses your request
4. Client calls `/auth/refresh` with refresh token
5. Gets new access token
6. Retries your original request with new token
7. You get your data (never knew there was a problem!)

### Request Queuing
If multiple requests fail at once (all expired tokens):
1. First request triggers token refresh
2. Other requests wait in a queue
3. Once token refreshed, all queued requests retry
4. No requests lost, no duplicate refreshes

### Session Expiry
When refresh token expires (can't refresh anymore):
1. Shows alert: "Session Expired. Please login again."
2. Clears all stored tokens
3. Redirects to login screen
4. User logs in fresh

## Examples

Check out [services/auth.service.ts](./services/auth.service.ts) and [services/example.service.ts](./services/example.service.ts) for real-world examples!

## Quick Reference

```typescript
// Regular authenticated requests
await api.get("/path")
await api.post("/path", data)
await api.put("/path", data)
await api.patch("/path", data)
await api.delete("/path")

// Public (no auth)
await api.public.get("/path")
await api.public.post("/path", data)

// External APIs
await api.external.get("https://api.example.com/data")

// With options
await api.get("/path", {
  params: { page: 1 },
  timeout: 5000,
  silent: true,
})
```
