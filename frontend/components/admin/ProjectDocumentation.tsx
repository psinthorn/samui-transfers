'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Code, 
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Globe,
  Mail
} from 'lucide-react'

interface ProjectStatus {
  version: string
  environment: string
  status: 'Production Ready' | 'Development' | 'Maintenance'
  database: {
    totalBookings: number
    totalUsers: number
    pendingBookings: number
    confirmedBookings: number
  }
  services: {
    openai: boolean
    email: boolean
    googleMaps: boolean
    auth: boolean
  }
}

const ProjectDocumentation = () => {
  const [activeSection, setActiveSection] = useState('overview')
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjectStatus()
  }, [])

  const fetchProjectStatus = async () => {
    try {
      const response = await fetch('/api/admin/project-status')
      if (response.ok) {
        const data = await response.json()
        setProjectStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch project status:', error)
    } finally {
      setLoading(false)
    }
  }

  const technicalStack = {
    frontend: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS', 'Shadcn/ui'],
    backend: ['Next.js API Routes', 'Prisma ORM', 'PostgreSQL (Neon)', 'NextAuth.js'],
    deployment: ['Vercel (Frontend)', 'Neon (Database)', 'Webhostbox (Email)'],
    integrations: ['OpenAI GPT-4', 'Google Maps API', 'Nodemailer', 'WhatsApp Business']
  }

  const features = [
    { name: 'Booking System', status: 'Complete', description: 'Full booking flow with AI chat support' },
    { name: 'Admin Dashboard', status: 'Complete', description: 'Booking management, user management, analytics' },
    { name: 'Authentication', status: 'Complete', description: 'NextAuth with Google/GitHub OAuth' },
    { name: 'Email System', status: 'Complete', description: 'Booking confirmations, status updates, vouchers' },
    { name: 'AI Agent', status: 'Complete', description: 'Multilingual chat assistant with context awareness' },
    { name: 'Payment Integration', status: 'Configured', description: 'Stripe payment processing (keys configured)' },
    { name: 'Mobile App', status: 'Planned', description: 'React Native app (URL configured)' }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Complete': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Configured': return <Clock className="h-4 w-4 text-blue-600" />
      case 'Planned': return <AlertCircle className="h-4 w-4 text-gray-400" />
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Loading Project Documentation...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Samui Transfers Project Documentation
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="default">{projectStatus?.status || 'Production Ready'}</Badge>
            <Badge variant="outline">v{projectStatus?.version || '1.0.0'}</Badge>
            <Badge variant="secondary">{projectStatus?.environment || 'production'}</Badge>
          </div>
        </CardHeader>
      </Card>

      {projectStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{projectStatus.database.totalUsers}</p>
                  <p className="text-xs text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{projectStatus.database.totalBookings}</p>
                  <p className="text-xs text-muted-foreground">Total Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{projectStatus.database.pendingBookings}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{projectStatus.database.confirmedBookings}</p>
                  <p className="text-xs text-muted-foreground">Confirmed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  Samui Transfers is a comprehensive booking platform for transportation services in Koh Samui, Thailand. 
                  Features AI-powered chat assistance, automated booking management, and multi-language support.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Key Capabilities</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Real-time booking with AI chat support</li>
                  <li>• Automated email confirmations and vouchers</li>
                  <li>• Admin dashboard with analytics</li>
                  <li>• Multi-language support (EN/TH)</li>
                  <li>• Integration with Google Maps, WhatsApp, Email</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(technicalStack).map(([category, items]) => (
                <div key={category}>
                  <h4 className="font-semibold capitalize mb-2">{category}</h4>
                  <div className="flex flex-wrap gap-1">
                    {items.map((item) => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {projectStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">OpenAI</span>
                    <Badge variant={projectStatus.services.openai ? 'default' : 'destructive'}>
                      {projectStatus.services.openai ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Email</span>
                    <Badge variant={projectStatus.services.email ? 'default' : 'destructive'}>
                      {projectStatus.services.email ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Google Maps</span>
                    <Badge variant={projectStatus.services.googleMaps ? 'default' : 'destructive'}>
                      {projectStatus.services.googleMaps ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Authentication</span>
                    <Badge variant={projectStatus.services.auth ? 'default' : 'destructive'}>
                      {projectStatus.services.auth ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(feature.status)}
                        <span className="font-medium">{feature.name}</span>
                      </div>
                      <Badge 
                        variant={feature.status === 'Complete' ? 'default' : 'outline'}
                        className={feature.status === 'Complete' ? 'bg-green-600' : ''}
                      >
                        {feature.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">{feature.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.samui-transfers.com" target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Live Site
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/admin/bookings">
                    <Calendar className="h-4 w-4 mr-2" />
                    Manage Bookings
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/admin/users">
                    <Users className="h-4 w-4 mr-2" />
                    User Management
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="mailto:support@samui-transfers.com">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </a>
                </Button>
              </div>

              <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-semibold mb-2">Documentation Files</h4>
                <div className="space-y-2 text-sm">
                  <div>📋 <code>PROJECT_OVERVIEW.md</code> - Complete project overview and strategic roadmap</div>
                  <div>🔧 <code>TECHNICAL_DOCUMENTATION.md</code> - Architecture, security, and implementation details</div>
                  <div>🛣️ <code>DEVELOPMENT_ROADMAP.md</code> - Detailed development phases and timelines</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProjectDocumentation