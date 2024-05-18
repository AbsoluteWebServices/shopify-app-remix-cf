import type { SessionStorage } from '@shopify/shopify-app-session-storage';
import { Session } from '@shopify/shopify-api';

export interface D1StoredSession {
  id: string;
  shop: string;
  state: string;
  isOnline: boolean;
  scope?: string | null;
  expires?: string | null;
  accessToken: string;
  userId?: bigint | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  accountOwner: boolean;
  locale?: string | null;
  collaborator?: boolean | null;
  emailVerified?: boolean | null;
}



export class D1SessionStorage implements SessionStorage {
  constructor(private db: D1Database) {
    this.init();
  }

  private async init() {
    await this.db.prepare(`CREATE TABLE IF NOT EXISTS Sessions (
      id VARCHAR(255) PRIMARY KEY,
      shop VARCHAR(255) NOT NULL,
      state VARCHAR(255) NOT NULL,
      isOnline BOOLEAN DEFAULT FALSE,
      scope VARCHAR(255),
      expires DATETIME,
      accessToken VARCHAR(255) NOT NULL,
      userId BIGINT,
      firstName VARCHAR(255),
      lastName VARCHAR(255),
      email VARCHAR(255),
      accountOwner BOOLEAN DEFAULT FALSE,
      locale VARCHAR(255),
      collaborator BOOLEAN DEFAULT FALSE,
      emailVerified BOOLEAN DEFAULT FALSE
    )`).run();
  }

  private sessionToRow(session: Session): D1StoredSession {
    const sessionParams = session.toObject();

    return {
      id: session.id,
      shop: session.shop,
      state: session.state,
      isOnline: session.isOnline,
      scope: session.scope || null,
      expires: session.expires?.toISOString() || null,
      accessToken: session.accessToken || '',
      userId: (sessionParams.onlineAccessInfo?.associated_user.id as unknown as bigint) || null,
      firstName: sessionParams.onlineAccessInfo?.associated_user.first_name || null,
      lastName: sessionParams.onlineAccessInfo?.associated_user.last_name || null,
      email: sessionParams.onlineAccessInfo?.associated_user.email || null,
      accountOwner: sessionParams.onlineAccessInfo?.associated_user.account_owner || false,
      locale: sessionParams.onlineAccessInfo?.associated_user.locale || null,
      collaborator: sessionParams.onlineAccessInfo?.associated_user.collaborator || false,
      emailVerified: sessionParams.onlineAccessInfo?.associated_user.email_verified || false,
    };
  }

  private rowToSession(row: D1StoredSession): Session {
    const sessionParams: Record<string, boolean | string | number> = {
      id: row.id,
      shop: row.shop,
      state: row.state,
      isOnline: row.isOnline,
      userId: String(row.userId),
      firstName: String(row.firstName),
      lastName: String(row.lastName),
      email: String(row.email),
      locale: String(row.locale),
    };

    if (row.accountOwner) {
      sessionParams.accountOwner = row.accountOwner;
    }

    if (row.collaborator) {
      sessionParams.collaborator = row.collaborator;
    }

    if (row.emailVerified) {
      sessionParams.emailVerified = row.emailVerified;
    }

    if (row.expires) {
      sessionParams.expires = new Date(row.expires).getTime();
    }

    if (row.scope) {
      sessionParams.scope = row.scope;
    }

    if (row.accessToken) {
      sessionParams.accessToken = row.accessToken;
    }

    return Session.fromPropertyArray(Object.entries(sessionParams), true);
  }

  public async storeSession(session: Session): Promise<boolean> {
    try {
      const row = this.sessionToRow(session);
      await this.db.prepare(
        `INSERT INTO Sessions (id, shop, state, isOnline, scope, expires, accessToken, userId, firstName, lastName, email, accountOwner, locale, collaborator, emailVerified)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)
        ON CONFLICT(id) DO UPDATE SET
        shop=?2,
        state=?3,
        isOnline=?4,
        scope=?5,
        expires=?6,
        accessToken=?7,
        userId=?8,
        firstName=?9,
        lastName=?10,
        email=?11,
        accountOwner=?12,
        locale=?13,
        collaborator=?14,
        emailVerified=?15`,
      ).bind(
        row.id,
        row.shop,
        row.state,
        row.isOnline,
        row.scope,
        row.expires,
        row.accessToken,
        row.userId,
        row.firstName,
        row.lastName,
        row.email,
        row.accountOwner,
        row.locale,
        row.collaborator,
        row.emailVerified,
      ).run();
      return true;
    } catch (err) {
      console.error('Error storing session:', err);
      return false;
    }
  }

  public async loadSession(id: string): Promise<Session | undefined> {
    try {
      const row = await this.db.prepare(`SELECT * FROM Sessions WHERE id = ?1`).bind(id).first<D1StoredSession>();

      if (!row) {
        return undefined;
      }

      return this.rowToSession(row);
    } catch (err) {
      console.error('Error loading session:', err);
      return undefined;
    }
  }

  public async deleteSession(id: string): Promise<boolean> {
    try {
      await this.db.prepare(`DELETE FROM Sessions WHERE id = ?1`).bind(id).run();
      return true;
    } catch (err) {
      console.error('Error deleting session:', err);
      return false;
    }
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    try {
      await this.db.prepare(`DELETE FROM Sessions WHERE id IN (${ids.map(() => '?').join(', ')})`).bind(...ids).run();
      return true;
    } catch (err) {
      console.error('Error deleting sessions:', err);
      return false;
    }
  }

  public async findSessionsByShop(shop: string): Promise<Session[]> {
    try {
      const result = await this.db.prepare(`SELECT * FROM Sessions WHERE shop = ?1`).bind(shop).all<D1StoredSession>();
      return result.results.map(row => this.rowToSession(row));
    } catch (err) {
      console.error('Error finding sessions by shop:', err);
      return [];
    }
  }

  public async deleteSessionsByShop(shop: string): Promise<boolean> {
    try {
      await this.db.prepare(`DELETE FROM Sessions WHERE shop = ?1`).bind(shop).run();
      return true;
    } catch (err) {
      console.error('Error deleting sessions:', err);
      return false;
    }
  }
}
