import GenderChart from '@/components/GenderChart';
import CustomerTable from '@/components/CustomerTable';
import GenderAgeChart from '@/components/GenderAgeChart';
import BrandDeviceChart from '@/components/BrandDeviceChart';
import LoginTrendsChart from '@/components/LoginTrendsChart';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Customer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GenderChart />
        <GenderAgeChart />
        <BrandDeviceChart />
      </div>
      <div className="grid grid-cols-1 gap-6 mb-8">
        <LoginTrendsChart />
      </div>
      <CustomerTable />
    </main>
  );
}