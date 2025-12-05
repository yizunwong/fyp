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
  const statusColor = verified
    ? "text-green-600"
    : hasHashes
    ? "text-red-600"
    : "text-amber-600";
  const statusBg = verified
    ? "bg-green-50"
    : hasHashes
    ? "bg-red-50"
    : "bg-amber-50";

  return (
    <ScrollView contentContainerClassName="flex-grow bg-slate-50 px-4 py-6">
      <View className="w-full max-w-4xl self-center">
        <View
          className={`mb-4 rounded-2xl ${statusBg} p-4 shadow-sm border border-slate-200`}
        >
          <Text
            className={`text-center text-2xl font-bold ${statusColor} mb-1`}
          >
            {verified
              ? "Produce Verified"
              : hasHashes
              ? "Verification Failed"
              : "Verification Pending"}
          </Text>
          <Text className="text-center text-slate-600">
            {hasHashes
              ? verified
                ? "On-chain record matches off-chain data"
                : "Hashes do not match — please review"
              : "Awaiting blockchain confirmation"}
          </Text>
        </View>

        <View className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 mb-4">
          <Text className="text-lg font-semibold text-slate-800 mb-4">
            Batch Details
          </Text>
          <View className="space-y-3">
            <DetailRow label="Batch ID" value={batch.batchId ?? "Unknown"} />
            <DetailRow label="Produce Name" value={produce?.name ?? "Unknown"} />
            <DetailRow
              label="Harvest Date"
              value={
                produce?.harvestDate
                  ? format(new Date(produce.harvestDate), "dd MMM yyyy")
                  : "Unavailable"
              }
            />
            <DetailRow label="Farm" value={produce?.farm || "Unknown"} />
          </View>
        </View>

        {certificateDocs.length > 0 && (
          <View className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 mb-4">
            <Text className="text-lg font-semibold text-slate-800 mb-4">
              Certifications
            </Text>
            <View className="space-y-3">
              {certificateDocs.map((doc, idx) => {
                const name = (doc as { name?: string })?.name ?? "Document";
                const type =
                  (doc as { certificateType?: string })?.certificateType ??
                  "Unknown";
                const uri = (doc as { uri?: string })?.uri;
                const verifiedOnChain =
                  (doc as { verifiedOnChain?: boolean })?.verifiedOnChain;
                const statusBadge =
                  typeof verifiedOnChain === "boolean"
                    ? verifiedOnChain
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-700";
                const statusText =
                  typeof verifiedOnChain === "boolean"
                    ? verifiedOnChain
                      ? "Verified on-chain"
                      : "Pending on-chain"
                    : "Not available";
                return (
                  <View
                    key={`${name}-${idx}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-slate-900">
                          {name}
                        </Text>
                        <Text className="text-sm text-slate-600 mt-1">
                          Type: {type}
                        </Text>
                      </View>
                      <View className={`rounded-full px-3 py-1 ${statusBadge}`}>
                        <Text className="text-xs font-semibold">{statusText}</Text>
                      </View>
                    </View>
                    {uri ? (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(uri)}
                        className="mt-3 self-start rounded-lg border border-blue-200 bg-blue-50 px-3 py-2"
                      >
                        <Text className="text-sm font-semibold text-blue-700">
                          View certificate
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View className="rounded-2xl bg-white p-5 shadow-sm border border-indigo-100 mb-4">
          <Text className="text-lg font-semibold text-slate-800 mb-4">
            Blockchain Proof
          </Text>
          <View className="space-y-3">
            <DetailRow
              label="Transaction"
              value={blockchain?.blockchainTx ?? "Pending confirmation"}
              mono
            />
            <DetailRow
              label="Hash Match"
              value={
                hasHashes
                  ? verified
                    ? "Hashes match (authentic record)"
                    : "Mismatch detected"
                  : "Awaiting on-chain confirmation"
              }
            />
          </View>
          {etherscanUrl ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(etherscanUrl)}
              className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 items-center shadow-md"
            >
              <Text className="text-white font-semibold text-base">
                View on Etherscan
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="mt-5 rounded-xl bg-blue-50 px-4 py-3 items-center border border-blue-100">
              <Text className="text-blue-800 font-semibold">
                Blockchain transaction pending
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
  mono?: boolean;
};

function DetailRow({ label, value, mono }: DetailRowProps) {
  return (
    <View className="flex-row justify-between gap-3">
      <Text className="text-sm font-semibold text-slate-600">{label}</Text>
      <Text
        className={`flex-1 text-right text-base text-slate-900 ${
          mono ? "font-mono" : ""
        }`}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}
