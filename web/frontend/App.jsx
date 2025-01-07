import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

import { QueryProvider, PolarisProvider, NavigationBar, AppBridgeProvider, Skeleton } from "./components";
import { TopBar } from "./components";
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
        <AppBridgeProvider>
          <QueryProvider>
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
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
