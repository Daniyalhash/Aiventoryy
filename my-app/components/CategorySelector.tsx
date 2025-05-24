import { useState, useEffect } from 'react';
import axios from 'axios';

const CategorySelector = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError("User ID is missing");
        return;
      }

      try {
        const response = await axios.get('https://seal-app-8m3g5.ondigitalocean.app/aiventory/get-categories/', {
          params: { user_id: userId },
        });

        console.log("API Response:", response.data); // Log the entire response for debugging

        if (response.status === 200) {
          setCategories(response.data.categories); // Set categories in state
        } else {
          setError(response.data.error || "Something went wrong");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Something went wrong. Please try again.");
      }
    };

    fetchCategories();
  }, []);

  // Handle category change
  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <div>
      {error && <p>{error}</p>}
      <select value={selectedCategory} onChange={handleCategoryChange}>
        <option value="">Select Category</option>
        {categories.map((category, index) => (
          <option key={index} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategorySelector;
