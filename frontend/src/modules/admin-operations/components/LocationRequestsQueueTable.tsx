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
  IconMapPin,
  IconCurrentLocation,
  IconUser,
  IconClock,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { ModernizeDataTable, ModernizeColumnDef } from "@/shared/components/tables/modernize/ModernizeDataTable";
import { getLocalizedEmployeeName } from "@/shared/utils/localization";
import { locationsService } from "@/modules/locations/services/locations.service";
import type { EmployeeLocationRequest } from "@/modules/locations/types";
import { notify } from "@/shared/services/notification.service";

interface LocationRequestsQueueTableProps {
  records: EmployeeLocationRequest[];
  loading: boolean;
  onRefresh: () => void;
}

export const LocationRequestsQueueTable: React.FC<LocationRequestsQueueTableProps> = ({
  records,
  loading,
  onRefresh,
}) => {
  const theme = useTheme();
  const t = useTranslations();
  const isRtl = theme.direction === "rtl";

  // Dialog states
  const [selectedRequest, setSelectedRequest] = useState<EmployeeLocationRequest | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenApprove = (row: EmployeeLocationRequest) => {
    setSelectedRequest(row);
    setAdminNotes("");
    setApproveDialogOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedRequest) return;
    try {
      setIsProcessing(true);
      await locationsService.approveLocationRequest(selectedRequest.id, adminNotes.trim() || undefined);
      notify.success(isRtl ? "تم اعتماد موقع الموظف بنجاح." : "Employee location approved successfully.");
      setApproveDialogOpen(false);
      onRefresh();
    } catch (err: unknown) {
      notify.error(err instanceof Error ? err.message : isRtl ? "فشل اعتماد الموقع." : "Failed to approve location.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenReject = (row: EmployeeLocationRequest) => {
    setSelectedRequest(row);
    setRejectionReason("");
    setRejectionError(false);
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      setRejectionError(true);
      return;
    }
    try {
      setIsProcessing(true);
      await locationsService.rejectLocationRequest(selectedRequest.id, rejectionReason.trim());
      notify.success(isRtl ? "تم رفض طلب الموقع بنجاح." : "Location request rejected.");
      setRejectDialogOpen(false);
      onRefresh();
    } catch (err: unknown) {
      notify.error(err instanceof Error ? err.message : isRtl ? "فشل رفض الطلب." : "Failed to reject request.");
    } finally {
      setIsProcessing(false);
    }
  };

  const columns: ModernizeColumnDef<EmployeeLocationRequest>[] = [
    {
      id: "employee",
      header: isRtl ? "الموظف" : "Employee",
      cell: (row: EmployeeLocationRequest) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              bgcolor: "primary.lighter",
              color: "primary.main",
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
              {getLocalizedEmployeeName(row, isRtl) || row.employeeId}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.employeeCode || row.employeeId.slice(0, 8)}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      id: "requestType",
      header: isRtl ? "نوع الطلب" : "Request Type",
      cell: (row: EmployeeLocationRequest) => (
        <Chip
          size="small"
          color={row.requestType === 1 ? "info" : "warning"}
          label={
            row.requestType === 1
              ? isRtl ? "تسجيل أولي" : "Initial Registration"
              : isRtl ? "طلب تغيير" : "Change Request"
          }
        />
      ),
    },
    {
      id: "coordinates",
      header: isRtl ? "الإحداثيات المقترحة" : "Proposed Coordinates",
      cell: (row: EmployeeLocationRequest) => (
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1} useFlexGap>
            <Chip
              size="small"
              variant="outlined"
              label={`Lat: ${row.latitude.toFixed(6)}`}
              sx={{ direction: "ltr", fontFamily: "monospace" }}
            />
            <Chip
              size="small"
              variant="outlined"
              label={`Lon: ${row.longitude.toFixed(6)}`}
              sx={{ direction: "ltr", fontFamily: "monospace" }}
            />
          </Stack>
          {row.accuracyMeters && (
            <Typography variant="caption" color="text.secondary">
              {isRtl ? `الدقة: ±${row.accuracyMeters.toFixed(0)}م` : `Accuracy: ±${row.accuracyMeters.toFixed(0)}m`}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      id: "description",
      header: isRtl ? "وصف الموقع" : "Description",
      cell: (row: EmployeeLocationRequest) => (
        <Typography variant="body2" color="text.secondary">
          {row.addressDescription || "—"}
        </Typography>
      ),
    },
    {
      id: "createdAt",
      header: isRtl ? "تاريخ الطلب" : "Submitted Date",
      cell: (row: EmployeeLocationRequest) => (
        <Typography variant="body2" color="text.secondary">
          {new Date(row.created_Utc).toLocaleDateString(isRtl ? "ar-SA" : "en-US", {
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
      cell: (row: EmployeeLocationRequest) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title={isRtl ? "اعتماد الموقع" : "Approve Location"}>
            <IconButton
              size="small"
              color="success"
              onClick={() => handleOpenApprove(row)}
              sx={{ bgcolor: "success.lighter", "&:hover": { bgcolor: "success.light" } }}
            >
              <IconCheck size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title={isRtl ? "رفض مع السبب" : "Reject with Reason"}>
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
          getRowId={(row: EmployeeLocationRequest) => row.id}
          emptyMessage={
            isRtl
              ? "لا توجد طلبات مواقع معلقة حالياً."
              : "No pending location requests at this time."
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
            {isRtl ? "اعتماد موقع الموظف" : "Approve Employee Location"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {isRtl
              ? "سيصبح هذا الموقع هو الموقع الجغرافي المعتمد والنشط للموظف لتسجيل الحضور والانصراف."
              : "This location will become the employee's active approved location for attendance verification."}
          </Typography>
          <TextField
            label={isRtl ? "ملاحظات إدارية (اختياري)" : "Administrative Notes (Optional)"}
            fullWidth
            size="small"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />
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
            {isRtl ? "تأكيد الاعتماد" : "Confirm Approval"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog (Mandatory Reason) */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700} color="error.main">
            {isRtl ? "رفض طلب الموقع" : "Reject Location Request"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {isRtl
              ? "يرجى توضيح سبب رفض الموقع. سبب الرفض إلزامي وسيظهر للموظف لتمكينه من إعادة التسجيل."
              : "Please specify the rejection reason. The reason is mandatory and will be displayed to the employee."}
          </Typography>
          <TextField
            label={isRtl ? "سبب الرفض *" : "Rejection Reason *"}
            placeholder={isRtl ? "مثال: الموقع خارج نطاق المدينة المحددة، دقة الإحداثيات غير كافية" : "e.g. Coordinates outside approved territory"}
            fullWidth
            multiline
            rows={3}
            size="small"
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              if (e.target.value.trim()) setRejectionError(false);
            }}
            error={rejectionError}
            helperText={rejectionError ? (isRtl ? "سبب الرفض إلزامي." : "Rejection reason is required.") : ""}
            required
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
            disabled={isProcessing || !rejectionReason.trim()}
            startIcon={isProcessing && <CircularProgress size={16} color="inherit" />}
          >
            {isRtl ? "تأكيد الرفض" : "Confirm Rejection"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
