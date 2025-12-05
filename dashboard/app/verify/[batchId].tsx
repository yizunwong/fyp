import React from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { format } from "date-fns";
import { useLocalSearchParams } from "expo-router";

import { useVerifyBatchQuery } from "@/hooks/useVerify";

export default function VerifyBatchScreen() {
  const params = useLocalSearchParams<{ batchId?: string }>();
  const { data: batchRespond, isLoading, error } = useVerifyBatchQuery(
    params.batchId || ""
  );
  const batch = batchRespond?.data;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={{ marginTop: 10, color: "#555" }}>
          Verifying batch on blockchain...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
          backgroundColor: "#111827",
        }}
      >
        <Text style={{ color: "#f87171", fontSize: 18, fontWeight: "600" }}>
          Verification Failed
        </Text>
        <Text style={{ color: "#f3f4f6", marginTop: 8, textAlign: "center" }}>
          {String(error)}
        </Text>
      </View>
    );
  }

  if (!batch) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
          backgroundColor: "#0f172a",
        }}
      >
        <Text style={{ color: "#f8fafc" }}>No verification data found.</Text>
      </View>
    );
  }

  const blockchain = batch.blockchain;
  const produce = batch.produce;
  const certifications = produce?.certifications as
    | { documents?: Record<string, unknown>[] }
    | undefined
    | null;
  const certificateDocs =
    certifications && Array.isArray(certifications.documents)
      ? certifications.documents
      : [];
  const hasHashes =
    typeof blockchain?.onChainHash === "string" &&
    typeof blockchain?.offChainHash === "string";
  console.log("Blockchain data:", blockchain.onChainHash);
  const verified =
    hasHashes && blockchain.onChainHash === blockchain.offChainHash;
  const etherscanUrl = blockchain?.blockchainTx
    ? `https://etherscan.io/tx/${blockchain.blockchainTx}`
    : null;

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        backgroundColor: "#f9fafb",
        flexGrow: 1,
      }}
    >
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 20,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: verified ? "#16a34a" : hasHashes ? "#b91c1c" : "#f97316",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          {verified
            ? "Produce Verified"
            : hasHashes
            ? "Verification Failed"
            : "Verification Pending"}
        </Text>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: "bold" }}>Batch ID:</Text>
          <Text>{batch.batchId ?? "Unknown"}</Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: "bold" }}>Produce Name:</Text>
          <Text>{produce?.name ?? "Unknown"}</Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: "bold" }}>Harvest Date:</Text>
          <Text>
            {produce?.harvestDate
              ? format(new Date(produce.harvestDate), "dd MMM yyyy")
              : "Unavailable"}
          </Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: "bold" }}>Farm:</Text>
          <Text>{produce?.farm || "Unknown"}</Text>
        </View>

        {certificateDocs.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: "bold" }}>Certifications:</Text>
            {certificateDocs.map((doc, idx) => {
              const name = (doc as { name?: string })?.name ?? "Document";
              const type =
                (doc as { certificateType?: string })?.certificateType ??
                "Unknown";
              const uri = (doc as { uri?: string })?.uri;
              const verifiedOnChain =
                (doc as { verifiedOnChain?: boolean })?.verifiedOnChain;
              return (
                <View
                  key={`${name}-${idx}`}
                  style={{
                    paddingVertical: 6,
                    borderBottomWidth:
                      idx === certificateDocs.length - 1 ? 0 : 1,
                    borderColor: "#e5e7eb",
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>{name}</Text>
                  <Text style={{ color: "#4b5563" }}>Type: {type}</Text>
                  {typeof verifiedOnChain === "boolean" && (
                    <Text style={{ color: "#4b5563" }}>
                      On-chain: {verifiedOnChain ? "Verified" : "Pending"}
                    </Text>
                  )}
                  {uri ? (
                    <TouchableOpacity onPress={() => Linking.openURL(uri)}>
                      <Text
                        style={{
                          color: "#2563eb",
                          marginTop: 2,
                          textDecorationLine: "underline",
                        }}
                      >
                        View certificate
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        <View
          style={{
            borderTopWidth: 1,
            borderColor: "#e5e7eb",
            marginVertical: 12,
          }}
        />

        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontWeight: "bold" }}>Blockchain Transaction:</Text>
          <Text style={{ color: "#555", fontSize: 12 }}>
            {blockchain?.blockchainTx ?? "Pending confirmation"}
          </Text>
        </View>

        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontWeight: "bold" }}>Hash Match:</Text>
          <Text>
            {hasHashes
              ? verified
                ? "Hashes match (authentic record)"
                : "Mismatch detected"
              : "Awaiting on-chain confirmation"}
          </Text>
        </View>

        {etherscanUrl ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(etherscanUrl)}
            style={{
              marginTop: 20,
              backgroundColor: "#2563eb",
              borderRadius: 8,
              paddingVertical: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              View on Etherscan
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              marginTop: 20,
              backgroundColor: "#dbeafe",
              borderRadius: 8,
              paddingVertical: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#1e3a8a", fontWeight: "600" }}>
              Blockchain transaction pending
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
