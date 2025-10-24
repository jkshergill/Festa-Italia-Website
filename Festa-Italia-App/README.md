# React replica of festival_info.html

This small Vite + React scaffold reproduces `frontend/src/festival_info.html` as a React component.

Quick start (macOS / zsh):

1. cd into the react app

```bash
cd frontend/react-festival
```

2. Install dependencies

```bash
npm install
```

3. Start the dev server

```bash
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

Notes:
- The component imports the original CSS from `frontend/style/festival_info.css` via a relative path from the component. If you later move or rename files, update the import in `src/FestivalInfo.jsx`.
- Image imports in the component currently use relative paths to the existing `frontend/images` folder (e.g. `../../images/logo2.gif`). Vite's dev server will resolve these during development. If you build the app or prefer a simpler static path, copy `frontend/images` into `frontend/react-festival/public/images` and update paths to `/images/...`.
