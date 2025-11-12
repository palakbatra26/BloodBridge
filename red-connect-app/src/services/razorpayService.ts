// Razorpay service for handling payments and verification

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  // Enable all payment methods
  config?: {
    display_currency?: string;
    display_amount?: number;
  };
  // Method to enable all payment options
  method?: {
    netbanking?: boolean;
    card?: boolean;
    wallet?: boolean;
    upi?: boolean;
  };
  // Modal options for better user experience
  modal?: {
    backdropclose?: boolean;
    escape?: boolean;
    handleback?: Function;
    confirm_close?: boolean;
    ondismiss?: Function;
    animation?: boolean;
  };
  // Payment method specific options
  timeout?: number;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: Function) => void;
}

// Function to load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    
    script.onload = () => {
      resolve(true);
    };
    
    script.onerror = () => {
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};

// Function to verify payment with backend
export const verifyPaymentWithBackend = async (
  paymentId: string,
  orderId: string,
  signature: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payment/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature
      }),
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Payment verification error:", error);
    return false;
  }
};

// Function to initiate payment
export const initiatePayment = async (
  options: Omit<RazorpayOptions, 'handler'>,
  onSuccess: (response: RazorpayResponse) => void,
  onError?: (error: any) => void
) => {
  try {
    // Load Razorpay script if not already loaded
    const isScriptLoaded = await loadRazorpayScript();
    
    if (!isScriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }
    
    // Check if Razorpay is available
    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not loaded properly');
    }
    
    // Create a handler function
    const handler = async (response: RazorpayResponse) => {
      try {
        // Verify the payment with backend
        const isVerified = await verifyPaymentWithBackend(
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        );
        
        if (isVerified) {
          onSuccess(response);
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (verificationError) {
        console.error("Payment verification failed:", verificationError);
        if (onError) {
          onError(verificationError);
        } else {
          alert("Payment verification failed. Please contact support with payment ID: " + response.razorpay_payment_id);
        }
      }
    };
    
    // Ensure all payment methods are enabled and add modal options
    const enhancedOptions: RazorpayOptions = {
      ...options,
      handler,
      method: {
        netbanking: true,
        card: true,
        wallet: true,
        upi: true
      },
      config: {
        display_currency: options.currency || 'INR',
        display_amount: options.amount
      },
      modal: {
        backdropclose: false,
        escape: false,
        confirm_close: true,
        animation: true
      },
      timeout: 600 // 10 minutes timeout
    };
    
    // Create Razorpay instance
    const rzp = new window.Razorpay(enhancedOptions);
    
    // Add event listeners for better user experience
    rzp.on('payment.success', function(response: RazorpayResponse) {
      console.log('Payment success event:', response);
    });
    
    rzp.on('payment.error', function(response: any) {
      console.log('Payment error event:', response);
    });
    
    // Open the payment modal
    rzp.open();
  } catch (error) {
    console.error("Error initiating payment:", error);
    if (onError) {
      onError(error);
    } else {
      alert("Failed to initiate payment. Please try again.");
    }
  }
};