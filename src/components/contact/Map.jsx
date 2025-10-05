import { config } from "@/helpers/config";

export const Map = () => {
  return (
    <iframe
      src={config.contact.map.embed}
      width="100%"
      height="450px"
      style={{ border: "0", display: "block" }}
      allowFullScreen=""
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  );
};
