export interface SubsidyClaim {
  id: string;
  claimId: string;
  farmerName: string;
  farmId: string;
  farmName: string;
  location: string;
  triggerType: "manual" | "oracle";
  policy: string;
  claimValue: number;
  onChainRef: string;
  status: "pending" | "approved" | "rejected" | "docs_required" | "flagged";
  submittedDate: string;
  farmerIC: string;
  cropCycle?: string;
  weatherTrigger?: {
    event: string;
    date: string;
    rainfallDepth: number;
    severity: string;
  };
  documents: {
    name: string;
    status: "verified" | "pending" | "missing";
  }[];
  blockchainHash: string;
  flagReason?: string;
}

export const mockClaims: SubsidyClaim[] = [
  {
    id: "1",
    claimId: "SUB-2025-0142",
    farmerName: "Ahmad bin Abdullah",
    farmId: "FARM-001",
    farmName: "Green Valley Farm",
    location: "Kuala Terengganu, Terengganu",
    triggerType: "oracle",
    policy: "Flood Relief Fund 2025",
    claimValue: 5000,
    onChainRef:
      "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385",
    status: "pending",
    submittedDate: "2025-11-25",
    farmerIC: "850123-01-5678",
    cropCycle: "Paddy Season 2 - 2025",
    weatherTrigger: {
      event: "Heavy Rainfall Alert",
      date: "2025-11-24",
      rainfallDepth: 120,
      severity: "Critical",
    },
    documents: [
      { name: "Farm Registration Certificate", status: "verified" },
      { name: "Crop Declaration Form", status: "verified" },
      { name: "Bank Account Details", status: "verified" },
    ],
    blockchainHash:
      "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385",
  },
  {
    id: "2",
    claimId: "SUB-2025-0138",
    farmerName: "Siti Nurhaliza binti Hassan",
    farmId: "FARM-045",
    farmName: "Sunrise Organic Farm",
    location: "Cameron Highlands, Pahang",
    triggerType: "manual",
    policy: "Organic Farming Support Grant",
    claimValue: 3500,
    onChainRef:
      "0x8a1bcd3f2e4d5678901234567890abcdef1234567890abcdef1234567890abcd",
    status: "pending",
    submittedDate: "2025-11-24",
    farmerIC: "900315-14-2345",
    cropCycle: "Vegetables Q4 - 2025",
    documents: [
      { name: "Farm Registration Certificate", status: "verified" },
      { name: "Organic Certification", status: "verified" },
      { name: "Bank Account Details", status: "pending" },
    ],
    blockchainHash:
      "0x8a1bcd3f2e4d5678901234567890abcdef1234567890abcdef1234567890abcd",
  },
  {
    id: "3",
    claimId: "SUB-2025-0135",
    farmerName: "Kumar Selvam",
    farmId: "FARM-078",
    farmName: "Highland Plantation",
    location: "Kota Bharu, Kelantan",
    triggerType: "manual",
    policy: "Smart Farming Technology Subsidy",
    claimValue: 7000,
    onChainRef:
      "0x3c5d7e9f1a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d",
    status: "flagged",
    submittedDate: "2025-11-23",
    farmerIC: "880722-12-3456",
    cropCycle: "Mixed Crops - 2025",
    documents: [
      { name: "Farm Registration Certificate", status: "verified" },
      { name: "Technology Purchase Invoice", status: "pending" },
      { name: "Bank Account Details", status: "missing" },
    ],
    blockchainHash:
      "0x3c5d7e9f1a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d",
    flagReason:
      "Duplicate submission detected - Similar claim filed 15 days ago",
  },
  {
    id: "4",
    claimId: "SUB-2025-0131",
    farmerName: "Tan Mei Ling",
    farmId: "FARM-023",
    farmName: "Eco Valley Farms",
    location: "Alor Setar, Kedah",
    triggerType: "oracle",
    policy: "Drought Assistance Program",
    claimValue: 4200,
    onChainRef:
      "0x9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
    status: "docs_required",
    submittedDate: "2025-11-22",
    farmerIC: "920518-02-6789",
    cropCycle: "Paddy Season 1 - 2025",
    weatherTrigger: {
      event: "Prolonged Drought",
      date: "2025-11-20",
      rainfallDepth: 3,
      severity: "High",
    },
    documents: [
      { name: "Farm Registration Certificate", status: "verified" },
      { name: "Crop Loss Assessment", status: "missing" },
      { name: "Bank Account Details", status: "verified" },
    ],
    blockchainHash:
      "0x9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
  },
];

export default mockClaims;