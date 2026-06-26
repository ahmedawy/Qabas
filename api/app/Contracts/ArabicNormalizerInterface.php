<?php

declare(strict_types=1);

namespace App\Contracts;

interface ArabicNormalizerInterface
{
    /**
     * Normalize Arabic text by removing diacritics and unifying character variations.
     */
    public function normalize(string $text): string;
}
