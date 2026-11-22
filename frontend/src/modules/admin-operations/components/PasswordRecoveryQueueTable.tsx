"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import {
  IconCheck,
  IconX,
  IconKey,
  IconMail,
  IconUser,
  IconClock,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { ModernizeDataTable, ModernizeColumnDef } from "@/shared/components/tables/modernize/ModernizeDataTable";
import { approvePasswordRequest, rejectPasswordRequest } from "@/modules/auth/services/auth.service";
import type { ForgotPasswordRequestDto } from "@/modules/auth/types";
import { notify } from "@/shared/services/notification.service";

interface PasswordRecoveryQueueTableProps {
  records: ForgotPasswordRequestDto[];
  loading: boolean;
  onRefresh: () => void;
}

export const PasswordRecoveryQueueTable: React.FC<PasswordRecoveryQueueTableProps> = ({
  records,
  loading,
  onRefresh,
}) => {
  const theme = useTheme();
  const t = useTranslations();
  const isRtl = theme.direction === "rtl";

  const [selectedRequest, setSelectedRequest] = useState<ForgotPasswordRequestDto | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenApprove = (row: ForgotPasswordRequestDto) => {
    setSelectedRequest(row);
    setApproveDialogOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedRequest) return;
    try {
      setIsProcessing(true);
      await approvePasswordRequest(selectedRequest.id);
      notify.success(
        isRtl
          ? "تم اعتماد الطلب وتوليد كلمة مرور مؤقتة وإرسالها لبريد الموظف."
          : "Request approved. A temporary password was generated and sent to the employee's email."
      );
      setApproveDialogOpen(false);
      onRefresh();
    } catch (err: unknown) {
      notify.error(err instanceof Error ? err.message : isRtl ? "فشل اعتماد الطلب." : "Failed to approve request.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenReject = (row: ForgotPasswordRequestDto) => {
    setSelectedRequest(row);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest) return;
    try {
      setIsProcessing(true);
      await rejectPasswordRequest(selectedRequest.id, rejectionReason.trim() || undefined);
      notify.success(isRtl ? "تم رفض طلب استعادة كلمة المرور." : "Password recovery request rejected.");
      setRejectDialogOpen(false);
      onRefresh();
    } catch (err: unknown) {
      notify.error(err instanceof Error ? err.message : isRtl ? "فشل رفض الطلب." : "Failed to reject request.");
    } finally {
      setIsProcessing(false);
    }
  };

  const columns: ModernizeColumnDef<ForgotPasswordRequestDto>[] = [
    {
      id: "employee",
      header: isRtl ? "الموظف" : "Employee",
      cell: (row: ForgotPasswordRequestDto) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              bgcolor: "warning.lighter",
              color: "warning.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.85rem",
            }}
          >
            {row.employeeName ? row.employeeName.charAt(0).toUpperCase() : <IconUser size={18} />}
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {isRtl && row.employeeNameAr ? row.employeeNameAr : row.employeeName || row.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.employeeCode || row.userId.slice(0, 8)}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      id: "email",
      header: isRtl ? "البريد الإلكتروني" : "Email Address",
      cell: (row: ForgotPasswordRequestDto) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <IconMail size={16} color={theme.palette.text.secondary} />
          <Typography variant="body2" sx={{ direction: "ltr" }}>
            {row.email}
          </Typography>
        </Stack>
      ),
    },
    {
      id: "requestedAt",
      header: isRtl ? "وقت الطلب" : "Requested At",
      cell: (row: ForgotPasswordRequestDto) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(row.requestedAtUtc).toLocaleDateString(isRtl ? "ar-SA" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      ),
    },
    {
      id: "actions",
      header: isRtl ? "الإجراءات" : "Actions",
      align: "center",
      cell: (row: ForgotPasswordRequestDto) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title={isRtl ? "اعتماد وإرسال كلمة مرور مؤقتة" : "Approve & Send Temporary Password"}>
            <IconButton
              size="small"
              color="success"
              onClick={() => handleOpenApprove(row)}
              sx={{ bgcolor: "success.lighter", "&:hover": { bgcolor: "success.light" } }}
            >
              <IconCheck size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title={isRtl ? "رفض الطلب" : "Reject Request"}>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleOpenReject(row)}
              sx={{ bgcolor: "error.lighter", "&:hover": { bgcolor: "error.light" } }}
            >
              <IconX size={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Card sx={{ borderRadius: "16px", boxShadow: theme.shadows[2] }}>
        <ModernizeDataTable
          data={records}
          columns={columns}
          loading={loading}
          totalCount={records.length}
          page={1}
          pageSize={records.length || 10}
          onPageChange={() => {}}
          getRowId={(row: ForgotPasswordRequestDto) => row.id}
          emptyMessage={
            isRtl
              ? "لا توجد طلبات استعادة كلمة مرور معلقة حالياً."
              : "No pending password recovery requests at this time."
          }
        />
      </Card>

      {/* Approve Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            {isRtl ? "اعتماد طلب استعادة كلمة المرور" : "Approve Password Recovery"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {isRtl
              ? "سيقوم النظام بتوليد كلمة مرور مؤقتة عشوائية قوية وإرسالها مباشرة إلى البريد الإلكتروني للموظف. سيتوجب على الموظف تغييرها عند الدخول."
              : "The system will generate a strong random temporary password and send it to the employee's registered email address. The employee will be prompted to change it upon login."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setApproveDialogOpen(false)} color="inherit">
            {isRtl ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmApprove}
            disabled={isProcessing}
            startIcon={isProcessing && <CircularProgress size={16} color="inherit" />}
          >
            {isRtl ? "تأكيد وإرسال" : "Confirm & Send"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700} color="error.main">
            {isRtl ? "رفض طلب استعادة كلمة المرور" : "Reject Password Request"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {isRtl
              ? "هل أنت متأكد من رغبتك في رفض هذا الطلب؟ يمكنك إضافة سبب الرفض اختيارياً."
              : "Are you sure you want to reject this request? You may optionally provide a reason."}
          </Typography>
          <TextField
            label={isRtl ? "سبب الرفض (اختياري)" : "Rejection Reason (Optional)"}
            fullWidth
            size="small"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)} color="inherit">
            {isRtl ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmReject}
            disabled={isProcessing}
            startIcon={isProcessing && <CircularProgress size={16} color="inherit" />}
          >
            {isRtl ? "تأكيد الرفض" : "Confirm Rejection"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
