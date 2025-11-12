# Payment Methods Documentation

## Available Payment Options

Razorpay automatically provides multiple payment methods based on the configuration. With the updated implementation, all payment methods should be enabled:

### 1. UPI Payments
- Google Pay (GPay)
- PhonePe
- Paytm UPI
- BHIM UPI
- Other UPI apps

### 2. Cards
- Credit Cards (Visa, Mastercard, Rupay, etc.)
- Debit Cards (Visa, Mastercard, Rupay, etc.)

### 3. Wallets
- Paytm Wallet
- PhonePe Wallet
- Amazon Pay
- Other supported wallets

### 4. Net Banking
- All major Indian banks

## How to Test Payment Methods

### Method 1: Using the Test Page
1. Navigate to `/payment-test` in your application
2. Click on any of the test payment buttons
3. Complete the payment using test card details:
   - Card Number: 4111 1111 1111 1111
   - Expiry: Any future date
   - CVV: 123
4. Verify that all payment options are visible in the Razorpay checkout

### Method 2: Regular Donation Flow
1. Click the "Donate" button in the navigation bar
2. Or use any donation button on the Home page
3. Check that all payment methods are available

## Troubleshooting Payment Methods

### If UPI Options (GPay, Paytm) are not visible:

1. **Check Razorpay Dashboard Settings**:
   - Log in to your Razorpay dashboard
   - Go to Settings > Payment Methods
   - Ensure UPI and other methods are enabled

2. **Verify Account Activation**:
   - Some payment methods require account verification
   - Check your Razorpay account status

3. **Region Settings**:
   - Ensure your account is configured for Indian payments
   - UPI methods are primarily available for INR transactions

### Test UPI Payments:
- Use test UPI ID: `test@upi`
- For Google Pay testing, you can use the test mode in the GPay app

## Configuration Details

The payment options are enabled through the following configuration in the Razorpay service:

```typescript
const enhancedOptions: RazorpayOptions = {
  ...options,
  method: {
    netbanking: true,
    card: true,
    wallet: true,
    upi: true  // This enables UPI payments including GPay, Paytm, etc.
  },
  config: {
    display_currency: options.currency || 'INR',
    display_amount: options.amount
  }
};
```

## Important Notes

1. **Test vs Live Mode**: 
   - In test mode, all payment methods should be visible
   - In live mode, availability depends on your Razorpay account configuration

2. **Payment Verification**:
   - All payments are verified with the backend before success confirmation
   - Receipts are automatically generated and downloaded

3. **User Experience**:
   - Users will see all available payment options based on their device and region
   - Mobile users will typically see more UPI options

## Common Issues and Solutions

### Issue: Only Card Payments Visible
**Solution**: 
- Check Razorpay dashboard payment method settings
- Ensure UPI and wallet payments are enabled
- Verify your account is activated for all payment methods

### Issue: Paytm or GPay Not Showing
**Solution**:
- This can happen based on user's device and region
- Test on an actual Android device with GPay/Paytm installed
- In test mode, these options should appear for Indian transactions

### Issue: Payment Fails Verification
**Solution**:
- Check backend logs for verification errors
- Ensure Razorpay key/secret are correctly configured
- Verify the payment signature verification logic