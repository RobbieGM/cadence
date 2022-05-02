# Cadence

A simple web app to help composers get inspired for where their piece could go next harmonically. Cadence generates or completes chord progressions based on existing music, allowing for organization by style or mood.

## Goals and specifications

- PWA, usable offline
- Data is saved client-side but can be exported for sharing
- Chords are quick to input
    - MIDI keyboard support
- Each track can be assigned tags
- Output is generated with Markov chains or some more advanced model
    - Training data is selected by tags or by individual tracks
- No server should be necessary

## Tech stack

- SolidJS
- 

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
