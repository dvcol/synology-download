import { ContextMenuOption } from './context-menu.model';

/**
 * Enumeration for message types
 */
export enum ChromeMessageType {
  createTask = 'createTask',
  popup = 'popup',
  addMenu = 'addMenu',
  removeMenu = 'removeMenu',
}

/**
 * Payload for Task creation
 */
export interface CreateTaskPayload {
  uri: string;
  source: string;
}

/**
 * Type union of possible message payloads
 */
export type ChromeMessagePayload = string | ContextMenuOption | CreateTaskPayload;

/**
 * Message interface for communication between content & background
 */
export interface ChromeMessage {
  type: ChromeMessageType;
  payload?: ChromeMessagePayload;
}
