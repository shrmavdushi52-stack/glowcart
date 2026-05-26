import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSkinType, setSelectedSkinType] = useState('All Skin Types');
  const [selectedConcern, setSelectedConcern] = useState('All Concerns');
  const [sortBy, setSortBy] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products from local backend on load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(false);
        setLoading(true);
        // Connects to your running Node.js server
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching data from server:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and Sort Logic
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCategory =
        selectedCategory === 'All Categories' || 
        product.category === selectedCategory;

      const matchesSkinType =
        selectedSkinType === 'All Skin Types' ||
        product.skinType.includes(selectedSkinType);

      const matchesConcern =
        selectedConcern === 'All Concerns' ||
        product.concern.includes(selectedConcern);

      return matchesSearch && matchesCategory && matchesSkinType && matchesConcern;
    })
    .sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Top Rated') return b.rating - a.rating;
      return new Date(b.createdAt) - new Date(a.createdAt); // Newest
    });

  const clearFilters = () => {
    setSelectedCategory('All Categories');
    setSelectedSkinType('All Skin Types');
    setSelectedConcern('All Concerns');
    setSortBy('Newest');
    setSearchQuery('');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Navbar / Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#ff4a83', margin: 0 }}>✨ GlowCart</h2>
        <input
          type="text"
          placeholder="Search products, brands, ingredients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '40%', padding: '10px', borderRadius: '20px', border: '1px solid #ddd' }}
        />
        <div>Hi, vidushi sharma 👋 <button style={{ marginLeft: '10px', cursor: 'pointer' }}>Logout</button></div>
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Sidebar Filters */}
        <div style={{ width: '250px', padding: '20px', border: '1px solid #f3f3f3', borderRadius: '12px', background: '#fff' }}>
          <h3>🔍 Filters</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>CATEGORY</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px' }}>
              {['All Categories', 'Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen', 'Mask', 'Essence', 'Exfoliator', 'Eye Cream'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>SKIN TYPE</label>
            <select value={selectedSkinType} onChange={(e) => setSelectedSkinType(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px' }}>
              {['All Skin Types', 'Dry', 'Oily', 'Combination', 'Sensitive', 'Normal'].map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>CONCERN</label>
            <select value={selectedConcern} onChange={(e) => setSelectedConcern(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px' }}>
              {['All Concerns', 'Acne', 'Aging', 'Brightening', 'Hydration', 'Pores', 'Dark Spots', 'Redness', 'Firmness'].map(con => <option key={con} value={con}>{con}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>SORT BY</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px' }}>
              {['Newest', 'Price: Low to High', 'Price: High to Low', 'Top Rated'].map(sort => <option key={sort} value={sort}>{sort}</option>)}
            </select>
          </div>

          <button onClick={clearFilters} style={{ width: '100%', padding: '10px', background: 'none', border: '1px solid #ff4a83', color: '#ff4a83', borderRadius: '6px', cursor: 'pointer' }}>Clear Filters</button>
        </div>

        {/* Product Display Main Section */}
        <div style={{ flex: 1 }}>
          <p style={{ color: '#666' }}>{filteredProducts.length} products found</p>

          {/* Loading View */}
          {loading && <p>Loading skincare gems...</p>}

          {/* Connection Error View */}
          {error && (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <span style={{ fontSize: '50px' }}>🔍</span>
              <h3 style={{ color: '#555', margin: '10px 0 5px' }}>No products found</h3>
              <p style={{ color: '#999', margin: 0 }}>Try checking if your backend server is running!</p>
            </div>
          )}

          {/* Active Product Grid */}
          {!loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {filteredProducts.map((product) => (
                <div key={product._id} style={{ border: '1px solid #eee', borderRadius: '10px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
                    <span style={{ fontSize: '12px', color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase' }}>{product.brand}</span>
                    <h4 style={{ margin: '5px 0', fontSize: '16px', color: '#333' }}>{product.name}</h4>
                    <p style={{ fontSize: '13px', color: '#777', height: '36px', overflow: 'hidden' }}>{product.description}</p>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#ff4a83', marginTop: '10px' }}>₹{product.price}</div>
                    <button style={{ width: '100%', marginTop: '10px', padding: '8px', background: '#ff4a83', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;