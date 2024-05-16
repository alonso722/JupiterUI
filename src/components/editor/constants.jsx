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
import Comment from 'editorjs-comment'; // Importa el componente de comentario

export const EDITOR_JS_TOOLS = {
  embed: Embed,
  table: Table,
  marker: Marker,
  list: List,
  warning: Warning,
  code: Code,
  linkTool: LinkTool,
  image: Image,
  raw: Raw,
  header: Header,
  quote: Quote,
  checklist: CheckList,
  delimiter: Delimiter,
  inlineCode: InlineCode,
  simpleImage: SimpleImage,
  comment: {
    class: Comment,
    inlineToolbar: true,
    config: {
      renderBody: ({ commentBlockId, blockId, onClose }) => {
        const text = "Este es un texto de ejemplo."; 
        const saveComment = () => {
          const inputValue = document.getElementById("commentInput").value;
          console.log("Comentario guardado:", inputValue);
        };
        return (
          <div className="text-right">
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onClose}>Cerrar</button>
            <div className="m-4">
              <div>{text}</div>
              <div>
                <input 
                  id="commentInput"
                  type="text"
                  className="border border-gray-300 rounded px-4 py-2 mt-2" 
                  placeholder="Escribe aquí tu comentario" 
                />
                <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2" onClick={saveComment}>Agregar comentario</button>
              </div>
            </div>
          </div>
        );
      }
    }
  }
};
