import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Icon } from './icons';
import { imageFilesFrom, useSendFiles } from '../lib/incoming';
import { toolForPath } from '../lib/tools';

// Drop or paste images anywhere on the site. On a tool page they load into that tool; anywhere
// else they open the home page picker, which suggests what to do with them. The files are only
// passed around in memory; nothing is uploaded.
export default function GlobalDrop() {
  const send = useSendFiles();
  const { pathname } = useLocation();
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);

  const tool = toolForPath(pathname);
  const target = tool ? pathname : '/';

  // Listeners are registered once; read the latest routing through refs.
  const sendRef = useRef(send);
  const targetRef = useRef(target);
  sendRef.current = send;
  targetRef.current = target;

  useEffect(() => {
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files');

    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth.current += 1;
      setDragging(true);
    };
    const onOver = (e: DragEvent) => {
      // Without this the browser would open the file in the tab instead of dropping it here.
      if (hasFiles(e)) e.preventDefault();
    };
    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDragging(false);
    };
    const onDrop = (e: DragEvent) => {
      depth.current = 0;
      setDragging(false);
      // An upload box on the page already took these (it calls preventDefault).
      if (!hasFiles(e) || e.defaultPrevented) return;
      e.preventDefault();
      const files = imageFilesFrom(e.dataTransfer?.files);
      if (files.length) sendRef.current(files, targetRef.current);
    };
    const onPaste = (e: ClipboardEvent) => {
      const files = imageFilesFrom(e.clipboardData?.files);
      if (!files.length) return;
      e.preventDefault();
      sendRef.current(files, targetRef.current);
    };

    window.addEventListener('dragenter', onEnter);
    window.addEventListener('dragover', onOver);
    window.addEventListener('dragleave', onLeave);
    window.addEventListener('drop', onDrop);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('dragenter', onEnter);
      window.removeEventListener('dragover', onOver);
      window.removeEventListener('dragleave', onLeave);
      window.removeEventListener('drop', onDrop);
      window.removeEventListener('paste', onPaste);
    };
  }, []);

  if (!dragging) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] animate-fade-in bg-app/85 backdrop-blur-md" aria-hidden>
      <div className="absolute inset-3 grid place-items-center rounded-[28px] border-2 border-dashed border-fg/30 sm:inset-5">
        <div className="animate-scale-in text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-pop text-pop-fg shadow-lift">
            <Icon name={tool ? tool.icon : 'upload'} className="h-7 w-7" />
          </span>
          <p className="display text-display-sm mt-6">
            {tool ? (
              <>
                Drop to open in <span className="serif-accent">{tool.title}</span>
              </>
            ) : (
              <>
                Drop it. <span className="serif-accent">We&rsquo;ll suggest the rest.</span>
              </>
            )}
          </p>
          <p className="mt-3 text-[15px] text-muted">Stays on your device. Nothing is uploaded.</p>
        </div>
      </div>
    </div>
  );
}
