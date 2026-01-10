import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Github,
  Linkedin,
  Mail,
  Globe,
  Users,
  Code2,
  Database,
  Brain,
  Target,
  Award,
  Calendar,
  MapPin,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const team = [
    {
      name: "Pradyum Mistry",
      role: "Full-Stack Developer & ML Engineer",
      expertise: "Full-Stack, ML, Time Series Analysis",
      bio: "Led full-stack development, ML implementation, time series analysis, and temporal pattern recognition for the UIDAI analytics platform.",
      github: "https://github.com/altf4-games",
    },
    {
      name: "Raunak Gupta",
      role: "ML Specialist",
      expertise: "Anomaly Detection, Machine Learning",
      bio: "Specialized in developing and implementing anomaly detection algorithms and machine learning model development for data insights.",
      github: "https://github.com/Raunakg2005",
    },
    {
      name: "Smita Sarangi",
      role: "Data Scientist",
      expertise: "K-means Clustering, Demographics",
      bio: "Focused on K-means clustering analysis and demographic pattern recognition to extract meaningful insights from population data.",
      github: "https://github.com/Smita1006",
    },
  ];

  const technologies = [
    { name: "Next.js 14", category: "Frontend", icon: Code2 },
    { name: "FastAPI", category: "Backend", icon: Database },
    { name: "TypeScript", category: "Language", icon: Code2 },
    { name: "Python", category: "Backend", icon: Database },
    { name: "Zustand", category: "State Management", icon: Code2 },
    { name: "Tailwind CSS", category: "Styling", icon: Code2 },
    { name: "Shadcn/UI", category: "Components", icon: Code2 },
    { name: "Scikit-learn", category: "ML Framework", icon: Brain },
    { name: "Recharts", category: "Visualization", icon: Brain },
    { name: "Pandas", category: "Data Processing", icon: Database },
    { name: "React Leaflet", category: "Maps", icon: Globe },
    { name: "Chart.js", category: "Charts", icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">UI</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold">UIDAI Analytics</h1>
              </div>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <Badge variant="secondary">About Our Team</Badge>
          </div>

          <div className="ml-auto">
            <Link href="/">
              <Button variant="outline" size="sm">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Project Overview */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-6 w-6" />
                <span>Project Overview</span>
              </CardTitle>
              <CardDescription>
                Advanced analytics dashboard for UIDAI Aadhaar data with ML
                insights and predictive analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <Database className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold">4.3M+ Records</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time data processing
                  </p>
                </div>
                <div className="text-center p-4">
                  <Brain className="h-12 w-12 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold">ML Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Pattern recognition & forecasting
                  </p>
                </div>
                <div className="text-center p-4">
                  <Globe className="h-12 w-12 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold">36 States/UTs</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive geographic coverage
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Project Objectives</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    • Extract meaningful patterns from UIDAI enrollment and
                    update data
                  </li>
                  <li>
                    • Provide real-time analytics for operational decision
                    making
                  </li>
                  <li>
                    • Implement ML models for anomaly detection and forecasting
                  </li>
                  <li>
                    • Enable geographic and demographic insights for policy
                    planning
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <span>Meet Our Team</span>
            </h2>
            <p className="text-muted-foreground">
              Dedicated professionals bringing expertise in data science,
              development, and analytics
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="h-full">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                  <Badge variant="outline" className="text-xs">
                    {member.expertise}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{member.bio}</p>

                  <div className="flex justify-center">
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Code2 className="h-6 w-6" />
              <span>Technology Stack</span>
            </h2>
            <p className="text-muted-foreground">
              Modern, scalable technologies powering our analytics platform
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {technologies.map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-lg border bg-card"
                  >
                    <tech.icon className="h-6 w-6 text-primary" />
                    <div>
                      <div className="font-medium text-sm">{tech.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {tech.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Details */}
        <div className="grid md:grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Key Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm">
                    Interactive Geographic Visualizations
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm">ML-powered Anomaly Detection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span className="text-sm">
                    Predictive Analytics & Forecasting
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <span className="text-sm">Real-time Data Processing</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
              <CardDescription>
                Get in touch with our team for questions or collaboration
                opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Github className="h-5 w-5 text-gray-700" />
                  <div>
                    <div className="font-medium">Project Repository</div>
                    <div className="text-sm text-muted-foreground">
                      Available on individual team member GitHub profiles
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-medium">Project Type</div>
                    <div className="text-sm text-muted-foreground">
                      UIDAI Hackathon Analytics Dashboard
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
