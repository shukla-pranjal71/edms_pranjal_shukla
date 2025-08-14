import { Badge } from "@/components/ui/badge";
import { BaseDocumentRequest } from "../components/table/DocumentTableTypes";
export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'live':
      return <Badge className="bg-[#28b228] text-white">Live</Badge>;
    case 'live-cr':
      return <Badge className="bg-[#FF6B35] text-white">Live-CR</Badge>;
    case 'under-review':
      return <Badge className="text-white bg-[v#117bbc] bg-[#fdb018]">For Review</Badge>;
    case 'pending-approval':
      return <Badge className="bg-[#FFAB00] text-white">For Review</Badge>;
    case 'approved':
      return <Badge className="text-white bg-[#117bbc]">Approved</Badge>;
    case 'archived':
      return <Badge className="bg-gray-400 text-white">Archived</Badge>;
    case 'deleted':
      return <Badge variant="destructive" className="text-white">Deleted</Badge>;
    case 'queried':
      return <Badge className="bg-purple-500 text-white">Queried</Badge>;
    default:
      return <Badge className="bg-gray-300 text-white">Unknown</Badge>;
  }
};
export const getReviewStatusBadge = (doc: BaseDocumentRequest) => {
  if (doc.reviewDue) {
    return <Badge className="ml-2 bg-red-500 text-white">Review Overdue</Badge>;
  }
  if (doc.needsReview) {
    return <Badge className="ml-2 bg-amber-500 text-white">Review Needed</Badge>;
  }
  return null;
};