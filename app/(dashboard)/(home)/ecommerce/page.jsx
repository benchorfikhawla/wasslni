import { getDictionary } from "@/app/dictionaries";
import EcommercePageView from "./page-view";

const EcommercePage = async () => {
  const trans = await getDictionary();
  return <EcommercePageView trans={trans} />;
};

export default EcommercePage;
