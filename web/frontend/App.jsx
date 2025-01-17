import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import './App.css';

import { QueryProvider, PolarisProvider, TopBar, NavigationBar, Skeleton } from "./components";
import { Frame } from "@shopify/polaris";
import { useEffect, useState } from "react";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  const { t } = useTranslation();
  const [showLayout, setShowLayout] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShowLayout(true);
    }, 3000)
  }, [showLayout]);

  return (
    <PolarisProvider>
      <BrowserRouter>
        <QueryProvider>
          <Frame>
            <NavMenu>
              <a href="/" rel="home" />
              <a href="/products">Products</a>
              {/* <a href="/pagename">{t("NavigationMenu.pageName")}</a> */}
            </NavMenu>
            {showLayout ?
              <div className="main-section">
                <div className="menu-section">
                  <NavigationBar />
                </div>
                <div className="content-section">
                  <TopBar />
                  <Routes pages={pages} />
                </div>
              </div> : <Skeleton />
            }
          </Frame>
        </QueryProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
