<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\ContractDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\ContractRequest;
use App\Http\Resources\ContractResource;
use App\Models\Contract;
use App\Services\ContractService;
use Illuminate\Http\Request;

class ContractController extends Controller
{

    public function __construct(
        protected ContractService $contractService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $perpage = request('per_page', 10);
        $contract = $this->contractService->getAllPaginated($perpage);

        return response()->json([
            'status' => 'success',
            'data' => ContractResource::collection($contract)
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
            'data' => new ContractResource($contract)
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
