import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { autocompletion } from '@codemirror/autocomplete';

interface CodeMirrorEditorProps {
  value: string;
  onChange?: (nextValue: string) => void;
  onRunShortcut?: () => void;
  readOnly?: boolean;
  minHeight?: string;
  fontSize?: number;
  ariaLabel?: string;
}

export function CodeMirrorEditor({
  value,
  onChange,
  onRunShortcut,
  readOnly = false,
  minHeight = '260px',
  fontSize = 14,
  ariaLabel = 'محرر شيفرة بايتون',
}: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRunShortcut);

  onChangeRef.current = onChange;
  onRunRef.current = onRunShortcut;

  useEffect(() => {
    if (!containerRef.current) return;

    const customTheme = EditorView.theme({
      '&': {
        backgroundColor: '#0D0D14',
        color: '#F4F4F8',
        fontSize: `${fontSize}px`,
        minHeight,
        direction: 'ltr',
        textAlign: 'left',
      },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        lineHeight: '1.6',
      },
      '.cm-gutters': {
        backgroundColor: '#13131F',
        color: '#6E6E8A',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      },
      '.cm-activeLineGutter': {
        backgroundColor: '#272338',
        color: '#E4E4F0',
      },
      '.cm-activeLine': {
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
      },
      '&.cm-focused': {
        outline: 'none',
      },
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        python(),
        oneDark,
        autocompletion(),
        customTheme,
        EditorState.readOnly.of(readOnly),
        EditorView.contentAttributes.of({ 'aria-label': ariaLabel }),
        keymap.of([
          {
            key: 'Mod-Enter',
            run: () => {
              onRunRef.current?.();
              return true;
            },
          },
          indentWithTab,
          ...defaultKeymap,
          ...historyKeymap,
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current?.(update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [ariaLabel, fontSize, minHeight, readOnly]);

  // Sync external programmatic value changes (e.g., loading an example or reset)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      data-testid="codemirror-editor"
      className="code-ltr overflow-hidden rounded-xl border border-white/10 bg-[#0D0D14]"
    />
  );
}
