import {
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  File as FileGeneric,
  type LucideIcon,
} from 'lucide-react'

export function getFileIcon(mimeType: string): LucideIcon {
  if (mimeType.startsWith('image/')) return FileImage
  if (mimeType.startsWith('video/')) return FileVideo
  if (mimeType.startsWith('audio/')) return FileAudio
  if (mimeType === 'application/pdf') return FileText
  if (
    mimeType.includes('spreadsheet') ||
    mimeType === 'text/csv' ||
    mimeType.includes('excel')
  ) {
    return FileSpreadsheet
  }
  if (
    mimeType.startsWith('text/') ||
    mimeType.includes('json') ||
    mimeType.includes('javascript')
  ) {
    return FileCode
  }
  if (
    mimeType.includes('zip') ||
    mimeType.includes('rar') ||
    mimeType.includes('tar') ||
    mimeType.includes('7z')
  ) {
    return FileArchive
  }
  return FileGeneric
}
