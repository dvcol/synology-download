import { activateDemo } from '@src/pages/web/index';
import { defineComponents } from '@src/pages/web/modules';

defineComponents({ patch: true })
  .then(() => {
    console.info('Web components defined.');
    if (window._synology.mock) {
      activateDemo({
        task: [window._synology.mock.task!],
        download: [window._synology.mock.download!],
      });
    }
  })
  .catch(err => console.error('Web components failed to define.', err));

if (module.hot) module.hot.accept();
