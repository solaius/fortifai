# PatternFly v6 Compatibility Issues and Migration Guide

## Overview
This document details the compatibility issues encountered when migrating from PatternFly v5 to v6 in the FortifAI project, along with their solutions and best practices for future migrations.

## Issue Summary
During the migration to PatternFly v6, several breaking changes were encountered that required systematic updates to component imports, prop usage, and component structure. The migration was completed successfully without downgrading, maintaining forward compatibility.

## Detailed Issues and Solutions

### 1. Badge Variant Enum Removal
**Issue**: `BadgeVariant` enum was removed in PatternFly v6
**Error**: `The requested module does not provide an export named 'BadgeVariant'`

**Solution**: Replace enum usage with string literals
```typescript
// Before (PatternFly v5)
import { BadgeVariant } from '@patternfly/react-core';
<Badge variant={BadgeVariant.outline}>

// After (PatternFly v6)
<Badge variant="outline">
```

**Files Updated**:
- `src/components/Secrets/SecretCard.tsx`
- `src/components/Secrets/SecretFilters.tsx`
- `src/components/Bindings/BindingCard.tsx`

**String Mappings**:
- `BadgeVariant.outline` → `"outline"`
- `BadgeVariant.danger` → `"danger"`
- `BadgeVariant.read` → `"read"`
- `BadgeVariant.success` → `"success"`
- `BadgeVariant.warning` → `"warning"`

### 2. CardActions Component Replacement
**Issue**: `CardActions` component was replaced by `CardFooter` in PatternFly v6
**Error**: `The requested module does not provide an export named 'CardActions'`

**Solution**: Replace `CardActions` with `CardFooter`
```typescript
// Before (PatternFly v5)
import { CardActions } from '@patternfly/react-core';
<CardActions>

// After (PatternFly v6)
import { CardFooter } from '@patternfly/react-core';
<CardFooter>
```

**Files Updated**:
- `src/components/Secrets/SecretCard.tsx`
- `src/components/Bindings/BindingCard.tsx`

### 3. Popover Component Simplification
**Issue**: `PopoverBody` and `PopoverHeader` components were removed in PatternFly v6
**Error**: `The requested module does not provide an export named 'PopoverBody'`

**Solution**: Replace with native HTML elements with appropriate styling
```typescript
// Before (PatternFly v5)
import { PopoverBody, PopoverHeader } from '@patternfly/react-core';
<PopoverHeader>Title</PopoverHeader>
<PopoverBody>Content</PopoverBody>

// After (PatternFly v6)
<div className="pf-v5-c-popover__title">Title</div>
<div className="pf-v5-c-popover__body">Content</div>
```

**Files Updated**:
- `src/components/Secrets/SecretCard.tsx`
- `src/components/Bindings/BindingCard.tsx`

### 4. Text Component Deprecation
**Issue**: `Text` component with `component` prop was deprecated in PatternFly v6
**Error**: `The requested module does not provide an export named 'Text'`

**Solution**: Replace with native HTML elements and apply PatternFly utility classes directly
```typescript
// Before (PatternFly v5)
import { Text, TextContent, TextVariants } from '@patternfly/react-core';
<Text component={TextVariants.small} className="pf-v5-u-font-weight-bold">

// After (PatternFly v6)
<div className="pf-v5-u-font-size-sm pf-v5-u-font-weight-bold">
```

**Files Updated**:
- `src/components/Secrets/SecretCard.tsx`
- `src/components/Secrets/SecretFilters.tsx`
- `src/components/Bindings/BindingCard.tsx`

**Common Replacements**:
- `<Text component={TextVariants.h4}>` → `<h4>`
- `<Text component={TextVariants.small}>` → `<div className="pf-v5-u-font-size-sm">`
- `<Text component={TextVariants.p}>` → `<p>`

### 5. DatePicker Component Changes
**Issue**: `DatePickerInput` component was replaced by `DatePicker` in PatternFly v6
**Error**: `The requested module does not provide an export named 'DatePickerInput'`

**Solution**: Replace `DatePickerInput` with `DatePicker`
```typescript
// Before (PatternFly v5)
import { DatePickerInput } from '@patternfly/react-core';
<DatePickerInput>

// After (PatternFly v6)
import { DatePicker } from '@patternfly/react-core';
<DatePicker>
```

**Files Updated**:
- `src/components/Secrets/SecretFilters.tsx`

### 6. Select Variant Enum Removal
**Issue**: `SelectVariant` enum was removed in PatternFly v6
**Error**: `The requested module does not provide an export named 'SelectVariant'`

**Solution**: Replace enum usage with string literals
```typescript
// Before (PatternFly v5)
import { SelectVariant } from '@patternfly/react-core';
<Select variant={SelectVariant.single}>
<Select variant={SelectVariant.checkbox}>

// After (PatternFly v6)
<Select variant="single">
<Select variant="checkbox">
```

**Files Updated**:
- `src/components/Secrets/SecretFilters.tsx`
- `src/components/Providers/ProviderForm.tsx`
- `src/components/Secrets/CreateReferenceForm.tsx`

**String Mappings**:
- `SelectVariant.single` → `"single"`
- `SelectVariant.checkbox` → `"checkbox"`

### 7. EmptyState Component Simplification
**Issue**: `EmptyStateHeader`, `EmptyStateBody`, and `EmptyStateActions` components were removed in PatternFly v6
**Error**: `The requested module does not provide an export named 'EmptyStateHeader'`

**Solution**: Replace with native HTML elements within `EmptyState`
```typescript
// Before (PatternFly v5)
import { EmptyStateHeader, EmptyStateBody, EmptyStateActions } from '@patternfly/react-core';
<EmptyStateHeader>
<EmptyStateBody>
<EmptyStateActions>

// After (PatternFly v6)
<div className="pf-v5-c-empty-state__header">
<div className="pf-v5-c-empty-state__body">
<div className="pf-v5-c-empty-state__actions">
```

**Files Updated**:
- `src/pages/Secrets/Secrets.tsx`

### 8. Vite Environment Variable Handling
**Issue**: `process.env` is not available in Vite build environment
**Error**: `ReferenceError: process is not defined`

**Solution**: Replace `process.env` with `import.meta.env`
```typescript
// Before (Vite incompatible)
process.env.REACT_APP_API_BASE_URL
process.env.NODE_ENV === 'development'

// After (Vite compatible)
import.meta.env.VITE_API_BASE_URL
import.meta.env.DEV
```

**Files Updated**:
- `src/services/api.ts`

**Environment Variable Mappings**:
- `REACT_APP_*` → `VITE_*`
- `NODE_ENV === 'development'` → `import.meta.env.DEV`

## Migration Best Practices

### 1. Systematic Approach
- Address one component type at a time
- Test after each major change
- Use browser console errors as guidance for next steps

### 2. Component Replacement Strategy
- **Enums to Strings**: Most enum-based props now accept string literals
- **Component Simplification**: Complex components often replaced by simpler HTML + CSS combinations
- **Utility Classes**: PatternFly v6 encourages direct utility class usage

### 3. Testing Strategy
- Use Playwright for UI validation
- Check browser console for import errors
- Verify component rendering and functionality
- Test responsive behavior

### 4. Documentation
- Document all changes for future reference
- Create migration checklists for similar projects
- Maintain compatibility matrices

## Files Modified During Migration

### Core Components
- `src/components/Secrets/SecretCard.tsx`
- `src/components/Secrets/SecretFilters.tsx`
- `src/components/Secrets/CreateReferenceForm.tsx`
- `src/components/Providers/ProviderForm.tsx`
- `src/components/Bindings/BindingCard.tsx`

### Pages
- `src/pages/Secrets/Secrets.tsx`

### Services
- `src/services/api.ts`

## Verification Steps

### 1. Build Verification
```bash
npm run build
```
- Ensure no compilation errors
- Check for any remaining import issues

### 2. Runtime Verification
```bash
npm run dev
```
- Start development server
- Navigate to all major pages
- Verify component rendering
- Check browser console for errors

### 3. UI Testing
```bash
npm run test:e2e
```
- Run Playwright tests
- Verify component interactions
- Test responsive behavior

## Future Considerations

### 1. PatternFly v7 Preparation
- Monitor PatternFly release notes
- Plan for future breaking changes
- Maintain component abstraction layers

### 2. Migration Automation
- Consider creating migration scripts
- Implement automated compatibility checks
- Use TypeScript strict mode for early detection

### 3. Component Library Strategy
- Evaluate custom component wrappers
- Consider design system abstraction
- Plan for multi-version support if needed

## Conclusion

The migration to PatternFly v6 was completed successfully by systematically addressing each breaking change. The key was maintaining forward compatibility while ensuring all components functioned correctly. This migration provides a solid foundation for future PatternFly updates and serves as a reference for similar migrations in other projects.

## References

- [PatternFly v6 Migration Guide](https://www.patternfly.org/v6/get-started/migration)
- [PatternFly v6 Component Documentation](https://www.patternfly.org/v6/components)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Migration Date**: December 2024  
**PatternFly Version**: 6.3.1  
**Migration Status**: ✅ Complete  
**Test Status**: ✅ All components functional  
**Documentation Status**: ✅ Complete
