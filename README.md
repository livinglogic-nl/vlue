# Vuel ⛽

> The juice that super charges your vue development experience!

## Why

It is just-another-bundler **but** focused on development:
- No building of vendor code (makes use of packaged dist files)
- Assumes Chrome or Firefox (no need for ancient fallbacks while developing)
- Lightning fast puppeteer tests (might be considered hacky but definitely worth it)
- Listens for changes to the build configuration, should make it easier for you to adapt it to your needs.

### No building of vendor code
Most npm packages come with a prebuilt dist file. Most of the time there is no need to mess with library code, and so no reason to rebuild it.

Start up is pretty much instant:

TODO insert amazing gif of speed (with time to prove)

### Assumes Chrome
By assuming a recent browser while developing, code does not have to be babelicious. Assuming Chrome allows us to remote control it with puppeteer, eliminating seperate hot-reloading scripts.

### Lightning fast puppeteer tests
Puppeteer is already amazing in and out of itself (TY).
A little trick i thought of makes it even more mindblowing... just look at em go:

TODO insert amazing gif of speed (with time to prove)

## Scope

### Development
- Hot-Reloading
- ESLint with autofix on triple save
- Puppeteer integration
- Request mocking
- Websocket mocking

### Production build
- Terser
- Babelify
- Minify


## Install

```console
npm i vuel
```

## Run

```console
npm run vuel
```

## Roadmap
- Firefox support
