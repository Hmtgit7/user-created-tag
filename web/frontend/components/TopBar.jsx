// import React from 'react'
// import { NavLink } from 'react-router-dom'

// export function TopBar() {
//     return (
//         <div className='topbar-section'>
//             <div className="logo-block">
//                 <img className='logo' src="../assets/home-trophy.png" alt="logo image" />
//                 <h1 className='text-bold h4'>Shop Dashboard</h1>
//                 <NavLink to="/"> Sales </NavLink>
//                 <NavLink to="/products"> Products </NavLink>
//             </div>
//         </div>
//     )
// }

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Modal, TextContainer, TextField, Button } from '@shopify/polaris';
import { useAuthenticatedFetch } from '@shopify/app-bridge-react';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

export function TopBar() {
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [tagName, setTagName] = useState('');
    const fetch = useAuthenticatedFetch();

    const handleCreateTag = async () => {
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
                setIsTagModalOpen(false);
            }
        } catch (error) {
            console.error('Error creating tag:', error);
        }
    };

    return (
        <div className='topbar-section'>
            <div className="logo-block">
                <img className='logo' src="../assets/home-trophy.png" alt="Logo Image" />
                <NavLink to="/" className="text-bold text-medium">Sales</NavLink>
                <NavLink to="/products" className="text-bold text-medium">Products</NavLink>
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
                title="Create New Tag"
            >
                <Modal.Section>
                    <TextContainer>
                        <TextField
                            label="Tag Name"
                            value={tagName}
                            onChange={setTagName}
                            autoComplete="off"
                        />
                        <div style={{ marginTop: '1rem' }}>
                            <Button primary onClick={handleCreateTag}>Create Tag</Button>
                        </div>
                    </TextContainer>
                </Modal.Section>
            </Modal>
        </div>
    );
}