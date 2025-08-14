
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import CustomStatCard from '../CustomStatCard';

interface DocumentControllerAnalyticsProps {
  documents: any[];
}

const DocumentControllerAnalytics: React.FC<DocumentControllerAnalyticsProps> = ({ documents }) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Calculate metrics
  const metrics = {
    totalDocuments: documents.length,
    liveDocuments: documents.filter(doc => doc.status === 'live').length,
    underReview: documents.filter(doc => doc.status === 'under-review').length,
    pendingApproval: documents.filter(doc => doc.status === 'pending-approval').length,
    breached: documents.filter(doc => doc.isBreached === true).length,
  };
  
  // Data for status distribution chart
  const statusData = [
    { name: 'Live', value: metrics.liveDocuments },
    { name: 'For Review', value: metrics.underReview },
    { name: 'Pending Approval', value: metrics.pendingApproval },
    { name: 'Breached', value: metrics.breached },
  ];
  
  // Data for document creation over time
  const monthlyData = Array(12).fill(0).map((_, i) => ({
    month: new Date(0, i).toLocaleString('default', { month: 'short' }),
    count: Math.floor(Math.random() * 10) + 1 // Random data for demonstration
  }));
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#FFBB28', '#FF8042', '#FF0000'];
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Document Controller Analytics</h2>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CustomStatCard 
          title="Total Documents" 
          count={metrics.totalDocuments} 
          iconType="file" 
          color="blue" 
        />
        <CustomStatCard 
          title="For Review" 
          count={metrics.underReview} 
          iconType="clock" 
          color="amber" 
        />
        <CustomStatCard 
          title="Live" 
          count={metrics.breached} 
          iconType="alert" 
          color="red" 
        />
        <CustomStatCard 
          title="Live Documents" 
          count={metrics.liveDocuments} 
          iconType="check" 
          color="green" 
        />
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="status">Status Distribution</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Creation Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentControllerAnalytics;
