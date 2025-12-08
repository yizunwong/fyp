import {
  AutoClaimCreated as AutoClaimCreatedEvent,
  ClaimApproved as ClaimApprovedEvent,
  ClaimPaid as ClaimPaidEvent,
  ClaimRejected as ClaimRejectedEvent,
  ClaimSubmitted as ClaimSubmittedEvent,
  EligibilityUpdated as EligibilityUpdatedEvent,
  FarmerEnrolled as FarmerEnrolledEvent,
  FundsDeposited as FundsDepositedEvent,
  GovernmentRoleGranted as GovernmentRoleGrantedEvent,
  GovernmentRoleRevoked as GovernmentRoleRevokedEvent,
  OracleUpdated as OracleUpdatedEvent,
  OwnerUpdated as OwnerUpdatedEvent,
  PolicyCreated as PolicyCreatedEvent,
  PolicyStatusUpdated as PolicyStatusUpdatedEvent,
  PolicyUpdated as PolicyUpdatedEvent
} from "../generated/SubsidyPayout/SubsidyPayout"
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
} from "../generated/schema"

export function handleAutoClaimCreated(event: AutoClaimCreatedEvent): void {
  let entity = new AutoClaimCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.claimId = event.params.claimId
  entity.policyId = event.params.policyId
  entity.farmer = event.params.farmer

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleClaimApproved(event: ClaimApprovedEvent): void {
  let entity = new ClaimApproved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.claimId = event.params.claimId
  entity.policyId = event.params.policyId
  entity.farmer = event.params.farmer
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleClaimPaid(event: ClaimPaidEvent): void {
  let entity = new ClaimPaid(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.claimId = event.params.claimId
  entity.policyId = event.params.policyId
  entity.farmer = event.params.farmer
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleClaimRejected(event: ClaimRejectedEvent): void {
  let entity = new ClaimRejected(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.claimId = event.params.claimId
  entity.policyId = event.params.policyId
  entity.farmer = event.params.farmer
  entity.reason = event.params.reason

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleClaimSubmitted(event: ClaimSubmittedEvent): void {
  let entity = new ClaimSubmitted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.claimId = event.params.claimId
  entity.policyId = event.params.policyId
  entity.farmer = event.params.farmer
  entity.amount = event.params.amount
  entity.metadataHash = event.params.metadataHash

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleEligibilityUpdated(event: EligibilityUpdatedEvent): void {
  let entity = new EligibilityUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.policyId = event.params.policyId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFarmerEnrolled(event: FarmerEnrolledEvent): void {
  let entity = new FarmerEnrolled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.farmer = event.params.farmer
  entity.policyId = event.params.policyId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFundsDeposited(event: FundsDepositedEvent): void {
  let entity = new FundsDeposited(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGovernmentRoleGranted(
  event: GovernmentRoleGrantedEvent
): void {
  let entity = new GovernmentRoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGovernmentRoleRevoked(
  event: GovernmentRoleRevokedEvent
): void {
  let entity = new GovernmentRoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOracleUpdated(event: OracleUpdatedEvent): void {
  let entity = new OracleUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.oracle = event.params.oracle

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnerUpdated(event: OwnerUpdatedEvent): void {
  let entity = new OwnerUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePolicyCreated(event: PolicyCreatedEvent): void {
  let entity = new PolicyCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.policyId = event.params.policyId
  entity.name = event.params.name
  entity.policyType = event.params.policyType
  entity.status = event.params.status
  entity.startDate = event.params.startDate
  entity.endDate = event.params.endDate
  entity.metadataHash = event.params.metadataHash
  entity.payoutAmount = event.params.payoutAmount
  entity.payoutMaxCap = event.params.payoutMaxCap

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePolicyStatusUpdated(
  event: PolicyStatusUpdatedEvent
): void {
  let entity = new PolicyStatusUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.policyId = event.params.policyId
  entity.status = event.params.status

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePolicyUpdated(event: PolicyUpdatedEvent): void {
  let entity = new PolicyUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.policyId = event.params.policyId
  entity.payoutAmount = event.params.payoutAmount
  entity.payoutMaxCap = event.params.payoutMaxCap

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
