// web/middleware/multistore-auth.js
import { Store } from '../models/index.js';
import shopify from '../shopify.js';

export const verifyAndStoreSession = async (req, res, next) => {
    try {
        const session = res.locals.shopify.session;
        if (!session) {
            return res.status(401).json({ error: 'No session found' });
        }

        // Check if store exists
        const existingStore = await Store.findOne({
            where: { shopDomain: session.shop }
        });

        if (existingStore) {
            // Update existing store
            await existingStore.update({
                accessToken: session.accessToken,
                scopes: session.scope,
                isActive: true
            });
        } else {
            // Create new store with installedAt timestamp
            await Store.create({
                shopDomain: session.shop,
                accessToken: session.accessToken,
                scopes: session.scope,
                isActive: true,
                installedAt: new Date()
            });
        }

        next();
    } catch (error) {
        console.error('Session verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const ensureStoreExists = async (req, res, next) => {
    try {
        const session = res.locals.shopify.session;
        const store = await Store.findOne({
            where: {
                shopDomain: session.shop,
                isActive: true
            }
        });

        if (!store) {
            return res.redirect(`/api/auth?shop=${session.shop}`);
        }

        req.store = store;
        next();
    } catch (error) {
        console.error('Store verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};