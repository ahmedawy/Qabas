<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\ArabicNormalizerInterface;

class ArabicNormalizerService implements ArabicNormalizerInterface
{
    /**
     * Normalize Arabic text by removing diacritics and unifying character variations.
     */
    public function normalize(string $text): string
    {
        // 1. Remove Arabic diacritics (Harakat) and Tatweel/Kashida
        $diacritics = [
            '~[\x{064B}-\x{0652}]~u', // Fathatan, Dammatan, Kasratan, Fatha, Damma, Kasra, Shadda, Sukun
            '~\x{0640}~u',            // Tatweel (Kashida)
        ];
        $text = (string) preg_replace($diacritics, '', $text);

        // 2. Unify character variations:
        // - Alif Hamzas (أ, إ, آ, ٱ) -> Alif (ا)
        // - Ta Marbuta (ة) -> Ha (ه)
        // - Alif Maksura (ى) -> Ya (ي)
        $replacements = [
            '~[أإآٱ]~u' => 'ا',
            '~ة~u' => 'ه',
            '~ى~u' => 'ي',
        ];

        return (string) preg_replace(array_keys($replacements), array_values($replacements), $text);
    }
}
