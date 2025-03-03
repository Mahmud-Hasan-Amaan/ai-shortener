"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Link as LinkScroll } from "react-scroll";
import clsx from "clsx";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const Header = () => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 32);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const NavLink = ({
    tittle,
    className,
  }: {
    tittle: string;
    className?: string;
  }) => (
    <LinkScroll
      onClick={() => setIsOpen(false)}
      to={tittle}
      offset={-100}
      spy
      smooth
      activeClass="nav-active"
      className={clsx(
        "base-bold text-foreground uppercase transition-colors duration-500 cursor-pointer hover:text-p1 max-lg:my-4 max-lg:h5",
        className
      )}
    >
      {tittle}
    </LinkScroll>
  );

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 w-full py-10 transition-all duration-500 max-lg:py-4",
        hasScrolled
          ? "py-2 bg-background backdrop-blur-[8px]"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-14 items-center max-lg:px-5">
        <a href="" className="lg:hidden flex-1 cursor-pointer z-20">
          <Image
            src="/images/xora.svg"
            width={115}
            height={50}
            alt="logo"
            className="dark:brightness-100 brightness-75"
          />
        </a>
        <div
          className={clsx(
            "w-full max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:w-full max-lg:bg-background max-lg:opacity-0 max-lg:z-10",
            isOpen ? "max-lg:opacity-100" : "max-lg:pointer-events-none"
          )}
        >
          <div className="max-lg:relative max-lg:flex max-lg:flex-col max-lg:min-h-screen max-lg:p-6 max-lg:overflow-hidden sidebar-before max-md:px-4">
            <nav className="max-lg:relative max-lg:z-2 max-lg:my-auto">
              <ul className="flex items-center max-lg:block max-lg:px-12">
                <li className="nav-li">
                  <NavLink tittle="features" />
                  <div className="dot bg-foreground/20 dark:bg-p4/20" />
                  <NavLink tittle="pricing" />
                </li>
                <li className="nav-logo">
                  <LinkScroll
                    to="hero"
                    offset={-240}
                    spy
                    smooth
                    className={clsx(
                      "max-lg:hidden transition-transform duration-500 cursor-pointer"
                    )}
                  >
                    <Image
                      src="/images/smart-link.png"
                      width={162}
                      height={56}
                      alt="logo"
                      className="dark:brightness-100 brightness-75"
                    />
                  </LinkScroll>
                </li>
                <li className="nav-li">
                  <NavLink tittle="faq" />
                  <div className="dot bg-foreground/20 dark:bg-p4/20" />
                  <NavLink tittle="download" />
                </li>
                <li className="nav-auth ml-8 flex gap-6 max-lg:ml-0 max-lg:mt-8 max-lg:flex-col max-lg:gap-4">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="base-bold text-foreground transition-colors duration-500 cursor-pointer hover:text-p1 max-lg:my-4 max-lg:h5">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button className="base-bold text-foreground transition-colors duration-500 cursor-pointer hover:text-p1 max-lg:my-4 max-lg:h5">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "size-8",
                        },
                      }}
                    />
                  </SignedIn>
                </li>
              </ul>
            </nav>
            <div className="lg:hidden block absolute top-1/2 left-0 w-[960px] h-[380px] translate-x-[-290px] -translate-y-1/2 rotate-90">
              <Image
                src="/images/bg-outlines.svg"
                alt="outline"
                width={960}
                height={380}
                className="relative z-2 dark:opacity-100 opacity-50"
              />
              <Image
                src="/images/bg-outlines-fill.png"
                alt="outline"
                width={960}
                height={380}
                className="absolute inset-0 mix-blend-soft-light opacity-5"
              />
            </div>
          </div>
        </div>
        <button
          className="lg:hidden z-20 size-10 border-2 border-s4/25 rounded-full flex justify-center items-center"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <Image
            src={`/images/${isOpen ? `close` : `magic`}.svg`}
            width={20}
            height={20}
            alt="magic"
            className="size-1/2 object-contain dark:brightness-100 brightness-75"
          />
        </button>
        <div className="z-20">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
