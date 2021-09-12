/**
 * Options for saved context Menus
 */
export interface ContextMenuOption {
    id: string,
    title: string,
    contexts: string[]
}

export const defaultMenu: ContextMenuOption = {
    id: 'open',
    title: 'Download with Synology Diskstation',
    contexts: ['link', 'audio', 'video', 'image', 'selection']
}
