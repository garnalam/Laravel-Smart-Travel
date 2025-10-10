import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import LineChart from '@/admin-pages/Charts/LineChart';
import BarChart from '@/admin-pages/Charts/BarChart';
import admin from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: admin.dashboard().url,
    },
    {
        title: 'Analytics',
        href: admin.analytics().url,
    },
];

export default function AdminAnalytics() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Analytics Dashboard
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        View detailed analytics and reports
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <LineChart />
                    <BarChart />
                </div>
            </div>
        </AdminLayout>
    );
}