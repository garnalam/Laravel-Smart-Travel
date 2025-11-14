import '../css/app.css';



import { createInertiaApp } from '@inertiajs/react';

import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

import { createRoot } from 'react-dom/client';

import { initializeTheme } from './hooks/use-appearance';



// --- BƯỚC 1: IMPORT STORE VÀ TYPES ---

import { useAuthStore } from './store/useAuthStore';

import { User } from './types/domain';

// --- BƯỚC 2: IMPORT LAYOUT CHÍNH CỦA BẠN ---

import MainLayout from './layouts/MainLayout'; // <-- IMPORT LAYOUT

import React from 'react';



const appName = import.meta.env.VITE_APP_NAME || 'Laravel';



createInertiaApp({

    title: (title) => (title ? `${title} - ${appName}` : appName),



    // --- BƯỚC 3: SỬA LẠI HÀM 'RESOLVE' ---

    resolve: async (name) => {

        // Lấy component trang (Page component)

        const page = (await resolvePageComponent(

            `./pages/${name}.tsx`,

            // Cảnh báo 'import.meta' là bình thường trong môi trường này

            import.meta.glob('./pages/**/*.tsx')

        )) as any; // 'any' để truy cập .default.layout



        // Logic Layout cố định

        // Nếu component trang (vd: dashboard.tsx) có định nghĩa 'layout' riêng,

        // thì dùng nó.

        // Nếu không (hoặc là undefined), thì bọc nó bằng 'MainLayout'

        // làm layout mặc định.

        page.default.layout = 

            page.default.layout || 

            ((pageComponent: React.ReactNode) => <MainLayout>{pageComponent}</MainLayout>);



        return page;

    },

    

    // --- BƯỚC 4: HÀM SETUP VẪN GIỮ NGUYÊN ---

    setup({ el, App, props }) {

        const root = createRoot(el);



        // Code "mớm" (seeding) này vẫn đúng, nó xử lý cho lần F5

        const user = props.initialPage.props.auth.user as User | null;

        useAuthStore.getState().setUser(user);



        // Render ứng dụng

        root.render(<App {...props} />);

    },



    progress: {

        color: '#4B5563',

    },

});



initializeTheme();