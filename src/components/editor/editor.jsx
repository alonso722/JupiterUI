'use client';
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
  const effectMounted = useRef(false);
  const [width, setWidth] = useState(window.innerWidth);

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
}

  useEffect(() => {
    let editorInstance = null;
    if(effectMounted.current === false ){
    const initializeEditor = async () => {
      try {
        if (!editorRef.current) return;

        editorInstance = await new EditorJS({
          holder: editorRef.current,
          data: initialData,
          // onChange: async () => {
          //   let content = await editorInstance.saver.save();

          //   console.log(content);
          // },
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
  console.log(width)
  console.log('TextEditor montado');

  return (
    <>
    <div ref={editorRef} className=" h-[700px] w-[70%]  fixed left-[20%] top-[110px] outline-color-[#FDD500] rounded-lg px-8 py-5  outline outline-1  shadow-2xl shadow-violet-950"
      style={{          
      overflowY: 'auto',
      scrollbarWidth: 'thin',
      //scrollbarColor: 'transparent' 
    }}
    >
    </div>
    <div className='left-[20%] top-[840px] fixed outline-2 outline-offset-2 '>
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
