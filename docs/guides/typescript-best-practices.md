# TypeScript Best Practices Guide

This guide provides recommendations for improving type safety in our codebase.

## Replacing `any` with Better Types

The TypeScript `any` type should be avoided as it bypasses type checking. Instead:

1. **Create specific interfaces** for your data:
   ```typescript
   // Instead of:
   function processUser(user: any) { ... }
   
   // Do this:
   interface User {
     id: string;
     name: string;
     email: string;
     role: 'admin' | 'user';
   }
   
   function processUser(user: User) { ... }
   ```

2. **Use `unknown` for truly unknown values**, then perform type narrowing:
   ```typescript
   function processUnknownData(data: unknown) {
     // Type narrowing
     if (typeof data === 'string') {
       // Now TypeScript knows data is a string
       return data.toUpperCase();
     }
     
     if (Array.isArray(data)) {
       // Now TypeScript knows data is an array
       return data.length;
     }
     
     return null;
   }
   ```

3. **Use `Record<string, unknown>` for objects with unknown properties**:
   ```typescript
   function processObject(obj: Record<string, unknown>) {
     // Better than Record<string, any>
     const keys = Object.keys(obj);
     // ...
   }
   ```

4. **Use generics to preserve type information**:
   ```typescript
   function getFirstItem<T>(items: T[]): T | undefined {
     return items[0];
   }
   ```

## Fixing React Hooks

Common issues with React Hooks involve missing dependencies:

1. **Include all dependencies in dependency arrays**:
   ```typescript
   // Instead of:
   useEffect(() => {
     fetchData(userId);
   }, []); // Missing userId dependency
   
   // Do this:
   useEffect(() => {
     fetchData(userId);
   }, [userId]);
   ```

2. **Use `useCallback` for function dependencies**:
   ```typescript
   // Instead of creating functions inside effects:
   const handleSubmit = useCallback(() => {
     // Function logic
   }, [/* dependencies */]);
   
   useEffect(() => {
     document.addEventListener('submit', handleSubmit);
     return () => document.removeEventListener('submit', handleSubmit);
   }, [handleSubmit]);
   ```

3. **Move complex logic outside components when appropriate**:
   ```typescript
   // Utility function outside component
   function calculateTotal(items: LineItem[]): number {
     return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
   }
   
   function ShoppingCart({ items }: CartProps) {
     // Use the utility
     const total = useMemo(() => calculateTotal(items), [items]);
     // ...
   }
   ```

## Component Export Best Practices

To improve compatibility with fast refresh:

1. **Move constants and utility functions to separate files**:
   ```typescript
   // button-variants.ts
   export const buttonVariants = { /* ... */ };
   
   // button.tsx
   import { buttonVariants } from './button-variants';
   ```

2. **Only export components from component files**

## Gradual Adoption Strategy

1. Apply strict rules to new code first
2. Fix the most error-prone parts of existing code
3. Use TypeScript project references for incremental adoption
4. Consider using `// @ts-expect-error` temporarily (with explanatory comments)

## Type-Safe API Clients

1. Create response interfaces for your API endpoints
2. Leverage generic types to make your API clients type-safe
3. Consider using OpenAPI/Swagger code generation tools

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [ESLint TypeScript Plugin](https://typescript-eslint.io/) 