# TastyHub Frontend

Next.js frontend application for the TastyHub recipe sharing platform.

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **Testing:** Jest, React Testing Library, Cypress
- **Code Quality:** ESLint, Next.js ESLint config

## Prerequisites

- Node.js 18+
- npm
- Backend API running (see backend README)

## Installation

```bash
npm install
```

## Configuration

The frontend connects to the backend API. Set the API URL via environment variable:

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production, set this in your deployment platform (Vercel, etc.).

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build    # Build the application
npm start        # Start production server
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── about/             # About page
│   ├── api/               # API routes (login, register, recipes)
│   ├── components/        # Reusable components
│   │   ├── Navbar.js     # Navigation bar with dark mode
│   │   ├── Footer.js      # Footer component
│   │   └── DarkModeScript.js  # Dark mode initialization
│   ├── favorites/         # User favorites page
│   ├── lib/               # Utilities and API client
│   │   ├── api.js         # API functions
│   │   └── db.js          # Database utilities
│   ├── login/             # Login page
│   ├── my-recipes/        # User's recipes page
│   ├── profile/           # User profile page
│   ├── recipes/           # Recipe pages
│   │   ├── [id]/         # Recipe detail page
│   │   ├── new/          # Create recipe page
│   │   └── page.js       # Recipe listing page
│   ├── register/          # Registration page
│   ├── settings/          # User settings page
│   ├── users/             # User profile pages
│   │   └── [id]/         # Public user profile
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Home page
├── public/                 # Static assets
├── cypress/               # E2E tests
│   └── e2e/               # Test files
├── jest.config.js         # Jest configuration
├── jest.setup.js          # Jest setup and mocks
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── package.json
```

## Features

### User Authentication
- User registration
- Login/logout
- Protected routes
- JWT token management via localStorage

### Recipe Management
- Browse all recipes
- View recipe details
- Create new recipes
- Edit your own recipes
- Delete your own recipes
- Search and filter recipes

### User Interactions
- Like/unlike recipes
- Favorite recipes
- Comment on recipes
- View user profiles
- Edit your profile
- Upload profile pictures

### UI Features
- Dark mode toggle (saved to localStorage)
- Responsive design
- User-friendly navigation
- Error handling and loading states

## Pages

- **Home (`/`)** - Displays featured recipes
- **Recipes (`/recipes`)** - Browse all recipes with search
- **Recipe Detail (`/recipes/[id]`)** - View recipe details, comments, like/favorite
- **Create Recipe (`/recipes/new`)** - Create a new recipe (protected)
- **Login (`/login`)** - User login
- **Register (`/register`)** - User registration
- **Profile (`/profile`)** - View your profile (protected)
- **Settings (`/settings`)** - Update profile and preferences (protected)
- **My Recipes (`/my-recipes`)** - Manage your recipes (protected)
- **Favorites (`/favorites`)** - View your favorited recipes (protected)
- **User Profile (`/users/[id]`)** - View public user profiles
- **About (`/about`)** - About page

## API Integration

The frontend communicates with the backend API through the `app/lib/api.js` module. All API calls are centralized here for easy maintenance.

### Example Usage

```javascript
import { api } from '@/lib/api';

// Get recipes
const recipes = await api.getRecipes();

// Login
const token = await api.login(email, password);

// Create recipe
await api.createRecipe(recipeData);
```

## Testing

See [TESTING.md](TESTING.md) for detailed testing documentation.

### Quick Commands

```bash
npm test              # Run Jest unit tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:e2e      # Run Cypress E2E tests
npm run test:e2e:open # Interactive Cypress
```

## Code Quality

```bash
npm run lint          # Run ESLint
```

## Dark Mode

The application supports dark mode with the following behavior:
- Default: Light mode (white/beige background)
- Toggle: Available in the Navbar
- Persistence: Preference saved to localStorage
- No system preference detection: Only user-initiated toggle

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL (e.g., `http://localhost:5000`) |

## Deployment

The frontend is designed to be deployed on Vercel or similar platforms:

1. Set `NEXT_PUBLIC_API_URL` environment variable
2. Build command: `npm run build`
3. Start command: `npm start` (or use Vercel's automatic detection)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the Apache License 2.0. See the root [LICENSE](../LICENSE) file for details.

