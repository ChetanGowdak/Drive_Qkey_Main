import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { SearchIcons } from "../common/SvgIcons";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import FileIcons from "../common/FileIcons";

const SearchBar = ({ onFocusChange }) => {
  const [inputQuery, setInputQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Keyboard shortcut: Ctrl+K to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Fetch user's files for suggestions
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const filesQuery = query(
          collection(db, "myfiles"),
          where("userId", "==", user.uid)
        );
        const unsubFiles = onSnapshot(filesQuery, (snapshot) => {
          const fileList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFiles(fileList);
        });
        return () => unsubFiles();
      }
    });
    return () => unsubAuth();
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputQuery.trim().length > 0) {
      const filtered = files
        .filter((file) =>
          file.filename?.toLowerCase().includes(inputQuery.toLowerCase())
        )
        .slice(0, 5); // Limit to 5 suggestions
      setSuggestions(filtered);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  }, [inputQuery, files]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        // Navigate to the selected suggestion
        handleSuggestionClick(suggestions[selectedIndex]);
      } else if (inputQuery.trim()) {
        navigate(`/search/${encodeURIComponent(inputQuery.trim())}`);
        setSuggestions([]);
        setIsFocused(false);
        inputRef.current?.blur();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (file) => {
    // Navigate to search with the file name
    navigate(`/search/${encodeURIComponent(file.filename)}`);
    setInputQuery(file.filename);
    setSuggestions([]);
    setIsFocused(false);
  };

  const handleBlur = (e) => {
    // Delay to allow click on suggestion
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
        setSuggestions([]);
        onFocusChange?.(false);
      }
    }, 150);
  };

  return (
    <SearchContainer>
      <InputWrapper $isFocused={isFocused}>
        <SearchIconWrapper $isFocused={isFocused}>
          <SearchIcons />
        </SearchIconWrapper>
        <StyledInput
          ref={inputRef}
          type="text"
          placeholder="Search in Drive..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            onFocusChange?.(true);
          }}
          onBlur={handleBlur}
        />
        {inputQuery && (
          <ClearButton onClick={() => setInputQuery("")}>
            ✕
          </ClearButton>
        )}
        <GlowEffect $isFocused={isFocused} />
      </InputWrapper>

      {/* Suggestions Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <SuggestionsDropdown ref={suggestionsRef}>
          {suggestions.map((file, index) => (
            <SuggestionItem
              key={file.id}
              $isSelected={index === selectedIndex}
              onClick={() => handleSuggestionClick(file)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <FileIcons type={file.originalType || file.contentType} />
              <SuggestionText>
                <span className="filename">{file.filename}</span>
                {file.isEncrypted && <span className="badge">🔒</span>}
              </SuggestionText>
            </SuggestionItem>
          ))}
          <SuggestionFooter>
            Press <kbd>↵</kbd> to search • <kbd>↑↓</kbd> to navigate
          </SuggestionFooter>
        </SuggestionsDropdown>
      )}

      {/* No results message */}
      {isFocused && inputQuery.trim().length > 0 && suggestions.length === 0 && (
        <SuggestionsDropdown>
          <NoResults>
            <span>🔍</span> No matching files found
          </NoResults>
          <SuggestionFooter>
            Press <kbd>↵</kbd> to search all files
          </SuggestionFooter>
        </SuggestionsDropdown>
      )}
    </SearchContainer>
  );
};

export default SearchBar;

/* ================= ANIMATIONS ================= */

const glow = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ================= STYLES ================= */

const SearchContainer = styled.div`
  width: 100%;
  max-width: 650px;
  position: relative;
`;

const InputWrapper = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
`;

const GlowEffect = styled.div`
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6, #f472b6);
  opacity: ${props => props.$isFocused ? 0.6 : 0};
  z-index: -1;
  transition: opacity 0.3s ease;
  filter: blur(8px);
  animation: ${props => props.$isFocused ? glow : 'none'} 2s ease-in-out infinite;
`;

const SearchIconWrapper = styled.span`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  transition: all 0.3s ease;

  svg {
    font-size: 20px;
    color: ${props => props.$isFocused ? 'var(--primary)' : 'var(--text-muted)'};
    transition: color 0.3s ease;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 44px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text);
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: var(--text-light);
    font-weight: 400;
  }

  &:focus {
    border-color: transparent;
    background: var(--bg-secondary);
    box-shadow: 0 0 0 2px var(--primary);
  }

  &:hover:not(:focus) {
    border-color: var(--text-muted);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--bg-tertiary);
  border: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--error);
    color: white;
    transform: translateY(-50%) scale(1.1);
  }
`;

const SuggestionsDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease;
  max-height: 300px;
  overflow-y: auto;

  @media (max-width: 768px) {
    position: fixed;
    top: 70px;
    left: 10px;
    right: 10px;
    max-height: 60vh;
    border-radius: 12px;
  }
`;

const SuggestionsHeader = styled.div`
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SuggestionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: ${props => props.$isSelected ? 'var(--gradient-glow)' : 'transparent'};

  &:hover {
    background: var(--gradient-glow);
  }

  svg {
    font-size: 20px;
    color: var(--text-muted);
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    padding: 14px 16px;
    gap: 14px;

    svg {
      font-size: 24px;
    }
  }
`;

const SuggestionText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;

  .filename {
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .badge {
    font-size: 12px;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .filename {
      font-size: 15px;
    }
  }
`;

const SuggestionFooter = styled.div`
  padding: 10px 16px;
  font-size: 11px;
  color: var(--text-light);
  border-top: 1px solid var(--border-light);
  text-align: center;

  kbd {
    display: inline-block;
    padding: 2px 6px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 4px;
    font-family: inherit;
    font-size: 10px;
    margin: 0 2px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const NoResults = styled.div`
  padding: 20px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;
