import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import { Button } from '../form/button';
import { colors } from '../types/enums/colors';
import { EDITOR_JS_TOOLS } from './constants'; 

import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import List from '@editorjs/list';
import Warning from '@editorjs/warning';
import Code from '@editorjs/code';
import LinkTool from '@editorjs/link';
import Image from '@editorjs/image';
import Raw from '@editorjs/raw';
import Header from '@editorjs/header';
import Quote from '@editorjs/quote';
import Marker from '@editorjs/marker';
import CheckList from '@editorjs/checklist';
import Delimiter from '@editorjs/delimiter';
import InlineCode from '@editorjs/inline-code';
import SimpleImage from '@editorjs/simple-image';
import Comment from 'editorjs-comment';
import Title from "title-editorjs";

const COMMENT_TOOL = {
  class: Comment,
  inlineToolbar: true,
  config: {
    renderBody: ({ commentBlockId, blockId, onClose }) => {
      const text = "Describe tu comentario.";
      const saveComment = (blockId) => {
        return () => {
          const inputValue = document.getElementById("commentInput").value;
        };
      };

      return (
        <div className="text-right p-2 shadow-2xl w-[300px] ml-[550px] rounded">
          <div className="m-4">
            <div>{text}</div>
            <div>
              <input 
                id="commentInput"
                type="text"
                className="border border-gray-300 rounded px-4 py-2 mt-2" 
                placeholder="Escribe tu comentario" 
              />
              <button className="bg-[#2C1C47] text-white px-4 py-2 rounded mt-2" onClick={saveComment(blockId)}>Enviar comentario</button>
              <button className="bg-[#2C1C47] text-white px-4 py-2 rounded ml-[15px]" onClick={onClose}>Cerrar</button>
            </div>
          </div>
        </div>
      );
    }
  }
};


export default function TextEditor() {
  const editorRef = useRef(null);
  const saveDocumentRef = useRef(null);
  const [blockId, setBlockId] = useState(null); 
  const [mounted, setMounted] = useState(false);
  const effectMounted = useRef(false);

  const initialData =  {
    "time": new Date().getTime(),
    "blocks": [
      {
        "type": "paragraph",
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
            tools: {
              embed: Embed,
              table: Table,
              marker: Marker,
              list: List,
              warning: Warning,
              code: Code,
              linkTool: LinkTool,
              image: Image,
              title: Title,
              raw: Raw,
              header: Header,
              quote: Quote,
              checklist: CheckList,
              delimiter: Delimiter,
              inlineCode: InlineCode,
              simpleImage: SimpleImage,
              comment: COMMENT_TOOL
            }
          });
        } catch (error) {
          console.error('Error initializing editor:', error);
        }
      };

      initializeEditor();

      saveDocumentRef.current = () => {
        editorInstance.save().then((outputData)=>{
          outputData.blocks.forEach(block => {
            block.blockId = blockId;
          });
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

  return (
    <>
      <div ref={editorRef} className="h-[700px] w-[70%] fixed left-[20%] top-[110px] outline-color-[#f1cf2b] rounded-lg px-8 py-5 outline outline-1 shadow-2xl shadow-violet-950" style={{ overflowY: 'auto', scrollbarWidth: 'thin' }}></div>
      <div className='left-[20%] top-[840px] fixed outline-2 outline-offset-2 '>
        <Button rounded type="submit" onClick={() => saveDocumentRef.current()} color={colors.ALTERNATIVE}>
          Guardar
        </Button>
      </div>
    </>
  );
}
