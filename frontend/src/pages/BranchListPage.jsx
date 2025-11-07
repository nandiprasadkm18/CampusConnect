import React from 'react';
import { Link } from 'react-router-dom';

// List of all branches
const branches = [
  { key: 'cse', name: 'Computer Science (CSE)' },
  { key: 'ise', name: 'Information Science (ISE)' },
  { key: 'aiml', name: 'CS - AI/ML' },
  { key: 'ec', name: 'Electronics (EC)' },
  { key: 'eee', name: 'Electrical (EEE)' },
  { key: 'civil', name: 'Civil' },
  { key: 'mechanical', name: 'Mechanical' },
  { key: 'general', name: 'General / All-College' }
];

// Styles for the branch links
const branchLinkStyle = {
  display: 'block',
  padding: '1.5rem',
  margin: '1rem 0',
  textDecoration: 'none',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  backgroundColor: 'var(--color-bg-white)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  color: 'var(--educrown-blue-dark)',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  textAlign: 'center',
  textTransform: 'uppercase',
  transition: 'all 0.3s ease',
};

const BranchListPage = () => {
  return (
    <div>
      <h1 style={{textAlign: 'center', color: 'var(--educrown-blue-dark)'}}>Select a Branch</h1>
      <p style={{textAlign: 'center', color: 'var(--color-text-light)'}}>Browse events by department.</p>
      <hr style={{borderColor: 'var(--color-border)', opacity: 0.3, margin: '2rem 0'}} />
      
      <div>
        {branches.map(branch => (
          <Link 
            key={branch.key} 
            to={`/events/${branch.key}`} // Links to /events/cse, etc.
            style={branchLinkStyle}
            onMouseEnter={e => { e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'; e.target.style.color = 'var(--educrown-blue-light)'; }}
            onMouseLeave={e => { e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.target.style.color = 'var(--educrown-blue-dark)'; }}
          >
            {branch.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BranchListPage;