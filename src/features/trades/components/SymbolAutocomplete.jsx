import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { searchSymbols } from '@/data/symbolCatalog';

function inputClass(extra = '') {
  return `w-full rounded-lg border border-pit-border bg-pit-bg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${extra}`;
}

/**
 * Symbol typeahead backed by market-type catalogs (Stocks / Forex / Crypto).
 * Dropdown is portaled so it is not clipped by the drawer scroll area.
 */
export function SymbolAutocomplete({
  value,
  onChange,
  catalogType,
  placeholder = 'Symbol',
  required = false,
  disabled = false,
}) {
  const listId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [menuBox, setMenuBox] = useState(null);

  const suggestions = useMemo(
    () => searchSymbols(catalogType, value),
    [catalogType, value]
  );

  const canSuggest = Boolean(catalogType) && !disabled;
  const showMenu = open && canSuggest && (suggestions.length > 0 || Boolean(value.trim()));

  const updateMenuBox = () => {
    const el = inputRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuBox({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (!showMenu) return undefined;
    updateMenuBox();
    const onScrollOrResize = () => updateMenuBox();
    window.addEventListener('resize', onScrollOrResize);
    // capture scroll from drawer / page
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [showMenu, suggestions.length, value]);

  useEffect(() => {
    setHighlight(0);
  }, [value, catalogType]);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!rootRef.current?.contains(e.target) && !e.target.closest?.('[data-symbol-menu]')) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  const pick = (item) => {
    onChange(item.symbol);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!canSuggest || !open || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && canSuggest && suggestions.length > 0) {
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && open) {
      e.preventDefault();
      pick(suggestions[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const menu =
    showMenu && menuBox
      ? createPortal(
          <div
            data-symbol-menu
            style={{
              position: 'fixed',
              top: menuBox.top,
              left: menuBox.left,
              width: menuBox.width,
              zIndex: 80,
            }}
          >
            {suggestions.length > 0 ? (
              <ul
                id={listId}
                role="listbox"
                className="max-h-56 overflow-y-auto rounded-lg border border-pit-border bg-pit-card shadow-xl"
              >
                {suggestions.map((item, index) => {
                  const active = index === highlight;
                  return (
                    <li key={`${item.symbol}-${item.name}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onMouseEnter={() => setHighlight(index)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pick(item)}
                        className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                          active
                            ? 'bg-indigo-600/20 text-white'
                            : 'text-slate-200 hover:bg-pit-bg'
                        }`}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            className="h-5 w-5 shrink-0 rounded-full bg-pit-bg"
                          />
                        ) : null}
                        <span className="min-w-0 flex-1 truncate">
                          <span className="font-semibold uppercase">{item.label}</span>
                          {item.name ? (
                            <span className="ml-2 text-xs font-normal normal-case text-slate-400">
                              {item.name}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-lg border border-pit-border bg-pit-card px-3 py-2 text-xs text-slate-400 shadow-xl">
                No matches — you can still use a custom symbol
              </div>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={rootRef} className="relative">
      <input
        ref={inputRef}
        required={required}
        disabled={disabled}
        value={value}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && canSuggest}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder={
          catalogType === 'Forex'
            ? 'EURUSD'
            : catalogType === 'Crypto'
              ? 'BTC'
              : catalogType === 'Stocks'
                ? 'RELIANCE'
                : placeholder
        }
        onFocus={() => {
          if (canSuggest) {
            setOpen(true);
            requestAnimationFrame(updateMenuBox);
          }
        }}
        onChange={(e) => {
          onChange(e.target.value);
          if (canSuggest) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        className={`${inputClass()} uppercase font-semibold`}
      />
      {menu}
    </div>
  );
}
