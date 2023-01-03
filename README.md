<h1 align="center">Welcome to Synology Download 👋</h1>
<p>
  <img src="https://img.shields.io/badge/npm-%3E%3D7.10.0-blue.svg" />
  <img src="https://img.shields.io/badge/node-%3E%3D16.0.0-blue.svg" />
  <a href="https://github.com/dvcol/synology-download#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/dvcol/synology-download/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/dvcol/synology-download/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/dvcol/synology-download" />
  </a>
 <a href="https://paypal.me/dvcol/5" target="_blank">
    <img alt="donate" src="https://img.shields.io/badge/Donate%20€-PayPal-brightgreen.svg" />
  </a>
</p>

> Synology Download is a React base Chrome extension to manage Synology Download Station tasks directly from the browser.

> The popup support the following functionalities
>
> * Tabbed download tasks display and filtering
> * Task pause, play, seed, delete, destination edit
> * Task creation through rich form (destination, url, ftp, zip password)
> * Http, Https, 2FA login over local network
> * Context menu creation (with custom destination)
> * Quick action menu creation (with custom destination)

> The content script supports the following functionalities:
>
> * One click download on magnet links
> * Quick menu dropdown if more than one exist
> * Rich task creation modal on quick action or context menu
> * In-page notification for task creation

> The service worker supports the following functionalities:
>
> * Periodic task polling
> * Custom badge number and text display for filtered tasks (by tabs, status, destination)
> * Browser notifications on task completion/error (conditional on polling behavior and extensions permissions)

## Limitation

> Quick-connect login is not currently supported due to the lack of official API documentation.
>
> Currently, only magnet urls are supported for the quick action menu.
>
> Note that translation on previous version of Chrome (100 and below) might have only partial support in banner notifications.
>
> Due to MV3 current limitation, the service-worker is maintained awake through periodic messaging on active tab, if no tab is active in the past 5 minutes, service worker and associated functionalities might suspend until wake events.

## Prerequisites

- npm >=7.10.0
- node >=16.0.0

## Install

```sh
npm install
```

## Usage

To start the dev server (hot reload popup and service worker, but not content script)

```sh
npm run start
```

To build for production

```sh
npm run build
```

See [package.json](https://github.com/dvcol/synology-download/blob/main/package.json) for other useful scripts.

## Run tests

```sh
npm run test:unit
```

## Author

* Github: [@dvcol](https://github.com/dvcol)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/dvcol/synology-download/issues).

## Show your support

Give a ⭐️ if this project helped you!

 <a href="https://paypal.me/dvcol/5" target="_blank">
    <img alt="donate" src="https://img.shields.io/badge/Donate%20€-PayPal-brightgreen.svg" />
 </a>
  
## Download

* [Github Releases](https://github.com/dvcol/synology-download/releases)
* [Download Station (client for Synology NAS)](https://chrome.google.com/webstore/detail/download-station-client-f/ebbdkledlkjpgbbmmopgbnnjmklnkcef)

 <a href="https://chrome.google.com/webstore/detail/download-station-client-f/ebbdkledlkjpgbbmmopgbnnjmklnkcef" target="_blank">
    <img alt="chrome-webstore" src="https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/mPGKYBIR2uCP0ApchDXE.png" />
 </a>


## 📝 License

This project is [MIT](https://github.com/dvcol/synology-download/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
