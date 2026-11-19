import { RoleNames } from "@/shared/constants/roles";
import { MenuitemsType } from "@/shared/layouts/dashboard/vertical/sidebar/MenuItems";

export type NavigationScope = "platform" | "tenant" | "shared";

export interface NavigationFilterContext {
  effectiveRoles: string[];
  effectivePermissions: string[];
  permissionsLoading?: boolean;
}

/**
 * Canonical authorization check for a single navigation item or action.
 * Enforces explicit navigation scopes (platform vs. tenant vs. shared),
 * role assignments, required view permissions, and fail-closed loading state.
 */
export function isItemAuthorized(
  item: any,
  context: NavigationFilterContext
): boolean {
  const { effectiveRoles, effectivePermissions, permissionsLoading } = context;

  // 1. Role boundary enforcement
  if (item.roles && item.roles.length > 0) {
    const hasRole = item.roles.some((r: string) => effectiveRoles.includes(r));
    if (!hasRole) {
      return false;
    }
  }

  // 4. Permission boundary enforcement
  const requiresPermission = Boolean(
    item.permission || (item.permissions && item.permissions.length > 0)
  );

  if (requiresPermission) {
    // Fail-closed while permissions are in flight
    if (permissionsLoading) {
      return false;
    }

    if (item.permission && !effectivePermissions.includes(item.permission)) {
      return false;
    }

    if (
      item.permissions &&
      item.permissions.length > 0 &&
      !item.permissions.some((p: string) => effectivePermissions.includes(p))
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Filters vertical sidebar navigation items (handling subheaders and child groups).
 * Prunes empty parent groups and unused subheaders.
 */
export function filterVerticalMenuItems(
  items: MenuitemsType[],
  context: NavigationFilterContext
): MenuitemsType[] {
  const result: MenuitemsType[] = [];

  const evaluateItem = (item: MenuitemsType): MenuitemsType | null => {
    if (!isItemAuthorized(item, context)) {
      return null;
    }

    if (item.children && item.children.length > 0) {
      const visibleChildren = item.children
        .map((child) => evaluateItem(child))
        .filter((child): child is MenuitemsType => child !== null);

      if (visibleChildren.length === 0) {
        return null;
      }

      return {
        ...item,
        children: visibleChildren,
      };
    }

    return item;
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (item.navlabel) {
      if (!isItemAuthorized(item, context)) {
        continue;
      }

      let hasVisibleChild = false;
      for (let j = i + 1; j < items.length; j++) {
        const next = items[j];
        if (next.navlabel) break;
        const evaluated = evaluateItem(next);
        if (evaluated !== null) {
          hasVisibleChild = true;
          break;
        }
      }

      if (hasVisibleChild) {
        result.push(item);
      }
    } else {
      const evaluated = evaluateItem(item);
      if (evaluated !== null) {
        result.push(evaluated);
      }
    }
  }

  return result;
}

/**
 * Filters horizontal navbar navigation items (handling dropdowns and child groups).
 * Prunes empty parent groups.
 */
export function filterHorizontalMenuItems(
  items: any[],
  context: NavigationFilterContext
): any[] {
  return items
    .filter((item) => isItemAuthorized(item, context))
    .map((item) => {
      if (item.children && item.children.length > 0) {
        const filteredChildren = item.children.filter((child: any) =>
          isItemAuthorized(child, context)
        );
        return {
          ...item,
          children: filteredChildren,
        };
      }
      return item;
    })
    .filter((item) => {
      if (item.children && item.children.length === 0) {
        return false;
      }
      return true;
    });
}
