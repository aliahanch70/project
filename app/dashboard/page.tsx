'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/dashboard/Header';
import UserProfile from '@/components/dashboard/UserProfile';
import KPICard from '@/components/dashboard/KPICard';
import ActivityChart from '@/components/dashboard/ActivityChart';
import Overview from '@/components/overview';
import SearchBar from '@/components/dashboard/SearchBar';
import Navigation from '@/components/dashboard/Navigation';
import MostViewedProducts from '@/components/dashboard/MostViewedProducts';
import { Users, Activity, TrendingUp, Clock, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getViewsByIpAddress, getViewsTimeline, getTotalUniqueVisitors, getUniqueVisitorsTimeline } from '@/utils/viewAnalytics';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const { isRTL } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewCount, setViewCount] = useState(0);
  const [viewsTimeline, setViewsTimeline] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [visitorTimeline, setVisitorTimeline] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const mockActivityData = [
    { date: '2023-01', value: 40 },
    { date: '2023-02', value: 65 },
    { date: '2023-03', value: 52 },
    { date: '2023-04', value: 78 }
  ];
  const supabase = createClient();

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const response = await fetch('/api/views');
        const views = await response.json();
        const ipAddress = "81.19.216.3"; // You can make this dynamic
        
        const count = getViewsByIpAddress(views, ipAddress);
        const timeline = getViewsTimeline(views, ipAddress);
        const totalUniqueVisitors = getTotalUniqueVisitors(views);
        const visitorsOverTime = getUniqueVisitorsTimeline(views);
        
        setViewCount(count);
        setViewsTimeline(timeline);
        setUniqueVisitors(totalUniqueVisitors);
        setVisitorTimeline(visitorsOverTime);
      } catch (error) {
        console.error('Failed to fetch views:', error);
      }
    };

    fetchViews();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setUser(profile);
      }
    };

    getUser();
  }, [supabase]);

  if (!user) return null;

  return (
    <div className={`min-h-screen bg-black ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header at the top */}
      <Header />
      
      <div className="flex pt-16"> {/* Add padding-top to account for fixed header */}
        {/* Sidebar */}
        <div className={`hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:bottom-0 lg:top-16 bg-black border-${isRTL ? 'l' : 'r'}`}>
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className={`flex items-center flex-shrink-0 px-4 ${isRTL ? 'justify-end' : 'justify-start'}`}>
              <h1 className="text-xl font-bold">Dashboard</h1>
            </div>
            <div className="mt-8 flex-1 px-4">
              <Navigation />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className={`flex flex-col flex-1 ${isRTL ? 'lg:pr-64' : 'lg:pl-64'}`}>
          <div className="flex-1 pb-8">
            <div className="px-4 sm:px-6 lg:px-8">
              {/* Search */}
              <div className="mb-6 z-0">
                <SearchBar onSearch={setSearchQuery} />
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <KPICard
                  title="Total Users"
                  value="1,234"
                  icon={<Users className="h-4 w-4 text-muted-foreground" />}
                  trend={{ value: 12, isPositive: true }}
                />
                <KPICard
                  title="Active Now"
                  value="123"
                  icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                  description="Users online"
                />
                <KPICard
                  title="Growth Rate"
                  value="23%"
                  icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                  trend={{ value: 8, isPositive: true }}
                />
                <KPICard
                  title="Avg. Session"
                  value="24m"
                  icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                  description="Per user"
                />
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{viewCount}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{uniqueVisitors}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Add Most Viewed Products Box */}
              <div className="mb-8">
                <MostViewedProducts />
              </div>

              {/* Charts and other content */}
              <div className={`grid grid-cols-1 gap-4 md:grid-cols-3 mb-8 ${isRTL ? 'md:gap-x-6' : ''}`}>
                <ActivityChart data={mockActivityData} />
                <UserProfile user={user} />
              </div>

              <div className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Overview data={viewsTimeline.data} labels={viewsTimeline.labels} />
                  </CardContent>
                </Card>
              </div>

              <div className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Visitor Activity Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Overview data={visitorTimeline.data} labels={visitorTimeline.labels} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}