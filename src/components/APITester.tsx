import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const APITester = () => {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [testData, setTestData] = useState({
    email: 'admin@company.com',
    password: 'password123',
    documentTitle: 'Test Document',
    documentContent: 'This is a test document content',
    documentType: 'SOP',
    department: 'IT'
  });

  const API_BASE = 'http://localhost:3001/api';

  const testEndpoint = async (name: string, url: string, options?: RequestInit) => {
    setLoading(name);
    try {
      console.log(`Testing ${name}: ${API_BASE}${url}`, options);
      
      const response = await fetch(`${API_BASE}${url}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      setResults(prev => ({ 
        ...prev, 
        [name]: { 
          status: response.status, 
          statusText: response.statusText,
          data,
          timestamp: new Date().toLocaleTimeString()
        } 
      }));
    } catch (error) {
      console.error(`Error testing ${name}:`, error);
      setResults(prev => ({ 
        ...prev, 
        [name]: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toLocaleTimeString()
        } 
      }));
    }
    setLoading(null);
  };

  const getStatusBadge = (status?: number) => {
    if (!status) return <Badge variant="secondary">Error</Badge>;
    if (status >= 200 && status < 300) return <Badge variant="default">Success</Badge>;
    if (status >= 400 && status < 500) return <Badge variant="destructive">Client Error</Badge>;
    if (status >= 500) return <Badge variant="destructive">Server Error</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  const tests = [
    {
      name: 'Health Check',
      description: 'System health and status',
      test: () => testEndpoint('health', '/health'),
      category: 'System'
    },
    {
      name: 'Get Documents',
      description: 'Fetch all documents',
      test: () => testEndpoint('documents', '/documents'),
      category: 'Documents'
    },
    {
      name: 'Get Users',
      description: 'Fetch all users',
      test: () => testEndpoint('users', '/users'),
      category: 'Users'
    },
    {
      name: 'Get Specific Document',
      description: 'Fetch document by ID',
      test: () => testEndpoint('getDocument', '/documents/c67892af-6ba9-4271-a89f-332e82eed2dc'),
      category: 'Documents'
    },
    {
      name: 'Login Test',
      description: 'Test user authentication',
      test: () => testEndpoint('login', '/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testData.email,
          password: testData.password
        }),
      }),
      category: 'Authentication'
    },
    {
      name: 'Create Document',
      description: 'Create a new document',
      test: () => testEndpoint('createDoc', '/documents', {
        method: 'POST',
        body: JSON.stringify({
          title: testData.documentTitle,
          content: testData.documentContent,
          type: testData.documentType,
          department: testData.department
        }),
      }),
      category: 'Documents'
    },
    {
      name: 'System Stats',
      description: 'Get system statistics',
      test: () => testEndpoint('stats', '/system/stats'),
      category: 'System'
    },
    {
      name: 'System Info',
      description: 'Get system information',
      test: () => testEndpoint('info', '/system/info'),
      category: 'System'
    },
    {
      name: 'Get Me',
      description: 'Get current user info',
      test: () => testEndpoint('me', '/auth/me'),
      category: 'Authentication'
    },
    {
      name: 'Upload Test',
      description: 'Test file upload endpoint',
      test: () => testEndpoint('upload', '/upload', {
        method: 'POST',
        body: JSON.stringify({
          filename: 'test.pdf',
          fileType: 'application/pdf'
        }),
      }),
      category: 'Files'
    },
  ];

  const categories = [...new Set(tests.map(test => test.category))];

  const runAllTests = async () => {
    for (const test of tests) {
      await test.test();
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  const clearResults = () => {
    setResults({});
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">🧪 API Endpoint Tester</h1>
          <p className="text-muted-foreground mt-1">
            Test all API endpoints from the frontend interface
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runAllTests} disabled={loading !== null} variant="default">
            {loading ? 'Testing...' : 'Run All Tests'}
          </Button>
          <Button onClick={clearResults} variant="outline">
            Clear Results
          </Button>
        </div>
      </div>

      {/* Test Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Test Email</Label>
              <Input
                id="email"
                value={testData.email}
                onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@company.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Test Password</Label>
              <Input
                id="password"
                type="password"
                value={testData.password}
                onChange={(e) => setTestData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="password123"
              />
            </div>
            <div>
              <Label htmlFor="docTitle">Document Title</Label>
              <Input
                id="docTitle"
                value={testData.documentTitle}
                onChange={(e) => setTestData(prev => ({ ...prev, documentTitle: e.target.value }))}
                placeholder="Test Document"
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={testData.department}
                onChange={(e) => setTestData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="IT"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="content">Document Content</Label>
            <Textarea
              id="content"
              value={testData.documentContent}
              onChange={(e) => setTestData(prev => ({ ...prev, documentContent: e.target.value }))}
              placeholder="Document content goes here..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Buttons by Category */}
      {categories.map(category => (
        <Card key={category} className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>{category} Endpoints</span>
              <Badge variant="outline">{tests.filter(t => t.category === category).length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tests.filter(test => test.category === category).map(({ name, test, description }) => (
                <div key={name} className="flex flex-col">
                  <Button
                    onClick={test}
                    disabled={loading === name}
                    variant={results[name] ? "secondary" : "outline"}
                    className="flex-1 justify-start"
                  >
                    <div className="flex items-center gap-2">
                      {loading === name ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : results[name] ? (
                        getStatusBadge(results[name].status)
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      <span className="text-left">{name}</span>
                    </div>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1 px-1">{description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Results Section */}
      {Object.keys(results).length > 0 && (
        <>
          <Separator className="my-6" />
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Test Results</h2>
            {Object.entries(results).map(([name, result]: [string, any]) => (
              <Card key={name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span>{name}</span>
                    {getStatusBadge(result.status)}
                    <span className="text-sm text-muted-foreground ml-auto">
                      {result.timestamp}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.error ? (
                    <div className="text-red-600 font-mono text-sm">
                      Error: {result.error}
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px] w-full">
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </ScrollArea>
                  )}
                  {result.status && (
                    <div className="text-sm text-muted-foreground mt-2">
                      Status: {result.status} {result.statusText}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default APITester;
