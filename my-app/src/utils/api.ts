import axios from 'axios';
// `${process.env.NEXT_PUBLIC_API_URL}/aiventory/login/`
// Base API instance
const api = axios.create({
  baseURL: 'https://seal-app-8m3g5.ondigitalocean.app/aiventory/',
  timeout: 15000,  // Increase to 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetch Total Products API
export const fetchTotalProducts = async (userId: string | null) => {
  if (!userId) throw new Error('User ID is required');

  try {
    const response = await api.get('/get-total-products/', { params: { user_id: userId } });
    return response.data; // Return data directly
  } catch (error) {
    console.error("Error fetching total products:", error);
    throw error;
  }
};

export const fetchbestDemand = async (queryKey: [string, string]): Promise<any> => {
  const [, userId] = queryKey;
  const response = await api.get('/bestSales/', { params: { user_id: userId } });
  return response.data;
};

export const fetchSales = async (queryKey: [string, string]): Promise<any> => {
  const [, userId] = queryKey;
  const response = await api.get('/get_monthly_sales/', { params: { user_id: userId } });
  return response.data;
};







// Fetch Dashboard Visuals (Benchmark Data)
export const fetchDashboardVisuals = async (userId: string | null) => {
  if (!userId) throw new Error('User ID is required');

  try {
    const response = await api.get('/get-dashbaord-visuals/', { params: { user_id: userId } });
    return response.data.benchmarks; // Return benchmarks directly
  } catch (error) {
    

        console.error("Unknown error", error);
    throw error;
  }
};
export const fetchStockData = async (userId: string | null) => {
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
   

     console.error("Unknown error", error);
    throw error;

  }
};



//fetch categories for productbenchmarkselection
export const fetchCategories = async (userId: string | null) => {
  if (!userId) throw new Error("User ID is required");
  try {
    const response = await api.get('https://seal-app-8m3g5.ondigitalocean.app/aiventory/get-categories/', { params: { user_id: userId } });
    return response.data;
  } catch (error) {


 console.error("Failed to fetch categories of Product", error);
    throw error;
  }

};

//fetch categories for productbenchmarkselection
export const fetchAvailableMonths = async (userId: string | null) => {
  if (!userId) throw new Error("User ID is required");
  try {
    const response = await api.get('https://seal-app-8m3g5.ondigitalocean.app/aiventory/last-sales-month/', { params: { user_id: userId } });
    return response.data;
  } catch (error) {



      console.error("Failed to fetch months of Product", error);
    throw error;
  }

};
//fetch categories for productbenchmarkselection
export const fetchProductsByCategory = async (userId: string | null, category: string) => {
  if (!userId) throw new Error("User ID is required");
  try {
    const response = await api.get('https://seal-app-8m3g5.ondigitalocean.app/aiventory/get-top-products-by-category/', { params: { user_id: userId, category: category } });
    return response.data.products || []; // Ensure empty array if products is not available
  } catch (error) {
    console.error("Failed to fetch categories of Product", error);
    throw error;
  }

};
// You can add more API functions here...
// Fetch stock data
export const fetchStockNoti = async (userId: string | null) => {
  if (!userId) return null;

  try {
    const response = await axios.get(`https://seal-app-8m3g5.ondigitalocean.app/aiventory/check_stock_levels/`, {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching stock data:", error);
    return null;
  }
};

// Fetch notifications
export const fetchNotifications = async (userId: string | null) => {
  if (!userId) return [];

  try {
    const response = await axios.get(`https://seal-app-8m3g5.ondigitalocean.app/aiventory/get_notifications/`, {
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
export const deleteNotifications = async (userId: string, notificationIds: string[]) => {
  try {
    await axios.delete(`https://seal-app-8m3g5.ondigitalocean.app/aiventory/delete_notifications/`, {
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
export const markNotificationAsRead = async (userId: string, notificationId: string) => {
  try {
    await axios.patch(`https://seal-app-8m3g5.ondigitalocean.app/aiventory/mark_notification_as_read/`, {
      user_id: userId,
      notification_id: notificationId
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};