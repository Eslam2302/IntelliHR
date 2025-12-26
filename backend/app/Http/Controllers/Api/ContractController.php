<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\ContractDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\ContractRequest;
use App\Http\Resources\ContractResource;
use App\Models\Contract;
use App\Services\ContractService;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ContractController extends Controller implements HasMiddleware
{
    public function __construct(
        protected ContractService $contractService
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-contracts', only: ['index']),
            new Middleware('permission:view-contract', only: ['show']),
            new Middleware('permission:create-contract', only: ['store']),
            new Middleware('permission:edit-contract', only: ['update']),
            new Middleware('permission:delete-contract', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search', 'deleted']);
        $contract = $this->contractService->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => ContractResource::collection($contract),
            'meta' => [
                'current_page' => $contract->currentPage(),
                'per_page' => $contract->perPage(),
                'total' => $contract->total(),
                'last_page' => $contract->lastPage(),
            ],
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ContractRequest $request)
    {
        $dto = ContractDTO::fromRequest($request);
        $contract = $this->contractService->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Contract created successfully.',
            'data' => new ContractResource($contract),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Contract $contract)
    {
        return response()->json([
            'status' => 'success',
            'data' => new ContractResource($contract),
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ContractRequest $request, Contract $contract)
    {
        $dto = ContractDTO::fromRequest($request);
        $Updatedcontract = $this->contractService->update($contract, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Contract Updated successfully.',
            'data' => new ContractResource($Updatedcontract),
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Contract $contract)
    {
        $deletedContract = $this->contractService->delete($contract);

        return response()->json([
            'status' => 'success',
            'message' => 'Contract Deleted successfully.',
        ], 200);
    }
}
