// Email service for stock alerts
export interface EmailAlert {
  to: string;
  subject: string;
  body: string;
  productName: string;
  currentStock: number;
  minimumStock: number;
}

// Simulate email sending (in production, you'd integrate with an email service)
export async function sendStockAlert(alert: EmailAlert): Promise<boolean> {
  try {
    // In production, integrate with services like:
    // - EmailJS for client-side email
    // - SendGrid, Mailgun, or similar for server-side
    // - Or your own email API
    
    console.log('📧 Stock Alert Email:', {
      to: alert.to,
      subject: alert.subject,
      body: alert.body,
      timestamp: new Date().toISOString()
    });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Stock Alert', {
        body: `${alert.productName} is running low (${alert.currentStock} left)`,
        icon: '/favicon.ico'
      });
    }
    
    return true;
  } catch (error) {
    console.error('Failed to send stock alert:', error);
    return false;
  }
}

// Request notification permission
export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}