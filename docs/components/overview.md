# Component Library Overview

The Portal Template System Kit includes a comprehensive component library built on top of [shadcn/ui](https://ui.shadcn.com/) and [Radix UI](https://www.radix-ui.com/) primitives. This document provides an overview of the component system and how to use it effectively.

## Component Architecture

Our component architecture follows a layered approach:

1. **UI Primitives** - Low-level UI components from Radix UI
2. **Base Components** - Styled primitives with Tailwind CSS (shadcn/ui)
3. **Composite Components** - Combinations of base components for common patterns
4. **Feature Components** - Domain-specific components for particular features

## Component Categories

The component library is organized into several categories:

### UI Components

Basic UI elements that form the building blocks of the interface:

- Buttons
- Inputs
- Dropdowns
- Modals
- Tooltips
- Cards
- Notifications
- etc.

### Layout Components

Components that define the structure and layout of pages:

- Header
- Sidebar
- Footer
- PageLayout
- Dashboard layouts
- Grid systems

### Form Components

Components specifically designed for form handling:

- Form fields
- Validation displays
- Form groups
- Specialized inputs (date pickers, selectors, etc.)

### Data Display Components

Components for displaying and visualizing data:

- Tables
- DataGrid
- Charts
- Graphs
- Lists

## Using Components

### Basic Usage

Components can be imported directly from the components directory:

```tsx
import { Button } from '@/components/ui/button';

function MyComponent() {
  return (
    <Button variant="primary">Click Me</Button>
  );
}
```

### Component Variants

Most components support variants through props:

```tsx
<Button variant="outline" size="sm">Small Outline Button</Button>
<Button variant="destructive" size="lg">Large Destructive Button</Button>
```

### Composition Pattern

Components are designed to be composable:

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function MyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        Card content goes here...
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  );
}
```

## Customizing Components

### Using Props

Components can be customized through props:

```tsx
<Button 
  variant="outline"
  size="lg"
  disabled={isLoading}
  onClick={handleClick}
>
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

### Using Class Names

For additional styling, you can use the `className` prop with Tailwind classes:

```tsx
<Button className="bg-gradient-to-r from-purple-500 to-blue-500">
  Gradient Button
</Button>
```

### Extending Components

To create specialized versions of components:

```tsx
import { Button } from '@/components/ui/button';

function SaveButton({ isSaving, ...props }) {
  return (
    <Button 
      variant="primary" 
      disabled={isSaving}
      {...props}
    >
      {isSaving ? 'Saving...' : 'Save'}
    </Button>
  );
}
```

## Theming

Components respect the application's theme settings:

- Dark/light modes automatically applied
- Theme tokens defined in `tailwind.config.ts`
- Component-specific theme variables

## Accessibility

All components are built with accessibility in mind:

- Keyboard navigation support
- ARIA attributes
- Focus management
- Screen reader compatibility

## Component Documentation

For detailed documentation on specific components, refer to:

- [UI Components](./ui.md)
- [Layout Components](./layout.md)
- [Form Components](./forms.md)

## Best Practices

- Use the existing component library instead of creating new components
- Maintain consistent props and naming conventions
- Follow the composition pattern for complex UIs
- Keep components focused on a single responsibility
- Document props and usage examples for custom components 