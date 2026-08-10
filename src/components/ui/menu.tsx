'use client';

import * as React from 'react';
import type { JSX } from 'react';
import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { cn } from '@/lib/utils';

const Menu = MenuPrimitive.Root;
const MenuTrigger = MenuPrimitive.Trigger;
const MenuRadioGroup = MenuPrimitive.RadioGroup;

type MenuContentProps = MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, 'side' | 'sideOffset' | 'align'>;

function MenuContent({
  className,
  side = 'bottom',
  sideOffset = 6,
  align = 'end',
  ...props
}: MenuContentProps): JSX.Element {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        className="isolate z-50"
      >
        <MenuPrimitive.Popup
          data-slot="menu-content"
          className={cn(
            'min-w-40 rounded-none border border-border bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-fast ease-standard data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function MenuRadioItem({
  className,
  children,
  ...props
}: MenuPrimitive.RadioItem.Props): JSX.Element {
  return (
    <MenuPrimitive.RadioItem
      data-slot="menu-radio-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 py-2 pr-8 pl-2.5 text-xs outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <MenuPrimitive.RadioItemIndicator className="pointer-events-none absolute right-2.5 flex size-4 items-center justify-center text-primary">
        ✓
      </MenuPrimitive.RadioItemIndicator>
    </MenuPrimitive.RadioItem>
  );
}

export { Menu, MenuTrigger, MenuContent, MenuRadioGroup, MenuRadioItem };
