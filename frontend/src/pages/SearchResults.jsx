import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import '../css/SearchResults.css'; // Ensure you have this CSS file for styling

const SearchResults = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query");
    const [results, setResults] = useState([]);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/items/search/`, {
                    params: { query },
                    withCredentials: true,
                });
                setResults(response.data);
            } catch (error) {
                console.error("Failed to fetch search results:", error.message);
            }
        };

        if (query) fetchResults();
    }, [query]);

    return (
        <div className="search-results-container">
            <aside className="filter-bar">
                <ul>
                    <li><a href="/settings">My Account</a></li>
                    <li><a href="/settings-help-support">Help and Support</a></li>
                </ul>
            </aside>


            <h2>Search Results for "{query}"</h2>
            <ul>
                {results.map((result, index) => (
                    <li key={index}>{result.title}</li>
                ))}
            </ul>
        </div>
    );
};



export default SearchResults;