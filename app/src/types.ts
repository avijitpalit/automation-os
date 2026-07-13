import { LucideIcon } from 'lucide-react';

export type NodeType =
  | 'woocommerce'
  | 'condition'
  | 'ai-agent'
  | 'email'
  | 'google-sheets'
  | 'slack'
  | 'delay'
  | 'update-order'
  | 'webhook'
  | 'form'
  | 'wordpress'
  | 'schedule';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  title: string;
  subtitle: string;
  number: number;
  status: 'idle' | 'running' | 'success' | 'error';
  x: number;
  y: number;
  data: any; // Type-specific configuration values
}

export interface SidebarItem {
  id: NodeType;
  title: string;
  subtitle: string;
  category: 'triggers' | 'actions' | 'controls';
  color: string;
  iconName: string;
}

export interface ExecutionLog {
  timestamp: string;
  nodeId: string;
  nodeTitle: string;
  status: 'running' | 'success' | 'error';
  message: string;
  durationMs: number;
  output?: any;
}

// Initial Nodes matching the exact visual structure in the screenshot
export const INITIAL_NODES: WorkflowNode[] = [
  {
    id: 'node-1',
    type: 'woocommerce',
    title: 'WooCommerce',
    subtitle: 'Order Created',
    number: 1,
    status: 'success',
    x: 430,
    y: 40,
    data: {
      storeUrl: 'https://my-woocommerce-shop.com',
      event: 'order.created',
      credentials: 'Shop Admin Key (***-***)'
    }
  },
  {
    id: 'node-2',
    type: 'condition',
    title: 'Condition',
    subtitle: 'Cart Total > ₹5,000',
    number: 2,
    status: 'success',
    x: 430,
    y: 160,
    data: {
      field: 'cart.total_price',
      operator: 'greater_than',
      value: '5000',
      currency: 'INR'
    }
  },
  {
    id: 'node-3',
    type: 'ai-agent',
    title: 'AI Agent',
    subtitle: 'Analyze Order',
    number: 3,
    status: 'success',
    x: 180,
    y: 330,
    data: {
      agentName: 'Order Analysis Agent',
      prompt: 'Analyze this order and extract customer intent, product category, and suggest upsell products.',
      model: 'gemini-3.5-flash',
      temperature: 0.3,
      testOutput: {
        intent: 'high_value_purchase',
        customer_type: 'new_customer',
        category: 'electronics',
        recommended_upsell: [
          'extended_warranty',
          'wireless_earbuds',
          'laptop_bag'
        ],
        confidence: 0.92
      }
    }
  },
  {
    id: 'node-4',
    type: 'email',
    title: 'Email',
    subtitle: 'Send Thank You Email',
    number: 4,
    status: 'success',
    x: 180,
    y: 450,
    data: {
      recipient: '{{customer.email}}',
      subject: 'Thank you for your order! - #{{order.id}}',
      sender: 'sales@my-shop.com',
      body: 'Hi {{customer.first_name}},\n\nThank you so much for your purchase of ₹{{order.total}}! We are preparing your order and will send tracking info soon.'
    }
  },
  {
    id: 'node-5',
    type: 'google-sheets',
    title: 'Google Sheets',
    subtitle: 'Add Order to Sheet',
    number: 5,
    status: 'success',
    x: 180,
    y: 570,
    data: {
      spreadsheetId: 'spreadsheet_high_value_orders_2026',
      sheetName: 'Sheet1',
      columns: [
        { key: 'OrderID', value: '{{order.id}}' },
        { key: 'Customer', value: '{{customer.name}}' },
        { key: 'Total', value: '{{order.total}}' },
        { key: 'AI_Intent', value: '{{node3.intent}}' }
      ]
    }
  },
  {
    id: 'node-6',
    type: 'slack',
    title: 'Slack',
    subtitle: 'Notify Sales Team',
    number: 6,
    status: 'success',
    x: 180,
    y: 690,
    data: {
      channel: '#sales-alerts',
      message: '🚀 *New High Value Order!* \nOrder #{{order.id}} by {{customer.name}} for *₹{{order.total}}*.\nAI Insights: Customer intent is *{{node3.intent}}* ({{node3.confidence}} confidence).'
    }
  },
  {
    id: 'node-7',
    type: 'delay',
    title: 'Delay',
    subtitle: 'Wait 24 Hours',
    number: 7,
    status: 'idle',
    x: 680,
    y: 330,
    data: {
      duration: '24',
      unit: 'hours'
    }
  },
  {
    id: 'node-8',
    type: 'email',
    title: 'Email',
    subtitle: 'Send Reminder Email',
    number: 8,
    status: 'idle',
    x: 680,
    y: 450,
    data: {
      recipient: '{{customer.email}}',
      subject: 'Complete your checkout!',
      sender: 'reminders@my-shop.com',
      body: 'Hi {{customer.first_name}},\n\nWe noticed you didn\'t finish checking out. Don\'t miss out on your items!'
    }
  },
  {
    id: 'node-9',
    type: 'update-order',
    title: 'Update Order',
    subtitle: 'Add Order Note',
    number: 9,
    status: 'idle',
    x: 430,
    y: 810,
    data: {
      orderId: '{{order.id}}',
      note: 'High-value flow processed. AI intent: {{node3.intent}}. Alert dispatched to Slack and sales notified.',
      isCustomerNote: false
    }
  }
];

export const SIDEBAR_ITEMS: SidebarItem[] = [
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
