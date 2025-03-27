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
  UserPlus 
} from 'lucide-react';

// Shadcn UI Components
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
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
  DialogTrigger 
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

// API Configuration
const API_URL = 'http://localhost:8000';  // Your FastAPI backend URL

const WhatsAppBulkMessenger = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Form States
  const [contacts, setContacts] = useState([]);
  const [message, setMessage] = useState('');
  const [campaignType, setCampaignType] = useState('broadcast');
  const [campaignName, setCampaignName] = useState('');

  // Authentication Forms
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Campaign Statistics
  const [campaignStats, setCampaignStats] = useState({
    total_sent: 0,
    delivered: 0,
    pending: 0,
    failed: 0
  });

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
        setContacts(contactList);
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
      setUser(response.data.user);
      
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
        contacts: contacts
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast({
        title: "Campaign Created",
        description: `Campaign ${response.data.campaign_id} started`
      });
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>WhatsApp Bulk Messenger</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </TabsTrigger>
                <TabsTrigger value="register">
                  <UserPlus className="mr-2 h-4 w-4" /> Register
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <div className="space-y-4">
                  <Input 
                    placeholder="Email" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <Button onClick={handleLogin} className="w-full">
                    Login
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="register">
                <div className="space-y-4">
                  <Input 
                    placeholder="Username" 
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                  />
                  <Input 
                    placeholder="Email" 
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                  <Button onClick={handleRegister} className="w-full">
                    Register
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Application UI (similar to previous implementation)
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Logout */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            WhatsApp Bulk Messenger
          </h1>
          <div className="flex space-x-2">
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
            <Button>
              <Send className="mr-2 h-4 w-4" /> New Campaign
            </Button>
          </div>
        </header>
        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Contacts Management */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" /> Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input 
                  placeholder="Search contacts" 
                  icon={<Users />} 
                />
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" /> Import Contacts
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" /> Export Contacts
                </Button>
                <div className="bg-gray-100 p-4 rounded">
                  <p className="text-sm text-gray-600">
                    Total Contacts: {contacts.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Creation */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" /> Create Campaign
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="message">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="message">Message</TabsTrigger>
                  <TabsTrigger value="settings">Campaign Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="message">
                  <div className="space-y-4">
                    <Select 
                      value={campaignType}
                      onValueChange={setCampaignType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Campaign Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="broadcast">Broadcast</SelectItem>
                        <SelectItem value="personalized">Personalized</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea 
                      placeholder="Type your message here..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[150px]"
                    />
                    <div className="flex items-center space-x-2">
                      <Switch id="attach-file" />
                      <label htmlFor="attach-file" className="text-sm">
                        Attach File
                      </label>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="settings">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label>Batch Size</label>
                      <Input 
                        type="number" 
                        defaultValue={50} 
                        className="w-24" 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label>Time Interval (seconds)</label>
                      <Input 
                        type="number" 
                        defaultValue={10} 
                        className="w-24" 
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <Button className="w-full mt-4">
                <Send className="mr-2 h-4 w-4" /> Send Campaign
              </Button>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="md:col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="mr-2 h-5 w-5" /> Campaign Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <h3 className="text-sm font-semibold">Total Sent</h3>
                  <p className="text-2xl font-bold text-blue-600">1,234</p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <h3 className="text-sm font-semibold">Delivered</h3>
                  <p className="text-2xl font-bold text-green-600">1,100</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded">
                  <h3 className="text-sm font-semibold">Pending</h3>
                  <p className="text-2xl font-bold text-yellow-600">100</p>
                </div>
                <div className="bg-red-50 p-4 rounded">
                  <h3 className="text-sm font-semibold">Failed</h3>
                  <p className="text-2xl font-bold text-red-600">34</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button onClick={createCampaign} className="w-full mt-4">
          <Send className="mr-2 h-4 w-4" /> Send Campaign
        </Button>
      </div>
    </div>
  );
};

export default WhatsAppBulkMessenger;

// npm install axios @/components/ui/toast