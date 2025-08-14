import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useApiConnection,
  useDashboardStats,
  useDocuments,
} from "@/hooks/useApiData";
import {
  Loader2,
  Database,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";

export const DatabaseStatus: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const { isConnected, lastCheck, checkConnection, isLoading } =
    useApiConnection();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: documentsData, isLoading: documentsLoading } = useDocuments({
    limit: 5,
  });

  const testAPI = async () => {
    setIsTesting(true);
    try {
      const results = {
        timestamp: new Date().toISOString(),
        tests: [],
      };

      // Test health endpoint
      try {
        const healthResponse = await fetch("http://localhost:3001/api/health");
        const healthData = await healthResponse.json();
        results.tests.push({
          endpoint: "/api/health",
          status: "PASS",
          response: healthData,
        });
      } catch (error) {
        results.tests.push({
          endpoint: "/api/health",
          status: "FAIL",
          error: error.message,
        });
      }

      // Test documents endpoint
      try {
        const docsResponse = await fetch(
          "http://localhost:3001/api/documents?limit=1"
        );
        const docsData = await docsResponse.json();
        results.tests.push({
          endpoint: "/api/documents",
          status: "PASS",
          response: {
            count: docsData.documents?.length || 0,
            pagination: docsData.pagination,
          },
        });
      } catch (error) {
        results.tests.push({
          endpoint: "/api/documents",
          status: "FAIL",
          error: error.message,
        });
      }

      // Test users endpoint
      try {
        const usersResponse = await fetch("http://localhost:3001/api/users");
        const usersData = await usersResponse.json();
        results.tests.push({
          endpoint: "/api/users",
          status: "PASS",
          response: { count: usersData.length },
        });
      } catch (error) {
        results.tests.push({
          endpoint: "/api/users",
          status: "FAIL",
          error: error.message,
        });
      }

      setTestResults(results);
    } catch (error) {
      setTestResults({
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Database Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection Status
          </CardTitle>
          <CardDescription>
            Real-time status of the SQLite database and API connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Connection Status:</span>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isConnected ? (
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Disconnected
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkConnection}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {lastCheck && (
            <div className="text-sm text-muted-foreground">
              Last checked: {new Date(lastCheck).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Database Statistics</CardTitle>
            <CardDescription>
              Current data metrics from the SQLite database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalDocuments}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Documents
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.liveDocuments}
                </div>
                <div className="text-sm text-muted-foreground">
                  Live Documents
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.underReview}
                </div>
                <div className="text-sm text-muted-foreground">
                  Under Review
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalUsers}
                </div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Documents */}
      {documentsData && (
        <Card>
          <CardHeader>
            <CardTitle>Sample Documents</CardTitle>
            <CardDescription>
              Recent documents from the database (showing first 5)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documentsData.documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{doc.sop_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {doc.document_code} • {doc.department} • {doc.status}
                    </div>
                  </div>
                  <Badge
                    variant={doc.status === "live" ? "default" : "secondary"}
                  >
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Testing */}
      <Card>
        <CardHeader>
          <CardTitle>API Testing</CardTitle>
          <CardDescription>
            Test the REST API endpoints to verify functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={testAPI}
            disabled={isTesting || !isConnected}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing API...
              </>
            ) : (
              "Run API Tests"
            )}
          </Button>

          {testResults && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Test run at: {new Date(testResults.timestamp).toLocaleString()}
              </div>

              {testResults.error ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-800 font-medium">Test Error:</div>
                  <div className="text-red-600 text-sm">
                    {testResults.error}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {testResults.tests.map((test: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg ${
                        test.status === "PASS"
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{test.endpoint}</span>
                        <Badge
                          variant={
                            test.status === "PASS" ? "default" : "destructive"
                          }
                        >
                          {test.status}
                        </Badge>
                      </div>
                      {test.status === "PASS" ? (
                        <div className="text-sm text-green-700 mt-1">
                          Response: {JSON.stringify(test.response)}
                        </div>
                      ) : (
                        <div className="text-sm text-red-700 mt-1">
                          Error: {test.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
