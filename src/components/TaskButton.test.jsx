import React from 'react';
import ReactDOM from 'react-dom';
import TaskButton from './TaskButton.jsx';

jest.mock('../tasks.js', () => ({
  getNextTask: jest.fn()
}));
import { getNextTask } from '../tasks.js';

describe('TaskButton', () => {
  let container;
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    getNextTask.mockReset();
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
    container = null;
  });

  test('renders button with task label', () => {
    getNextTask.mockReturnValue({ label: 'Do something' });
    ReactDOM.render(<TaskButton profile={{}} onClick={() => {}} />, container);
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toBe('Do something');
  });

  test('calls onClick handler when clicked', () => {
    getNextTask.mockReturnValue({ label: 'Action' });
    const handleClick = jest.fn();
    ReactDOM.render(<TaskButton profile={{}} onClick={handleClick} />, container);
    const btn = container.querySelector('button');
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(handleClick).toHaveBeenCalled();
  });

  test('renders nothing when no task returned', () => {
    getNextTask.mockReturnValue(null);
    ReactDOM.render(<TaskButton profile={{}} onClick={() => {}} />, container);
    expect(container.innerHTML).toBe('');
  });
});
