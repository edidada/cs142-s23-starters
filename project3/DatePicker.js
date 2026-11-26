'use strict';

class DatePicker {
  constructor(id, callback) {
    this.id = id;
    this.callback = callback;
  }

  render(date) {
    const root = document.getElementById(this.id);
    const year = date.getFullYear();
    const month = date.getMonth();
    // setFullYear preserves years 0..99, unlike the multi-argument Date constructor.
    const first = new Date(0);
    first.setHours(12, 0, 0, 0);
    first.setFullYear(year, month, 1);
    const end = new Date(first);
    end.setMonth(month + 1, 0);
    const weeks = Math.ceil((first.getDay() + end.getDate()) / 7);
    root.textContent = '';
    root.classList.add('date-picker');
    const heading = document.createElement('div');
    heading.className = 'date-picker-heading';
    const title = document.createElement('span');
    title.textContent = `${first.toLocaleString('en-US', { month: 'long' })} ${year}`;
    const navigation = (label, offset, name) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.setAttribute('aria-label', name);
      button.addEventListener('click', () => {
        const next = new Date(first);
        next.setMonth(month + offset, 1);
        this.render(next);
      });
      return button;
    };
    heading.appendChild(navigation('<', -1, 'Previous month'));
    heading.appendChild(title);
    heading.appendChild(navigation('>', 1, 'Next month'));
    root.appendChild(heading);
    const table = document.createElement('table');
    table.setAttribute('aria-label', title.textContent);
    const header = table.createTHead().insertRow();
    ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(day => {
      const cell = document.createElement('th');
      cell.scope = 'col';
      cell.textContent = day;
      header.appendChild(cell);
    });
    const body = table.createTBody();
    for (let week = 0; week < weeks; week++) {
      const row = body.insertRow();
      for (let day = 0; day < 7; day++) {
        const value = week * 7 + day - first.getDay() + 1;
        const current = new Date(first);
        current.setDate(value);
        const cell = row.insertCell();
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = String(current.getDate());
        if (value < 1 || value > end.getDate()) {
          cell.className = 'outside-month';
          button.disabled = true;
        } else {
          button.addEventListener('click', () => this.callback(this.id, {
            month: month + 1, day: value, year: year
          }));
        }
        cell.appendChild(button);
      }
    }
    root.appendChild(table);
  }
}
