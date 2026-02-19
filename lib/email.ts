
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'ethereal_user',
    pass: process.env.SMTP_PASS || 'ethereal_pass',
  },
})

interface SendEmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
  // In development, if no real SMTP credentials are provided, we log the email
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    console.log('----------------------------------------')
    console.log(`[Dev Mode] Mock Email Sent to: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Text: ${text}`)
    console.log('----------------------------------------')
    return { success: true, messageId: 'mock-id' }
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"CookFlow" <noreply@cookflow.com>',
      to,
      subject,
      text,
      html,
    })

    console.log('Message sent: %s', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}
