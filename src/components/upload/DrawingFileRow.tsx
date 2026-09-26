import React from 'react';
import {
  AlertTriangleIcon,
  CheckIcon,
  FileTextIcon,
  ImageIcon,
  PenToolIcon,
  RotateCcwIcon,
  XIcon } from
'lucide-react';
import { Progress } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DrawingUpload } from '../../hooks/useDrawingUpload';
import { formatMb } from '../../utils/upload';

const KIND_ICON = { pdf: FileTextIcon, cad: PenToolIcon, image: ImageIcon };

/** One queued drawing: what it contains, how it transferred, and how to fix it. */
export function DrawingFileRow({
  upload,
  onRemove,
  onCancel,
  onRetry





}: {upload: DrawingUpload;onRemove: () => void;onCancel: () => void;onRetry: () => void;}) {
  const Icon = KIND_ICON[upload.kind];
  const invalid = upload.status === 'invalid';

  return (
    <li className="flex items-start gap-3 px-4 py-3.5">
      <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink-100 bg-ink-50">
        {upload.previewUrl ?
        <img src={upload.previewUrl} alt="" aria-hidden className="h-full w-full object-cover" /> :

        <Icon className={`h-[18px] w-[18px] ${invalid ? 'text-danger-600' : 'text-ink-400'}`} />
        }
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 truncate text-[13.5px] font-semibold text-ink-900">{upload.name}</p>
          <span className="shrink-0">
            {upload.status === 'reading' && <Badge tone="neutral">Reading</Badge>}
            {upload.status === 'ready' && <Badge tone="info">Ready</Badge>}
            {upload.status === 'uploading' && <Badge tone="brand">{Math.round(upload.progress)}%</Badge>}
            {upload.status === 'uploaded' &&
            <Badge tone="positive">
                <CheckIcon className="mr-1 inline h-3 w-3" strokeWidth={3} />
                Uploaded
              </Badge>
            }
            {upload.status === 'canceled' && <Badge tone="caution">Canceled</Badge>}
            {invalid && <Badge tone="danger">Rejected</Badge>}
          </span>
        </div>

        <p className="tabular mt-0.5 text-[11.5px] text-ink-400">
          {invalid ?
          formatMb(upload.sizeMb) :
          [
          upload.sheets > 0 && `${upload.sheets} ${upload.sheets === 1 ? 'sheet' : 'sheets'}`,
          formatMb(upload.sizeMb),
          upload.dimensions].

          filter(Boolean).
          join(' · ')}
        </p>

        {upload.status === 'uploading' && <Progress value={upload.progress} className="mt-2.5" />}

        {upload.error &&
        <p className="mt-1.5 flex items-start gap-1.5 text-[12px] font-medium text-danger-600">
            <AlertTriangleIcon className="mt-px h-3.5 w-3.5 shrink-0" />
            {upload.error}
          </p>
        }
        {!upload.error && upload.warning &&
        <p className="mt-1.5 flex items-start gap-1.5 text-[12px] font-medium text-caution-700">
            <AlertTriangleIcon className="mt-px h-3.5 w-3.5 shrink-0" />
            {upload.warning}
          </p>
        }
      </div>

      <div className="mt-0.5 flex shrink-0 items-center gap-1">
        {upload.status === 'canceled' &&
        <button
          onClick={onRetry}
          aria-label={`Retry ${upload.name}`}
          className="rounded-lg p-1.5 text-ink-400 transition-colors duration-150 ease-smooth hover:bg-ink-50 hover:text-brand-600">
          
            <RotateCcwIcon className="h-4 w-4" />
          </button>
        }
        {upload.status === 'uploading' ?
        <button
          onClick={onCancel}
          className="rounded-lg px-2 py-1 text-[12px] font-semibold text-ink-400 transition-colors duration-150 ease-smooth hover:text-danger-600">
          
            Cancel
          </button> :

        <button
          onClick={onRemove}
          aria-label={`Remove ${upload.name}`}
          className="rounded-lg p-1.5 text-ink-400 transition-colors duration-150 ease-smooth hover:bg-ink-50 hover:text-danger-600">
          
            <XIcon className="h-4 w-4" />
          </button>
        }
      </div>
    </li>);

}