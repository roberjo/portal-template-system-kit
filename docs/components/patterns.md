# Component Patterns Guide

This guide outlines common patterns for building components in our application. Following these patterns ensures consistency and maintainability.

## Component Patterns Philosophy

Our component patterns are based on these principles:

1. **Consistency** - Similar components should work in similar ways
2. **Reusability** - Components should be designed for reuse
3. **Composition** - Complex UIs should be composed of simpler components
4. **Separation of concerns** - Separate presentation from logic

## Common Component Patterns

### Compound Components

Use compound components for complex, related UI elements:

```tsx
// Example usage
<Tabs>
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account settings</TabsContent>
  <TabsContent value="password">Change password</TabsContent>
</Tabs>

// Implementation
const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

function Tabs({ children, value, onValueChange, defaultValue }: TabsProps) {
  const [selectedValue, setSelectedValue] = React.useState(value ?? defaultValue);
  
  // Handle controlled & uncontrolled
  const handleValueChange = React.useCallback((newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
  }, [onValueChange]);
  
  const contextValue = React.useMemo(() => ({
    value: value ?? selectedValue,
    onValueChange: handleValueChange,
  }), [value, selectedValue, handleValueChange]);
  
  return (
    <TabsContext.Provider value={contextValue}>
      {children}
    </TabsContext.Provider>
  );
}

function TabsList({ children }: TabsListProps) {
  return (
    <div role="tablist" className="flex border-b">
      {children}
    </div>
  );
}

function TabsTrigger({ children, value }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  const isActive = context?.value === value;
  
  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={cn(
        "px-4 py-2 border-b-2 -mb-px",
        isActive 
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
      onClick={() => context?.onValueChange(value)}
    >
      {children}
    </button>
  );
}

function TabsContent({ children, value }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  const isActive = context?.value === value;
  
  if (!isActive) return null;
  
  return (
    <div role="tabpanel" className="py-4">
      {children}
    </div>
  );
}
```

### Controlled & Uncontrolled Components

Support both controlled and uncontrolled usage:

```tsx
interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function Toggle({ checked, defaultChecked, onCheckedChange, ...props }: ToggleProps) {
  // Track internal state for uncontrolled usage
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
  
  // Determine if component is controlled
  const isControlled = checked !== undefined;
  
  // Use controlled value if provided, otherwise use internal state
  const getChecked = isControlled ? checked : internalChecked;
  
  // Handle changes
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;
    
    // Update internal state if uncontrolled
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    
    // Call callback if provided
    onCheckedChange?.(newChecked);
  };
  
  return (
    <label className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        checked={getChecked}
        onChange={handleChange}
        className="sr-only"
        {...props}
      />
      <div className={cn(
        "h-6 w-11 rounded-full transition-colors",
        getChecked ? "bg-primary" : "bg-muted"
      )}>
        <div className={cn(
          "h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform",
          getChecked && "translate-x-5"
        )} />
      </div>
    </label>
  );
}

// Controlled usage
function ControlledExample() {
  const [checked, setChecked] = useState(false);
  
  return (
    <Toggle 
      checked={checked} 
      onCheckedChange={setChecked} 
    />
  );
}

// Uncontrolled usage
function UncontrolledExample() {
  return (
    <Toggle 
      defaultChecked={true} 
      onCheckedChange={(checked) => console.log(checked)} 
    />
  );
}
```

### Render Props Pattern

Use render props for more flexible components:

```tsx
interface CollapsibleProps {
  children: (state: { isOpen: boolean; toggle: () => void }) => React.ReactNode;
  defaultOpen?: boolean;
}

function Collapsible({ children, defaultOpen = false }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);
  
  return children({ isOpen, toggle });
}

// Usage
<Collapsible>
  {({ isOpen, toggle }) => (
    <div>
      <button onClick={toggle}>
        {isOpen ? 'Hide' : 'Show'} Content
      </button>
      
      {isOpen && (
        <div className="mt-2 p-4 border rounded">
          Collapsible content
        </div>
      )}
    </div>
  )}
</Collapsible>
```

### Higher-Order Components (HOCs)

For adding functionality to components:

```tsx
// HOC for adding loading state
function withLoading<P>(Component: React.ComponentType<P>) {
  return function WithLoading({ isLoading, ...props }: P & { isLoading: boolean }) {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    
    return <Component {...(props as P)} />;
  };
}

// Basic component
function UserProfile({ user }: { user: User }) {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// Enhanced component
const UserProfileWithLoading = withLoading(UserProfile);

// Usage
<UserProfileWithLoading isLoading={loading} user={user} />
```

### Custom Hooks Pattern

Extract component logic into reusable hooks:

```tsx
// Custom hook for form handling
function useForm<T>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);
  
  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const { name } = event.target;
    
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    setValues,
    setErrors,
    setIsSubmitting,
    reset,
  };
}

// Usage
function LoginForm() {
  const form = useForm({ email: '', password: '' });
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    form.setIsSubmitting(true);
    
    try {
      await login(form.values);
      form.reset();
    } catch (error) {
      form.setErrors({ email: 'Invalid credentials' });
    } finally {
      form.setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.values.email}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
        />
        {form.touched.email && form.errors.email && (
          <div className="text-red-500">{form.errors.email}</div>
        )}
      </div>
      
      {/* Similar pattern for password */}
      
      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  );
}
```

### Container/Presentational Pattern

Separate logic from presentation:

```tsx
// Presentational component (just renders props)
interface UserListProps {
  users: User[];
  isLoading: boolean;
  error: string | null;
  onUserClick: (userId: string) => void;
}

function UserListView({ users, isLoading, error, onUserClick }: UserListProps) {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (users.length === 0) return <EmptyState message="No users found" />;
  
  return (
    <ul className="divide-y">
      {users.map((user) => (
        <li 
          key={user.id} 
          className="py-4 cursor-pointer hover:bg-muted"
          onClick={() => onUserClick(user.id)}
        >
          <div className="font-medium">{user.name}</div>
          <div className="text-muted-foreground">{user.email}</div>
        </li>
      ))}
    </ul>
  );
}

// Container component (handles data fetching and state)
function UserListContainer() {
  const { userStore } = useStore();
  const { users, isLoading, error, fetchUsers } = userStore;
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const handleUserClick = useCallback((userId: string) => {
    navigate(`/users/${userId}`);
  }, [navigate]);
  
  return (
    <UserListView
      users={users}
      isLoading={isLoading}
      error={error}
      onUserClick={handleUserClick}
    />
  );
}

// Usage
<UserListContainer />
```

## Form Patterns

### Form Validation

Handle form validation consistently:

```tsx
import { z } from "zod";

// Define validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

// Form component
function LoginForm() {
  const [values, setValues] = useState<LoginValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<LoginValues>>({});
  
  const validate = (data: LoginValues) => {
    try {
      loginSchema.parse(data);
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors.reduce((acc, curr) => {
          const path = curr.path[0] as keyof LoginValues;
          acc[path] = curr.message;
          return acc;
        }, {} as Partial<LoginValues>);
      }
      return {};
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validate(values);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      // Submit form
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## List Patterns

### List with Pagination

Handle lists with pagination:

```tsx
function PaginatedList<T>({ 
  items, 
  renderItem, 
  pageSize = 10,
  totalItems
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  pageSize?: number;
  totalItems: number;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(totalItems / pageSize);
  
  return (
    <div>
      <div className="divide-y">
        {items.map(renderItem)}
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// Usage with MobX store
function UserList() {
  const { userStore } = useStore();
  const { users, totalUsers, fetchUsers, isLoading } = userStore;
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  useEffect(() => {
    fetchUsers({ page, pageSize });
  }, [fetchUsers, page, pageSize]);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <PaginatedList
      items={users}
      totalItems={totalUsers}
      pageSize={pageSize}
      renderItem={(user) => (
        <div key={user.id} className="p-4">
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      )}
    />
  );
}
```

## Best Practices

1. **Prefer composition** over complex props
2. **Keep components focused** on a single responsibility
3. **Extract reusable logic** into custom hooks
4. **Use TypeScript interfaces** for props
5. **Consider accessibility** in all components
6. **Document complex patterns** with code comments
7. **Test interaction patterns** thoroughly

By following these patterns consistently, we create a more maintainable and coherent codebase. 