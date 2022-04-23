# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.14.2](https://github.com/dvcol/synology-download/compare/v1.14.0...v1.14.2) (2022-04-16)

### Bug Fixes

* **github:** : updates sponsor links

## [1.14.0](https://github.com/dvcol/synology-download/compare/v1.13.4...v1.14.0) (2022-04-14)


### Features

* **popup:** adds optional navbar shortcut buttons. [#102](https://github.com/dvcol/synology-download/issues/102) ([6ccc39c](https://github.com/dvcol/synology-download/commit/6ccc39ced61aa4f3a6b9072b07f720ab81e8ad4f))


### Bug Fixes

* **build:** fixes typing following chrome types version bump ([59df047](https://github.com/dvcol/synology-download/commit/59df047137f040a7019edf730e5781a3181cb665))
* **lint:** fixes cyclic import issues ([4862669](https://github.com/dvcol/synology-download/commit/4862669353bef4faec129d7aaaa85797bc123db4))
* **tests:** fix tests (because of esm module breaking jest) ([31105c3](https://github.com/dvcol/synology-download/commit/31105c3456ecece158ea973ad5edb6f91cf7d8d9))

### [1.13.4](https://github.com/dvcol/synology-download/compare/v1.13.3...v1.13.4) (2022-03-25)


### Bug Fixes

* **connection:** fixes info fetching in credentials for for DSM7+ ([82fb8cb](https://github.com/dvcol/synology-download/commit/82fb8cbfe7bf2fe7c5f0cce2a4d5f035c0388741))

### [1.13.3](https://github.com/dvcol/synology-download/compare/v1.13.2...v1.13.3) (2022-03-25)


### Features

* **ci:** adds husky and commitlint to enforce conventional commits ([bfa1110](https://github.com/dvcol/synology-download/commit/bfa11104b8d069156e9742174505d92d59f8ba29))


### Bug Fixes

* **auth:** adds auto-login toggle in connection settings ([7e1f1b1](https://github.com/dvcol/synology-download/commit/7e1f1b18044a8819a4a861e169ae6356ab2d0159))

### [1.13.2](https://github.com/dvcol/synology-download/compare/v1.12.1...v1.13.2) (2022-03-20)


### Features

* **explorer:** Add folder renaming & creation ([6e9cf29](https://github.com/dvcol/synology-download/commit/6e9cf2977c1e95be0cb9fb6132fa96ab790e6167))


### Bug Fixes

* **build:** Exits with code 1 when build failure ([6684210](https://github.com/dvcol/synology-download/commit/6684210747fdc416d8b45f931ff7db245377591b))
* **content:** Display error message in-page while not logged ([ab9c471](https://github.com/dvcol/synology-download/commit/ab9c471b5b3413343e500c4951791ba94afd894f))
* **popup:** Add progress sorting to tabs ([e6af186](https://github.com/dvcol/synology-download/commit/e6af186ab3e5296fd6a912ceac2aeb386bc74e0a))
* **popup:** Allow resuming error tasks ([b8c80bb](https://github.com/dvcol/synology-download/commit/b8c80bbff5ae529a9c129bebc4a09453144579b9))
* **service:** Pause all task instead of only active ones ([50cc77a](https://github.com/dvcol/synology-download/commit/50cc77a86bfd85b422921e8a1af44553f9aeaf9f))

### [1.12.1](https://github.com/dvcol/synology-download/compare/v1.9.2...v1.12.1) (2022-03-14)


### Features

* **ci:** Add codeQl setup files ([#54](https://github.com/dvcol/synology-download/issues/54)) ([d7a04dd](https://github.com/dvcol/synology-download/commit/d7a04dd813ddf2f5f7839da325d2f6565cfdab74))
* **ci:** Update workflow names & add dependabot automerge ([28b39df](https://github.com/dvcol/synology-download/commit/28b39df26cd6b8c6ed80b1d82563fa579b020a87))
* **popup:** Add background progress on task cards ([6a2bc24](https://github.com/dvcol/synology-download/commit/6a2bc242a18a96f107683a0b11780ec05610b960))


### Bug Fixes

* **ci:** Add release candidate tag to ci version bumping ([5aa9c48](https://github.com/dvcol/synology-download/commit/5aa9c48d1b3190ca924cf6ca7720f174786b3f21))
* **ci:** Fix release script to ignore rc tags ([fd2452d](https://github.com/dvcol/synology-download/commit/fd2452d0671495e145d66e85a8afd66beb999003))
* **ci:** Prevent concurrent running workflows ([80384a2](https://github.com/dvcol/synology-download/commit/80384a2edc5dc14cf67e3bb114a304fbf18ee1ed))
* **popup:** Fix task detail layout on hover ([3144218](https://github.com/dvcol/synology-download/commit/3144218921af531f1384b752c9569d6de2e14c8c))
* **storage:** Switch logged state from sync to local ([1602e07](https://github.com/dvcol/synology-download/commit/1602e0751c0847c1db96c730d6b50d4f6210d9dc))

### [1.9.2](https://github.com/dvcol/synology-download/compare/v1.9.0...v1.9.2) (2022-03-07)


### Bug Fixes

* **ci:** Fix release pipeline to publish to chrome store ([0d62d1e](https://github.com/dvcol/synology-download/commit/0d62d1e721b563fdc23c8481bcff374e8d3fb499))
* **i18n:** Fix quick-connect translation wording ([892e20c](https://github.com/dvcol/synology-download/commit/892e20cb87ee5098ec460516c8e088e2db522131))

## [1.9.0](https://github.com/dvcol/synology-download/compare/v1.7.2...v1.9.0) (2022-03-07)


### Features

* **connection:** Added alpha support for QuickConnect ([b3b55f4](https://github.com/dvcol/synology-download/commit/b3b55f4d224b82ffa9e25ec1527ede291581fd72))
* **popup:** Add custom settings for loading bar indicator ([#48](https://github.com/dvcol/synology-download/issues/48)) ([0bc4341](https://github.com/dvcol/synology-download/commit/0bc434157ab5a051ec31ed5a954f49e9910ed2e8))


### Bug Fixes

* **service:** Fix missing ready check in credentials ([37e8322](https://github.com/dvcol/synology-download/commit/37e83220dfc46578deb97d59a7ab437018cd8597))
* **store:** Fixes missing nullchecking before destructuring ([#49](https://github.com/dvcol/synology-download/issues/49)) ([f04c666](https://github.com/dvcol/synology-download/commit/f04c666bba66010cc52f86afa2da5da657333b64))

### [1.7.2](https://github.com/dvcol/synology-download/compare/v1.4.0...v1.7.2) (2022-02-25)


### Features

* **ci:** Add Publish to release pipeline ([04621ce](https://github.com/dvcol/synology-download/commit/04621ce357505fdb19e06a4d2ff2fc8c53c2cf8b))
* **popup:** Add about page to extension, linking to helpful information ([#33](https://github.com/dvcol/synology-download/issues/33)) ([04cd20a](https://github.com/dvcol/synology-download/commit/04cd20a6e85c6dca4586e99c7f2308898dbdd9dc))
* **webstore:** Add privacy policy details and change extension name. ([b613b11](https://github.com/dvcol/synology-download/commit/b613b11fabb1a08d3ecc13a0b0136c006d29b051))


### Bug Fixes

* **ci:** Move to maintained github action for publishing ([b5298ab](https://github.com/dvcol/synology-download/commit/b5298abbf98bfdfcdbfb87b2e90c00863b9e81a5))
* **ci:** Split changelog for release and fix publish files ([6950474](https://github.com/dvcol/synology-download/commit/69504742c59052d8eec7d4386d28bd0e684a4851))
* **service:** Migrate from custom observable to rxjs fromFetch API ([a4321f8](https://github.com/dvcol/synology-download/commit/a4321f8624597614a89d89363600acc74b8945bb))
* **Task:** Fix form state successful submit not displaying ([0ecccfe](https://github.com/dvcol/synology-download/commit/0ecccfebc6b32997a71d70743d2dc0f59bb23c6a))
* **Task:** Fix notification not showing in TaskDialog ([1bb4ce3](https://github.com/dvcol/synology-download/commit/1bb4ce3b6fc832aa0480ec8b1d7d155164da2369))

## [1.4.0](https://github.com/dvcol/synology-download/compare/v1.0.0...v1.4.0) (2022-02-24)


### Features

* **ci:** Add changelog to release pipeline ([9f0bc1c](https://github.com/dvcol/synology-download/commit/9f0bc1c8a6a5e1251a9db29b7d02cef482c172cc))
* **ci:** Add ci workflows to reposotory for versionning and test reporting ([#18](https://github.com/dvcol/synology-download/issues/18)) ([58132c9](https://github.com/dvcol/synology-download/commit/58132c9030a8ccb5449abf7d4e647867b6ea10d6))
* **ci:** Add release pipeline  ([f22e375](https://github.com/dvcol/synology-download/commit/f22e37520a6f477298c77d1c041d0940fa53323b))
* **ci:** Upload zipped folder to githug release ([898ae67](https://github.com/dvcol/synology-download/commit/898ae67803add646c930b021072bcd0ce3933d33))


### Bug Fixes

* **ci:** Update manifest.json on version bump ([#30](https://github.com/dvcol/synology-download/issues/30)) ([a8a8fc1](https://github.com/dvcol/synology-download/commit/a8a8fc18fee9ed21ecde0065b41ee66c70386666))
* **ci:** Use standard-version for version bumping in CI ([083e29c](https://github.com/dvcol/synology-download/commit/083e29cca66ed0702cee82aa2f161854daf02263))
