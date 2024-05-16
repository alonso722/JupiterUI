import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import { Button } from '../form/button';
import { colors } from '../types/enums/colors';
import { EDITOR_JS_TOOLS } from './constants';

export default function TextEditor() {
  const editorRef = useRef(null);
  const saveDocumentRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const effectMounted = useRef(false);

  const initialData =  {
    "time": new Date().getTime(),
    "blocks": [
      {
        "type": "header",
        "data": {
          "text": "Editor de texto listo!",
          "level": 1
        }
      },
    ]
  };

  useEffect(() => {
    let editorInstance = null;
    if (effectMounted.current === false ){
      const initializeEditor = async () => {
        try {
          if (!editorRef.current) return;

          editorInstance = await new EditorJS({
            holder: editorRef.current,
            data: initialData,
            tools: EDITOR_JS_TOOLS,
          });
        } catch (error) {
          console.error('Error initializing editor:', error);
        }
      };

      initializeEditor();

      saveDocumentRef.current = () => {
        console.log('Clic:')
        editorInstance.save().then((outputData)=>{
          console.log('Article data:', outputData)
        })
      }

      setMounted(true);
      
      return () => {
        if (editorInstance) {
          editorInstance.destroy();
        }
        effectMounted.current=true;
      };
    }
  }, []);

  console.log('TextEditor montado');

  return (
    <>
      <div ref={editorRef} className="h-[700px] w-[70%] fixed left-[20%] top-[110px] outline-color-[#FDD500] rounded-lg px-8 py-5 outline outline-1 shadow-2xl shadow-violet-950" style={{ overflowY: 'auto', scrollbarWidth: 'thin' }}></div>
      <div className='left-[20%] top-[840px] fixed outline-2 outline-offset-2 '>
        <Button rounded type="submit" onClick={() => saveDocumentRef.current()} color={colors.ALTERNATIVE}>
          Guardar
        </Button>
      </div>
    </>
  );
}
