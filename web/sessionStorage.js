// sessionStorage.js
import { Session } from '@shopify/shopify-api';

class PostgresSessionStorage {
    constructor(Session, Store) {
        this.Session = Session;
        this.Store = Store;
    }

    async storeSession(session) {
        try {
            const sessionData = {
                id: session.id,
                shop: session.shop,
                state: session.state,
                scope: session.scope,
                accessToken: session.accessToken,
                isOnline: session.isOnline,
                expires: session.expires ? new Date(session.expires) : null
            };

            await this.Session.upsert(sessionData);

            if (session.accessToken) {
                await this.Store.upsert({
                    shopDomain: session.shop,
                    accessToken: session.accessToken,
                    isInstalled: true,
                    installedAt: new Date()
                });
            }

            return true;
        } catch (error) {
            console.error('Error storing session:', error);
            return false;
        }
    }

    async loadSession(id) {
        try {
            const sessionData = await this.Session.findByPk(id);
            if (!sessionData) return undefined;

            const session = new Session({
                id: sessionData.id,
                shop: sessionData.shop,
                state: sessionData.state,
                isOnline: sessionData.isOnline,
            });

            session.scope = sessionData.scope;
            session.accessToken = sessionData.accessToken;
            session.expires = sessionData.expires;

            return session;
        } catch (error) {
            console.error('Error loading session:', error);
            return undefined;
        }
    }

    async deleteSession(id) {
        try {
            const deleted = await this.Session.destroy({
                where: { id }
            });
            return deleted > 0;
        } catch (error) {
            console.error('Error deleting session:', error);
            return false;
        }
    }

    async deleteSessions(shop) {
        try {
            await this.Session.destroy({
                where: { shop }
            });
            return true;
        } catch (error) {
            console.error('Error deleting sessions:', error);
            return false;
        }
    }

    async findSessionsByShop(shop) {
        try {
            const sessions = await this.Session.findAll({
                where: { shop }
            });

            return sessions.map(sessionData => {
                const session = new Session({
                    id: sessionData.id,
                    shop: sessionData.shop,
                    state: sessionData.state,
                    isOnline: sessionData.isOnline,
                });

                session.scope = sessionData.scope;
                session.accessToken = sessionData.accessToken;
                session.expires = sessionData.expires;

                return session;
            });
        } catch (error) {
            console.error('Error finding sessions:', error);
            return [];
        }
    }
}

export default PostgresSessionStorage;