import {
  useReportControllerCreateReport,
  reportControllerGetReport,
  type CreateReportDtoReportType,
  type ReportResponseDto,
} from "@/api";

type GenerateReportInput = {
  reportType: CreateReportDtoReportType;
  title?: string;
  farmId?: string;
  state?: string;
  district?: string;
  minFarmSize?: string;
  maxFarmSize?: string;
  farmVerificationStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  programType?: string;
  action?: string;
  ethToMyr?: number;
};

export function useReport() {
  const mutation = useReportControllerCreateReport();

  const generateReport = async (input: GenerateReportInput) => {
    const {
      reportType,
      title,
      farmId,
      state,
      district,
      minFarmSize,
      maxFarmSize,
      farmVerificationStatus,
      dateFrom,
      dateTo,
      status,
      programType,
      action,
      ethToMyr,
    } = input;

    const defaultTitleMap: Record<CreateReportDtoReportType, string> = {
      FARM_SUMMARY: "Farm Summary Report",
      SUBSIDY_REPORT: "Subsidy Report",
      PRODUCE_REPORT: "Produce Report",
      PROGRAM_REPORT: "Program Report",
      FINANCIAL_REPORT: "Financial Report",
      ACTIVITY_REPORT: "Activity Report",
      CUSTOM: "Custom Report",
    };

    const result = await mutation.mutateAsync({
      data: {
        reportType,
        title: title ?? defaultTitleMap[reportType],
      },
      params: {
        ...(farmId ? { farmId } : {}),
        ...(state ? { state } : {}),
        ...(district ? { district } : {}),
        ...(minFarmSize ? { minFarmSize } : {}),
        ...(maxFarmSize ? { maxFarmSize } : {}),
        ...(farmVerificationStatus
          ? { farmVerificationStatus: farmVerificationStatus as any }
          : {}),
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
        ...(status ? { status } : {}),
        ...(programType ? { programType } : {}),
        ...(action ? { action } : {}),
        ...(typeof ethToMyr === "number" ? { ethToMyr: String(ethToMyr) } : {}),
      },
    });

    return result.data as ReportResponseDto | undefined;
  };

  const waitForReport = async (
    reportId: string,
    options?: { timeoutMs?: number; intervalMs?: number }
  ) => {
    const timeoutMs = options?.timeoutMs ?? 60_000;
    const intervalMs = options?.intervalMs ?? 3_000;

    const start = Date.now();

    let done = false;
    while (!done) {
      const res = await reportControllerGetReport(reportId);
      const report = res.data as ReportResponseDto | undefined;

      if (!report) {
        throw new Error("Report not found");
      }

      if (report.status === "COMPLETED" || report.status === "FAILED") {
        return report;
      }

      if (Date.now() - start > timeoutMs) {
        throw new Error("Timed out waiting for report generation");
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  };

  return {
    generateReport,
    waitForReport,
    isGenerating: mutation.isPending,
    error: mutation.error,
  };
}
