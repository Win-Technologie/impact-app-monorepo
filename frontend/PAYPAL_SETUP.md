# Stripe Payment Configuration

## Setup Instructions

### 1. Create Stripe Account
- Go to https://stripe.com/
- Sign up or log in
- Navigate to the Dashboard

### 2. Get Your API Keys
In the Stripe Dashboard:
- Go to Developers > API keys
- **Publishable key**: Copy this value
- **Secret key**: Click to reveal and copy this value
- Use Test keys for development, Live keys for production

### 3. Add Environment Variables
Create or update `.env` file in the `frontend` directory:

```env
# Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key_here
STRIPE_SECRET_KEY=your_secret_key_here  # Backend only
EXPO_PUBLIC_STRIPE_TEST_MODE=true  # Set to false for production

# Existing API Configuration
EXPO_PUBLIC_API_URL=http://172.20.10.2:8000/api/
```

### 4. Install Stripe SDK
```bash
npm install @stripe/stripe-react-native
# or
yarn add @stripe/stripe-react-native
```

### 5. Test the Integration

#### Test Mode
1. Use `EXPO_PUBLIC_STRIPE_TEST_MODE=true`
2. Use test card numbers from https://stripe.com/docs/testing
3. Test cards: 4242 4242 4242 4242 (Visa)

#### Production
1. Switch to Live keys in your `.env`
2. Set `EXPO_PUBLIC_STRIPE_TEST_MODE=false`
3. Ensure your Stripe account is fully activated

## How It Works

1. User selects Stripe as payment method
2. App displays Stripe payment form
3. User enters card details
4. Stripe securely processes the payment
5. Payment method is saved for future use

## Troubleshooting

### "Invalid API key"
- Verify Publishable and Secret keys are correct
- Check that you're using the right test/live credentials

### "Payment fails"
- Check Stripe Dashboard for error details
- Ensure test mode is enabled for development

## Notes

This is a placeholder implementation. Full Stripe integration will be implemented in a separate ticket.
