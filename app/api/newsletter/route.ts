
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Send a welcome email for "resh inspiration"
    // This is the core "fresh inspiration" email logic
    const { success, error } = await sendEmail({
      to: email,
      subject: 'Welcome to CookFlow Fresh Inspiration!',
      text: `Hi there!
      
Thanks for subscribing to our newsletter. Get ready for a weekly dose of fresh recipes, cooking tips, and culinary inspiration delivered straight to your inbox.

Happy Cooking!
The CookFlow Team`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #333;">Welcome to CookFlow Fresh Inspiration! 🍳</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Hi there!
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Thanks for subscribing to our newsletter. get ready for a weekly dose of fresh recipes, cooking tips, and culinary inspiration delivered straight to your inbox.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #888; font-size: 14px;">
            Happy Cooking!<br>
            The CookFlow Team
          </p>
        </div>
      `
    })

    if (!success) {
      console.error('Failed to send email:', error)
      return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Subscribed successfully' })
  } catch (err) {
    console.error('Error handling subscription:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
