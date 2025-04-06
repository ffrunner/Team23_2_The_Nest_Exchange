import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../css/CategoryPage.css';

const CategoryPage = () => {
  const { categoryName } = useParams(); // Get the category name from the URL
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState(''); // State for search input
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [categoryName]);

  const fetchItems = async () => {
    try {
      setError(null);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/items/filter/`, {
        params: { category_id: categoryName }, // Assuming categoryName is the category ID
      });
      setItems(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch items. Please try again.');
    }
  };

  const handleSearch = async () => {
    try {
      setError(null);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/items/search/`, {
        params: { keyword: searchKeyword },
      });
      setItems(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to search items. Please try again.');
    }
  };

  return (
    <div className="category-page">
      <h1>{categoryName.replace('-', ' ')} Items</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search items..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Items List */}
      {items.length > 0 ? (
        <ul className="items-list">
          {items.map((item, index) => (
            <li key={index} className="item-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No items available for this category.</p>
      )}
    </div>
  );
};

export default CategoryPage;