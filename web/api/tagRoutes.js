import express from 'express';
import shopify from '../shopify.js';
import { Tag, ProductTag } from '../models/index.js';

const router = express.Router();

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


// router.post('/api/products/:productId/tags', async (req, res) => {
//     const { productId } = req.params;
//     const { tagId } = req.body;
//     const session = res.locals.shopify.session;

//     try {
//         const tag = await Tag.findByPk(tagId);
//         if (!tag) {
//             return res.status(404).json({ error: 'Tag not found' });
//         }

//         const client = new shopify.api.clients.Rest({
//             session: session,
//             apiVersion: '2025-01'  // Explicitly set API version
//         });

//         const productResponse = await client.get({
//             path: `products/${productId}`,
//         });

//         const currentTags = productResponse.body.product.tags ?
//             productResponse.body.product.tags.split(', ') : [];

//         if (!currentTags.includes(tag.name)) {
//             currentTags.push(tag.name);
//         }


//         await client.put({
//             path: `products/${productId}`,
//             data: {
//                 product: {
//                     id: productId,
//                     tags: currentTags.join(', ')
//                 }
//             }
//         });

//         await ProductTag.findOrCreate({
//             where: {
//                 shopifyProductId: productId,
//                 tagId: tagId,
//                 shopDomain: session.shop
//             }
//         });

//         const updatedTags = await Tag.findAll({
//             where: {
//                 name: currentTags,
//                 shopDomain: session.shop
//             }
//         });

//         res.status(200).json(updatedTags);
//     } catch (error) {
//         console.error('Error adding tag:', error);
//         res.status(500).json({ error: error.message });
//     }
// });

// // Update the get route as well
// router.get('/api/products/:productId/tags', async (req, res) => {
//     const { productId } = req.params;
//     const session = res.locals.shopify.session;

//     try {
//         const client = new shopify.api.clients.Rest({
//             session: session,
//             apiVersion: '2025-01'  // Explicitly set API version
//         });

//         const product = await client.get({
//             path: 'products',
//             query: { id: productId },
//             apiVersion: '2025-01'
//         });

//         const tags = product.body.product.tags ?
//             product.body.product.tags.split(', ') : [];

//         const formattedTags = await Tag.findAll({
//             where: {
//                 name: tags,
//                 shopDomain: session.shop
//             }
//         });

//         res.json(formattedTags);
//     } catch (error) {
//         console.error('Error fetching product tags:', error);
//         res.status(500).json({ error: error.message });
//     }
// });



// router.post('/api/products/:productId/tags', async (req, res) => {
//     const { productId } = req.params;
//     const { tagId } = req.body;
//     const session = res.locals.shopify.session;

//     try {
//         // Find the tag to be added
//         const tag = await Tag.findByPk(tagId);
//         if (!tag) {
//             return res.status(404).json({ error: 'Tag not found' });
//         }

//         const client = new shopify.api.clients.Rest({
//             session: session
//         });

//         // First get current product tags
//         const productResponse = await client.get({
//             path: `products/${productId}`
//         });

//         // Parse existing tags and add new tag
//         const currentTags = productResponse.body.product.tags ?
//             productResponse.body.product.tags.split(', ') : [];

//         // Check if tag already exists
//         if (!currentTags.includes(tag.name)) {
//             currentTags.push(tag.name);
//         }

//         // Update product with new tags
//         const response = await client.put({
//             path: `products/${productId}`,
//             data: {
//                 product: {
//                     id: productId,
//                     tags: currentTags.join(', ')
//                 }
//             }
//         });

//         // Create product-tag association
//         await ProductTag.findOrCreate({
//             where: {
//                 shopifyProductId: productId,
//                 tagId: tagId,
//                 shopDomain: session.shop
//             }
//         });

//         // Fetch updated tags to return
//         const updatedTags = await Tag.findAll({
//             where: {
//                 name: currentTags,
//                 shopDomain: session.shop
//             }
//         });

//         res.status(200).json(updatedTags);
//     } catch (error) {
//         console.error('Error adding tag:', error);
//         res.status(500).json({ error: error.message });
//     }
// });

router.get('/api/products/:productId/tags', async (req, res) => {
    const { productId } = req.params;
    const session = res.locals.shopify.session;

    try {
        const client = new shopify.api.clients.Rest({
            session: session
        });

        const response = await client.get({
            path: `products/${productId}`
        });

        const tags = response.body.product.tags ?
            response.body.product.tags.split(', ') : [];

        const formattedTags = await Tag.findAll({
            where: {
                name: tags,
                shopDomain: session.shop
            }
        });

        res.json(formattedTags);
    } catch (error) {
        console.error('Error fetching product tags:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/api/products/:productId/tags', async (req, res) => {
    const { productId } = req.params;
    const { tagId } = req.body;
    const session = res.locals.shopify.session;

    try {
        const tag = await Tag.findByPk(tagId);
        if (!tag) {
            return res.status(404).json({ error: 'Tag not found' });
        }

        const client = new shopify.api.clients.Rest({
            session: session
        });

        const response = await client.put({
            path: `products/${productId}`,
            data: {
                product: {
                    id: productId,
                    tags: tag.name
                }
            }
        });

        await ProductTag.create({
            shopifyProductId: productId,
            tagId: tagId,
            shopDomain: session.shop
        });

        res.status(200).json(response.body.product);
    } catch (error) {
        console.error('Error adding tag:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/api/products/:productId/tags/:tagId', async (req, res) => {
    const { productId, tagId } = req.params;
    const session = res.locals.shopify.session;

    try {
        const tag = await Tag.findByPk(tagId);
        if (!tag) {
            return res.status(404).json({ error: 'Tag not found' });
        }

        const client = new shopify.api.clients.Rest({
            session: session
        });

        const productResponse = await client.get({
            path: `products/${productId}`
        });

        const currentTags = productResponse.body.product.tags.split(', ');
        const updatedTags = currentTags.filter(t => t !== tag.name).join(', ');

        await client.put({
            path: `products/${productId}`,
            data: {
                product: {
                    id: productId,
                    tags: updatedTags
                }
            }
        });

        await ProductTag.destroy({
            where: {
                shopifyProductId: productId,
                tagId: tagId
            }
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error removing tag:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;