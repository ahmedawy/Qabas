<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LexiconDescription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetLexiconWordController extends Controller
{
    private LexiconDescription $lexiconDescriptionModel;

    /**
     * Inject model constructor dependencies.
     */
    public function __construct(LexiconDescription $lexiconDescriptionModel)
    {
        $this->lexiconDescriptionModel = $lexiconDescriptionModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $wordId = (int) $request->input('word_id');
        if ($wordId <= 0) {
            return $this->errorResponse('Invalid Word ID', 400);
        }

        /** @var LexiconDescription|null $desc */
        $desc = $this->lexiconDescriptionModel->newQuery()
            ->where('LexiconItemID', $wordId)
            ->with(['serviceContent'])
            ->first();

        if (! $desc) {
            return $this->errorResponse('Definition not found in lexicon mapping', 404);
        }

        $content = $desc->serviceContent?->CleanContent ?? $desc->serviceContent?->Content;
        $annotations = $desc->serviceContent?->Annotations;

        if (! $content) {
            return $this->errorResponse('Definition text not found in services table', 404);
        }

        return $this->jsonResponse([
            'word_id' => $wordId,
            'descrp_id' => $desc->DescrpMainID,
            'content' => $content,
            'annotations' => $annotations,
        ]);
    }
}
