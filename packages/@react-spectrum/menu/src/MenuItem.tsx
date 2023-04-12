/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import CheckmarkMedium from '@spectrum-icons/ui/CheckmarkMedium';
import {classNames, ClearSlots, SlotProvider} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {Grid} from '@react-spectrum/layout';
import InfoOutline from '@spectrum-icons/workflow/InfoOutline';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps} from '@react-aria/utils';
import {Node} from '@react-types/shared';
import React, {Key, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {Text} from '@react-spectrum/text';
import {TreeState} from '@react-stately/tree';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useMenuContext, useMenuDialogContext} from './context';
import {useMenuItem} from '@react-aria/menu';

interface MenuItemProps<T> {
  item: Node<T>,
  state: TreeState<T>,
  isVirtualized?: boolean,
  onAction?: (key: Key) => void
}

/** @private */
export function MenuItem<T>(props: MenuItemProps<T>) {
  let {
    item,
    state,
    isVirtualized,
    onAction
  } = props;
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let menuDialogContext = useMenuDialogContext();
  let {triggerRef} = menuDialogContext || {};
  let {state: triggerState} = useMenuContext();
  let isMenuDialogTrigger = !!menuDialogContext;
  let isUnavailable;

  if (isMenuDialogTrigger) {
    isUnavailable = menuDialogContext.isUnavailable;
  }

  let {
    onClose,
    closeOnSelect
  } = useMenuContext();

  let {
    rendered,
    key
  } = item;

  let isSelected = state.selectionManager.isSelected(key);
  let isDisabled = state.disabledKeys.has(key);

  let ref = useRef<HTMLLIElement>(null);
  if (triggerRef) {
    ref = triggerRef;
  }
  let {
    menuItemProps,
    labelProps,
    descriptionProps,
    keyboardShortcutProps,
    isHovered
  } = useMenuItem(
    {
      isSelected,
      isDisabled,
      'aria-label': item['aria-label'],
      key,
      onClose,
      closeOnSelect,
      isVirtualized,
      onAction,
      isMenuDialogTrigger,
      triggerState
    },
    state,
    ref
  );

  let contents = typeof rendered === 'string'
    ? <Text>{rendered}</Text>
    : rendered;

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <li
        {...mergeProps(menuItemProps)}
        ref={ref}
        className={classNames(
          styles,
          'spectrum-Menu-item',
          {
            'is-disabled': isDisabled,
            'is-selected': isSelected,
            'is-selectable': state.selectionManager.selectionMode !== 'none',
            'is-hovered': isHovered
          }
        )}>
        <Grid
          UNSAFE_className={
            classNames(
              styles,
              'spectrum-Menu-itemGrid'
            )
          }>
          <ClearSlots>
            <SlotProvider
              slots={{
                text: {UNSAFE_className: styles['spectrum-Menu-itemLabel'], ...labelProps},
                end: {UNSAFE_className: styles['spectrum-Menu-end'], size: 'XS', alignSelf: 'center', ...descriptionProps},
                icon: {UNSAFE_className: styles['spectrum-Menu-icon'], size: 'S'},
                description: {UNSAFE_className: styles['spectrum-Menu-description'], ...descriptionProps},
                keyboard: {UNSAFE_className: styles['spectrum-Menu-keyboard'], ...keyboardShortcutProps}
              }}>
              {contents}
              {isSelected &&
                <CheckmarkMedium
                  slot="checkmark"
                  UNSAFE_className={
                    classNames(
                      styles,
                      'spectrum-Menu-checkmark'
                    )
                  } />
              }
              {
                isUnavailable && <InfoOutline slot="end" aria-label={stringFormatter.format('unavailable')} />
              }
            </SlotProvider>
          </ClearSlots>
        </Grid>
      </li>
    </FocusRing>
  );
}
