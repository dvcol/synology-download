import { wrapStore } from 'webext-redux';
import { store } from '../../store';

console.log('This is the background page.');
console.log('Put the background scripts here.');

wrapStore(store);
