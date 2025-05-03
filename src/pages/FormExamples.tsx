import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useLocation } from 'react-router-dom';
import { AlertCircle, Calendar, Check, CreditCard, Landmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { useStore } from '../store/StoreContext';

export const FormExamples = observer(() => {
  const { notificationStore } = useStore();
  const location = useLocation();
  const isAdvancedForm = location.pathname === '/forms/advanced';
  
  // Basic form state
  const [basicForm, setBasicForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  
  // Advanced form state (account details)
  const [accountForm, setAccountForm] = useState({
    accountType: 'personal',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    branch: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: ''
    },
    isDefault: false
  });
  
  // Form validation errors
  const [basicFormErrors, setBasicFormErrors] = useState<{[key: string]: string}>({});
  const [accountFormErrors, setAccountFormErrors] = useState<{[key: string]: string}>({});
  
  // Handle basic form change
  const handleBasicFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBasicForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is modified
    if (basicFormErrors[name]) {
      setBasicFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle account form change
  const handleAccountFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle checkbox
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAccountForm(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    // Handle nested fields (address)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setAccountForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as object,
          [child]: value
        }
      }));
    } else {
      setAccountForm(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is modified
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (accountFormErrors[`${parent}.${child}`]) {
        setAccountFormErrors(prev => ({ ...prev, [`${parent}.${child}`]: '' }));
      }
    } else if (accountFormErrors[name]) {
      setAccountFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Validate basic form
  const validateBasicForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!basicForm.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!basicForm.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!basicForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(basicForm.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (basicForm.phone && !/^[0-9+\-() ]+$/.test(basicForm.phone)) {
      errors.phone = 'Phone number can only contain numbers and symbols';
    }
    
    setBasicFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validate account form
  const validateAccountForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!accountForm.accountName.trim()) {
      errors.accountName = 'Account name is required';
    }
    
    if (!accountForm.accountNumber.trim()) {
      errors.accountNumber = 'Account number is required';
    } else if (!/^\d{8,17}$/.test(accountForm.accountNumber)) {
      errors.accountNumber = 'Account number must be 8-17 digits';
    }
    
    if (!accountForm.routingNumber.trim()) {
      errors.routingNumber = 'Routing number is required';
    } else if (!/^\d{9}$/.test(accountForm.routingNumber)) {
      errors.routingNumber = 'Routing number must be 9 digits';
    }
    
    if (!accountForm.bankName.trim()) {
      errors.bankName = 'Bank name is required';
    }
    
    if (!accountForm.address.street.trim()) {
      errors['address.street'] = 'Street address is required';
    }
    
    if (!accountForm.address.city.trim()) {
      errors['address.city'] = 'City is required';
    }
    
    if (!accountForm.address.state.trim()) {
      errors['address.state'] = 'State is required';
    }
    
    if (!accountForm.address.zip.trim()) {
      errors['address.zip'] = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(accountForm.address.zip)) {
      errors['address.zip'] = 'Please enter a valid ZIP code';
    }
    
    setAccountFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Submit basic form
  const handleBasicFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateBasicForm()) {
      // Form is valid, submit data
      notificationStore.addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Form Submitted',
        message: 'Your information has been submitted successfully.',
        duration: 5000
      });
      
      // Reset form
      setBasicForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: ''
      });
    } else {
      notificationStore.addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Form Error',
        message: 'Please check the form for errors.',
        duration: 5000
      });
    }
  };
  
  // Submit account form
  const handleAccountFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateAccountForm()) {
      // Form is valid, submit data
      notificationStore.addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Account Added',
        message: 'Your bank account has been added successfully.',
        duration: 5000
      });
      
      // Don't reset form for demo purposes
    } else {
      notificationStore.addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Form Error',
        message: 'Please check the form for errors.',
        duration: 5000
      });
    }
  };
  
  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1>{isAdvancedForm ? 'Advanced Form Example' : 'Form Examples'}</h1>
        </div>
        
        {!isAdvancedForm && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Contact Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBasicFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                      First Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={basicForm.firstName}
                      onChange={handleBasicFormChange}
                      className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                                 ${basicFormErrors.firstName ? 'border-destructive' : 'border-input'}`}
                      aria-invalid={basicFormErrors.firstName ? 'true' : 'false'}
                      aria-describedby={basicFormErrors.firstName ? 'firstName-error' : undefined}
                    />
                    {basicFormErrors.firstName && (
                      <div id="firstName-error" className="text-destructive text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {basicFormErrors.firstName}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                      Last Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={basicForm.lastName}
                      onChange={handleBasicFormChange}
                      className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                                 ${basicFormErrors.lastName ? 'border-destructive' : 'border-input'}`}
                      aria-invalid={basicFormErrors.lastName ? 'true' : 'false'}
                      aria-describedby={basicFormErrors.lastName ? 'lastName-error' : undefined}
                    />
                    {basicFormErrors.lastName && (
                      <div id="lastName-error" className="text-destructive text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {basicFormErrors.lastName}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={basicForm.email}
                    onChange={handleBasicFormChange}
                    className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                               ${basicFormErrors.email ? 'border-destructive' : 'border-input'}`}
                    aria-invalid={basicFormErrors.email ? 'true' : 'false'}
                    aria-describedby={basicFormErrors.email ? 'email-error' : undefined}
                  />
                  {basicFormErrors.email && (
                    <div id="email-error" className="text-destructive text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {basicFormErrors.email}
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={basicForm.phone}
                    onChange={handleBasicFormChange}
                    className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                               ${basicFormErrors.phone ? 'border-destructive' : 'border-input'}`}
                    aria-invalid={basicFormErrors.phone ? 'true' : 'false'}
                    aria-describedby={basicFormErrors.phone ? 'phone-error' : undefined}
                    placeholder="(123) 456-7890"
                  />
                  {basicFormErrors.phone && (
                    <div id="phone-error" className="text-destructive text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {basicFormErrors.phone}
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={basicForm.message}
                    onChange={handleBasicFormChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit"
                    tooltip="Submit the contact form"
                  >
                    Submit
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        {(isAdvancedForm || !isAdvancedForm) && (
          <Card>
            <CardHeader>
              <CardTitle>Bank Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccountFormSubmit} className="space-y-4">
                <div className="mb-6">
                  <div className="text-sm font-medium mb-3">Account Type</div>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="accountType"
                        value="personal"
                        checked={accountForm.accountType === 'personal'}
                        onChange={handleAccountFormChange}
                        className="h-4 w-4 border-input border text-primary focus:ring-primary"
                      />
                      <span>Personal</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="accountType"
                        value="business"
                        checked={accountForm.accountType === 'business'}
                        onChange={handleAccountFormChange}
                        className="h-4 w-4 border-input border text-primary focus:ring-primary"
                      />
                      <span>Business</span>
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="accountName" className="block text-sm font-medium mb-1">
                      Account Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="accountName"
                      name="accountName"
                      type="text"
                      value={accountForm.accountName}
                      onChange={handleAccountFormChange}
                      className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                                 ${accountFormErrors.accountName ? 'border-destructive' : 'border-input'}`}
                      aria-invalid={accountFormErrors.accountName ? 'true' : 'false'}
                    />
                    {accountFormErrors.accountName && (
                      <div className="text-destructive text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {accountFormErrors.accountName}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="bankName" className="block text-sm font-medium mb-1">
                      Bank Name <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Landmark className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        id="bankName"
                        name="bankName"
                        type="text"
                        value={accountForm.bankName}
                        onChange={handleAccountFormChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                                   ${accountFormErrors.bankName ? 'border-destructive' : 'border-input'}`}
                        aria-invalid={accountFormErrors.bankName ? 'true' : 'false'}
                      />
                    </div>
                    {accountFormErrors.bankName && (
                      <div className="text-destructive text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {accountFormErrors.bankName}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="accountNumber" className="block text-sm font-medium mb-1">
                      Account Number <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        id="accountNumber"
                        name="accountNumber"
                        type="text"
                        value={accountForm.accountNumber}
                        onChange={handleAccountFormChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                                   ${accountFormErrors.accountNumber ? 'border-destructive' : 'border-input'}`}
                        aria-invalid={accountFormErrors.accountNumber ? 'true' : 'false'}
                        maxLength={17}
                      />
                    </div>
                    {accountFormErrors.accountNumber && (
                      <div className="text-destructive text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {accountFormErrors.accountNumber}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="routingNumber" className="block text-sm font-medium mb-1">
                      Routing Number <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="routingNumber"
                      name="routingNumber"
                      type="text"
                      value={accountForm.routingNumber}
                      onChange={handleAccountFormChange}
                      className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                                 ${accountFormErrors.routingNumber ? 'border-destructive' : 'border-input'}`}
                      aria-invalid={accountFormErrors.routingNumber ? 'true' : 'false'}
                      maxLength={9}
                    />
                    {accountFormErrors.routingNumber && (
                      <div className="text-destructive text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {accountFormErrors.routingNumber}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="branch" className="block text-sm font-medium mb-1">
                    Branch
                  </label>
                  <input
                    id="branch"
                    name="branch"
                    type="text"
                    value={accountForm.branch}
                    onChange={handleAccountFormChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div className="border border-input rounded-md p-4">
                  <h3 className="font-medium mb-3">Bank Address</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="address.street" className="block text-sm font-medium mb-1">
                        Street Address <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="address.street"
                        name="address.street"
                        type="text"
                        value={accountForm.address.street}
                        onChange={handleAccountFormChange}
                        className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                                   ${accountFormErrors['address.street'] ? 'border-destructive' : 'border-input'}`}
                        aria-invalid={accountFormErrors['address.street'] ? 'true' : 'false'}
                      />
                      {accountFormErrors['address.street'] && (
                        <div className="text-destructive text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {accountFormErrors['address.street']}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="address.city" className="block text-sm font-medium mb-1">
                          City <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="address.city"
                          name="address.city"
                          type="text"
                          value={accountForm.address.city}
                          onChange={handleAccountFormChange}
                          className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                                     ${accountFormErrors['address.city'] ? 'border-destructive' : 'border-input'}`}
                          aria-invalid={accountFormErrors['address.city'] ? 'true' : 'false'}
                        />
                        {accountFormErrors['address.city'] && (
                          <div className="text-destructive text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {accountFormErrors['address.city']}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="address.state" className="block text-sm font-medium mb-1">
                          State <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="address.state"
                          name="address.state"
                          type="text"
                          value={accountForm.address.state}
                          onChange={handleAccountFormChange}
                          className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                                     ${accountFormErrors['address.state'] ? 'border-destructive' : 'border-input'}`}
                          aria-invalid={accountFormErrors['address.state'] ? 'true' : 'false'}
                        />
                        {accountFormErrors['address.state'] && (
                          <div className="text-destructive text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {accountFormErrors['address.state']}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="address.zip" className="block text-sm font-medium mb-1">
                          ZIP Code <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="address.zip"
                          name="address.zip"
                          type="text"
                          value={accountForm.address.zip}
                          onChange={handleAccountFormChange}
                          className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                                     ${accountFormErrors['address.zip'] ? 'border-destructive' : 'border-input'}`}
                          aria-invalid={accountFormErrors['address.zip'] ? 'true' : 'false'}
                          maxLength={10}
                        />
                        {accountFormErrors['address.zip'] && (
                          <div className="text-destructive text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {accountFormErrors['address.zip']}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="isDefault"
                    name="isDefault"
                    type="checkbox"
                    checked={accountForm.isDefault}
                    onChange={handleAccountFormChange}
                    className="h-4 w-4 border-input text-primary focus:ring-primary rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 text-sm font-medium">
                    Set as default payment method
                  </label>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    tooltip="Add this bank account to your payment methods"
                  >
                    Add Bank Account
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
});

// Simple icon components to avoid importing large libraries
const User: React.FC<any> = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const Briefcase: React.FC<any> = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

export default FormExamples;
