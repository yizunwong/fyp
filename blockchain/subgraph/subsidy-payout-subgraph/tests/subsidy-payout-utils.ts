import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  AutoClaimCreated,
  ClaimApproved,
  ClaimPaid,
  ClaimRejected,
  ClaimSubmitted,
  EligibilityUpdated,
  FarmerEnrolled,
  FundsDeposited,
  GovernmentRoleGranted,
  GovernmentRoleRevoked,
  OracleUpdated,
  OwnerUpdated,
  PolicyCreated,
  PolicyStatusUpdated,
  PolicyUpdated
} from "../generated/SubsidyPayout/SubsidyPayout"

export function createAutoClaimCreatedEvent(
  claimId: BigInt,
  policyId: BigInt,
  farmer: Address
): AutoClaimCreated {
  let autoClaimCreatedEvent = changetype<AutoClaimCreated>(newMockEvent())

  autoClaimCreatedEvent.parameters = new Array()

  autoClaimCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "claimId",
      ethereum.Value.fromUnsignedBigInt(claimId)
    )
  )
  autoClaimCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "policyId",
      ethereum.Value.fromUnsignedBigInt(policyId)
    )
  )
  autoClaimCreatedEvent.parameters.push(
    new ethereum.EventParam("farmer", ethereum.Value.fromAddress(farmer))
  )

  return autoClaimCreatedEvent
}

export function createClaimApprovedEvent(
  claimId: BigInt,
  policyId: BigInt,
  farmer: Address,
  amount: BigInt
): ClaimApproved {
  let claimApprovedEvent = changetype<ClaimApproved>(newMockEvent())

  claimApprovedEvent.parameters = new Array()

  claimApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "claimId",
      ethereum.Value.fromUnsignedBigInt(claimId)
    )
  )
  claimApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "policyId",
      ethereum.Value.fromUnsignedBigInt(policyId)
    )
  )
  claimApprovedEvent.parameters.push(
    new ethereum.EventParam("farmer", ethereum.Value.fromAddress(farmer))
  )
  claimApprovedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return claimApprovedEvent
}

export function createClaimPaidEvent(
  claimId: BigInt,
  policyId: BigInt,
  farmer: Address,
  amount: BigInt
): ClaimPaid {
  let claimPaidEvent = changetype<ClaimPaid>(newMockEvent())

  claimPaidEvent.parameters = new Array()

  claimPaidEvent.parameters.push(
    new ethereum.EventParam(
      "claimId",
      ethereum.Value.fromUnsignedBigInt(claimId)
    )
  )
  claimPaidEvent.parameters.push(
    new ethereum.EventParam(
      "policyId",
      ethereum.Value.fromUnsignedBigInt(policyId)
    )
  )
  claimPaidEvent.parameters.push(
    new ethereum.EventParam("farmer", ethereum.Value.fromAddress(farmer))
  )
  claimPaidEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return claimPaidEvent
}

export function createClaimRejectedEvent(
  claimId: BigInt,
  policyId: BigInt,
  farmer: Address,
  reason: string
): ClaimRejected {
  let claimRejectedEvent = changetype<ClaimRejected>(newMockEvent())

  claimRejectedEvent.parameters = new Array()

  claimRejectedEvent.parameters.push(
    new ethereum.EventParam(
      "claimId",
      ethereum.Value.fromUnsignedBigInt(claimId)
    )
  )
  claimRejectedEvent.parameters.push(
    new ethereum.EventParam(
      "policyId",
      ethereum.Value.fromUnsignedBigInt(policyId)
    )
  )
  claimRejectedEvent.parameters.push(
    new ethereum.EventParam("farmer", ethereum.Value.fromAddress(farmer))
  )
  claimRejectedEvent.parameters.push(
    new ethereum.EventParam("reason", ethereum.Value.fromString(reason))
  )

  return claimRejectedEvent
}

export function createClaimSubmittedEvent(
  claimId: BigInt,
  policyId: BigInt,
  farmer: Address,
  amount: BigInt,
  metadataHash: Bytes
): ClaimSubmitted {
  let claimSubmittedEvent = changetype<ClaimSubmitted>(newMockEvent())

  claimSubmittedEvent.parameters = new Array()

  claimSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "claimId",
      ethereum.Value.fromUnsignedBigInt(claimId)
    )
  )
  claimSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "policyId",
      ethereum.Value.fromUnsignedBigInt(policyId)
    )
  )
  claimSubmittedEvent.parameters.push(
    new ethereum.EventParam("farmer", ethereum.Value.fromAddress(farmer))
  )
  claimSubmittedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  claimSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "metadataHash",
      ethereum.Value.fromFixedBytes(metadataHash)
    )
  )

  return claimSubmittedEvent
}

export function createEligibilityUpdatedEvent(
  policyId: BigInt
): EligibilityUpdated {
  let eligibilityUpdatedEvent = changetype<EligibilityUpdated>(newMockEvent())

  eligibilityUpdatedEvent.parameters = new Array()

  eligibilityUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "policyId",
      ethereum.Value.fromUnsignedBigInt(policyId)
    )
  )

  return eligibilityUpdatedEvent
}

export function createFarmerEnrolledEvent(
  farmer: Address,
  policyId: BigInt
): FarmerEnrolled {
  let farmerEnrolledEvent = changetype<FarmerEnrolled>(newMockEvent())

  farmerEnrolledEvent.parameters = new Array()

  farmerEnrolledEvent.parameters.push(
    new ethereum.EventParam("farmer", ethereum.Value.fromAddress(farmer))
  )
  farmerEnrolledEvent.parameters.push(
    new ethereum.EventParam(
      "policyId",
      ethereum.Value.fromUnsignedBigInt(policyId)
    )
  )

  return farmerEnrolledEvent
}

export function createFundsDepositedEvent(
  from: Address,
  amount: BigInt
): FundsDeposited {
  let fundsDepositedEvent = changetype<FundsDeposited>(newMockEvent())

  fundsDepositedEvent.parameters = new Array()

  fundsDepositedEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  fundsDepositedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return fundsDepositedEvent
}

export function createGovernmentRoleGrantedEvent(
  account: Address
): GovernmentRoleGranted {
  let governmentRoleGrantedEvent =
    changetype<GovernmentRoleGranted>(newMockEvent())

  governmentRoleGrantedEvent.parameters = new Array()

  governmentRoleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return governmentRoleGrantedEvent
}

export function createGovernmentRoleRevokedEvent(
  account: Address
): GovernmentRoleRevoked {
  let governmentRoleRevokedEvent =
    changetype<GovernmentRoleRevoked>(newMockEvent())

  governmentRoleRevokedEvent.parameters = new Array()

  governmentRoleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return governmentRoleRevokedEvent
}

export function createOracleUpdatedEvent(oracle: Address): OracleUpdated {
  let oracleUpdatedEvent = changetype<OracleUpdated>(newMockEvent())

  oracleUpdatedEvent.parameters = new Array()

  oracleUpdatedEvent.parameters.push(
    new ethereum.EventParam("oracle", ethereum.Value.fromAddress(oracle))
  )

  return oracleUpdatedEvent
}

export function createOwnerUpdatedEvent(owner: Address): OwnerUpdated {
  let ownerUpdatedEvent = changetype<OwnerUpdated>(newMockEvent())

  ownerUpdatedEvent.parameters = new Array()

  ownerUpdatedEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )

  return ownerUpdatedEvent
}

export function createPolicyCreatedEvent(
  policyId: BigInt,
  name: string,
  policyType: i32,
  status: i32,
  startDate: BigInt,
  endDate: BigInt,
  metadataHash: Bytes,
  payoutAmount: BigInt,
  payoutMaxCap: BigInt
): PolicyCreated {
  let policyCreatedEvent = changetype<PolicyCreated>(newMockEvent())

  policyCreatedEvent.parameters = new Array()

  policyCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "policyId",
      ethereum.Value.fromUnsignedBigInt(policyId)
    )
  )
  policyCreatedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  policyCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "policyType",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(policyType))
    )
  )
  policyCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )
  policyCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "startDate",
      ethereum.Value.fromUnsignedBigInt(startDate)
    )
  )
  policyCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "endDate",
      ethereum.Value.fromUnsignedBigInt(endDate)
    )
  )
  policyCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "metadataHash",
      ethereum.Value.fromFixedBytes(metadataHash)
    )
  )
  policyCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "payoutAmount",
      ethereum.Value.fromUnsignedBigInt(payoutAmount)
    )
  )
  policyCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "payoutMaxCap",
      ethereum.Value.fromUnsignedBigInt(payoutMaxCap)
    )
  )

  return policyCreatedEvent
}

export function createPolicyStatusUpdatedEvent(
  policyId: BigInt,
  status: i32
): PolicyStatusUpdated {
  let policyStatusUpdatedEvent = changetype<PolicyStatusUpdated>(newMockEvent())

  policyStatusUpdatedEvent.parameters = new Array()

  policyStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "policyId",
      ethereum.Value.fromUnsignedBigInt(policyId)
    )
  )
  policyStatusUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "status",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(status))
    )
  )

  return policyStatusUpdatedEvent
}

export function createPolicyUpdatedEvent(
  policyId: BigInt,
  payoutAmount: BigInt,
  payoutMaxCap: BigInt
): PolicyUpdated {
  let policyUpdatedEvent = changetype<PolicyUpdated>(newMockEvent())

  policyUpdatedEvent.parameters = new Array()

  policyUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "policyId",
      ethereum.Value.fromUnsignedBigInt(policyId)
    )
  )
  policyUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "payoutAmount",
      ethereum.Value.fromUnsignedBigInt(payoutAmount)
    )
  )
  policyUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "payoutMaxCap",
      ethereum.Value.fromUnsignedBigInt(payoutMaxCap)
    )
  )

  return policyUpdatedEvent
}
