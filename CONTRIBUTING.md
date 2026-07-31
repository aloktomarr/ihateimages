# Contributing to iHateImages

Thanks for your interest in improving iHateImages. This guide covers how to report issues, suggest features, and send code.

## Ways to help

- Report a bug you ran into.
- Suggest a new tool or an improvement to an existing one.
- Fix a bug or build a feature.
- Improve the docs.

## Ground rule: keep it client side

The point of this project is that images never leave the user's device. Any change that sends image data to a server will not be accepted. All processing has to happen in the browser. If a feature needs a model or a codec, load it as a static asset or from a CDN, but never send the user's image anywhere.

## Reporting a bug

Open an issue and include:

- What you did and what happened.
- What you expected to happen.
- Your browser and operating system.
- A screenshot if it helps.

## Suggesting a feature

Open an issue that explains what you want and why it is useful. Screenshots or links to similar tools help.

## Development setup

You need Node 18 or newer and npm.

```
git clone https://github.com/aloktomarr/ihateimages.git
cd ihateimages
npm install
npm run dev
```

The dev server runs at http://localhost:5173.

## Project layout

- `src/pages` has one file per tool.
- `src/components` has the shared UI.
- `src/lib` has the image engine, helpers, and data.
- `src/workers` has the Web Worker that does the pixel work.
- `public` has static files.

## Coding style

- The project uses TypeScript. Keep the types accurate.
- Match the style of the files around you.
- Run `npm run build` before you open a pull request. It type-checks and builds, and both have to pass.

## Sending a pull request

1. Fork the repo and create a branch from `main`.
2. Make your change and test it in the browser.
3. Run `npm run build` and make sure it passes.
4. Write a short commit message in the present tense, for example "Add TIFF support to the converter".
5. Open a pull request that describes what you changed and why.

Keep pull requests focused. Smaller changes are easier to review and merge.

## Questions

If something is unclear, open an issue and ask.
