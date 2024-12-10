"use client"
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import Link from "next/link";

const Page = () => {
  const aboutRef = useRef(null);
  const featuresRef = useRef([]);

  useEffect(() => {
    document.title = "YourRest - About us";
  }, []);

  useEffect(() => {
    // About Section Animation
    gsap.fromTo(
      aboutRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" }
    );

    // Features Animation
    gsap.fromTo(
      featuresRef.current,
      { opacity: 0, x: -50 },
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
      {/* About Section */}
      <section
        ref={aboutRef}
        className=" mx-auto py-16 px-6 md:px-16 text-center md:text-left bg-white"
      >
        <div className="lg:flex items-center justify-between">
          {/* Text Content */}
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-4xl font-bold text-gray-800 lg:text-5xl">
              About Us
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Welcome to our restaurant, where passion meets flavor. Our mission
              is to serve you delicious meals made with the finest ingredients,
              prepared with love and care. Enjoy the convenience of ordering
              your favorite dishes online and paying securely through our
              platform.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Whether you're dining in or enjoying our meals from the comfort of
              your home, we promise an unforgettable culinary experience.
            </p>
          </div>

          {/* Image Content */}
          <div className="lg:w-1/2 mt-8 lg:mt-0 flex items-center justify-center">
            <img
              src="/ambience.png"
              alt="Restaurant ambiance"
              className="rounded-lg w-3/4"
              onLoad={(e) =>
                gsap.to(e.target, {
                  scale: 1,
                  opacity: 1,
                  duration: 1,
                  ease: "power3.out",
                })
              }
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6 md:px-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            Why Choose Us
          </h2>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {[
              {
                title: "Fresh Ingredients",
                description:
                  "We use only the freshest and highest-quality ingredients to prepare our dishes.",
                icon: "/freshIng.png",
              },
              {
                title: "Easy Online Ordering",
                description:
                  "Order your favorite meals seamlessly through our website and enjoy hassle-free payments.",
                icon: "/onOrder.png",
              },
              {
                title: "Exceptional Service",
                description:
                  "Our team is dedicated to providing you with a memorable dining experience.",
                icon: "/service.png",
              },
            ].map((feature, index) => (
              <div
                key={index}
                ref={(el) => (featuresRef.current[index] = el)}
                className="bg-white p-6 shadow-md rounded-lg flex items-center space-x-4"
              >
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mt-2">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="bg-gray-800 py-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to Taste the Difference?
          </h2>
          <p className="text-gray-300 text-lg mt-4">
            Place your order now and experience the joy of our exquisite
            cuisine.
          </p>
          <Link href="/menu" className="mt-4 px-8 py-2 relative top-6 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-md transition duration-300">
            Order Now
          </Link>
        </div>
      </section>
    </>
  );
};

export default Page;
