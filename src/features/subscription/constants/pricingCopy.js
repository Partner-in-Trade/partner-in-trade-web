/** Marketing compare-table copy (quotas enforced on server when product enables them). */
export const COMPARE_ROWS = [
  { feature: 'Manual trade logging', basic: 'check', pro: 'check' },
  { feature: 'Trade log and P&L calendar', basic: 'check', pro: 'check' },
  { feature: 'Economic news calendar', basic: 'check', pro: 'check' },
  { feature: 'Trading accounts', basic: '1', pro: 'Up to 5' },
  { feature: 'Strategies', basic: 'Up to 3', pro: 'Unlimited' },
  { feature: 'Playbook rules and adherence score', basic: '—', pro: 'check' },
  { feature: 'Advanced analytics', basic: '—', pro: 'check' },
  { feature: 'Journal', basic: 'Text notes', pro: 'Notes and screenshots' },
  { feature: 'Data export', basic: 'CSV', pro: 'CSV and PDF' },
  { feature: 'Support', basic: 'Email', pro: 'Priority' },
];

export const FAQ_ITEMS = [
  {
    q: 'Do I need a credit card to start the free trial?',
    a: 'No. Start with just your email — no payment details required for the 15-day trial.',
  },
  {
    q: 'What happens after the 15 days?',
    a: 'Choose Basic or Pro to keep full access, or continue on the free tier with your data saved.',
  },
  {
    q: 'Can I switch plans or cancel?',
    a: 'Yes. Switch or cancel anytime; paid changes take effect at the end of your billing period.',
  },
  {
    q: 'How can I pay?',
    a: 'UPI, cards, and net banking via Razorpay (INR, monthly).',
  },
  {
    q: 'Are taxes included in the price?',
    a: 'Listed prices are exclusive of GST unless stated otherwise at checkout.',
  },
];

export const TRUST_ITEMS = [
  { title: 'No card for the trial', body: 'Start with just your email.' },
  { title: 'Cancel anytime', body: 'No lock-in. Stop whenever you like.' },
  { title: 'Pay the Indian way', body: 'UPI, cards and net banking.' },
  { title: 'Your data is yours', body: 'Export your trades whenever you want.' },
];
