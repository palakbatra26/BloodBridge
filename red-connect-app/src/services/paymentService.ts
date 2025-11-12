import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Function to verify payment with Razorpay
export const verifyPayment = async (paymentId: string, orderId: string, signature: string) => {
  try {
    // In a real implementation, you would send these details to your backend
    // to verify with Razorpay's API using your secret key
    // For now, we'll simulate a basic verification
    
    // This is where you would make an API call to your backend
    // const response = await fetch('/api/verify-payment', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ paymentId, orderId, signature }),
    // });
    // 
    // const result = await response.json();
    // return result.success;
    
    // For demo purposes, we'll just return true
    // In a real app, you MUST verify the payment with Razorpay's API on your backend
    return true;
  } catch (error) {
    console.error("Payment verification error:", error);
    return false;
  }
};

// Function to generate and download receipt
export const downloadReceipt = (
  paymentId: string,
  amount: number,
  userName: string,
  userEmail: string,
  userPhone?: string
) => {
  try {
    const doc = new jsPDF();
    
    // Add BloodBridge logo text
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38); // Primary red color
    doc.text("BloodBridge", 20, 20);
    
    // Reset color and add title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("Donation Receipt", 20, 35);
    
    // Add date
    const date = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
    doc.setFontSize(12);
    doc.text(`Date: ${date}`, 20, 45);
    
    // Add donor information
    doc.setFontSize(14);
    doc.text("Donor Information", 20, 60);
    
    doc.setFontSize(12);
    doc.text(`Name: ${userName || 'N/A'}`, 20, 70);
    doc.text(`Email: ${userEmail || 'N/A'}`, 20, 77);
    if (userPhone) {
      doc.text(`Phone: ${userPhone}`, 20, 84);
    }
    
    // Add payment details
    doc.setFontSize(14);
    doc.text("Payment Details", 20, 100);
    
    doc.setFontSize(12);
    doc.text(`Payment ID: ${paymentId}`, 20, 110);
    doc.text(`Amount: ₹${(amount / 100).toFixed(2)}`, 20, 117); // Convert paise to rupees
    doc.text("Payment Status: SUCCESS", 20, 124);
    
    // Add note
    doc.setFontSize(10);
    doc.text("Thank you for your generous donation!", 20, 140);
    doc.text("Your support helps us save lives through efficient blood donation management.", 20, 145);
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("BloodBridge Foundation", 20, 170);
    doc.text("This is a computer generated receipt", 20, 175);
    
    // Save the PDF
    doc.save(`bloodbridge-donation-receipt-${paymentId}.pdf`);
    
    console.log("Receipt downloaded successfully");
  } catch (error) {
    console.error("Error generating receipt:", error);
    alert("Payment successful! However, there was an issue generating the receipt. Please contact support with payment ID: " + paymentId);
  }
};

// Function to format amount from paise to rupees
export const formatAmount = (amountInPaise: number): string => {
  return (amountInPaise / 100).toFixed(2);
};