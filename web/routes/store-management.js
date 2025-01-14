// web/routes/store-management.js
import express from 'express';
import { Store } from '../models/index.js';
import { verifyAndStoreSession, ensureStoreExists } from '../middleware/multistore-auth.js';

const router = express.Router();

// Get store information
router.get('/api/store/details', ensureStoreExists, async (req, res) => {
    try {
        const session = res.locals.shopify.session;
        const store = await Store.findOne({
            where: { shopDomain: session.shop }
        });

        // Remove sensitive information and include installedAt
        const safeStoreData = {
            shopDomain: store.shopDomain,
            isActive: store.isActive,
            installedAt: store.installedAt,
            createdAt: store.createdAt,
            updatedAt: store.updatedAt
        };

        res.json(safeStoreData);
    } catch (error) {
        console.error('Error fetching store details:', error);
        res.status(500).json({ error: 'Failed to fetch store details' });
    }
});

// Deactivate store
router.post('/api/store/deactivate', ensureStoreExists, async (req, res) => {
    try {
        const session = res.locals.shopify.session;
        await Store.update(
            { isActive: false },
            { where: { shopDomain: session.shop } }
        );

        res.json({ message: 'Store deactivated successfully' });
    } catch (error) {
        console.error('Error deactivating store:', error);
        res.status(500).json({ error: 'Failed to deactivate store' });
    }
});

// Get store installation statistics
router.get('/api/store/stats', ensureStoreExists, async (req, res) => {
    try {
        const session = res.locals.shopify.session;
        const store = await Store.findOne({
            where: { shopDomain: session.shop }
        });

        // Calculate days since installation
        const daysSinceInstall = Math.floor(
            (new Date() - new Date(store.installedAt)) / (1000 * 60 * 60 * 24)
        );

        const stats = {
            installedAt: store.installedAt,
            daysSinceInstallation: daysSinceInstall,
            isActive: store.isActive
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching store stats:', error);
        res.status(500).json({ error: 'Failed to fetch store statistics' });
    }
});

export default router;