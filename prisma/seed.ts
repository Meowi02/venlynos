import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.auditEvent.deleteMany();
  await prisma.call.deleteMany();
  await prisma.job.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.number.deleteMany();
  await prisma.agentConfig.deleteMany();
  await prisma.sOP.deleteMany();
  await prisma.workspaceUser.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  // Create user and workspace
  console.log('👤 Creating user and workspace...');
  const user = await prisma.user.create({
    data: {
      id: 'user_dev_123',
      email: 'demo@venlyn.com',
      name: 'Demo User',
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      id: 'workspace_dev_123',
      name: 'Main Workspace',
      timezone: 'America/New_York',
    },
  });

  await prisma.workspaceUser.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      role: 'owner',
    },
  });

  // Create contacts
  console.log('📞 Creating contacts...');
  const contacts = [];
  const names = [
    'John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Brown', 'David Wilson',
    'Lisa Miller', 'Chris Taylor', 'Amanda Anderson', 'Ryan Thompson', 'Jessica White',
    'Kevin Martinez', 'Michelle Garcia', 'Daniel Rodriguez', 'Ashley Lewis', 'Tyler Clark',
    'Jennifer Hall', 'Brandon Young', 'Rachel King', 'Jason Wright', 'Stephanie Lopez',
    'Eric Hill', 'Nicole Scott', 'Adam Green', 'Heather Adams', 'Justin Baker',
    'Samantha Gonzalez', 'Andrew Nelson', 'Kimberly Carter', 'Matthew Mitchell', 'Laura Perez',
  ];

  for (let i = 0; i < 50; i++) {
    const name = names[i] || `Customer ${i + 1}`;
    const phone = `+1555${String(i).padStart(3, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    const contact = await prisma.contact.create({
      data: {
        workspaceId: workspace.id,
        name,
        phones: [phone],
        email: i % 3 === 0 ? `${name.toLowerCase().replace(' ', '.')}@example.com` : undefined,
        address: i % 2 === 0 ? {
          street: `${100 + i} ${['Main St', 'Oak Ave', 'Pine Rd', 'First St', 'Second Ave'][i % 5]}`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5],
          state: ['NY', 'CA', 'IL', 'TX', 'AZ'][i % 5],
          zip: String(10000 + i),
        } : undefined,
        notes: i % 4 === 0 ? 'Regular customer, prefers morning appointments' : undefined,
        lastSeenAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
    contacts.push(contact);
  }

  // Create numbers
  console.log('📱 Creating numbers...');
  const numbers = [];
  const numberConfigs = [
    { e164: '+15551234567', label: 'Main Line' },
    { e164: '+15559876543', label: 'Emergency Line' },
    { e164: '+15555551234', label: 'Sales Line' },
  ];

  for (const config of numberConfigs) {
    const number = await prisma.number.create({
      data: {
        workspaceId: workspace.id,
        e164: config.e164,
        label: config.label,
        status: 'active',
        routingMode: 'ai',
        hours: {
          monday: { open: '08:00', close: '17:00' },
          tuesday: { open: '08:00', close: '17:00' },
          wednesday: { open: '08:00', close: '17:00' },
          thursday: { open: '08:00', close: '17:00' },
          friday: { open: '08:00', close: '17:00' },
          saturday: { open: '09:00', close: '15:00' },
          sunday: { closed: true },
        },
        afterHours: 'vm',
        recordingOptIn: true,
        minuteBudgetCap: 1000,
        a2pBrandStatus: 'verified',
        a2pCampaignStatus: 'active',
      },
    });
    numbers.push(number);
  }

  // Create calls
  console.log('📞 Creating calls...');
  const intents = ['emergency', 'routine', 'quote', 'faq', 'billing', 'spam'];
  const dispositions = ['answered', 'missed', 'booked', 'spam', 'callback'];
  const agentTypes = ['ai', 'human'];

  const calls = [];
  for (let i = 0; i < 200; i++) {
    const contact = contacts[Math.floor(Math.random() * contacts.length)];
    const number = numbers[Math.floor(Math.random() * numbers.length)];
    const startDate = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000);
    const duration = Math.floor(Math.random() * 1200) + 30; // 30 seconds to 20 minutes
    const endDate = new Date(startDate.getTime() + duration * 1000);

    const intent = intents[Math.floor(Math.random() * intents.length)] as any;
    const disposition = dispositions[Math.floor(Math.random() * dispositions.length)] as any;
    const agentType = agentTypes[Math.floor(Math.random() * agentTypes.length)] as any;
    
    const isSpam = disposition === 'spam' || intent === 'spam';
    const isEmergency = intent === 'emergency';
    
    const call = await prisma.call.create({
      data: {
        workspaceId: workspace.id,
        startedAt: startDate,
        endedAt: endDate,
        durationSec: duration,
        direction: Math.random() > 0.3 ? 'in' : 'out',
        fromE164: contact.phones[0],
        toE164: number.e164,
        contactId: contact.id,
        agentType,
        intent,
        disposition,
        valueEstCents: !isSpam ? Math.floor(Math.random() * 150000) + 5000 : undefined, // $50-$1500
        emergencyScore: isEmergency ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 40),
        spamScore: isSpam ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 30),
        recordingUrl: Math.random() > 0.3 ? `https://example.com/recordings/${i}.mp3` : undefined,
        transcriptUrl: Math.random() > 0.4 ? `https://example.com/transcripts/${i}.json` : undefined,
        transcript: Math.random() > 0.4 ? {
          segments: [
            {
              id: '1',
              speaker: 'customer',
              text: 'Hi, I need help with my heating system.',
              timestamp: 0,
              confidence: 0.95,
            },
            {
              id: '2',
              speaker: 'agent',
              text: 'I can help you with that. What seems to be the problem?',
              timestamp: 3,
              confidence: 0.98,
            },
            {
              id: '3',
              speaker: 'customer',
              text: 'It stopped working this morning and it is getting cold.',
              timestamp: 8,
              confidence: 0.92,
            },
          ],
          metadata: {
            notes: i % 5 === 0 ? 'Customer was very polite and patient' : undefined,
            tags: i % 3 === 0 ? ['follow-up', 'urgent'] : undefined,
          },
        } : undefined,
        escalationStatus: isEmergency && Math.random() > 0.5 ? 'queued' : 'none',
      },
    });
    calls.push(call);
  }

  // Create jobs
  console.log('📅 Creating jobs...');
  const jobStatuses = ['new', 'scheduled', 'en_route', 'on_site', 'done', 'cancelled'];
  const serviceTypes = [
    'HVAC Repair', 'Plumbing Installation', 'Electrical Work', 'Appliance Repair',
    'Water Heater Service', 'AC Maintenance', 'Furnace Repair', 'Pipe Repair',
    'Outlet Installation', 'Thermostat Replacement', 'Drain Cleaning', 'Leak Detection',
  ];
  const technicians = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'];

  for (let i = 0; i < 50; i++) {
    const contact = contacts[Math.floor(Math.random() * contacts.length)];
    const sourceCall = i < 20 ? calls[Math.floor(Math.random() * calls.length)] : undefined;
    const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
    const status = jobStatuses[Math.floor(Math.random() * jobStatuses.length)] as any;
    
    // Generate slot times (some in past, some in future)
    const isScheduled = status !== 'new';
    const slotStart = isScheduled ? new Date(Date.now() + (Math.random() - 0.5) * 14 * 24 * 60 * 60 * 1000) : undefined;
    const slotEnd = slotStart ? new Date(slotStart.getTime() + (1 + Math.random() * 3) * 60 * 60 * 1000) : undefined;

    const estimateCents = Math.floor(Math.random() * 200000) + 10000; // $100-$2000
    const finalCents = status === 'done' && Math.random() > 0.5 ? 
      estimateCents + Math.floor((Math.random() - 0.5) * 50000) : undefined;

    await prisma.job.create({
      data: {
        workspaceId: workspace.id,
        title: `${serviceType} for ${contact.name}`,
        status,
        slotStart,
        slotEnd,
        address: contact.address,
        contactId: contact.id,
        sourceCallId: sourceCall?.id,
        assignedTo: isScheduled && Math.random() > 0.3 ? 
          technicians[Math.floor(Math.random() * technicians.length)] : undefined,
        estimateCents,
        finalCents,
        checklist: isScheduled ? [
          { id: '1', text: 'Arrive on site', completed: status !== 'scheduled' },
          { id: '2', text: 'Assess problem', completed: status === 'done' || status === 'on_site' },
          { id: '3', text: 'Complete repairs', completed: status === 'done' },
          { id: '4', text: 'Test functionality', completed: status === 'done' },
          { id: '5', text: 'Clean up', completed: status === 'done' },
        ] : undefined,
        photos: status === 'done' && Math.random() > 0.7 ? [
          { id: '1', url: `https://example.com/photos/before-${i}.jpg`, type: 'before' },
          { id: '2', url: `https://example.com/photos/after-${i}.jpg`, type: 'after' },
        ] : undefined,
      },
    });
  }

  // Link some calls to jobs
  console.log('🔗 Linking calls to jobs...');
  const bookedCalls = calls.filter(call => call.disposition === 'booked').slice(0, 15);
  const jobs = await prisma.job.findMany({
    where: { workspaceId: workspace.id, sourceCallId: null },
    take: 15,
  });

  for (let i = 0; i < Math.min(bookedCalls.length, jobs.length); i++) {
    await prisma.call.update({
      where: { id: bookedCalls[i].id },
      data: { jobId: jobs[i].id },
    });
  }

  // Create agent config
  console.log('🤖 Creating agent config...');
  await prisma.agentConfig.create({
    data: {
      workspaceId: workspace.id,
      name: 'Default AI Agent',
      version: 1,
      isActive: true,
      runtime: {
        provider: 'retell',
        voice: 'sarah',
        model: 'gpt-4',
        temperature: 0.7,
      },
      tools: {
        calendar: { enabled: true },
        crm: { enabled: true },
        payment: { enabled: false },
      },
      prompts: {
        system: 'You are a helpful customer service representative for a home services company.',
        greeting: 'Hello! Thank you for calling. How can I help you today?',
        booking: 'I can help you schedule a service appointment. What type of service do you need?',
      },
      policies: {
        escalation: {
          emergency_threshold: 80,
          human_handoff: true,
        },
        scheduling: {
          advance_notice: 24,
          max_slots_per_day: 8,
        },
      },
      escalation: {
        emergency_phone: '+15555551111',
        manager_phone: '+15555552222',
        email: 'manager@venlyn.com',
      },
      bookingRules: {
        business_hours: {
          start: '08:00',
          end: '17:00',
          timezone: 'America/New_York',
        },
        buffer_minutes: 15,
        max_duration_hours: 4,
      },
    },
  });

  // Create SOPs
  console.log('📋 Creating SOPs...');
  await prisma.sOP.create({
    data: {
      workspaceId: workspace.id,
      title: 'Emergency Response Protocol',
      content: `# Emergency Response Protocol

## Immediate Actions
1. Assess severity level (1-10)
2. If level 8+, escalate to human agent
3. Collect contact information
4. Schedule emergency slot within 2 hours

## Documentation
- Record emergency score
- Note customer concerns
- Update contact preferences

## Follow-up
- Send confirmation SMS
- Call 30 minutes before arrival
- Follow up within 24 hours`,
      version: 1,
      isPublished: true,
      agentConfigs: ['default'],
    },
  });

  await prisma.sOP.create({
    data: {
      workspaceId: workspace.id,
      title: 'Standard Booking Process',
      content: `# Standard Booking Process

## Initial Contact
1. Greet customer warmly
2. Gather contact information
3. Understand the service need

## Scheduling
1. Check technician availability
2. Offer 2-3 time slots
3. Confirm appointment details
4. Collect service address

## Confirmation
1. Send SMS confirmation
2. Add to calendar
3. Set follow-up reminders`,
      version: 2,
      isPublished: true,
      agentConfigs: ['default'],
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log(`Created:
  - 1 user and workspace
  - 50 contacts
  - 3 phone numbers
  - 200 calls
  - 50 jobs
  - 1 agent configuration
  - 2 SOPs`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });