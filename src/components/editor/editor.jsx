'use client';

import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
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

    return () => {
      if (editorInstance) {
        editorInstance.destroy();
      }
    };
  }, []);

  return (
    <div ref={editorRef} className="flex h-[684px] w-[606px] flex-col bg-white fixed left-[300px] top-[108px] bg-red-500">
      Texto
    </div>
  );
}
