// src/utils/markdownLoader.js
import frontMatter from 'front-matter';
import { marked } from 'marked';

export const loadMarkdownFiles = async () => {
    const markdownFiles = import.meta.glob('../data/*.md', { 
      query: '?raw',
      import: 'default'
    });
    
    const posts = await Promise.all(
      Object.entries(markdownFiles).map(async ([filepath, importFn]) => {
        const content = await importFn();
        const { attributes, body } = frontMatter(content);
        const contentHtml = marked(body);
  
        return {
          slug: filepath.split('/').pop().replace('.md', ''),
          title: attributes.title,
          date: attributes.date,
          author: attributes.author || 'Anónimo', // Valor por defecto si no existe
          content: contentHtml,
          ...attributes
        };
      })
    );
  
    return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  };