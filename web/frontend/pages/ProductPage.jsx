// import React, { useState, useEffect } from "react";
// import { Page, Layout, LegacyCard, Grid, Button, Modal, TextField } from "@shopify/polaris";
// import { Add, Delete } from "@mui/icons-material";

// function Products() {
//   const [products, setProducts] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [formData, setFormData] = useState({});

//   // Fetch products data
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await fetch("/api/products/all", { method: "GET" });
//         const data = await response.json();
//         setProducts(data.data || []);
//         setIsLoading(false);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//         setIsLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const productHandler = (productId) => {
//     setIsModalOpen(true);
//     const selectedProduct = products.find((product) => product.id === productId);
//     setFormData({ ...selectedProduct });
//   };

//   const submitHandler = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch("/api/product/update", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       if (response.ok) {
//         setIsModalOpen(false);
//         // Optionally refresh product list
//       }
//       const data = await response.json();
//       console.log(data);
//     } catch (error) {
//       console.error("Error updating product:", error);
//     }
//   };

//   const valueHandler = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const createHandler = async () => {
//     try {
//       const response = await fetch("/api/product/create", { method: "POST" });
//       const data = await response.json();
//       console.log(data);
//       // Optionally refresh product list
//     } catch (error) {
//       console.error("Error creating product:", error);
//     }
//   };

//   const deleteHandler = async () => {
//     try {
//       const response = await fetch("/api/product/delete", { method: "DELETE" });
//       const data = await response.json();
//       console.log(data);
//       // Optionally refresh product list
//     } catch (error) {
//       console.error("Error deleting product:", error);
//     }
//   };

//   return (
//     <Page fullWidth>
//       <Layout>
//         <Layout.Section>
//           <Button primary onClick={createHandler} icon={<Add />}>
//             New
//           </Button>
//           <Button destructive onClick={deleteHandler} icon={<Delete />}>
//             Delete
//           </Button>
//         </Layout.Section>
//         <Layout.Section>
//           <Grid>
//             {!isLoading &&
//               products.map((product) => (
//                 <Grid.Cell key={product.id} columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4, xl: 3 }}>
//                   <LegacyCard sectioned onClick={() => productHandler(product.id)}>
//                     <img src={product?.image?.src} alt="Product" className="product-image" />
//                     <h2 className="product-title">{product.title}</h2>
//                     <p className="product-price">${product.variants[0].price}</p>
//                   </LegacyCard>
//                 </Grid.Cell>
//               ))}
//           </Grid>
//         </Layout.Section>
//       </Layout>
//       {isModalOpen && (
//         <Modal
//           open={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           title="Edit Product"
//           primaryAction={{
//             content: "Save",
//             onAction: submitHandler,
//           }}
//         >
//           <Modal.Section>
//             <form onSubmit={submitHandler}>
//               <img src={formData?.image?.src} alt="Product" style={{ width: "100%", marginBottom: "1rem" }} />
//               <TextField
//                 label="Title"
//                 name="title"
//                 value={formData.title || ""}
//                 onChange={(value) => valueHandler({ target: { name: "title", value } })}
//               />
//               <TextField
//                 label="Price"
//                 type="number"
//                 name="variants[0].price"
//                 value={formData.variants?.[0]?.price || ""}
//                 onChange={(value) => valueHandler({ target: { name: "variants[0].price", value } })}
//               />
//               <TextField
//                 label="Description"
//                 name="body_html"
//                 multiline
//                 value={formData.body_html || ""}
//                 onChange={(value) => valueHandler({ target: { name: "body_html", value } })}
//               />
//               <TextField
//                 label="Handle"
//                 name="handle"
//                 value={formData.handle || ""}
//                 onChange={(value) => valueHandler({ target: { name: "handle", value } })}
//               />
//             </form>
//           </Modal.Section>
//         </Modal>
//       )}
//     </Page>
//   );
// }

// export default Products;


import React, { useEffect, useState } from 'react';
import {
    Page,
    Layout,
    LegacyCard,
    Grid,
    Spinner,
    Tag,
    Toast,
    TextField,
    LegacyStack,
    Button,
    Modal
} from '@shopify/polaris';
import SearchIcon from '@mui/icons-material/Search';

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchValue, setSearchValue] = useState('');

    const [availableTags, setAvailableTags] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [tagSearchValue, setTagSearchValue] = useState('');
    const [newTagValue, setNewTagValue] = useState('');
    const [isAddingTag, setIsAddingTag] = useState(false);

    const [toastConfig, setToastConfig] = useState({
        active: false,
        message: '',
        error: false
    });

    useEffect(() => {
        fetchProducts();
        fetchAvailableTags();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/proxy/products.json');
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            showToast('Failed to load products', true);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableTags = async () => {
        try {
            const response = await fetch('/api/tags');
            if (!response.ok) throw new Error('Failed to fetch tags');
            const tags = await response.json();
            setAvailableTags(tags);
        } catch (error) {
            console.error('Error fetching tags:', error);
            showToast('Failed to load tags', true);
        }
    };

    const showToast = (message, isError = false) => {
        setToastConfig({
            active: true,
            message,
            error: isError
        });
    };

    const getProductTags = (product) => {
        return product.tags ? product.tags.split(', ').filter(Boolean) : [];
    };

    const isTagInProduct = (product, tagName) => {
        const currentTags = getProductTags(product);
        return currentTags.includes(tagName);
    };

    const getFilteredTags = () => {
        if (!selectedProduct) return [];
        const searchTerm = tagSearchValue.toLowerCase();
        const currentTags = getProductTags(selectedProduct);
        return availableTags.filter(tag =>
            tag.name.toLowerCase().includes(searchTerm) &&
            !currentTags.includes(tag.name)
        );
    };

    const addTagToProduct = async (tagName) => {
        if (!selectedProduct || isAddingTag) return;
        setIsAddingTag(true);

        try {
            const currentTags = getProductTags(selectedProduct);
            if (currentTags.includes(tagName)) {
                showToast('Tag already exists');
                return;
            }

            const newTags = [...currentTags, tagName].join(', ');

            const response = await fetch(`/api/proxy/products/${selectedProduct.id}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product: {
                        id: selectedProduct.id,
                        tags: newTags
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to add tag');

            const { product: updatedProduct } = await response.json();
            setProducts(prev => prev.map(p =>
                p.id === selectedProduct.id ? updatedProduct : p
            ));

            showToast('Tag added successfully');
        } catch (error) {
            console.error('Error adding tag:', error);
            showToast('Failed to add tag', true);
        } finally {
            setIsAddingTag(false);
        }
    };

    const createNewTag = async () => {
        if (!newTagValue.trim() || isAddingTag) return;
        setIsAddingTag(true);

        try {
            const createResponse = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTagValue.trim() })
            });

            if (!createResponse.ok) throw new Error('Failed to create tag');

            const newTag = await createResponse.json();
            setAvailableTags(prev => [...prev, newTag]);

            await addTagToProduct(newTagValue.trim());
            setNewTagValue('');
        } catch (error) {
            console.error('Error creating tag:', error);
            showToast('Failed to create tag', true);
        } finally {
            setIsAddingTag(false);
        }
    };

    const removeTag = async (product, tagToRemove) => {
        setIsAddingTag(true);

        try {
            const currentTags = getProductTags(product);
            const newTags = currentTags.filter(tag => tag !== tagToRemove).join(', ');

            const response = await fetch(`/api/proxy/products/${product.id}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product: {
                        id: product.id,
                        tags: newTags
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to remove tag');

            const { product: updatedProduct } = await response.json();
            setProducts(prev => prev.map(p =>
                p.id === product.id ? updatedProduct : p
            ));

            showToast('Tag removed successfully');
        } catch (error) {
            console.error('Error removing tag:', error);
            showToast('Failed to remove tag', true);
        } finally {
            setIsAddingTag(false);
        }
    };

    const renderProductTags = (product) => {
        const tags = getProductTags(product);
        return (
            <LegacyStack spacing="tight" wrap>
                {tags.map((tag) => (
                    <Tag
                        key={`${product.id}-${tag}`}
                        onRemove={() => removeTag(product, tag)}
                    >
                        {tag}
                    </Tag>
                ))}
            </LegacyStack>
        );
    };

    const renderTagModal = () => {
        if (!selectedProduct) return null;

        const filteredTags = getFilteredTags();

        return (
            <Modal
                open={isTagModalOpen}
                onClose={() => {
                    setIsTagModalOpen(false);
                    setSelectedProduct(null);
                    setTagSearchValue('');
                    setNewTagValue('');
                }}
                title="Manage Tags"
                primaryAction={{
                    content: 'Done',
                    onAction: () => setIsTagModalOpen(false)
                }}
            >
                <Modal.Section>
                    <LegacyStack vertical spacing="tight">
                        <TextField
                            label="Search existing tags"
                            value={tagSearchValue}
                            onChange={setTagSearchValue}
                            placeholder="Search tags..."
                            clearButton
                            onClearButtonClick={() => setTagSearchValue('')}
                        />

                        <div style={{
                            maxHeight: '200px',
                            overflowY: 'auto',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            marginTop: '1rem'
                        }}>
                            {filteredTags.map((tag) => (
                                <div
                                    key={tag.id}
                                    onClick={() => addTagToProduct(tag.name)}
                                    style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #eee',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    {tag.name}
                                </div>
                            ))}
                            {filteredTags.length === 0 && (
                                <div style={{ padding: '8px 12px', color: '#637381' }}>
                                    No matching tags found
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <LegacyStack spacing="tight">
                                <LegacyStack.Item fill>
                                    <TextField
                                        label="Create new tag"
                                        value={newTagValue}
                                        onChange={setNewTagValue}
                                        placeholder="Enter new tag name"
                                    />
                                </LegacyStack.Item>
                                <div style={{ marginTop: '2rem' }}>
                                    <Button
                                        onClick={createNewTag}
                                        disabled={!newTagValue.trim() || isAddingTag}
                                        loading={isAddingTag}
                                    >
                                        Create & Add
                                    </Button>
                                </div>
                            </LegacyStack>
                        </div>
                    </LegacyStack>
                </Modal.Section>
            </Modal>
        );
    };

    if (loading) {
        return (
            <Page>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <Spinner size="large" />
                </div>
            </Page>
        );
    }

    return (
        <Page fullWidth title="Products">
            <Layout>
                <Layout.Section>
                    <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                        <TextField
                            value={searchValue}
                            onChange={setSearchValue}
                            placeholder="Search products..."
                            prefix={<SearchIcon />}
                            clearButton
                            onClearButtonClick={() => setSearchValue('')}
                        />
                    </div>

                    <Grid>
                        {products
                            .filter(product =>
                                product.title.toLowerCase().includes(searchValue.toLowerCase()) ||
                                (product.tags || '').toLowerCase().includes(searchValue.toLowerCase())
                            )
                            .map((product) => (
                                <Grid.Cell
                                    key={product.id}
                                    columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}
                                >
                                    <LegacyCard sectioned>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <img
                                                src={product.image?.src || '/placeholder-image.jpg'}
                                                alt={product.title}
                                                style={{
                                                    width: '100%',
                                                    height: '200px',
                                                    objectFit: 'cover',
                                                    marginBottom: '1rem'
                                                }}
                                            />
                                            <h2 style={{
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                marginBottom: '0.5rem'
                                            }}>
                                                {product.title}
                                            </h2>
                                            <p style={{ color: '#637381' }}>
                                                ${parseFloat(product.variants[0]?.price || 0).toFixed(2)}
                                            </p>
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            {renderProductTags(product)}
                                        </div>

                                        <Button
                                            onClick={() => {
                                                setSelectedProduct(product);
                                                setIsTagModalOpen(true);
                                            }}
                                            fullWidth
                                        >
                                            Manage Tags
                                        </Button>
                                    </LegacyCard>
                                </Grid.Cell>
                            ))}
                    </Grid>
                </Layout.Section>
            </Layout>

            {renderTagModal()}

            {toastConfig.active && (
                <Toast
                    content={toastConfig.message}
                    error={toastConfig.error}
                    onDismiss={() => setToastConfig(prev => ({ ...prev, active: false }))}
                    duration={3000}
                />
            )}
        </Page>
    );
}

export default Products;