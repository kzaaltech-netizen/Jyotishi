import React from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { pathFor } from '../../lib/routes.js';

// A real <a href> (crawlable, opens in new tab with ctrl/cmd) that navigates in-app on plain click.
export default function AppLink({ page, param = null, children, className = '', ...rest }) {
  const { setCurrentPage, locale } = useApp();
  return (
    <a
      href={pathFor(page, param, locale)}
      className={className}
      onClick={(e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        setCurrentPage(page, param);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
