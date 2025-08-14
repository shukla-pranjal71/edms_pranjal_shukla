
import React from 'react';
import ReviewersHoverCard from '../ReviewersHoverCard';
import { Person } from '../PeopleField';

interface ReviewersHoverCardWrapperProps {
  reviewers: Person[];
  label?: string;
}

// Wrapper component to handle the label prop
const ReviewersHoverCardWrapper: React.FC<ReviewersHoverCardWrapperProps> = ({ reviewers, label }) => {
  // Use the original component but only pass the reviewers prop
  return <ReviewersHoverCard reviewers={reviewers} />;
};

export default ReviewersHoverCardWrapper;
