export function generateLegacyTakhreejText(
  mode: 'general' | 'medium' | 'detailed',
  takhreejData: any[],
  shawahedList: any[],
  serviceBooksList: Record<string, any[]>
): string {
  let output = '';

  // --- 1. Matn Takhreej ---
  output += '1. تخريج من كتب المتون\n';

  if (takhreejData && takhreejData.length > 0) {
    // Sort by Tarteeb to ensure scholarly order
    const sortedBooks = [...takhreejData].sort((a, b) => (a.tarteeb || 0) - (b.tarteeb || 0));
    
    sortedBooks.forEach((bookGroup, bIdx) => {
      // First book uses "أخرجه", subsequent books use " و"
      const author = bookGroup.takhreej_author || bookGroup.book_name;
      const bookTitle = bookGroup.takhreej_book || '';
      
      if (bIdx === 0) {
        output += `أخرجه ${author} في "${bookTitle}" `;
      } else {
        output += `و${author} في "${bookTitle}" `;
      }

      if (bookGroup.hadiths && bookGroup.hadiths.length > 0) {
        const hadithStrings = bookGroup.hadiths.map((h: any) => {
          const part = h.volume || 1;
          const page = h.page || 1;
          const number = h.number || '';
          
          let hString = `(${part} / ${page}) برقم: ({number})`;
          hString = hString.replace('{number}', number);

          if (mode !== 'general') {
             // Append chapter path: ( {Level1} ، {Level0} )
             if (h.chapter_path && h.chapter_path.length > 0) {
                // Reverse it so highest ancestor is first
                const reversedPath = [...h.chapter_path].reverse();
                hString += ` ( ${reversedPath.join(' ، ')} )`;
             }
             
             if (mode === 'detailed' && h.comparison_comment) {
                hString += ` (${h.comparison_comment})`;
             }
          }
          return hString;
        });

        // Join hadiths of the SAME book with Arabic comma
        output += hadithStrings.join(' ، ');
      }
      
      if (bIdx < sortedBooks.length - 1) {
         output += ' '; // Space before the next book's "و"
      }
    });
    output += ' \n\n'; // Double newline separating sections
  }

  // --- 2. Shawahed ---
  output += '2.  شواهد ومتابعات\n';
  if (shawahedList && shawahedList.length > 0) {
    shawahedList.forEach((sh) => {
       const companion = sh.companion_name || 'صحابي غير محدد';
       const author = sh.takhreej_author || sh.book_name;
       const bookTitle = sh.takhreej_book || '';
       const part = sh.part || 1;
       const page = sh.page || 1;
       const number = sh.tarqeem || '';
       
       output += `وله شاهد من حديث ${companion}، أخرجه ${author} في "${bookTitle}" (${part} / ${page}) برقم: (${number}) \n`;
    });
  }
  output += '\n'; // Separate section

  // --- 3. Services ---
  output += '3.  تخريج من كتب أخرى\n';
  if (serviceBooksList && Object.keys(serviceBooksList).length > 0) {
     Object.values(serviceBooksList).flat().forEach((b: any) => {
        output += `${b.book_name} (${b.part} / ${b.page}) \n`;
     });
  }

  return output.trim();
}
