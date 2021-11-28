import { addClickListener, addPopupListener } from './modules';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

addClickListener();
addPopupListener();
