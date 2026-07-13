// Initial Nodes matching the exact visual structure in the screenshot
export const INITIAL_NODES = [];

export const SIDEBAR_ITEMS = [
  // Triggers
  {
    id: 'woocommerce',
    title: 'WooCommerce',
    subtitle: 'Order Created',
    category: 'triggers',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
    iconName: 'store'
  },
  {
    id: 'form',
    title: 'Form',
    subtitle: 'Submit',
    category: 'triggers',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    iconName: 'file-text'
  },
  {
    id: 'wordpress',
    title: 'WordPress',
    subtitle: 'New User Registered',
    category: 'triggers',
    color: 'bg-sky-50 text-sky-600 border-sky-100',
    iconName: 'globe'
  },
  {
    id: 'schedule',
    title: 'Schedule',
    subtitle: 'At a specific time',
    category: 'triggers',
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    iconName: 'clock'
  },
  {
    id: 'webhook',
    title: 'Webhook',
    subtitle: 'Receive Data',
    category: 'triggers',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    iconName: 'webhook'
  },

  // Actions
  {
    id: 'email',
    title: 'Email',
    subtitle: 'Send Email',
    category: 'actions',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    iconName: 'mail'
  },
  {
    id: 'slack',
    title: 'Slack',
    subtitle: 'Send Message',
    category: 'actions',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    iconName: 'message-square'
  },
  {
    id: 'google-sheets',
    title: 'Google Sheets',
    subtitle: 'Add Row',
    category: 'actions',
    color: 'bg-green-50 text-green-600 border-green-100',
    iconName: 'table'
  },
  {
    id: 'webhook', // reuse for API actions
    title: 'HTTP Request',
    subtitle: 'Make a Request',
    category: 'actions',
    color: 'bg-purple-50 text-purple-600 border-purple-100',
    iconName: 'globe'
  },
  {
    id: 'ai-agent',
    title: 'AI Agent',
    subtitle: 'Ask AI',
    category: 'actions',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    iconName: 'sparkles'
  },

  // Controls
  {
    id: 'condition',
    title: 'Condition',
    subtitle: 'IF / ELSE',
    category: 'controls',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    iconName: 'git-fork'
  },
  {
    id: 'delay',
    title: 'Delay',
    subtitle: 'Wait for a specific time',
    category: 'controls',
    color: 'bg-purple-50 text-purple-600 border-purple-100',
    iconName: 'hourglass'
  }
];
