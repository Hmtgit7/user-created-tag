// import {
//   Page,
//   Layout,
//   TextContainer,
//   Image,
//   Stack,
//   Link,
//   Text,
// } from "@shopify/polaris";
// import { TitleBar } from "@shopify/app-bridge-react";
// import { useTranslation, Trans } from "react-i18next";

// import { trophyImage } from "../assets";

// import { Card } from "../components";

// export default function HomePage() {
//   const { t } = useTranslation();
//   return (
//     <Page fullWidth>
//     <div className="home-section">
//       <div className="graphs-section">
//         {/* <OrderGraphs /> */}
//       </div>
//       <div className="cards-section">
//         <Layout>
//           <Card title="Order" />
//           <Card title="Order" />
//           <Card title="Order" />
//           <Card title="Order" />
//           <Card title="Order" />
//           <Card title="Order" />
//         </Layout>
//       </div>
//       <div className="order-details-section">
//         {/* <OrderDetails /> */}
//       </div>
//     </div>
//   </Page>
//   );
// }

import {
  Layout,
  Page,
} from "@shopify/polaris";
import { Card, OrderDetails, OrderGraphs } from "../components";
import useApiRequest from "../hooks/useApiRequest";

export default function HomePage() {

  let {responseData, isLoading, error} = useApiRequest("/api/orders/all", "GET");
  let productResult = useApiRequest("/api/product/count", "GET");
  let collectionResult = useApiRequest("/api/collection/count", "GET");
  if(error) {
    console.log(error);
  }

  console.log("Product Count: ", productResult.responseData);
  console.log("Collection Count: ", collectionResult.responseData);
  

  return (
    <Page fullWidth>
      <div className="home-section">
        <div className="graphs-section">
          {responseData && <OrderGraphs orderData={responseData} />}
        </div>
        <div className="cards-section">
          {responseData && 
            <Layout>
              <Card title="Total Orders" orders={responseData} total/>
              <Card title="Fulfilled Orders" orders={responseData} fulfilled/>
              <Card title="Remains Orders" orders={responseData} remains/>
              <Card title="Total Products" orders={productResult.responseData} productcount/>
              <Card title="Total Collections" orders={collectionResult.responseData} collectioncount/>
            </Layout>
          }
        </div>
        <div className="order-details-section">
          {responseData && <OrderDetails orderData={responseData}/>}
        </div>
      </div>
    </Page>
  );
}