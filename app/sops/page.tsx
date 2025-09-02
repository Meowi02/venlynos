"use client";

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import DataTable from '@/components/DataTable';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Edit, 
  Eye,
  History,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
  FileText,
  Save,
  X
} from 'lucide-react';

interface SOP {
  id: string;
  title: string;
  category: string;
  content_md: string;
  version: number;
  published: boolean;
  agent_bindings: number; // count of agents using this SOP
  created_at: string;
  updated_at: string;
  author: string;
}

// Mock SOPs data
const mockSOPs: SOP[] = [
  {
    id: 'sop1',
    title: 'Emergency Call Handling',
    category: 'Call Management',
    content_md: `# Emergency Call Handling

## Steps
1. **Immediately acknowledge** the urgency
2. **Gather key information**:
   - Nature of emergency
   - Location
   - Contact information
   - Immediate safety concerns
3. **Dispatch appropriate resources**
4. **Stay on line** until help arrives if needed

## Decision Tree
- Is it life-threatening? → Transfer to 911
- Heating/cooling failure with vulnerable person? → Priority dispatch
- Water leak causing property damage? → Same-day service
- Other emergencies → Schedule within 4 hours

## Variables
- Service area: {{service_area}}
- Emergency contact: {{emergency_contact}}
- Business hours: {{business_hours}}`,
    version: 3,
    published: true,
    agent_bindings: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-10T15:30:00Z',
    author: 'Sarah Johnson'
  },
  {
    id: 'sop2', 
    title: 'Booking and Scheduling',
    category: 'Operations',
    content_md: `# Booking and Scheduling

## Availability Check
1. Check technician schedules
2. Consider travel time between jobs
3. Account for job complexity

## Customer Preferences
- Morning (8AM-12PM)
- Afternoon (12PM-5PM) 
- Evening (5PM-8PM)

## Booking Confirmation
- Send SMS confirmation
- Add to calendar
- Set reminders (T-24h, T-2h)

## Variables
- Owner name: {{owner_name}}
- Service area: {{service_area}}`,
    version: 1,
    published: true,
    agent_bindings: 1,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z',
    author: 'Mike Chen'
  },
  {
    id: 'sop3',
    title: 'Pricing Guidelines', 
    category: 'Sales',
    content_md: `# Pricing Guidelines

## Standard Rates
- Service call: $89
- Hourly rate: $125/hour
- Emergency surcharge: $50

## Q&A Format
**Q: Customer asks about pricing**
**A:** "Our service call fee is $89, which includes the first hour of labor. Additional work is billed at $125 per hour. We'll provide a detailed estimate before beginning any work."

**Q: Can you give me an estimate over the phone?**
**A:** "I can give you a rough estimate based on what you've described, but our technician will provide an accurate quote after diagnosing the issue on-site."`,
    version: 2,
    published: false,
    agent_bindings: 0,
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-12T10:15:00Z',
    author: 'Lisa Wong'
  }
];

const categories = ['All', 'Call Management', 'Operations', 'Sales', 'Technical'];

export default function SOPsPage() {
  const [sops, setSOPs] = useState(mockSOPs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'editor' | 'preview'>('list');
  const [editorContent, setEditorContent] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const filteredSOPs = useMemo(() => {
    return sops.filter(sop => {
      if (selectedCategory !== 'All' && sop.category !== selectedCategory) {
        return false;
      }
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return sop.title.toLowerCase().includes(searchLower) ||
               sop.content_md.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [sops, searchTerm, selectedCategory]);

  const handleSOPClick = (sop: SOP) => {
    setSelectedSOP(sop);
    setEditorContent(sop.content_md);
    setViewMode('preview');
  };

  const handleEdit = () => {
    setViewMode('editor');
  };

  const handleSave = () => {
    if (selectedSOP) {
      const updatedSOPs = sops.map(sop =>
        sop.id === selectedSOP.id
          ? { 
              ...sop, 
              content_md: editorContent, 
              updated_at: new Date().toISOString(),
              version: sop.version + 1 
            }
          : sop
      );
      setSOPs(updatedSOPs);
      setSelectedSOP({ ...selectedSOP, content_md: editorContent });
      setViewMode('preview');
    }
  };

  const togglePublish = (sopId: string) => {
    setSOPs(sops => sops.map(sop =>
      sop.id === sopId ? { ...sop, published: !sop.published } : sop
    ));
  };

  const columns = [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: ({ row }: { row: { original: SOP } }) => (
        <div>
          <div className="font-medium text-text-primary flex items-center gap-2">
            {row.original.title}
            {row.original.published ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            )}
          </div>
          <div className="text-sm text-text-secondary">
            {row.original.category}
          </div>
        </div>
      )
    },
    {
      header: 'Version',
      accessorKey: 'version',
      cell: ({ row }: { row: { original: SOP } }) => (
        <Badge variant="outline" className="text-xs">
          v{row.original.version}
        </Badge>
      )
    },
    {
      header: 'Status',
      accessorKey: 'published',
      cell: ({ row }: { row: { original: SOP } }) => (
        <Badge 
          variant={row.original.published ? "default" : "outline"}
          className="text-xs"
        >
          {row.original.published ? 'Published' : 'Draft'}
        </Badge>
      )
    },
    {
      header: 'Agent Bindings',
      accessorKey: 'agent_bindings',
      cell: ({ row }: { row: { original: SOP } }) => (
        <div className="flex items-center gap-1">
          <LinkIcon className="w-3 h-3 text-text-tertiary" />
          <span className="text-sm">{row.original.agent_bindings}</span>
        </div>
      )
    },
    {
      header: 'Updated',
      accessorKey: 'updated_at',
      cell: ({ row }: { row: { original: SOP } }) => (
        <div>
          <div className="text-sm">
            {new Date(row.original.updated_at).toLocaleDateString()}
          </div>
          <div className="text-xs text-text-secondary">
            by {row.original.author}
          </div>
        </div>
      )
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }: { row: { original: SOP } }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleSOPClick(row.original)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSelectedSOP(row.original);
              setEditorContent(row.original.content_md);
              setViewMode('editor');
            }}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => togglePublish(row.original.id)}
          >
            {row.original.published ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <FileText className="w-4 h-4 text-yellow-500" />
            )}
          </Button>
        </div>
      )
    }
  ];

  if (viewMode === 'editor' && selectedSOP) {
    return (
      <div className="h-full flex flex-col">
        {/* Editor Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <X className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="font-semibold text-text-primary">
                Editing: {selectedSOP.title}
              </h2>
              <p className="text-sm text-text-secondary">
                Version {selectedSOP.version} • {selectedSOP.category}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setViewMode('preview')}>
              Preview
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 p-4">
          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            className="w-full h-full p-4 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your SOP in Markdown..."
          />
        </div>
      </div>
    );
  }

  if (viewMode === 'preview' && selectedSOP) {
    return (
      <div className="h-full flex flex-col">
        {/* Preview Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <X className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="font-semibold text-text-primary flex items-center gap-2">
                {selectedSOP.title}
                {selectedSOP.published ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
              </h2>
              <p className="text-sm text-text-secondary">
                Version {selectedSOP.version} • {selectedSOP.category} • 
                {selectedSOP.agent_bindings} agent binding{selectedSOP.agent_bindings !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant={selectedSOP.published ? "outline" : "default"}
              onClick={() => togglePublish(selectedSOP.id)}
            >
              {selectedSOP.published ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8 prose prose-gray max-w-none">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">
              {selectedSOP.content_md}
            </pre>
          </div>
        </div>

        {/* Test SOP */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-medium mb-3">Test SOP</h3>
            <div className="flex gap-4">
              <Input 
                placeholder="Ask a question to test this SOP..."
                className="flex-1"
              />
              <Button>Ask</Button>
            </div>
            <p className="text-sm text-text-secondary mt-2">
              Test how the AI agent would respond using this SOP
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Standard Operating Procedures</h1>
          <p className="text-text-secondary mt-2">
            Create and manage SOPs for your AI agents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <History className="w-4 h-4 mr-2" />
            Version History
          </Button>
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New SOP
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New SOP</DialogTitle>
                <DialogDescription>
                  Start with a template or create from scratch.
                </DialogDescription>
              </DialogHeader>
              <CreateSOPForm onClose={() => setCreateModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="venlyn-card">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <Input
              placeholder="Search SOPs..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Showing {filteredSOPs.length} of {sops.length} SOPs
        </p>
        
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>{sops.filter(s => s.published).length} Published</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span>{sops.filter(s => !s.published).length} Drafts</span>
          </div>
        </div>
      </div>

      {/* SOPs Table */}
      <div className="venlyn-card p-0">
        <DataTable
          columns={columns}
          data={filteredSOPs}
          onRowClick={handleSOPClick}
        />
      </div>
    </div>
  );
}

function CreateSOPForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Operations');

  const templates = [
    { id: 'emergency', name: 'Emergency Handling', description: 'Handle urgent customer issues' },
    { id: 'booking', name: 'Appointment Booking', description: 'Schedule customer appointments' },
    { id: 'pricing', name: 'Pricing & Quotes', description: 'Provide accurate pricing information' },
    { id: 'blank', name: 'Blank SOP', description: 'Start from scratch' }
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">SOP Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Customer Complaint Resolution"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border border-gray-200 rounded-lg"
        >
          <option>Call Management</option>
          <option>Operations</option>
          <option>Sales</option>
          <option>Technical</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Template</label>
        <div className="grid grid-cols-2 gap-3">
          {templates.map(template => (
            <button
              key={template.id}
              className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-sm">{template.name}</div>
              <div className="text-xs text-text-secondary mt-1">{template.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose} disabled={!title}>
          Create SOP
        </Button>
      </div>
    </div>
  );
}