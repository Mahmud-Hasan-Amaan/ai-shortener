"use client";

import React from "react";
import { Element } from "react-scroll";
import Image from "next/image";
import { links } from "../constants";
import Marker from "@/components/ui/Marker";

const Download = () => {
  return (
    <section>
      <Element
        name="download"
        className="g7 relative pb-32 pt-24 max-lg:pb-24 max-md:py-16 "
      >
        <div className="container ">
          <div className="flex item-center ">
            <div className="relative mr-6 flex-540 max-xl:flex-280 max-lg:flex-256 max-md:flex-100">
              <div className="mb-10">
                <Image
                  src="/images/xora.svg"
                  alt="xora"
                  width={160}
                  height={55}
                />
              </div>
              <div>
                <p className="body-1 mb-10 max-w-md">
                  Try It Now For Free On Ios, PC, Web - whatever your flavor,
                  we&apos;ve got you covered.
                </p>
                <ul className="flex flex-wrap items-center gap-6">
                  {links.map(({ id, url, icon }) => (
                    <li
                      key={id}
                      className="download_tech-link download_tech-link_last-before downlooad_tech-link_last-after"
                    >
                      <a
                        href={url}
                        className="size-22 download_tech-icon_before relative flex items-center justify-center rounded-half border-2 border-s3 bg-s1 transition-borderColor duration-500"
                      >
                        <span className="absolute -top-2 rotate-90 ">
                          <Marker />
                        </span>
                        <Image
                          src={"/images/lines.svg"}
                          alt={"lines"}
                          width={16}
                          height={16}
                          className="absolute size-13/20 object-contain"
                        />
                        <span className="download_tech-icon">{icon}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mb-10 max-md:hidden">
              <div className="download_preview-before download_preview-after rounded-40 relative w-[955px] border-2 border-s5 p-6">
                <div className="relative rounded-3xl bg-s1 px-6 pb-6 pt-14">
                  <span className="download_preview-dot left-6 bg-p2 " />
                  <span className="download_preview-dot left-11 bg-s3 " />
                  <span className="download_preview-dot left-16 bg-p1/15 " />
                  <Image
                    src="/images/screen.jpg"
                    alt="preview"
                    width={855}
                    height={655}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Element>
    </section>
  );
};

export default Download;
