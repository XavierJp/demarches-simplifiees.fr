import React, {
  useMemo,
  useState,
  useRef,
  useContext,
  createContext,
  useEffect,
  useLayoutEffect
} from 'react';
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover
} from '@reach/combobox';
import { wrapEvent } from '@reach/utils';
import '@reach/combobox/styles.css';
import matchSorter from 'match-sorter';
import { fire } from '@utils';

const Context = createContext();

function ComboMultipleDropdownList({ options, hiddenFieldId, selected }) {
  const [term, setTerm] = useState('');
  const [selections, setSelections] = useState(selected);
  const results = useMemo(() => (term ? matchSorter(options, term) : options), [
    term
  ]);
  const hiddenField = useMemo(
    () => document.querySelector(`input[data-uuid="${hiddenFieldId}"]`),
    [hiddenFieldId]
  );

  const handleChange = (event) => {
    setTerm(event.target.value);
  };

  const saveSelection = (selections) => {
    setSelections(selections);
    if (hiddenField) {
      hiddenField.setAttribute('value', JSON.stringify(selections));
      fire(hiddenField, 'autosave:trigger');
    }
  };

  const onSelect = (value) => {
    saveSelection([...selections, value]);
    setTerm('');
  };

  const onRemove = (value) => {
    saveSelection(selections.filter((s) => s !== value));
  };

  return (
    <Combobox
      openOnFocus={true}
      onSelect={onSelect}
      aria-label="choose an option"
    >
      <ComboboxTokenLabel
        onRemove={onRemove}
        style={{
          border: '1px solid #888',
          display: 'flex',
          flexWrap: 'wrap'
        }}
      >
        {selections.map((selection) => (
          <ComboboxToken key={selection} value={selection} />
        ))}
        <ComboboxTokenInput
          value={term}
          onChange={handleChange}
          autocomplete={false}
          style={{
            outline: 'none',
            border: 'none',
            flexGrow: 1,
            margin: '0.25rem',
            font: 'inherit'
          }}
        />
      </ComboboxTokenLabel>
      {results && (
        <ComboboxPopover>
          {results.length === 0 && (
            <p>
              No Results{' '}
              <button
                onClick={() => {
                  setTerm('');
                }}
              >
                clear
              </button>
            </p>
          )}
          <ComboboxList>
            {results.map((value, index) => (
              <ComboboxOption key={index} value={value} />
            ))}
          </ComboboxList>
        </ComboboxPopover>
      )}
    </Combobox>
  );
}

////////////////////////////////////////////////////////////////////////////////

function ComboboxTokenLabel({ onRemove, onKeyDown, ...props }) {
  const selectionsRef = useRef([]);
  const [selectionNavIndex, setSelectionNavIndex] = useState(-1);

  useLayoutEffect(() => {
    selectionsRef.current = [];
    return () => (selectionsRef.current = []);
  });

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      if (selectionNavIndex > 0) {
        setSelectionNavIndex(selectionNavIndex - 1);
      } else if (selectionsRef.current.length > 0) {
        setSelectionNavIndex(selectionsRef.current.length - 1);
      }
    } else if (event.key === 'ArrowRight') {
      if (selectionNavIndex === selectionsRef.current.length - 1) {
        setSelectionNavIndex(-1);
      } else if (selectionNavIndex < selectionsRef.current.length - 1) {
        setSelectionNavIndex(selectionNavIndex + 1);
      } else if (selectionNavIndex < 0) {
        setSelectionNavIndex(0);
      }
    } else {
      setSelectionNavIndex(-1);
    }
  };

  const context = {
    onRemove,
    selectionsRef,
    selectionNavIndex
  };

  return (
    <Context.Provider value={context}>
      <label onKeyDown={wrapEvent(onKeyDown, handleKeyDown)} {...props} />
    </Context.Provider>
  );
}

function ComboboxToken({ value, ...props }) {
  const { selectionsRef, selectionNavIndex } = useContext(Context);
  useEffect(() => {
    selectionsRef.current.push(value);
  });
  const selected = selectionsRef.current[selectionNavIndex] === value;

  return (
    <span
      style={
        selected ? { ...selectionStyle, backgroundColor: 'black', color: 'white' } : selectionStyle
      }
      {...props}
    >
      {value}
    </span>
  );
}

function ComboboxTokenInput({ onKeyDown, ...props }) {
  const { onRemove, selectionsRef, selectionNavIndex } = useContext(Context);
  const ref = useRef();
  const handleKeyDown = (event) => {
    const { value } = event.target;
    if (
      event.key === 'Backspace' &&
      value === '' &&
      selectionsRef.current.length > 0
    ) {
      onRemove(
        selectionsRef.current[
          selectionNavIndex === -1
            ? selectionsRef.current.length - 1
            : selectionNavIndex
        ]
      );
    } else if (event.key === 'Backspace' && value.length === 1) {
      setTimeout(() => {
        ref.current.blur();
        setTimeout(() => {
          ref.current.focus();
        }, 50);
      }, 50);
    }
  };

  return (
    <ComboboxInput
      ref={ref}
      onKeyDown={wrapEvent(onKeyDown, handleKeyDown)}
      {...props}
    />
  );
}

const selectionStyle = {
  fontWeight: 'normal',
  fontSize: '14px',
  border: 'solid 1px #aaa',
  color: '#333333',
  margin: '0.25rem',
  borderRadius: '10px',
  padding: '0.2rem 0.5rem',
  userSelect: 'none'
};

export default ComboMultipleDropdownList;
