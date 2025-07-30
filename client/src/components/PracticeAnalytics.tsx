import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useQuery } from "@tanstack/react-query";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Activity,
  CreditCard,
  Clock,
  Target,
  Award,
  AlertCircle,
  Download,
  Filter
} from "lucide-react";
import { Progress } from "./ui/progress";

interface PracticeAnalyticsProps {
  practiceId: number;
}

export function PracticeAnalytics({ practiceId }: PracticeAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("month");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  // Fetch analytics data
  const { data: analytics } = useQuery({
    queryKey: ["/api/practice", practiceId, "analytics", timeRange],
    queryFn: async () => {
      // This would be replaced with real API call
      const bookingFees = {
        collected: 145, // Number of collected £5 fees
        pending: 23,    // Number of pending fees
        total: 168      // Total appointments
      };

      return {
        bookingFees,
        revenue: {
          total: 18500 + (bookingFees.collected * 5), // Including booking fees
          treatments: 18500,
          bookingFees: bookingFees.collected * 5,
          growth: 12.5
        },
        appointments: {
          total: 168,
          completed: 145,
          cancelled: 12,
          noShow: 8,
          available: 3
        },
        patients: {
          total: 1247,
          new: 45,
          returning: 1202,
          averagePerDay: 8.2
        },
        performance: {
          completionRate: 92.8,
          satisfactionScore: 4.8,
          averageWaitTime: 12,
          utilizationRate: 87.5
        }
      };
    }
  });

  // Chart data for revenue over time
  const revenueData = [
    { date: "Jul 1", treatments: 580, bookingFees: 35, total: 615 },
    { date: "Jul 5", treatments: 720, bookingFees: 45, total: 765 },
    { date: "Jul 10", treatments: 890, bookingFees: 55, total: 945 },
    { date: "Jul 15", treatments: 650, bookingFees: 40, total: 690 },
    { date: "Jul 20", treatments: 1100, bookingFees: 65, total: 1165 },
    { date: "Jul 25", treatments: 950, bookingFees: 60, total: 1010 },
    { date: "Jul 30", treatments: 830, bookingFees: 50, total: 880 }
  ];

  // Treatment type breakdown
  const treatmentBreakdown = [
    { name: "Routine Cleaning", value: 35, color: "#3B82F6" },
    { name: "Fillings", value: 25, color: "#10B981" },
    { name: "Root Canal", value: 15, color: "#F59E0B" },
    { name: "Emergency", value: 20, color: "#EF4444" },
    { name: "Cosmetic", value: 5, color: "#8B5CF6" }
  ];

  // Hourly appointment distribution
  const hourlyDistribution = [
    { hour: "9AM", appointments: 15 },
    { hour: "10AM", appointments: 22 },
    { hour: "11AM", appointments: 18 },
    { hour: "12PM", appointments: 12 },
    { hour: "1PM", appointments: 8 },
    { hour: "2PM", appointments: 20 },
    { hour: "3PM", appointments: 25 },
    { hour: "4PM", appointments: 18 },
    { hour: "5PM", appointments: 10 }
  ];

  if (!analytics) return <div>Loading analytics...</div>;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Practice Analytics</CardTitle>
              <CardDescription>
                Comprehensive insights into your practice performance
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                  <SelectItem value="quarter">Last 3 months</SelectItem>
                  <SelectItem value="year">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                {analytics.revenue.growth}%
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold">£{analytics.revenue.total.toLocaleString()}</p>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Treatments</span>
                <span className="font-medium">£{analytics.revenue.treatments.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Booking Fees</span>
                <span className="font-medium text-green-600">£{analytics.revenue.bookingFees}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {Math.round((analytics.bookingFees.collected / analytics.bookingFees.total) * 100)}%
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-600">Booking Fees Status</p>
            <p className="text-2xl font-bold">£{analytics.bookingFees.collected * 5}</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Collected</span>
                <span className="font-medium text-green-600">{analytics.bookingFees.collected}</span>
              </div>
              <Progress 
                value={(analytics.bookingFees.collected / analytics.bookingFees.total) * 100} 
                className="h-2"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Pending</span>
                <span className="font-medium text-amber-600">{analytics.bookingFees.pending}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                +{analytics.patients.new}
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Patients</p>
            <p className="text-2xl font-bold">{analytics.patients.total.toLocaleString()}</p>
            <div className="mt-3 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{analytics.patients.averagePerDay}</span> avg per day
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-amber-600" />
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {analytics.performance.utilizationRate}%
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold">{analytics.performance.completionRate}%</p>
            <Progress value={analytics.performance.completionRate} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="appointments">Appointment Insights</TabsTrigger>
          <TabsTrigger value="patients">Patient Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown Over Time</CardTitle>
                <CardDescription>
                  Treatment revenue vs booking fees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorTreatments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `£${value}`} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="treatments" 
                      stackId="1"
                      stroke="#3B82F6" 
                      fillOpacity={1} 
                      fill="url(#colorTreatments)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="bookingFees" 
                      stackId="1"
                      stroke="#10B981" 
                      fillOpacity={1} 
                      fill="url(#colorFees)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Treatment Type Distribution</CardTitle>
                <CardDescription>
                  Breakdown by treatment category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={treatmentBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {treatmentBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Goals</CardTitle>
              <CardDescription>
                Track your progress towards monthly targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Treatment Revenue</span>
                    <span className="text-sm text-gray-500">£18,500 / £20,000</span>
                  </div>
                  <Progress value={92.5} className="h-3" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Booking Fees</span>
                    <span className="text-sm text-gray-500">£725 / £1,000</span>
                  </div>
                  <Progress value={72.5} className="h-3" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <span className="text-sm text-gray-500">£19,225 / £21,000</span>
                  </div>
                  <Progress value={91.5} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Appointment Distribution</CardTitle>
                <CardDescription>
                  Peak hours for appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="appointments" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <span className="text-sm text-gray-500">{analytics.appointments.completed} ({Math.round((analytics.appointments.completed / analytics.appointments.total) * 100)}%)</span>
                  </div>
                  <Progress value={(analytics.appointments.completed / analytics.appointments.total) * 100} className="h-2 bg-gray-200" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">Cancelled</span>
                    </div>
                    <span className="text-sm text-gray-500">{analytics.appointments.cancelled} ({Math.round((analytics.appointments.cancelled / analytics.appointments.total) * 100)}%)</span>
                  </div>
                  <Progress value={(analytics.appointments.cancelled / analytics.appointments.total) * 100} className="h-2 bg-gray-200" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-sm font-medium">No-Show</span>
                    </div>
                    <span className="text-sm text-gray-500">{analytics.appointments.noShow} ({Math.round((analytics.appointments.noShow / analytics.appointments.total) * 100)}%)</span>
                  </div>
                  <Progress value={(analytics.appointments.noShow / analytics.appointments.total) * 100} className="h-2 bg-gray-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}