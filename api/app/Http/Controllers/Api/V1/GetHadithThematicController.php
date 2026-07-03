<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\SubjectHit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetHadithThematicController extends Controller
{
    private SubjectHit $subjectHitModel;

    public function __construct(SubjectHit $subjectHitModel)
    {
        $this->subjectHitModel = $subjectHitModel;
    }

    public function __invoke(Request $request): JsonResponse
    {
        $id = (int) $request->input('id');
        if ($id <= 0) {
            return $this->errorResponse('Invalid Hadith ID', 400);
        }

        $hits = $this->subjectHitModel->newQuery()
            ->where('ParagraphMainID', $id)
            ->with(['subject'])
            ->get();

        $nodes = [];
        foreach ($hits as $hit) {
            if ($hit->subject) {
                $nodes[] = [
                    'ID' => $hit->subject->ID,
                    'Text' => $hit->subject->SubjectTitle,
                    'path' => $this->getSubjectPath($hit->subject),
                ];
            }
        }

        $hadith = \Illuminate\Support\Facades\DB::table('booktoc_hadith')->where('MainID', $id)->first();
        $book_name_primary = $hadith ? $hadith->BookName : '';
        $hadith_num_primary = $hadith ? $hadith->ID : '';

        return $this->jsonResponse([
            'success' => true,
            'book_name' => $book_name_primary,
            'hadith_num' => $hadith_num_primary,
            'nodes' => $nodes,
        ]);
    }

    private function getSubjectPath(Subject $subject): array
    {
        $path = [[
            'ID' => $subject->ID,
            'Title' => $subject->SubjectTitle,
        ]];
        $current = $subject;
        while ($current->ParentID && $current->ParentID > 0) {
            $parent = Subject::find($current->ParentID);
            if (!$parent) {
                break;
            }
            array_unshift($path, [
                'ID' => $parent->ID,
                'Title' => $parent->SubjectTitle,
            ]);
            $current = $parent;
        }
        return $path;
    }
}
