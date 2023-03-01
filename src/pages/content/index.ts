import { renderContentApp } from './components/render';
import { addAnchorClickListener } from './modules/anchor.handler';

console.debug('Content script injected.');

addAnchorClickListener();
renderContentApp();
