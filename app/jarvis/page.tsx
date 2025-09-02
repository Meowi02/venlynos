"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Bot,
  Play,
  Settings,
  TestTube,
  Save,
  GitBranch,
  Upload,
  Download,
  Mic,
  MessageSquare,
  Clock,
  Zap,
  Shield,
  Link as LinkIcon,
  Plus,
  Edit,
  History
} from 'lucide-react';

interface AgentConfig {
  id: string;
  name: string;
  model: string;
  voice_id: string;
  temperature: number;
  system_prompt: string;
  tools_enabled: string[];
  safety_rules: string[];
  escalation_rules: EscalationRule[];
  booking_rules: BookingRule[];
  sop_bindings: string[];
  version: number;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

interface EscalationRule {
  id: string;
  trigger: 'keywords' | 'emergency_score' | 'confidence' | 'duration';
  condition: string;
  action: 'sms' | 'transfer' | 'email';
  target: string;
}

interface BookingRule {
  id: string;
  service_type: string;
  time_windows: string[];
  service_areas: string[];
  buffer_minutes: number;
}

interface TestScenario {
  id: string;
  name: string;
  input: string;
  expected_intent?: string;
  expected_actions?: string[];
}

// Mock data
const mockAgentConfig: AgentConfig = {
  id: 'agent1',
  name: 'PlumbCo Assistant v2.1',
  model: 'gpt-4-turbo',
  voice_id: 'sarah-professional',
  temperature: 0.7,
  system_prompt: `You are a professional customer service representative for PlumbCo, a residential plumbing service.

## Your Role
- Answer calls promptly and courteously
- Identify the nature of plumbing issues
- Schedule appropriate service appointments
- Provide accurate pricing information
- Handle emergencies with urgency

## Key Guidelines
- Always get customer name and phone number
- For emergencies, prioritize safety and immediate dispatch
- Use the booking system to schedule appointments
- Escalate complex technical questions to human technicians
- Stay within your knowledge boundaries

## Personality
- Professional but friendly
- Patient and empathetic
- Clear and concise communication
- Solution-oriented approach`,
  tools_enabled: ['calendar', 'maps', 'sms'],
  safety_rules: [
    'Never provide medical advice or diagnose health issues',
    'Defer complex pricing over $500 to human agents',
    'Do not guarantee specific repair times or outcomes',
    'Always disclose call recording if enabled'
  ],
  escalation_rules: [
    {
      id: 'e1',
      trigger: 'keywords',
      condition: 'flood, burst pipe, gas leak, no water',
      action: 'sms',
      target: '+15551234567'
    },
    {
      id: 'e2',
      trigger: 'confidence',
      condition: '<0.6',
      action: 'transfer',
      target: 'human_queue'
    }
  ],
  booking_rules: [
    {
      id: 'b1',
      service_type: 'routine',
      time_windows: ['9AM-12PM', '1PM-5PM'],
      service_areas: ['downtown', 'suburbs'],
      buffer_minutes: 60
    }
  ],
  sop_bindings: ['sop1', 'sop2'],
  version: 3,
  status: 'published',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T10:30:00Z'
};

const testScenarios: TestScenario[] = [
  {
    id: 't1',
    name: 'Emergency - Burst Pipe',
    input: 'Help! I have a burst pipe in my basement and water is everywhere!',
    expected_intent: 'emergency',
    expected_actions: ['schedule_emergency', 'send_sms_confirmation']
  },
  {
    id: 't2', 
    name: 'Routine - Clogged Drain',
    input: 'My kitchen sink is draining slowly. Can someone take a look?',
    expected_intent: 'routine',
    expected_actions: ['schedule_appointment', 'provide_estimate']
  },
  {
    id: 't3',
    name: 'FAQ - Pricing Question',
    input: 'How much do you charge for a service call?',
    expected_intent: 'faq',
    expected_actions: ['provide_pricing']
  }
];

export default function JarvisPage() {
  const [config, setConfig] = useState(mockAgentConfig);
  const [activeTab, setActiveTab] = useState('runtime');
  const [testRunning, setTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [compareMode, setCompareMode] = useState(false);

  const runTestScenario = async (scenario: TestScenario) => {
    setTestRunning(true);
    
    // Simulate test run
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults = {
      scenario: scenario.name,
      intent_detected: scenario.expected_intent,
      confidence: 0.85,
      actions_taken: scenario.expected_actions,
      response_time_ms: 1200,
      tokens_used: 145,
      transcript: `Agent: Hello! Thank you for calling PlumbCo. This is Sarah, how can I help you today?

Customer: ${scenario.input}

Agent: I understand this is urgent. Let me get some information and dispatch a technician right away. Can you please provide your address?`,
      status: 'pass'
    };
    
    setTestResults(mockResults);
    setTestRunning(false);
  };

  const saveConfig = () => {
    // Simulate save
    alert('Agent configuration saved successfully!');
  };

  const publishConfig = () => {
    setConfig({ ...config, status: 'published', version: config.version + 1 });
    alert('Agent configuration published!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Jarvis Agent Studio</h1>
            <p className="text-text-secondary mt-1">
              Configure and test your AI phone agent
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={config.status === 'published' ? 'default' : 'outline'}>
            {config.status} v{config.version}
          </Badge>
          <Button variant="outline" onClick={() => setCompareMode(!compareMode)}>
            <GitBranch className="w-4 h-4 mr-2" />
            A/B Test
          </Button>
          <Button variant="outline" onClick={saveConfig}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={publishConfig}>
            Publish
          </Button>
        </div>
      </div>

      {/* Agent Status Card */}
      <div className="venlyn-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-text-primary">{config.name}</span>
            </div>
            <Badge variant="outline">{config.model}</Badge>
            <Badge variant="outline">{config.voice_id}</Badge>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-secondary">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>1,247 calls handled</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>1.2s avg response</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>94% accuracy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Tabs */}
      <div className="venlyn-card p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200 px-6">
            <TabsList className="bg-transparent">
              <TabsTrigger value="runtime">Runtime</TabsTrigger>
              <TabsTrigger value="prompts">Prompts</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
              <TabsTrigger value="booking">Booking</TabsTrigger>
              <TabsTrigger value="sops">SOPs</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="runtime" className="mt-0 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Model</label>
                  <select 
                    value={config.model}
                    onChange={(e) => setConfig({...config, model: e.target.value})}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  >
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Voice</label>
                  <select 
                    value={config.voice_id}
                    onChange={(e) => setConfig({...config, voice_id: e.target.value})}
                    className="w-full p-2 border border-gray-200 rounded-lg"
                  >
                    <option value="sarah-professional">Sarah (Professional)</option>
                    <option value="mike-friendly">Mike (Friendly)</option>
                    <option value="emma-calm">Emma (Calm)</option>
                    <option value="alex-energetic">Alex (Energetic)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Temperature ({config.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.temperature}
                    onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-text-tertiary mt-1">
                    <span>Conservative</span>
                    <span>Creative</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Latency Profile</label>
                  <select className="w-full p-2 border border-gray-200 rounded-lg">
                    <option>Balanced</option>
                    <option>Low Latency</option>
                    <option>High Quality</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Enabled Tools</label>
                <div className="grid grid-cols-3 gap-3">
                  {['calendar', 'maps', 'payment', 'sms', 'email', 'crm'].map(tool => (
                    <label key={tool} className="flex items-center p-3 border border-gray-200 rounded-lg">
                      <input 
                        type="checkbox" 
                        className="mr-3" 
                        checked={config.tools_enabled.includes(tool)}
                        onChange={(e) => {
                          const tools = e.target.checked
                            ? [...config.tools_enabled, tool]
                            : config.tools_enabled.filter(t => t !== tool);
                          setConfig({...config, tools_enabled: tools});
                        }}
                      />
                      <span className="capitalize text-sm">{tool}</span>
                    </label>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prompts" className="mt-0 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">System Prompt</label>
                <textarea
                  value={config.system_prompt}
                  onChange={(e) => setConfig({...config, system_prompt: e.target.value})}
                  className="w-full h-64 p-4 border border-gray-200 rounded-lg font-mono text-sm resize-none"
                  placeholder="Define your agent's personality and guidelines..."
                />
                <p className="text-sm text-text-secondary mt-1">
                  Tokens: ~{Math.ceil(config.system_prompt.length / 4)}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-3">Few-shot Examples</h3>
                <div className="space-y-4">
                  {[
                    { scenario: 'Call Opening', example: 'Professional greeting with company name and agent identification' },
                    { scenario: 'Booking Request', example: 'Efficient scheduling with time confirmation and SMS' },
                    { scenario: 'Emergency Handling', example: 'Urgent dispatch with safety priority and clear communication' },
                    { scenario: 'Spam Detection', example: 'Polite but firm handling of unwanted calls' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{item.scenario}</h4>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <p className="text-sm text-text-secondary">{item.example}</p>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Example
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="policies" className="mt-0 space-y-6">
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Safety Rules
                </h3>
                <div className="space-y-2">
                  {config.safety_rules.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <Shield className="w-4 h-4 text-red-600 mt-0.5" />
                      <span className="text-sm">{rule}</span>
                    </div>
                  ))}
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Safety Rule
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Escalation Rules</h3>
                <div className="space-y-3">
                  {config.escalation_rules.map((rule, idx) => (
                    <div key={rule.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="capitalize">
                          {rule.trigger}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-sm space-y-1">
                        <div><strong>Condition:</strong> {rule.condition}</div>
                        <div><strong>Action:</strong> {rule.action} → {rule.target}</div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Escalation Rule
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="booking" className="mt-0 space-y-6">
              <div>
                <h3 className="font-medium mb-3">Booking Rules</h3>
                <div className="space-y-4">
                  {config.booking_rules.map((rule, idx) => (
                    <div key={rule.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium capitalize">{rule.service_type} Service</h4>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <strong>Time Windows:</strong>
                          <div className="mt-1">
                            {rule.time_windows.map(window => (
                              <div key={window} className="text-text-secondary">{window}</div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <strong>Service Areas:</strong>
                          <div className="mt-1">
                            {rule.service_areas.map(area => (
                              <div key={area} className="text-text-secondary capitalize">{area}</div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <strong>Buffer:</strong>
                          <div className="text-text-secondary mt-1">{rule.buffer_minutes} minutes</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Calendar Integration</h3>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Google Calendar Connected</span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    plumbco.operations@gmail.com • Last sync: 5 minutes ago
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sops" className="mt-0 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Bound SOPs</h3>
                  <Button variant="outline">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Manage Bindings
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {[
                    { id: 'sop1', name: 'Emergency Call Handling', priority: 1, active: true },
                    { id: 'sop2', name: 'Booking and Scheduling', priority: 2, active: true },
                    { id: 'sop3', name: 'Pricing Guidelines', priority: 3, active: false }
                  ].map((sop, idx) => (
                    <div key={sop.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                          {sop.priority}
                        </div>
                        <div>
                          <div className="font-medium">{sop.name}</div>
                          <div className="text-sm text-text-secondary">Priority {sop.priority}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={sop.active ? 'default' : 'outline'}>
                          {sop.active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="testing" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Scenarios */}
                <div>
                  <h3 className="font-medium mb-4">Test Scenarios</h3>
                  <div className="space-y-3">
                    {testScenarios.map(scenario => (
                      <div key={scenario.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{scenario.name}</h4>
                          <Button
                            size="sm"
                            onClick={() => runTestScenario(scenario)}
                            disabled={testRunning}
                          >
                            {testRunning ? (
                              <div className="animate-spin w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-text-secondary mb-2">{scenario.input}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline">{scenario.expected_intent}</Badge>
                          <span className="text-text-tertiary">
                            {scenario.expected_actions?.length} actions
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Scenario
                  </Button>
                </div>

                {/* Test Results */}
                <div>
                  <h3 className="font-medium mb-4">Test Results</h3>
                  {testResults ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{testResults.scenario}</h4>
                          <Badge className="bg-green-100 text-green-800">PASS</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Intent:</strong> {testResults.intent_detected}
                          </div>
                          <div>
                            <strong>Confidence:</strong> {(testResults.confidence * 100).toFixed(1)}%
                          </div>
                          <div>
                            <strong>Response Time:</strong> {testResults.response_time_ms}ms
                          </div>
                          <div>
                            <strong>Tokens Used:</strong> {testResults.tokens_used}
                          </div>
                        </div>

                        <div className="mt-3">
                          <strong>Actions Taken:</strong>
                          <div className="mt-1">
                            {testResults.actions_taken.map((action: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="mr-2 mb-1">
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <details className="mt-3">
                          <summary className="font-medium cursor-pointer">View Transcript</summary>
                          <pre className="text-xs bg-white p-3 rounded border mt-2 whitespace-pre-wrap">
                            {testResults.transcript}
                          </pre>
                        </details>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-text-secondary border border-gray-200 rounded-lg border-dashed">
                      <TestTube className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      <p>Run a test scenario to see results</p>
                    </div>
                  )}
                </div>
              </div>

              {/* A/B Testing */}
              {compareMode && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium mb-4">A/B Testing</h3>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm mb-3">
                      Compare current configuration (Variant A) with a test variant (Variant B) across scenarios.
                    </p>
                    <div className="flex gap-3">
                      <Button variant="outline">Create Variant B</Button>
                      <Button>Run Comparison</Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}