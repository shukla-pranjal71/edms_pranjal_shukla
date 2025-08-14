import React, { useEffect, useState } from "react";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Bell, User, LogOut, Check, CheckCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { documentService } from "@/services/documentService";
interface Notification {
  id: string;
  type: 'review' | 'system' | 'task' | 'approval' | 'announcement';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  linkTo?: string;
  documentId?: string;
}
const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("User");
  const [userRole, setUserRole] = useState<string>("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  useEffect(() => {
    // Get the role from localStorage
    const role = localStorage.getItem("userRole") || "";
    setUserRole(role);

    // Set a mock username based on role
    // In a real app, this would come from your auth provider
    switch (role) {
      case "admin":
        setUserName("Admin User");
        break;
      case "document-owner":
        setUserName("Document Owner");
        break;
      case "requester":
        setUserName("Document Requester");
        break;
      case "document-controller":
        setUserName("Document Controller");
        break;
      case "document-creator":
        setUserName("Document Creator");
        break;
      default:
        setUserName("Guest User");
    }

    // Generate notifications using real document data
    generateNotificationsFromDocuments();
  }, []);
  const generateNotificationsFromDocuments = async () => {
    try {
      const documents = await documentService.getAllDocuments();
      const generatedNotifications: Notification[] = [];
      documents.forEach((doc, index) => {
        // Generate review notifications using real reviewer names
        if (doc.reviewers && doc.reviewers.length > 0) {
          const reviewer = doc.reviewers[0];
          if (doc.status === 'approved') {
            generatedNotifications.push({
              id: `review-${doc.id}-${index}`,
              type: 'review',
              title: 'Document Review Required',
              message: `${doc.sopName} has been approved by ${reviewer.name}.`,
              timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
              isRead: Math.random() > 0.5,
              linkTo: '/dashboard',
              documentId: doc.id
            });
          } else if (doc.status === 'under-review') {
            generatedNotifications.push({
              id: `review-reminder-${doc.id}-${index}`,
              type: 'review',
              title: 'Review Reminder',
              message: `Reminder: ${doc.sopName} is due for review in 3 days.`,
              timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
              isRead: Math.random() > 0.3,
              linkTo: '/dashboard',
              documentId: doc.id
            });
          }
        }

        // Generate task notifications using real document owner names
        if (doc.documentOwners && doc.documentOwners.length > 0) {
          const owner = doc.documentOwners[0];
          generatedNotifications.push({
            id: `task-${doc.id}-${index}`,
            type: 'task',
            title: 'New Task Assignment',
            message: `You have been added as a Task Owner for ${doc.sopName} by ${owner.name}.`,
            timestamp: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
            isRead: Math.random() > 0.4,
            linkTo: '/dashboard',
            documentId: doc.id
          });
        }

        // Generate approval notifications using real document creator names
        if (doc.documentCreators && doc.documentCreators.length > 0) {
          const creator = doc.documentCreators[0];
          generatedNotifications.push({
            id: `approval-${doc.id}-${index}`,
            type: 'approval',
            title: 'Document Query',
            message: `${doc.sopName} has been queried by ${creator.name}.`,
            timestamp: new Date(Date.now() - Math.random() * 5 * 60 * 60 * 1000),
            isRead: Math.random() > 0.2,
            linkTo: '/dashboard',
            documentId: doc.id
          });
        }

        // Generate system notifications using real document names
        if (doc.uploadDate) {
          generatedNotifications.push({
            id: `system-${doc.id}-${index}`,
            type: 'system',
            title: 'Upload Status',
            message: `${doc.sopName} successfully uploaded to SharePoint.`,
            timestamp: new Date(Date.now() - Math.random() * 30 * 60 * 1000),
            isRead: Math.random() > 0.1,
            linkTo: '/dashboard',
            documentId: doc.id
          });
        }
      });

      // Add some general announcements
      generatedNotifications.push({
        id: 'announcement-1',
        type: 'announcement',
        title: 'System Maintenance',
        message: 'System maintenance scheduled for June 5th, 2 AM–4 AM.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        isRead: false
      });

      // Sort by timestamp (newest first) and limit to most recent 15
      const sortedNotifications = generatedNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 15);
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Error generating notifications:', error);
      // Fallback to empty notifications if there's an error
      setNotifications([]);
    }
  };

  // Format role for display
  const formatRoleName = (role: string) => {
    if (!role) return "";
    return role.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return timestamp.toLocaleDateString();
  };
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'review':
        return '📋';
      case 'system':
        return '⚙️';
      case 'task':
        return '✅';
      case 'approval':
        return '❓';
      case 'announcement':
        return '📢';
      default:
        return '🔔';
    }
  };
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? {
      ...n,
      isRead: true
    } : n));
  };
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({
      ...n,
      isRead: true
    })));
  };
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.linkTo) {
      navigate(notification.linkTo);
    }
  };
  const handleLogout = () => {
    // Handle logout functionality - this would be implemented based on your auth system
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };
  return <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-3 shadow-sm border-b border-amber-100 bg-header bg-[#fdb018]">
      <div className="flex items-center gap-6">
        <Link to="/" className="font-bold text-3xl text-[#0052CC] cursor-pointer hover:text-[#0052CC] transition-colors">
          <img src="/lovable-uploads/a390b421-ca77-4ac3-8308-8a0b052d6a4c.png" alt="Sharaf DG" className="h-12" />
        </Link>
        <div className="h-6 w-px bg-gray-300" />
        <div className="font-medium text-gray-700">Electronic Document Management System</div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="text-gray-700" onClick={() => window.open('https://sharafdgonline.sharepoint.com/sites/ITKnowledgeVideos/Petty%20Cash/Forms/AllItems.aspx?viewid=1242e4db%2De7fe%2D4a44%2-da5d7%2D1b3587f53a78&csf=1&web=1&e=3mHPKv&CID=c3b8b2f7%2D8a3a%2D47ac%2Db487%2D9be64e259125&FolderCTID=0x01200074F0FF07BAFFF640BA5DAE6759605A5D', '_blank')}>
          Learn More
        </Button>
        <Button variant="ghost" className="text-gray-700" onClick={() => window.open('https://myhelp.sharafdg.com/support/home', '_blank')}>
          Support
        </Button>
        <LanguageToggle />
        <ThemeToggle />
        
        {/* Enhanced Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-700" />
              {unreadCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center p-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[400px] max-h-[500px] overflow-y-auto bg-white z-50">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-1 text-xs text-blue-600 hover:text-blue-800">
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? <DropdownMenuItem disabled>
                  <span className="text-gray-500">No notifications</span>
                </DropdownMenuItem> : notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map(notification => <DropdownMenuItem key={notification.id} className={`cursor-pointer p-3 border-b border-gray-100 last:border-b-0 ${!notification.isRead ? 'bg-blue-50' : ''}`} onClick={() => handleNotificationClick(notification)}>
                      <div className="flex items-start gap-3 w-full">
                        <span className="text-lg flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-medium truncate ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />}
                          </div>
                          <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <span className="text-xs text-gray-400">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuItem>)}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="flex items-center ml-2">
          <Avatar className="h-8 w-8 bg-blue-100 text-blue-600">
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-2 text-sm">
            <div className="font-medium">{userName}</div>
            <div className="text-xs text-gray-600">{formatRoleName(userRole)}</div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-2 gap-2 text-gray-700">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>;
};
export default AppHeader;