import React from 'react';
import { useParams } from 'react-router-dom';
import BranchEventsList from '../components/BranchEventsList.jsx'; // Import the correct component

const BranchEventsPage = () => {
  // Get the branchName from the URL (e.g., "cse")
  const { branchName } = useParams();

  return (
    <div>
      {/* Pass the branchName as a prop to the list component */}
      <BranchEventsList branchName={branchName} />
    </div>
  );
};

export default BranchEventsPage;