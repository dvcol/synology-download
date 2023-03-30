import { AppInstance, ServiceInstance } from '@src/models';
import { ContentAppWc } from '@src/pages/content/components/content-app-wc';
import { clickListener$, listenToScrapEvents } from '@src/pages/content/modules';
import { LoggerService, NotificationService, QueryService } from '@src/services';
import { storeProxy } from '@src/store';
import { getManifest, portConnect } from '@src/utils';

const { name, version } = getManifest();
const injection = new Date().toISOString();

LoggerService.debug('Content script injected.', { name, version, injection });

const rootContainerId = `${AppInstance.content}-root`;
const onDestroyEvent = 'onDestroy';
const destroyedEvent = 'destroyed';

/**
 * Emits 'onDestroy' event on component and await 'destroyed 'callback before resolving
 * @param el the element on which to call 'onDestroy'
 */
const waitDestroyed = (el: Element): Promise<void> => {
  let resolve: () => void;
  const promise = new Promise<void>(_resolve => {
    resolve = () => _resolve();
  });
  el.addEventListener(destroyedEvent, () => resolve());
  el.dispatchEvent(new CustomEvent(onDestroyEvent));
  el.parentElement?.removeChild(el);
  return promise;
};

/**
 * Remove old instances of the component and trigger destroy lifecycle
 */
export const removeOldInstances = (): Promise<void | void[]> => {
  const previous = document.body?.querySelectorAll(`#${rootContainerId}`);
  if (previous?.length) {
    LoggerService.debug(`Found exiting instance of '${rootContainerId}'`, previous);
    return Promise.all([...previous]?.map(el => waitDestroyed(el)));
  }
  return Promise.resolve();
};

/**
 * Subscribe to magnet link clicks and scrapping events and unsubscribe on destroy
 * @param root the root element to watch for destroy cycle
 */
const listenUntilDestroy = (root: HTMLElement) => {
  // Attach click listener
  const clicks = clickListener$.subscribe();
  const scraps = listenToScrapEvents().subscribe();

  // remove it when destroying
  root.addEventListener(onDestroyEvent, () => {
    LoggerService.debug(`Unsubscribing to events from '${rootContainerId}'.`, { version, injection });
    clicks.unsubscribe();
    scraps.unsubscribe();
    root.dispatchEvent(new CustomEvent(destroyedEvent));
  });
};

/**
 * TODO: Remove if/when persistent MV3 service worker are introduced
 *
 * Refresh connection port to service worker to keep it alive
 * @see https://bugs.chromium.org/p/chromium/issues/detail?id=1152255
 * @see https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
 */
const connect = () => {
  LoggerService.debug(`connecting ${AppInstance.content}`);
  portConnect({ name: AppInstance.content }).onDisconnect.addListener(connect);
};

/**
 * Open a modal popup for custom download actions
 */
export const injectContentApp = async (): Promise<void> => {
  // if page is not a valid html document with body, skip injection
  if (!document.body) return;

  // init store
  await storeProxy.ready();

  // Pass store to services and init
  LoggerService.init(storeProxy, ServiceInstance.Content, true);
  QueryService.init(storeProxy, ServiceInstance.Content, true);
  NotificationService.init(storeProxy, ServiceInstance.Content, true);

  // purging old instances
  await removeOldInstances();

  // Create a root element to host app
  const root = document.createElement(AppInstance.content);
  root.id = rootContainerId;
  root.dataset.version = version;
  root.dataset.injection = injection;
  root.dataset.context = 'content-script';
  root.style.all = 'initial';
  document.body.appendChild(root);

  // attach listeners
  listenUntilDestroy(root);

  // Register as open
  connect();

  // render component
  return ContentAppWc.prototype.render(root, storeProxy);
};
