import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') return null;

  return (
    <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">
      <Link to="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
        <Home className="w-3 h-3" />
        <span>Platform</span>
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = name.replace(/-/g, ' ');

        return (
          <React.Fragment key={name}>
            <ChevronRight className="w-3 h-3 opacity-30" />
            {isLast ? (
              <span className="text-slate-900">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-indigo-600 transition-colors uppercase">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
