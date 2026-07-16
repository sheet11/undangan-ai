export type Wedding = {
  bride: { fullName: string; nickName: string; father: string; mother: string };
  groom: { fullName: string; nickName: string; father: string; mother: string };
  event: { date: string; day: string; akad: string; reception: string; venue: string; address: string; maps: string };
  story: { year: string; title: string; description: string }[];
  gifts: { bank: string; account: string; holder: string }[];
  images: { hero: string };
  audio?: string;
};
