import React from "react";
import styled, { keyframes } from "styled-components";
import { ListsIcon, InfoIcon, GridIcon } from "./SvgIcons";

const PageHeader = ({ pageTitle }) => {
  return (
    <DataHeader>
      <HeaderLeft>
        <PageIcon>{getPageIcon(pageTitle)}</PageIcon>
        <PageTitle>{pageTitle}</PageTitle>
      </HeaderLeft>
      <HeaderRight>
        <IconButton title="Toggle View">
          {pageTitle === "My Drive" ? <ListsIcon /> : <GridIcon />}
        </IconButton>
        <IconButton title="Info">
          <InfoIcon />
        </IconButton>
      </HeaderRight>
    </DataHeader>
  );
};

const getPageIcon = (title) => {
  switch (title) {
    case "My Drive": return "📁";
    case "Recent": return "🕐";
    case "Starred": return "⭐";
    case "Trash": return "🗑️";
    default: return "📂";
  }
};

export default PageHeader;

/* ================= ANIMATIONS ================= */

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
`;

/* ================= STYLES ================= */

const DataHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
  animation: ${slideIn} 0.3s ease;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PageIcon = styled.span`
  font-size: 24px;
`;

const PageTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: var(--bg-secondary);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--border);

  svg {
    font-size: 20px;
    color: var(--text-muted);
    transition: color 0.2s ease;
  }

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--primary);
    transform: translateY(-2px);

    svg {
      color: var(--primary);
    }
  }
`;
