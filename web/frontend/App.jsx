// import { BrowserRouter } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { NavMenu } from "@shopify/app-bridge-react";
// import Routes from "./Routes";
// import { Frame } from '@shopify/polaris';

// import { QueryProvider, PolarisProvider, NavigationBar, AppBridgeProvider, Skeleton } from "./components";
// import { TopBar } from "./components";
// import { useEffect, useState } from "react";

// export default function App() {
//   // Any .tsx or .jsx files in /pages will become a route
//   // See documentation for <Routes /> for more info
//   const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
//     eager: true,
//   });
//   const { t } = useTranslation();
//   const [showLayout, setShowLayout] = useState(false);

//   useEffect(() => {
//     setTimeout(() => {
//       setShowLayout(true);
//     }, 3000)
//   }, [showLayout]);

//   return (

//     <PolarisProvider>
//       <BrowserRouter>
//         <AppBridgeProvider>
//           <QueryProvider>
//             <Frame>
//               {showLayout ?
//                 <div className="main-section">
//                   <div className="menu-section">
//                     <NavigationBar />
//                   </div>
//                   <div className="content-section">
//                     <TopBar />
//                     <Routes pages={pages} />
//                   </div>
//                 </div> : <Skeleton />
//               }
//             </Frame>
//           </QueryProvider>
//         </AppBridgeProvider>
//       </BrowserRouter>
//     </PolarisProvider>
//   );
// }


import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Routes from "./Routes";
import { Frame } from '@shopify/polaris';
import { QueryProvider, PolarisProvider, NavigationBar, AppBridgeProvider, Skeleton } from "./components";
import { TopBar } from "./components";
import { useEffect, useState } from "react";

export default function App() {
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  
  const { t } = useTranslation();
  const [showLayout, setShowLayout] = useState(false);

  useEffect(() => {
    // Get shop parameter from URL if present
    const params = new URLSearchParams(window.location.search);
    const shop = params.get('shop');
    
    // If no shop in URL and we're not at auth path, redirect to auth
    if (!shop && !window.location.pathname.includes('/api/auth')) {
      const authUrl = `/api/auth?shop=${import.meta.env.VITE_SHOP}`;
      window.location.href = authUrl;
      return;
    }

    setTimeout(() => {
      setShowLayout(true);
    }, 3000);
  }, []);

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <Frame>
              {showLayout ? (
                <div className="main-section">
                  <div className="menu-section">
                    <NavigationBar />
                  </div>
                  <div className="content-section">
                    <TopBar />
                    <Routes pages={pages} />
                  </div>
                </div>
              ) : (
                <Skeleton />
              )}
            </Frame>
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}