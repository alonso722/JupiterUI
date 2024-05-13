import { colors } from '../types/enums/colors';
import { Button } from '../form/button';
import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Embed from '@editorjs/embed'
import Table from '@editorjs/table'
import List from '@editorjs/list'
import Warning from '@editorjs/warning'
import Code from '@editorjs/code'
import LinkTool from '@editorjs/link'
import Image from '@editorjs/image'
import Raw from '@editorjs/raw'
import Header from '@editorjs/header'
import Quote from '@editorjs/quote'
import Marker from '@editorjs/marker'
import CheckList from '@editorjs/checklist'
import Delimiter from '@editorjs/delimiter'
import InlineCode from '@editorjs/inline-code'
import SimpleImage from '@editorjs/simple-image'
import { EDITOR_JS_TOOLS } from './constants'

export default function TextEditor() {
  const editorRef = useRef(null);
  const saveDocumentRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;

    let editorInstance = null;

    const initializeEditor = async () => {
      try {
        if (!editorRef.current) return;

        editorInstance = await new EditorJS({
          holder: editorRef.current,
          tools: {
            header: {
              class: Header,
            },
            table: {
              class: Table,
            },
            image: {
              class: Image,
            },
            checkList: {
              class: CheckList,
            },
            embed: {
              class: Embed,
            },
            delimiter: {
              class: Delimiter,
            },
            quote: {
              class: Quote,
            },
            linkTool: {
              class: LinkTool,
            },
            code: {
              class: Code,
            },
            list: {
              class: List,
            }
          }
        });
      } catch (error) {
        console.error('Error initializing editor:', error);
      }
    };

    initializeEditor();

    // Asignar la función a saveDocumentRef.current
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
    };
  }, [mounted]);

  // Log para ver cuántas veces se monta el componente
  console.log('TextEditor montado');

  return (
    <>
    <div ref={editorRef} className=" h-[700px] w-[1506px] fixed left-[300px] top-[110px] outline-color-[#FDD500] rounded-lg p-5  outline outline-1  shadow-2xl shadow-violet-950"
    style={{width: '1306px',
    height: '700px',
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    //scrollbarColor: '#FDD500 transparent' 
  }}>
      Texto
    </div>
    <div className='left-[350px] top-[840px] fixed outline-2 outline-offset-2'>
      <Button
        rounded
        type="submit" 
        onClick={() => saveDocumentRef.current()}
        color={colors.ALTERNATIVE}>
        Guardar
      </Button>
    </div>
    </>
  );
}
