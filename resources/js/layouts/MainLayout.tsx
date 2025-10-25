// File: resources/js/Layouts/MainLayout.tsx

import React, { PropsWithChildren } from 'react';
import { usePage } from '@inertiajs/react';

export default function MainLayout({ children }: PropsWithChildren) {
    const { active_theme } = usePage().props as { active_theme: string | null };

    return (
        <div data-theme={active_theme || 'default'}>
            <div className="themeable-container">
                <header className="themeable-header">
                    <h1>Header Cố Định</h1>
                    <nav>
                        <a href="#" className="p-2">Home</a>
                        <a href="#" className="p-2">About</a>
                    </nav>
                </header>
                <aside className="themeable-sidebar">
                    <h2>Sidebar</h2>
                    <ul>
                        <li>Menu Item 1</li>
                        <li>Menu Item 2</li>
                    </ul>
                </aside>
                <main className="themeable-content">
                    {children}
                </main>
                <footer className="themeable-footer">
                    <p>Đây là Footer Cố Định</p>
                </footer>
            </div>
        </div>
    );
}