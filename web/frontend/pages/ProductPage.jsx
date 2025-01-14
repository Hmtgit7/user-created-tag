// import React, { useEffect, useState } from 'react';
// import {
//     Page,
//     Layout,
//     LegacyCard,
//     Grid,
//     Spinner,
//     Tag,
//     Banner,
//     Toast,
//     TextField,
//     LegacyStack,
//     Button
// } from '@shopify/polaris';
// // import { SearchIcon } from '@shopify/polaris-icons';
// import SearchIcon from '@mui/icons-material/Search';

// function ProductPage() {
//     // State declarations
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [toastMessage, setToastMessage] = useState('');
//     const [isToastActive, setIsToastActive] = useState(false);
//     const [newTagInputs, setNewTagInputs] = useState({});
//     const [searchValue, setSearchValue] = useState('');
//     const [loadingStates, setLoadingStates] = useState({});
//     const [customTags, setCustomTags] = useState([]);
//     const [showSuggestions, setShowSuggestions] = useState({});

//     // Initial data fetching
//     useEffect(() => {
//         fetchProducts();
//         fetchTags();
//     }, []);

//     // Fetch products
//     const fetchProducts = async () => {
//         try {
//             const response = await fetch('/api/proxy/products.json');
//             if (!response.ok) throw new Error('Failed to fetch products');

//             const data = await response.json();
//             setProducts(data.products || []);
//         } catch (error) {
//             console.error('Error fetching products:', error);
//             setError('Failed to load products');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Fetch tags from PostgreSQL
//     const fetchTags = async () => {
//         try {
//             const response = await fetch('/api/tags');
//             if (!response.ok) throw new Error('Failed to fetch tags');
//             const tags = await response.json();
//             setCustomTags(tags);
//         } catch (error) {
//             console.error('Error fetching tags:', error);
//         }
//     };

//     // Toast message handler
//     const showToast = (message) => {
//         setToastMessage(message);
//         setIsToastActive(true);
//     };

//     // Tag input change handler
//     const handleNewTagChange = (productId, value) => {
//         setNewTagInputs(prev => ({
//             ...prev,
//             [productId]: value
//         }));
//     };

//     // Add tag to product
//     const addTag = async (productId) => {
//         const newTag = newTagInputs[productId]?.trim();
//         if (!newTag) return;

//         setLoadingStates(prev => ({ ...prev, [productId]: true }));

//         try {
//             const product = products.find(p => p.id === productId);
//             const currentTags = product.tags ? product.tags.split(', ').filter(Boolean) : [];

//             if (currentTags.includes(newTag)) {
//                 showToast('Tag already exists');
//                 return;
//             }

//             const newTags = [...currentTags, newTag].join(', ');

//             const response = await fetch(`/api/proxy/products/${productId}.json`, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     product: {
//                         id: productId,
//                         tags: newTags
//                     }
//                 })
//             });

//             if (!response.ok) throw new Error('Failed to add tag');

//             const { product: updatedProduct } = await response.json();

//             setProducts(prev => prev.map(p =>
//                 p.id === productId ? updatedProduct : p
//             ));

//             setNewTagInputs(prev => ({
//                 ...prev,
//                 [productId]: ''
//             }));

//             showToast('Tag added successfully');
//         } catch (error) {
//             console.error('Error adding tag:', error);
//             setError('Failed to add tag');
//         } finally {
//             setLoadingStates(prev => ({ ...prev, [productId]: false }));
//         }
//     };

//     // Remove tag from product
//     const removeTag = async (productId, tagToRemove) => {
//         setLoadingStates(prev => ({ ...prev, [productId]: true }));

//         try {
//             const product = products.find(p => p.id === productId);
//             const currentTags = product.tags ? product.tags.split(', ').filter(Boolean) : [];
//             const newTags = currentTags.filter(tag => tag !== tagToRemove).join(', ');

//             const response = await fetch(`/api/proxy/products/${productId}.json`, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     product: {
//                         id: productId,
//                         tags: newTags
//                     }
//                 })
//             });

//             if (!response.ok) throw new Error('Failed to remove tag');

//             const { product: updatedProduct } = await response.json();

//             setProducts(prev => prev.map(p =>
//                 p.id === productId ? updatedProduct : p
//             ));

//             showToast('Tag removed successfully');
//         } catch (error) {
//             console.error('Error removing tag:', error);
//             setError('Failed to remove tag');
//         } finally {
//             setLoadingStates(prev => ({ ...prev, [productId]: false }));
//         }
//     };

//     // Render tag suggestions dropdown
//     const renderSuggestions = (productId) => {
//         if (!showSuggestions[productId]) return null;

//         const inputValue = (newTagInputs[productId] || '').toLowerCase();
//         const filteredTags = customTags
//             .filter(tag => tag.name.toLowerCase().includes(inputValue))
//             .slice(0, 5);

//         if (filteredTags.length === 0) return null;

//         return (
//             <div
//                 style={{
//                     position: 'absolute',
//                     top: '100%',
//                     left: 0,
//                     right: 0,
//                     backgroundColor: 'white',
//                     border: '1px solid #ddd',
//                     borderRadius: '4px',
//                     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//                     zIndex: 1000
//                 }}
//             >
//                 {filteredTags.map((tag) => (
//                     <div
//                         key={tag.id}
//                         onClick={() => {
//                             handleNewTagChange(productId, tag.name);
//                             setShowSuggestions(prev => ({ ...prev, [productId]: false }));
//                         }}
//                         style={{
//                             padding: '8px 12px',
//                             cursor: 'pointer',
//                             borderBottom: '1px solid #eee',
//                             ':hover': {
//                                 backgroundColor: '#f5f5f5'
//                             }
//                         }}
//                     >
//                         {tag.name}
//                     </div>
//                 ))}
//             </div>
//         );
//     };

//     // Render existing product tags
//     const renderProductTags = (product) => {
//         const tags = product.tags ? product.tags.split(', ').filter(Boolean) : [];

//         return (
//             <LegacyStack spacing="tight" wrap>
//                 {tags.map((tag) => (
//                     <Tag
//                         key={`${product.id}-${tag}`}
//                         onRemove={() => removeTag(product.id, tag)}
//                     >
//                         {tag}
//                     </Tag>
//                 ))}
//             </LegacyStack >
//         );
//     };

//     // Render tag input form
//     const renderAddTagForm = (product) => {
//         return (
//             <LegacyStack alignment="center" spacing="tight">
//                 <LegacyStack.Item fill>
//                     <div style={{ position: 'relative' }}>
//                         <TextField
//                             value={newTagInputs[product.id] || ''}
//                             onChange={(value) => handleNewTagChange(product.id, value)}
//                             placeholder="Enter new tag"
//                             disabled={loadingStates[product.id]}
//                             onFocus={() => setShowSuggestions(prev => ({ ...prev, [product.id]: true }))}
//                             onBlur={() => {
//                                 setTimeout(() => {
//                                     setShowSuggestions(prev => ({ ...prev, [product.id]: false }));
//                                 }, 200);
//                             }}
//                         />
//                         {renderSuggestions(product.id)}
//                     </div>
//                 </LegacyStack.Item>
//                 <Button
//                     onClick={() => addTag(product.id)}
//                     loading={loadingStates[product.id]}
//                     disabled={!newTagInputs[product.id]?.trim()}
//                 >
//                     Add
//                 </Button>
//             </LegacyStack >
//         );
//     };

//     // Loading state
//     if (loading) {
//         return (
//             <Page>
//                 <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
//                     <Spinner size="large" />
//                 </div>
//             </Page>
//         );
//     }

//     // Main render
//     return (
//         <Page fullWidth title="Products">
//             {error && (
//                 <Banner status="critical" onDismiss={() => setError(null)}>
//                     <p>{error}</p>
//                 </Banner>
//             )}

//             <Layout>
//                 <Layout.Section>
//                     <div style={{ marginTop: '1rem' }}>
//                         <TextField
//                             value={searchValue}
//                             onChange={setSearchValue}
//                             placeholder="Search products..."
//                             prefix={<SearchIcon />}
//                             clearButton
//                             onClearButtonClick={() => setSearchValue('')}
//                         />
//                     </div>

//                     <Grid>
//                         {products
//                             .filter(product =>
//                                 product.title.toLowerCase().includes(searchValue.toLowerCase()) ||
//                                 (product.tags || '').toLowerCase().includes(searchValue.toLowerCase())
//                             )
//                             .map((product) => (
//                                 <Grid.Cell
//                                     key={product.id}
//                                     columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3 }}
//                                 >
//                                     <LegacyCard sectioned>
//                                         <div style={{ marginBottom: '1rem' }}>
//                                             <img
//                                                 src={product.image?.src || '/placeholder-image.jpg'}
//                                                 alt={product.title}
//                                                 style={{
//                                                     width: '100%',
//                                                     height: '200px',
//                                                     objectFit: 'cover',
//                                                     marginBottom: '1rem'
//                                                 }}
//                                             />
//                                             <h2 style={{
//                                                 fontSize: '1.1rem',
//                                                 fontWeight: '600',
//                                                 marginBottom: '0.5rem'
//                                             }}>
//                                                 {product.title}
//                                             </h2>
//                                             <p style={{ color: '#637381' }}>
//                                                 ${parseFloat(product.variants[0]?.price || 0).toFixed(2)}
//                                             </p>
//                                         </div>

//                                         <div style={{ marginBottom: '1rem' }}>
//                                             {renderProductTags(product)}
//                                         </div>

//                                         {renderAddTagForm(product)}
//                                     </LegacyCard>
//                                 </Grid.Cell>
//                             ))}
//                     </Grid>
//                 </Layout.Section>
//             </Layout>

//             {isToastActive && (
//                 <Toast
//                     content={toastMessage}
//                     onDismiss={() => setIsToastActive(false)}
//                     duration={3000}
//                 />
//             )}
//         </Page>
//     );
// }

// export default ProductPage;


import React, { useEffect, useState } from 'react';
import {
    Page,
    Layout,
    LegacyCard,
    Grid,
    Spinner,
    Tag,
    Banner,
    Toast,
    TextField,
    LegacyStack,
    Button,
    Modal
} from '@shopify/polaris';
import SearchIcon from '@mui/icons-material/Search';

function ProductPage() {
    // Product and UI states
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchValue, setSearchValue] = useState('');

    // Tags management states
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [tagSearchValue, setTagSearchValue] = useState('');
    const [newTagValue, setNewTagValue] = useState('');
    const [isAddingTag, setIsAddingTag] = useState(false);

    // Toast state
    const [toastConfig, setToastConfig] = useState({
        active: false,
        message: '',
        error: false
    });

    // Initial data fetching
    useEffect(() => {
        fetchProducts();
        fetchAvailableTags();
    }, []);

    // Fetch products from Shopify
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

    // Fetch available tags from database
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

    // Toast helper function
    const showToast = (message, isError = false) => {
        setToastConfig({
            active: true,
            message,
            error: isError
        });
    };

    // Get current tags for a product
    const getProductTags = (product) => {
        return product.tags ? product.tags.split(', ').filter(Boolean) : [];
    };

    // Check if tag exists in product
    const isTagInProduct = (product, tagName) => {
        const currentTags = getProductTags(product);
        return currentTags.includes(tagName);
    };

    // Filter available tags based on search and current product tags
    const getFilteredTags = () => {
        if (!selectedProduct) return [];
        
        const searchTerm = tagSearchValue.toLowerCase();
        const currentTags = getProductTags(selectedProduct);
        
        return availableTags.filter(tag => 
            tag.name.toLowerCase().includes(searchTerm) &&
            !currentTags.includes(tag.name)
        );
    };

    // Add tag to product
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

    // Create and add new tag
    const createNewTag = async () => {
        if (!newTagValue.trim() || isAddingTag) return;
        setIsAddingTag(true);

        try {
            // First create the tag in database
            const createResponse = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTagValue.trim() })
            });

            if (!createResponse.ok) throw new Error('Failed to create tag');

            const newTag = await createResponse.json();
            setAvailableTags(prev => [...prev, newTag]);

            // Then add it to the product
            await addTagToProduct(newTagValue.trim());
            setNewTagValue('');
        } catch (error) {
            console.error('Error creating tag:', error);
            showToast('Failed to create tag', true);
        } finally {
            setIsAddingTag(false);
        }
    };

    // Remove tag from product
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

    // Render tags for a product
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

    // Tag management modal
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
                                        backgroundColor: 'white',
                                        ':hover': {
                                            backgroundColor: '#f5f5f5'
                                        }
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

    // Loading state
    if (loading) {
        return (
            <Page>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <Spinner size="large" />
                </div>
            </Page>
        );
    }

    // Main render
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

export default ProductPage;