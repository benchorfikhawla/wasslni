"use client";
import React from "react";
import Header from "@/components/partials/header";
import Sidebar from "@/components/partials/sidebar";
import { cn } from "@/lib/utils";
import { useSidebar, useThemeStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import Footer from "@/components/partials/footer";
import { useMediaQuery } from "@/hooks/use-media-query";
import ThemeCustomize from "@/components/partials/customizer/theme-customizer";
import MobileSidebar from "@/components/partials/sidebar/mobile-sidebar";
import { useMounted } from "@/hooks/use-mounted";
import LayoutLoader from "@/components/layout-loader";

const DashBoardLayoutProvider = ({ children, trans , menusConfig }) => {
  const { collapsed, sidebarType, setCollapsed, subMenu } = useSidebar();
  const { layout } = useThemeStore();
  const location = usePathname();
  const isMobile = useMediaQuery("(min-width: 768px)");
  const mounted = useMounted();
  
  if (!mounted) {
    return <LayoutLoader />;
  }
  
  if (layout === "semibox") {
    return (
      <>
        <Header trans={trans} />
        <Sidebar trans={trans} menusConfig={menusConfig} />

        <div
          className={cn("content-wrapper transition-all duration-150 ", {
            "ltr:xl:ml-[72px] rtl:xl:mr-[72px]": collapsed,
            "ltr:xl:ml-[272px] rtl:xl:mr-[272px]": !collapsed,
          })}
        >
          <div
            className={cn(
              "md:pt-6 pb-[37px] pt-[15px] md:px-6 px-4  page-min-height-semibox ",
              {}
            )}
          >
            <div className="semibox-content-wrapper ">
              <LayoutWrapper
                isMobile={isMobile}
                location={location}
                menusConfig={menusConfig}
              >
                {children}
              </LayoutWrapper>
            </div>
          </div>
        </div>
        <Footer trans={trans} />
        <ThemeCustomize trans={trans} />
      </>
    );
  }
  if (layout === "horizontal") {
    return (
      <>
        <Header trans={trans} />

        <div className={cn("content-wrapper transition-all duration-150 ")}>
          <div
            className={cn(
              "  md:pt-6 pb-[37px] pt-[15px] md:px-6 px-4  page-min-height-horizontal ",
              {}
            )}
          >
            <LayoutWrapper
              isMobile={isMobile}
              location={location}
              menusConfig={menusConfig}
            >
              {children}
            </LayoutWrapper>
          </div>
        </div>
        <Footer />
        <ThemeCustomize />
      </>
    );
  }

  if (sidebarType !== "module") {
    return (
      <>
        <Header trans={trans} />
        <Sidebar trans={trans} menusConfig={menusConfig} />

        <div
          className={cn("content-wrapper transition-all duration-150 ", {
            "ltr:xl:ml-[248px] rtl:xl:mr-[248px] ": !collapsed,
            "ltr:xl:ml-[72px] rtl:xl:mr-[72px]": collapsed,
          })}
        >
          <div
            className={cn(
              "  md:pt-6 pb-[37px] pt-[15px] md:px-6 px-4  page-min-height ",
              {}
            )}
          >
            <LayoutWrapper
              isMobile={isMobile}
              location={location}
              menusConfig={menusConfig}
            >
              {children}
            </LayoutWrapper>
          </div>
        </div>
        <Footer trans={trans} />
        <ThemeCustomize trans={trans} />
      </>
    );
  }
  return (
    <>
      <Header trans={trans} />
      <Sidebar trans={trans} menusConfig={menusConfig} />

      <div
        className={cn("content-wrapper transition-all duration-150 ", {
          "ltr:xl:ml-[300px] rtl:xl:mr-[300px]": !collapsed,
          "ltr:xl:ml-[72px] rtl:xl:mr-[72px]": collapsed,
        })}
      >
        <div
          className={cn(
            "  md:pt-6 layout-padding pt-[15px] md:px-6 px-4  page-min-height ",
            {}
          )}
        >
          <LayoutWrapper
            isMobile={isMobile}
            location={location}
            menusConfig={menusConfig}
          >
            {children}
          </LayoutWrapper>
        </div>
      </div>
      <Footer trans={trans} />
      {isMobile && <ThemeCustomize />}
      <MobileSidebar menusConfig={menusConfig} />
    </>
  );
};

export default DashBoardLayoutProvider;

const LayoutWrapper = ({ children, isMobile, location, menusConfig }) => {
  return (
    <>
      <motion.div
        key={location}
        initial="pageInitial"
        animate="pageAnimate"
        exit="pageExit"
        variants={{
          pageInitial: {
            opacity: 0,
            y: 50,
          },
          pageAnimate: {
            opacity: 1,
            y: 0,
          },
          pageExit: {
            opacity: 0,
            y: -50,
          },
        }}
        transition={{
          type: "tween",
          ease: "easeInOut",
          duration: 0.5,
        }}
      >
        <main>{children}</main>
      </motion.div>
    </>
  );
};
