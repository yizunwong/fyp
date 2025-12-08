import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { AutoClaimCreated } from "../generated/schema"
import { AutoClaimCreated as AutoClaimCreatedEvent } from "../generated/SubsidyPayout/SubsidyPayout"
import { handleAutoClaimCreated } from "../src/subsidy-payout"
import { createAutoClaimCreatedEvent } from "./subsidy-payout-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let claimId = BigInt.fromI32(234)
    let policyId = BigInt.fromI32(234)
    let farmer = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newAutoClaimCreatedEvent = createAutoClaimCreatedEvent(
      claimId,
      policyId,
      farmer
    )
    handleAutoClaimCreated(newAutoClaimCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("AutoClaimCreated created and stored", () => {
    assert.entityCount("AutoClaimCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "AutoClaimCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "claimId",
      "234"
    )
    assert.fieldEquals(
      "AutoClaimCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "policyId",
      "234"
    )
    assert.fieldEquals(
      "AutoClaimCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "farmer",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
