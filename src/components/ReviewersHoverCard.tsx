
import React from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Person } from './PeopleField';
import { Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ReviewersHoverCardProps {
  reviewers: Person[];
}

const ReviewersHoverCard: React.FC<ReviewersHoverCardProps> = ({ reviewers }) => {
  if (!reviewers || reviewers.length === 0) {
    return <span>No reviewers</span>;
  }

  // If there's only one reviewer, show their name
  if (reviewers.length === 1) {
    return <span>{reviewers[0].name}</span>;
  }

  // Display an icon and count for multiple reviewers
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-1 cursor-pointer text-blue-600 dark:text-blue-400">
          <Users className="h-4 w-4" />
          <span>{reviewers.length} Reviewers</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" align="start">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Reviewers</h4>
          <div className="space-y-2">
            {reviewers.map((reviewer, index) => (
              <div key={index} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {reviewer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{reviewer.name}</p>
                  {reviewer.email && (
                    <p className="text-xs text-muted-foreground">{reviewer.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default ReviewersHoverCard;
