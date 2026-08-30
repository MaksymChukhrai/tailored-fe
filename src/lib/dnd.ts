export const DRAG_MIME_TYPE = 'application/x-dataroom-item'

export type DraggedItem =
  | { kind: 'folder'; id: string; currentParentId: string | null }
  | { kind: 'file'; id: string; currentParentId: string | null }
