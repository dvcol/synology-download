import { activateDemo } from '@src/pages/web/mocks';
import { defineComponents } from '@src/pages/web/modules';

defineComponents({ patch: true })
  .then(() => {
    console.info('Web components defined.');
    if (window._synology.mock?.task) {
      activateDemo(window._synology.mock.task);
    }
  })
  .catch(err => console.error('Web components failed to define.', err));

if (module.hot) module.hot.accept();
