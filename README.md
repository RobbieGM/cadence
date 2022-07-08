# Cadence

A simple web app to help composers get inspired for where their piece could go next harmonically. Cadence generates or completes chord progressions based on existing music, allowing for organization by style or mood.

## Goals, specifications, TODO

- PWA, usable offline
- Data is saved client-side but can be exported for sharing
- Output is generated with Markov chains or LSTM
  - Training data is selected by tags
- No server should be necessary
- Don't close modal accidentally if there is unsaved data
- Zero-margin dialogs on mobile
- Prerender modal dialogs for better opening perf (probably get rid of ModalDialogProvider and replace with individuals)
  - This should fix the related bug where lazy-loading modal content causes layout shift
  - May also fix bug where after cancelling training it appears to resume if you open training dialog again
- Allow for time for train model dialog to close before opening chord generator dialog, or open the latter on top
- Save and load tracks (to and from downloads)
- Persistent model settings
- Enter within textarea should submit form to add/edit track
- Keyboard shortcuts for "add music", "generate chords"
- Persist tags between adding one track to the next
- Make chord progression editor non-keyboard-accessible (apart from text box)?
- Display newest first
- Eliminate gap between "Chords" label and textarea in ChordProgressionGeneratorDialog
- Make widths as low as 320px work (currently there is a horizontal scrollbar)
- Disallow chord generation before any tracks are there (animate "add track" button)
- Invisible commas between tags for text selection
- Well-defined height for clipboard image in empty state so it doesn't cause layout shift
- TensorFlow bundle size reduction (there's a tutorial on this somewhere)
- navigator.storage.persist

## Usage

Those templates dependencies are maintained via [pnpm](https://pnpm.io) via `pnpm up -Lri`.

This is the reason you see a `pnpm-lock.yaml`. That being said, any package manager will work. This file can be safely be removed once you clone a template.

```bash
$ npm install # or pnpm install or yarn install
```

### Learn more on the [Solid Website](https://solidjs.com) and come chat with us on our [Discord](https://discord.com/invite/solidjs)

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
