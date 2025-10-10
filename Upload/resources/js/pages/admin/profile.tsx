import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { admin } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import UserMetaCard from '@/admin-components/UserProfile/UserMetaCard';
import UserInfoCard from '@/admin-components/UserProfile/UserInfoCard';
import UserAddressCard from '@/admin-components/UserProfile/UserAddressCard';
import { ProfileProvider } from '@/admin-context/ProfileContext';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: admin().url,
    },
    {
        title: 'User Profile',
        href: admin('profile').url,
    },
];

export default function UserProfile() {
    return (
        <ProfileProvider>
            <AdminLayout breadcrumbs={breadcrumbs}>
                <Head>
                    <title>User Profile</title>
                    <meta name="description" content="User profile management page" />
                </Head>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
                    <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
                        Profile
                    </h3>
                    <div className="space-y-6">
                        <UserMetaCard />
                        <UserInfoCard />
                        <UserAddressCard />
                    </div>
                </div>
            </AdminLayout>
        </ProfileProvider>
    );
}