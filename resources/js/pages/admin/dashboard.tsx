import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import EcommerceMetrics from '@/admin-components/ecommerce/EcommerceMetrics';
import MonthlySalesChart from '@/admin-components/ecommerce/MonthlySalesChart';
import StatisticsChart from '@/admin-components/ecommerce/StatisticsChart';
import MonthlyTarget from '@/admin-components/ecommerce/MonthlyTarget';
import RecentOrders from '@/admin-components/ecommerce/RecentOrders';
import DemographicCard from '@/admin-components/ecommerce/DemographicCard';
import admin from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: admin.dashboard().url,
    },
];

export default function AdminDashboard() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 space-y-6 xl:col-span-7">
                    <EcommerceMetrics />
                    <MonthlySalesChart />
                </div>

                <div className="col-span-12 xl:col-span-5">
                    <MonthlyTarget />
                </div>

                <div className="col-span-12">
                    <StatisticsChart />
                </div>

                <div className="col-span-12 xl:col-span-5">
                    <DemographicCard />
                </div>

                <div className="col-span-12 xl:col-span-7">
                    <RecentOrders />
                </div>
            </div>
        </AdminLayout>
    );
}