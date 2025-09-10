import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend('re_M1tso8Uw_6h9RDwacGESufge1qXApXTLY');

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { type, data } = await req.json();

    let result;
    
    switch (type) {
      case 'plant-care-reminder':
        result = await sendPlantCareReminder(data);
        break;
      case 'welcome':
        result = await sendWelcomeEmail(data);
        break;
      case 'premium-upgrade':
        result = await sendPremiumUpgradeEmail(data);
        break;
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function sendPlantCareReminder(data: any) {
  return await resend.emails.send({
    from: 'FloraMind <care@floramind.app>',
    to: [data.userEmail],
    subject: `🌱 Time to care for your ${data.plantName}!`,
    html: `
      <h2>Plant Care Reminder</h2>
      <p>Hi ${data.userName},</p>
      <p>Your ${data.plantName} needs ${data.careAction}!</p>
      <p>Best regards,<br>FloraMind Team</p>
    `
  });
}

async function sendWelcomeEmail(data: any) {
  return await resend.emails.send({
    from: 'FloraMind <welcome@floramind.app>',
    to: [data.userEmail],
    subject: '🎉 Welcome to FloraMind!',
    html: `
      <h2>Welcome to FloraMind!</h2>
      <p>Hi ${data.userName},</p>
      <p>We're excited to have you join our plant care community!</p>
      <p>Start by identifying your first plant with our AI-powered scanner.</p>
      <p>Happy planting!<br>FloraMind Team</p>
    `
  });
}

async function sendPremiumUpgradeEmail(data: any) {
  return await resend.emails.send({
    from: 'FloraMind <premium@floramind.app>',
    to: [data.userEmail],
    subject: '⭐ Unlock Premium Plant Care Features',
    html: `
      <h2>Go Premium!</h2>
      <p>Hi ${data.userName},</p>
      <p>Unlock unlimited plant identifications, advanced health diagnosis, and personalized care schedules!</p>
      <a href="https://floramind.app/upgrade" style="background: #22C55E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Upgrade Now</a>
      <p>Best regards,<br>FloraMind Team</p>
    `
  });
}
