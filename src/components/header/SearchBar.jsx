import React, { useState } from "react";
import styled from "styled-components";
import { SearchIcons } from "../common/SvgIcons";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/search/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <InputWrapper>
      <input
        type="text"
        placeholder="Search in Drive..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <span className="icon" onClick={() => query.trim() && navigate(`/search/${encodeURIComponent(query.trim())}`)}>
        <SearchIcons />
      </span>
    </InputWrapper>
  );
};

export default SearchBar;

const InputWrapper = styled.div`
  width: 100%;
  max-width: 650px;
  position: relative;

  input {
    width: 100%;
    padding: 8px 36px 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    outline: none;
    transition: 0.2s ease;
  }

  input::placeholder {
    color: #9ca3af;
  }

  input:focus {
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.25);
  }

  .icon {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    cursor: pointer;
    opacity: 0.6;

    &:hover {
      opacity: 1;
    }
  }

  .icon svg {
    font-size: 18px;
    color: var(--text);
  }
`;
