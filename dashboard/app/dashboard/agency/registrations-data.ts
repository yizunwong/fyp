export interface FarmDocument {
  id: string;
  name: string;
  type: string;
  status: "verified" | "pending" | "rejected" | "missing";
  uploadedDate: string;
  fileUrl?: string;
  verifiedBy?: string;
  verifiedDate?: string;
}

export interface FarmRegistration {
  id: string;
  farmId: string;
  farmerName: string;
  farmerIC: string;
  farmerPhone: string;
  farmerEmail: string;
  size: number;
  cropType: string[];
  location: {
    state: string;
    district: string;
    address: string;
  };
  gps: {
    latitude: number;
    longitude: number;
  };
  certificationStatus: "pending" | "mygap" | "organic" | "none";
  documents: FarmDocument[];
  blockchainStatus: "pending" | "on-chain" | "failed";
  blockchainHash?: string;
  submittedDate: string;
  status: "pending_review" | "approved" | "rejected" | "docs_required";
  reviewNotes?: string;
}

export const mockRegistrations: FarmRegistration[] = [
  {
    id: "1",
    farmId: "FARM-001",
    farmerName: "Mohd Faizal bin Ahmad",
    farmerIC: "850615-10-5432",
    farmerPhone: "+60123456789",
    farmerEmail: "faizal@email.com",
    size: 12.5,
    cropType: ["Paddy", "Vegetables"],
    location: {
      state: "Kedah",
      district: "Kubang Pasu",
      address: "Lot 123, Kampung Sungai Limau, 06100 Kodiang, Kedah",
    },
    gps: {
      latitude: 6.1234,
      longitude: 100.5678,
    },
    certificationStatus: "mygap",
    documents: [
      {
        id: "doc1",
        name: "Land Title Document",
        type: "land_title",
        status: "verified",
        uploadedDate: "2025-11-20",
        verifiedBy: "Officer Ahmad",
        verifiedDate: "2025-11-21",
      },
      {
        id: "doc2",
        name: "MyGAP Certificate",
        type: "mygap_cert",
        status: "verified",
        uploadedDate: "2025-11-20",
        verifiedBy: "Officer Ahmad",
        verifiedDate: "2025-11-21",
      },
      {
        id: "doc3",
        name: "Business Registration (SSM)",
        type: "business_reg",
        status: "pending",
        uploadedDate: "2025-11-20",
      },
      {
        id: "doc4",
        name: "Farmer ID Card",
        type: "farmer_id",
        status: "verified",
        uploadedDate: "2025-11-20",
        verifiedBy: "Officer Ahmad",
        verifiedDate: "2025-11-21",
      },
    ],
    blockchainStatus: "pending",
    submittedDate: "2025-11-20",
    status: "pending_review",
  },
  {
    id: "2",
    farmId: "FARM-045",
    farmerName: "Tan Mei Ling",
    farmerIC: "920308-14-6789",
    farmerPhone: "+60187654321",
    farmerEmail: "meiling@email.com",
    size: 8.0,
    cropType: ["Vegetables", "Herbs"],
    location: {
      state: "Pahang",
      district: "Cameron Highlands",
      address: "Jalan Besar, Tanah Rata, 39000 Cameron Highlands, Pahang",
    },
    gps: {
      latitude: 4.4672,
      longitude: 101.3786,
    },
    certificationStatus: "organic",
    documents: [
      {
        id: "doc5",
        name: "Land Title Document",
        type: "land_title",
        status: "verified",
        uploadedDate: "2025-11-18",
      },
      {
        id: "doc6",
        name: "Organic Certification",
        type: "organic_cert",
        status: "verified",
        uploadedDate: "2025-11-18",
      },
      {
        id: "doc7",
        name: "Business Registration (SSM)",
        type: "business_reg",
        status: "missing",
        uploadedDate: "2025-11-18",
      },
      {
        id: "doc8",
        name: "Farmer ID Card",
        type: "farmer_id",
        status: "verified",
        uploadedDate: "2025-11-18",
      },
    ],
    blockchainStatus: "pending",
    submittedDate: "2025-11-18",
    status: "docs_required",
  },
  {
    id: "3",
    farmId: "FARM-078",
    farmerName: "Kumar Selvam",
    farmerIC: "880722-12-3456",
    farmerPhone: "+60199876543",
    farmerEmail: "kumar@email.com",
    size: 15.0,
    cropType: ["Fruits", "Palm Oil"],
    location: {
      state: "Johor",
      district: "Kluang",
      address: "Jalan Plantation, 86000 Kluang, Johor",
    },
    gps: {
      latitude: 2.0333,
      longitude: 103.3167,
    },
    certificationStatus: "pending",
    documents: [
      {
        id: "doc9",
        name: "Land Title Document",
        type: "land_title",
        status: "verified",
        uploadedDate: "2025-11-15",
      },
      {
        id: "doc10",
        name: "MyGAP Certificate",
        type: "mygap_cert",
        status: "pending",
        uploadedDate: "2025-11-15",
      },
      {
        id: "doc11",
        name: "Business Registration (SSM)",
        type: "business_reg",
        status: "verified",
        uploadedDate: "2025-11-15",
      },
      {
        id: "doc12",
        name: "Farmer ID Card",
        type: "farmer_id",
        status: "verified",
        uploadedDate: "2025-11-15",
      },
    ],
    blockchainStatus: "on-chain",
    blockchainHash:
      "0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385",
    submittedDate: "2025-11-15",
    status: "approved",
  },
];

export default mockRegistrations;