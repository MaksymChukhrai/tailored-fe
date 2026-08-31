export type ShareMode = "PUBLIC_LINK" | "PERMISSIONED";
export type ShareRole = "VIEWER" | "EDITOR";

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface DataRoomSummary {
  id: string;
  name: string;
  ownerId: string;
  totalSize: string | number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FolderNode {
  id: string;
  name: string;
  dataRoomId: string;
  parentId: string | null;
  path: string;
  totalSize: string | number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FileNode {
  id: string;
  name: string;
  mimeType: string;
  size: string | number;
  storageKey: string;
  dataRoomId: string;
  folderId: string | null;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
}
export interface FileSearchResult extends FileNode {
  dataRoomName: string;
  folderName: string | null;
}
export interface FileSearchResult extends FileNode {
  dataRoomName: string;
  folderName: string | null;
}
export interface Breadcrumb {
  id: string;
  name: string;
}

export interface DataRoomRootContents {
  dataRoom: DataRoomSummary;
  subfolders: FolderNode[];
  files: FileNode[];
}

export interface FolderContents {
  folder: FolderNode;
  breadcrumbs: Breadcrumb[];
  subfolders: FolderNode[];
  files: FileNode[];
}

export interface FolderDeletePreview {
  folderCount: number;
  fileCount: number;
  totalSize: string | number;
}

export interface ShareGrantee {
  shareId: string;
  userId: string;
  user: {
    id: string;
    email: string;
  };
}

export interface Share {
  id: string;
  mode: ShareMode;
  token: string;
  role: ShareRole;
  dataRoomId: string | null;
  folderId: string | null;
  fileId: string | null;
  grantedById: string;
  revokedAt: string | null;
  createdAt: string;
  grantees?: ShareGrantee[];
}

export type ShareTargetType = "dataRoom" | "folder" | "file";

export interface ShareTarget {
  type: ShareTargetType;
  id: string;
  ownerId: string;
}

export type ResolvedShareContent =
  | { type: "dataRoom"; rootContents: DataRoomRootContents }
  | { type: "folder"; contents: FolderContents }
  | { type: "file"; downloadUrl: string };

export interface ResolvedShare {
  share: Share;
  target: ShareTarget;
  content: ResolvedShareContent;
}

export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}
