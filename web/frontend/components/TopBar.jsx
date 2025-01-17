import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Modal, TextContainer, TextField, Button } from '@shopify/polaris';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

export function TopBar() {
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [tagName, setTagName] = useState('');
    const [tags, setTags] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');


    const fetchTags = async () => {
        try {
            const response = await fetch('/api/tags');
            if (response.ok) {
                const data = await response.json();
                setTags(data);
            }
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleCreateTag = async () => {
        if (!tagName.trim()) return;

        try {
            const response = await fetch('/api/tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: tagName }),
            });

            if (response.ok) {
                setTagName('');
                fetchTags();
            }
        } catch (error) {
            console.error('Error creating tag:', error);
        }
    };

    const handleDeleteTag = async (tagId) => {
        try {
            const response = await fetch(`/api/tags/${tagId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchTags();
            }
        } catch (error) {
            console.error('Error deleting tag:', error);
        }
    };

    useEffect(() => {
        if (isTagModalOpen) {
            fetchTags();
        }
    }, [isTagModalOpen]);

    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const styles = {
        tagContainer: {
            marginTop: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
        },
        tag: {
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#f4f6f8',
            borderRadius: '16px',
            padding: '4px 12px',
            fontSize: '14px',
            color: '#333',
            cursor: 'pointer',
            border: '1px solid #ddd',
        },
        searchContainer: {
            position: 'relative',
            marginBottom: '20px',
        },
        searchInput: {
            width: '100%',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px',
        },
        createButton: {
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#5c6ac4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 12px',
            cursor: 'pointer',
        },
        deleteIcon: {
            marginLeft: '4px',
            cursor: 'pointer',
            padding: '2px',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
        }
    };

    return (
        <div className='topbar-section'>
            <div className="logo-block">
                <img className='logo' src="../assets/home-trophy.png" alt="Logo Image" />
                <NavLink to="/" className="text-bold text-medium">Sales</NavLink>
                {/* <NavLink to="/products" className="text-bold text-medium">Products</NavLink> */}
                <NavLink to="/productpage" className="text-bold text-medium">Product Page</NavLink>
                <button
                    onClick={() => setIsTagModalOpen(true)}
                    className="text-bold text-medium button-tag"
                >
                    <LocalOfferIcon /> Create Tag
                </button>
            </div>

            <Modal
                open={isTagModalOpen}
                onClose={() => setIsTagModalOpen(false)}
                title="Tags"
            >
                <Modal.Section>
                    <TextContainer>
                        <h3>Add keyword tags to categorize your content.</h3>

                        <div style={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Search tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={styles.searchInput}
                            />
                            <button
                                style={styles.createButton}
                                onClick={() => {
                                    setTagName(searchQuery);
                                    handleCreateTag();
                                }}
                            >
                                + CREATE TAG
                            </button>
                        </div>

                        <div style={styles.tagContainer}>
                            {filteredTags.map((tag) => (
                                <div key={tag.id} style={styles.tag}>
                                    {tag.name}
                                    <CloseIcon
                                        style={styles.deleteIcon}
                                        onClick={() => handleDeleteTag(tag.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </TextContainer>
                </Modal.Section>
            </Modal>
        </div>
    );
}