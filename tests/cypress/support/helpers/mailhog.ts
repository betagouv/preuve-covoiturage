import axios from 'axios';

export interface Email {
  ID: string;
  From: {
    Relays: string | null;
    Mailbox: string;
    Domain: string;
    Params: string;
  };
  To: Array<{
    Relays: string | null;
    Mailbox: string;
    Domain: string;
    Params: string;
  }>;
  Content: {
    Headers: any;
    Body: string;
  };
  Created: string;
  Raw: {
    From: string;
    To: string[];
    Data: string;
  };
}

interface HttpResponse {
  count: number;
  start: number;
  total: number;
  items: Email[];
}

const http = axios.create({ baseURL: Cypress.env('MAILHOG_URL') ?? 'http://localhost:8025/api' });

// get an email by its MailHog ID
export async function mailGet(id?: string): Promise<Email> {
  return replay<Email>(get, id);
}

// search for an email that contains some text
export async function mailContains(query: string, email?: string): Promise<Email[]> {
  return replay<Email[]>(contains, query, email);
}

// check received emails
export async function mailInbox(to: string): Promise<Email[]> {
  return replay<Email[]>(mybox, 'to', to, false);
}

// make sure the inbox is empty
export async function mailEmptyInbox(to: string): Promise<Email[]> {
  return replay<Email[]>(mybox, 'to', to, true);
}

// check sent emails
export async function mailOutbox(from: string): Promise<Email[]> {
  return replay<Email[]>(mybox, 'from', from, false);
}

// make sure the outbox is empty
export async function mailEmptyOutbox(from: string): Promise<Email[]> {
  return replay<Email[]>(mybox, 'from', from, true);
}

// delete a message by id or all messages
export async function mailClear(id?: string): Promise<void> {
  await http.delete(`/v1/messages${id ? `/${id}` : ''}`);
}

async function get(id: string): Promise<Email> {
  const response = await http.get<Email | null>(`/v1/messages/${id}`);
  if (response.data === null) throw new Error(`Email not found (${id})`);
  return response.data;
}

async function contains(query: string, email?: string): Promise<Email[]> {
  const response = await http.get<HttpResponse>('/v2/search', { params: { kind: 'containing', query } });
  const { data } = response;
  if (!data.count) throw new Error(`Email containing '${query}' not found`);
  if (email) {
    const found = data.items.filter((em: Email) => em.Raw.To.indexOf(email) > -1);
    if (!found.length) throw new Error(`Email to '${email}' containing '${query}' not found`);
    return found;
  }
  return data.items;
}

async function mybox(kind: string, query: string, empty = false): Promise<Email[]> {
  const label = kind === 'to' ? 'Inbox' : 'Outbox';
  const response = await http.get<HttpResponse>('/v2/search', { params: { kind, query } });
  const { data } = response;

  if (empty) {
    if (data.count) throw new Error(`${label} has emails`);
    return [];
  }

  if (!data.count) throw new Error(`${label} is empty`);
  return response.data.items;
}

// replay a function with increasing delay
async function replay<T>(fn: Function, ...args: any[]): Promise<T> {
  let tries = [1000, 3000, 5000, 10000, 30000];
  let error = null;
  for (const time of tries) {
    try {
      return await fn(...args);
    } catch (e) {
      error = e;
      console.error(`Failed at ${time}ms, retrying.`, e.message);
      await new Promise((resolve) => setTimeout(resolve, time));
    }
  }
  throw error || new Error('Failed after 30000ms');
}
