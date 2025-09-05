import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Zap, Target, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function HomePage() {
  const features = [
    {
      icon: Target,
      title: 'Advanced AI Analysis',
      description: 'State-of-the-art computer vision and AI models for precise geolocation analysis.'
    },
    {
      icon: Zap,
      title: 'Multiple Analysis Modes',
      description: 'Choose from quick, detailed, or expert analysis modes based on your needs.'
    },
    {
      icon: BarChart3,
      title: 'Comprehensive Insights',
      description: 'Get detailed reasoning, confidence scores, and visual clue breakdowns.'
    },
    {
      icon: MapPin,
      title: 'Global Coverage',
      description: 'Analyze images from anywhere in the world with high accuracy.'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            AI-Powered Image
            <span className="text-primary"> Geolocation</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Upload any image and discover its location using advanced AI analysis. 
            Get detailed insights, confidence scores, and comprehensive reasoning for every analysis.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg px-8">
            <Link to="/analyze">
              Start Analyzing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="text-lg px-8">
            <Link to="/stats">View Demo</Link>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How It Works */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="text-muted-foreground mt-2">
            Our AI analyzes multiple visual indicators to determine location
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-primary font-bold text-xl">1</span>
            </div>
            <h3 className="text-xl font-semibold">Upload Image</h3>
            <p className="text-muted-foreground">
              Upload any image or provide a URL. Supports all common image formats.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-primary font-bold text-xl">2</span>
            </div>
            <h3 className="text-xl font-semibold">AI Analysis</h3>
            <p className="text-muted-foreground">
              Our AI examines architecture, signage, vegetation, and cultural indicators.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-primary font-bold text-xl">3</span>
            </div>
            <h3 className="text-xl font-semibold">Get Results</h3>
            <p className="text-muted-foreground">
              Receive detailed location analysis with confidence scores and reasoning.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted/50 rounded-2xl p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Experience the power of AI-driven geolocation analysis. 
          Upload your first image and see what our advanced algorithms can discover.
        </p>
        <Button asChild size="lg" className="text-lg px-8">
          <Link to="/analyze">
            Analyze Your First Image
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
