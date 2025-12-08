# TastyHub Frontend

Next.js-based frontend for the TastyHub recipe sharing platform.

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **React:** 18.3.0
- **Styling:** Tailwind CSS 3.4
- **Animations:** Framer Motion 12
- **Testing:** Jest (unit), Cypress (E2E), React Testing Library
- **Code Quality:** ESLint, Prettier
- **Monitoring:** Sentry (error tracking), Hotjar (analytics)

## Prerequisites

- Node.js 18+
- npm
- Backend API running (see `../backend/README.md`)

## Installation

```bash
npm install
```

## Configuration

Create a `.env.local` file in the `frontend` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Optional: Analytics & Monitoring
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
NEXT_PUBLIC_HOTJAR_ID=your_hotjar_id_here
```

**Note:** All environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Running the Application

```bash
npm run dev      # Development mode (http://localhost:3000)
npm run build    # Production build
npm start        # Production mode (requires build first)
```

## Project Structure

```
frontend/
├── app/
│   ├── components/          # Reusable React components
│   │   ├── Navbar.js       # Navigation bar
│   │   ├── RecipeCard.js   # Recipe display card
│   │   ├── ParticlesBackground.js  # Animated background
│   │   └── ...
│   ├── lib/                 # Utility functions
│   │   ├── api.js          # API client functions
│   │   └── imageUtils.js   # Image compression utilities
│   ├── about/              # About page
│   ├── admin/              # Admin dashboard
│   ├── login/              # Login page
│   ├── profile/            # User profile page
│   ├── recipes/            # Recipe pages
│   │   ├── [id]/          # Dynamic recipe detail page
│   │   └── new/           # Create recipe page
│   ├── register/           # Registration page
│   ├── settings/           # User settings page
│   ├── layout.js           # Root layout component
│   ├── page.js             # Home page
│   └── globals.css         # Global styles
├── public/                  # Static assets
│   ├── images/             # Image assets
│   └── ...
├── cypress/                 # E2E tests
│   ├── e2e/                # Test files
│   └── support/            # Custom commands
├── __tests__/              # Unit tests (if any)
├── .eslintrc.json          # ESLint configuration
├── jest.config.js          # Jest configuration
├── jest.setup.js           # Jest setup file
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── package.json
```

## Features

### Pages

- **Home (`/`)** - Landing page with featured recipes
- **Recipes (`/recipes`)** - Browse all recipes
- **Recipe Detail (`/recipes/[id]`)** - View recipe details, comments, likes
- **Create Recipe (`/recipes/new`)** - Create new recipe (authenticated)
- **Login (`/login`)** - User login (email/password or Google OAuth)
- **Register (`/register`)** - User registration
- **Profile (`/profile`)** - User profile and recipes
- **Settings (`/settings`)** - Account settings
- **Admin (`/admin`)** - Admin dashboard (admin only)
- **About (`/about`)** - About the platform

### Components

#### Navbar
- Responsive navigation bar
- Dark mode support
- User authentication state
- Mobile menu

#### RecipeCard
- Recipe preview card
- Like/favorite functionality
- Author information
- Responsive design

#### ParticlesBackground
- Animated particle background
- Performance optimized
- Customizable colors

### Authentication

- JWT token-based authentication
- Google OAuth integration
- Protected routes
- Automatic token refresh
- Persistent login state

### Image Handling

- Client-side image compression
- URL-based recipe images
- Profile picture upload
- Optimized image loading

### Styling

- Tailwind CSS utility-first approach
- Dark mode support
- Responsive design (mobile-first)
- Custom color palette
- Smooth animations with Framer Motion

## API Integration

The frontend communicates with the backend API using the `api.js` utility:

```javascript
import { login, getRecipes, createRecipe } from './lib/api';

// Example usage
const recipes = await getRecipes();
const newRecipe = await createRecipe(recipeData);
```

### API Functions

- **Authentication**: `login()`, `register()`, `googleAuth()`
- **Recipes**: `getRecipes()`, `getRecipeById()`, `createRecipe()`, `updateRecipe()`, `deleteRecipe()`
- **User**: `getUserProfile()`, `updateUserProfile()`, `uploadProfilePicture()`
- **Interactions**: `likeRecipe()`, `favoriteRecipe()`, `addComment()`

See `app/lib/api.js` for complete API documentation.

## Testing

### Unit Tests (Jest)

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### E2E Tests (Cypress)

**Prerequisites:** Both backend and frontend servers must be running.

```bash
npm run test:e2e         # Run E2E tests (headless)
npm run test:e2e:open    # Interactive test runner
npm run test:e2e:headed  # Run with browser visible
```

See `TESTING.md` for detailed testing documentation.

## Code Quality

```bash
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix linting issues
```

## Performance Optimization

### Image Compression
- Client-side image compression before upload
- Reduces file sizes by ~70%
- Maintains acceptable quality
- See `app/lib/imageUtils.js`

### Code Splitting
- Automatic code splitting with Next.js
- Dynamic imports for heavy components
- Optimized bundle sizes

### Caching
- Static asset caching
- API response caching (where appropriate)
- Browser caching headers

## Dark Mode

Dark mode is implemented using CSS variables and Tailwind's dark mode utilities:

```css
/* Light mode */
--background: #ffffff;
--text: #000000;

/* Dark mode */
.dark {
  --background: #1a1a1a;
  --text: #ffffff;
}
```

Toggle dark mode in the Navbar component.

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL` - Your backend API URL
   - `NEXT_PUBLIC_SENTRY_DSN` - (Optional) Sentry DSN
   - `NEXT_PUBLIC_HOTJAR_ID` - (Optional) Hotjar ID
3. Deploy automatically on push to `main` branch

See `.github/workflows/deploy.yml` for CI/CD configuration.

### Manual Deployment

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry DSN for error tracking |
| `NEXT_PUBLIC_HOTJAR_ID` | No | Hotjar ID for analytics |

## Troubleshooting

### API Connection Issues

**Problem:** "Failed to fetch recipes"  
**Solution:** Ensure backend is running and `NEXT_PUBLIC_API_URL` is correct

### Build Errors

**Problem:** Build fails with ESLint errors  
**Solution:** Run `npm run lint:fix` to auto-fix issues

### Image Upload Fails

**Problem:** "File too large"  
**Solution:** Images are compressed client-side. Check console for errors.

### Dark Mode Not Working

**Problem:** Dark mode toggle doesn't persist  
**Solution:** Clear browser cache and local storage

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

See root `CONTRIBUTING.md` for contribution guidelines.

## Related Documentation

- [Backend API Documentation](../backend/README.md)
- [Testing Guide](TESTING.md)
- [Security Policy](../SECURITY.md)
- [Project README](../README.md)

## License

This project is licensed under the Apache License 2.0. See the root [LICENSE](../LICENSE) file for details.

---

**Last Updated:** December 8, 2024
