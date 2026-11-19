'use client'
import React, { useContext } from "react";
import { Grid, Typography, Box, Breadcrumbs } from "@mui/material";
import Link from "next/link";
import { IconCircle } from "@tabler/icons-react";
import Image from "next/image";
import { CustomizerContext } from "@/theme/customizerContext";

interface BreadCrumbType {
  subtitle?: string;
  items?: any[];
  title: string;
  children?: React.ReactNode;
}

const Breadcrumb = ({ subtitle, items, title, children }: BreadCrumbType) => {
  const { isBorderRadius } = useContext(CustomizerContext);
  return (
    <Grid
      container
      sx={{
        backgroundColor: "primary.light",
        borderRadius: `${isBorderRadius}px`,
        p: { xs: "14px 16px", sm: "18px 22px", md: "20px 24px" },
        marginBottom: { xs: "14px", sm: "16px", md: "20px" },
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Grid
        mb={{ xs: 0, sm: 1 }}
        size={{
          xs: 12,
          sm: 6,
          lg: 8
        }}>
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: "1.125rem", sm: "1.25rem", md: "1.3125rem" },
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            color="textSecondary"
            variant="h6"
            fontWeight={400}
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
              mt: 0.5,
              mb: 0,
            }}
          >
            {subtitle}
          </Typography>
        )}
        <Breadcrumbs
          separator={
            <IconCircle
              size="5"
              fill="textSecondary"
              fillOpacity={"0.6"}
              style={{ margin: "0 5px" }}
            />
          }
          sx={{
            alignItems: "center",
            mt: items ? { xs: "6px", sm: "10px" } : 0,
            flexWrap: "wrap",
            "& .MuiBreadcrumbs-ol": { flexWrap: "wrap" },
          }}
          aria-label="breadcrumb"
        >
          {items
            ? items.map((item) => (
              <div key={item.title}>
                {item.to ? (
                  <Link href={item.to} passHref>
                    <Typography
                      color="textSecondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.85rem" } }}
                    >
                      {item.title}
                    </Typography>
                  </Link>
                ) : (
                  <Typography
                    color="textPrimary"
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.85rem" }, fontWeight: 600 }}
                  >
                    {item.title}
                  </Typography>
                )}
              </div>
            ))
            : ""}
        </Breadcrumbs>
        {children && (
          <Box sx={{ display: { xs: "block", md: "none" }, width: "100%", mt: 1.5 }}>
            {children}
          </Box>
        )}
      </Grid>
      <Grid
        display="flex"
        alignItems="flex-end"
        size={{
          xs: 12,
          sm: 6,
          lg: 4
        }}>
        <Box
          sx={{
            display: { xs: "none", md: "block", lg: "flex" },
            alignItems: "center",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          {children ? (
            <Box sx={{ top: "0px", insetInlineEnd: "0px", position: "absolute" }}>{children}</Box>
          ) : (
            <>
              <Box sx={{ top: "0px", insetInlineEnd: "20px", position: "absolute", pointerEvents: "none" }}>
                <Image
                  src="/images/breadcrumb/ChatBc.png"
                  alt={"breadcrumbImg"}
                  style={{ width: "165px", height: "165px" }}
                  priority
                  width={165}
                  height={165}
                />
              </Box>
            </>
          )}
        </Box>
      </Grid>
    </Grid>
  )
};

export default Breadcrumb;
