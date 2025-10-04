import SectionTitle from "@/components/common/SectionTitle";
import Spacer from "@/components/common/Spacer";
import { Contact } from "@/components/contact/Contact";

export const metadata = {
  title: "Contact",
  description:
    "You can always contact us for more information and support.",
};

export default async function ContactPage() {


  return (
    <>
    <SectionTitle>Contact</SectionTitle>
      <Spacer />
      <Contact/>
    </>
  );
}