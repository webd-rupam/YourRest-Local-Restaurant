"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FaSearch, FaUser, FaShoppingCart, FaHome, FaUtensils } from "react-icons/fa";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const mobileMenuRef = useRef(null);

  useGSAP(() => {
    gsap.from("li", {
      y: -5,
      opacity: 0,
      stagger: 0.3,
      duration: 0.8,
    });
  });

  // Use useEffect to set activeSection from localStorage on page load
  useEffect(() => {
    const storedActiveSection = localStorage.getItem("activeSection");
    if (storedActiveSection && ["home", "menu", "contact", "about", "orders", "profile"].includes(storedActiveSection)) {
      setActiveSection(storedActiveSection);
    } else {
      setActiveSection("home"); // Set to "Home" by default
    }
  }, []);
  
  

  // Store the activeSection in localStorage whenever it changes
  const handleClick = (section) => {
    setActiveSection(section);
    localStorage.setItem("activeSection", section); // Store activeSection in localStorage
    setIsMenuOpen(false); // Close the mobile menu on link click
  };

  useEffect(() => {
    if (isMenuOpen && mobileMenuRef.current) {
      gsap.fromTo(
        mobileMenuRef.current,
        { y: -15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.2 }
      );
    }
  }, [isMenuOpen]); // Trigger animation whenever `isMenuOpen` changes

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-white py-4 lg:px-16 md:px-6 px-3 sticky top-0 z-30">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href={"/"} className="flex items-center gap-1">
            <img src="/favicon.png" alt="" className="w-8" />
            <span className="md:text-lg font-bold">YourRest</span>
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-8 text-sm font-medium text-gray-500">
            {[
              { name: "Home", href: "/", key: "home" },
              { name: "Menu", href: "/menu", key: "menu" },
              { name: "Contact", href: "/contact", key: "contact" },
              { name: "About us", href: "/about", key: "about" },
            ].map((item) => (
              <li key={item.key}>
                <Link href={item.href}>
                  <p
                    onClick={() => handleClick(item.key)}
                    className={`cursor-pointer ${
                      activeSection === item.key
                        ? "text-orange-500"
                        : "hover:text-orange-500"
                    }`}
                  >
                    {item.name}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {/* Icons */}
          <div className="flex items-center space-x-6 text-gray-700">
            <Link href="/profile">
              <FaUser
                className={`hidden md:block cursor-pointer ${
                  activeSection === "profile" ? "text-orange-500" : "hover:text-orange-500"
                }`}
                onClick={() => handleClick("profile")}
              />
            </Link>
            <Link href="/orders">
              <FaShoppingCart
                className={`hidden md:block cursor-pointer ${
                  activeSection === "orders" ? "text-orange-500" : "hover:text-orange-500"
                }`}
                onClick={() => handleClick("orders")}
              />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  isMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16m-7 6h7"
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <ul ref={mobileMenuRef} className="mobileMenu lg:hidden bg-white shadow-md py-4 space-y-4 text-center font-medium text-gray-700">
            {[
              { name: "Home", href: "/", key: "home" },
              { name: "Menu", href: "/menu", key: "menu" },
              { name: "Contact", href: "/contact", key: "contact" },
              { name: "About us", href: "/about", key: "about" },
            ].map((item) => (
              <li key={item.key}>
                <Link href={item.href}>
                  <p
                    onClick={() => handleClick(item.key)}
                    className={`cursor-pointer ${
                      activeSection === item.key
                        ? "text-orange-500"
                        : "hover:text-orange-500"
                    }`}
                  >
                    {item.name}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* Bottom Navbar for Mobile */}
      <div className="fixed bottom-0 inset-x-0 bg-white shadow-t md:hidden flex justify-around py-2 border-t border-gray-200 z-30">
        {[
          { name: "Home", href: "/", icon: FaHome, key: "home" },
          { name: "Menu", href: "/menu", icon: FaUtensils, key: "menu" },
          { name: "Profile", href: "/profile", icon: FaUser, key: "profile" },
          { name: "Orders", href: "/orders", icon: FaShoppingCart, key: "orders" },
        ].map((item) => (
          <Link
            key={item.key}
            href={item.href}
            onClick={() => setActiveSection(item.key)} // Update activeSection
            className={`text-center ${
              activeSection === item.key ? "text-orange-500" : "text-gray-700 hover:text-orange-500"
            }`}
          >
            <item.icon
              className={`text-xl mx-auto ${
                activeSection === item.key ? "text-orange-500" : ""
              }`}
            />
            <p
              className={`text-xs ${
                activeSection === item.key ? "text-orange-500" : ""
              }`}
            >
              {item.name}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
};

export default Navbar;
