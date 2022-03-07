# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
