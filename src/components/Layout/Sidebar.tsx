import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import {
  Nav,
  NavItem,
  NavList,
  NavExpandable
} from '@patternfly/react-core';
import ChartBarIcon from '@patternfly/react-icons/dist/esm/icons/outlined-chart-bar-icon';
import DatabaseIcon from '@patternfly/react-icons/dist/esm/icons/database-icon';
import KeyIcon from '@patternfly/react-icons/dist/esm/icons/key-icon';
import LinkIcon from '@patternfly/react-icons/dist/esm/icons/link-icon';
import ShieldAltIcon from '@patternfly/react-icons/dist/esm/icons/shield-alt-icon';
import ClipboardIcon from '@patternfly/react-icons/dist/esm/icons/clipboard-icon';
import CogIcon from '@patternfly/react-icons/dist/esm/icons/cog-icon';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  // Check if a path is active (including nested routes)
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Nav aria-label="Secrets Management Navigation">
      <NavList>
                        <NavItem isActive={isActive('/dashboard')}>
                  <NavLink to="/dashboard">
                    <ChartBarIcon /> Dashboard
                  </NavLink>
                </NavItem>
        
        <NavExpandable 
          title="Secret Management" 
          isExpanded={isActive('/providers') || isActive('/secrets')}
          isActive={isActive('/providers') || isActive('/secrets')}
        >
          <NavItem isActive={isActive('/providers')}>
            <NavLink to="/providers">
              <DatabaseIcon /> Providers
            </NavLink>
          </NavItem>
          <NavItem isActive={isActive('/secrets')}>
            <NavLink to="/secrets">
              <KeyIcon /> Secrets Catalog
            </NavLink>
          </NavItem>
        </NavExpandable>

        <NavExpandable 
          title="Access Control" 
          isExpanded={isActive('/bindings') || isActive('/policies')}
          isActive={isActive('/bindings') || isActive('/policies')}
        >
          <NavItem isActive={isActive('/bindings')}>
            <NavLink to="/bindings">
              <LinkIcon /> Secret Bindings
            </NavLink>
          </NavItem>
          <NavItem isActive={isActive('/policies')}>
            <NavLink to="/policies">
              <ShieldAltIcon /> Access Policies
            </NavLink>
          </NavItem>
        </NavExpandable>

                        <NavItem isActive={isActive('/audit')}>
                  <NavLink to="/audit">
                    <ClipboardIcon /> Audit Log
                  </NavLink>
                </NavItem>

        <NavItem isActive={isActive('/settings')}>
          <NavLink to="/settings">
            <CogIcon /> Settings
          </NavLink>
        </NavItem>
      </NavList>
    </Nav>
  );
};
