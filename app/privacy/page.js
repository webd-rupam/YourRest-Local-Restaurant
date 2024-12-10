"use client";
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

const PrivacyPolicy = () => {
  const headerRef = useRef(null);
  const sectionsRef = useRef([]);

  useEffect(() => {
    document.title = "YourRest - Privacy Policy";
  }, []);

  useEffect(() => {
    // Header animation
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
    );

    // Section animations
    gsap.fromTo(
      sectionsRef.current,
      { opacity: 0, x: 30 },
      {
        opacity: 1,
        x: 0,
        duration: 1.5,
        ease: "power3.out",
        stagger: 0.2,
      }
    );
  }, []);

  return (
    <>
      {/* Header Section */}
      <section
        ref={headerRef}
        className="bg-gray-100 py-16 px-6 md:px-16 text-center"
      >
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-gray-800">Privacy Policy</h1>
          <p className="mt-4 text-lg text-gray-600">
            We value your privacy and are committed to protecting your personal
            information.
          </p>
        </div>
      </section>

      {/* Policy Content */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6 md:px-16 space-y-12">
          {[
            {
              title: "1. Information We Collect",
              content: (
                <>
                  <p className="mt-4 text-gray-600 leading-relaxed">
                    To provide you with excellent service, we collect the
                    following:
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                    <li>
                      <strong>Personal Information:</strong> Name, email,
                      address, phone number, and payment details.
                    </li>
                    <li>
                      <strong>Order Data:</strong> Items you order, preferences,
                      and special instructions.
                    </li>
                   
                  </ul>
                </>
              ),
            },
            {
              title: "2. How We Use Your Information",
              content: (
                <>
                  <p className="mt-4 text-gray-600 leading-relaxed">
                    Your data is used for:
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                    <li>Processing and delivering your orders.</li>
                    <li>Ensuring secure online payments.</li>
                    <li>Sending order updates and customer support messages.</li>
                    <li>
                      Informing you about offers or new services (only with your
                      consent).
                    </li>
                  </ul>
                </>
              ),
            },
            {
              title: "3. How We Protect Your Information",
              content: (
                <>
                  <p className="mt-4 text-gray-600 leading-relaxed">
                    We take your privacy seriously and protect your information
                    by:
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                    <li>Encrypting sensitive data during transmission.</li>
                    <li>Using secure payment gateways.</li>
                    <li>Restricting access to authorized personnel only.</li>
                  </ul>
                </>
              ),
            },
            {
              title: "4. Your Rights",
              content: (
                <>
                  <p className="mt-4 text-gray-600 leading-relaxed">
                    You have the right to:
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600">
                    <li>Request access to the data we have about you.</li>
                    <li>Ask for corrections to incorrect or incomplete data.</li>
                    <li>Delete your personal data, subject to legal obligations.</li>
                  </ul>
                </>
              ),
            },
            
          ].map((section, index) => (
            <div
              key={index}
              ref={(el) => (sectionsRef.current[index] = el)}
              className="bg-gray-50 p-8 rounded-lg shadow-md"
            >
              <h2 className="text-2xl font-bold text-gray-800">
                {section.title}
              </h2>
              {section.content}
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default PrivacyPolicy;
