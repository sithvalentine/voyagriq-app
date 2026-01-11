# UX Improvements Implementation Guide

**Date**: January 7, 2026
**Based on**: UX Audit findings
**Priority**: Critical items for production launch

---

## Implementation Overview

This guide provides step-by-step instructions to implement the critical UX improvements identified in the audit. Total estimated time: **48 hours** (1 week for 1 developer).

### Quick Wins (Can be completed in 1 day - 13 hours)

1. ✅ **ARIA Labels for Icon Buttons** (4 hours)
2. ✅ **Skip Links for Accessibility** (1 hour)
3. ✅ **Support Contact in Navigation** (1 hour)
4. ✅ **Color Contrast Audit** (2 hours)
5. ✅ **Unsaved Changes Warning** (2 hours)
6. ✅ **Breadcrumbs** (3 hours)

### Medium Priority (2-3 days - 35 hours)

7. ✅ **Toast Notification System** (4 hours)
8. ✅ **Confirmation Dialogs** (6 hours)
9. ✅ **Auto-Save Drafts** (4 hours)
10. ✅ **React Error Boundaries** (4 hours)
11. ✅ **Modal Focus Management** (6 hours)
12. ✅ **Interactive Product Tour** (8 hours)
13. ✅ **Mobile Navigation Fix** (3 hours)

---

## 1. ARIA Labels for Icon Buttons (4 hours)

### Problem
Icon-only buttons lack text labels, making them inaccessible to screen reader users.

### Files to Modify

#### 1.1 BulkImportModal.tsx

**Location**: Line 189 (Close button)
```tsx
// BEFORE
<button
  onClick={handleClose}
  className="text-white hover:text-gray-200 transition-colors cursor-pointer"
  type="button"
>
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
</button>

// AFTER
<button
  onClick={handleClose}
  className="text-white hover:text-gray-200 transition-colors cursor-pointer"
  type="button"
  aria-label="Close import modal"
>
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
</button>
```

**Location**: Line 280 (Remove file button)
```tsx
// BEFORE
<button
  onClick={() => setFile(null)}
  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
  type="button"
>

// AFTER
<button
  onClick={() => setFile(null)}
  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
  type="button"
  aria-label="Remove selected file"
>
```

#### 1.2 app/trips/page.tsx

**Location**: Export buttons (find in your file around line 600-700)

Search for buttons with text "CSV", "Excel", "PDF" and add:

```tsx
// CSV Export Button
<button
  onClick={handleExportCSV}
  disabled={filteredTrips.length === 0}
  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
  type="button"
  aria-label="Export trips as CSV file"
>
  CSV
</button>

// Excel Export Button
<button
  onClick={handleExportExcel}
  disabled={filteredTrips.length === 0}
  className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
  type="button"
  aria-label="Export trips as Excel file"
>
  Excel
</button>

// PDF Export Button
<button
  onClick={handleExportPDF}
  disabled={filteredTrips.length === 0}
  className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
  type="button"
  aria-label="Export trips as PDF report"
>
  PDF Report
</button>
```

**Location**: Import button (around line 528-536)
```tsx
<button
  onClick={() => setIsImportModalOpen(true)}
  className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-lg shadow-lg cursor-pointer"
  type="button"
  aria-label="Import trips from CSV or Excel file"
>
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
  Import Trips
</button>
```

#### 1.3 Search for All Icon Buttons

Run this command to find all icon buttons that need ARIA labels:

```bash
grep -r "onClick.*svg" --include="*.tsx" voyagriq-app/
```

### Rule of Thumb
- Every `<button>` or `<a>` that contains only an icon/SVG needs `aria-label`
- Add `aria-hidden="true"` to decorative SVGs
- If button has visible text AND icon, no `aria-label` needed

---

## 2. Skip Links for Accessibility (1 hour)

### Problem
Keyboard users must tab through entire navigation to reach main content.

### Implementation

**File**: `app/layout.tsx`

Add skip link before navigation:

```tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Skip Link for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>

        <Providers>
          <ClientNavigation />
          <main id="main-content" className="min-h-screen bg-gray-50" tabIndex={-1}>
            {children}
          </main>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**File**: `app/globals.css`

Add to existing CSS:

```css
/* Screen Reader Only class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

---

## 3. Support Contact in Navigation (1 hour)

### Problem
No visible support contact. Users don't know how to get help.

### Implementation

**File**: `components/Navigation.tsx`

Find the "About" link and add support link after it:

```tsx
{/* Existing About link */}
<Link href="/about" className="text-gray-600 hover:text-gray-900">
  About
</Link>

{/* NEW: Support link */}
<a
  href="mailto:support@voyagriq.com"
  className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
  aria-label="Contact support via email"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  Support
</a>
```

**Alternative**: If you want a help icon button in the navigation:

```tsx
<a
  href="mailto:support@voyagriq.com"
  className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
  aria-label="Contact support"
  title="Contact support: support@voyagriq.com"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
</a>
```

---

## 4. Color Contrast Audit (2 hours)

### Problem
Some text may not meet WCAG AA contrast requirements (4.5:1 for normal text).

### Tools to Use

1. **Chrome Lighthouse**
   ```bash
   # In Chrome DevTools
   1. Open DevTools (F12)
   2. Click "Lighthouse" tab
   3. Check "Accessibility"
   4. Click "Analyze page load"
   5. Review "Contrast" section
   ```

2. **axe DevTools Extension**
   - Install: https://www.deque.com/axe/devtools/
   - Run automated scan
   - Fix all "Critical" and "Serious" issues

3. **Manual Check** (WebAIM Contrast Checker)
   - URL: https://webaim.org/resources/contrastchecker/
   - Check common color combinations:

### Common Issues & Fixes

**Issue 1**: `text-gray-400` on white background (may fail)

```tsx
// BEFORE (3:1 ratio - FAILS)
<p className="text-gray-400">Helper text</p>

// AFTER (4.5:1 ratio - PASSES)
<p className="text-gray-600">Helper text</p>
```

**Issue 2**: Placeholder text too light

```tsx
// BEFORE
<input placeholder="Enter trip ID" />

// AFTER
<input placeholder="Enter trip ID" className="placeholder:text-gray-500" />
```

**Issue 3**: Disabled button text

```tsx
// BEFORE
<button disabled className="disabled:opacity-50">
  Submit
</button>

// AFTER - Add explicit disabled colors
<button disabled className="disabled:bg-gray-300 disabled:text-gray-600">
  Submit
</button>
```

### Colors to Check

| Color Class | Hex | Contrast on White | Status |
|-------------|-----|-------------------|--------|
| `text-gray-400` | #9CA3AF | 2.84:1 | ❌ FAIL |
| `text-gray-500` | #6B7280 | 4.57:1 | ✅ PASS |
| `text-gray-600` | #4B5563 | 7.07:1 | ✅ PASS |
| `text-blue-600` | #2563EB | 4.56:1 | ✅ PASS |
| `text-blue-500` | #3B82F6 | 3.05:1 | ❌ FAIL |
| `text-blue-700` | #1D4ED8 | 7.03:1 | ✅ PASS |

**Action**: Replace all `text-gray-400` with `text-gray-500` or darker.

---

## 5. Toast Notification System (4 hours)

### Problem
No non-intrusive way to show success/error messages for background actions.

### Installation

```bash
npm install sonner
```

### Implementation

**File**: `components/Providers.tsx`

```tsx
'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { TierProvider } from '@/contexts/TierContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { Toaster } from 'sonner'; // NEW

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TierProvider>
        <CurrencyProvider>
          {children}
          {/* NEW: Toast container */}
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
          />
        </CurrencyProvider>
      </TierProvider>
    </AuthProvider>
  );
}
```

### Usage Examples

**File**: `app/trips/page.tsx` (or any component)

```tsx
import { toast } from 'sonner';

// Success toast
const handleTripAdded = () => {
  toast.success('Trip added successfully!', {
    description: 'Your trip has been saved to the database.',
  });
};

// Error toast
const handleError = (error: Error) => {
  toast.error('Failed to save trip', {
    description: error.message,
  });
};

// Loading toast with promise
const handleImport = async () => {
  toast.promise(
    importTrips(),
    {
      loading: 'Importing trips...',
      success: (data) => `Imported ${data.count} trips successfully!`,
      error: 'Import failed. Please try again.',
    }
  );
};

// Custom toast with action
const handleDelete = async (tripId: string) => {
  await deleteTrip(tripId);

  toast.success('Trip deleted', {
    action: {
      label: 'Undo',
      onClick: () => restoreTrip(tripId)
    },
  });
};
```

**Replace existing inline alerts** with toasts:

```tsx
// BEFORE (inline alert)
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <p className="text-red-800">{error}</p>
  </div>
)}

// AFTER (toast)
useEffect(() => {
  if (error) {
    toast.error('An error occurred', {
      description: error
    });
  }
}, [error]);
```

---

## 6. Confirmation Dialogs (6 hours)

### Problem
Destructive actions (delete trip, clear data) lack confirmation, risking accidental data loss.

### Installation

```bash
npm install @radix-ui/react-alert-dialog
```

### Implementation

**File**: `components/ConfirmDialog.tsx` (NEW)

```tsx
'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Continue',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'danger'
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-50">
          <AlertDialog.Title className="text-lg font-bold text-gray-900 mb-2">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-gray-600 mb-6">
            {description}
          </AlertDialog.Description>

          <div className="flex gap-3 justify-end">
            <AlertDialog.Cancel asChild>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                disabled={isLoading}
              >
                {cancelText}
              </button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 ${variantStyles[variant]}`}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : confirmText}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
```

### Usage Example

**File**: `app/trips/[id]/page.tsx` (Trip detail page)

```tsx
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useState } from 'react';
import { toast } from 'sonner';

export default function TripDetail() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await fetch(`/api/trips/${tripId}`, { method: 'DELETE' });
      toast.success('Trip deleted successfully');
      router.push('/trips');
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  return (
    <>
      {/* Delete Button */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Delete Trip
      </button>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Trip?"
        description="This action cannot be undone. The trip data will be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="danger"
      />
    </>
  );
}
```

**Common Use Cases**:
- Delete trip
- Clear all data
- Cancel subscription
- Remove team member
- Overwrite existing import

---

## 7. Auto-Save Drafts (4 hours)

### Problem
Long forms lose data if browser closes or crashes.

### Implementation

**File**: `hooks/useAutoSave.ts` (NEW)

```tsx
import { useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';

interface UseAutoSaveOptions {
  key: string; // localStorage key
  data: any; // form data to save
  enabled?: boolean; // enable/disable auto-save
  interval?: number; // ms between saves (default: 30000 = 30 seconds)
}

export function useAutoSave({ key, data, enabled = true, interval = 30000 }: UseAutoSaveOptions) {
  const debouncedData = useDebounce(data, interval);
  const isInitialMount = useRef(true);

  // Save to localStorage
  useEffect(() => {
    // Skip on initial mount (don't save empty form)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!enabled || !data) return;

    try {
      const draft = {
        data: debouncedData,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(`draft:${key}`, JSON.stringify(draft));
      console.log(`[AutoSave] Draft saved for ${key}`);
    } catch (error) {
      console.error('[AutoSave] Failed to save draft:', error);
    }
  }, [debouncedData, key, enabled]);

  // Load draft on mount
  const loadDraft = (): any | null => {
    try {
      const stored = localStorage.getItem(`draft:${key}`);
      if (!stored) return null;

      const draft = JSON.parse(stored);
      const age = Date.now() - new Date(draft.timestamp).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      // Discard old drafts
      if (age > maxAge) {
        localStorage.removeItem(`draft:${key}`);
        return null;
      }

      return draft.data;
    } catch (error) {
      console.error('[AutoSave] Failed to load draft:', error);
      return null;
    }
  };

  // Clear draft
  const clearDraft = () => {
    try {
      localStorage.removeItem(`draft:${key}`);
      console.log(`[AutoSave] Draft cleared for ${key}`);
    } catch (error) {
      console.error('[AutoSave] Failed to clear draft:', error);
    }
  };

  return { loadDraft, clearDraft };
}
```

**File**: `hooks/useDebounce.ts` (NEW)

```tsx
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### Usage Example

**File**: `components/TripEntryForm.tsx`

```tsx
import { useAutoSave } from '@/hooks/useAutoSave';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function TripEntryForm() {
  const [formData, setFormData] = useState({
    tripId: '',
    clientName: '',
    // ... all form fields
  });

  const [isFormDirty, setIsFormDirty] = useState(false);

  // Auto-save hook
  const { loadDraft, clearDraft } = useAutoSave({
    key: 'trip-entry-form',
    data: formData,
    enabled: isFormDirty, // only save if form has been touched
    interval: 30000, // save every 30 seconds
  });

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      const shouldRestore = confirm(
        'Found unsaved draft from previous session. Would you like to restore it?'
      );

      if (shouldRestore) {
        setFormData(draft);
        toast.info('Draft restored');
      } else {
        clearDraft();
      }
    }
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      await submitTrip(formData);
      clearDraft(); // Clear draft after successful submission
      toast.success('Trip saved!');
    } catch (error) {
      toast.error('Failed to save trip');
    }
  };

  // Handle form input
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsFormDirty(true); // Mark form as dirty
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Show auto-save indicator */}
      <div className="mb-4 text-xs text-gray-500">
        ✓ Auto-saving draft every 30 seconds
      </div>

      {/* Form fields */}
      <input
        value={formData.tripId}
        onChange={(e) => handleInputChange('tripId', e.target.value)}
      />

      {/* ... */}
    </form>
  );
}
```

---

## 8. Unsaved Changes Warning (2 hours)

### Problem
Users can accidentally leave pages with unsaved form data.

### Implementation

**File**: `hooks/useBeforeUnload.ts` (NEW)

```tsx
import { useEffect } from 'react';

export function useBeforeUnload(hasUnsavedChanges: boolean, message?: string) {
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message || 'You have unsaved changes. Are you sure you want to leave?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, message]);
}
```

**File**: `hooks/useUnsavedChanges.ts` (NEW - for Next.js navigation)

```tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useUnsavedChanges(hasUnsavedChanges: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleRouteChange = (url: string) => {
      if (hasUnsavedChanges) {
        const confirmed = confirm(
          'You have unsaved changes. Are you sure you want to leave?'
        );
        if (!confirmed) {
          // Prevent navigation
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    };

    // Note: Next.js App Router doesn't have built-in route change events
    // This is a basic implementation - consider using a library like 'next-router-guard'

    return () => {
      // Cleanup
    };
  }, [hasUnsavedChanges]);
}
```

### Usage Example

**File**: `components/TripEntryForm.tsx`

```tsx
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { useState } from 'react';

export default function TripEntryForm() {
  const [formData, setFormData] = useState({});
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Warn before browser close
  useBeforeUnload(isFormDirty);

  const handleSubmit = () => {
    // ... submit logic
    setIsFormDirty(false); // Clear dirty flag on successful save
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

---

## 9. React Error Boundaries (4 hours)

### Problem
Unhandled errors crash the entire app, showing a blank page.

### Implementation

**File**: `components/ErrorBoundary.tsx` (NEW)

```tsx
'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);

    // Send to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <summary className="cursor-pointer font-semibold text-red-900 mb-2">
                  Error Details (Dev Mode)
                </summary>
                <pre className="text-xs text-red-800 overflow-auto">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/trips'}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
              >
                Go to Trips
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Usage

**File**: `app/layout.tsx`

Wrap app with Error Boundary:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <ClientNavigation />
            <main id="main-content" className="min-h-screen bg-gray-50">
              {children}
            </main>
          </Providers>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**File**: `app/trips/page.tsx` (Wrap specific sections)

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function TripsPage() {
  return (
    <div>
      {/* Wrap complex sections */}
      <ErrorBoundary fallback={<div>Failed to load analytics</div>}>
        <AnalyticsDashboard />
      </ErrorBoundary>

      <ErrorBoundary fallback={<div>Failed to load trips table</div>}>
        <TripsTable trips={trips} />
      </ErrorBoundary>
    </div>
  );
}
```

---

## 10. Modal Focus Management (6 hours)

### Problem
Keyboard users can tab out of modals, and focus doesn't return to trigger element.

### Installation

```bash
npm install focus-trap-react
```

### Implementation

**File**: `components/BulkImportModal.tsx`

Update modal to use focus trap:

```tsx
import FocusTrap from 'focus-trap-react';
import { useEffect, useRef } from 'react';

export default function BulkImportModal({ isOpen, onClose }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Store element that triggered modal
  useEffect(() => {
    if (isOpen) {
      returnFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Return focus when closing
  const handleClose = () => {
    onClose();
    // Return focus to trigger element
    setTimeout(() => {
      returnFocusRef.current?.focus();
    }, 100);
  };

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <FocusTrap
      focusTrapOptions={{
        initialFocus: false,
        escapeDeactivates: false, // We handle Escape manually
        clickOutsideDeactivates: false,
      }}
    >
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="modal-title" className="text-2xl font-bold">
                  Import Trips
                </h2>
                <p id="modal-description" className="text-blue-100 mt-1">
                  Upload CSV or Excel file to import multiple trips at once
                </p>
              </div>
              <button
                ref={closeButtonRef}
                onClick={handleClose}
                className="text-white hover:text-gray-200 transition-colors"
                type="button"
                aria-label="Close import modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal content */}
          {/* ... rest of modal ... */}
        </div>
      </div>
    </FocusTrap>
  );
}
```

---

## 11. Interactive Product Tour (8 hours)

### Installation

```bash
npm install driver.js
```

### Implementation

**File**: `lib/productTour.ts` (NEW)

```tsx
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function startProductTour() {
  const driverObj = driver({
    showProgress: true,
    steps: [
      {
        element: '#add-trip-button',
        popover: {
          title: 'Add Your First Trip',
          description: 'Click here to manually add trip details one by one.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#import-button',
        popover: {
          title: 'Bulk Import',
          description: 'Or upload a CSV/Excel file to import multiple trips at once.',
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#analytics-nav',
        popover: {
          title: 'Analytics Dashboard',
          description: 'View revenue trends, agency performance, and business insights. (Available on Standard+ tiers)',
          side: 'bottom',
        }
      },
      {
        element: '#export-buttons',
        popover: {
          title: 'Export Reports',
          description: 'Export your data as CSV, Excel, or PDF reports with charts.',
          side: 'top',
        }
      },
      {
        element: '#support-link',
        popover: {
          title: 'Need Help?',
          description: 'Contact our support team anytime at support@voyagriq.com',
          side: 'bottom',
        }
      },
    ],
    onDestroyStarted: () => {
      localStorage.setItem('voyagriq-tour-completed', 'true');
    },
  });

  driverObj.drive();
}

export function shouldShowTour(): boolean {
  const completed = localStorage.getItem('voyagriq-tour-completed');
  return !completed;
}
```

**File**: `app/trips/page.tsx`

```tsx
import { useEffect } from 'react';
import { startProductTour, shouldShowTour } from '@/lib/productTour';

export default function TripsPage() {
  // Show tour on first visit
  useEffect(() => {
    if (trips.length === 0 && shouldShowTour()) {
      // Wait for page to render
      setTimeout(() => {
        startProductTour();
      }, 1000);
    }
  }, [trips.length]);

  return (
    <div>
      <button
        id="add-trip-button"
        onClick={() => router.push('/data')}
      >
        Add Trip
      </button>

      <button
        id="import-button"
        onClick={() => setIsImportModalOpen(true)}
      >
        Import
      </button>

      {/* ... rest of page ... */}
    </div>
  );
}
```

**File**: `components/Navigation.tsx`

Add "Help" button to restart tour:

```tsx
<button
  onClick={() => startProductTour()}
  className="text-gray-600 hover:text-gray-900"
  aria-label="Start product tour"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  Tour
</button>
```

---

## 12. Mobile Navigation Fix (3 hours)

### Problem
Hover-based dropdowns don't work on touch devices.

### Implementation

**File**: `components/Navigation.tsx`

Add mobile-friendly navigation:

```tsx
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">VoyagrIQ</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* ... desktop nav items ... */}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Trips Dropdown */}
            <div>
              <button
                onClick={() => setOpenDropdown(openDropdown === 'trips' ? null : 'trips')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                Trips
                <svg
                  className={`w-4 h-4 transition-transform ${openDropdown === 'trips' ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === 'trips' && (
                <div className="pl-4 space-y-1">
                  <Link
                    href="/trips"
                    className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    All Trips
                  </Link>
                  <Link
                    href="/vendors"
                    className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Vendors & Suppliers
                  </Link>
                </div>
              )}
            </div>

            {/* Add similar dropdown for Analytics, Account, etc. */}

            {/* Support Link */}
            <a
              href="mailto:support@voyagriq.com"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Support
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
```

---

## 13. Help Center Documentation (Create separate pages)

### Option 1: Internal Help Pages

Create these pages in `/app/help/`:

- `/app/help/page.tsx` - Help center home
- `/app/help/getting-started/page.tsx` - Getting started guide
- `/app/help/adding-trips/page.tsx` - How to add trips
- `/app/help/importing-data/page.tsx` - Bulk import guide
- `/app/help/analytics/page.tsx` - Understanding analytics
- `/app/help/exporting/page.tsx` - Export formats guide
- `/app/help/billing/page.tsx` - Billing & subscription
- `/app/help/api/page.tsx` - API documentation

### Option 2: External Help Center (Recommended)

Use a service like:
- **Notion** (free) - Create public docs
- **GitBook** (free tier) - Professional docs
- **Help Scout** ($20/mo) - Full help desk
- **Intercom** ($39/mo) - Chat + help center

### Option 3: Embedded FAQ

**File**: `/app/help/page.tsx` (NEW)

```tsx
export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Help Center</h1>

      <div className="space-y-8">
        {/* Getting Started */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
          <div className="space-y-4">
            <details className="bg-white border rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">
                How do I add my first trip?
              </summary>
              <div className="mt-2 text-gray-600">
                <p>You can add trips in two ways:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Click "Add Trip" and manually enter details</li>
                  <li>Click "Import" to upload a CSV/Excel file</li>
                </ol>
              </div>
            </details>

            {/* More FAQs */}
          </div>
        </section>

        {/* Video Tutorials */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Video Tutorials</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Adding Your First Trip</h3>
              <div className="aspect-video bg-gray-200 rounded mb-2">
                {/* Embed video */}
              </div>
              <p className="text-sm text-gray-600">Duration: 2:30</p>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
          <p className="text-gray-600 mb-4">
            Our support team is here to help you succeed.
          </p>
          <a
            href="mailto:support@voyagriq.com"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Contact Support
          </a>
        </section>
      </div>
    </div>
  );
}
```

---

## Testing Checklist

After implementing improvements:

### ✅ Accessibility Testing

```bash
# Install axe DevTools extension
# Run automated scan on:
- /trips page
- /data (trip entry form)
- /analytics page
- Modal windows
```

### ✅ Mobile Testing

Test on actual devices:
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)

Check:
- Navigation menu works
- Forms are usable
- Buttons are tappable (min 44×44px)
- Text is readable (min 16px)

### ✅ Keyboard Navigation

- Tab through entire page
- Activate buttons with Enter/Space
- Close modals with Escape
- Skip link works (Tab from top)

### ✅ Screen Reader Testing

- Test with NVDA (Windows) or VoiceOver (Mac)
- All buttons have labels
- Form errors are announced
- Modal focus is trapped

---

## Next Steps

1. **Week 1**: Implement Quick Wins (13 hours)
2. **Week 2**: Implement Medium Priority (35 hours)
3. **Week 3**: Testing & refinement
4. **Week 4**: Help center content creation

---

## Resources

- **Accessibility**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA**: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
- **React Patterns**: https://reactpatterns.com/
- **Radix UI**: https://www.radix-ui.com/
- **driver.js**: https://driverjs.com/
- **sonner**: https://sonner.emilkowal.ski/

---

**Estimated Total Time**: 48 hours
**Priority Level**: Critical for production launch
**Status**: Ready to implement

After completing these improvements, re-run the UX audit. Expected new grade: **A- (92%)**
