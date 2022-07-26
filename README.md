# Cadence

A simple web app to help composers get inspired for where their piece could go next harmonically. Cadence generates or completes chord progressions based on existing music, allowing for organization by style or mood.

## Highlights

- Offline-capable PWA and fully client-side
- ML powered by Tensorflow.js
- Built with desktop power users in mind, with useful keyboard shortcuts

## Future enhancements and bugs

- Modal dialog fixes
  - Need to reduce animation jank, should probably ditch native &lt;dialog&gt; since it uses slow CSS selector \[open\]
- Model training in Web Worker
- TensorFlow bundle size reduction (last time I tried using its profiling, it crashed my whole computer)
- navigator.storage.persist
- Change underlying structure of chords from root and quality to notes which are on/off
  - This will reduce the dimensionality of the model as well as allow for more expressivity
  - The model will be able to more easily "intuit" which chords are similar to others by note overlap
- MIDI keyboard support
- Closing and reopening modal dialog should reset tab focus to first element

## Goals, specifications, TODO

- PWA, usable offline
- Data is saved client-side but can be exported for sharing
- Output is generated with Markov chains or LSTM
  - Training data is selected by tags

## Available Scripts

In the project directory, you can run:

### `npm dev` or `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `npm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)
