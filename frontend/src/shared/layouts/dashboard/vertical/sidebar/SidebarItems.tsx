import Menuitems from './MenuItems';
import { usePathname } from "next/navigation";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import useMediaQuery from '@mui/material/useMediaQuery';
import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import NavGroup from './NavGroup/NavGroup';
import { useContext, useMemo } from 'react';
import { CustomizerContext } from '@/theme/customizerContext';
import { useAppSelector } from '@/store/hooks';
import { filterVerticalMenuItems } from '@/shared/utils/navigationFilter';

const SidebarItems = () => {
  const pathname = usePathname();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const { isSidebarHover, isCollapse, isMobileSidebar, setIsMobileSidebar } = useContext(CustomizerContext);
  const roles = useAppSelector((state) => state.auth.roles) ?? [];

  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const hideMenu: boolean = Boolean(lgUp && isCollapse === "mini-sidebar");

  const visibleMenuItems = useMemo(() => {
    return filterVerticalMenuItems(Menuitems, {
      effectiveRoles: roles,
      effectivePermissions: [],
      permissionsLoading: false,
    });
  }, [roles]);

  const handleMobileItemClick = () => {
    if (isMobileSidebar) {
      setIsMobileSidebar(false);
    }
  };

  return (
    <Box sx={{ px: hideMenu ? 0.75 : 1.25 }}>
      <List sx={{ pt: 0.5, pb: 1 }} className="sidebarNav" component="ul" disablePadding>
        {visibleMenuItems.map((item) => {
          // SubHeader
          if (item.subheader) {
            return <NavGroup item={item} hideMenu={hideMenu} key={item.subheader} />;
          }

          // Sub Menu with Children
          if (item.children) {
            return (
              <NavCollapse
                menu={item}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                key={item.id}
                onClick={handleMobileItemClick}
              />
            );
          }

          // Leaf Item
          return (
            <NavItem
              item={item}
              key={item.id}
              pathDirect={pathDirect}
              hideMenu={hideMenu}
              onClick={handleMobileItemClick}
            />
          );
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;
