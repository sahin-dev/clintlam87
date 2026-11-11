import { useRef, useState } from 'react';
import { FileUpIcon } from 'lucide-react';
import { ACCEPT_ATTR, MAX_FILE_MB, MAX_FILES } from '../../utils/upload';

/**
 * Drag-and-drop target for construction drawings, backed by a real file input
 * so keyboard and screen-reader users get the same path as a drag.
 */
export function DrawingDropzone({
  onFiles,
  disabled = false,
  remaining





}: {onFiles: (files: FileList | File[]) => void;disabled?: boolean; /** Files still allowed in this plan set. */remaining?: number;}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const full = typeof remaining === 'number' && remaining <= 0;
  const blocked = disabled || full;

  return (
    <div
      onDragOver={(e) => {
        if (blocked) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        if (blocked) return;
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer?.files?.length) onFiles(e.dataTransfer.files);
      }}>
      
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTR}
        className="sr-only"
        disabled={blocked}
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = '';
        }} />
      
      <button
        type="button"
        disabled={blocked}
        onClick={() => inputRef.current?.click()}
        className={`flex w-full flex-col items-center rounded-2xl border-2 border-dashed px-4 py-9 text-center transition-colors duration-150 ease-smooth ${
        blocked ?
        'cursor-not-allowed border-ink-100 bg-ink-50/60' :
        dragging ?
        'border-brand-500 bg-brand-50/60' :
        'border-ink-200 bg-ink-50/60 hover:border-brand-300 hover:bg-brand-50/40'}`
        }>
        
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          dragging ? 'bg-brand-500 text-white' : 'bg-white text-brand-600'}`
          }>
          
          <FileUpIcon className="h-5 w-5" />
        </span>
        <span className="mt-3 text-[14.5px] font-bold text-ink-900">
          {full ? `Limit of ${MAX_FILES} files reached` : dragging ? 'Drop drawings to add them' : 'Drag drawings here or browse'}
        </span>
        <span className="mt-1 text-[12px] text-ink-400">
          PDF plan sets, DWG/DXF, or scanned sheets · up to {MAX_FILE_MB} MB each
        </span>
        {typeof remaining === 'number' && !full &&
        <span className="mt-2.5 text-[11.5px] font-semibold text-ink-400">{remaining} more allowed</span>
        }
      </button>
    </div>);

}