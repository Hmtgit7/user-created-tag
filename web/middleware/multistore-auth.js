// web/middleware/multistore-auth.js
import { Store } from '../models/index.js';
import shopify from '../shopify.js';

export const verifyAndStoreSession = async (req, res, next) => {
    // Skip verification for auth and webhook routes
    if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/webhooks')) {
        return next();
    }

    try {
        const session = res.locals?.shopify?.session;

        // If no session, check if this is an auth request
        if (!session) {
            const shop = req.query.shop || req.body.shop;
            if (shop) {
                return res.redirect(`/api/auth?shop=${shop}`);
            }
            return res.status(401).json({ error: 'No session found' });
        }

        // Check if store exists and update/create as needed
        const [store, created] = await Store.findOrCreate({
            where: { shopDomain: session.shop },
            defaults: {
                accessToken: session.accessToken,
                scopes: session.scope,
                isActive: true,
                installedAt: new Date()
            }
        });

        if (!created) {
            await store.update({
                accessToken: session.accessToken,
                scopes: session.scope,
                isActive: true,
                lastAccessedAt: new Date()
            });
        }

        // Attach store to request for later use
        req.store = store;
        next();
    } catch (error) {
        console.error('Session verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const ensureStoreExists = async (req, res, next) => {
    try {
        const session = res.locals?.shopify?.session;
        if (!session) {
            return res.status(401).json({ error: 'No session found' });
        }

        const store = await Store.findOne({
            where: {
                shopDomain: session.shop,
                isActive: true
            }
        });

        if (!store) {
            return res.redirect(`/api/auth?shop=${session.shop}`);
        }

        // Verify access token is still valid
        try {
            const client = new shopify.api.clients.Rest({
                session: session
            });
            await client.get({ path: 'shop' });
        } catch (error) {
            if (error.response?.status === 401) {
                return res.redirect(`/api/auth?shop=${session.shop}`);
            }
            throw error;
        }

        req.store = store;
        next();
    } catch (error) {
        console.error('Store verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};