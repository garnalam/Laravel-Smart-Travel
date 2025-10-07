import { SidebarProvider } from '@/admin-context/SidebarContext';
import { ThemeProvider } from '@/admin-context/ThemeContext';
import AdminHeader from '@/admin-layout/AppHeader';
import AdminSidebar from '@/admin-layout/AppSidebar';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

const AdminLayoutContent: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen xl:flex">
            <div>
                <AdminSidebar />
                <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" />
            </div>
            <div className="flex-1 transition-all duration-300 ease-in-out lg:ml-[290px]">
                <AdminHeader />
                <div className="p-4 mx-auto max-w-7xl md:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default function AdminLayout({ children, breadcrumbs, ...props }: AdminLayoutProps) {
    return (
        <ThemeProvider>
            <SidebarProvider>
                <AdminLayoutContent breadcrumbs={breadcrumbs} {...props}>
                    {children}
                </AdminLayoutContent>
            </SidebarProvider>
        </ThemeProvider>
    );
}