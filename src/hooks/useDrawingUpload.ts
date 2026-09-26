import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DrawingKind,
  Inspection,
  MAX_FILES,
  formatMb,
  inspectDrawing,
  kindOf,
  toMb } from
'../utils/upload';

export type DrawingStatus = 'reading' | 'invalid' | 'ready' | 'uploading' | 'uploaded' | 'canceled';

export interface DrawingUpload {
  id: string;
  file: File;
  name: string;
  sizeMb: number;
  kind: DrawingKind;
  status: DrawingStatus;
  /** 0–100 while transferring. */
  progress: number;
  sheets: number;
  previewUrl?: string;
  dimensions?: string;
  error?: string;
  warning?: string;
}

let seq = 0;

/**
 * Owns the drawing-upload queue for a plan set: reads each file to count sheets
 * and catch unreadable, protected or low-resolution drawings, then transfers the
 * valid ones with per-file progress, cancel and retry.
 */
export function useDrawingUpload() {
  const [files, setFiles] = useState<DrawingUpload[]>([]);
  const filesRef = useRef<DrawingUpload[]>([]);
  const timers = useRef<Record<string, number>>({});

  const commit = useCallback((next: DrawingUpload[]) => {
    filesRef.current = next;
    setFiles(next);
  }, []);

  const patch = useCallback(
    (id: string, next: Partial<DrawingUpload>) => {
      commit(filesRef.current.map((f) => f.id === id ? { ...f, ...next } : f));
    },
    [commit]
  );

  const clearTimer = useCallback((id: string) => {
    if (timers.current[id]) {
      window.clearInterval(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  useEffect(
    () => () => {
      Object.values(timers.current).forEach(window.clearInterval);
      timers.current = {};
      filesRef.current.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    },
    []
  );

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      if (list.length === 0) return;

      const current = filesRef.current;
      const room = Math.max(0, MAX_FILES - current.length);
      const accepted: DrawingUpload[] = [];

      for (const file of list.slice(0, room)) {
        const seen = [...current, ...accepted].some(
          (f) => f.name === file.name && f.file.size === file.size
        );
        if (seen) continue;
        accepted.push({
          id: `up-${++seq}`,
          file,
          name: file.name,
          sizeMb: toMb(file.size),
          kind: kindOf(file.name) ?? 'pdf',
          status: 'reading',
          progress: 0,
          sheets: 0
        });
      }

      if (accepted.length === 0) return;
      commit([...current, ...accepted]);

      accepted.forEach((entry) => {
        inspectDrawing(entry.file).
        then((result: Inspection) => {
          patch(entry.id, {
            status: result.error ? 'invalid' : 'ready',
            sheets: result.sheets,
            previewUrl: result.previewUrl,
            dimensions: result.dimensions,
            error: result.error,
            warning: result.warning
          });
        }).
        catch(() => {
          patch(entry.id, { status: 'invalid', error: 'This file could not be read.' });
        });
      });
    },
    [commit, patch]
  );

  const remove = useCallback(
    (id: string) => {
      clearTimer(id);
      const target = filesRef.current.find((f) => f.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      commit(filesRef.current.filter((f) => f.id !== id));
    },
    [clearTimer, commit]
  );

  const clear = useCallback(() => {
    Object.keys(timers.current).forEach(clearTimer);
    filesRef.current.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    commit([]);
  }, [clearTimer, commit]);

  /** Transfers one file, stepping slower for larger drawings. */
  const transfer = useCallback(
    (id: string) => {
      clearTimer(id);
      patch(id, { status: 'uploading', progress: 0, error: undefined });
      timers.current[id] = window.setInterval(() => {
        const target = filesRef.current.find((f) => f.id === id);
        if (!target || target.status !== 'uploading') {
          clearTimer(id);
          return;
        }
        const step = Math.max(3, 22 - Math.min(18, target.sizeMb / 4));
        const next = target.progress + step;
        if (next >= 100) {
          clearTimer(id);
          patch(id, { progress: 100, status: 'uploaded' });
          return;
        }
        patch(id, { progress: next });
      }, 110);
    },
    [clearTimer, patch]
  );

  const startUpload = useCallback(() => {
    filesRef.current.
    filter((f) => f.status === 'ready' || f.status === 'canceled').
    forEach((f) => transfer(f.id));
  }, [transfer]);

  const cancel = useCallback(
    (id: string) => {
      clearTimer(id);
      patch(id, { status: 'canceled', progress: 0 });
    },
    [clearTimer, patch]
  );

  const totals = useMemo(() => {
    const valid = files.filter((f) => f.status !== 'invalid');
    const inFlight = files.filter((f) => f.status === 'uploading' || f.status === 'uploaded');
    const uploaded = files.filter((f) => f.status === 'uploaded').length;

    return {
      count: valid.length,
      sheets: valid.reduce((sum, f) => sum + f.sheets, 0),
      sizeMb: valid.reduce((sum, f) => sum + f.sizeMb, 0),
      sizeLabel: formatMb(valid.reduce((sum, f) => sum + f.sizeMb, 0)),
      uploaded,
      uploading: files.some((f) => f.status === 'uploading'),
      reading: files.some((f) => f.status === 'reading'),
      invalid: files.filter((f) => f.status === 'invalid').length,
      warnings: valid.filter((f) => f.warning).length,
      transferable: files.filter((f) => f.status === 'ready' || f.status === 'canceled').length,
      progress: inFlight.length ?
      Math.round(inFlight.reduce((sum, f) => sum + f.progress, 0) / inFlight.length) :
      0,
      /** Every valid file finished transferring. */
      complete: valid.length > 0 && uploaded === valid.length
    };
  }, [files]);

  return { files, addFiles, remove, clear, cancel, retry: transfer, startUpload, totals };
}