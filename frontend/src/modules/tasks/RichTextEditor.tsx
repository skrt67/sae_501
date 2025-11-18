import { useMemo, useRef } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  style?: React.CSSProperties
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Décrivez la tâche...', 
  readOnly = false,
  style 
}: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null)

  const modules = useMemo(() => ({
    toolbar: readOnly ? false : [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  }), [readOnly])

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link', 'blockquote', 'code-block'
  ]

  return (
    <div 
      style={style}
      className="rich-text-editor-wrapper"
    >
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{
          background: readOnly ? 'transparent' : '#ffffff',
          borderRadius: '8px'
        }}
      />
      
      <style>{`
        /* Personnalisation du style Quill */
        .rich-text-editor-wrapper .ql-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 14px;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
        
        .rich-text-editor-wrapper .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          background: #fafafa;
          border-color: rgba(0, 0, 0, 0.15) !important;
        }
        
        .rich-text-editor-wrapper .ql-container {
          border-color: rgba(0, 0, 0, 0.15) !important;
          min-height: 150px;
        }
        
        .rich-text-editor-wrapper .ql-editor {
          min-height: 150px;
          padding: 16px;
          line-height: 1.6;
        }
        
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: rgba(0, 0, 0, 0.45);
          font-style: normal;
        }
        
        /* Focus state */
        .rich-text-editor-wrapper .ql-container.ql-snow:focus-within {
          border-color: #1890ff !important;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
        }
        
        .rich-text-editor-wrapper .ql-toolbar.ql-snow:has(+ .ql-container:focus-within) {
          border-color: #1890ff !important;
        }
        
        /* Boutons de la toolbar */
        .rich-text-editor-wrapper .ql-toolbar button {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .rich-text-editor-wrapper .ql-toolbar button:hover {
          background: rgba(0, 0, 0, 0.06);
        }
        
        .rich-text-editor-wrapper .ql-toolbar button.ql-active {
          background: rgba(24, 144, 255, 0.1);
          color: #1890ff;
        }
        
        .rich-text-editor-wrapper .ql-toolbar .ql-stroke {
          stroke: rgba(0, 0, 0, 0.65);
        }
        
        .rich-text-editor-wrapper .ql-toolbar .ql-fill {
          fill: rgba(0, 0, 0, 0.65);
        }
        
        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-stroke {
          stroke: #1890ff;
        }
        
        .rich-text-editor-wrapper .ql-toolbar button:hover .ql-fill {
          fill: #1890ff;
        }
        
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #1890ff;
        }
        
        .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #1890ff;
        }
        
        /* Dropdowns */
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-label {
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .rich-text-editor-wrapper .ql-toolbar .ql-picker-label:hover {
          background: rgba(0, 0, 0, 0.06);
        }
        
        /* Contenu formaté */
        .rich-text-editor-wrapper .ql-editor h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 16px 0 12px 0;
          color: #1a1a1a;
        }
        
        .rich-text-editor-wrapper .ql-editor h2 {
          font-size: 22px;
          font-weight: 600;
          margin: 14px 0 10px 0;
          color: #1a1a1a;
        }
        
        .rich-text-editor-wrapper .ql-editor h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 12px 0 8px 0;
          color: #1a1a1a;
        }
        
        .rich-text-editor-wrapper .ql-editor p {
          margin: 8px 0;
          color: rgba(0, 0, 0, 0.85);
        }
        
        .rich-text-editor-wrapper .ql-editor ul, 
        .rich-text-editor-wrapper .ql-editor ol {
          padding-left: 24px;
          margin: 8px 0;
        }
        
        .rich-text-editor-wrapper .ql-editor li {
          margin: 4px 0;
          color: rgba(0, 0, 0, 0.85);
        }
        
        .rich-text-editor-wrapper .ql-editor a {
          color: #1890ff;
          text-decoration: none;
          border-bottom: 1px solid rgba(24, 144, 255, 0.3);
          transition: all 0.2s;
        }
        
        .rich-text-editor-wrapper .ql-editor a:hover {
          border-bottom-color: #1890ff;
        }
        
        .rich-text-editor-wrapper .ql-editor strong {
          font-weight: 600;
          color: #1a1a1a;
        }
        
        .rich-text-editor-wrapper .ql-editor em {
          font-style: italic;
        }
        
        .rich-text-editor-wrapper .ql-editor blockquote {
          border-left: 4px solid #1890ff;
          padding-left: 16px;
          margin: 12px 0;
          color: rgba(0, 0, 0, 0.65);
          font-style: italic;
        }
        
        .rich-text-editor-wrapper .ql-editor pre.ql-syntax {
          background: #f5f5f5;
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          padding: 12px;
          margin: 12px 0;
          overflow-x: auto;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          line-height: 1.5;
        }
        
        /* Mode lecture seule */
        .rich-text-editor-wrapper .ql-container.ql-disabled .ql-editor {
          padding: 0;
        }
        
        .rich-text-editor-wrapper .ql-toolbar.ql-disabled {
          display: none;
        }
        
        /* Accessibilité */
        .rich-text-editor-wrapper .ql-editor:focus {
          outline: none;
        }
        
        .rich-text-editor-wrapper .ql-toolbar button:focus-visible {
          outline: 2px solid #1890ff;
          outline-offset: 2px;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .rich-text-editor-wrapper .ql-toolbar {
            padding: 8px;
          }
          
          .rich-text-editor-wrapper .ql-toolbar button {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  )
}


