<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class GetSpecificServiceItemController extends Controller
{
    public function __invoke($mainId): JsonResponse
    {
        $service = DB::table('booktoc_services')
            ->where('MainID', (int) $mainId)
            ->first();

        if (!$service) {
            return response()->json([
                'status' => 'error',
                'message' => 'Service item not found'
            ], 404);
        }

        $fullContent = $service->CleanContent;
        $nextId = $service->NextParagraphID;
        $parentId = $service->ParentID;
        
        // Traverse linked list segments with parent safety check
        while ($nextId != 0) {
            $nextNode = DB::table('booktoc_services')->where('MainID', $nextId)->first();
            if (!$nextNode || $nextNode->ParentID != $parentId) break;
            $fullContent .= "\n" . $nextNode->CleanContent;
            $nextId = $nextNode->NextParagraphID;
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'book_name' => $service->BookName,
                'content' => $fullContent,
                'part' => $service->PartNum,
                'page' => $service->PageNum
            ]
        ]);
    }
}
