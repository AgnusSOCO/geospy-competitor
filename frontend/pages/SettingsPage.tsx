import React, { useState } from 'react';
import { Settings, Save, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

export function SettingsPage() {
  const [settings, setSettings] = useState({
    defaultAnalysisType: 'detailed',
    autoSaveHistory: true,
    includeConfidenceByDefault: true,
    includeReasoningByDefault: true,
    imageQualityWarning: true,
    maxImageSize: '10',
  });

  const { toast } = useToast();

  const handleSave = () => {
    // In a real app, this would save to a backend or local storage
    localStorage.setItem('geolocate-settings', JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully.",
    });
  };

  const handleReset = () => {
    setSettings({
      defaultAnalysisType: 'detailed',
      autoSaveHistory: true,
      includeConfidenceByDefault: true,
      includeReasoningByDefault: true,
      imageQualityWarning: true,
      maxImageSize: '10',
    });
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Configure your geolocation analysis preferences
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Analysis Defaults */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Defaults</CardTitle>
            <CardDescription>
              Set default options for new analyses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="defaultAnalysisType">Default Analysis Type</Label>
              <Select
                value={settings.defaultAnalysisType}
                onValueChange={(value) =>
                  setSettings({ ...settings, defaultAnalysisType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick - Fast basic analysis</SelectItem>
                  <SelectItem value="detailed">Detailed - Comprehensive analysis</SelectItem>
                  <SelectItem value="expert">Expert - Maximum depth analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Include Confidence Score by Default</Label>
                <p className="text-sm text-muted-foreground">
                  Always show confidence levels in results
                </p>
              </div>
              <Switch
                checked={settings.includeConfidenceByDefault}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, includeConfidenceByDefault: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Include Reasoning Steps by Default</Label>
                <p className="text-sm text-muted-foreground">
                  Always show detailed reasoning process
                </p>
              </div>
              <Switch
                checked={settings.includeReasoningByDefault}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, includeReasoningByDefault: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>
              Control how your data is handled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-save Analysis History</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save analyses to your history
                </p>
              </div>
              <Switch
                checked={settings.autoSaveHistory}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoSaveHistory: checked })
                }
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Privacy Notice</AlertTitle>
              <AlertDescription>
                Images are processed securely and are not permanently stored on our servers. 
                Analysis history is stored locally and can be cleared at any time.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Image Processing */}
        <Card>
          <CardHeader>
            <CardTitle>Image Processing</CardTitle>
            <CardDescription>
              Configure image upload and processing options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="maxImageSize">Maximum Image Size (MB)</Label>
              <Select
                value={settings.maxImageSize}
                onValueChange={(value) =>
                  setSettings({ ...settings, maxImageSize: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 MB</SelectItem>
                  <SelectItem value="10">10 MB</SelectItem>
                  <SelectItem value="20">20 MB</SelectItem>
                  <SelectItem value="50">50 MB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Image Quality Warnings</Label>
                <p className="text-sm text-muted-foreground">
                  Warn when image quality might affect analysis accuracy
                </p>
              </div>
              <Switch
                checked={settings.imageQualityWarning}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, imageQualityWarning: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Advanced settings for API usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>OpenAI API Key Required</AlertTitle>
              <AlertDescription>
                This application requires an OpenAI API key to function. 
                Please configure it in the Infrastructure tab to enable geolocation analysis.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button onClick={handleSave} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
