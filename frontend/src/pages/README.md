# Pages Directory Organization

This directory contains all the Next.js pages with a logical organization that maintains proper routing:

## Directory Structure

### Root Level - Main Route Files
- `login.tsx` - User login page (`/login`)
- `register.tsx` - User registration page (`/register`)
- `home.tsx` - Home/dashboard page (`/home`)
- `books.tsx` - Books listing and management page (`/books`)
- `users.tsx` - Users management page (`/users`)
- `booking.tsx` - Booking management page (`/booking`)
- `404.tsx` - Not found error page (`/404`)
- `500.tsx` - Server error page (`/500`)
- `_app.tsx` - Next.js app wrapper
- `index.tsx` - Root page (redirects to home)

### `/lazy/` - Lazy-loaded Components
- `home-lazy.tsx` - Lazy-loaded home page
- `books-lazy.tsx` - Lazy-loaded books page
- `users-lazy.tsx` - Lazy-loaded users page
- `booking-lazy.tsx` - Lazy-loaded booking page

### `/components/` - Organized Components (for future use)
- `/auth/` - Authentication-related components
- `/main/` - Main application components
- `/error/` - Error page components

### `/admin/` - Admin Pages
- (Empty - for future admin functionality)

### `/dashboard/` - Dashboard Pages
- (Empty - for future dashboard functionality)

## URL Routing

The URLs remain the same as before:
- `/login` - Login page
- `/register` - Register page
- `/home` - Home page
- `/books` - Books page
- `/users` - Users page
- `/booking` - Booking page
- `/404` - 404 error page
- `/500` - 500 error page

## Benefits of This Organization

1. **Maintains Routing**: All main routes work as expected
2. **Clear Organization**: Related files are grouped logically
3. **Easy Navigation**: Developers can quickly find pages by category
4. **Scalable**: Easy to add new pages and components
5. **Maintainable**: Clear structure makes maintenance easier
