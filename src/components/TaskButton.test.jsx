import React from 'react';
import ReactDOM from 'react-dom';
import TaskButton from './TaskButton.jsx';
import { LanguageProvider } from '../i18n.js';

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
    getNextTask.mockReturnValue({ labelKey: 'taskAddProfilePicture' });
    ReactDOM.render(
      <LanguageProvider value={{ lang: 'en', setLang: () => {} }}>
        <TaskButton profile={{}} onClick={() => {}} />
      </LanguageProvider>,
      container
    );
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toBe('Add profile picture');
  });

  test('calls onClick handler when clicked', () => {
    getNextTask.mockReturnValue({ labelKey: 'taskAddVideoClip' });
    const handleClick = jest.fn();
    ReactDOM.render(
      <LanguageProvider value={{ lang: 'en', setLang: () => {} }}>
        <TaskButton profile={{}} onClick={handleClick} />
      </LanguageProvider>,
      container
    );
    const btn = container.querySelector('button');
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(handleClick).toHaveBeenCalled();
  });

  test('renders nothing when no task returned', () => {
    getNextTask.mockReturnValue(null);
    ReactDOM.render(
      <LanguageProvider value={{ lang: 'en', setLang: () => {} }}>
        <TaskButton profile={{}} onClick={() => {}} />
      </LanguageProvider>,
      container
    );
    expect(container.innerHTML).toBe('');
  });
});
