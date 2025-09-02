import 'server-only';
import { db } from '../db';
import { decodeCursor, createPaginatedResponse } from '@/lib/pagination';
import type { PaginatedResult } from '@/lib/pagination';
import type { Contact } from '@/types/core';

export interface ContactsFilters {
  workspaceId: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

export async function getContacts(filters: ContactsFilters): Promise<PaginatedResult<Contact>> {
  const { workspaceId, search, cursor, limit = 20 } = filters;

  let whereConditions: any = {
    workspaceId,
  };

  // Search filter
  if (search) {
    whereConditions.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phones: { hasSome: [search] } }, // Search in phone array
    ];
  }

  // Cursor pagination
  if (cursor) {
    const decodedCursor = decodeCursor(cursor);
    whereConditions.createdAt = {
      lt: new Date(decodedCursor),
    };
  }

  const contacts = await db.contact.findMany({
    where: whereConditions,
    include: {
      _count: {
        select: {
          calls: true,
          jobs: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
  });

  const hasMore = contacts.length > limit;
  const data = hasMore ? contacts.slice(0, limit) : contacts;

  return createPaginatedResponse(
    data as Contact[],
    limit,
    (item) => item.createdAt
  );
}

export async function getContactById(workspaceId: string, contactId: string): Promise<Contact | null> {
  const contact = await db.contact.findFirst({
    where: {
      id: contactId,
      workspaceId,
    },
    include: {
      calls: {
        orderBy: { startedAt: 'desc' },
        take: 10,
      },
      jobs: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  return contact as Contact | null;
}

export async function createContact(data: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> {
  const contact = await db.contact.create({
    data,
  });

  return contact as Contact;
}

export async function updateContact(
  workspaceId: string, 
  contactId: string, 
  data: Partial<Contact>
): Promise<Contact> {
  const updatedContact = await db.contact.update({
    where: {
      id: contactId,
      workspaceId,
    },
    data,
  });

  return updatedContact as Contact;
}

export async function findOrCreateContact(
  workspaceId: string,
  phone: string,
  additionalData?: Partial<Contact>
): Promise<Contact> {
  // Try to find existing contact by phone
  let contact = await db.contact.findFirst({
    where: {
      workspaceId,
      phones: {
        has: phone,
      },
    },
  });

  if (!contact) {
    // Create new contact
    contact = await db.contact.create({
      data: {
        workspaceId,
        phones: [phone],
        ...additionalData,
      },
    });
  }

  return contact as Contact;
}

export async function searchContacts(workspaceId: string, query: string): Promise<Contact[]> {
  const contacts = await db.contact.findMany({
    where: {
      workspaceId,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phones: { hasSome: [query] } },
      ],
    },
    take: 10,
    orderBy: { lastSeenAt: 'desc' },
  });

  return contacts as Contact[];
}