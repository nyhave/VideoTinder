import React from 'react';
import ReactDOM from 'react-dom';
import SectionTitle from './SectionTitle.jsx';

describe('SectionTitle', () => {
  let container;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
    container = null;
  });

  test('renders provided title', () => {
    ReactDOM.render(<SectionTitle title="Hello" />, container);
    expect(container.textContent).toContain('Hello');
  });

  test('renders action element when provided', () => {
    const action = React.createElement('button', null, 'Action');
    ReactDOM.render(<SectionTitle title="Test" action={action} />, container);
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toBe('Action');
  });

  test('applies custom color class', () => {
    ReactDOM.render(<SectionTitle title="Color" colorClass="text-blue-500" />, container);
    const h2 = container.querySelector('h2');
    expect(h2.className).toContain('text-blue-500');
  });

  test('adds bottom padding to title', () => {
    ReactDOM.render(<SectionTitle title="Pad" />, container);
    const h2 = container.querySelector('h2');
    expect(h2.className).toContain('pb-[3px]');
  });
});
