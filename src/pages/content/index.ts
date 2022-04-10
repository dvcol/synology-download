import { renderContentApp } from './components/render';
import { addAnchorClickListener } from './modules/anchor';

console.debug('Content script injected.');

addAnchorClickListener();
renderContentApp();
