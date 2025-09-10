import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend('re_M1tso8Uw_6h9RDwacGESufge1qXApXTLY');

interface PlantCareReminderData {
  userName: string;
  userEmail: string;
  plantName: string;
  careAction: 'water' | 'fertilize' | 'repot' | 'prune';
  nextReminder?: string;
}

interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

interface PremiumUpgradeData {
  userName: string;
  userEmail: string;
  features: string[];
}

class ResendEmailService {
  private static instance: ResendEmailService;
  private fromEmail = 'FloraMind <care@floramind.app>';

  static getInstance(): ResendEmailService {
    if (!ResendEmailService.instance) {
      ResendEmailService.instance = new ResendEmailService();
    }
    return ResendEmailService.instance;
  }

  // Plant Care Reminder Email
  async sendPlantCareReminder(data: PlantCareReminderData): Promise<boolean> {
    try {
      const actionEmoji = {
        water: '💧',
        fertilize: '🌱',
        repot: '🪴',
        prune: '✂️'
      };

      const actionText = {
        water: 'needs watering',
        fertilize: 'needs fertilizing',
        repot: 'is ready for repotting',
        prune: 'needs pruning'
      };

      const { data: emailData, error } = await resend.emails.send({
        from: this.fromEmail,
        to: [data.userEmail],
        subject: `${actionEmoji[data.careAction]} Your ${data.plantName} ${actionText[data.careAction]}!`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
                .content { background: #F0FDF4; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #22C55E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                .plant-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🌱 FloraMind Plant Care Reminder</h1>
                </div>
                <div class="content">
                  <h2>Hi ${data.userName}! 👋</h2>
                  <div class="plant-card">
                    <h3>${actionEmoji[data.careAction]} Your ${data.plantName} ${actionText[data.careAction]}!</h3>
                    <p>It's time to give your plant some love and attention.</p>
                    ${data.careAction === 'water' ? '<p><strong>Tip:</strong> Check if the top inch of soil is dry before watering.</p>' : ''}
                    ${data.careAction === 'fertilize' ? '<p><strong>Tip:</strong> Use a balanced liquid fertilizer diluted to half strength.</p>' : ''}
                    ${data.careAction === 'repot' ? '<p><strong>Tip:</strong> Choose a pot 1-2 inches larger in diameter than the current one.</p>' : ''}
                    ${data.careAction === 'prune' ? '<p><strong>Tip:</strong> Use clean, sharp scissors and prune just above a leaf node.</p>' : ''}
                    ${data.nextReminder ? `<p><em>Next reminder: ${data.nextReminder}</em></p>` : ''}
                  </div>
                  <a href="https://floramind.app/plants" class="button">View in App</a>
                  <div class="footer">
                    <p>You're receiving this because you have plant care reminders enabled.</p>
                    <p>© 2025 FloraMind | <a href="https://floramind.app/unsubscribe">Unsubscribe</a></p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
      });

      if (error) {
        console.error('❌ Failed to send plant care reminder:', error);
        return false;
      }

      console.log('✅ Plant care reminder sent successfully:', emailData);
      return true;
    } catch (error) {
      console.error('❌ Error sending plant care reminder:', error);
      return false;
    }
  }

  // Welcome Email for New Users
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      const { data: emailData, error } = await resend.emails.send({
        from: this.fromEmail,
        to: [data.userEmail],
        subject: '🌱 Welcome to FloraMind - Your AI Plant Care Companion!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); color: white; padding: 40px; border-radius: 10px 10px 0 0; text-align: center; }
                .content { background: #F0FDF4; padding: 30px; border-radius: 0 0 10px 10px; }
                .feature { display: flex; align-items: center; margin: 20px 0; }
                .feature-icon { font-size: 24px; margin-right: 15px; }
                .button { display: inline-block; background: #22C55E; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 10px; font-weight: bold; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Welcome to FloraMind!</h1>
                  <p style="font-size: 18px;">Your journey to becoming a plant expert starts here</p>
                </div>
                <div class="content">
                  <h2>Hi ${data.userName}! 👋</h2>
                  <p>We're thrilled to have you join the FloraMind community! Get ready to transform your plant care experience with AI-powered assistance.</p>
                  
                  <h3>Here's what you can do with FloraMind:</h3>
                  
                  <div class="feature">
                    <span class="feature-icon">📸</span>
                    <div>
                      <strong>Instant Plant Identification</strong>
                      <p>Snap a photo and identify over 10,000 plant species in seconds</p>
                    </div>
                  </div>
                  
                  <div class="feature">
                    <span class="feature-icon">🩺</span>
                    <div>
                      <strong>Health Diagnosis</strong>
                      <p>Detect diseases, pests, and nutrient deficiencies with AI analysis</p>
                    </div>
                  </div>
                  
                  <div class="feature">
                    <span class="feature-icon">💡</span>
                    <div>
                      <strong>Personalized Care Plans</strong>
                      <p>Get customized watering, fertilizing, and care schedules</p>
                    </div>
                  </div>
                  
                  <div class="feature">
                    <span class="feature-icon">🔔</span>
                    <div>
                      <strong>Smart Reminders</strong>
                      <p>Never forget to water or care for your plants again</p>
                    </div>
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="https://floramind.app/get-started" class="button">Get Started</a>
                    <a href="https://floramind.app/premium" class="button" style="background: #F59E0B;">Upgrade to Premium</a>
                  </div>
                  
                  <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 30px;">
                    <h3>🎁 Special Welcome Offer</h3>
                    <p>Get <strong>30% off</strong> your first month of Premium!</p>
                    <p>Use code: <strong style="color: #22C55E;">WELCOME30</strong></p>
                  </div>
                  
                  <div class="footer">
                    <p>Need help? Reply to this email or visit our <a href="https://floramind.app/help">Help Center</a></p>
                    <p>© 2025 FloraMind | <a href="https://floramind.app/privacy">Privacy</a> | <a href="https://floramind.app/terms">Terms</a></p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
      });

      if (error) {
        console.error('❌ Failed to send welcome email:', error);
        return false;
      }

      console.log('✅ Welcome email sent successfully:', emailData);
      return true;
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      return false;
    }
  }

  // Premium Upgrade Email
  async sendPremiumUpgradeEmail(data: PremiumUpgradeData): Promise<boolean> {
    try {
      const { data: emailData, error } = await resend.emails.send({
        from: this.fromEmail,
        to: [data.userEmail],
        subject: '⭐ Unlock FloraMind Premium - Become a Plant Expert!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 40px; border-radius: 10px 10px 0 0; text-align: center; }
                .content { background: #FFFBEB; padding: 30px; border-radius: 0 0 10px 10px; }
                .price-card { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .button { display: inline-block; background: #F59E0B; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; margin: 10px; font-weight: bold; font-size: 18px; }
                .feature-list { list-style: none; padding: 0; }
                .feature-list li { padding: 10px 0; }
                .feature-list li:before { content: "✅ "; font-size: 18px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>⭐ Go Premium, ${data.userName}!</h1>
                  <p style="font-size: 18px;">Join thousands of plant parents who've upgraded their care</p>
                </div>
                <div class="content">
                  <h2>Transform Your Plant Care Experience</h2>
                  <p>You've identified 3 plants this week! Imagine what you could do with unlimited access...</p>
                  
                  <div class="price-card">
                    <h2 style="color: #F59E0B;">Premium Features</h2>
                    <ul class="feature-list">
                      <li>Unlimited plant identifications</li>
                      <li>Advanced health diagnosis with treatment plans</li>
                      <li>Personalized care schedules for all your plants</li>
                      <li>Expert plant care guides and tutorials</li>
                      <li>Priority support from botanists</li>
                      <li>Ad-free experience</li>
                      <li>Offline mode for field use</li>
                    </ul>
                    
                    <div style="margin: 30px 0;">
                      <h3>Choose Your Plan:</h3>
                      <p><strong>Monthly:</strong> $4.99/month</p>
                      <p><strong>Yearly:</strong> $29.99/year (Save 50%!)</p>
                    </div>
                    
                    <a href="https://floramind.app/upgrade" class="button">Upgrade Now</a>
                  </div>
                  
                  <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                    <h3>🎯 Limited Time Offer</h3>
                    <p>Upgrade in the next 24 hours and get <strong>40% off</strong> your first 3 months!</p>
                    <p>Use code: <strong style="color: #F59E0B;">EXPERT40</strong></p>
                  </div>
                  
                  <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
                    <p>Join 50,000+ plant parents who've gone Premium</p>
                    <p>⭐⭐⭐⭐⭐ 4.9/5 from 10,000+ reviews</p>
                  </div>
                  
                  <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
                    <p>© 2025 FloraMind | <a href="https://floramind.app/unsubscribe">Unsubscribe from promotional emails</a></p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
      });

      if (error) {
        console.error('❌ Failed to send premium upgrade email:', error);
        return false;
      }

      console.log('✅ Premium upgrade email sent successfully:', emailData);
      return true;
    } catch (error) {
      console.error('❌ Error sending premium upgrade email:', error);
      return false;
    }
  }

  // Weekly Plant Tips Email
  async sendWeeklyTips(userEmail: string, userName: string, tips: string[]): Promise<boolean> {
    try {
      const { data: emailData, error } = await resend.emails.send({
        from: this.fromEmail,
        to: [userEmail],
        subject: '🌿 Your Weekly Plant Care Tips from FloraMind',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #22C55E;">Weekly Plant Tips</h1>
                <p>Hi ${userName}!</p>
                <p>Here are this week's plant care tips:</p>
                <ul>
                  ${tips.map(tip => `<li style="margin: 10px 0;">${tip}</li>`).join('')}
                </ul>
                <p>Happy planting! 🌱</p>
              </div>
            </body>
          </html>
        `
      });

      return !error;
    } catch (error) {
      console.error('❌ Error sending weekly tips:', error);
      return false;
    }
  }
}

export default ResendEmailService;
