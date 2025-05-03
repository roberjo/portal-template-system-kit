
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { AlertCircle, Calendar, Check, CreditCard, Landmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import rootStore from '../store/RootStore';

export const FormExamples = observer(() => {
  const { notificationStore } = rootStore;
  
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>Form Examples</h1>
      </div>
      
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
                Email Address <span className="text-destructive">*</span>
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
                Phone Number <span className="text-muted-foreground">(optional)</span>
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
                Message <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={basicForm.message}
                onChange={handleBasicFormChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Submit
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Landmark className="h-5 w-5" />
          <CardTitle>Bank Account Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAccountFormSubmit} className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-md border border-border">
              <h3 className="font-medium mb-4">Account Type</h3>
              <div className="flex flex-wrap gap-4">
                <label className={`
                  relative flex items-center justify-center w-32 h-24 border rounded-md
                  transition-all cursor-pointer
                  ${accountForm.accountType === 'personal' 
                    ? 'border-primary ring-2 ring-primary' 
                    : 'border-input hover:border-primary/50'}
                `}>
                  <input
                    type="radio"
                    name="accountType"
                    value="personal"
                    checked={accountForm.accountType === 'personal'}
                    onChange={handleAccountFormChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="mb-2 flex justify-center">
                      <User className="h-6 w-6" />
                    </div>
                    <span>Personal</span>
                  </div>
                  {accountForm.accountType === 'personal' && (
                    <div className="absolute top-2 right-2 h-4 w-4 bg-primary text-white rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </label>
                
                <label className={`
                  relative flex items-center justify-center w-32 h-24 border rounded-md
                  transition-all cursor-pointer
                  ${accountForm.accountType === 'business' 
                    ? 'border-primary ring-2 ring-primary' 
                    : 'border-input hover:border-primary/50'}
                `}>
                  <input
                    type="radio"
                    name="accountType"
                    value="business"
                    checked={accountForm.accountType === 'business'}
                    onChange={handleAccountFormChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="mb-2 flex justify-center">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <span>Business</span>
                  </div>
                  {accountForm.accountType === 'business' && (
                    <div className="absolute top-2 right-2 h-4 w-4 bg-primary text-white rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="accountName" className="block text-sm font-medium mb-1">
                      Account Holder Name <span className="text-destructive">*</span>
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
                      aria-describedby={accountFormErrors.accountName ? 'accountName-error' : undefined}
                    />
                    {accountFormErrors.accountName && (
                      <div id="accountName-error" className="text-destructive text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {accountFormErrors.accountName}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="bankName" className="block text-sm font-medium mb-1">
                      Bank Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="bankName"
                      name="bankName"
                      type="text"
                      value={accountForm.bankName}
                      onChange={handleAccountFormChange}
                      className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                                ${accountFormErrors.bankName ? 'border-destructive' : 'border-input'}`}
                      aria-invalid={accountFormErrors.bankName ? 'true' : 'false'}
                      aria-describedby={accountFormErrors.bankName ? 'bankName-error' : undefined}
                    />
                    {accountFormErrors.bankName && (
                      <div id="bankName-error" className="text-destructive text-sm mt-1 flex items-center gap-1">
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
                    <input
                      id="accountNumber"
                      name="accountNumber"
                      type="text"
                      value={accountForm.accountNumber}
                      onChange={handleAccountFormChange}
                      className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                                ${accountFormErrors.accountNumber ? 'border-destructive' : 'border-input'}`}
                      aria-invalid={accountFormErrors.accountNumber ? 'true' : 'false'}
                      aria-describedby={accountFormErrors.accountNumber ? 'accountNumber-error' : undefined}
                    />
                    {accountFormErrors.accountNumber && (
                      <div id="accountNumber-error" className="text-destructive text-sm mt-1 flex items-center gap-1">
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
                      aria-describedby={accountFormErrors.routingNumber ? 'routingNumber-error' : undefined}
                    />
                    {accountFormErrors.routingNumber && (
                      <div id="routingNumber-error" className="text-destructive text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {accountFormErrors.routingNumber}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="branch" className="block text-sm font-medium mb-1">
                    Branch Name <span className="text-muted-foreground">(optional)</span>
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
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Bank Address
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="street" className="block text-sm font-medium mb-1">
                    Street Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="street"
                    name="address.street"
                    type="text"
                    value={accountForm.address.street}
                    onChange={handleAccountFormChange}
                    className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                              ${accountFormErrors['address.street'] ? 'border-destructive' : 'border-input'}`}
                    aria-invalid={accountFormErrors['address.street'] ? 'true' : 'false'}
                    aria-describedby={accountFormErrors['address.street'] ? 'street-error' : undefined}
                  />
                  {accountFormErrors['address.street'] && (
                    <div id="street-error" className="text-destructive text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {accountFormErrors['address.street']}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-1">
                      City <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="city"
                      name="address.city"
                      type="text"
                      value={accountForm.address.city}
                      onChange={handleAccountFormChange}
                      className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                                ${accountFormErrors['address.city'] ? 'border-destructive' : 'border-input'}`}
                      aria-invalid={accountFormErrors['address.city'] ? 'true' : 'false'}
                      aria-describedby={accountFormErrors['address.city'] ? 'city-error' : undefined}
                    />
                    {accountFormErrors['address.city'] && (
                      <div id="city-error" className="text-destructive text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {accountFormErrors['address.city']}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium mb-1">
                      State <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="state"
                      name="address.state"
                      value={accountForm.address.state}
                      onChange={handleAccountFormChange}
                      className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                                ${accountFormErrors['address.state'] ? 'border-destructive' : 'border-input'}`}
                      aria-invalid={accountFormErrors['address.state'] ? 'true' : 'false'}
                      aria-describedby={accountFormErrors['address.state'] ? 'state-error' : undefined}
                    >
                      <option value="">Select State</option>
                      <option value="CA">California</option>
                      <option value="NY">New York</option>
                      <option value="TX">Texas</option>
                      <option value="FL">Florida</option>
                      <option value="IL">Illinois</option>
                    </select>
                    {accountFormErrors['address.state'] && (
                      <div id="state-error" className="text-destructive text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {accountFormErrors['address.state']}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="zip" className="block text-sm font-medium mb-1">
                      ZIP Code <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="zip"
                      name="address.zip"
                      type="text"
                      value={accountForm.address.zip}
                      onChange={handleAccountFormChange}
                      className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary
                                ${accountFormErrors['address.zip'] ? 'border-destructive' : 'border-input'}`}
                      aria-invalid={accountFormErrors['address.zip'] ? 'true' : 'false'}
                      aria-describedby={accountFormErrors['address.zip'] ? 'zip-error' : undefined}
                    />
                    {accountFormErrors['address.zip'] && (
                      <div id="zip-error" className="text-destructive text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {accountFormErrors['address.zip']}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="isDefault"
                name="isDefault"
                type="checkbox"
                checked={accountForm.isDefault}
                onChange={handleAccountFormChange}
                className="h-4 w-4 border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <label htmlFor="isDefault" className="text-sm">
                Set as default account
              </label>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Add Account
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
});

// For the user components, we need a few more components for the form
const User: React.FC<any> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const Briefcase: React.FC<any> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

export default FormExamples;
