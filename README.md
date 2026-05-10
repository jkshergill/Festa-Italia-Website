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
Festa Italia Foundation, Inc. is a non-profit public benefit organization whose main goals are to promote the Italian heritage, tradition, and culture, to honor the fishermen of Monterey, California and to educate the public on how the Italian fishermen have contributed to their community. The foundation holds a three-day festival of Italian art, food, and music bringing people together from across the globe along with many smaller events throughout the year. Sponsors aid the foundation in providing thousands of dollars in scholarships each year to local high school and college students from the community.

<img width="474" height="488" alt="image" src="https://github.com/user-attachments/assets/0f712d8e-b9f8-4fb4-b448-508aba28decd" />


# Need
The client, Festa Italia Foundation, Inc., needed a new website to promote Festa Italia – a large annual Italian Festival held in Monterey – and a centralized place for the board members, volunteers, donors, and attendees to login and handle business, and contribute/participate in the festival. Among their requests, the client specifically articulated a need for processing payments online through which users and visitors can purchase tickets to their Coronation Ball and/or make donations to support the organization. A unique aspect of the festival is the pre-paid token exchange used to buy food and drinks. The client required the food menu be made available online to allow attendees to peruse the menu beforehand and calculate the amount of tokens needed prior to attending the festival. Additionally, we created easier access to their magazine, chronicling their past festivals, and presented it in a way that attracts users to visit future festivals. We also implemented features allowing the board members/admins to share event information with the community to inform their attendees of the ball, bocce tournament, donations, volunteer positions, menu, as well as their scholarship opportunity. As an extension of the information-sharing requirement, we have created a way for users and potential festival attendees to sign up for volunteer shifts at the festival, sign up for bocce tournaments to compete at the festival, participate in the Coronation Ball, and apply for the festival's scholarship for eligible students. We also created a centralized database, hosted on Supabase, that can store all this information safely and securely for the client's peace of mind. Ultimately, the goal of this project is to provide the board members/admin users with functionality that allows them access to manipulate this data in a simple and meaningful way, allowing them a proactive approach in organizing the festival.

# Our ERD
<img width="1525" height="1008" alt="image" src="https://github.com/user-attachments/assets/ded45185-e75d-4d88-bfa1-f609a695d3f0" />

# Some Images of Our Website
* Home Page
  <img width="2129" height="1292" alt="Screenshot 2026-05-05 125334" src="https://github.com/user-attachments/assets/f6db18fd-f870-4e2f-9b55-fed826eea356" />
  * This is the page the website defaults upon opening, signing in or out, finishing a transaction, etc. This page holds the general information about the foundation, its board members, and upcoming events

* Login Page
  <img width="2125" height="1109" alt="Screenshot 2026-05-05 134253" src="https://github.com/user-attachments/assets/9ad67645-a298-4082-8aca-464c0ac124a0" />
  * This is the page the website goes to when a user clicks on the sign in button at the top right of the home screen.

* Admin Dashboard
  <img width="2125" height="696" alt="Screenshot 2026-05-05 125551" src="https://github.com/user-attachments/assets/61793dee-9862-4c8c-88df-ae45ab576e44" />
  * This is the page were an admin will be directed to when clicking the Admin Dashboard button in the buger menu with various admin features.
  
* Fishermans Festival Page
  <img width="2123" height="1112" alt="Screenshot 2026-05-05 134519" src="https://github.com/user-attachments/assets/9bd37eee-b5c2-4b2f-aa92-6f88199356f8" />
  * This is a page accessed through the burger menu that gives information to a user about various festival details along with the ability to sign up for volunteering and seeing the food menu.

* Volunteer Page
  <img width="2128" height="863" alt="Screenshot 2026-05-05 130039" src="https://github.com/user-attachments/assets/3b750e5b-4689-4775-90e4-e3bb6659a6df" />
  * This page is accessed from the Fishermans Festival page and allows users to request volunteering by day, time frame, and booth. Only available is a user is signed in.

* Menu Page
  <img width="2125" height="1294" alt="Screenshot 2026-05-05 135302" src="https://github.com/user-attachments/assets/c9788821-16ee-438d-b3d6-08589bbe3491" />

* Queen's Court Page
  <img width="2129" height="1006" alt="Screenshot 2026-05-05 135519" src="https://github.com/user-attachments/assets/f8147d70-69c4-4810-b1f5-5423c7294da8" />

* Coronation Ball Tickets Page
  <img width="2128" height="530" alt="Screenshot 2026-05-05 134322" src="https://github.com/user-attachments/assets/abcf4db3-f153-4b59-beee-efda5003f08c" />

* Bocce Tournament Page
  <img width="2124" height="1297" alt="Screenshot 2026-05-05 125409" src="https://github.com/user-attachments/assets/06b400ed-921f-44ec-ba00-8f2d0cda6ce9" />
  * This page is accessed through the burger menu that gives information to a user about various bocce tournament details along with the ability to sign a team up to play in the tournament.

* Donate Page
  <img width="2124" height="1232" alt="Screenshot 2026-05-05 135427" src="https://github.com/user-attachments/assets/1e8cb239-b05e-45be-ab00-9d89117653a6" />

* Previous Sponsor's Page
  <img width="2127" height="1275" alt="Screenshot 2026-05-05 135925" src="https://github.com/user-attachments/assets/05c16114-cd34-48f9-b1dd-308846d37e4e" />

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

## Deployment Summary

1. Clone repo and install dependencies (`npm install`)
2. Add Supabase environment variables
3. Run `npm run build`
4. Upload `/dist` contents to hosting provider

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
