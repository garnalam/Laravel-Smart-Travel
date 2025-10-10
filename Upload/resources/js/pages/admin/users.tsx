import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import BasicTables from '../../admin-pages/Tables/BasicTables';
import { admin } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: admin().url,
    },
    {
        title: 'Users Management',
        href: admin('users').url,
    },
];

export default function AdminUsers() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Users Management" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Users Management
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Manage all users in the system
                    </p>
                </div>
                <BasicTables />
            </div>
        </AdminLayout>
    );
}