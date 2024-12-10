"use client";
import { useState, useEffect, useRef } from "react";
import { FiShoppingCart, FiSearch } from "react-icons/fi";
import { gsap } from "gsap";
import { auth, db } from '../firebase';
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, getDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Script from "next/script";

export default function Menu() {
  const menuItemsRef = useRef([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderModal, setOrderModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState({ name: '', address: '', phone: '' });
  const [selectedItem, setSelectedItem] = useState(null); // Store the selected menu item for the order
  const [userAddress, setUserAddress] = useState(''); // Store the user's address
  const [userName, setUserName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const router = useRouter();

  useEffect(() => {
    document.title = "YourRest - Menu";
  }, []);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
      } else {
        fetchMenuItems();
        fetchUserDetails(user.uid); // Fetch user details from Firestore
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const collectionRef = collection(db, "AvailableMenu");
      const snapshot = await getDocs(collectionRef);
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuItems(items);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUserName(userData.displayName || '');
        setUserAddress(userData.address || ''); // Set default address if available
        setOrderDetails((prevState) => ({
          ...prevState,
          name: userData.displayName || '',
          address: userData.address || '' // Set the default value for the address
        }));
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const validRefs = menuItemsRef.current.filter((el) => el !== null);
    gsap.fromTo(
      validRefs,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.2,
      }
    );
  }, [filteredItems]);

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails((prevState) => ({ ...prevState, [name]: value }));
  };

    // Handle payment method change
    const handlePaymentMethodChange = (method) => {
      setPaymentMethod(method);
    };

  // Handle order submission
  const handleOrderSubmit = async () => {
    const user = auth.currentUser;
  
    if (!user || !orderDetails.name || !orderDetails.address || !orderDetails.phone) {
      toast.error('Please fill all the details!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return;
    }
  
    // Check if payment method is Razorpay and handle it accordingly
    if (paymentMethod === 'OnlinePayment') {
      try {
        const currentDate = new Date();
        const createdAt = currentDate;
        const createdTime = currentDate.toLocaleTimeString();
  
        // Initialize Razorpay payment gateway
        const res = await fetch("/api/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Ensure this header is included
          },
          body: JSON.stringify({
            amount: selectedItem.price * 100,
          }),
        });
  
        if (!res.ok) {
          console.error("Payment API Error:", res.statusText);
          throw new Error("Failed to fetch payment data.");
        }
  
        const data = await res.json();
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Replace with your Razorpay key
          amount: data.amount, // Amount in paise
          currency: data.currency,
          name: "Food Order",
          description: selectedItem.name,
          order_id: data.id,
          handler: function (response) {
            // Order document creation happens after successful payment
            createOrderDocument(response);
          },
          prefill: {
            name: orderDetails.name,
            email: user.email,
            contact: orderDetails.phone,
          },
          theme: {
            color: "#000000",
          },
          // This will be called when payment is canceled
          modal: {
            ondismiss: function () {
              console.log("Payment was canceled by the user");
              toast.info('Payment was canceled.', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
              });
              setOrderModal(false); // Close the modal if payment is canceled
            }
          }
        };
  
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (error) {
        console.error("Error initiating Razorpay payment:", error);
        toast.error('Failed to initiate payment!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }
    } else {
      // Create order document immediately for COD
      createOrderDocument();
    }
  
    setOrderModal(false);
  };

  const createOrderDocument = async (paymentResponse = null) => {
    const user = auth.currentUser;
  
    try {
      const currentDate = new Date();
      const createdAt = currentDate;
      const createdTime = currentDate.toLocaleTimeString();
  
      // Only create an order document if paymentResponse exists for Razorpay
      const orderData = {
        userId: user.uid,
        item: selectedItem.name,
        price: selectedItem.price,
        name: orderDetails.name,
        address: orderDetails.address,
        phone: orderDetails.phone,
        status: 'Pending', // Initial status for both payment methods
        createdAt: createdAt,
        createdTime: createdTime,
        email: user.email,
        img: selectedItem.img,
        paymentMethod: paymentMethod,
      };
  
      // Create the order document in Firestore
      await addDoc(collection(db, "Orders"), orderData);
  
      toast.success('Order placed successfully!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error('Failed to place order!', {
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

  // Open the order modal
  const openOrderModal = (item) => {
    setSelectedItem(item);
    setOrderModal(true);
  };

  // Close the order modal
  const closeOrderModal = () => {
    setOrderModal(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-2 backdrop-blur-sm flex items-center justify-center z-50 min-h-screen">
        <div className="loader animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-80"></div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

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

      <section className="bg-white py-16 px-8 md:px-16 -mt-8">
        <div className="container mx-auto">
          <h1 className="text-center text-4xl font-bold text-gray-800 mb-5">
            Available Menu
          </h1>
          <p className="text-center text-gray-600 text-lg mb-10">
            Explore our delicious food menu. Freshly made just for you!
          </p>

          {/* Search Bar */}
          <div className="mb-12 flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                className="w-full py-3 px-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FiSearch
                size={20}
                className="absolute top-3 right-4 text-gray-400"
              />
            </div>
          </div>

          {/* Menu Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <div
                key={index}
                ref={(el) => (menuItemsRef.current[index] = el)}
                className="bg-white shadow-md rounded-lg overflow-hidden transition transform hover:scale-105"
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 text-lg">₹{item.price}</p>
                  <button
                    onClick={() => openOrderModal(item)}
                    className="mt-4 flex items-center justify-center gap-2 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
                  >
                    Order Now <FiShoppingCart />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <p className="text-center text-gray-500 mt-8">
              No menu items match your search.
            </p>
          )}
        </div>
      </section>

      {/* Order Modal */}
      {orderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Details</h2>
            <div>
              <label className="block text-gray-600 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={orderDetails.name}
                onChange={handleInputChange}
                className="w-full py-3 px-4 border rounded-lg mb-4"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={orderDetails.address}
                onChange={handleInputChange}
                className="w-full py-3 px-4 border rounded-lg mb-4"
                placeholder="Enter your address"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={orderDetails.phone}
                onChange={handleInputChange}
                className="w-full py-3 px-4 border rounded-lg mb-6"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Payment Method Options */}
            <div className="mb-4">
              <label className="block text-gray-600 mb-2">Payment Method</label>
              <div className="flex gap-4">
                <button
                  onClick={() => handlePaymentMethodChange('COD')}
                  className={`py-2 px-4 border rounded-lg ${paymentMethod === 'COD' ? 'bg-green-300' : ''}`}
                >
                  Cash on Delivery
                </button>
                <button
                  onClick={() => handlePaymentMethodChange('OnlinePayment')}
                  className={`py-2 px-4 border rounded-lg ${paymentMethod === 'OnlinePayment' ? 'bg-green-300' : ''}`}
                >
                  UPI/Card/Netbanking
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={closeOrderModal}
                className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleOrderSubmit}
                className="py-2 px-4 bg-black text-white rounded-lg hover:bg-slate-900"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
