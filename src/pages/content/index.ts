import { renderContentApp } from './components/render';

renderContentApp()
  .then(() => console.debug('Content script component rendered.'))
  .catch(err => console.error('Content script component failed to rendered.', err));
