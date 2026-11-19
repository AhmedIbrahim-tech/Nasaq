// project imports
import "./DefaultColors";
import { Theme } from "@mui/material/styles";

const components: any = (theme: Theme) => {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          boxSizing: "border-box",
        },
        html: {
          height: "100%",
          width: "100%",
          scrollbarGutter: "stable",
        },
        a: {
          textDecoration: "none",
        },
        body: {
          height: "100%",
          margin: 0,
          padding: 0,
        },
        "#root": {
          height: "100%",
        },
        '.mui-nniyr1-MuiCollapse-root-MenuBar-root-RichTextField-menuBar-MenuBar-sticky, .mui-anumxs-FieldContainer-notchedOutline': {
          borderColor: `${theme.palette.divider} !important`,
        },
        "*[dir='rtl'] .buyNowImg": {
          transform: "scaleX(-1)",
        },
        /* Global Form Controls: Clean Label-Above-Input pattern */
        ".MuiFormControl-root": {
          display: "inline-flex !important",
          flexDirection: "column !important",
          position: "relative !important",
        },
        ".MuiInputLabel-root": {
          position: "static !important",
          transform: "none !important",
          display: "block !important",
          marginBottom: "10px !important",
          fontSize: "0.875rem !important",
          fontWeight: "600 !important",
          lineHeight: "1.4 !important",
          color: `${theme.palette.text.primary} !important`,
          zIndex: "1 !important",
          maxWidth: "100% !important",
          whiteSpace: "normal !important",
          transformOrigin: "initial !important",
        },
        "[dir='rtl'] .MuiInputLabel-root": {
          textAlign: "right !important",
        },
        "[dir='ltr'] .MuiInputLabel-root": {
          textAlign: "left !important",
        },
        ".MuiOutlinedInput-notchedOutline legend": {
          display: "none !important",
        },
        "[dir='rtl'] .MuiFormHelperText-root": {
          textAlign: "right !important",
          marginLeft: "0 !important",
          marginRight: "0 !important",
        },
        "[dir='ltr'] .MuiFormHelperText-root": {
          textAlign: "left !important",
          marginLeft: "0 !important",
          marginRight: "0 !important",
        },
        "[dir='rtl'] .MuiSelect-icon": {
          left: "10px !important",
          right: "auto !important",
        },
        "[dir='ltr'] .MuiSelect-icon": {
          right: "10px !important",
          left: "auto !important",
        },
        "[dir='rtl'] .MuiAutocomplete-endAdornment": {
          left: "10px !important",
          right: "auto !important",
        },
        "[dir='ltr'] .MuiAutocomplete-endAdornment": {
          right: "10px !important",
          left: "auto !important",
        },
        "[dir='rtl'] .MuiInputAdornment-positionStart": {
          marginLeft: "8px !important",
          marginRight: "0 !important",
        },
        "[dir='ltr'] .MuiInputAdornment-positionStart": {
          marginRight: "8px !important",
          marginLeft: "0 !important",
        },
        ".border-none": {
          border: "0px",
          td: {
            border: "0px",
          },
        },
        ".btn-xs": {
          minWidth: "30px !important",
          width: "30px",
          height: "30px",
          borderRadius: "6px !important",
          padding: "0px !important",
        },
        ".hover-text-primary:hover .text-hover": {
          color: theme.palette.primary.main,
        },
        ".code-dialog pre": {
          background: `${theme.palette.primary.light} !important`,
          borderRadius: theme.shape.borderRadius,
        },
        ".hoverCard:hover": {
          scale: "1.01",
          transition: " 0.1s ease-in",
        },
        ".signup-bg": {
          position: "absolute",
          top: 0,
          right: 0,
          height: "100%",
        },
        ".MuiBox-root": {
          borderRadius: theme.shape.borderRadius,
        },
        ".MuiCardHeader-action": {
          alignSelf: "center !important",
        },
        ".emoji-picker-react .emoji-scroll-wrapper": {
          overflowX: "hidden",
        },
        ".scrollbar-container": {
          borderRight: "0 !important",
        },
        ".theme-timeline .MuiTimelineOppositeContent-root": {
          minWidth: "90px",
        },
        ".MuiAlert-root .MuiAlert-icon": {
          color: "inherit!important",
        },
        ".MuiTimelineConnector-root": {
          width: "1px !important",
        },
        " .simplebar-scrollbar:before": {
          background: `${theme.palette.grey[300]} !important`,
        },
        hr: {
          height: "1px",
          border: 0,
          borderTop: `1px solid ${theme.palette.divider}`,
        },
        "@keyframes marquee": {
          "0%": {
            transform: "translate3d(0,0,0)",
          },
          "100% ": {
            transform: "translate3d(-2086px,0,0)",
          },
        },
        "@keyframes marquee2": {
          "0%": {
            transform: "translate3d(-2086px,0,0)",
          },
          "100% ": {
            transform: "translate3d(0,0,0)",
          },
        },
        "@keyframes gradient": {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: " 100% 50%",
          },
          "100% ": {
            backgroundPosition: " 0% 50%",
          },
        },
        ".rounded-bars .apexcharts-bar-series.apexcharts-plot-series .apexcharts-series path":
        {
          clipPath: "inset(0 0 5% 0 round 20px)",
        },
      },
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          ":before": {
            backgroundColor: theme.palette.grey[100],
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiStepConnector: {
      styleOverrides: {
        line: {
          borderColor: theme.palette.divider,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
        sizeSmall: {
          width: 30,
          height: 30,
          minHeight: 30,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: theme.palette.primary.light,
            color: theme.palette.primary.main,
          },
        },
        sizeSmall: {
          padding: "6px",
        },
        colorPrimary: {
          "&:hover": {
            backgroundColor: theme.palette.primary.main,
            color: "white",
          },
        },
        colorSecondary: {
          "&:hover": {
            backgroundColor: theme.palette.secondary.main,
            color: "white",
          },
        },
        colorSuccess: {
          "&:hover": {
            backgroundColor: theme.palette.success.main,
            color: "white",
          },
        },
        colorError: {
          "&:hover": {
            backgroundColor: theme.palette.error.main,
            color: "white",
          },
        },
        colorWarning: {
          "&:hover": {
            backgroundColor: theme.palette.warning.main,
            color: "white",
          },
        },
        colorInfo: {
          "&:hover": {
            backgroundColor: theme.palette.info.main,
            color: "white",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          boxShadow: "none",
          gap: "8px",
          "& .MuiButton-startIcon": {
            margin: 0,
          },
          "& .MuiButton-endIcon": {
            margin: 0,
          },
        },
        text: {
          padding: "5px 15px",
          "&:hover": {
            backgroundColor: theme.palette.primary.light,
            color: theme.palette.primary.main,
          },
        },
        textPrimary: {
          backgroundColor: theme.palette.primary.light,
          "&:hover": {
            backgroundColor: theme.palette.primary.main,
            color: "white",
          },
        },
        textSecondary: {
          backgroundColor: theme.palette.secondary.light,
          "&:hover": {
            backgroundColor: theme.palette.secondary.main,
            color: "white",
          },
        },
        textSuccess: {
          backgroundColor: theme.palette.success.light,
          "&:hover": {
            backgroundColor: theme.palette.success.main,
            color: "white",
          },
        },
        textError: {
          backgroundColor: theme.palette.error.light,
          "&:hover": {
            backgroundColor: theme.palette.error.main,
            color: "white",
          },
        },
        textInfo: {
          backgroundColor: theme.palette.info.light,
          "&:hover": {
            backgroundColor: theme.palette.info.main,
            color: "white",
          },
        },
        textWarning: {
          backgroundColor: theme.palette.warning.light,
          "&:hover": {
            backgroundColor: theme.palette.warning.main,
            color: "white",
          },
        },
        outlinedPrimary: {
          "&:hover": {
            backgroundColor: theme.palette.primary.main,
            color: "white",
          },
        },
        outlinedSecondary: {
          "&:hover": {
            backgroundColor: theme.palette.secondary.main,
            color: "white",
          },
        },
        outlinedError: {
          "&:hover": {
            backgroundColor: theme.palette.error.main,
            color: "white",
          },
        },
        outlinedSuccess: {
          "&:hover": {
            backgroundColor: theme.palette.success.main,
            color: "white",
          },
        },
        outlinedInfo: {
          "&:hover": {
            backgroundColor: theme.palette.info.main,
            color: "white",
          },
        },
        outlinedWarning: {
          "&:hover": {
            backgroundColor: theme.palette.warning.main,
            color: "white",
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: "16px 24px",
        },
        title: {
          fontSize: "1.125rem",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          width: "100%",
          padding: "15px",
          backgroundImage: "none",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "24px",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:last-child td": {
            borderBottom: 0,
          },
        },
      },
    },
    MuiGridItem: {
      styleOverrides: {
        root: {
          paddingTop: "30px",
          paddingLeft: "30px !important",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.grey[200],
          borderRadius: "6px",
        },
      },
    },
    MuiTimelineConnector: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.divider,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: theme.palette.divider,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: "0.75rem",
          gap: "6px",
          paddingInline: "8px",
        },
        sizeSmall: {
          paddingInline: "8px",
        },
        icon: {
          margin: "0 !important",
          flexShrink: 0,
        },
        iconSmall: {
          margin: "0 !important",
          flexShrink: 0,
        },
        deleteIcon: {
          margin: "0 !important",
          flexShrink: 0,
        },
        label: {
          paddingInline: "2px",
          unicodeBidi: "isolate",
        },
        labelSmall: {
          paddingInline: "2px",
          unicodeBidi: "isolate",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
           gap: "12px",
        },
        icon: {
          margin: "0 !important",
          flexShrink: 0,
        },
        filledSuccess: {
          color: "white",
        },
        filledInfo: {
          color: "white",
        },
        filledError: {
          color: "white",
        },
        filledWarning: {
          color: "white",
        },
        standardSuccess: {
          backgroundColor: theme.palette.success.light,
          color: theme.palette.success.main,
        },
        standardError: {
          backgroundColor: theme.palette.error.light,
          color: theme.palette.error.main,
        },
        standardWarning: {
          backgroundColor: theme.palette.warning.light,
          color: theme.palette.warning.main,
        },
        standardInfo: {
          backgroundColor: theme.palette.info.light,
          color: theme.palette.info.main,
        },
        outlinedSuccess: {
          borderColor: theme.palette.success.main,
          color: theme.palette.success.main,
        },
        outlinedWarning: {
          borderColor: theme.palette.warning.main,
          color: theme.palette.warning.main,
        },
        outlinedError: {
          borderColor: theme.palette.error.main,
          color: theme.palette.error.main,
        },
        outlinedInfo: {
          borderColor: theme.palette.info.main,
          color: theme.palette.info.main,
        },
        successIcon: {
          color: theme.palette.info.main,
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          maxWidth: "100%",
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          fontWeight: 600,
          color: theme.palette.text.primary,
          marginBottom: "6px",
          "&.Mui-focused": {
            color: theme.palette.primary.main,
          },
          "&.Mui-error": {
            color: theme.palette.error.main,
          },
          "&.Mui-disabled": {
            color: theme.palette.text.disabled,
          },
        },
      },
    },
    MuiInputLabel: {
      defaultProps: {
        shrink: true,
      },
      styleOverrides: {
        root: {
          position: "static !important",
          transform: "none !important",
          display: "block !important",
          marginBottom: "10px !important",
          fontSize: "0.875rem !important",
          fontWeight: 600,
          lineHeight: 1.4,
          color: theme.palette.text.primary,
          zIndex: 1,
          maxWidth: "100%",
          whiteSpace: "normal",
          transformOrigin: "initial !important",
          "&.Mui-focused": {
            color: theme.palette.primary.main,
          },
          "&.Mui-error": {
            color: theme.palette.error.main,
          },
          "&.Mui-disabled": {
            color: theme.palette.text.disabled,
          },
          "[dir='rtl'] &": {
            textAlign: "right !important",
          },
          "[dir='ltr'] &": {
            textAlign: "left !important",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        InputLabelProps: { shrink: true },
      },
      styleOverrides: {
        root: {
          "& .MuiInputLabel-root": {
            position: "static !important",
            transform: "none !important",
            display: "block !important",
            marginBottom: "10px !important",
            fontSize: "0.875rem !important",
            fontWeight: 600,
            color: theme.palette.text.primary,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          minHeight: "44px",
          backgroundColor: theme.palette.background.paper,
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.16)"
                : "rgba(0, 0, 0, 0.18)",
            transition: "border-color 0.2s ease, border-width 0.2s ease",
          },
          "& .MuiOutlinedInput-notchedOutline legend": {
            display: "none !important",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.36)"
                : "rgba(0, 0, 0, 0.38)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
            borderWidth: "1.5px",
          },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.error.main,
          },
          "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
            borderColor:
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.08)",
          },
        },
        input: {
          padding: "10px 14px !important",
          height: "auto !important",
          minHeight: "22px",
          fontSize: "0.875rem",
          lineHeight: "1.5 !important",
          boxSizing: "border-box",
          "&::placeholder": {
            color: theme.palette.text.secondary,
            opacity: 0.65,
          },
          "&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active, &:autofill": {
            WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset !important`,
            boxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset !important`,
            WebkitTextFillColor: `${theme.palette.text.primary} !important`,
            caretColor: theme.palette.text.primary,
            transition: "background-color 5000000s ease-in-out 0s",
          },
        },
        inputSizeSmall: {
          padding: "6px 10px !important",
          fontSize: "0.8125rem",
          minHeight: "20px",
        },
        multiline: {
          padding: "10px 14px !important",
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          disableScrollLock: true,
        },
      },
      styleOverrides: {
        root: {
          borderRadius: "8px",
          minHeight: "44px",
          boxSizing: "border-box",
          "&:not(.MuiTablePagination-input)": {
            "[dir='rtl'] & .MuiSelect-icon": {
              left: "10px !important",
              right: "auto !important",
            },
            "[dir='ltr'] & .MuiSelect-icon": {
              right: "10px !important",
              left: "auto !important",
            },
          },
          "&.MuiTablePagination-input": {
            minHeight: "auto !important",
            borderRadius: "0 !important",
            backgroundColor: "transparent !important",
            marginRight: "32px !important",
            marginLeft: "8px !important",
            "[dir='rtl'] &": {
              marginLeft: "32px !important",
              marginRight: "8px !important",
            },
          },
        },
        select: {
          minHeight: "24px !important",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "0.875rem",
          lineHeight: "1.5 !important",
          boxSizing: "border-box",
          fontStyle: "normal !important",
          "& em": {
            fontStyle: "normal !important",
          },
          paddingTop: "10px !important",
          paddingBottom: "10px !important",
          paddingLeft: theme.direction === "rtl" ? "38px !important" : "14px !important",
          paddingRight: theme.direction === "rtl" ? "14px !important" : "38px !important",
          textAlign: theme.direction === "rtl" ? "right !important" : "left !important",
          "[dir='rtl'] &": {
            paddingLeft: "38px !important",
            paddingRight: "14px !important",
            textAlign: "right !important",
          },
          "[dir='ltr'] &": {
            paddingRight: "38px !important",
            paddingLeft: "14px !important",
            textAlign: "left !important",
          },
          "&.MuiInputBase-inputSizeSmall": {
            paddingTop: "6px !important",
            paddingBottom: "6px !important",
            paddingLeft: theme.direction === "rtl" ? "34px !important" : "10px !important",
            paddingRight: theme.direction === "rtl" ? "10px !important" : "34px !important",
            "[dir='rtl'] &": {
              paddingLeft: "34px !important",
              paddingRight: "10px !important",
              textAlign: "right !important",
            },
            "[dir='ltr'] &": {
              paddingRight: "34px !important",
              paddingLeft: "10px !important",
              textAlign: "left !important",
            },
          },
          "&.MuiTablePagination-select": {
            paddingLeft: "8px !important",
            paddingRight: "24px !important",
            paddingTop: "0 !important",
            paddingBottom: "0 !important",
            minHeight: "auto !important",
            display: "inline-flex !important",
            alignItems: "center !important",
            lineHeight: "inherit !important",
            boxSizing: "content-box !important",
            gap: 0,
            cursor: "pointer",
            "[dir='rtl'] &": {
              paddingRight: "8px !important",
              paddingLeft: "24px !important",
            },
          },
        },
        icon: {
          color: theme.palette.text.secondary,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          fontWeight: 500,
          fontStyle: "normal !important",
          minHeight: "36px",
          padding: "8px 14px",
          borderRadius: "6px",
          margin: "2px 6px",
          "& em": {
            fontStyle: "normal !important",
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          border: "none",
          color: theme.palette.text.secondary,
        },
        toolbar: {
          minHeight: "52px",
          paddingRight: "2px",
        },
        selectLabel: {
          fontSize: "0.875rem",
          color: theme.palette.text.secondary,
          margin: 0,
        },
        input: {
          color: "inherit",
          fontSize: "inherit",
          flexShrink: 0,
          marginRight: "32px !important",
          marginLeft: "8px !important",
          minHeight: "auto !important",
          "[dir='rtl'] &": {
            marginLeft: "32px !important",
            marginRight: "8px !important",
          },
        },
        select: {
          fontSize: "0.875rem",
          paddingLeft: "8px !important",
          paddingRight: "24px !important",
          paddingTop: "0 !important",
          paddingBottom: "0 !important",
          minHeight: "auto !important",
          display: "inline-flex !important",
          alignItems: "center !important",
          lineHeight: "inherit !important",
          boxSizing: "content-box !important",
          border: "none !important",
          backgroundColor: "transparent !important",
          cursor: "pointer",
          "[dir='rtl'] &": {
            paddingRight: "8px !important",
            paddingLeft: "24px !important",
            textAlign: "left !important",
            textAlignLast: "left !important",
          },
          "[dir='ltr'] &": {
            textAlign: "right !important",
            textAlignLast: "right !important",
          },
        },
        selectIcon: {
          right: "0 !important",
          left: "auto !important",
          top: "calc(50% - 12px) !important",
          position: "absolute !important",
          color: theme.palette.text.secondary,
          fontSize: "20px !important",
          pointerEvents: "none",
          "[dir='rtl'] &": {
            left: "0 !important",
            right: "auto !important",
          },
        },
        displayedRows: {
          fontSize: "0.875rem",
          color: theme.palette.text.secondary,
          margin: 0,
        },
        actions: {
          flexShrink: 0,
          marginLeft: "20px",
          "[dir='rtl'] &": {
            marginRight: "20px",
            marginLeft: "0px",
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            padding: "3px 8px !important",
            minHeight: "44px",
            boxSizing: "border-box",
          },
          "& .MuiAutocomplete-input": {
            padding: "7.5px 6px !important",
            fontSize: "0.875rem",
          },
          "[dir='rtl'] & .MuiAutocomplete-endAdornment": {
            left: 9,
            right: "auto",
          },
        },
        tag: {
          margin: "2px",
          fontSize: "0.75rem",
          height: "24px",
          borderRadius: "6px",
        },
        paper: {
          borderRadius: "8px",
          boxShadow: "0 10px 30px 0 rgba(0,0,0,0.12)",
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginTop: "4px",
          marginLeft: "14px",
          marginRight: "14px",
          fontSize: "0.75rem",
          lineHeight: 1.3,
          minHeight: "18px",
          "[dir='rtl'] &": {
            textAlign: "right",
          },
          "&.Mui-error": {
            color: theme.palette.error.main,
            fontWeight: 500,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "16px",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 24px 48px -12px rgba(0, 0, 0, 0.6)"
              : "0 20px 40px -8px rgba(0, 0, 0, 0.12)",
          backgroundImage: "none",
          overflow: "hidden",
          margin: 16,
          maxHeight: "calc(100% - 32px)",
          "@media (max-width: 600px)": {
            margin: 10,
            width: "calc(100% - 20px) !important",
            borderRadius: "12px",
          },
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: "1.15rem",
          fontWeight: 700,
          padding: "20px 24px 14px 24px",
          borderBottom: `1px solid ${theme.palette.divider}`,
          "@media (max-width: 600px)": {
            padding: "16px 16px 12px 16px",
          },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "24px",
          "&.MuiDialogContent-dividers": {
            borderColor: theme.palette.divider,
          },
          ".MuiDialogTitle-root + &": {
            paddingTop: "24px",
          },
          "@media (max-width: 600px)": {
            padding: "16px",
            ".MuiDialogTitle-root + &": {
              paddingTop: "16px",
            },
          },
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "14px 24px 18px 24px",
          borderTop: `1px solid ${theme.palette.divider}`,
          gap: "10px",
          "@media (max-width: 600px)": {
            padding: "12px 16px 16px 16px",
            flexDirection: "column-reverse",
            "& > button": {
              width: "100%",
            },
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          overflow: "visible",
          "& .MuiSwitch-track": {
            borderRadius: 14,
          },
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        disableScrollLock: true,
      },
    },
    MuiPopover: {
      defaultProps: {
        disableScrollLock: true,
      },
      styleOverrides: {
        paper: {
          boxShadow:
            "rgb(145 158 171 / 30%) 0px 0px 2px 0px, rgb(145 158 171 / 12%) 0px 12px 24px -4px",
        },
      },
    },
  };
};
export default components;
