"use client"
import { useRef, useEffect, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { gsap } from "gsap";
import { auth, db, storage } from '../firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 
import { uploadBytesResumable, ref, getDownloadURL } from "firebase/storage";
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Profile() {
  const router = useRouter();
  const profileRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState(null);

  useEffect(() => {
    document.title = "YourRest - Profile";
  }, []);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Redirect to home after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        await fetchUser(currentUser.uid); // Fetch user data when authenticated
      } else {
        setUser(null); // Reset user data if not authenticated
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const fetchUser = async (uid) => {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      setLoading(true);
      const userData = userDoc.data();
      setUser({
        uid,
        email: userData.email,
        displayName: userData.displayName,
        createdAt: userData.createdAt,
        address: userData.address,
        profilePic: userData.profilePic,
      });
      setNewName(userData.displayName); // Initialize the new name with the current name
      setNewAddress(userData.address || ''); // Initialize the new address
      setLoading(false);
    } else {
      setUser(null);
      setLoading(false);
    }
  };

  // GSAP Animation for profile section
  useEffect(() => {
    gsap.fromTo(
      profileRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
      }
    );
  }, []);

  const handleEditName = () => {
    setIsEditingName(true);
  };

  const handleEditAddress = () => {
    setIsEditingAddress(true);
  };

  // Track if any of the profile fields have changed
  const isProfileChanged = () => {
    // Make sure user is not null
    if (!user) return false;
  
    return newName !== user.displayName || newAddress !== user.address || newProfilePic !== null;
  };

  const handleSaveChanges = async () => {
    try {
      setSaveLoading(true);
      const userDocRef = doc(db, "users", user.uid);
  
      let profilePicUrl = user.profilePic; // Keep the old profile picture by default

      if (newProfilePic) {
        const formData = new FormData();
        formData.append("file", newProfilePic); // The file you're uploading
        formData.append("upload_preset", "profilePicture"); // Your Cloudinary upload preset
        formData.append("cloud_name", "dfnjq4nmv"); // Your Cloudinary cloud name
  
        console.log("Uploading image to Cloudinary...");
        console.log("Form data:", formData); // Debugging: log the form data
  
        const response = await fetch("https://api.cloudinary.com/v1_1/dfnjq4nmv/image/upload", {
          method: "POST",
          body: formData, // Sending the form data to Cloudinary
        });
  
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
  
        const data = await response.json();
        console.log("Cloudinary upload response:", data); // Debugging the response
  
        if (data.secure_url) {
          profilePicUrl = data.secure_url; // Cloudinary URL
          console.log("Profile Picture URL:", profilePicUrl); // Debugging
        } else {
          throw new Error("Cloudinary upload failed");
        }
      }
  
  
      // Now update the Firestore document with the new data
      await updateDoc(userDocRef, {
        displayName: newName,
        address: newAddress,
        profilePic: profilePicUrl, // Set the new profile pic URL in Firestore
      });
  
      setIsEditingName(false);
      setIsEditingAddress(false);
  
      toast.success('Changes applied successfully!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
  
      setTimeout(() => {
        window.location.reload(); // Reload the page to reflect changes
      }, 2000);
  
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error('Error applying your changes!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } finally {
      setSaveLoading(false);
    }
  };

 // Handle Profile Picture Change
const handleProfilePicChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setNewProfilePic(file); // Ensure this is setting the file correctly
    console.log("Selected file:", file); // Debug: Check the file
  }
}


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

      {loading && 
        <div className="fixed inset-0 bg-black bg-opacity-1 backdrop-blur-sm flex items-center justify-center z-50 min-h-screen">
          <div className="loader animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-80"></div>
        </div>
      }

      <section ref={profileRef} className="mx-auto py-16 px-8 bg-gray-50 md:min-h-[92vh] min-h-[94vh] text-center md:text-left" style={{ width: "100%" }}>
        {/* Profile Header */}
        {user ? (
          <div className="flex flex-col md:flex-row items-center md:space-x-12 bg-white p-8 shadow-lg rounded-lg">
            <div className="relative w-32 h-32 md:w-48 md:h-40">
              <img src={user.profilePic || "/nullPic.png"} alt="Profile Picture" className="rounded-full w-full h-full object-cover aspect-square shadow-md" />
              <label htmlFor="profilePicInput" className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-500">
                <FiEdit2 size={18} />
              </label>
              <input type="file" id="profilePicInput" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
            </div>

            {/* User Info */}
            <div className="mt-8 md:mt-0 space-y-6 w-full">
              {/* Name */}
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <label className="block text-sm text-gray-500">Name</label>
                  {isEditingName ? (
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="text-2xl md:text-4xl font-bold text-gray-800 border-b-2 border-gray-300 focus:outline-none"
                    />
                  ) : (
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-800">{user.displayName}</h1>
                  )}
                </div>
                <button onClick={handleEditName} className="text-gray-500 cursor-pointer">
                  <FiEdit2 size={20} />
                </button>
              </div>

                 {/* Email */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <label className="block text-sm text-gray-500">Email</label>
            <p className="text-lg text-gray-700">{user.email}</p>
          </div>
        </div>

              {/* Address */}
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <label className="block text-sm text-gray-500">Address</label>
                  {isEditingAddress ? (
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="text-lg text-gray-700 border-b-2 border-gray-300 focus:outline-none"
                    />
                  ) : (
                    <p className="text-lg text-gray-700">{user.address || "SET YOUR ADDRESS!"}</p>
                  )}
                </div>
                <button onClick={handleEditAddress} className="text-gray-500 cursor-pointer">
                  <FiEdit2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p>No profile data available. Please check back later.</p>
        )}

        {/* Save Changes Button */}
        {isProfileChanged() && (
          <div className="mt-12 text-center">
            <button onClick={handleSaveChanges} disabled={saveLoading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md disabled:cursor-not-allowed">
              {saveLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* Logout Button */}
        <div className="mt-12 text-center">
          <button onClick={handleLogout} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-md">
            Logout
          </button>
        </div>
      </section>
    </>
  );
}
