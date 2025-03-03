"use client";

import React from "react";
import { Element } from "react-scroll";
import Button from "@/components/ui/CustomButton";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();

  const handleDashboardClick = () => {
    router.push("/dashboard");
  };
  return (
    <section className="relative pt-60 pb-40 max-lg:pt-52 max-lg:pb-36 max-md:pt-36 max-md:pb-32">
      <Element name="hero">
        <div className="container">
          <div className="relative z-2 max-w-512 max-lg:max-w-388">
            <div className="caption small-2 uppercase text-p3">
              URL Shortening
            </div>
            <h1 className="h1 mb-6 text-p4 uppercase max-lg:mb-7 max-lg:h2 max-md:mb-4 max-md:text-5xl max-md:leading-12">
              Smart Links for Smart People
            </h1>
            <p className="max-w-440 mb-14 body-1 max-md:mb-10">
              LinkPersona AI is not just another URL shortener. We use AI to
              create personalized, memorable links while providing powerful
              analytics and insights.
            </p>

            <Button icon="/images/zap.svg" onClick={handleDashboardClick}>
              Try It Now
            </Button>
          </div>
          <div className="absolute -top-32 left-[calc(50%-340px)] w-[1230px] pointer-events-none hero-img_res">
            <Image
              src="/images/hero.png"
              width={3000}
              height={3000}
              alt="hero"
              className="size-1230 max-lg:h-auto"
            />
          </div>
        </div>
      </Element>
    </section>
  );
};

export default Hero;
