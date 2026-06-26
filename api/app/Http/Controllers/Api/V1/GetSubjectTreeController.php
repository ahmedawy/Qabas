<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\SubjectHit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetSubjectTreeController extends Controller
{
    private Subject $subjectModel;

    private SubjectHit $subjectHitModel;

    /**
     * Inject constructor dependencies.
     */
    public function __construct(Subject $subjectModel, SubjectHit $subjectHitModel)
    {
        $this->subjectModel = $subjectModel;
        $this->subjectHitModel = $subjectHitModel;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $subjectId = $request->input('subject_id');
        $parentId = $request->input('parent_id');
        $query = trim((string) $request->input('q', ''));

        // Case 1: Return Hadiths for a specific subject
        if ($subjectId !== null) {
            $subId = (int) $subjectId;
            $hits = $this->subjectHitModel->newQuery()
                ->join('booktoc_hadith as h', 'subjecthit.ParagraphMainID', '=', 'h.MainID')
                ->where('subjecthit.SubjectID', $subId)
                ->select([
                    'h.MainID as MainID',
                    'h.BookName as BookName',
                    'h.ID as HadithNum',
                    'h.PartNum as PartNum',
                    'h.PageNum as PageNum',
                    'h.Tarf as Title',
                    'h.CleanContent as CleanContent',
                    'h.Annotations as Annotations',
                ])
                ->orderBy('h.MainID')
                ->cursorPaginate(50);

            return $this->jsonResponse([
                'hadiths' => $hits->items(),
                'next_cursor' => $hits->nextCursor() ? $hits->nextCursor()->encode() : null,
            ]);
        }

        // Case 2: Search subjects by keyword
        if ($query !== '') {
            $subjects = $this->subjectModel->newQuery()
                ->whereRaw('normalize_arabic(SubjectTitle) LIKE normalize_arabic(?)', ['%'.$query.'%'])
                ->limit(100)
                ->get();

            return $this->jsonResponse([
                'subjects' => $subjects->toArray(),
            ]);
        }

        // Case 3: Browse children of parent_id
        $pid = $parentId !== null ? (int) $parentId : 0;
        $nodes = $this->subjectModel->newQuery()
            ->where('ParentID', $pid)
            ->orderBy('ID')
            ->cursorPaginate(50);

        return $this->jsonResponse([
            'nodes' => $nodes->items(),
            'next_cursor' => $nodes->nextCursor() ? $nodes->nextCursor()->encode() : null,
        ]);
    }
}
