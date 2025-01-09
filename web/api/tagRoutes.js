import express from 'express';
import shopify from '../shopify.js';
import { Tag, ProductTag } from '../models/index.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// POSTGRESQL DATABASE ROUTES
// for user created tags 
router.post('/api/tags', async (req, res) => {
    const { name } = req.body;
    const session = res.locals.shopify.session;

    try {
        const tag = await Tag.create({
            name,
            shopDomain: session.shop
        });
        res.status(201).json(tag);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// to fetch all the postgresql database tags
router.get('/api/tags', async (req, res) => {
    const session = res.locals.shopify.session;
    try {
        const tags = await Tag.findAll({
            where: { shopDomain: session.shop }
        });
        res.json(tags);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update product tags
router.put('/api/products/:id/tags', async (req, res) => {
    try {
        const { id } = req.params;
        const { tags } = req.body;

        const product = new shopify.api.rest.Product({
            session: res.locals.shopify.session,
        });

        product.id = id;
        product.tags = tags;

        await product.save({
            update: true,
        });

        res.json({ success: true, tags });
    } catch (error) {
        console.error('Error updating product tags:', error);
        res.status(500).json({ error: 'Failed to update product tags' });
    }
});

router.get('/api/proxy/products.json', async (req, res) => {
    try {
        const response = await shopify.api.rest.Product.all({
            session: res.locals.shopify.session,
        });
        res.status(200).json({ products: response.data });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
});

// Proxy route for updating a product
router.put('/api/proxy/products/:id.json', async (req, res) => {
    try {
        const { id } = req.params;
        const { product } = req.body;

        const updatedProduct = new shopify.api.rest.Product({
            session: res.locals.shopify.session,
        });

        updatedProduct.id = id;
        updatedProduct.tags = product.tags;

        await updatedProduct.save({
            update: true,
        });

        // Fetch the updated product to return
        const response = await shopify.api.rest.Product.find({
            session: res.locals.shopify.session,
            id: id,
        });

        res.status(200).json({ product: response });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: error.message });
    }
});
export default router;