# Curso de Angular 22

## Instalaciones

- [Git](https://git-scm.com/)
- [Visual Studio Code](http://code.visualstudio.com/)
- Node.js (Alternativas)
  - [Node.js LTS](https://nodejs.org/es)
  - [NVM for Windows](https://github.com/coreybutler/nvm-windows/releases)

```sh
            nvm install lts
```

- [Angular DevTools](https://chrome.google.com/webstore/detail/angular-devtools/ienfalfjdbdpebioblfackkekamfmbnh)

## Extensiones Visual Studio Code

- [Spanish Language Pack for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=MS-CEINTL.vscode-language-pack-es)
- [Angular Essentials](https://marketplace.visualstudio.com/items?itemName=johnpapa.angular-essentials)
- [Vitest](https://marketplace.visualstudio.com/items?itemName=vitest.explorer)
- [Auto Close Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag)
- [Auto Rename Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag)
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) + [Spanish - Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker-spanish)
- [IntelliSense for CSS class names](https://marketplace.visualstudio.com/items?itemName=Zignd.html-css-class-completion)
- [Path Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense)
- [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- [Postman](https://marketplace.visualstudio.com/items?itemName=Postman.postman-for-vscode)

## Angular Command Line Interface

```sh
npm install -g @angular/cli
ng version
```

## Servidor REST (local sin control de versiones)

```sh
git clone add https://github.com/jmagit/MOCKWebServer.git MOCKWebServer
cd MOCKWebServer
npm i
npm start
```

## Servidor REST (local bajo control de versiones)

```sh
git submodule add https://github.com/jmagit/MOCKWebServer.git MOCKWebServer
cd MOCKWebServer
npm i
npm start
```

## Servidor REST (docker)

```sh
docker run -d -p 4321:4321 --name mock-web-server jamarton/mock-web-server:latest
```

## Documentación

- [Oficial](https://angular.dev/)
