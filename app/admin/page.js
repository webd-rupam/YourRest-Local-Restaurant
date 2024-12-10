"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase"; // Adjust the path if needed
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, addDoc, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FiMenu, FiTruck, FiUsers, FiSettings, FiPlus, FiEdit, FiTrash2, FiX } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { format } from "date-fns";

export default function Admin() {
  const [selectedSection, setSelectedSection] = useState("menu");
  const [newItem, setNewItem] = useState({ name: "", price: "", img: "" });
  const [editingItem, setEditingItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addingLoading, setAddingLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortCriteria, setSortCriteria] = useState("mostRecent");
  const router = useRouter();

  useEffect(() => {
    document.title = "YourRest - Admin Panel";
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      setLoading(true);
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists() && userDoc.data().role === "admin") {
            setIsAdmin(true);
            fetchMenuItems();
            fetchOrders();
          } else {
            router.push("/");
          }
        } else {
          router.push("/login");
        }
        setLoading(false);
      });
    };

    checkAdmin();
  }, [router]);

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "MenuImages");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dfnjq4nmv/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error(data.error?.message || "Image upload failed");
      }
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  };

  const fetchMenuItems = async () => {
    try {
      const collectionRef = collection(db, "AvailableMenu");
      const snapshot = await getDocs(collectionRef);
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuItems(items);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const handleAddItem = async () => {
    if (newItem.name && newItem.price && newItem.img) {
      try {
        setAddingLoading(true);
        const imageUrl = await uploadImageToCloudinary(newItem.img);
        if (imageUrl) {
          const collectionRef = collection(db, "AvailableMenu");
          await addDoc(collectionRef, { ...newItem, img: imageUrl });
          setNewItem({ name: "", price: "", img: "" });
          fetchMenuItems();
          toast.success('Item added successfully!', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "dark",
          });
          setTimeout(() => {
            window.location.reload(); // Reload after 3 seconds
          }, 3000);
        }
      } catch (error) {
        console.error("Error adding item:", error);
        toast.error('Error adding item!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
        setTimeout(() => {
          window.location.reload(); // Reload after 3 seconds
        }, 3000);
      } finally {
        setAddingLoading(false);
      }
    } else {
      alert("Please fill in all fields.");
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({ name: item.name, price: item.price, img: item.img });
  };


  const handleUpdateItem = async () => {
    if (editingItem && newItem.name && newItem.price) {
      try {
        setAddingLoading(true);
        let imageUrl = editingItem.img;

        if (newItem.img) {
          imageUrl = await uploadImageToCloudinary(newItem.img);
        }

        const docRef = doc(db, "AvailableMenu", editingItem.id);
        await updateDoc(docRef, { name: newItem.name, price: newItem.price, img: imageUrl });
        fetchMenuItems();
        setIsEditing(false);
        setNewItem({ name: "", price: "", img: "" });
        setEditingItem(null);
        toast.success('Item updated successfully!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
        setTimeout(() => {
          window.location.reload(); // Reload after 3 seconds
        }, 3000);
      } catch (error) {
        console.error("Error updating item:", error);
        toast.error('Error updating item!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
        setTimeout(() => {
          window.location.reload(); // Reload after 3 seconds
        }, 3000);
      } finally {
        setAddingLoading(false);
      }
    } else {
      alert("Please fill in all fields.");
    }
  };


  const deleteMenuItem = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const docRef = doc(db, "AvailableMenu", id);
        await deleteDoc(docRef);
        toast.success('Item deleted successfully!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
        fetchMenuItems();
      } catch (error) {
        console.error("Error deleting menu item:", error);
        toast.error('Error deleting item!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }
    }
  };


  const fetchOrders = async () => {
    try {
      const collectionRef = collection(db, "Orders");
      const snapshot = await getDocs(collectionRef);
      let orderList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Apply search filter only if the search query is not empty
      if (searchQuery && searchQuery.trim() !== "") {
        const lowercasedSearchQuery = searchQuery.toLowerCase(); // Convert the search query to lowercase

        orderList = orderList.filter((order) => {
          return (
            order.id.toLowerCase().includes(lowercasedSearchQuery) || // Make sure id is also in lowercase
            order.name.toLowerCase().includes(lowercasedSearchQuery) || // name is compared in lowercase
            order.price.toString().includes(lowercasedSearchQuery) || // price is compared as a string
            order.item.toLowerCase().includes(lowercasedSearchQuery) || // item is compared in lowercase
            order.createdTime.toLowerCase().includes(lowercasedSearchQuery) // item is compared in lowercase
          );
        });
      }

      // Apply sorting based on selected criteria
      switch (sortCriteria) {
        case "mostRecent":
          orderList.sort((a, b) => b.createdAt - a.createdAt);
          break;
        case "last":
          orderList.sort((a, b) => a.createdAt - b.createdAt);
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
          orderList.sort((a, b) => b.price - a.price);
          break;
        case "lowestPrice":
          orderList.sort((a, b) => a.price - b.price);
          break;
        case "cancelled":
          orderList = orderList.filter((order) => order.status === "Cancelled");
          break;
        default:
          break;
      }

      setOrders(orderList); // Update the state with the filtered and sorted orders
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchQuery, sortCriteria]);


  const updateOrderStatus = async (orderId, status) => {
    try {
      const docRef = doc(db, "Orders", orderId);
      await updateDoc(docRef, { status });
      fetchOrders();  // This will fetch the updated orders
      toast.success('Order status updated successfully!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error('Error updating order status!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-2 backdrop-blur-sm flex items-center justify-center z-50 min-h-screen">
        <div className="loader animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-80"></div>
      </div>
    );
  }

  if (!isAdmin) return null;


  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
        theme="dark"
      />

      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-gray-800 text-white flex flex-col transform transition-transform ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } xl:translate-x-0 fixed xl:relative top-0 left-0 bottom-0 z-20`}
        >
          <h2 className="text-2xl font-bold text-center py-6">Admin Panel</h2>
          <nav className="flex-grow mt-9">
            <button
              className={`py-3 px-4 w-full text-left hover:bg-gray-700 ${selectedSection === "menu" ? "bg-gray-700" : ""}`}
              onClick={() => setSelectedSection("menu")}
            >
              <FiMenu className="inline-block mr-2" /> Manage Menu
            </button>
            <button
              className={`py-3 px-4 w-full text-left hover:bg-gray-700 ${selectedSection === "deliveries" ? "bg-gray-700" : ""}`}
              onClick={() => setSelectedSection("deliveries")}
            >
              <FiTruck className="inline-block mr-2" /> Deliveries
            </button>
           
          </nav>
        </aside>

        {/* Hamburger Icon for mobile */}
        <button
  className="xl:hidden absolute top-[73px] left-4 z-30"
  onClick={() => setSidebarOpen(!sidebarOpen)}
>
  {sidebarOpen ? (
    <FiX className="text-2xl text-white" />
  ) : (
    <FiMenu className="text-2xl text-gray-800" />
  )}
</button>


        {/* Main Content */}
        <main className="flex-grow px-8 py-16 sm:px-12 md:px-16 lg:px-20 xl:px-32">
          {/* Menu Section */}
          {selectedSection === "menu" && (
            <section>
              <h1 className="text-4xl font-bold mb-8">Add/Manage Menu</h1>

              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">{isEditing ? "Edit Item" : "Add New Item"}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="py-3 px-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Price"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className="py-3 px-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="file"
                    onChange={(e) => setNewItem({ ...newItem, img: e.target.files[0] })}
                    className="py-3 px-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={isEditing ? handleUpdateItem : handleAddItem}
                  className="mt-4 bg-black text-white py-2 px-6 rounded-lg hover:bg-gray-800 flex items-center gap-2"
                  disabled={addingLoading}
                >
                  {addingLoading ? "Adding..." : isEditing ? "Update Item" : "Add Item"}
                </button>
              </div>

              <h2 className="text-2xl font-bold mb-4">Manage Items</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {menuItems.map((item) => (
                  <div key={item.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                    {editingItem?.id === item.id ? (
                      <div className="p-6">
                        <input
                          type="text"
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          className="py-2 px-4 border rounded-lg w-full mb-4"
                        />
                        <input
                          type="text"
                          value={newItem.price}
                          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                          className="py-2 px-4 border rounded-lg w-full mb-4"
                        />
                        <input
                          type="file"
                          onChange={(e) => setNewItem({ ...newItem, img: e.target.files[0] })}
                          className="py-3 px-4 border rounded-lg mb-4"
                        />
                        {newItem.img && typeof newItem.img === "string" && (
                          <img src={newItem.img} alt="Current Item" className="w-10 h-10 object-cover" />
                        )}
                        <button
                          disabled={addingLoading}
                          onClick={handleUpdateItem}
                          className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-5 disabled:cursor-not-allowed hover:bg-blue-600"
                        >
                          {addingLoading ? "Updating..." : "Update Item"}
                        </button>
                      </div>
                    ) : (
                      <div className="p-6">
                        <img src={item.img} alt={item.name} className="w-full h-40 object-cover mb-4" />
                        <h3 className="text-xl font-bold">{item.name}</h3>
                        <p className="text-gray-600">₹{item.price}</p>
                        <div className="flex gap-4 mt-4">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center gap-2"
                          >
                            <FiEdit /> Edit
                          </button>
                          <button
                            onClick={() => deleteMenuItem(item.id)}
                            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 flex items-center gap-2"
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Deliveries Section */}
          {selectedSection === "deliveries" && (
            <section>
              <h1 className="text-4xl font-bold mb-8">Manage Deliveries</h1>

              {/* Search bar */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search orders by ID, Item, Price, etc."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);  // Update search query
                  }}
                  className="py-2 px-4 border rounded-lg w-full sm:w-1/2"
                />
              </div>

              {/* Sorting options */}
              <div className="mb-6 flex gap-4">
                <select
                  onChange={(e) => {
                    setSortCriteria(e.target.value);
                    fetchOrders();  // Re-fetch orders when sorting criteria changes
                  }}
                  className="py-2 px-4 border rounded-lg"
                >
                  <option value="mostRecent">Most Recent</option>
                  <option value="last">Last</option>
                  <option value="delivered">Delivered</option>
                  <option value="pending">Pending</option>
                  <option value="inProgress">In Progress</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="highestPrice">Highest Price</option>
                  <option value="lowestPrice">Lowest Price</option>
                </select>
              </div>

              {/* Check if there are orders */}
              {orders.length === 0 ? (
                <div className="text-center text-gray-600 font-bold">
                  <p>No orders found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                      <div className="p-3">
                        <h3 className="text-sm font-bold mb-4 flex gap-2 justify-center items-center">
                          <p className="font-bold">Order-ID: </p>{order.id}
                        </h3>
                        <p className="text-gray-600 flex gap-1 mb-1"><span className="font-bold">Date: </span>{order.createdAt ? format(order.createdAt.toDate(), 'dd/MM/yyyy') : 'N/A'}</p>
                        <p className="text-gray-600 flex gap-1 mb-1">
                          <span className="font-bold">Time: </span>
                          {order.createdAt
                            ? format(order.createdAt.toDate(), 'hh:mm:ss a')  // 12-hour time format with AM/PM
                            : 'N/A'}
                        </p>


                        <p className="text-gray-600 flex gap-1 mb-1"><span className="font-bold">UserId: </span>{order.userId}</p>
                        <p className="text-gray-600 flex gap-1 mb-1"><span className="font-bold">Name: </span>{order.name}</p>
                        <p className="text-gray-600 flex gap-1 mb-1"><span className="font-bold">Phone: </span>{order.phone}</p>
                        <p className="text-gray-600 flex gap-1 mb-1"><span className="font-bold">Email: </span>{order.email}</p>
                        <p className="text-gray-600 flex gap-1 mb-1"><span className="font-bold">Item: </span>{order.item}</p>
                        <p className="text-gray-600 flex gap-1 mb-1"><span className="font-bold">Price: </span>₹{order.price}</p>
                        <p className="text-gray-600 flex gap-1 mb-1"><span className="font-bold">PaymentMethod: </span>{order.paymentMethod}</p>
                        <p className="text-gray-600 flex gap-1 mb-1"><span className="font-bold">Address: </span>{order.address}</p>

                        {/* Display the current order status */}
                        <p className="text-gray-600 flex gap-1 mb-1">
                          <span className="font-bold">Status: </span>
                          <span className={`font-bold ${order.status === 'In Progress' ? 'text-blue-500'
                            : order.status === 'Delivered' ? 'text-green-500'
                              : order.status === 'Cancelled' ? 'text-red-500'  // Red for Cancelled
                                : 'text-gray-600'}`}>
                            {order.status}
                          </span>
                        </p>



                        {order.status !== "Cancelled" && (
                          <div className="mt-4 flex space-x-2">
                            {order.status === "Pending" && (
                              <button
                                onClick={() => updateOrderStatus(order.id, "In Progress")}
                                className="py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                              >
                                Move to In Progress
                              </button>
                            )}
                            {order.status === "In Progress" && (
                              <button
                                onClick={() => updateOrderStatus(order.id, "Delivered")}
                                className="py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
                              >
                                Mark as Delivered
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                </div>
              )}
            </section>
          )}

        </main>
      </div>
    </>
  );
}
