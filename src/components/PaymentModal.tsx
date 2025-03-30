import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  ticketType: string;
  eventName: string;
  onPaymentComplete: () => void;
}

interface PayUOptions {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  ticketType,
  eventName,
  onPaymentComplete
}) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    setErrorMessage('');
    
    // Validate email and phone for all payment methods
    if (!email) {
      setErrorMessage('Email is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    
    if (!phone) {
      setErrorMessage('Phone number is required');
      return false;
    }
    
    if (!/^\d{10}$/.test(phone)) {
      setErrorMessage('Please enter a valid 10-digit phone number');
      return false;
    }
    
    // Validate based on payment method
    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
        setErrorMessage('Please enter a valid 16-digit card number');
        return false;
      }
      
      if (!cardName) {
        setErrorMessage('Cardholder name is required');
        return false;
      }
      
      if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
        setErrorMessage('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      
      if (!cvv || !/^\d{3}$/.test(cvv)) {
        setErrorMessage('Please enter a valid 3-digit CVV');
        return false;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        setErrorMessage('Please enter a valid UPI ID');
        return false;
      }
    } else if (paymentMethod === 'netbanking') {
      if (!bankName) {
        setErrorMessage('Bank name is required');
        return false;
      }
      
      if (!accountNumber || accountNumber.length < 8) {
        setErrorMessage('Please enter a valid account number');
        return false;
      }
      
      if (!ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
        setErrorMessage('Please enter a valid IFSC code');
        return false;
      }
    }
    
    return true;
  };

  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    
    setExpiryDate(value);
  };

  const processPayment = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    try {
      // Check if we're in development mode
      const isDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
      
      // For development environment, simulate payment
      if (isDevelopment) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setPaymentStatus('success');
        setTimeout(() => {
          onPaymentComplete();
          onClose();
        }, 2000);
        return;
      }
      
      // For production, use PayU form-based payment
      try {
        // In a real implementation, this would be a backend call to generate the hash
        const paymentData: PayUOptions = {
          key: "gtKFFx", // PayU test merchant key
          txnid: `TXN_${Date.now()}`, // Unique transaction ID
          amount: amount.toString(),
          productinfo: `${ticketType} Ticket for ${eventName || 'Campus Event'}`,
          firstname: cardName || "Test User", // Use cardholder name if available
          email: email,
          phone: phone,
          surl: `${window.location.origin}/payment-success`, // Success URL 
          furl: `${window.location.origin}/payment-failure` // Failure URL
        };
        
        // Create a form element
        const form = document.createElement('form');
        form.method = 'post';
        form.action = 'https://test.payu.in/_payment'; // PayU TEST endpoint
        form.style.display = 'none';
        
        // Add form fields
        Object.entries(paymentData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });
        
        // Add payment method as custom field
        const paymentMethodInput = document.createElement('input');
        paymentMethodInput.type = 'hidden';
        paymentMethodInput.name = 'udf1'; // User defined field 1
        paymentMethodInput.value = paymentMethod;
        form.appendChild(paymentMethodInput);
        
        // Add ticket type as custom field
        const ticketTypeInput = document.createElement('input');
        ticketTypeInput.type = 'hidden';
        ticketTypeInput.name = 'udf2'; // User defined field 2
        ticketTypeInput.value = ticketType;
        form.appendChild(ticketTypeInput);
        
        // Append form to body
        document.body.appendChild(form);
        
        // Submit form
        form.submit();
        
        // Clean up form after submission
        setTimeout(() => {
          document.body.removeChild(form);
          setPaymentStatus('success');
          setTimeout(() => {
            onPaymentComplete();
            onClose();
          }, 2000);
        }, 1000);
        
      } catch (error) {
        console.error("PayU integration failed:", error);
        setPaymentStatus('error');
        setErrorMessage('Payment gateway connection failed. Please try again later.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus('error');
      setErrorMessage('Payment processing failed. Please try again later.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Secure Checkout</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors rounded-full p-2 hover:bg-gray-100"
            disabled={isProcessing}
            aria-label="Close payment window"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {paymentStatus === 'success' ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-6">
              Your payment of ₹{amount} for {ticketType} ticket has been processed successfully.
            </p>
            <p className="text-gray-600 mb-6">
              A confirmation email has been sent to {email}.
            </p>
            <Button onClick={onClose} className="w-full">Close</Button>
          </div>
        ) : paymentStatus === 'error' ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Payment Failed</h3>
            <p className="text-red-500 mb-6">{errorMessage}</p>
            <Button onClick={() => setPaymentStatus('idle')} className="w-full">Try Again</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div className="md:col-span-2">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isProcessing}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="10-digit mobile number" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      disabled={isProcessing}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                <Tabs defaultValue="card" onValueChange={setPaymentMethod}>
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="card" disabled={isProcessing}>
                      <CreditCard className="h-4 w-4 mr-2" /> Card
                    </TabsTrigger>
                    <TabsTrigger value="upi" disabled={isProcessing}>
                      <Smartphone className="h-4 w-4 mr-2" /> UPI
                    </TabsTrigger>
                    <TabsTrigger value="netbanking" disabled={isProcessing}>
                      <Building className="h-4 w-4 mr-2" /> Net Banking
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="card">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input 
                          id="cardNumber" 
                          placeholder="1234 5678 9012 3456" 
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          disabled={isProcessing}
                          maxLength={19}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input 
                          id="cardName" 
                          placeholder="Name on card" 
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          disabled={isProcessing}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input 
                            id="expiryDate" 
                            placeholder="MM/YY" 
                            value={expiryDate}
                            onChange={handleExpiryDateChange}
                            disabled={isProcessing}
                            maxLength={5}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input 
                            id="cvv" 
                            type="password" 
                            placeholder="123" 
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            disabled={isProcessing}
                            maxLength={3}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="upi">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input 
                          id="upiId" 
                          placeholder="yourname@upi" 
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          disabled={isProcessing}
                          required
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Enter your UPI ID to make a quick and secure payment. You will receive a payment request on your UPI app.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="netbanking">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input 
                          id="bankName" 
                          placeholder="Your bank name" 
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          disabled={isProcessing}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input 
                          id="accountNumber" 
                          placeholder="Your account number" 
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                          disabled={isProcessing}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="ifscCode">IFSC Code</Label>
                        <Input 
                          id="ifscCode" 
                          placeholder="ABCD0123456" 
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                          disabled={isProcessing}
                          required
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {errorMessage && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errorMessage}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>Ticket details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event:</span>
                      <span className="font-medium">{eventName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ticket Type:</span>
                      <span className="font-medium">{ticketType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">1</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>₹{amount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={processPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <div>Pay ₹{amount}</div>
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              <div className="mt-4 text-xs text-gray-500 space-y-2">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure payment
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Your data is protected
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
