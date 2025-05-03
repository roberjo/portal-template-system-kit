import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useLocation } from 'react-router-dom';
import { 
  AlertCircle, Calendar, Check, CreditCard, Landmark, User as UserIcon, 
  Mail, Phone, MessageSquare, ChevronRight, 
  Info, Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { useStore } from '../store/StoreContext';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

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
  
  // Form input component for consistent styling
  const FormInput = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    required = false,
    icon = null,
    placeholder = '',
    maxLength,
    className = '',
    description
  }: {
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    error?: string;
    required?: boolean;
    icon?: React.ReactNode;
    placeholder?: string;
    maxLength?: number;
    className?: string;
    description?: string;
  }) => (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={name} className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
        {description && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help text-muted-foreground">
                <Info className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              {description}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full ${icon ? 'pl-10' : 'px-4'} py-2.5 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all
                       ${error ? 'border-destructive' : 'border-input'}`}
            placeholder={placeholder}
            rows={4}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${name}-error` : undefined}
          ></textarea>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            className={`w-full ${icon ? 'pl-10' : 'px-4'} py-2.5 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all
                       ${error ? 'border-destructive' : 'border-input'}`}
            placeholder={placeholder}
            maxLength={maxLength}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${name}-error` : undefined}
          />
        )}
      </div>
      {error && (
        <div id={`${name}-error`} className="text-destructive text-sm mt-1.5 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
  
  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{isAdvancedForm ? 'Advanced Form Example' : 'Form Examples'}</h1>
          <p className="text-muted-foreground">
            {isAdvancedForm ? 'Complete financial account setup with validation' : 'Examples of forms with different complexity levels'}
          </p>
        </div>
        
        {!isAdvancedForm && (
          <Card className="overflow-hidden border-muted/30 shadow-sm">
            <CardHeader className="bg-muted/20 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Contact Information</CardTitle>
                  <CardDescription>Please provide your contact details</CardDescription>
                </div>
                <Badge variant="outline" className="px-3 py-1">
                  Basic Form
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleBasicFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="First Name"
                    name="firstName"
                    value={basicForm.firstName}
                    onChange={handleBasicFormChange}
                    error={basicFormErrors.firstName}
                    required
                    icon={<UserIcon className="h-4 w-4" />}
                  />
                  
                  <FormInput
                    label="Last Name"
                    name="lastName"
                    value={basicForm.lastName}
                    onChange={handleBasicFormChange}
                    error={basicFormErrors.lastName}
                    required
                    icon={<UserIcon className="h-4 w-4" />}
                  />
                </div>
                
                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={basicForm.email}
                  onChange={handleBasicFormChange}
                  error={basicFormErrors.email}
                  required
                  icon={<Mail className="h-4 w-4" />}
                  placeholder="you@example.com"
                />
                
                <FormInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={basicForm.phone}
                  onChange={handleBasicFormChange}
                  error={basicFormErrors.phone}
                  icon={<Phone className="h-4 w-4" />}
                  placeholder="(123) 456-7890"
                  description="Used only for important notifications"
                />
                
                <FormInput
                  label="Message"
                  name="message"
                  type="textarea"
                  value={basicForm.message}
                  onChange={handleBasicFormChange}
                  icon={<MessageSquare className="h-4 w-4" />}
                  placeholder="How can we help you?"
                />
                
                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit"
                    size="lg"
                    className="px-6"
                  >
                    Submit Request
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        {(isAdvancedForm || !isAdvancedForm) && (
          <Card className="overflow-hidden border-muted/30 shadow-sm">
            <CardHeader className="bg-muted/20 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Bank Account Information</CardTitle>
                  <CardDescription>Add a bank account for payments and transfers</CardDescription>
                </div>
                <Badge variant="outline" className="px-3 py-1">
                  {isAdvancedForm ? 'Advanced Form' : 'Financial Form'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAccountFormSubmit} className="space-y-6">
                <div className="bg-muted/10 rounded-lg p-4 border border-muted mb-2">
                  <div className="text-sm font-medium mb-3">Select Account Type</div>
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
                      <span>Personal Account</span>
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
                      <span>Business Account</span>
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Account Name"
                    name="accountName"
                    value={accountForm.accountName}
                    onChange={handleAccountFormChange}
                    error={accountFormErrors.accountName}
                    required
                    placeholder={accountForm.accountType === 'personal' ? "John Doe" : "ABC Company, Inc."}
                    description="Name as it appears on your account"
                  />
                  
                  <FormInput
                    label="Bank Name"
                    name="bankName"
                    value={accountForm.bankName}
                    onChange={handleAccountFormChange}
                    error={accountFormErrors.bankName}
                    required
                    icon={<Landmark className="h-4 w-4" />}
                    placeholder="Enter bank name"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label="Account Number"
                    name="accountNumber"
                    value={accountForm.accountNumber}
                    onChange={handleAccountFormChange}
                    error={accountFormErrors.accountNumber}
                    required
                    icon={<CreditCard className="h-4 w-4" />}
                    maxLength={17}
                    description="Your bank account number (8-17 digits)"
                  />
                  
                  <FormInput
                    label="Routing Number"
                    name="routingNumber"
                    value={accountForm.routingNumber}
                    onChange={handleAccountFormChange}
                    error={accountFormErrors.routingNumber}
                    required
                    maxLength={9}
                    description="9-digit routing number for your bank"
                  />
                </div>
                
                <FormInput
                  label="Branch Name"
                  name="branch"
                  value={accountForm.branch}
                  onChange={handleAccountFormChange}
                  icon={<Building className="h-4 w-4" />}
                  placeholder="Main Branch"
                />
                
                <div className="mt-2">
                  <Separator className="my-6" />
                  <div className="flex items-center mb-4">
                    <h3 className="font-medium">Bank Address Information</h3>
                    <div className="ml-2 text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">Required</div>
                  </div>
                  
                  <div className="space-y-6">
                    <FormInput
                      label="Street Address"
                      name="address.street"
                      value={accountForm.address.street}
                      onChange={handleAccountFormChange}
                      error={accountFormErrors['address.street']}
                      required
                      placeholder="123 Main St"
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormInput
                        label="City"
                        name="address.city"
                        value={accountForm.address.city}
                        onChange={handleAccountFormChange}
                        error={accountFormErrors['address.city']}
                        required
                      />
                      
                      <FormInput
                        label="State"
                        name="address.state"
                        value={accountForm.address.state}
                        onChange={handleAccountFormChange}
                        error={accountFormErrors['address.state']}
                        required
                      />
                      
                      <FormInput
                        label="ZIP Code"
                        name="address.zip"
                        value={accountForm.address.zip}
                        onChange={handleAccountFormChange}
                        error={accountFormErrors['address.zip']}
                        required
                        maxLength={10}
                        placeholder="12345"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center pt-2 mt-4 bg-muted/10 p-3 rounded-md">
                  <input
                    id="isDefault"
                    name="isDefault"
                    type="checkbox"
                    checked={accountForm.isDefault}
                    onChange={handleAccountFormChange}
                    className="h-5 w-5 border-input text-primary focus:ring-primary rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 text-sm font-medium">
                    Set as default payment method
                  </label>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="px-6"
                  >
                    Add Bank Account
                    <ChevronRight className="ml-2 h-4 w-4" />
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

export default FormExamples;
