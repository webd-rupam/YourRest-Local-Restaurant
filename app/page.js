"use client";
import { useEffect, useRef } from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { useGSAP } from "@gsap/react";
import Link from "next/link";

gsap.registerPlugin(TextPlugin);

export default function Home() {
  const heroRef = useRef(null);
  const reviewsRef = useRef([]);

  useEffect(() => {
    // Hero Section Animation
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 50, x: 0 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.2,
      }
    );

    // Rotating Text Animation
    gsap.to(".circleText", {
      rotation: 360,
      repeat: -1,
      duration: 10,
      ease: "linear",
    });

    // Testimonials Animation
    gsap.fromTo(
      reviewsRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0,
      }
    );
  }, []);

  useGSAP(() => {
    gsap.from(".heading", {
      y: 100,
      opacity: 0,
    })
  }
  )

  useGSAP(() => {
    gsap.from(".para", {
      y: 100,
      opacity: 0,
      delay: 1
    })
  }
  )

  useGSAP(() => {
    gsap.from(".order", {
      x: 400,
      opacity: 0,
      duration: 1,
      delay: 2
    })
  }
  )

  const animateOrder = () => {
      gsap.from(".order", {
        x: 165,
        y: -400,
      duration: 1
      })
    
  }
  

  return (
    <>

      {/* Hero Section */}
      <section
  ref={heroRef}
  className=" mx-auto py-16 text-center md:text-left md:flex items-center justify-between px-16 bg-white min-h-screen"
  style={{ width: "100%" }}
>

        {/* Text Content */}
        <div className="md:w-1/2 space-y-6">
          <h1 className="heading text-4xl font-bold text-gray-800 leading-tight md:text-5xl">
            Enjoy healthy and <br /> delicious food.
          </h1>
          <p className="para text-gray-600 text-lg">
            Hands down, the best foods around. Perfectly blended with fresh
            ingredients and incredible flavors. A must-try!
          </p>

          <div className="order relative flex items-center justify-center w-36 h-36 left-16">
            {/* Rotating Text */}
            <div className="circleText absolute w-full h-full flex items-center justify-center">
              <svg className="w-full h-full">
                <defs>
                  <path
                    id="circlePath"
                    d="M 72,72 m -50,0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0"
                  />
                </defs>
                <text className="font-medium text-[10px] tracking-wide uppercase text-gray-400">
                  <textPath
                    href="#circlePath"
                    startOffset="50%"
                    textAnchor="middle"
                  >
                    ORDER NOW - ORDER NOW - ORDER NOW - ORDER NOW -
                  </textPath>
                </text>
              </svg>
            </div>

            {/* Inner Button */}
            <Link href={"/menu"} onClick={animateOrder} className="w-16 h-16 hover:w-[68px] hover:h-[68px] hover:bg-gray-800 bg-black rounded-full flex items-center justify-center text-white z-10">
              <FiArrowUpRight size={24} />
            </Link>
          </div>
        </div>

        {/* Image Content */}
        <div className="md:w-1/2 mt-8 md:mt-0 flex items-center justify-center space-x-6">
          <img
            src="/pic1.png"
            alt="Delicious food"
            className="rounded-lg"
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
      </section>
    </>
  );
}
