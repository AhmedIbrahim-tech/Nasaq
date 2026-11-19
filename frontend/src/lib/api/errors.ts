import axios, { isAxiosError, isCancel } from "axios";
import { isString } from "@/utils/isString";

export interface NormalizedApiError {
  status: number;
  message: string;
  code?: string;
  errors?: string[];
  isCanceled?: boolean;
}


export function isRequestCanceled(error: unknown): boolean {
  if (isCancel(error)) return true;
  if (error && typeof error === 'object') {
    const err = error as { name?: string; code?: string };
    if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
      return true;
    }
  }
  return false;
}

function isTechnicalStackTrace(msg: string): boolean {
  const lower = msg.toLowerCase();
  return (
    lower.includes('system.exception') ||
    lower.includes('sqlexception') ||
    lower.includes('npgsql') ||
    lower.includes('at microsoft.aspnetcore') ||
    lower.includes('stack trace') ||
    lower.includes('nullreferenceexception')
  );
}

function getCurrentLocale(): 'ar' | 'en' {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('corestarter_lang');
    if (saved === 'ar' || saved === 'en') return saved;
    const docLang = document.documentElement.lang;
    if (docLang === 'ar' || docLang === 'en') return docLang;
  }
  return 'ar';
}


export function axiosErrorHandler(error: unknown): string {
  if (isRequestCanceled(error)) {
    return "";
  }

  const isAr = getCurrentLocale() === 'ar';

  if (isString(error) && error.trim()) {
    if (isTechnicalStackTrace(error)) {
      return isAr
        ? "تعذر حفظ البيانات بسبب خطأ في الخادم. يرجى المحاولة لاحقًا."
        : "An unexpected server error occurred. Please try again later.";
    }
    return error.trim();
  }

  // Handle plain normalized error objects ({ status, message, errors })
  if (error && typeof error === "object" && !isAxiosError(error)) {
    if ("message" in error && isString((error as { message: unknown }).message)) {
      const msg = (error as { message: string }).message.trim();
      if (msg && !isTechnicalStackTrace(msg)) return msg;
    }
  }

  const isAxios = isAxiosError(error) || Boolean(error && typeof error === "object" && ("isAxiosError" in error || "response" in error));

  if (isAxios) {
    const axiosErr = error as any;
    // Timeout
    if (
      axiosErr.code === "ECONNABORTED" ||
      axiosErr.code === "ETIMEDOUT" ||
      axiosErr.message?.toLowerCase().includes("timeout")
    ) {
      return isAr
        ? "انتهت مهلة الاتصال بالخادم. يرجى التحقق من حالة العملية قبل إعادة المحاولة."
        : "Request timed out. Please verify your connection and try again.";
    }

    // Genuine network connectivity failure (no response received from server)
    if (axiosErr.code === "ERR_NETWORK" || (!axiosErr.response && Boolean(axiosErr.request))) {
      return isAr
        ? "تعذر الاتصال بالخادم. تحقق من الاتصال وحاول مرة أخرى."
        : "Could not reach the server. Please check your network connection and try again.";
    }

    // Server response payload (GenericBaseResponse)
    const data = axiosErr.response?.data;
    if (data && typeof data === "object") {
      const payload = data as Record<string, unknown>;
      // Specific validation errors take priority over generic messages
      if (Array.isArray(payload.validationErrors) && payload.validationErrors.length > 0) {
        const firstValErr = payload.validationErrors[0] as { name?: string; description?: string };
        if (firstValErr?.description && !isTechnicalStackTrace(firstValErr.description)) {
          return firstValErr.description.trim();
        }
      }
      if (Array.isArray(payload.errors) && payload.errors.length > 0) {
        const firstErr = String(payload.errors[0]).trim();
        if (firstErr && !isTechnicalStackTrace(firstErr)) {
          return firstErr;
        }
      }
      if (isString(payload.message) && payload.message.trim()) {
        const serverMsg = payload.message.trim();
        if (!isTechnicalStackTrace(serverMsg)) {
          return serverMsg;
        }
      }
    }

    const status = axiosErr.response?.status;
    if (status === 400) return isAr ? "يرجى مراجعة البيانات المدخلة وتصحيح الأخطاء." : "Please review the provided information and correct the errors.";
    if (status === 401) return isAr ? "انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى." : "Your session has expired or is unauthorized. Please sign in again.";
    if (status === 403) return isAr ? "ليس لديك صلاحية لتنفيذ هذا الإجراء." : "You do not have permission to perform this action.";
    if (status === 404) return isAr ? "العنصر المطلوب غير موجود." : "The requested resource was not found.";
    if (status === 409) return isAr ? "تم تعديل هذا السجل بواسطة عملية أخرى أو يتعارض مع حالته الحالية. يرجى تحديث البيانات والمحاولة مجدداً." : "An operation conflict occurred. Please refresh the data and try again.";
    if (status === 422) return isAr ? "تعذر معالجة البيانات بسبب أخطاء في التحقق." : "The submitted data could not be processed due to validation errors.";
    if (status === 429) return isAr ? "تم تجاوز الحد المسموح من الطلبات. يرجى الانتظار قليلاً." : "Too many requests. Please wait a moment before trying again.";
    if (status && status >= 500) return isAr ? "تعذر حفظ تعديلات قائمة الأسعار بسبب خطأ في الخادم. يرجى المحاولة لاحقًا." : "An unexpected server error occurred. Please try again later.";
  }

  if (error instanceof Error && error.message) {
    if (!isTechnicalStackTrace(error.message)) {
      return error.message;
    }
  }

  return isAr ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." : "An unexpected error occurred. Please try again.";
}

/**
 * Normalizes any error into a structured status, message, and list of validation errors
 */
export function normalizeApiError(error: unknown): NormalizedApiError {
  if (isRequestCanceled(error)) {
    return {
      status: 0,
      code: "REQUEST_CANCELED",
      message: "",
      isCanceled: true,
    };
  }

  if (error && typeof error === "object" && "status" in error && "message" in error) {
    return error as NormalizedApiError;
  }

  const message = axiosErrorHandler(error);
  const isAxios = isAxiosError(error) || Boolean(error && typeof error === "object" && ("isAxiosError" in error || "response" in error));
  const axiosErr = error as any;
  const status = isAxios
    ? axiosErr.response?.status ?? (axiosErr.code === "ECONNABORTED" || axiosErr.code === "ETIMEDOUT" ? 408 : 0)
    : 500;
  const code = isAxios && !axiosErr.response ? (status === 408 ? "TIMEOUT" : "NETWORK_ERROR") : undefined;

  let errors: string[] | undefined;
  if (isAxios && axiosErr.response?.data && typeof axiosErr.response.data === "object") {
    const rawErrors = (axiosErr.response.data as Record<string, unknown>).errors;
    if (Array.isArray(rawErrors)) {
      errors = rawErrors.map(String).filter((e) => !isTechnicalStackTrace(e));
    }
  }

  return { status, message, code, errors, isCanceled: false };
}
