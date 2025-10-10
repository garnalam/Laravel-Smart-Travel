import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import FormElements from '@/admin-pages/Forms/FormElements';
import admin from '@/routes/admin';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: admin.dashboard().url,
    },
    {
        title: 'Settings',
        href: admin.settings().url,
    },
];

export default function AdminSettings() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Settings" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Admin Settings
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Configure system settings and preferences
                    </p>
                </div>
                <FormElements />
            </div>
        </AdminLayout>
    );
}