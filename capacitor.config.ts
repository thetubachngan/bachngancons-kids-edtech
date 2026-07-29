import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.bachngancons.kidsenglish",
  appName: "BachNganCons Kids English",
  webDir: "out",
  server: {
    url: "https://tienganh.bachngancons.com",
    cleartext: true,
    androidScheme: "https",
  },
};

export default config;
