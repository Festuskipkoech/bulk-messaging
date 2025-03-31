import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Send, 
  Users, 
  FileSpreadsheet, 
  MessageCircle, 
  Calendar, 
  PieChart, 
  Settings, 
  Upload, 
  Download,
  LogIn,
  UserPlus,
  Search,
  ChevronRight,
  Bell,
  User,
  LogOut,
  Package,
  BarChart4,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  FileText,
  Info
} from 'lucide-react';

// Shadcn UI Components
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// API Configuration
const API_URL = 'http://localhost:8000';  // Your FastAPI backend URL

const WhatsAppBulkMessenger = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState({ name: "John Doe", email: "john@example.com" });

  // Form States
  const [contacts, setContacts] = useState([
    { id: 1, name: "Jane Smith", phone: "+1234567890" },
    { id: 2, name: "Robert Johnson", phone: "+0987654321" },
    { id: 3, name: "Emily Davis", phone: "+1122334455" },
  ]);
  const [message, setMessage] = useState('');
  const [campaignType, setCampaignType] = useState('broadcast');
  const [campaignName, setCampaignName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // UI States
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [newCampaignOpen, setNewCampaignOpen] = useState(false);

  // Authentication Forms
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Campaign Statistics
  const [campaignStats, setCampaignStats] = useState({
    total_sent: 1234,
    delivered: 1100,
    pending: 100,
    failed: 34
  });

  // Sample data for dashboard
  const recentCampaigns = [
    { id: 'CAM-001', name: 'March Newsletter', sent: 320, delivered: 310, date: '2025-03-26' },
    { id: 'CAM-002', name: 'Product Launch', sent: 450, delivered: 430, date: '2025-03-25' },
    { id: 'CAM-003', name: 'Event Reminder', sent: 180, delivered: 175, date: '2025-03-24' },
  ];

  const messageTemplates = [
    { id: 1, name: "Welcome Message", content: "Hello {{name}}, welcome to our service!" },
    { id: 2, name: "Promotional Offer", content: "Hi {{name}}, we have a special offer for you: 20% off on all products!" },
    { id: 3, name: "Event Reminder", content: "Reminder: Our event is happening tomorrow at 6 PM. We hope to see you there!" },
  ];

  // File Upload Handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Parse CSV or Excel file
        const contactList = e.target.result
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        setContacts([...contacts, ...contactList.map((contact, i) => ({ 
          id: contacts.length + i + 1,
          name: `Contact ${contacts.length + i + 1}`,
          phone: contact 
        }))]);
        setImportDialogOpen(false);
        toast({
          title: "Contacts Imported",
          description: `${contactList.length} contacts added successfully`
        });
      };
      reader.readAsText(file);
    }
  };

  // Authentication Handlers
  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: loginEmail,
        password: loginPassword
      });
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.access_token);
      setIsAuthenticated(true);
      setUser(response.data.user || { name: "John Doe", email: loginEmail });
      
      toast({
        title: "Login Successful",
        description: "Welcome back!"
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.detail || "Invalid credentials",
        variant: "destructive"
      });
    }
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post(`${API_URL}/users`, {
        username: registerUsername,
        email: registerEmail,
        password: registerPassword
      });
      
      toast({
        title: "Registration Successful",
        description: "You can now log in"
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.detail || "Registration error",
        variant: "destructive"
      });
    }
  };

  // Campaign Creation
  const createCampaign = async () => {
    try {
      const response = await axios.post(`${API_URL}/campaigns`, {
        name: campaignName,
        message_template: message,
        campaign_type: campaignType,
        contacts: contacts.map(c => c.phone)
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast({
        title: "Campaign Created",
        description: `Campaign ${response.data?.campaign_id || 'CAM-' + Math.floor(Math.random() * 1000)} started`
      });
      setNewCampaignOpen(false);
      setCurrentView('dashboard');
    } catch (error) {
      toast({
        title: "Campaign Creation Failed",
        description: error.response?.data?.detail || "Could not create campaign",
        variant: "destructive"
      });
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  // If not authenticated, show login/register options
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <Card className="w-[450px] shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">WhatsApp Bulk Messenger</CardTitle>
            <CardDescription className="text-green-50 mt-2">Reach your audience efficiently</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="rounded-lg">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg">
                  <UserPlus className="mr-2 h-4 w-4" /> Register
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input 
                      placeholder="your@email.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                      <Switch id="remember-me" />
                      <label htmlFor="remember-me">Remember me</label>
                    </div>
                    <a href="#" className="text-green-600 hover:underline">Forgot password?</a>
                  </div>
                  <Button onClick={handleLogin} className="w-full bg-green-600 hover:bg-green-700">
                    Login
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="register">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Username</label>
                    <Input 
                      placeholder="johnsmith" 
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input 
                      placeholder="your@email.com" 
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <Button onClick={handleRegister} className="w-full bg-green-600 hover:bg-green-700">
                    Create Account
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center text-xs text-gray-500 px-6 pb-6 pt-0">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Import Contacts Dialog
  const ImportContactsDialog = () => (
    <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">Drag and drop your CSV or Excel file here</p>
            <p className="text-xs text-gray-500 mb-4">Format: Name, Phone Number</p>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Input 
                id="file-upload" 
                type="file" 
                accept=".csv,.xlsx,.xls" 
                className="hidden" 
                onChange={handleFileUpload}
              />
              <Button variant="outline" className="text-sm">
                Select File
              </Button>
            </label>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="text-sm font-medium text-green-800 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Need help?
            </h4>
            <p className="text-xs text-green-700 mt-1">
              Download our sample template to see the required format for importing contacts.
            </p>
            <Button variant="link" className="text-green-600 text-xs p-0 h-auto mt-2">
              Download Template
            </Button>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => setImportDialogOpen(false)}>
            Import Contacts
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // New Campaign Dialog
  const NewCampaignDialog = () => (
    <Dialog open={newCampaignOpen} onOpenChange={setNewCampaignOpen} className="max-w-4xl">
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Tabs defaultValue="message" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basics" className="rounded-lg">
                <Package className="mr-2 h-4 w-4" /> Campaign Details
              </TabsTrigger>
              <TabsTrigger value="message" className="rounded-lg">
                <MessageCircle className="mr-2 h-4 w-4" /> Message
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="basics">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Campaign Name</label>
                  <Input 
                    placeholder="Spring Promotion 2025" 
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Campaign Type</label>
                  <Select 
                    value={campaignType}
                    onValueChange={setCampaignType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Campaign Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="broadcast">Broadcast (Same message to all)</SelectItem>
                      <SelectItem value="personalized">Personalized (Use variables)</SelectItem>
                      <SelectItem value="scheduled">Scheduled Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Audience</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Audience Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contacts ({contacts.length})</SelectItem>
                      <SelectItem value="customers">Customers (24)</SelectItem>
                      <SelectItem value="leads">New Leads (16)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                  <h4 className="text-sm font-medium text-blue-800 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Audience Overview
                  </h4>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Total Recipients:</span>
                      <span className="font-medium">{contacts.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Estimated Delivery:</span>
                      <span className="font-medium">~ 5 minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="message">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Message Template</label>
                    <Button variant="link" className="text-xs p-0 h-auto">
                      Save as Template
                    </Button>
                  </div>
                  
                  <Select 
                    value={selectedTemplate}
                    onValueChange={(value) => {
                      setSelectedTemplate(value);
                      const template = messageTemplates.find(t => t.id.toString() === value);
                      if (template) setMessage(template.content);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Template or Create New" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Create New Message</SelectItem>
                      {messageTemplates.map(template => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message Content</label>
                  <Textarea 
                    placeholder="Type your message here..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[200px]"
                  />
                  {campaignType === 'personalized' && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-2">Available variables:</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-100" 
                          onClick={() => setMessage(message + " {{name}}")}>
                          {{name}}
                        </Badge>
                        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-100"
                          onClick={() => setMessage(message + " {{phone}}")}>
                          {{phone}}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="attach-file" />
                    <label htmlFor="attach-file" className="text-sm">
                      Attach Media
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="add-buttons" />
                    <label htmlFor="add-buttons" className="text-sm">
                      Add Call-to-Action Buttons
                    </label>
                  </div>
                </div>
                
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Message Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <div className="bg-green-500 text-white p-3 rounded-lg inline-block max-w-xs">
                        {message || "Your message preview will appear here"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Delivery Settings</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500">Batch Size</label>
                      <Input 
                        type="number" 
                        defaultValue={50} 
                      />
                      <p className="text-xs text-gray-500">Messages per batch</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500">Time Interval</label>
                      <Input 
                        type="number" 
                        defaultValue={10} 
                      />
                      <p className="text-xs text-gray-500">Seconds between batches</p>
                    </div>
                  </div>
                  
                  {campaignType === 'scheduled' && (
                    <div className="space-y-2">
                      <label className="text-xs text-gray-500">Schedule Date & Time</label>
                      <Input 
                        type="datetime-local" 
                      />
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Advanced Options</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch id="retry-failed" />
                        <label htmlFor="retry-failed" className="text-sm">
                          Auto-retry failed messages
                        </label>
                      </div>
                      <Select>
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="3 times" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 time</SelectItem>
                          <SelectItem value="3">3 times</SelectItem>
                          <SelectItem value="5">5 times</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="avoid-duplicates" defaultChecked />
                      <label htmlFor="avoid-duplicates" className="text-sm">
                        Avoid sending duplicates
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="track-delivery" defaultChecked />
                      <label htmlFor="track-delivery" className="text-sm">
                        Track delivery status
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="text-sm font-medium text-yellow-800 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Important Notice
                  </h4>
                  <p className="text-xs text-yellow-700 mt-1">
                    To avoid being flagged as spam, we recommend keeping batch sizes below 100 messages and setting appropriate time intervals between batches.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => setNewCampaignOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={createCampaign} className="bg-green-600 hover:bg-green-700">
            <Send className="mr-2 h-4 w-4" /> Launch Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Components for different views
  const DashboardView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-green-700">Total Campaigns</p>
                <h3 className="text-3xl font-bold text-green-900">12</h3>
              </div>
              <div className="bg-green-200 p-2 rounded-lg">
                <Package className="h-5 w-5 text-green-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-700">
              <ChevronRight className="h-3 w-3 mr-1" />
              <span>3 active campaigns</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-blue-700">Total Contacts</p>
                <h3 className="text-3xl font-bold text-blue-900">{contacts.length}</h3>
              </div>
              <div className="bg-blue-200 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-blue-700">
              <ChevronRight className="h-3 w-3 mr-1" />
              <span>24 groups</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-purple-700">Messages Sent</p>
                <h3 className="text-3xl font-bold text-purple-900">{campaignStats.total_sent}</h3>
              </div>
              <div className="bg-purple-200 p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-purple-700">
              <ChevronRight className="h-3 w-3 mr-1" />
              <span>Last 30 days</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-amber-700">Delivery Rate</p>
                <h3 className="text-3xl font-bold text-amber-900">94.8%</h3>
              </div>
              <div className="bg-amber-200 p-2 rounded-lg">
                <BarChart4 className="h-5 w-5 text-amber-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-amber-700">
              <ChevronRight className="h-3 w-3 mr-1" />
              <span>+2.4% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCampaigns.map((campaign) => (<div key={campaign.id} className="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
  <div className="bg-green-100 p-2 rounded-full mr-4">
    <MessageCircle className="h-5 w-5 text-green-600" />
  </div>
  <div className="flex-1 min-w-0">
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-medium truncate">{campaign.name}</h4>
        <p className="text-xs text-gray-500">ID: {campaign.id} • {campaign.date}</p>
      </div>
      <Badge variant="outline" className="ml-2">
        {campaign.delivered}/{campaign.sent} delivered
      </Badge>
    </div>
    <div className="mt-2">
      <Progress value={(campaign.delivered/campaign.sent) * 100} className="h-1.5" />
    </div>
  </div>
  <Button variant="ghost" size="sm" className="ml-2">
    <ChevronRight className="h-4 w-4" />
  </Button>
</div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" className="text-xs">
                View All Campaigns
              </Button>
            </div>
          </CardContent>
        </Card>
                
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-3 rounded-lg bg-green-50 border border-green-100">
                <div className="p-2 rounded-full bg-green-200 mr-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Delivered</p>
                  <p className="text-xs text-green-600">{campaignStats.delivered} messages</p>
                </div>
                <p className="text-xl font-bold text-green-800">
                  {Math.round((campaignStats.delivered / campaignStats.total_sent) * 100)}%
                </p>
              </div>
              
              <div className="flex items-center p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                <div className="p-2 rounded-full bg-yellow-200 mr-3">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">Pending</p>
                  <p className="text-xs text-yellow-600">{campaignStats.pending} messages</p>
                </div>
                <p className="text-xl font-bold text-yellow-800">
                  {Math.round((campaignStats.pending / campaignStats.total_sent) * 100)}%
                </p>
              </div>
              
              <div className="flex items-center p-3 rounded-lg bg-red-50 border border-red-100">
                <div className="p-2 rounded-full bg-red-200 mr-3">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Failed</p>
                  <p className="text-xs text-red-600">{campaignStats.failed} messages</p>
                </div>
                <p className="text-xl font-bold text-red-800">
                  {Math.round((campaignStats.failed / campaignStats.total_sent) * 100)}%
                </p>
              </div>
              
              <Button variant="outline" className="w-full mt-2 text-sm">
                <PieChart className="h-4 w-4 mr-2" /> Detailed Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  
  const ContactsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Contacts</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Add Contact
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <CardTitle>Contact List</CardTitle>
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="Search contacts..." 
                className="w-60"
                prefix={<Search className="h-4 w-4 text-gray-400" />}
              />
              <Select defaultValue="all">
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contacts</SelectItem>
                  <SelectItem value="customers">Customers</SelectItem>
                  <SelectItem value="leads">New Leads</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Phone Number</th>
                  <th className="px-6 py-3">Group</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{contact.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{contact.phone}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">General</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                        Active
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
            <span>Showing {contacts.length} of {contacts.length} contacts</span>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Main Application UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col h-screen">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 shadow-sm py-3 px-6">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-green-600 flex items-center">
                <MessageCircle className="mr-2 h-5 w-5 fill-green-500 text-white" />
                WhatsApp Bulk Messenger
              </h1>
              
              <nav className="hidden md:flex space-x-6">
                <button 
                  className={`text-sm font-medium ${currentView === 'dashboard' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setCurrentView('dashboard')}
                >
                  Dashboard
                </button>
                <button 
                  className={`text-sm font-medium ${currentView === 'campaigns' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setCurrentView('campaigns')}
                >
                  Campaigns
                </button>
                <button 
                  className={`text-sm font-medium ${currentView === 'contacts' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setCurrentView('contacts')}
                >
                  Contacts
                </button>
                <button 
                  className={`text-sm font-medium ${currentView === 'templates' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setCurrentView('templates')}
                >
                  Templates
                </button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setNewCampaignOpen(true)}
                className="bg-green-600 hover:bg-green-700 hidden md:flex"
              >
                <Send className="mr-2 h-4 w-4" /> New Campaign
              </Button>
              
              <button className="relative p-1.5 rounded-full bg-gray-100 hover:bg-gray-200">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-600 text-white">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'contacts' && <ContactsView />}
            {(currentView === 'campaigns' || currentView === 'templates') && (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">This view is under development.</p>
              </div>
            )}
          </div>
        </main>
        
        {/* Mobile Action Button */}
        <div className="md:hidden fixed bottom-6 right-6">
          <Button 
            onClick={() => setNewCampaignOpen(true)}
            className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg p-0 flex items-center justify-center"
          >
            <Send className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* Dialogs */}
      <ImportContactsDialog />
      <NewCampaignDialog />
    </div>
  );
};

export default WhatsAppBulkMessenger;