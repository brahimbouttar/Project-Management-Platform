import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('demo123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      username: 'admin',
      displayName: 'Admin User',
      password: hashedPassword,
      role: 'admin',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@demo.com' },
    update: {},
    create: {
      email: 'user@demo.com',
      username: 'johndoe',
      displayName: 'John Doe',
      password: hashedPassword,
      role: 'member',
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      description: 'The official workspace for Acme Corporation',
      icon: '🏢',
      members: {
        create: [
          { userId: admin.id, role: 'owner' },
          { userId: user.id, role: 'member' },
        ],
      },
    },
  });

  const project1 = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design',
      color: '#6366f1',
      icon: '🌐',
      members: {
        create: [
          { userId: admin.id, role: 'owner' },
          { userId: user.id, role: 'member' },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: 'Mobile App',
      description: 'React Native mobile application for iOS and Android',
      color: '#ec4899',
      icon: '📱',
      members: {
        create: [
          { userId: admin.id, role: 'owner' },
          { userId: user.id, role: 'member' },
        ],
      },
    },
  });

  for (const project of [project1, project2]) {
    const board = await prisma.board.create({
      data: {
        projectId: project.id,
        name: 'Kanban Board',
        columns: {
          create: [
            { name: 'Backlog', order: 0, color: '#d1d5db' },
            { name: 'To Do', order: 1, color: '#e5e7eb' },
            { name: 'In Progress', order: 2, color: '#93c5fd' },
            { name: 'In Review', order: 3, color: '#fde68a' },
            { name: 'Done', order: 4, color: '#86efac' },
          ],
        },
      },
      include: { columns: true },
    });

    const tasks = [
      { title: 'Set up project repository', priority: 'high', column: 0, assignee: admin.id },
      { title: 'Design system architecture', priority: 'urgent', column: 1, assignee: user.id },
      { title: 'Create component library', priority: 'medium', column: 0, assignee: admin.id },
      { title: 'Implement authentication', priority: 'high', column: 2, assignee: user.id },
      { title: 'Write API documentation', priority: 'low', column: 3, assignee: admin.id },
      { title: 'Setup CI/CD pipeline', priority: 'medium', column: 1, assignee: user.id },
      { title: 'Performance optimization', priority: 'high', column: 0, assignee: admin.id },
      { title: 'User acceptance testing', priority: 'urgent', column: 2, assignee: user.id },
    ];

    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      await prisma.task.create({
        data: {
          projectId: project.id,
          columnId: board.columns[t.column].id,
          title: t.title,
          description: `Description for: ${t.title}`,
          status: ['backlog', 'todo', 'in_progress', 'in_review', 'done'][t.column],
          priority: t.priority,
          order: i,
          assigneeId: t.assignee,
          creatorId: admin.id,
          labels: [project.id === project1.id ? 'frontend' : 'mobile', 'feature'],
        },
      });
    }
  }

  const generalChannel = await prisma.channel.create({
    data: {
      workspaceId: workspace.id,
      name: 'general',
      description: 'General discussions',
    },
  });

  const devChannel = await prisma.channel.create({
    data: {
      workspaceId: workspace.id,
      name: 'development',
      description: 'Development discussions and code reviews',
    },
  });

  const generalMessages = [
    'Welcome to Acme Corp! 🎉',
    'Hello everyone! Excited to be here.',
    'Don\'t forget about the standup meeting at 10am.',
    'The new design mockups are looking great!',
    'Great work on the last sprint everyone!',
  ];

  for (const content of generalMessages) {
    await prisma.message.create({
      data: {
        channelId: generalChannel.id,
        userId: Math.random() > 0.5 ? admin.id : user.id,
        content,
      },
    });
  }

  const devMessages = [
    'Just pushed the new API changes to dev branch.',
    'Can someone review my PR for the auth module?',
    'The database migration is ready for testing.',
    'We need to update the TypeScript interfaces.',
    'Found a bug in the websocket connection - fixed it.',
  ];

  for (const content of devMessages) {
    await prisma.message.create({
      data: {
        channelId: devChannel.id,
        userId: Math.random() > 0.5 ? admin.id : user.id,
        content,
      },
    });
  }

  for (const project of [project1, project2]) {
    await prisma.page.create({
      data: {
        projectId: project.id,
        authorId: admin.id,
        title: 'Project Overview',
        content: JSON.stringify({
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: `Welcome to the ${project.name} project. This document covers the high-level architecture and goals.` }] },
          ],
        }),
        emoji: '📋',
      },
    });

    await prisma.page.create({
      data: {
        projectId: project.id,
        authorId: user.id,
        title: 'Technical Architecture',
        content: JSON.stringify({
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Technical architecture decisions and system design documentation.' }] },
          ],
        }),
        emoji: '🏗️',
      },
    });

    await prisma.page.create({
      data: {
        projectId: project.id,
        authorId: admin.id,
        title: 'Sprint Planning Notes',
        content: JSON.stringify({
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Sprint goals, task assignments, and progress tracking.' }] },
          ],
        }),
        emoji: '🎯',
      },
    });
  }

  console.log('Seed data created successfully!');
  console.log('Demo accounts:');
  console.log('  admin@demo.com / demo123');
  console.log('  user@demo.com / demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
