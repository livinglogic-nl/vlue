<style>

code {
background: #eee;
padding: 8px;
}

</style>

# Vuel
![logo](test/basic/src/logo.svg "logo")
> The juice that drives your vue development experience!

## Highlights

Assuming a recent Chrome browser during development allows us to have:

- Fast startup and bundling during development
> insert impressive gif 

- Integrated puppeteer testing
> insert impressive gif 

- Integrated response mocking
> insert impressive gif 

## Rationale

Vuel is trying to be a **one-size-fits-some** bundler.
By assuming a particular use, it allows to focus on features and performance.

The benefit of **one-size-fits-all** bundlers such as Webpack comes at a cost.
Making any setup a possibility, can mean some heavy configuration at times.
Catering for any kind of use makes for less optimal performance.


## Assumptions

- Recent chrome browser
- MacOs / Windows

## Installation

```
npm i -g vuel
```

## Usage

### While developing

```
vuel dev
```

- Starts a dev server
- Uses **src/index.html** as the template for html
- Uses **src/index.js** as the entry point for the application
- Vue single-file-components are handled using Sass for style
- Any discovered javascript within the **src** directory is linted with ESLint
- Watches for changes, hot-reloading when possible
- Puppeteer tests are run when idle

### When distributing
```
vuel build
```
- Starts a production build
- Generates output in the **dist** folder
- Application code ends up in **dist/index.js**
- Vendor code ends up in **dist/vendor.js**
- Css ends up in **dist/style.css**
- Javacript code is babelified using babel
- Javacript code is minified using terser

After building you can do a
```
vuel test
```
To run puppeteer tests on the distribution code.


