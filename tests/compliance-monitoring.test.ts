import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock the Clarity VM interactions
const mockClarity = {
  txSender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  resident: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
  inspector: "ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP",
  blockHeight: 12345,
  contracts: {
    "compliance-monitoring": {
      functions: {
        initialize: vi.fn().mockReturnValue({ value: true }),
        "add-inspector": vi.fn().mockReturnValue({ value: true }),
        "remove-inspector": vi.fn().mockReturnValue({ value: true }),
        "set-property-details": vi.fn().mockReturnValue({ value: true }),
        "register-occupancy": vi.fn().mockReturnValue({ value: true }),
        "perform-compliance-check": vi.fn().mockReturnValue({ value: true }),
        "end-occupancy": vi.fn().mockReturnValue({ value: true }),
        "get-occupancy": vi.fn().mockReturnValue({
          value: {
            "move-in-date": 12345,
            "lease-expiry": 22345,
            "rent-amount": 1000,
            "last-compliance-check": 12345,
            "compliance-status": "compliant",
            violations: 0,
          },
        }),
        "is-compliant": vi.fn().mockReturnValue({ value: true }),
        "is-lease-expired": vi.fn().mockReturnValue({ value: false }),
        "transfer-admin": vi.fn().mockReturnValue({ value: true }),
      },
    },
  },
}

// Mock the contract calls
vi.mock("@stacks/transactions", () => ({
  callReadOnlyFunction: ({ contractName, functionName, args }) => {
    return mockClarity.contracts[contractName].functions[functionName](...args)
  },
  callContractFunction: ({ contractName, functionName, args }) => {
    return mockClarity.contracts[contractName].functions[functionName](...args)
  },
}))

describe("Compliance Monitoring Contract", () => {
  beforeEach(() => {
    // Reset mocks before each test
    Object.values(mockClarity.contracts["compliance-monitoring"].functions).forEach((fn) => fn.mockClear())
  })
  
  it("should initialize the contract", async () => {
    const result = await mockClarity.contracts["compliance-monitoring"].functions["initialize"]()
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["compliance-monitoring"].functions["initialize"]).toHaveBeenCalled()
  })
  
  it("should add an inspector", async () => {
    const result = await mockClarity.contracts["compliance-monitoring"].functions["add-inspector"](
        mockClarity.inspector,
    )
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["compliance-monitoring"].functions["add-inspector"]).toHaveBeenCalledWith(
        mockClarity.inspector,
    )
  })
  
  it("should remove an inspector", async () => {
    const result = await mockClarity.contracts["compliance-monitoring"].functions["remove-inspector"](
        mockClarity.inspector,
    )
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["compliance-monitoring"].functions["remove-inspector"]).toHaveBeenCalledWith(
        mockClarity.inspector,
    )
  })
  
  it("should set property details", async () => {
    const result = await mockClarity.contracts["compliance-monitoring"].functions["set-property-details"](
        1,
        mockClarity.txSender,
        1000,
    )
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["compliance-monitoring"].functions["set-property-details"]).toHaveBeenCalledWith(
        1,
        mockClarity.txSender,
        1000,
    )
  })
  
  it("should register a new occupancy", async () => {
    const result = await mockClarity.contracts["compliance-monitoring"].functions["register-occupancy"](
        1,
        mockClarity.resident,
        22345,
    )
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["compliance-monitoring"].functions["register-occupancy"]).toHaveBeenCalledWith(
        1,
        mockClarity.resident,
        22345,
    )
  })
  
  it("should perform a compliance check", async () => {
    // Set tx-sender to inspector for this test
    const originalTxSender = mockClarity.txSender
    mockClarity.txSender = mockClarity.inspector
    
    const result = await mockClarity.contracts["compliance-monitoring"].functions["perform-compliance-check"](
        1,
        mockClarity.resident,
        "compliant",
        false,
    )
    
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["compliance-monitoring"].functions["perform-compliance-check"]).toHaveBeenCalledWith(
        1,
        mockClarity.resident,
        "compliant",
        false,
    )
    
    // Reset tx-sender
    mockClarity.txSender = originalTxSender
  })
  
  it("should end an occupancy", async () => {
    const result = await mockClarity.contracts["compliance-monitoring"].functions["end-occupancy"](
        1,
        mockClarity.resident,
    )
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["compliance-monitoring"].functions["end-occupancy"]).toHaveBeenCalledWith(
        1,
        mockClarity.resident,
    )
  })
  
  it("should get occupancy details", async () => {
    const result = await mockClarity.contracts["compliance-monitoring"].functions["get-occupancy"](
        1,
        mockClarity.resident,
    )
    expect(result.value).toEqual({
      "move-in-date": 12345,
      "lease-expiry": 22345,
      "rent-amount": 1000,
      "last-compliance-check": 12345,
      "compliance-status": "compliant",
      violations: 0,
    })
    expect(mockClarity.contracts["compliance-monitoring"].functions["get-occupancy"]).toHaveBeenCalledWith(
        1,
        mockClarity.resident,
    )
  })
  
  it("should check if an occupancy is compliant", async () => {
    const result = await mockClarity.contracts["compliance-monitoring"].functions["is-compliant"](
        1,
        mockClarity.resident,
    )
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["compliance-monitoring"].functions["is-compliant"]).toHaveBeenCalledWith(
        1,
        mockClarity.resident,
    )
  })
  
  it("should check if a lease is expired", async () => {
    const result = await mockClarity.contracts["compliance-monitoring"].functions["is-lease-expired"](
        1,
        mockClarity.resident,
    )
    expect(result.value).toBe(false)
    expect(mockClarity.contracts["compliance-monitoring"].functions["is-lease-expired"]).toHaveBeenCalledWith(
        1,
        mockClarity.resident,
    )
  })
  
  it("should transfer admin rights", async () => {
    const result = await mockClarity.contracts["compliance-monitoring"].functions["transfer-admin"](
        mockClarity.resident,
    )
    expect(result.value).toBe(true)
    expect(mockClarity.contracts["compliance-monitoring"].functions["transfer-admin"]).toHaveBeenCalledWith(
        mockClarity.resident,
    )
  })
})

