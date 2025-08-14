export const interestOptions = [
  'Madlavning',
  'Rejser',
  'Musik',
  'Film',
  'Litteratur'
];

export const interestCategories = {
  'Madlavning': 'Mad & Gastronomi',
  'Rejser': 'Rejser & Udeliv',
  'Musik': 'Musik',
  'Film': 'Kunst & Kultur',
  'Litteratur': 'Kunst & Kultur'
};

export const getInterestCategory = i => interestCategories[i] || 'Andet';

