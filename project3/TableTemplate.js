'use strict';

class TableTemplate {
  static fillIn(id, dictionary, columnName) {
    const table = document.getElementById(id);
    if (!table.rows.length) {
      return;
    }
    const fill = cell => {
      const processor = new Cs142TemplateProcessor(cell.textContent);
      cell.textContent = processor.fillIn(dictionary);
    };
    const headers = Array.from(table.rows[0].cells);
    headers.forEach(fill);
    const column = headers.findIndex(cell => cell.textContent === columnName);
    for (let row = 1; row < table.rows.length; row++) {
      Array.from(table.rows[row].cells).forEach((cell, index) => {
        if (columnName === undefined || index === column) {
          fill(cell);
        }
      });
    }
    if (table.style.visibility === 'hidden') {
      table.style.visibility = 'visible';
    }
  }
}
