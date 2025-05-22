import axios from 'axios';

// Base API instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/aiventory/',
  timeout: 15000,  // Increase to 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetch Total Products API
export const fetchTotalProducts = async (userId) => {
  if (!userId) throw new Error('User ID is required');

  try {
    const response = await api.get('/get-total-products/', { params: { user_id: userId } });
    return response.data; // Return data directly
  } catch (error) {
    console.error("Error fetching total products:", error);
    throw error;
  }
};

export const fetchbestDemand = async ([_unused, userId]) => {
  const response = await api.get('/bestSales/', { params: { user_id: userId } });
  return response.data;
};

export const fetchSales = async ([_unused, userId]) => {
  const response = await api.get('/get_monthly_sales/', { params: { user_id: userId } });
  return response.data;
};








// Fetch Dashboard Visuals (Benchmark Data)
export const fetchDashboardVisuals =async (userId) => {
  if (!userId) throw new Error('User ID is required');

  try {
    const response = await api.get('/get-dashbaord-visuals/', { params: { user_id: userId } });
    return response.data.benchmarks; // Return benchmarks directly
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch dashboard visuals");
  }
};
export const fetchStockData = async (userId: string) => {
  if (!userId) {
    console.error("User ID is missing");
    return null;
  }

  console.log("Fetching stock data for userId:", userId);

  try {
    const response = await api.get('/get-stock-levels/', { 
      params: { user_id: userId } 
    });

    console.log("Full API Response:", response.data); 

    if (!response.data || Object.keys(response.data).length === 0) {
      console.warn("API returned empty data");
      return [];
    }

    const { benchmarks, out_of_stock, low_stock, healthy_stock } = response.data;

    return benchmarks || [{ name: "Out of Stock", value: out_of_stock }, { name: "Low Stock", value: low_stock }, { name: "Healthy Stock", value: healthy_stock }];
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return [];
  }
};



//fetch categories for productbenchmarkselection
export const fetchCategories = async(userId) =>{
  if (!userId) throw new Error("User ID is required");
  try{
    const response = await api.get('http://127.0.0.1:8000/aiventory/get-categories/',{params : { user_id : userId }});
    return response.data;
  }catch(error){
    throw new Error(error.response?.data?.message || "Failed to fetch categories of Product");

  }

}; 

//fetch categories for productbenchmarkselection
export const fetchAvailableMonths = async(userId) =>{
  if (!userId) throw new Error("User ID is required");
  try{
    const response = await api.get('http://127.0.0.1:8000/aiventory/last-sales-month/',{params : { user_id : userId }});
    return response.data;
  }catch(error){
    throw new Error(error.response?.data?.message || "Failed to fetch months of Product");

  }

}; 
//fetch categories for productbenchmarkselection
export const fetchProductsByCategory = async (userId, category) => {
  if (!userId) throw new Error("User ID is required");
  try{
    const response = await api.get('http://127.0.0.1:8000/aiventory/get-top-products-by-category/',{        params: { user_id: userId, category: category }});
    return response.data.products || []; // Ensure empty array if products is not available
  }catch(error){
    throw new Error(error.response?.data?.message || "Failed to fetch categories of Product");

  }

}; 
// You can add more API functions here...
// Fetch stock data
export const fetchStockNoti = async (userId) => {
  if (!userId) return null;
  
  try {
    const response = await axios.get(`http://127.0.0.1:8000/aiventory/check_stock_levels/`, {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return null;
  }
};

// Fetch notifications
export const fetchNotifications = async (userId) => {
  if (!userId) return [];
  
  try {
    const response = await axios.get(`http://127.0.0.1:8000/aiventory/get_notifications/`, {
      params: { user_id: userId }
    });
    console.log("Fetched notifications:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

// Delete notifications
export const deleteNotifications = async (userId, notificationIds: string[]) => {
  try {
    await axios.delete(`http://127.0.0.1:8000/aiventory/delete_notifications/`, {
      data: {
        user_id: userId,
        notification_ids: notificationIds
      }
    });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    await axios.patch(`http://127.0.0.1:8000/aiventory/mark_notification_as_read/`, {
      user_id: userId,
      notification_id: notificationId
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};