import { fetchCustomerById } from "@/lib/wedding-store";
import { wedding as defaultWedding } from "@/config/wedding";
import Invitation from "@/sections/Invitation";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const { client } = await searchParams;
  let initialWedding = defaultWedding;

  if (client) {
    const customer = await fetchCustomerById(client);
    if (customer) initialWedding = customer.wedding;
  }

  return <Invitation initialWedding={initialWedding} />;
}
