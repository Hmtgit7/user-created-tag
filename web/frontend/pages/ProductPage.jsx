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
    LegacyStack ,
    Button
} from '@shopify/polaris';
import { SearchIcon } from '@shopify/polaris-icons';

function ProductPage() {
    // State declarations
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [isToastActive, setIsToastActive] = useState(false);
    const [newTagInputs, setNewTagInputs] = useState({});
    const [searchValue, setSearchValue] = useState('');
    const [loadingStates, setLoadingStates] = useState({});
    const [customTags, setCustomTags] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState({});

    // Initial data fetching
    useEffect(() => {
        fetchProducts();
        fetchTags();
    }, []);

    // Fetch products
    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/proxy/products.json');
            if (!response.ok) throw new Error('Failed to fetch products');

            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    // Fetch tags from PostgreSQL
    const fetchTags = async () => {
        try {
            const response = await fetch('/api/tags');
            if (!response.ok) throw new Error('Failed to fetch tags');
            const tags = await response.json();
            setCustomTags(tags);
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    // Toast message handler
    const showToast = (message) => {
        setToastMessage(message);
        setIsToastActive(true);
    };

    // Tag input change handler
    const handleNewTagChange = (productId, value) => {
        setNewTagInputs(prev => ({
            ...prev,
            [productId]: value
        }));
    };

    // Add tag to product
    const addTag = async (productId) => {
        const newTag = newTagInputs[productId]?.trim();
        if (!newTag) return;

        setLoadingStates(prev => ({ ...prev, [productId]: true }));

        try {
            const product = products.find(p => p.id === productId);
            const currentTags = product.tags ? product.tags.split(', ').filter(Boolean) : [];

            if (currentTags.includes(newTag)) {
                showToast('Tag already exists');
                return;
            }

            const newTags = [...currentTags, newTag].join(', ');

            const response = await fetch(`/api/proxy/products/${productId}.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product: {
                        id: productId,
                        tags: newTags
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to add tag');

            const { product: updatedProduct } = await response.json();

            setProducts(prev => prev.map(p =>
                p.id === productId ? updatedProduct : p
            ));

            setNewTagInputs(prev => ({
                ...prev,
                [productId]: ''
            }));

            showToast('Tag added successfully');
        } catch (error) {
            console.error('Error adding tag:', error);
            setError('Failed to add tag');
        } finally {
            setLoadingStates(prev => ({ ...prev, [productId]: false }));
        }
    };

    // Remove tag from product
    const removeTag = async (productId, tagToRemove) => {
        setLoadingStates(prev => ({ ...prev, [productId]: true }));

        try {
            const product = products.find(p => p.id === productId);
            const currentTags = product.tags ? product.tags.split(', ').filter(Boolean) : [];
            const newTags = currentTags.filter(tag => tag !== tagToRemove).join(', ');

            const response = await fetch(`/api/proxy/products/${productId}.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product: {
                        id: productId,
                        tags: newTags
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to remove tag');

            const { product: updatedProduct } = await response.json();

            setProducts(prev => prev.map(p =>
                p.id === productId ? updatedProduct : p
            ));

            showToast('Tag removed successfully');
        } catch (error) {
            console.error('Error removing tag:', error);
            setError('Failed to remove tag');
        } finally {
            setLoadingStates(prev => ({ ...prev, [productId]: false }));
        }
    };

    // Render tag suggestions dropdown
    const renderSuggestions = (productId) => {
        if (!showSuggestions[productId]) return null;
        
        const inputValue = (newTagInputs[productId] || '').toLowerCase();
        const filteredTags = customTags
            .filter(tag => tag.name.toLowerCase().includes(inputValue))
            .slice(0, 5);

        if (filteredTags.length === 0) return null;

        return (
            <div 
                style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 1000
                }}
            >
                {filteredTags.map((tag) => (
                    <div
                        key={tag.id}
                        onClick={() => {
                            handleNewTagChange(productId, tag.name);
                            setShowSuggestions(prev => ({...prev, [productId]: false}));
                        }}
                        style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee',
                            ':hover': {
                                backgroundColor: '#f5f5f5'
                            }
                        }}
                    >
                        {tag.name}
                    </div>
                ))}
            </div>
        );
    };

    // Render existing product tags
    const renderProductTags = (product) => {
        const tags = product.tags ? product.tags.split(', ').filter(Boolean) : [];

        return (
            <LegacyStack  spacing="tight" wrap>
                {tags.map((tag) => (
                    <Tag
                        key={`${product.id}-${tag}`}
                        onRemove={() => removeTag(product.id, tag)}
                    >
                        {tag}
                    </Tag>
                ))}
            </LegacyStack >
        );
    };

    // Render tag input form
    const renderAddTagForm = (product) => {
        return (
            <LegacyStack  alignment="center" spacing="tight">
                <LegacyStack .Item fill>
                    <div style={{ position: 'relative' }}>
                        <TextField
                            value={newTagInputs[product.id] || ''}
                            onChange={(value) => handleNewTagChange(product.id, value)}
                            placeholder="Enter new tag"
                            disabled={loadingStates[product.id]}
                            onFocus={() => setShowSuggestions(prev => ({...prev, [product.id]: true}))}
                            onBlur={() => {
                                setTimeout(() => {
                                    setShowSuggestions(prev => ({...prev, [product.id]: false}));
                                }, 200);
                            }}
                        />
                        {renderSuggestions(product.id)}
                    </div>
                </LegacyStack .Item>
                <Button
                    onClick={() => addTag(product.id)}
                    loading={loadingStates[product.id]}
                    disabled={!newTagInputs[product.id]?.trim()}
                >
                    Add
                </Button>
            </LegacyStack >
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
            {error && (
                <Banner status="critical" onDismiss={() => setError(null)}>
                    <p>{error}</p>
                </Banner>
            )}

            <Layout>
                <Layout.Section>
                    <div style={{ marginTop: '1rem' }}>
                        <TextField
                            value={searchValue}
                            onChange={setSearchValue}
                            placeholder="Search products..."
                            prefix={<SearchIcon source={SearchIcon} />}
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

                                        {renderAddTagForm(product)}
                                    </LegacyCard>
                                </Grid.Cell>
                            ))}
                    </Grid>
                </Layout.Section>
            </Layout>

            {isToastActive && (
                <Toast
                    content={toastMessage}
                    onDismiss={() => setIsToastActive(false)}
                    duration={3000}
                />
            )}
        </Page>
    );
}

export default ProductPage;