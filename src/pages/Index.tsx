import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, LineChart, Line, AreaChart, Area } from "recharts";

type RawDataItem = {
  end_year: string | number;
  intensity: number;
  sector: string;
  topic: string;
  insight: string;
  url: string;
  region: string;
  start_year: string | number;
  impact: string | number;
  added: string;
  published: string;
  country: string;
  relevance: number;
  pestle: string;
  source: string;
  title: string;
  likelihood: number;
};

const chartConfig = {
  intensity: {
    label: "Intensity",
    color: "hsl(var(--chart-1))",
  },
  relevance: {
    label: "Relevance", 
    color: "hsl(var(--chart-2))",
  },
  likelihood: {
    label: "Likelihood",
    color: "hsl(var(--chart-3))",
  },
  impact: {
    label: "Impact",
    color: "hsl(var(--chart-4))",
  },
};

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

const Index = () => {
  const [rawData, setRawData] = useState<RawDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedEndYear, setSelectedEndYear] = useState("all");


  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((json) => {
        setRawData(json);
        setLoading(false);
      });
  }, []);

  // Process data for visualizations
  const processedData = useMemo(() => {
    let filtered = rawData;

    if (selectedRegion !== "all") {
      filtered = filtered.filter(item => item.region === selectedRegion);
    }

    if (selectedSector !== "all") {
      filtered = filtered.filter(item => item.sector === selectedSector);
    }
    if (selectedEndYear !== "all") {
      filtered = filtered.filter(item => String(item.end_year) === selectedEndYear);
   }


    // Sector analysis
    const sectorData = filtered.reduce((acc, item) => {
  const sector = item.sector || "Unknown";
  const intensity = Number(item.intensity) || 0; // 🔧 Fix: Parse as number

  if (!acc[sector]) {
    acc[sector] = { sector, count: 0, avgIntensity: 0, totalIntensity: 0 };
  }

  acc[sector].count += 1;
  acc[sector].totalIntensity += intensity; // ✅ Use parsed number
  acc[sector].avgIntensity = acc[sector].count
    ? acc[sector].totalIntensity / acc[sector].count
    : 0;

  return acc;
}, {} as Record<string, any>);


    // Topic analysis  
    const topicData = filtered.reduce((acc, item) => {
      const topic = item.topic || "Unknown";
      if (!acc[topic]) {
        acc[topic] = { topic, count: 0, value: 0 };
      }
      acc[topic].count += 1;
      acc[topic].value += 1;
      return acc;
    }, {} as Record<string, any>);

    // Region analysis
    const regionData = filtered.reduce((acc, item) => {
  const region = item.region || "Unknown";
  const intensity = Number(item.intensity) || 0; // ✅ parse to number

  if (!acc[region]) {
    acc[region] = { region, count: 0, avgIntensity: 0, totalIntensity: 0 };
  }

  acc[region].count += 1;
  acc[region].totalIntensity += intensity;
  acc[region].avgIntensity = acc[region].count
    ? acc[region].totalIntensity / acc[region].count
    : 0;

  return acc;
}, {} as Record<string, any>);

    // PESTLE analysis
    // 👇 PESTLE Analysis block
// ✅ PESTLE Analysis block (fixed version)

// Source analysis
const sourceData = filtered.reduce((acc, item) => {
  const source = item.source?.trim() || "Unknown";
  const intensity = Number(item.intensity) || 0;

  if (!acc[source]) {
    acc[source] = { source, count: 0, totalIntensity: 0, avgIntensity: 0 };
  }

  acc[source].count += 1;
  acc[source].totalIntensity += intensity;
  acc[source].avgIntensity = acc[source].totalIntensity / acc[source].count;

  return acc;
}, {} as Record<string, any>);





    // Scatter plot data
    const scatterData = filtered.map(item => ({
      relevance: item.relevance,
      likelihood: item.likelihood,
      intensity: item.intensity,
      sector: item.sector,
      country: item.country
    }));

    return {
  sectors: Object.values(sectorData),
  topics: Object.values(topicData).slice(0, 8),
  regions: Object.values(regionData),
  scatter: scatterData,
  sources: Object.values(sourceData).sort((a, b) => b.count - a.count).slice(0, 10),
  total: filtered.length
};

  }, [rawData, selectedRegion, selectedSector]);

  const uniqueRegions = [...new Set(rawData.map(item => item.region).filter(Boolean))];
  const uniqueSectors = [...new Set(rawData.map(item => item.sector).filter(Boolean))];
  const uniqueEndYears = [...new Set(rawData.map(item => item.end_year).filter(Boolean))].sort();


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg">Loading data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Energy Insights Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">Interactive data visualization and analytics</p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {processedData.total} Records
            </Badge>
          </div>
          
          {/* Filters */}
          <div className="flex gap-4 mt-6">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {uniqueRegions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {uniqueSectors.map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
 
  <Select value={selectedEndYear} onValueChange={setSelectedEndYear}>
    <SelectTrigger className="w-48">
      <SelectValue placeholder="Select End Year" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Years - Year End</SelectItem>
      {uniqueEndYears.map(year => (
        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
      ))}
    </SelectContent>
  </Select>


          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sectors">Sectors</TabsTrigger>
            <TabsTrigger value="regions">Regions</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            
            <TabsTrigger value="sources">Sources</TabsTrigger>

          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Total Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">{processedData.total}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Avg Intensity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {(rawData.reduce((sum, item) => sum + item.intensity, 0) / rawData.length).toFixed(1)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">Sectors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">{processedData.sectors.length}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">Regions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">{processedData.regions.length}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Topics Distribution</CardTitle>
                  <CardDescription>Most discussed topics in the dataset</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={processedData.topics}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ topic }) => topic}
                        >
                          {processedData.topics.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relevance vs Likelihood</CardTitle>
                  <CardDescription>Correlation between relevance and likelihood scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={processedData.scatter}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="relevance" name="Relevance" />
                        <YAxis dataKey="likelihood" name="Likelihood" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Scatter name="Records" dataKey="likelihood" fill="hsl(var(--chart-1))" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sectors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sector Analysis</CardTitle>
                <CardDescription>Average intensity and record count by sector</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedData.sectors}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sector" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="avgIntensity" fill="hsl(var(--chart-1))" name="Avg Intensity" />
                      <Bar dataKey="count" fill="hsl(var(--chart-2))" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regional Distribution</CardTitle>
                <CardDescription>Data distribution across different regions</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={processedData.regions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="avgIntensity" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sources" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>Source Analysis</CardTitle>
      <CardDescription>Top sources by average intensity</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer config={chartConfig} className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData.sources}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="source" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="avgIntensity" fill="hsl(var(--chart-1))" name="Avg Intensity" />
            <Bar dataKey="count" fill="hsl(var(--chart-2))" name="Count" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </CardContent>
  </Card>
</TabsContent>


          

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rawData
  .filter(
    (item) =>
      item.title &&
      item.intensity &&
      item.relevance &&
      item.likelihood &&
      item.source &&
      item.sector &&
      item.region
  )
  .slice(0, 12)
  .map((item, index) => (

                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{item.sector || "General"}</Badge>
                      <Badge variant="secondary">{item.region || "Global"}</Badge>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Intensity:</span>
                        <div className="font-semibold text-lg">{item.intensity}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Relevance:</span>
                        <div className="font-semibold text-lg">{item.relevance}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Likelihood:</span>
                        <div className="font-semibold text-lg">{item.likelihood}</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-muted-foreground text-xs">Source: {item.source}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;