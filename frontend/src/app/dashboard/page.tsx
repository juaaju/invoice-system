import { getServerSession } from "next-auth";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    return <div>Unauthorized. Please login.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Welcome, {session.user?.email}
      </h1>
      <p>Ini dashboard kamu 🚀</p>
    </div>
  );
}
