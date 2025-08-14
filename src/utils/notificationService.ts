
import { BaseDocumentRequest } from "../components/table/DocumentTableTypes";
import { Person } from "../components/PeopleField";

class NotificationService {
  // Method to check documents needing review and send notifications
  checkAndSendReviewNotifications = () => {
    console.log("Notification service checking for documents needing review");
    // Implementation would typically:
    // 1. Get documents from a central store/context
    // 2. Filter for those that need review notification
    // 3. Send notifications as appropriate
    
    // For now, this is a no-op function that doesn't need documents passed
  }
  
  // Send a notification about a document
  sendDocumentNotification(document: BaseDocumentRequest, message: string) {
    console.log(`Notification sent for document ${document.sopName}: ${message}`);
    // In a real app, this would send notifications via email, in-app, etc.
  }
  
  // Send a deadline reminder
  sendDeadlineReminder(document: BaseDocumentRequest) {
    const daysTillDeadline = this.calculateDaysTillDeadline(document);
    
    if (daysTillDeadline !== null) {
      console.log(`Reminder: Document "${document.sopName}" has ${daysTillDeadline} days until review deadline.`);
      // In a real app, send notifications to reviewers
    }
  }
  
  // Calculate days until review deadline
  calculateDaysTillDeadline(document: BaseDocumentRequest): number | null {
    if (!document.reviewDeadline) return null;
    
    const today = new Date();
    const deadline = new Date(document.reviewDeadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // New methods to support useWorkflowHandlers
  
  // Notify when a document goes live
  notifyDocumentLive(document: BaseDocumentRequest) {
    console.log(`Document "${document.sopName}" is now live. Sending notifications to stakeholders.`);
    this.sendDocumentNotification(document, "Document is now live and published.");
    // In a real app, this would email all stakeholders about the live document
  }
  
  // Send notifications to reviewers
  sendReviewNotifications(document: BaseDocumentRequest, reviewers: Person[]) {
    console.log(`Document "${document.sopName}" sent for review to ${reviewers.length} reviewers.`);
    reviewers.forEach(reviewer => {
      console.log(`Notification sent to reviewer: ${reviewer.name}`);
    });
    // In a real app, this would send emails to all reviewers
  }
  
  // Notify requesters that document is ready for their review
  notifyRequesters(document: BaseDocumentRequest): void {
    console.log(`Notification sent to all requesters for document: ${document.sopName}`);
    // In a real app, this would send actual notifications to all requesters
  }
  
  // Notify document controller about document status
  notifyDocumentController(document: BaseDocumentRequest, source: string) {
    console.log(`Document "${document.sopName}" notification to Document Controller from ${source}.`);
    this.sendDocumentNotification(document, `Status update from ${source}.`);
    // In a real app, this would notify document controllers about status changes
  }
  
  // Send rejection notifications to reviewers
  sendReviewRejectionNotifications(document: BaseDocumentRequest, reason: string) {
    console.log(`Document "${document.sopName}" review rejected. Reason: ${reason}`);
    if (document.reviewers?.length) {
      document.reviewers.forEach(reviewer => {
        console.log(`Rejection notification sent to reviewer: ${reviewer.name}`);
      });
    }
    // In a real app, this would send rejection notifications to all reviewers
  }
  
  // Notify document controller about a query
  notifyDocumentControllerQuery(document: BaseDocumentRequest, query: string) {
    console.log(`Query raised for document "${document.sopName}": ${query}`);
    this.sendDocumentNotification(document, `New query: ${query}`);
    // In a real app, this would notify document controllers about the query
  }
  
  // Notify document owner that approval is needed
  notifyDocumentOwnerForApproval(document: BaseDocumentRequest) {
    console.log(`Document "${document.sopName}" ready for owner approval.`);
    if (document.documentOwners && document.documentOwners.length > 0) {
      console.log(`Notification sent to document owners: ${document.documentOwners.map(owner => owner.name).join(', ')}`);
    } else {
      console.log("No document owners specified, notification sent to all document owners.");
    }
    // In a real app, this would notify the document owner about pending approval
  }
  
  // Send revision reminder to document owner
  sendRevisionReminderToOwner(document: BaseDocumentRequest) {
    console.log(`Revision reminder for document "${document.sopName}" sent to owner.`);
    if (document.documentOwners && document.documentOwners.length > 0) {
      console.log(`Reminder sent to document owners: ${document.documentOwners.map(owner => owner.name).join(', ')}`);
    } else {
      console.log("No document owners specified, reminder sent to all document owners.");
    }
    // In a real app, this would send revision reminders to document owners
  }
}

// Create and export a singleton instance
export const notificationService = new NotificationService();
