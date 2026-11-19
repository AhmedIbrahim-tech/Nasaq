import Menudata from '../Menudata';
import { usePathname } from "next/navigation";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import NavItem from '../NavItem/NavItem';
import NavCollapse from '../NavCollapse/NavCollapse';
import { CustomizerContext } from '@/theme/customizerContext';
import { useContext, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { filterHorizontalMenuItems } from '@/shared/utils/navigationFilter';

const NavListing = () => {
  const pathname = usePathname();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const { isCollapse, isSidebarHover } = useContext(CustomizerContext);
  const roles = useAppSelector((state) => state.auth.roles) ?? [];
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? isCollapse == "mini-sidebar" && !isSidebarHover : '';

  const visibleMenuItems = useMemo(() => {
    return filterHorizontalMenuItems(Menudata, {
      effectiveRoles: roles,
      effectivePermissions: [],
      permissionsLoading: false,
    });
  }, [roles]);

  return (
    <Box>
      <List sx={{ p: 0, display: 'flex', gap: '3px', zIndex: '100' }}>
        {visibleMenuItems.map((item) => {
          if (item.children) {
            return (
              <NavCollapse
                menu={item}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                pathWithoutLastPart={pathWithoutLastPart}
                level={1}
                key={item.id}
                onClick={undefined}
              />
            );
          } else {
            return (
              <NavItem
                item={item}
                key={item.id}
                pathDirect={pathDirect}
                hideMenu={hideMenu}
                onClick={() => {}}
              />
            );
          }
        })}
      </List>
    </Box>
  );
};
export default NavListing;

