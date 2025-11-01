import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Linking,
  TouchableOpacity,
} from "react-native";
import { format } from "date-fns";
import { useVerifyBatchQuery } from "@/hooks/useVerify";
import { useLocalSearchParams } from 'expo-router';

export default function VerifyBatchScreen() {
  const params = useLocalSearchParams<{ batchId?: string }>();
  const { data: batch, isLoading, error } = useVerifyBatchQuery(params.batchId || "");

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
        }}
      >
        <Text style={{ color: "#b91c1c", fontSize: 16, fontWeight: "600" }}>
          ❌ Verification Failed
        </Text>
        <Text style={{ color: "#666", marginTop: 8, textAlign: "center" }}>
          {String(error)}
        </Text>
      </View>
    );
  }

  if (!batch?.data) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No verification data found.</Text>
      </View>
    );
  }

  const verified =
    batch?.data?.blockchain.onChainHash === batch?.data?.blockchain.offChainHash;
  const etherscanUrl = `https://etherscan.io/tx/${batch?.data?.blockchain.blockchainTx}`;

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
            color: verified ? "#16a34a" : "#b91c1c",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          {verified ? "✅ Produce Verified" : "⚠️ Verification Failed"}
        </Text>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: "bold" }}>Batch ID:</Text>
          <Text>{batch?.data?.batchId}</Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: "bold" }}>Produce Name:</Text>
          <Text>{batch?.data?.produce.name}</Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: "bold" }}>Harvest Date:</Text>
          <Text>
            {format(new Date(batch?.data?.produce.harvestDate!), "dd MMM yyyy")}
          </Text>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: "bold" }}>Farm:</Text>
          <Text>{batch?.data?.produce.farm! || "Unknown"}</Text>
        </View>

        {batch?.data?.produce.certifications && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: "bold" }}>Certifications:</Text>
            {Object.entries(batch?.data?.produce.certifications).map(
              ([key, val]) => (
                <Text key={key}>
                  {key}: {val ? "✅ Yes" : "❌ No"}
                </Text>
              )
            )}
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
            {batch?.data?.blockchain.blockchainTx}
          </Text>
        </View>

        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontWeight: "bold" }}>Hash Match:</Text>
          <Text>{verified ? "✅ Yes (Authentic Record)" : "❌ Mismatch"}</Text>
        </View>

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
            View on Etherscan ↗
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
