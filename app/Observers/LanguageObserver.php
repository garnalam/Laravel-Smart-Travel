<?php

namespace App\Observers;

use App\Models\Language;

class LanguageObserver
{
    /**
     * Xử lý sự kiện "saving" của model Language.
     *
     * @param  \App\Models\Language  $language
     * @return void
     */
    public function saving(Language $language)
    {
        // Kiểm tra xem ngôn ngữ hiện tại có đang được đặt làm mặc định không
        // và trạng thái 'is_default' của nó có thực sự thay đổi không.
        if ($language->isDirty('is_default') && $language->is_default) {
            // Nếu có, hãy bỏ trạng thái 'is_default' của tất cả các ngôn ngữ khác.
            Language::where('id', '!=', $language->id)->update(['is_default' => false]);
        }
    }
}

