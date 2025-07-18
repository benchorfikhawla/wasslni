import React from "react";
import { useSidebar, useThemeStore } from "@/store";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { SiteLogo } from "@/components/svg";
import Link from "next/link";
import { useMediaQuery } from "@/hooks/use-media-query";

const MenuBar = ({ collapsed, setCollapsed }) => {
  return (
    <button
      className="relative group  disabled:cursor-not-allowed opacity-50"
      onClick={() => setCollapsed(!collapsed)}
    >
      <div>
        <div
          className={cn(
            "flex flex-col justify-between w-[20px] h-[16px] transform transition-all duration-300 origin-center overflow-hidden",
            {
              "-translate-x-1.5 rotate-180": collapsed,
            }
          )}
        >
          <div
            className={cn(
              "bg-card-foreground h-[2px] transform transition-all duration-300 origin-left delay-150",
              {
                "rotate-[42deg] w-[11px]": collapsed,
                "w-7": !collapsed,
              }
            )}
          ></div>
          <div
            className={cn(
              "bg-card-foreground h-[2px] w-7 rounded transform transition-all duration-300",
              {
                "translate-x-10": collapsed,
              }
            )}
          ></div>
          <div
            className={cn(
              "bg-card-foreground h-[2px] transform transition-all duration-300 origin-left delay-150",
              {
                "-rotate-[43deg] w-[11px]": collapsed,
                "w-7": !collapsed,
              }
            )}
          ></div>
        </div>
      </div>
    </button>
  );
};

const VerticalHeader = () => {
  const { collapsed, setCollapsed, subMenu, sidebarType } = useSidebar();
  const { layout } = useThemeStore();
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const isMobile = useMediaQuery("(min-width: 768px)");
  let LogoContent = null;
  let menuBarContent = null;

  const MainLogo = (
    <Link href="/dashboard" className=" text-primary ">
      <SiteLogo className="h-7 w-7" />
    </Link>
  );

  if (layout === "semibox" && !isDesktop) {
    LogoContent = MainLogo;
  }
  if (
    layout === "vertical" &&
    !isDesktop &&
    isMobile &&
    sidebarType === "module"
  ) {
    LogoContent = MainLogo;
  }
  if (layout === "vertical" && !isDesktop && sidebarType !== "module") {
    LogoContent = MainLogo;
  }

  // menu bar content condition
  if (isDesktop && sidebarType !== "module") {
    menuBarContent = (
      <MenuBar collapsed={collapsed} setCollapsed={setCollapsed} />
    );
  }
  if (sidebarType === "module") {
    menuBarContent = (
      <MenuBar collapsed={collapsed} setCollapsed={setCollapsed} />
    );
  }
  if (sidebarType === "classic") {
    menuBarContent = null;
  }
  if (subMenu && isDesktop) {
    menuBarContent = null;
  }

  return (
    <>
      <div className="flex items-center md:gap-6 gap-3">
        {LogoContent}
        {menuBarContent}
      </div>
    </>
  );
};

export default VerticalHeader;
