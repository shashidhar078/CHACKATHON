# 📧 Production Email Setup Guide

This guide will help you set up production-level email functionality for ThreadApp using **Resend** (recommended) or **Gmail SMTP**.

## 🚀 Option 1: Resend (Recommended for Production)

**Resend** is a modern email API that's perfect for production applications. It's reliable, fast, and has excellent deliverability.

### Step 1: Sign up for Resend
1. Go to [resend.com](https://resend.com)
2. Create a free account
3. Verify your email address

### Step 2: Get your API Key
1. Go to the Resend dashboard
2. Navigate to "API Keys" section
3. Create a new API key
4. Copy the API key (starts with `re_`)

### Step 3: Configure your .env file
Add this to your `.env` file:
```env
# Resend Configuration (Production)
RESEND_API_KEY=re_your_api_key_here
```

### Step 4: Verify your domain (Optional but recommended)
1. In Resend dashboard, go to "Domains"
2. Add your domain (e.g., `yourdomain.com`)
3. Follow the DNS verification steps
4. Update the `from` email in `emailService.js` to use your domain

## 📧 Option 2: Gmail SMTP (Development/Testing)

For development or testing, you can use Gmail SMTP.

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to Security → App passwords
2. Select "Mail" as the app
3. Generate a new app password
4. Copy the 16-character password

### Step 3: Configure your .env file
Add this to your `.env` file:
```env
# Gmail Configuration (Development)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
```

## 🔧 Complete .env Configuration

Here's a complete `.env` file with all email options:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/thread-app

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Client URL
CLIENT_URL=http://localhost:3000

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret

# Session
SESSION_SECRET=your-session-secret-here

# Email Configuration
# Option 1: Resend (Production - Recommended)
RESEND_API_KEY=re_your_resend_api_key_here

# Option 2: Gmail SMTP (Development)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
```

## 🧪 Testing the Email Setup

### Test Password Reset
1. Start your backend server: `npm run dev`
2. Go to your frontend and try the forgot password feature
3. Enter an email address that exists in your database
4. Check your email inbox (and spam folder)

### Test Welcome Email
1. Register a new user account
2. Check if a welcome email is sent

## 📊 Email Features

### Password Reset Email
- ✅ Beautiful HTML template
- ✅ Security warnings and instructions
- ✅ 1-hour expiration notice
- ✅ Mobile-responsive design
- ✅ Professional branding

### Welcome Email
- ✅ Personalized greeting
- ✅ Feature highlights
- ✅ Call-to-action button
- ✅ Professional design

## 🔒 Security Features

- **Token Expiration**: Reset tokens expire after 1 hour
- **Secure Generation**: Uses crypto.randomBytes for secure tokens
- **No Information Leakage**: Doesn't reveal if email exists or not
- **Rate Limiting**: Protected by rate limiting middleware

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid login" error with Gmail**
   - Make sure you're using an App Password, not your regular password
   - Ensure 2-Factor Authentication is enabled

2. **"API key invalid" with Resend**
   - Check that your API key is correct
   - Make sure you've copied the full key (starts with `re_`)

3. **Emails going to spam**
   - Verify your domain with Resend
   - Use a professional "from" address
   - Include proper email headers

4. **"Email configuration missing"**
   - Make sure you've added either `RESEND_API_KEY` or `EMAIL_USER`/`EMAIL_PASS` to your `.env` file

### Debug Mode

To see detailed email logs, check your server console. You'll see:
- ✅ Success messages when emails are sent
- ❌ Error messages if something goes wrong
- 📧 Email delivery confirmations

## 🎯 Production Checklist

Before deploying to production:

- [ ] Set up Resend account and API key
- [ ] Verify your domain with Resend
- [ ] Update `from` email address to use your domain
- [ ] Test password reset functionality
- [ ] Test welcome email functionality
- [ ] Set `NODE_ENV=production` in your production environment
- [ ] Ensure all environment variables are set in production

## 📞 Support

If you encounter any issues:
1. Check the server logs for error messages
2. Verify your email configuration
3. Test with a different email address
4. Check your spam folder

The email service is designed to be robust and will automatically fall back to alternative methods if the primary method fails. 