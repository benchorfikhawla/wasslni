"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import { menuDriverConfig } from "@/config/menus"; // Menu du chauffeur
import { isDriver } from '@/utils/auth';

const Layout = ({ children }) => {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [trans, setTrans] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (!userStr || userStr === "undefined" || userStr === "null") {
      router.push("/auth/login");
      return;
    }

    // Vérifier si l'utilisateur a le rôle driver
    if (!isDriver()) {
      console.log('Accès refusé: Utilisateur n\'a pas le rôle driver');
      router.push("/error-page/403");
      return;
    }

    // Charger les traductions dynamiquement
    import("@/app/dictionaries/en.json")
      .then((module) => {
        setTrans(module.default);
        setIsAuth(true);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des traductions :", err);
        router.push("/auth/login");
      });
  }, [router]);

  if (!isAuth || !trans) return null;

  return (
    <DashBoardLayoutProvider trans={trans} menusConfig={menuDriverConfig}>
      {children}
    </DashBoardLayoutProvider>
  );
};

export default Layout;
