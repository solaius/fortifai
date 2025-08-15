import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Page,
  PageSection,
  PageSidebar,
  PageSidebarBody,
  SkipToContent,
  Breadcrumb,
  BreadcrumbItem
} from '@patternfly/react-core';
import { MastheadComponent } from './Masthead';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

// Breadcrumbs config for secrets management
const breadcrumbMap: Record<string, Array<{ path: string; label: string }>> = {
  '/dashboard': [
    { path: '/dashboard', label: 'Dashboard' }
  ],
  '/providers': [
    { path: '/providers', label: 'Secret Providers' }
  ],
  '/providers/new': [
    { path: '/providers', label: 'Secret Providers' },
    { path: '/providers/new', label: 'Add Provider' }
  ],
  '/providers/:id': [
    { path: '/providers', label: 'Secret Providers' },
    { path: '/providers/:id', label: 'Provider Details' }
  ],
  '/secrets': [
    { path: '/secrets', label: 'Secrets Catalog' }
  ],
  '/secrets/new': [
    { path: '/secrets', label: 'Secrets Catalog' },
    { path: '/secrets/new', label: 'Create Reference' }
  ],
  '/bindings': [
    { path: '/bindings', label: 'Secret Bindings' }
  ],
  '/bindings/new': [
    { path: '/bindings', label: 'Secret Bindings' },
    { path: '/bindings/new', label: 'Create Binding' }
  ],
  '/policies': [
    { path: '/policies', label: 'Access Policies' }
  ],
  '/policies/new': [
    { path: '/policies', label: 'Access Policies' },
    { path: '/policies/new', label: 'Create Policy' }
  ],
  '/audit': [
    { path: '/audit', label: 'Audit Log' }
  ],
  '/settings': [
    { path: '/settings', label: 'Settings' }
  ]
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Find the best matching breadcrumb config for the current path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    // Try exact match first
    if (breadcrumbMap[path]) {
      return breadcrumbMap[path];
    }
    // Try pattern matching for dynamic routes
    for (const [pattern, breadcrumbs] of Object.entries(breadcrumbMap)) {
      if (pattern.includes(':')) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        if (patternParts.length === pathParts.length) {
          let matches = true;
          for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
              continue; // Dynamic segment
            }
            if (patternParts[i] !== pathParts[i]) {
              matches = false;
              break;
            }
          }
          if (matches) {
            return breadcrumbs.map(crumb => ({
              ...crumb,
              path: crumb.path.replace(/:[^/]+/, pathParts[patternParts.indexOf(crumb.path.split('/').find(p => p.startsWith(':')) || '')] || '')
            }));
          }
        }
      }
    }
    return [];
  };

  const breadcrumbs = (
    <Breadcrumb>
      {getBreadcrumbs().map((crumb, idx, arr) => (
        <BreadcrumbItem
          key={crumb.path}
          to={idx < arr.length - 1 ? crumb.path : undefined}
          isActive={idx === arr.length - 1}
          onClick={idx < arr.length - 1 ? (e) => { e.preventDefault(); navigate(crumb.path); } : undefined}
        >
          {crumb.label}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );

  const sidebar = (
    <PageSidebar>
      <PageSidebarBody>
        <Sidebar />
      </PageSidebarBody>
    </PageSidebar>
  );

  const mainContainerId = 'main-content';

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    const mainContentElement = document.getElementById(mainContainerId);
    if (mainContentElement) {
      mainContentElement.focus();
    }
  };

  const pageSkipToContent = (
    <SkipToContent onClick={handleClick} href={`#${mainContainerId}`}>
      Skip to content
    </SkipToContent>
  );

  return (
                <Page
              masthead={<MastheadComponent />}
              sidebar={sidebar}
      isManagedSidebar
      skipToContent={pageSkipToContent}
      breadcrumb={breadcrumbs}
      mainContainerId={mainContainerId}
      isBreadcrumbWidthLimited
      isBreadcrumbGrouped
      groupProps={{
        stickyOnBreakpoint: { default: 'top' }
      }}
    >
      <PageSection>
        {children}
      </PageSection>
    </Page>
  );
};
