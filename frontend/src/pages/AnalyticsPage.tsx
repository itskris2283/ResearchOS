import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  FileText,
  Users,
  Database,
  GitBranch,
  Award,
  Building,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export default function AnalyticsPage() {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?._id ?? "";
  const { data, isLoading } = useAnalytics(workspaceId);
  const analytics = data?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Research Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Understand the research landscape with data-driven insights
          </p>
        </div>
        <Button variant="outline" size="sm"><BarChart3 className="h-4 w-4 mr-2" /> Export Report</Button>
      </div>

      {!workspaceId ? (
        <div className="text-center py-16 text-muted-foreground">
          <BarChart3 className="mx-auto h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">Select a workspace to view analytics</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : !analytics ? (
        <div className="text-center py-16 text-muted-foreground">
          <BarChart3 className="mx-auto h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">Analytics not yet available</p>
          <p className="text-xs mt-1">Analytics will generate after discovery completes</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: FileText, label: "Total Papers", value: (analytics.total_papers ?? 0).toLocaleString() },
              { icon: Users, label: "Authors", value: (analytics.total_authors ?? 0).toLocaleString() },
              { icon: Database, label: "Datasets", value: (analytics.total_datasets ?? 0).toLocaleString() },
              { icon: GitBranch, label: "Methods", value: (analytics.total_methods ?? 0).toLocaleString() },
            ].map((stat) => (
              <Card key={stat.label} className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="venues">Venues</TabsTrigger>
              <TabsTrigger value="institutions">Institutions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Publication Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(analytics.publication_trend?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        {analytics.publication_trend!.map((pt) => (
                          <div key={pt.year} className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground w-10">{pt.year}</span>
                            <Progress value={Math.min(pt.count / Math.max(...analytics.publication_trend!.map((t) => t.count)) * 100, 100)} className="h-5 flex-1" />
                            <span className="text-sm font-medium w-12 text-right">{pt.count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No publication trend data</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      Method Popularity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(analytics.method_popularity?.length ?? 0) > 0 ? (
                      <div className="space-y-3">
                        {analytics.method_popularity!.map((method) => (
                          <div key={method.name} className="flex items-center gap-3">
                            <span className="text-sm flex-1">{method.name}</span>
                            <Progress value={Math.min(method.count / Math.max(...analytics.method_popularity!.map((m) => m.count)) * 100, 100)} className="h-2 flex-1" />
                            <span className="text-sm text-muted-foreground w-12 text-right">{method.count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No method data</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    Top Institutions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(analytics.institution_distribution?.length ?? 0) > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {analytics.institution_distribution!.map((inst) => (
                        <div key={inst.name} className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Building className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{inst.name}</p>
                            <p className="text-xs text-muted-foreground">{inst.count} papers</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No institution data</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="mt-4">
              <Card className="glass-card">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <BarChart3 className="mx-auto h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">Detailed trend analysis powered by Recharts</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="venues" className="mt-4">
              <Card className="glass-card">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <BarChart3 className="mx-auto h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">Venue and conference distribution</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="institutions" className="mt-4">
              <Card className="glass-card">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <BarChart3 className="mx-auto h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">Global institution distribution</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
