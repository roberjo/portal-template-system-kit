
import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'elevated';
  interactive?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  interactive = false,
  className,
  children,
  ...props
}) => {
  const baseStyles = "rounded-lg overflow-hidden";
  
  const variantStyles = {
    default: "bg-card border border-border",
    outline: "border border-border",
    elevated: "bg-card shadow-lg",
  };
  
  const interactiveStyles = interactive 
    ? "hover:border-primary/50 hover:shadow-md transition-all cursor-pointer" 
    : "";
  
  return (
    <div 
      className={cn(
        baseStyles, 
        variantStyles[variant], 
        interactiveStyles, 
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div 
      className={cn("p-4 border-b border-border", className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h3 
      className={cn("text-lg font-semibold", className)}
      {...props}
    >
      {children}
    </h3>
  );
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div 
      className={cn("p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div 
      className={cn("p-4 border-t border-border", className)}
      {...props}
    >
      {children}
    </div>
  );
};
