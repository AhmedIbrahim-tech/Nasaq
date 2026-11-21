"use client";

import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import {
  IconInfoCircle,
  IconDownload,
  IconHistory,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconCalendarOff,
} from "@tabler/icons-react";
import { useTranslations, useLocale } from "next-intl";
import { formatDateTime, formatDateOnly } from "@/shared/utils/i18nFormatters";
import { Router } from "@/lib/api/router";
import type { LeaveRequest, LeaveRequestStatus } from "../types";

interface LeaveRequestDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  leaveRequest: LeaveRequest | null;
}

export const LeaveRequestDetailsDialog: React.FC<LeaveRequestDetailsDialogProps> = ({
  open,
  onClose,
  leaveRequest,
}) => {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale.startsWith("ar");

  if (!leaveRequest) return null;

  const getStatusChip = (status: LeaveRequestStatus) => {
    switch (status) {
      case "Approved":
        return <Chip label={t("Approved")} color="success" size="small" icon={<IconCircleCheck size={16} />} />;
      case "Rejected":
        return <Chip label={t("Rejected")} color="error" size="small" icon={<IconCircleX size={16} />} />;
      case "Cancelled":
        return <Chip label={t("Cancelled")} color="default" size="small" icon={<IconCalendarOff size={16} />} />;
      case "Pending":
      default:
        return <Chip label={t("Pending")} color="warning" size="small" icon={<IconClock size={16} />} />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: { xs: "calc(100% - 20px)", sm: "calc(100% - 64px)" },
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogTitle sx={{ px: 3, py: 2.5, borderBottom: 1, borderColor: "divider" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                bgcolor: "info.light",
                color: "info.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconInfoCircle size={20} />
            </Box>
            <Typography variant="h6" component="span" fontWeight={600}>
              {t("LeaveRequestDetails")}
            </Typography>
          </Stack>
          {getStatusChip(leaveRequest.status)}
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3, overflowY: "auto", flex: "1 1 auto" }}>
        <Grid container spacing={3}>
          {/* Employee & Type Summary */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              {t("Employee")}
            </Typography>
            <Typography variant="subtitle1" fontWeight={600}>
              {leaveRequest.employeeName}
            </Typography>
            <Typography variant="body2" color="text.secondary" dir="ltr">
              {leaveRequest.employeeCode} {leaveRequest.department ? `• ${leaveRequest.department}` : ""}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              {t("LeaveType")}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {isAr ? leaveRequest.leaveTypeNameAr : leaveRequest.leaveTypeName}
              </Typography>
              <Chip
                label={leaveRequest.isPaid ? t("PaidLeave") : t("Unpaid")}
                size="small"
                color={leaveRequest.isPaid ? "success" : "default"}
                variant="outlined"
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          {/* Dates & Duration */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="caption" color="text.secondary">
              {t("StartDate")}
            </Typography>
            <Typography variant="body1" fontWeight={500} dir="ltr">
              {leaveRequest.startDate}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="caption" color="text.secondary">
              {t("EndDate")}
            </Typography>
            <Typography variant="body1" fontWeight={500} dir="ltr">
              {leaveRequest.endDate}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="caption" color="text.secondary">
              {t("DaysCount")}
            </Typography>
            <Typography variant="body1" fontWeight={600} color="primary.main">
              {leaveRequest.daysCount} {t("Days")}
            </Typography>
          </Grid>

          {/* Reason */}
          {leaveRequest.reason && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                {t("LeaveReason")}
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  mt: 0.5,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2">{leaveRequest.reason}</Typography>
              </Box>
            </Grid>
          )}

          {/* Attachment Download */}
          {leaveRequest.attachmentFileId && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                {t("Attachment")}
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<IconDownload size={18} />}
                  href={Router.Files.Download(leaveRequest.attachmentFileId)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("DownloadAttachment")}
                </Button>
              </Box>
            </Grid>
          )}

          {/* Review Details if reviewed */}
          {leaveRequest.reviewedBy && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                {t("ReviewNotes")}
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  mt: 0.5,
                  bgcolor: leaveRequest.status === "Approved" ? "success.50" : "error.50",
                  borderRadius: 1,
                  border: 1,
                  borderColor: leaveRequest.status === "Approved" ? "success.light" : "error.light",
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  {leaveRequest.reviewedBy} (
                  <span style={{ direction: "ltr", unicodeBidi: "isolate", display: "inline-block" }}>
                    {leaveRequest.reviewedAtUtc
                      ? formatDateTime(leaveRequest.reviewedAtUtc, isAr)
                      : ""}
                  </span>
                  ):
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {leaveRequest.reviewNotes || t("NoNotesProvided")}
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Approval History Timeline */}
          {leaveRequest.approvalHistory && leaveRequest.approvalHistory.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <IconHistory size={18} />
                <Typography variant="subtitle2" fontWeight={600}>
                  {t("LeaveApprovalHistory")}
                </Typography>
              </Stack>
              <Stack spacing={1.5}>
                {leaveRequest.approvalHistory.map((history) => (
                  <Box
                    key={history.id}
                    sx={{
                      p: 1.5,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight={600}>
                        {history.actorName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ direction: "ltr", unicodeBidi: "isolate" }}>
                        {formatDateTime(history.actionDateUtc, isAr)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <Chip
                        label={history.action}
                        size="small"
                        color={
                          history.action === "Approved"
                            ? "success"
                            : history.action === "Rejected"
                            ? "error"
                            : history.action === "Cancelled"
                            ? "default"
                            : "info"
                        }
                        sx={{ height: 22, fontSize: "0.75rem" }}
                      />
                      {history.comments && (
                        <Typography variant="body2" color="text.secondary">
                          {history.comments}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          flex: "0 0 auto",
          flexShrink: 0,
          px: 3,
          py: 2,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Button onClick={onClose} variant="contained" color="inherit">
          {t("Close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
