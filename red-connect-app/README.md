# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/86beb2e3-6809-4104-bc5e-21f69b7f268d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/86beb2e3-6809-4104-bc5e-21f69b7f268d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Razorpay Integration

This project includes a donation feature powered by Razorpay. To enable it:

1. Sign up for a Razorpay account at [razorpay.com](https://razorpay.com)
2. Get your API keys from the Razorpay dashboard
3. Update the `VITE_RAZORPAY_KEY_ID` in the `.env` file with your Razorpay Key ID
4. The donation button is available in the navigation bar

## Payment Methods

All major payment methods are enabled including:
- Google Pay (GPay)
- Paytm UPI/Wallet
- PhonePe
- Credit/Debit Cards
- Net Banking
- Other UPI apps

To test all payment methods:
1. Navigate to `/payment-test` in your application
2. Try different payment amounts
3. Verify all payment options are visible in the checkout

## Donation Impact Information

Donations include detailed information about how funds are used:
- ₹50 - Provides refreshments for 5 blood donors
- ₹100 - Supports transportation for emergency cases
- ₹500 - Organizes a small blood donation camp
- ₹1000 - Maintains our technology platform for a month

Fund distribution:
- 40% Blood Camp Organization
- 30% Technology Platform
- 20% Donor Support & Refreshments
- 10% Emergency Transportation

For detailed information about payment methods and troubleshooting, see [PAYMENT_METHODS.md](PAYMENT_METHODS.md)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/86beb2e3-6809-4104-bc5e-21f69b7f268d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)