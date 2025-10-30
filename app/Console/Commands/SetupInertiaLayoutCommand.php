<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class SetupInertiaLayoutCommand extends Command
{
    /**
     * Tên và signature của lệnh console.
     * Đây chính là tên lệnh bạn muốn chạy.
     * @var string
     */
    protected $signature = 'setup:inertia-layout';

    /**
     * Mô tả của lệnh.
     * @var string
     */
    protected $description = 'Tự động tạo thư mục Layouts và file MainLayout.tsx cho Inertia.';

    /**
     * Hàm thực thi lệnh.
     */
    public function handle()
    {
        $layoutPath = resource_path('js/Layouts');
        $mainLayoutFile = $layoutPath . '/MainLayout.tsx';

        // 1. Kiểm tra và tạo thư mục Layouts
        if (!File::isDirectory($layoutPath)) {
            File::makeDirectory($layoutPath, 0755, true);
            $this->info('-> Đã tạo thư mục: resources/js/Layouts');
        } else {
            $this->comment('-> Thư mục resources/js/Layouts đã tồn tại.');
        }

        // 2. Kiểm tra và tạo file MainLayout.tsx
        if (!File::exists($mainLayoutFile)) {
            $content = $this->getMainLayoutContent();
            File::put($mainLayoutFile, $content);
            $this->info('-> Đã tạo file: resources/js/Layouts/MainLayout.tsx');
        } else {
            $this->comment('-> File resources/js/Layouts/MainLayout.tsx đã tồn tại.');
        }

        $this->info('✅ Hoàn tất việc "xây nhà"! Bạn đã sẵn sàng để trang trí.');
        return 0;
    }

    /**
     * Trả về nội dung cho file MainLayout.tsx.
     * @return string
     */
    private function getMainLayoutContent(): string
    {
        return <<<TSX
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
TSX;
    }
}