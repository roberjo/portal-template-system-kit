# UI Components Guide

This guide outlines the patterns and conventions for using and creating UI components in our project.

## Component Design Philosophy

Our UI components follow these principles:

1. **Composition over inheritance** - Components are designed to be composed together
2. **Accessibility first** - All components should be accessible by default
3. **Consistent API** - Similar components should have similar props and behavior
4. **Customizable but opinionated** - Components have sensible defaults but allow customization

## Component Structure

UI components should follow this structure:

```tsx
// 1. Imports
import * as React from "react"
import { cn } from "@/lib/utils"

// 2. Types/interfaces (if needed)
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive"
  size?: "default" | "sm" | "lg"
}

// 3. Component definition
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "rounded-md font-medium transition-colors focus-visible:outline-none",
          // Apply variant classes
          // Apply size classes
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

// 4. Display name
Button.displayName = "Button"
```

## Component Variants

Prefer using [class-variance-authority (CVA)](https://cva.style/docs) for component variants. Place variants in separate files:

```tsx
// button-variants.ts
import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "rounded-md font-medium transition-colors focus-visible:outline-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## Component Props

1. **Prefer HTML attributes** - Extend from React's HTML element attributes when possible
2. **Use semantic props** - Props should convey meaning (e.g., `variant` instead of `color`)
3. **Consistent naming** - Follow these conventions:
   - `on{Event}` for event handlers (e.g., `onClick`)
   - Boolean props should be phrased positively (e.g., `isOpen` not `isClosed`)
   - Use the same name for similar props across components

## Using forwardRef

Use `React.forwardRef` for all components that render HTML elements to allow ref forwarding.

```tsx
const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  (props, ref) => {
    return <div ref={ref} {...props} />
  }
)
```

## Styling Conventions

1. **Use Tailwind** for styling components
2. **Use cn utility** for conditional class names:

```tsx
import { cn } from "@/lib/utils"

function Component({ className, disabled }) {
  return (
    <div className={cn(
      "base-styles",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}>
      {/* Content */}
    </div>
  )
}
```

3. **Follow design token system** - Use design tokens for colors, spacing, etc.:
   - Use `text-primary` instead of explicit colors
   - Use spacing utilities like `p-4` following the design system

## Accessibility

1. **Include ARIA attributes** where needed
2. **Support keyboard navigation**
3. **Provide accessible labels**
4. **Ensure sufficient color contrast**

## Testing UI Components

1. Test basic rendering
2. Test different variants
3. Test user interactions
4. Test accessibility

Example:

```tsx
describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button")).toHaveTextContent("Click me")
  })

  it("handles clicks", () => {
    const onClickMock = jest.fn()
    render(<Button onClick={onClickMock}>Click me</Button>)
    userEvent.click(screen.getByRole("button"))
    expect(onClickMock).toHaveBeenCalledTimes(1)
  })
})
```

## Common Patterns

### Compound Components

For complex components, use the compound component pattern:

```tsx
// Good
<Tabs>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>

// Instead of
<Tabs 
  tabs={[
    { label: "Tab 1", content: "Content 1", value: "tab1" },
    { label: "Tab 2", content: "Content 2", value: "tab2" }
  ]} 
/>
```

### Controlled & Uncontrolled Components

Support both controlled and uncontrolled usage:

```tsx
function Accordion({ 
  value, 
  defaultValue, 
  onValueChange 
}: AccordionProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const isControlled = value !== undefined
  
  const currentValue = isControlled ? value : internalValue
  
  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }
  
  // Use currentValue and handleValueChange
}
``` 