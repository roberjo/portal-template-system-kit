# Styling Guide

This guide outlines our approach to styling components using Tailwind CSS and the conventions we follow.

## Styling Philosophy

Our styling approach is built on these principles:

1. **Utility-first** - We use Tailwind's utility classes for most styling needs
2. **Design system** - We follow a consistent design system using design tokens
3. **Component-based** - Styling should be encapsulated within components
4. **Responsive design** - All components should be responsive by default

## Tailwind CSS Usage

### Basic Usage

Use Tailwind's utility classes directly in your JSX:

```tsx
function Button({ children }) {
  return (
    <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
      {children}
    </button>
  );
}
```

### Using the `cn` Utility

For conditional or dynamic classes, use the `cn` utility function:

```tsx
import { cn } from "@/lib/utils";

function Button({ variant = "primary", size = "medium", className, children }) {
  return (
    <button
      className={cn(
        // Base styles
        "font-medium rounded",
        
        // Variant styles
        variant === "primary" && "bg-blue-500 hover:bg-blue-600 text-white",
        variant === "secondary" && "bg-gray-200 hover:bg-gray-300 text-gray-800",
        
        // Size styles
        size === "small" && "py-1 px-3 text-sm",
        size === "medium" && "py-2 px-4",
        size === "large" && "py-3 px-6 text-lg",
        
        // Allow overrides
        className
      )}
    >
      {children}
    </button>
  );
}
```

## Design Tokens

Use our design tokens (via Tailwind's theme) instead of hardcoded values:

```tsx
// Good
<div className="bg-primary text-primary-foreground p-4">
  <h2 className="text-xl font-semibold">Heading</h2>
</div>

// Bad
<div className="bg-blue-500 text-white p-4">
  <h2 className="text-xl font-semibold">Heading</h2>
</div>
```

### Color Tokens

| Token | Purpose | Example |
|-------|---------|---------|
| `primary` | Primary brand color | `bg-primary`, `text-primary` |
| `secondary` | Secondary brand color | `bg-secondary`, `text-secondary` |
| `accent` | Accent color for highlights | `bg-accent`, `text-accent` |
| `destructive` | Destructive actions (delete, remove) | `bg-destructive`, `text-destructive-foreground` |
| `muted` | Subdued elements | `bg-muted`, `text-muted-foreground` |
| `card` | Card backgrounds | `bg-card`, `text-card-foreground` |
| `background` | Page backgrounds | `bg-background`, `text-foreground` |

### Spacing System

Follow our spacing scale:

| Token | Size | Use case |
|-------|------|----------|
| `px` | 1px | Borders |
| `0.5` | 0.125rem | Tiny spacing |
| `1` | 0.25rem | Very small spacing |
| `2` | 0.5rem | Small spacing |
| `4` | 1rem | Default spacing |
| `6` | 1.5rem | Medium spacing |
| `8` | 2rem | Large spacing |
| `10` | 2.5rem | Extra large spacing |
| `12` | 3rem | Very large spacing |

Apply spacing using the padding (`p-`, `px-`, `py-`, `pt-`, etc.) and margin (`m-`, `mx-`, `my-`, `mt-`, etc.) utilities.

### Typography Scale

Use consistent typography:

| Token | Size | Use case |
|-------|------|----------|
| `xs` | 0.75rem | Very small text |
| `sm` | 0.875rem | Small text |
| `base` | 1rem | Body text |
| `lg` | 1.125rem | Large text |
| `xl` | 1.25rem | Subheadings |
| `2xl` | 1.5rem | Headings |
| `3xl` | 1.875rem | Large headings |
| `4xl` | 2.25rem | Very large headings |

## Responsive Design

Use responsive utilities to adapt your UI to different screen sizes:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

### Breakpoints

| Breakpoint | Width | Prefix |
|------------|-------|--------|
| Mobile (default) | 0px+ | (none) |
| Small | 640px+ | `sm:` |
| Medium | 768px+ | `md:` |
| Large | 1024px+ | `lg:` |
| Extra Large | 1280px+ | `xl:` |
| 2XL | 1536px+ | `2xl:` |

Always design mobile-first, then add responsive utilities for larger screens.

## Dark Mode

Support dark mode using the `dark:` variant:

```tsx
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
  {/* Content */}
</div>
```

## Best Practices

### Component Styling

1. **Be consistent** with similar components
2. **Use meaningful class order** (layout → typography → colors → effects)
3. **Consider different states** (hover, focus, active, disabled)
4. **Keep classes organized** (group related classes together)

```tsx
// Good class order
<button className="
  flex items-center justify-center gap-2   /* Layout */
  h-10 px-4 py-2                           /* Sizing */
  text-sm font-medium                       /* Typography */
  bg-primary text-primary-foreground       /* Colors */
  rounded-md shadow-sm                     /* Shapes/Borders */
  hover:bg-primary/90 focus:outline-none   /* States */
  focus-visible:ring-2                     /* Focus rings */
  disabled:opacity-50                      /* Disabled state */
">
  {children}
</button>
```

### Layout Best Practices

1. **Use Flexbox and Grid** for layout
2. **Prefer relative units** (rem, em, %) over absolute units (px)
3. **Use gap utilities** instead of margins when possible
4. **Use container queries** for component-specific responsiveness

### Avoiding Common Issues

1. **Don't use inline styles** - Use Tailwind classes instead
2. **Avoid !important** - Refactor your CSS to avoid specificity issues
3. **Don't override component styles** outside the component
4. **Use plugins responsibly** - Only add plugins when absolutely necessary

## Custom Components

When building custom components that need styles beyond what Tailwind provides:

1. **Create a separate component file**
2. **Use the `cva` utility** for variants
3. **Export variants from a separate file**
4. **Document the styling in the component**

## Maintainability

1. **Extract common patterns** to utility components
2. **Comment complex class combinations**
3. **Use consistent naming** across similar components
4. **Regularly review and refactor** styling patterns

By following these guidelines, we can maintain a consistent, maintainable, and responsive UI across the application. 