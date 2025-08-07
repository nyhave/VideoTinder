import React from 'react';
import ReactDOM from 'react-dom';
import AdBanner from './AdBanner.jsx';

jest.mock('../i18n.js', () => ({
  useT: () => (key) => {
    const map = {
      adBannerText: 'Upgrade to {tier}',
      adBannerButton: 'Upgrade',
      tierSilver: 'Silver'
    };
    return map[key] || key;
  }
}));

describe('AdBanner', () => {
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

  test('shows upgrade to Silver for free tier', () => {
    ReactDOM.render(<AdBanner user={{ subscriptionTier: 'free' }} />, container);
    expect(container.textContent).toContain('Upgrade to Silver');
  });

  test('renders nothing for silver tier', () => {
    ReactDOM.render(<AdBanner user={{ subscriptionTier: 'silver' }} />, container);
    expect(container.innerHTML).toBe('');
  });

  test('renders nothing for gold tier', () => {
    ReactDOM.render(<AdBanner user={{ subscriptionTier: 'gold' }} />, container);
    expect(container.innerHTML).toBe('');
  });

  test('renders nothing for platinum tier', () => {
    ReactDOM.render(<AdBanner user={{ subscriptionTier: 'platinum' }} />, container);
    expect(container.innerHTML).toBe('');
  });
});

