# Festa-Italia-Website

<img width="1914" height="1323" alt="image" src="https://github.com/user-attachments/assets/7816a50c-4e82-471c-8781-1802319bbb19" />

# The Team 
|Name|
|--------------------|
|John Campo|
|Ricardo Olivares Bravo|
|Devin Wynne|
|Ryan Lee|
|Jagjeet Kaur|
|Jack Harrison|
|Pratish Patil|
|Adrian Gamez|

# Business 
Festa Italia Foundation, Inc. is a non-profit public benefit organization whose main goals are to promote the Italian heritage, tradition, and culture, to honor the fishermen of Monterey, California and to educate the public on how the Italian fishermen have contributed to the heritage of their community. The foundation holds a three-day festival of Italian art, food, and music bringing people together from across the globe along with many smaller events throughout the year. Sponsors aid the foundation in providing thousands of dollars in scholarships each year to local high school and college students from the community.

<img width="474" height="488" alt="image" src="https://github.com/user-attachments/assets/0f712d8e-b9f8-4fb4-b448-508aba28decd" />


# Need
The client needs a new website to promote Festa Italia– a large annual Italian Festival held in Monterey– and create a centralized place for the board members, volunteers, donors, and attendees to login and handle business. The client has requested that we integrate a way for them to process payments for donations and coronation ball tickets. The food and drinks are exchanged with prepaid tokens, and a menu for attendees to calculate the amount of tokens needed is another requested feature. We will create easier access to their magazine and present it in a way that attracts users to the future festivals. We will share event info with the community and since we are going to inform their attendees of the ball, bocce tournament, donations, volunteer positions, and menu, we will create a centralized database that can store all this info. We want the board members/admin users to be able to access and manipulate this data in a simple and meaningful way.

# Our ERD
<img width="1525" height="1008" alt="image" src="https://github.com/user-attachments/assets/ded45185-e75d-4d88-bfa1-f609a695d3f0" />

# Some Images of Our Website Prototype (Replace this with finalized pages with descriptions) 
* Home Page
  <img width="2129" height="1292" alt="Screenshot 2026-05-05 125334" src="https://github.com/user-attachments/assets/f6db18fd-f870-4e2f-9b55-fed826eea356" />
  
* Admin Dashboard
  <img width="2125" height="696" alt="Screenshot 2026-05-05 125551" src="https://github.com/user-attachments/assets/61793dee-9862-4c8c-88df-ae45ab576e44" />

* Volunteer Page
  <img width="2128" height="863" alt="Screenshot 2026-05-05 130039" src="https://github.com/user-attachments/assets/3b750e5b-4689-4775-90e4-e3bb6659a6df" />
  
* Coronation Ball Tickets Page
  <img width="3776" height="1722" alt="image" src="https://github.com/user-attachments/assets/c60ca886-a6aa-47f3-bac4-5bee3e377ba3" />
  
* Bocce Tournament Page
  <img width="2124" height="1297" alt="Screenshot 2026-05-05 125409" src="https://github.com/user-attachments/assets/06b400ed-921f-44ec-ba00-8f2d0cda6ce9" />

  
# Testing 
Testing was used with Vitest. All the packages and dependencies for Vitest have already been installed and setup. All you need to do is the following to start testing:
* Install Vitest with the following command in your terminal: `npm install -D Vitest`
* To run all test files in the 'src' folder, type the following command in the terminal: `npm run test`
* To run a specific test file, type the following command in the terminal: `npm run test [filename].spec.jsx.      
Optional: You can also install an extension in Visual Studio Code (VS Code) to make running tests easier. The extension is named "Vitest" by vitest.dev

# Deployment

This project uses React with Vite for the frontend and Supabase for the
backend, authentication, database, and storage.

## Prerequisites

Before deploying, make sure you have:

-   Node.js installed
-   npm installed
-   Access to the GitHub repository
-   Access to the hosting provider
-   Access to the Supabase project
-   Required Supabase environment variables:
    -   `VITE_SUPABASE_URL`
    -   `VITE_SUPABASE_ANON_KEY`

## Deployment Steps

1.  Clone the repository:

``` bash
git clone [repository-url]
cd Festa-Italia-Website
```

2.  Install dependencies:

``` bash
npm install
```

3.  Add the required Supabase environment variables.

If using a `.env` file locally:

``` bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4.  Run the project locally:

``` bash
npm run dev
```

5.  Run tests:

``` bash
npm run test
```

6.  Build the project:

``` bash
npm run build
```

7.  Deploy the contents of the `dist` folder to the hosting provider.

For GoDaddy/cPanel hosting:

-   Navigate to `public_html`
-   Delete old files if necessary
-   Upload **contents of `/dist` (not the folder itself)**

## React Routing Fix

If refreshing a page causes a 404 error, create or update a `.htaccess`
file in `public_html`:

``` apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## Supabase Checklist

After deployment, verify:

-   Supabase URL and anon key are correct
-   Row Level Security (RLS) policies are configured correctly
-   Required tables exist (e.g., users, tickets, foods, tokens, etc.)
-   Required storage buckets exist (images for foods, donors, tokens,
    etc.)
-   Authentication (login/signup) works
-   Admin dashboard access works
-   Payments, donations, and ticket purchases function correctly
-   Images and dynamic content load properly

## Backup and Rollback

Before deploying updates:

-   Download a backup of the current `public_html` directory

If issues occur:

-   Re-upload the previous working version of the site

# Developer Instructions

## Overview

This project is a React application built with Vite and connected to a
Supabase backend for authentication, database operations, and storage.

## Prerequisites

Before working on the project, ensure you have:

-   Node.js (v20 or higher recommended)
-   npm
-   Git
-   Visual Studio Code (recommended)

## Setup

1.  Clone the repository:

``` bash
git clone [repository-url]
cd Festa-Italia-Website
```

2.  Install dependencies:

``` bash
npm install
```

3.  Configure environment variables:

Create a `.env` file in the root directory and add:

``` bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4.  Start the development server:

``` bash
npm run dev
```

The app will run locally (typically at http://localhost:5173).

## Project Structure

    src/
      tickets/           # Corination Ball ticket componets
      App.jsx            # Main application entry
      ...                # Page entrys
      supabaseClient.js  # Supabase configuration
      supabase/          # Supabase componets

## Common Commands

``` bash
npm run dev       # Start development server
npm run build     # Build production version
npm run preview   # Preview production build locally
npm run test      # Run tests (Vitest)
npm run lint      # Run ESLint
```

## Working with Supabase

The project uses Supabase for:

-   Authentication (login/signup)
-   Database (tables such as users, tickets, foods, tokens, etc.)
-   Storage (images and assets)

When working with Supabase:

-   Ensure correct environment variables are set
-   Verify Row Level Security (RLS) policies
-   Confirm table and column names match the code
-   Check storage buckets for images

## Development Workflow

1.  Create a new branch:

``` bash
git checkout -b feature/your-feature-name
```

2.  Make changes to the codebase

3.  Test locally:

``` bash
npm run dev
npm run test
```

4.  Commit changes:

``` bash
git add .
git commit -m "Add feature description"
```

5.  Push to GitHub:

``` bash
git push origin feature/your-feature-name
```

6.  Open a pull request for review

## Testing

Testing is done using Vitest.

Run all tests:

``` bash
npm run test
```

## Troubleshooting

### App not starting

-   Ensure Node.js is installed
-   Run `npm install` again
-   Check `.env` file for missing variables

### Supabase not working

-   Verify API keys
-   Check RLS policies
-   Confirm correct table names

### UI not updating

-   Restart development server
-   Clear browser cache
-   Check browser console for errors

## Notes

-   Do not commit `.env` files or secrets to GitHub
-   Always test changes before pushing
-   Keep code clean and consistent using ESLint/Prettier
