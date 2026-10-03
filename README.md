# Skill Tracker

A responsive web app for tracking the skills you're learning. Add a skill, say where you are now and which level you want to reach, then update your progress and watch it on a dashboard.

## Features

- **Add skills** with a name, category, current level, target level and optional target date
- **Edit and delete** any skill (deleting asks for confirmation)
- **Track progress** from 0 to 100% with quick +/− buttons or the slider in the edit form
- **Status is calculated automatically**: Not Started, In Progress, Completed, or Overdue when the target date has passed
- **Dashboard** with overall progress, counts by status, next deadlines, progress by category and recent activity
- **My Skills page** with search plus filters for status and category, and sorting
- **Activity log** of everything you add, change, complete or delete
- **Saved in your browser** with `localStorage`, so your skills are still there after a refresh
- **Export and import** your data as JSON from Settings
- **Responsive**: sidebar layout on desktop, bottom tab bar on phones
- **Accessible basics**: labelled form fields, keyboard-friendly dialogs, visible focus, `prefers-reduced-motion` respected

## Tech stack

React 19, Vite, plain CSS, Vitest and Testing Library, Oxlint.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm test          # run the test suite
npm run lint      # lint the code
npm run build     # production build in dist/
npm run preview   # preview the production build
```

Requires Node.js 20 or newer.

## Project structure

```
src/
  App.jsx                 page layout, navigation and dialogs
  components/             SkillForm, SkillRow, SkillsPanel, SummaryCards, pages, Modal
  lib/
    constants.js          categories, levels, storage keys
    utils.js              status, dates, statistics
    reducer.js            all state changes in one place
    storage.js            saving, loading, import/export, upgrading old data
    __tests__/            unit tests
  test/                   tests that click through the whole app
```

## How it works

- **State** lives in a single reducer (`lib/reducer.js`). Every change, such as adding a skill or updating progress, is an action, which keeps the logic easy to test.
- **Status is derived, not stored.** It is calculated from the progress and target date each time, so it can never disagree with the data.
- **Progress means progress toward the target level.** A skill at 100% is marked Completed. Edit it to set a new current level and target when you're ready to aim higher.
- **Old data is upgraded.** If you used the first version of the app, your saved skills are converted to the new format the first time you open this one.

## Limitations

- Data is stored only in the browser it was entered in. Use Export in Settings to back it up or move it to another device.
- There are no accounts or sync between devices.

## Deploying

The build uses relative paths, so the contents of `dist/` work on Vercel, Netlify or GitHub Pages without extra configuration.
