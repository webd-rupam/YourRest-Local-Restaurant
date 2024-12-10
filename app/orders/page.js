"use client";
import { useState, useEffect } from "react";
import { auth, db } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";

// Helper function to debounce search input
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function Orders() {
  const router = useRouter();
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");  // State for search query
  const [sortCriteria, setSortCriteria] = useState("mostRecent");  // State for sort criteria
  const [statusFilter, setStatusFilter] = useState("");  // State for status filter
  const [user, setUser] = useState(null);  // State for user data
  const debouncedSearchQuery = useDebounce(searchQuery, 500); // Delay for search query

  useEffect(() => {
    document.title = "YourRest - Your Orders";
  }, []);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);  // Save user data when authenticated
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch order history when the user is authenticated or when search, sort, or status filter changes
  useEffect(() => {
    if (user) {
      setLoading(true)
      fetchOrders();
      setLoading(false)
    }
  }, [user, debouncedSearchQuery, sortCriteria, statusFilter]); // Re-fetch when any filter or sort criteria changes

  // Fetch order history for the authenticated user
  const fetchOrders = async () => {
    try {
      const collectionRef = collection(db, "Orders");
      const snapshot = await getDocs(collectionRef);
      let orderList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Apply search filter only if the search query is not empty
      if (debouncedSearchQuery && debouncedSearchQuery.trim() !== "") {
        const lowercasedSearchQuery = debouncedSearchQuery.toLowerCase(); // Convert the search query to lowercase

        orderList = orderList.filter((order) => {
          return (
            order.id.toLowerCase().includes(lowercasedSearchQuery) || // Make sure id is also in lowercase
            order.name?.toLowerCase().includes(lowercasedSearchQuery) || // name is compared in lowercase
            order.price?.toString().includes(lowercasedSearchQuery) || // price is compared as a string
            order.item?.toLowerCase().includes(lowercasedSearchQuery) // item is compared in lowercase
          );
        });
      }

      // Apply status filter
      if (statusFilter) {
        orderList = orderList.filter((order) => order.status === statusFilter);
      }

      // Apply sorting based on selected criteria
      switch (sortCriteria) {
        case "mostRecent":
          orderList.sort((a, b) => b.createdAt - a.createdAt); // Most recent first
          break;
        case "last":
          orderList.sort((a, b) => a.createdAt - b.createdAt); // Oldest first
          break;
        case "delivered":
          orderList = orderList.filter((order) => order.status === "Delivered");
          break;
        case "pending":
          orderList = orderList.filter((order) => order.status === "Pending");
          break;
        case "inProgress":
          orderList = orderList.filter((order) => order.status === "In Progress");
          break;
        case "highestPrice":
          orderList.sort((a, b) => b.price - a.price); // Highest price first
          break;
        case "lowestPrice":
          orderList.sort((a, b) => a.price - b.price); // Lowest price first
          break;
        case "cancelled":
          orderList = orderList.filter((order) => order.status === "Cancelled");
          break;
        default:
          break;
      }

      setOrderHistory(orderList); // Update the state with the filtered and sorted orders
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  // Function to cancel an order
  const cancelOrder = async (orderId) => {
    try {
      const orderRef = doc(db, "Orders", orderId); // Reference to the specific order in Firestore
      await updateDoc(orderRef, { status: "Cancelled" }); // Update the order's status to 'Cancelled'

      // Optimistically update the UI
      setOrderHistory((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "Cancelled" } : order
        )
      );
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-2 backdrop-blur-sm flex items-center justify-center z-50 min-h-screen">
        <div className="loader animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-80"></div>
      </div>
    );
  }

  return (
    <section className="bg-gray-50 py-16 px-8 md:px-16 min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-center text-4xl font-bold text-gray-800 mb-4 -mt-4">
          My Orders
        </h1>
        <p className="text-center text-gray-600 text-lg mb-8">
          Track your past and current orders.
        </p>

        {/* Search Bar */}
        <div className="mb-4 text-center">
          <input
            type="text"
            placeholder="Search by Order ID, Item, Price..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}  // Update search query
            className="py-2 px-4 border rounded-lg w-full sm:w-1/2"
          />
        </div>

        {/* Sorting Options */}
        <div className="mb-8 text-center">
          <select
            onChange={(e) => setSortCriteria(e.target.value)}  // Update sort criteria
            className="py-2 px-4 border rounded-lg"
          >
            <option value="mostRecent">Most Recent</option>
            <option value="last">Oldest</option>
            <option value="highestPrice">Highest Price</option>
            <option value="lowestPrice">Lowest Price</option>
            <option value="delivered">Delivered</option>
            <option value="pending">Pending</option>
            <option value="inProgress">In Progress</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Order Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {orderHistory.map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-lg overflow-hidden transition transform hover:scale-105"
            >
              <img
                src={item.img}
                alt={item.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-md mb-2 text-gray-600"><span className="font-bold">Order ID: </span>{item.id}</h3>
                <p className="text-gray-600 text-sm"><span className="font-bold">Item:</span> {item.item}</p>
                <p className="text-gray-600 text-sm"><span className="font-bold">Price:</span> ₹{item.price}</p>
                <p className="text-gray-600 text-sm"><span className="font-bold">PaymentMethod: </span>{item.paymentMethod}</p>
                <p
                  className={`mt-2 text-lg font-bold ${item.status === "Delivered"
                      ? "text-green-600"
                      : item.status === "Pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                >
                  <span className="font-bold text-gray-600 text-sm">Status:</span> {item.status}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-bold">Date:</span> {new Date(item.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                {/* Cancel Button */}
                {(item.status === "In Progress" || item.status === "Pending") && item.status !== "Cancelled" && (
                  <button
                    onClick={() => cancelOrder(item.id)}
                    className="mt-4 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {orderHistory.length === 0 && (
          <p className="text-center text-gray-500 mt-8">
            You have no orders in your history.
          </p>
        )}
      </div>
    </section>
  );
}
