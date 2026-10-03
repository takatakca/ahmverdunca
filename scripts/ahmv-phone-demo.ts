import { simulatePhoneDemo } from "../src/features/ahmv-phone/demo/simulator.ts";

const scenarios = [
  {
    title: "FR voice -> requested SMS",
    input: { channel: "voice" as const, lang: "fr" as const, message: "M13A", access: "trial" as const, wantsSms: true },
  },
  {
    title: "EN SMS -> weekly schedule",
    input: { channel: "sms" as const, lang: "en" as const, message: "WEEK M13A", access: "trial" as const },
  },
  {
    title: "Expired trial -> member gate",
    input: { channel: "sms" as const, lang: "fr" as const, message: "SEMAINE M13A", access: "expired" as const },
  },
  {
    title: "Premium -> save team",
    input: { channel: "sms" as const, lang: "fr" as const, message: "SAUVE M13A", access: "premium" as const },
  },
];

for (const scenario of scenarios) {
  console.log("\n=== " + scenario.title + " ===");
  console.log(JSON.stringify(simulatePhoneDemo(scenario.input), null, 2));
}
