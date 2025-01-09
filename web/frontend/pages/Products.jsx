import React, { useEffect, useState, useCallback } from 'react';
import {
  Page,
  Layout,
  LegacyCard,
  Grid,
  Spinner,
  Combobox,
  ActionList,
  Tag as PolarisTag,
  Banner,
  Toast
} from '@shopify/polaris';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch'
import SearchIcon from '@mui/icons-material/Search';

function Products() {
  const fetch = useAuthenticatedFetch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productTags, setProductTags] = useState({});
  const [availableTags, setAvailableTags] = useState([]);
  const [searchValue, setSearchValue] = useState({});
  const [loadingTags, setLoadingTags] = useState({});
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastActive, setIsToastActive] = useState(false);


  // Fetch all products
  useEffect(() => {
    console.log('Products component mounted');
    fetchProducts();
    fetchAvailableTags();
  }, []);

  useEffect(() => {
    console.log('Current availableTags:', availableTags);
  }, [availableTags]);

  useEffect(() => {
    console.log('Current productTags:', productTags);
  }, [productTags]);

  const fetchAvailableTags = async () => {
    console.log('Fetching available tags...');
    try {
      const response = await fetch('/api/tags');
      console.log('Tags API response:', response);
      if (!response.ok) throw new Error('Failed to fetch tags');
      const tags = await response.json();
      console.log('Received tags:', tags);
      setAvailableTags(Array.isArray(tags) ? tags : []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setError('Failed to load available tags');
    }
  };

  const fetchProductTags = async (productId) => {
    setLoadingTags(prev => ({ ...prev, [productId]: true }));
    try {
      const response = await fetch(`admin/api/products/${productId}/tags`);
      if (!response.ok) throw new Error('Failed to fetch product tags');
      const tags = await response.json();
      setProductTags(prev => ({
        ...prev,
        [productId]: Array.isArray(tags) ? tags : []
      }));
    } catch (error) {
      console.error('Error fetching product tags:', error);
      showToast(`Failed to load tags for product`);
    } finally {
      setLoadingTags(prev => ({ ...prev, [productId]: false }));
    }
  };
  // In your Products.jsx
  const renderTagSelector = (productId) => {
    const currentTags = productTags[productId] || [];
    const filteredTags = availableTags.filter(tag =>
      !currentTags.some(pt => pt.id === tag.id) &&
      tag.name.toLowerCase().includes((searchValue[productId] || '').toLowerCase())
    );

    return (
      <Combobox
        activator={
          <Combobox.TextField
            prefix={<SearchIcon />}
            value={searchValue[productId] || ''}
            onChange={(value) => {
              console.log('Search value changed:', value);
              updateSearchText(productId, value);
            }}
            placeholder="Search and add tags"
          />
        }
        onSelect={(selected) => {
          console.log('Selected value in Combobox:', selected);
          const selectedTag = availableTags.find(tag => tag.name === selected);
          if (selectedTag) {
            addTagToProduct(productId, selectedTag.id);
          }
        }}
      >
        <ActionList
          items={
            filteredTags.length > 0
              ? filteredTags.map(tag => ({
                content: tag.name,
                onAction: () => {
                  console.log('Tag clicked:', tag);
                  addTagToProduct(productId, tag.id);
                }
              }))
              : [{ content: 'No tags found', disabled: true }]
          }
        />
      </Combobox>
    );
  };


  const addTagToProduct = async (productId, tagId) => {
    console.log('Starting to add tag. ProductId:', productId, 'TagId:', tagId);
    setLoadingTags(prev => ({ ...prev, [productId]: true }));

    try {
      const response = await fetch(`/admin/api/products/${productId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ tagId })
      });

      console.log('Add tag response:', response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add tag');
      }

      const updatedTags = await response.json();
      console.log('Updated tags received:', updatedTags);

      setProductTags(prev => ({
        ...prev,
        [productId]: updatedTags
      }));

      setSearchValue(prev => ({ ...prev, [productId]: '' }));
      showToast('Tag added successfully');

    } catch (error) {
      console.error('Error adding tag:', error);
      showToast(`Failed to add tag: ${error.message}`);
    } finally {
      setLoadingTags(prev => ({ ...prev, [productId]: false }));
    }
  };


  const removeTagFromProduct = async (productId, tagId) => {
    setLoadingTags(prev => ({ ...prev, [productId]: true }));
    try {
      const response = await fetch(`admin/api/products/${productId}/tags/${tagId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove tag');
      }

      await fetchProductTags(productId);
      showToast('Tag removed successfully');
    } catch (error) {
      console.error('Error removing tag:', error);
      showToast(`Failed to remove tag: ${error.message}`);
    } finally {
      setLoadingTags(prev => ({ ...prev, [productId]: false }));
    }
  };


  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const response = await fetch('/api/products/all');
      console.log('Products API response:', response);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      console.log('Received products:', data);
      setProducts(data.data || []);

      // Fetch tags for each product
      data.data.forEach(product => {
        console.log('Fetching tags for product:', product.id);
        fetchProductTags(product.id);
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSearchText = useCallback(
    (productId, value) => {
      setSearchValue(prev => ({ ...prev, [productId]: value }));
    },
    [],
  );

  const showToast = (message) => {
    setToastMessage(message);
    setIsToastActive(true);
  };

  const renderProductTags = (productId) => {
    const tags = productTags[productId] || [];
    return (
      <div className="gap-2 flex flex-wrap">
        {tags.map((tag) => (
          <PolarisTag
            key={tag.id}
            onRemove={() => removeTagFromProduct(productId, tag.id)}
          >
            {tag.name}
          </PolarisTag>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-64">
          <Spinner size="large" />
        </div>
      </Page>
    );
  }

  return (
    <Page fullWidth>
      {error && (
        <Banner status="critical">
          <p>{error}</p>
        </Banner>
      )}

      <Layout>
        <Layout.Section>
          <Grid>
            {products.map((product) => (
              <Grid.Cell
                key={product.id}
                columnSpan={{ xs: 6, sm: 6, md: 2, lg: 4, xl: 3 }}
              >
                <LegacyCard sectioned>
                  <div>
                    <img
                      src={product?.image?.src || '/placeholder-image.jpg'}
                      alt={product.title}
                      className="w-full h-48 object-cover mb-4"
                    />
                    <h2 className="text-lg font-semibold mb-2">{product.title}</h2>
                    <p className="text-base">

                      ${parseFloat(product.variants[0]?.price || 0).toFixed(2)}
                    </p>
                    <p>{product.tags}</p>
                  </div>

                  <div className="mt-4">
                    {loadingTags[product.id] ? (
                      <div className="flex justify-center">
                        <Spinner size="small" />
                      </div>
                    ) : (
                      <>
                        {renderProductTags(product.id)}
                        <div className="mt-2">
                          {renderTagSelector(product.id)}
                        </div>
                      </>
                    )}
                  </div>
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
          duration={4000}
        />
      )}
    </Page>
  );
}

export default Products;